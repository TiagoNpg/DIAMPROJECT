from django.test import TestCase
from django.utils import timezone
from carmeetsApp.models import User, Event, Car


class EventTestCase(TestCase):
    """Test case for Event creation and participation"""

    def setUp(self):
        """Create test data: two users, one car, one event"""
        # Create first user (event organizer) with 'user' profile
        self.user1 = User.objects.create_user(
            username='organizer',
            email='organizer@example.com',
            password='testpass123',
            profile='user'
        )

        # Create second user (participant) with 'user' profile
        self.user2 = User.objects.create_user(
            username='participant',
            email='participant@example.com',
            password='testpass123',
            profile='user'
        )

        # Create a car for user2
        self.car = Car.objects.create(
            brand='Toyota',
            model='Corolla',
            year=2020,
            owner=self.user2
        )

        # Create an event owned by user1, and set it as approved
        self.event = Event.objects.create(
            owner=self.user1,
            name='Car Meetup 2026',
            description='Annual car enthusiasts meetup',
            date=timezone.now() + timezone.timedelta(days=7),
            location='Downtown Parking Lot',
            participant_limit=50,
            is_public=True,
            is_approved=True
        )

    def test_event_creation(self):
        """Test that event was created with correct data"""
        self.assertEqual(self.event.name, 'Car Meetup 2026')
        self.assertEqual(self.event.owner, self.user1)
        self.assertTrue(self.event.is_approved)
        self.assertTrue(self.event.is_public)

    def test_user_profiles(self):
        """Test that both users have 'user' profile"""
        self.assertEqual(self.user1.profile, 'user')
        self.assertEqual(self.user2.profile, 'user')

    def test_car_ownership(self):
        """Test that car is owned by user2"""
        self.assertEqual(self.car.owner, self.user2)
        self.assertEqual(self.car.brand, 'Toyota')

    def test_user_event_participation(self):
        """Test adding user2 as participant to event"""
        # Add user2 to the event's participants
        self.event.participants.add(self.user2)

        # Verify user2 is in the event's participants
        self.assertIn(self.user2, self.event.participants.all())
        self.assertEqual(self.event.participants.count(), 1)

    def test_user_event_relationships(self):
        """Test bidirectional relationships"""
        # Add user2 to event participants
        self.event.participants.add(self.user2)

        # User1 should own 1 event
        self.assertEqual(self.user1.owned_events.count(), 1)

        # User2 should be in 1 event
        self.assertEqual(self.user2.joined_events.count(), 1)
