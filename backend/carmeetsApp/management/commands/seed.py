"""
Seed command — populates the database with sample data.

Usage (from the backend/ directory):
    python manage.py seed            # create all sample data
    python manage.py seed --flush    # wipe everything first, then seed
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from carmeetsApp.models import User, Car, Event, Comment, Report


# ── Sample data ────────────────────────────────────────────────────────────────

USERS = [
    {"username": "admin",    "password": "admin123",  "email": "admin@carmeets.com",    "profile": "admin",  "is_staff": True, "is_superuser": True},
    {"username": "joao",     "password": "joao123",   "email": "joao@example.com",      "profile": "user"},
    {"username": "maria",    "password": "maria123",  "email": "maria@example.com",     "profile": "user"},
    {"username": "pedro",    "password": "pedro123",  "email": "pedro@example.com",     "profile": "user"},
    {"username": "ana",      "password": "ana123",    "email": "ana@example.com",       "profile": "user"},
    {"username": "guest1",   "password": "guest123",  "email": "guest1@example.com",    "profile": "guest"},
]

CARS = [
    {
        "brand": "BMW",
        "model": "M3",
        "year": 2021,
        "owner": "joao",
        "image": "cars/IMG_8946.jpg",
    },
    {
        "brand": "Ford",
        "model": "Mustang GT",
        "year": 2019,
        "owner": "joao",
        "image": "cars/image0.jpg",
    },
    {
        "brand": "Toyota",
        "model": "Supra",
        "year": 2022,
        "owner": "maria",
        "image": "cars/CFT-SONY_71385-385-33.png",
    },
    {
        "brand": "Honda",
        "model": "Civic Type R",
        "year": 2020,
        "owner": "pedro",
        "image": "cars/IMG_5176.jpg",
    },
    {
        "brand": "Volkswagen",
        "model": "Golf GTI",
        "year": 2018,
        "owner": "pedro",
        "image": "cars/IMG_9498.jpg",
    },
    {
        "brand": "Porsche",
        "model": "911 Carrera",
        "year": 2023,
        "owner": "ana",
        "image": "cars/IMG_8335.jpg",
    },
    {
        "brand": "Nissan",
        "model": "Skyline R33",
        "year": 2001,
        "owner": "ana",
        "image": "cars/DSC00622.jpg",
    },
]

EVENTS = [
    {
        "name": "Lisbon Classic Car Meet",
        "description": "A classic car meet in the heart of Lisbon. All classic car enthusiasts welcome.",
        "date_offset": 7,   # days from now
        "location": "Parque das Nações, Lisboa",
        "participant_limit": 50,
        "is_public": True,
        "is_approved": True,
        "owner": "admin",
        "participants": ["joao", "maria", "pedro"],
        "featured_vehicles": [0, 5],  # indexes into CARS list
    },
    {
        "name": "BMW Owners Gathering",
        "description": "Exclusive BMW garage night — all models welcome.",
        "date_offset": 14,
        "location": "Cascais Marina, Portugal",
        "participant_limit": 30,
        "is_public": True,
        "is_approved": True,
        "owner": "joao",
        "participants": ["maria", "ana"],
        "featured_vehicles": [0],
    },
    {
        "name": "JDM Night Drive",
        "description": "A night cruise for Japanese Domestic Market (JDM) car fans.",
        "date_offset": 21,
        "location": "Autodromo do Estoril, Portugal",
        "participant_limit": 40,
        "is_public": True,
        "is_approved": False,
        "owner": "pedro",
        "participants": ["ana"],
        "featured_vehicles": [2, 3, 6],
    },
    {
        "name": "Private Track Day",
        "description": "Invite-only track day. Contact the organiser for access.",
        "date_offset": 30,
        "location": "Circuito de Braga, Portugal",
        "participant_limit": 20,
        "is_public": False,
        "is_approved": True,
        "owner": "ana",
        "participants": ["joao", "pedro"],
        "featured_vehicles": [5, 6],
    },
]

COMMENTS = [
    {"user": "joao",  "event_index": 0, "content": "Can't wait for this one! My M3 is finally ready."},
    {"user": "maria", "event_index": 0, "content": "See you all there! Bringing the Supra."},
    {"user": "pedro", "event_index": 0, "content": "Is there parking for modified cars?"},
    {"user": "ana",   "event_index": 1, "content": "Love the BMW meets, always great vibes."},
    {"user": "joao",  "event_index": 2, "content": "JDM night drives are the best. Counting the days."},
    {"user": "guest1","event_index": 2, "content": "Can I attend with a European car or is it JDM only?"},
]

REPORTS = [
    {
        "reporter": "joao",
        "comment_index": 5,   # guest1's comment
        "reason": "Spam-like question, asked in multiple events.",
    },
]


# ── Command ────────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Seed the database with sample users, cars, events, comments and reports."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing data before seeding.",
        )

    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write(self.style.WARNING("Flushing existing data..."))
            Report.objects.all().delete()
            Comment.objects.all().delete()
            Event.objects.all().delete()
            Car.objects.all().delete()
            User.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("  ✓ All records deleted.\n"))

        now = timezone.now()

        # 1. Users
        self.stdout.write("Creating users...")
        user_map = {}
        for data in USERS:
            username = data["username"]
            if User.objects.filter(username=username).exists():
                user_map[username] = User.objects.get(username=username)
                self.stdout.write(f"  – skipped (already exists): {username}")
                continue

            user = User.objects.create_user(
                username=username,
                password=data["password"],
                email=data.get("email", ""),
                profile=data.get("profile", "guest"),
                is_staff=data.get("is_staff", False),
                is_superuser=data.get("is_superuser", False),
            )
            user_map[username] = user
            self.stdout.write(f"  ✓ {username}  ({data.get('profile','guest')})")

        # 2. Cars
        self.stdout.write("\nCreating cars...")
        car_objects = []

        for data in CARS:
            owner = user_map.get(data["owner"])

            if not owner:
                self.stdout.write(
                    self.style.ERROR(
                        f"  ! Owner '{data['owner']}' not found, skipping car."
                    )
                )
                continue

            car, created = Car.objects.get_or_create(
                brand=data["brand"],
                model=data["model"],
                year=data["year"],
                owner=owner,
            )

            # ALWAYS update image
            car.image = data["image"]
            car.save()

            # ALWAYS append
            car_objects.append(car)

            action = "✓" if created else "–"

            self.stdout.write(
                f"  {action} {data['year']} {data['brand']} {data['model']} "
                f"(owner: {data['owner']})"
            )
        # 3. Events
        self.stdout.write("\nCreating events...")
        event_objects = []
        for data in EVENTS:
            owner = user_map.get(data["owner"])
            if not owner:
                self.stdout.write(self.style.ERROR(f"  ! Owner '{data['owner']}' not found, skipping event."))
                continue

            event, created = Event.objects.get_or_create(
                name=data["name"],
                defaults={
                    "description": data["description"],
                    "date": now + timedelta(days=data["date_offset"]),
                    "location": data["location"],
                    "participant_limit": data["participant_limit"],
                    "is_public": data["is_public"],
                    "is_approved": data["is_approved"],
                    "owner": owner,
                },
            )
            event_objects.append(event)

            if created:
                # Add participants
                for uname in data.get("participants", []):
                    participant = user_map.get(uname)
                    if participant:
                        event.participants.add(participant)

                # Add featured vehicles by index into CARS list
                for idx in data.get("featured_vehicles", []):
                    if idx < len(car_objects):
                        event.featured_vehicles.add(car_objects[idx])

            action = "✓" if created else "–"
            approved = "approved" if data["is_approved"] else "pending approval"
            public = "public" if data["is_public"] else "private"
            self.stdout.write(f"  {action} {data['name']} ({public}, {approved})")

        # 4. Comments
        self.stdout.write("\nCreating comments...")
        comment_objects = []
        for data in COMMENTS:
            user = user_map.get(data["user"])
            idx = data["event_index"]
            if not user or idx >= len(event_objects):
                self.stdout.write(self.style.WARNING("  ! Skipping comment — user or event not found."))
                continue
            event = event_objects[idx]
            comment, created = Comment.objects.get_or_create(
                user=user,
                event=event,
                content=data["content"],
            )
            comment_objects.append(comment)
            action = "✓" if created else "–"
            self.stdout.write(f"  {action} [{user.username} → {event.name[:30]}]")

        # 5. Reports
        self.stdout.write("\nCreating reports...")
        for data in REPORTS:
            reporter = user_map.get(data["reporter"])
            cidx = data["comment_index"]
            if not reporter or cidx >= len(comment_objects):
                self.stdout.write(self.style.WARNING("  ! Skipping report — reporter or comment not found."))
                continue
            comment = comment_objects[cidx]
            report, created = Report.objects.get_or_create(
                reporter=reporter,
                comment=comment,
                defaults={"reason": data["reason"]},
            )
            action = "✓" if created else "–"
            self.stdout.write(f"  {action} Report by {reporter.username} on comment #{comment.id}")

        # Summary
        self.stdout.write(self.style.SUCCESS("\n──────────────────────────────────────────"))
        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
        self.stdout.write(f"  Users:    {User.objects.count()}")
        self.stdout.write(f"  Cars:     {Car.objects.count()}")
        self.stdout.write(f"  Events:   {Event.objects.count()}")
        self.stdout.write(f"  Comments: {Comment.objects.count()}")
        self.stdout.write(f"  Reports:  {Report.objects.count()}")
        self.stdout.write(self.style.SUCCESS("──────────────────────────────────────────"))
        self.stdout.write("\nAdmin login → username: admin  |  password: admin123")
