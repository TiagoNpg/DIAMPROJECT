from cProfile import Profile
from urllib import request
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from .models import Car, Event, User, Comment, Report
from .serializers import CarSerializer, EventSerializer, UserSerializer, CommentSerializer, ReportSerializer


@ensure_csrf_cookie
@api_view(['GET'])
def csrf_view(request):
	return Response({'msg': 'CSRF cookie set'})


@api_view(['GET', 'POST'])
def cars(request):
	if request.method == 'GET':
		car_list = Car.objects.all()
		serializer = CarSerializer(car_list, many=True)
		return Response(serializer.data)
	elif request.method == 'POST':
		serializer = CarSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE', 'GET'])
def car_detail(request, car_id):
	try:
		car = Car.objects.get(pk=car_id)
	except Car.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if request.method == 'GET':
		serializer = CarSerializer(car)
		return Response(serializer.data)
	if request.method == 'PUT':
		serializer = CarSerializer(car, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	elif request.method == 'DELETE':
		car.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def events(request):
	if request.method == 'GET':
		event_list = Event.objects.all()
		serializer = EventSerializer(event_list, many=True)
		return Response(serializer.data)
	elif request.method == 'POST':
		serializer = EventSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE', 'GET'])
def event_detail(request, event_id):
	try:
		event = Event.objects.get(pk=event_id)
	except Event.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if request.method == 'GET':
		serializer = EventSerializer(event)
		return Response(serializer.data)
	if request.method == 'PUT':
		serializer = EventSerializer(event, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	elif request.method == 'DELETE':
		event.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def users(request):
	if request.method == 'GET':
		user_list = User.objects.all()
		serializer = UserSerializer(user_list, many=True)
		return Response(serializer.data)
	elif request.method == 'POST':
		serializer = UserSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE', 'GET'])
def user_detail(request, user_id):
	try:
		user = User.objects.get(pk=user_id)
	except User.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if request.method == 'GET':
		serializer = UserSerializer(user)
		return Response(serializer.data)
	if request.method == 'PUT':
		serializer = UserSerializer(user, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	elif request.method == 'DELETE':
		user.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def signup(request):
	username = request.data.get('username')
	password = request.data.get('password')

	if not username or not password:
		return Response({'msg': 'invalid username/password'}, status=status.HTTP_400_BAD_REQUEST)

	if User.objects.filter(username=username).exists():
		return Response({'msg': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)

	user = User.objects.create_user(username=username, password=password)
	return Response({'msg': 'user ' + user.username + ' created'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_view(request):
	username = request.data.get('username')
	password = request.data.get('password')
	user = authenticate(request, username=username, password=password)

	if user is not None:
		login(request, user) # Criação da sessão
		return Response({'msg': 'user logged in'})
	else:
		return Response({'msg': 'invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def logout_view(request):
	logout(request)
	return Response({'msg': 'user logged out'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
	return Response({'username': request.user.username})

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def profile_view(request):
	if request.method == 'GET':
		serializer = UserSerializer(request.user)
		return Response(serializer.data)
	elif request.method == 'PUT':
		serializer = UserSerializer(request.user, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def comments(request):
	if request.method == 'GET':
		comment_list = Comment.objects.all()
		serializer = CommentSerializer(comment_list, many=True)
		return Response(serializer.data)
	elif request.method == 'POST':
		serializer = CommentSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE', 'GET'])
def comment_detail(request, comment_id):
	try:
		comment = Comment.objects.get(pk=comment_id)
	except Comment.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if request.method == 'GET':
		serializer = CommentSerializer(comment)
		return Response(serializer.data)
	if request.method == 'PUT':
		serializer = CommentSerializer(comment, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	elif request.method == 'DELETE':
		comment.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def reports(request):
	if request.method == 'GET':
		report_list = Report.objects.all()
		serializer = ReportSerializer(report_list, many=True)
		return Response(serializer.data)
	elif request.method == 'POST':
		serializer = ReportSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE', 'GET'])
def report_detail(request, report_id):
	try:
		report = Report.objects.get(pk=report_id)
	except Report.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if request.method == 'GET':
		serializer = ReportSerializer(report)
		return Response(serializer.data)
	if request.method == 'PUT':
		serializer = ReportSerializer(report, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	elif request.method == 'DELETE':
		report.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

