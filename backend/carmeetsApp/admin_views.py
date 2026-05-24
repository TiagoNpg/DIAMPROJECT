from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Car, Event, User, Comment, Report
from .serializers import CarSerializer, EventSerializer, UserSerializer, CommentSerializer, ReportSerializer


def is_admin(user):
    """Check if user is an admin"""
    return user and user.is_authenticated and user.profile == 'admin'


# ==================== DASHBOARD STATS ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get overall dashboard statistics"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    stats = {
        'total_users': User.objects.count(),
        'total_events': Event.objects.count(),
        'total_comments': Comment.objects.count(),
        'total_reports': Report.objects.count(),
        'pending_events': Event.objects.filter(is_approved=False).count(),
        'blocked_users': User.objects.filter(is_blocked=True).count(),
        'reported_comments': Comment.objects.filter(is_reported=True).count(),
    }
    return Response(stats)


# ==================== USER MANAGEMENT ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Get all users with admin details"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    """Get detailed user information"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    data = UserSerializer(user).data
    data['owned_events'] = EventSerializer(user.owned_events.all(), many=True).data
    data['joined_events'] = EventSerializer(user.joined_events.all(), many=True).data
    data['cars'] = CarSerializer(user.cars.all(), many=True).data
    data['comments_count'] = user.comments.count()
    data['created_at'] = user.date_joined
    data['is_blocked'] = user.is_blocked
    
    return Response(data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_block_user(request, user_id):
    """Block or unblock a user"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    user.is_blocked = request.data.get('is_blocked', user.is_blocked)
    user.save()
    
    return Response({
        'message': f"User {'blocked' if user.is_blocked else 'unblocked'} successfully",
        'user': UserSerializer(user).data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_change_user_role(request, user_id):
    """Change user role"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    new_role = request.data.get('profile')
    if new_role not in ['admin', 'user', 'guest']:
        return Response(
            {'error': 'Invalid role'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.profile = new_role
    user.save()
    
    return Response({
        'message': f"User role changed to {new_role}",
        'user': UserSerializer(user).data
    })


# ==================== EVENT MANAGEMENT ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_events_list(request):
    """Get all events with approval status"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    events = Event.objects.all()
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_pending_events(request):
    """Get pending events awaiting approval"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    events = Event.objects.filter(is_approved=False)
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_approve_event(request, event_id):
    """Approve an event"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    event.is_approved = True
    event.save()
    
    return Response({
        'message': 'Event approved successfully',
        'event': EventSerializer(event).data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_reject_event(request, event_id):
    """Reject an event"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    event.delete()
    
    return Response({
        'message': 'Event rejected and deleted successfully'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_event(request, event_id):
    """Delete an event"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    event.delete()
    return Response({'message': 'Event deleted successfully'})


# ==================== COMMENT MANAGEMENT ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_comments_list(request):
    """Get all comments"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    comments = Comment.objects.all()
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reported_comments(request):
    """Get reported comments"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    comments = Comment.objects.filter(is_reported=True)
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_comment(request, comment_id):
    """Delete a comment"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        comment = Comment.objects.get(pk=comment_id)
    except Comment.DoesNotExist:
        return Response(
            {'error': 'Comment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    event_id = comment.event.id
    comment.delete()
    
    return Response({
        'message': 'Comment deleted successfully',
        'event_id': event_id
    })


# ==================== REPORT MANAGEMENT ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reports_list(request):
    """Get all reports"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    reports = Report.objects.all()
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_mark_comment_reported(request, comment_id):
    """Mark comment as reported"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        comment = Comment.objects.get(pk=comment_id)
    except Comment.DoesNotExist:
        return Response(
            {'error': 'Comment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    comment.is_reported = request.data.get('is_reported', comment.is_reported)
    comment.save()
    
    return Response({
        'message': 'Comment report status updated',
        'comment': CommentSerializer(comment).data
    })


# ==================== ACTIVITY LOGS ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_activity_logs(request):
    """Get activity logs"""
    if not is_admin(request.user):
        return Response(
            {'error': 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    logs = {
        'recent_events': EventSerializer(
            Event.objects.all().order_by('-created_at')[:10],
            many=True
        ).data,
        'recent_comments': CommentSerializer(
            Comment.objects.all().order_by('-created_at')[:10],
            many=True
        ).data,
        'recent_reports': ReportSerializer(
            Report.objects.all().order_by('-created_at')[:10],
            many=True
        ).data,
    }
    
    return Response(logs)
