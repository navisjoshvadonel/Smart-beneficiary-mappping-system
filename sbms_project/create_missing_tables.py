import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sbms_project.settings')
django.setup()

from core.models import User, UserCategoryMapping, UserEligibility, Application, Grievance

with connection.schema_editor() as schema_editor:
    for model in [User, UserCategoryMapping, UserEligibility, Application, Grievance]:
        try:
            schema_editor.create_model(model)
            print(f"Successfully created table for {model.__name__} ({model._meta.db_table})")
        except Exception as e:
            print(f"Error creating table for {model.__name__}: {e}")
