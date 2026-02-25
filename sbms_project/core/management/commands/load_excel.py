from django.core.management.base import BaseCommand
from core.services.excel_loader import ExcelDataLoaderService

class Command(BaseCommand):
    help = 'Loads scheme and rule data from Excel dataset'

    def handle(self, *args, **options):
        self.stdout.write("Starting Excel ingestion engine...")
        try:
            ExcelDataLoaderService.load_data()
            self.stdout.write(self.style.SUCCESS("Successfully ingested Excel dataset."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error during ingestion: {e}"))
