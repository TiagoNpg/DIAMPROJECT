from django.urls import path

from . import views
from . import admin_views

from django.conf import settings
from django.conf.urls.static import static
app_name = 'carmeetsApp'

urlpatterns = [
    path('api/cars/', views.cars, name='cars'),
    path('api/car/<int:car_id>/', views.car_detail, name='car_detail'),
    path('api/events/', views.events, name='events'),
    path('api/event/<int:event_id>/', views.event_detail, name='event_detail'),
    path('api/event/<int:event_id>/enroll/', views.event_enroll, name='event_enroll'),
    path('api/event/<int:event_id>/unenroll/', views.event_unenroll, name='event_unenroll'),
    path('api/csrf/', views.csrf_view, name='csrf'),
    path('api/user/',views.profile_view,name='profile_view'),
    path('api/users/', views.users, name='users'),
    path('api/signup/', views.signup, name='signup'),
    path('api/user/<int:user_id>/', views.user_detail, name='user_detail'),
    path('api/comments/', views.comments, name='comments'),
    path('api/comment/<int:comment_id>/', views.comment_detail, name='comment_detail'),
    path('api/reports/', views.reports, name='reports'),
    path('api/report/<int:report_id>/', views.report_detail, name='report_detail'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    
    # Admin Dashboard Routes
    path('api/admin/stats/', admin_views.dashboard_stats, name='dashboard_stats'),
    
    # Admin User Management
    path('api/admin/users/', admin_views.admin_users_list, name='admin_users_list'),
    path('api/admin/user/<int:user_id>/', admin_views.admin_user_detail, name='admin_user_detail'),
    path('api/admin/user/<int:user_id>/block/', admin_views.admin_block_user, name='admin_block_user'),
    path('api/admin/user/<int:user_id>/role/', admin_views.admin_change_user_role, name='admin_change_user_role'),
    
    # Admin Event Management
    path('api/admin/events/', admin_views.admin_events_list, name='admin_events_list'),
    path('api/admin/events/pending/', admin_views.admin_pending_events, name='admin_pending_events'),
    path('api/admin/event/<int:event_id>/approve/', admin_views.admin_approve_event, name='admin_approve_event'),
    path('api/admin/event/<int:event_id>/reject/', admin_views.admin_reject_event, name='admin_reject_event'),
    path('api/admin/event/<int:event_id>/delete/', admin_views.admin_delete_event, name='admin_delete_event'),
    
    # Admin Comment Management
    path('api/admin/comments/', admin_views.admin_comments_list, name='admin_comments_list'),
    path('api/admin/comments/reported/', admin_views.admin_reported_comments, name='admin_reported_comments'),
    path('api/admin/comment/<int:comment_id>/delete/', admin_views.admin_delete_comment, name='admin_delete_comment'),
    path('api/admin/comment/<int:comment_id>/report/', admin_views.admin_mark_comment_reported, name='admin_mark_comment_reported'),
    
    # Admin Report Management
    path('api/admin/reports/', admin_views.admin_reports_list, name='admin_reports_list'),
    
    # Admin Activity Logs
    path('api/admin/activity/', admin_views.admin_activity_logs, name='admin_activity_logs'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)