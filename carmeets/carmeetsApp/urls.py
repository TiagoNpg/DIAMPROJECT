from django.urls import path
from . import views

app_name = 'carmeetsApp'

urlpatterns = [
    path('api/cars/', views.cars, name='cars'),
    path('api/car/<int:car_id>/', views.car_detail, name='car_detail'),
    path('api/events/', views.events, name='events'),
    path('api/event/<int:event_id>/', views.event_detail, name='event_detail'),
    path('api/users/', views.users, name='users'),
    path('api/user/<int:user_id>/', views.user_detail, name='user_detail'),
    path('api/comments/', views.comments, name='comments'),
    path('api/comment/<int:comment_id>/', views.comment_detail, name='comment_detail'),
    path('api/reports/', views.reports, name='reports'),
    path('api/report/<int:report_id>/', views.report_detail, name='report_detail'),
]
