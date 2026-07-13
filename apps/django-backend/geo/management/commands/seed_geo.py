from django.core.management.base import BaseCommand
from geo.models import Country, State

class Command(BaseCommand):
    help = 'Seeds initial Geo data for the application'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding Geo data...")
        
        uae, created = Country.objects.get_or_create(
            country_code='AE',
            defaults={
                'name': 'United Arab Emirates',
                'currency_code': 'AED',
                'phone_code': '+971'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Country: UAE'))

        dubai, created = State.objects.get_or_create(
            country=uae,
            name='Dubai',
            defaults={'state_code': 'DXB'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created State: Dubai'))

        self.stdout.write(self.style.SUCCESS("Geo seeding complete. Expand this command to load full ISO data from CSV/JSON."))
