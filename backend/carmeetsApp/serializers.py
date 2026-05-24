import re
from rest_framework import serializers
from .models import Car, User, Event, Comment, Report

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile', 'photo']
    
    # Override create and update to handle password hashing
    def create(self, validated_data):
        password = validated_data.pop('password', None) # Remove password from validated data
        user = User(**validated_data) # Create user instance without saving to database yet
        if password:
            user.set_password(password) # Hash the password using Django's built-in method
        else:
            user.set_unusable_password() # If no password provided, set unusable password to prevent login
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value) # Update other fields normally
        if password:
            instance.set_password(password) # Hash the new password if provided
        instance.save()
        return instance

class CarSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Car
        fields = ['id', 'brand', 'model', 'year', 'image', 'owner']
        
class EventSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    participants = UserSerializer(many=True, read_only=True)
    featured_vehicles = CarSerializer(many=True, read_only=True)
    event_type = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'name',
            'description',
            'type',
            'date',
            'location',
            'participant_limit',
            'is_public',
            'is_approved',
            'owner',
            'participants',
            'featured_vehicles',
            'event_type',
        ]

    def get_event_type(self, obj):
        haystack = f"{obj.name or ''} {obj.description or ''}".lower()
        if re.search(r"(bike|bicycle|moto|motorbike|scooter)", haystack):
            return "Bike"
        if re.search(r"(car|auto|drive|garage|road trip|track|classic)", haystack):
            return "Car"
        return "Meet-up"

    def create(self, validated_data):
        # Owner is passed separately in the view's save() method
        return Event.objects.create(**validated_data)

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_at', 'updated_at', 'is_reported', 'user', 'event']
        
class ReportSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'reason', 'created_at', 'updated_at', 'comment', 'reporter']
