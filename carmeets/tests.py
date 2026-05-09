from carmeetsApp.models import User, Event, Car, Comment
from django.utils import timezone

def create_sampleEvent():
    
 u = User.objects.create_user(username='testuser', password='testpass')
    
 e = Event.objects.create(
     title="Sample Event",
     description="This is a sample event.",
     date=timezone.now() + timezone.timedelta(days=1),
     location="Sample Location"
 )
 return e
create_sampleEvent()