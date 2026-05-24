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
    # index 0 — BMW E30 (black sedan, BBS mesh wheels)
    {
        "brand": "BMW",
        "model": "E30 325i",
        "year": 1990,
        "type": "Car",
        "color": "Preto",
        "description": "E30 clássico com jantes BBS mesh, motor 2.5 de linha 6. Restauro completo em 2021.",
        "owner": "joao",
        "image": "cars/IMG_8946.jpg",
    },
    # index 1 — Ford Mustang Fox Body 5.0 (black, turbo build, hood up)
    {
        "brand": "Ford",
        "model": "Mustang 5.0 Fox Body",
        "year": 1986,
        "type": "Car",
        "color": "Preto",
        "description": "Fox Body com build turbo, capô aberto a mostrar o V8 5.0. Verdadeiro músculo americano.",
        "owner": "joao",
        "image": "cars/image0.jpg",
    },
    # index 2 — Jaguar XKR (black coupe, rear 3/4 view in countryside)
    {
        "brand": "Jaguar",
        "model": "XKR",
        "year": 2008,
        "type": "Car",
        "color": "Preto",
        "description": "Coupe britânico com compressor 4.2 V8. Elegância e potência numa embalagem clássica.",
        "owner": "maria",
        "image": "cars/CFT-SONY_71385-385-33.png",
    },
    # index 3 — Nissan Skyline R33 GTS (maroon/red, rear view under trees)
    {
        "brand": "Nissan",
        "model": "Skyline R33 GTS",
        "year": 1997,
        "type": "Car",
        "color": "Bordeaux",
        "description": "R33 GTS em bordeaux, vista traseira icónica sob as árvores. JDM puro e simples.",
        "owner": "pedro",
        "image": "cars/DSC00622.jpg",
    },
    # index 4 — Audi 90 Quattro 2.3E (dark green/black, forest road)
    {
        "brand": "Audi",
        "model": "90 Quattro 2.3E",
        "year": 1992,
        "type": "Car",
        "color": "Verde Escuro",
        "description": "Audi 90 com tração integral Quattro original. Motor 2.3 de 5 cilindros em linha.",
        "owner": "pedro",
        "image": "cars/IMG_9498.jpg",
    },
    # index 5 — Chevrolet Corvette C7 ZR1 (orange, front view at car meet)
    {
        "brand": "Chevrolet",
        "model": "Corvette C7 ZR1",
        "year": 2019,
        "type": "Car",
        "color": "Laranja",
        "description": "ZR1 com supercarregador 6.2 LT5 de 755 cv. Referência de desempenho da General Motors.",
        "owner": "ana",
        "image": "cars/IMG_8335.jpg",
    },
    # index 6 — Buick Electra (silver, classic American land yacht)
    {
        "brand": "Buick",
        "model": "Electra Park Avenue",
        "year": 1984,
        "type": "Car",
        "color": "Prateado",
        "description": "Land yacht americano em prata. Interior de veludo original, V6 3.8 Buick. Clássico intocado.",
        "owner": "ana",
        "image": "cars/IMG_0581.jpg",
    },
    # index 7 — Audi RS5 (grey, multiple professional shots)
    {
        "brand": "Audi",
        "model": "RS5 Coupe",
        "year": 2013,
        "type": "Car",
        "color": "Cinzento",
        "description": "RS5 B8 com V8 4.2 FSI aspirado naturalmente. 450 cv e som inigualável ao rodar.",
        "owner": "maria",
        "image": "cars/SAM_20240526_15_21_41_Pro.png",
    },
    # index 8 — Subaru Outback (blue/grey wagon)
    {
        "brand": "Subaru",
        "model": "Outback 2.5XT",
        "year": 2005,
        "type": "Car",
        "color": "Azul Aço",
        "description": "Outback XT com motor turbo 2.5 EJ255. Tração AWD simétrica e levantamento para off-road.",
        "owner": "pedro",
        "image": "cars/Screenshot_20250613_202530_Photos.jpg",
    },
    # index 9 — Nissan Hardbody pickup (white, lowered on black rims)
    {
        "brand": "Nissan",
        "model": "Hardbody D21",
        "year": 1997,
        "type": "Car",
        "color": "Branco",
        "description": "Pickup D21 rebaixada em jantes pretas. Build stance com suspensão coilover e câmbio curto.",
        "owner": "joao",
        "image": "cars/image.png",
    },
    # index 10 — Lada 2106 (cream/beige, classic Soviet sedan)
    {
        "brand": "Lada",
        "model": "2106",
        "year": 1982,
        "type": "Car",
        "color": "Creme",
        "description": "Sedã soviético em estado de conservação impressionante. Motor 1.5 original e interior imaculado.",
        "owner": "guest1",
        "image": "cars/IMG-2fa2af4411ec1bc9ce7d6f8eae698778-V.jpg",
    },
    # index 11 — BMW S1000RR (grey)
    {
        "brand": "BMW",
        "model": "S1000RR",
        "year": 2026,
        "type": "Bike",
        "color": "Cinzento",
        "description": "Superbike de série com 210 cv. Controlo de tração, quickshifter e modo Race de série.",
        "owner": "ana",
        "image": "bikes/s1000rr_grey.jpeg",
    },
    # index 12 — Volkswagen Golf 7 GTI Performance (dark grey, lowered, red GTI trim)
    {
        "brand": "Volkswagen",
        "model": "Golf 7 GTI Performance",
        "year": 2015,
        "type": "Car",
        "color": "Cinzento Escuro",
        "description": "GTI Performance com 230 cv, rebaixado em Bilstein B16, escape Milltek cat-back.",
        "owner": "pedro",
        "image": "cars/PXL_20260318_201056066_RAW-01.jpg",
    },
    # index 13 — CBR 650R (black and red sportbike)
    {
        "brand": "Honda",
        "model": "CBR 650R",
        "year": 2024,
        "type": "Bike",
        "color": "Preto e Vermelho",
        "description": "CBR 650R com motor inline-4 de 95 cv. Intermediária perfeita entre a diversão e a performance.",
        "owner": "admin",
        "image": "bikes/cbr650r.jpeg",
    },
]

EVENTS = [
    {
        "name": "Lisbon Classic & Retro Car Meet",
        "description": (
            "A celebration of classic and vintage iron in the heart of Lisbon. "
            "Anything pre-1995 is welcome — from Soviet legends to Detroit muscle. "
            "Show up, show off, and swap stories."
        ),
        "type": "Car",
        "date_offset": 7,
        "location": "Parque das Nações, Lisboa",
        "participant_limit": 50,
        "is_public": True,
        "is_approved": True,
        "owner": "admin",
        "participants": ["joao", "maria", "pedro"],
        "featured_vehicles": [0, 1, 6, 10],  # BMW E30, Fox Body Mustang, Buick Electra, Lada
    },
    {
        "name": "German Iron Gathering — Audi & BMW",
        "description": (
            "For those who bleed four rings and roundels. All Audi and BMW models welcome, "
            "from the humble 80 to the track-shredding RS. Cascais Marina makes for the "
            "perfect backdrop."
        ),
        "type": "Car",
        "date_offset": 14,
        "location": "Cascais Marina, Portugal",
        "participant_limit": 30,
        "is_public": True,
        "is_approved": True,
        "owner": "joao",
        "participants": ["maria", "ana", "pedro"],
        "featured_vehicles": [0, 4, 7],  # BMW E30, Audi 90 Quattro, Audi RS5
    },
    {
        "name": "JDM Night Drive — Skylines & Legends",
        "description": (
            "A sunset cruise and static display for Japanese Domestic Market fans. "
            "Skylines, Supras, RX-7s — if it came from Japan, it belongs here. "
            "Autodromo do Estoril hosts us for a night to remember."
        ),
        "type": "Car",
        "date_offset": 21,
        "location": "Autodromo do Estoril, Portugal",
        "participant_limit": 40,
        "is_public": True,
        "is_approved": False,
        "owner": "pedro",
        "participants": ["ana", "joao"],
        "featured_vehicles": [3, 8],  # Nissan Skyline R33, Subaru Outback
    },
    {
        "name": "Supercar & Muscle Invite-Only Track Day",
        "description": (
            "Invite-only track day for high-performance machines. Contact the organiser "
            "directly to request an entry slot. Limited to 20 cars. Helmets mandatory."
        ),
        "type": "Car",
        "date_offset": 30,
        "location": "Circuito de Braga, Portugal",
        "participant_limit": 20,
        "is_public": False,
        "is_approved": True,
        "owner": "ana",
        "participants": ["joao", "pedro"],
        "featured_vehicles": [1, 2, 5, 11],  # Fox Body Mustang, Jaguar XKR, Corvette ZR1, S1000RR
    },
    {
        "name": "Stance & Style Sunday",
        "description": (
            "All makes and eras welcome — the focus is fitment, stance, and style. "
            "Show up clean or show up slammed, just make it count. "
            "Voted best-in-show trophy for top 3 builds."
        ),
        "type": "Meet-up",
        "date_offset": 45,
        "location": "Parque Eduardo VII, Lisboa",
        "participant_limit": 60,
        "is_public": True,
        "is_approved": True,
        "owner": "maria",
        "participants": ["joao", "pedro", "ana"],
        "featured_vehicles": [5, 7, 9, 12],  # Corvette ZR1, Audi RS5, Nissan Hardbody, Golf GTI
    },
    {
        "name": "Passeio de Motos Cidade",
        "description": "Passeio de motos pela cidade. Saímos da Praça da República e terminamos no Cais Sodré. Aberto a todos os modelos!",
        "type": "Bike",
        "date_offset": 21,
        "location": "Praça da República",
        "participant_limit": 30,
        "is_public": True,
        "is_approved": True,
        "owner": "admin",
        "participants": ["ana"],
        "featured_vehicles": [11],  # BMW S1000RR and HONDA CBR 650R
    },
]

COMMENTS = [
    {"user": "joao",  "event_index": 0, "content": "Finally bringing the E30 out! Can't wait to see what everyone else shows up in."},
    {"user": "maria", "event_index": 0, "content": "The Lada is going to steal the show — absolute sleeper vibes."},
    {"user": "pedro", "event_index": 0, "content": "Is there a concours judging or is it purely a casual show-and-shine?"},
    {"user": "ana",   "event_index": 1, "content": "The RS5 and the 90 Quattro side by side is going to look insane. Two eras of Audi quattro."},
    {"user": "joao",  "event_index": 1, "content": "Bringing the E30, hope that's not too off-theme for a German meet!"},
    {"user": "joao",  "event_index": 2, "content": "The R33 under the Estoril lights is going to be something else. Counting the days."},
    {"user": "guest1","event_index": 2, "content": "Can I join with a European car or is it strictly JDM only?"},
    {"user": "pedro", "event_index": 3, "content": "Corvette vs Jaguar on track — this is the content I signed up for."},
    {"user": "joao",  "event_index": 4, "content": "Hardbody on air or springs? That thing sits perfectly."},
    {"user": "maria", "event_index": 4, "content": "So hyped for this one. The RS5 is freshly detailed and ready."},
    {"user": "ana",   "event_index": 3, "content": "Bringing the S1000RR — yes it's a bike, but the track day organiser said two-wheelers are welcome!"},
    {"user": "joao",  "event_index": 4, "content": "That Golf GTI on the stance setup is going to be the sleeper hit of the show."},
]

REPORTS = [
    {
        "reporter": "joao",
        "comment_index": 6,   # guest1's off-topic question on the JDM event
        "reason": "Spam-like question repeated across multiple events.",
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

            # ALWAYS update image and new fields
            car.image = data["image"]
            car.type = data.get("type", "Car")
            car.color = data.get("color", "")
            car.description = data.get("description", "")
            car.save()

            # ALWAYS append
            car_objects.append(car)

            action = "✓" if created else "–"

            self.stdout.write(
                f"  {action} {data['year']} {data['brand']} {data['model']} "
                f"[{data.get('type','Car')}] (owner: {data['owner']})"
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
                    "type": data.get("type", "Meet-up"),
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
            self.stdout.write(f"  {action} [{user.username} → {event.name[:40]}]")

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