from django.core.management.base import BaseCommand
from django.utils import timezone
from carmeetsApp.models import User, Event, Car, Comment, Report
from datetime import timedelta


class Command(BaseCommand):
    help = 'Populates the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database population...'))

        # Create sample users
        users = []
        user_data = [
            {'username': 'carlos_driver', 'email': 'carlos@example.com', 'profile': 'user'},
            {'username': 'maria_bike', 'email': 'maria@example.com', 'profile': 'user'},
            {'username': 'joao_classic', 'email': 'joao@example.com', 'profile': 'user'},
            {'username': 'rita_admin', 'email': 'rita@example.com', 'profile': 'admin'},
            {'username': 'pedro_enthusiast', 'email': 'pedro@example.com', 'profile': 'user'},
        ]

        for data in user_data:
            if not User.objects.filter(username=data['username']).exists():
                user = User.objects.create_user(
                    username=data['username'],
                    email=data['email'],
                    password='senha123',
                    profile=data['profile']
                )
                users.append(user)
                self.stdout.write(self.style.SUCCESS(f'✓ User created: {data["username"]}'))
            else:
                users.append(User.objects.get(username=data['username']))

        # Create sample cars
        cars = []
        car_data = [
            {'brand': 'Ford', 'model': 'Mustang', 'year': 2020, 'owner_idx': 0},
            {'brand': 'BMW', 'model': 'M3', 'year': 2022, 'owner_idx': 0},
            {'brand': 'Honda', 'model': 'CB500', 'year': 2021, 'owner_idx': 1},
            {'brand': 'Harley-Davidson', 'model': 'Street 750', 'year': 2019, 'owner_idx': 1},
            {'brand': 'Porsche', 'model': '911 Classic', 'year': 1985, 'owner_idx': 2},
        ]

        for data in car_data:
            owner = users[data['owner_idx']]
            if not Car.objects.filter(model=data['model'], owner=owner).exists():
                car = Car.objects.create(
                    brand=data['brand'],
                    model=data['model'],
                    year=data['year'],
                    owner=owner
                )
                cars.append(car)
                self.stdout.write(self.style.SUCCESS(f'✓ Car created: {data["brand"]} {data["model"]}'))
            else:
                cars.append(Car.objects.get(model=data['model'], owner=owner))

        # Create sample events
        base_time = timezone.now()
        events = []
        event_data = [
            {
                'name': 'Encontro de Clássicos no Parque',
                'description': 'Reunião de carros clássicos e antigos na Alameda do Parque. Venha mostrar o seu carro!',
                'date': base_time + timedelta(days=7, hours=10),
                'location': 'Parque Central',
                'participant_limit': 50,
                'is_public': True,
                'is_approved': True,
                'owner_idx': 2,
            },
            {
                'name': 'Passeio de Motos Cidade',
                'description': 'Passeio de motos pela cidade. Saímos da Praça da República e terminamos no Cais Sodré. Aberto a todos os modelos!',
                'date': base_time + timedelta(days=3, hours=14),
                'location': 'Praça da República',
                'participant_limit': 30,
                'is_public': True,
                'is_approved': True,
                'owner_idx': 1,
            },
            {
                'name': 'Track Day - Autódromo',
                'description': 'Dia de pista no autódromo. Pilotos experientes apenas. Inscrição até 50 pilotos.',
                'date': base_time + timedelta(days=14, hours=9),
                'location': 'Autódromo',
                'participant_limit': 50,
                'is_public': True,
                'is_approved': True,
                'owner_idx': 0,
            },
            {
                'name': 'Encontro Informal - Café',
                'description': 'Encontro casual de entusiastas de carros para tomar um café e conversar. Qualquer marca e modelo bem-vindo!',
                'date': base_time + timedelta(days=2, hours=15),
                'location': 'Baixa - café central',
                'participant_limit': 20,
                'is_public': True,
                'is_approved': True,
                'owner_idx': 4,
            },
            {
                'name': 'Drift Night - Estacionamento',
                'description': 'Noite de drift no estacionamento da Expo. Carros modificados. Venha assistir ou participar!',
                'date': base_time + timedelta(days=10, hours=20),
                'location': 'Parque de Estacionamento - Expo',
                'participant_limit': 40,
                'is_public': False,
                'is_approved': True,
                'owner_idx': 0,
            },
            {
                'name': 'Super Bike Show',
                'description': 'Exposição e passeio de motos personalizadas. Workshops sobre customização. Entrada gratuita!',
                'date': base_time + timedelta(days=21, hours=10),
                'location': 'Centro de Exposições',
                'participant_limit': 100,
                'is_public': True,
                'is_approved': True,
                'owner_idx': 1,
            },
        ]

        for data in event_data:
            if not Event.objects.filter(name=data['name']).exists():
                event = Event.objects.create(
                    name=data['name'],
                    description=data['description'],
                    date=data['date'],
                    location=data['location'],
                    participant_limit=data['participant_limit'],
                    is_public=data['is_public'],
                    is_approved=data['is_approved'],
                    owner=users[data['owner_idx']],
                )
                events.append(event)
                self.stdout.write(self.style.SUCCESS(f'✓ Event created: {data["name"]}'))
            else:
                events.append(Event.objects.get(name=data['name']))

        # Add participants to events
        if events:
            for event in events:
                # Add some participants randomly
                for user in users[1:4]:  # Add carlos, maria, joao
                    if not event.participants.filter(id=user.id).exists():
                        event.participants.add(user)
            self.stdout.write(self.style.SUCCESS('✓ Participants added to events'))

        # Create sample comments
        if events and users:
            comment_data = [
                {'content': 'Que encontro incrível! Estou ansioso para o próximo!', 'event_idx': 0, 'user_idx': 1},
                {'content': 'Adorei a organização. Tudo muito bem preparado.', 'event_idx': 0, 'user_idx': 2},
                {'content': 'Quando é o próximo passeio?', 'event_idx': 1, 'user_idx': 0},
                {'content': 'As motos tinham som incrível!', 'event_idx': 1, 'user_idx': 2},
                {'content': 'Track day foi épico! Não perco o próximo.', 'event_idx': 2, 'user_idx': 1},
            ]

            for data in comment_data:
                if events[data['event_idx']] and users[data['user_idx']]:
                    if not Comment.objects.filter(
                        event=events[data['event_idx']],
                        user=users[data['user_idx']],
                        content=data['content']
                    ).exists():
                        Comment.objects.create(
                            event=events[data['event_idx']],
                            user=users[data['user_idx']],
                            content=data['content']
                        )
            self.stdout.write(self.style.SUCCESS(f'✓ Comments created'))

        self.stdout.write(self.style.SUCCESS('\n✅ Database population completed successfully!\n'))
        self.stdout.write(self.style.WARNING('Test users created:'))
        for user_data in user_data:
            self.stdout.write(f"  - {user_data['username']} / senha123")

