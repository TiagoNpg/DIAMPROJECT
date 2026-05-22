from django.db import models
from django.contrib.auth.models import AbstractUser


class UserRole(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    USER = 'user', 'User'
    GUEST = 'guest', 'Guest'


class Event(models.Model):
    owner = models.ForeignKey('User', on_delete=models.CASCADE, related_name='owned_events')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    participant_limit = models.PositiveIntegerField()
    is_public = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    participants = models.ManyToManyField('User', related_name='joined_events', blank=True)
    featured_vehicles = models.ManyToManyField('Car', related_name='featured_in_events', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Car(models.Model):
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    image = models.ImageField(upload_to='cars/', null=True, blank=True)
    owner = models.ForeignKey('User', on_delete=models.CASCADE, related_name='cars')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.brand} {self.model}'


class User(AbstractUser):
    is_blocked = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='profile_pics/', default='default.png')
    profile = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.GUEST,
    )

    def __str__(self):
        return self.username


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_reported = models.BooleanField(default=False)

    def __str__(self):
        return f'Comment by {self.user.username} on {self.event.name}'


class Report(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Report by {self.reporter.username} on comment {self.comment.id}'

    
