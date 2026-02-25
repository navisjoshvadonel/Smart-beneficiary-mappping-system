import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sbms_project.settings')
django.setup()

with connection.cursor() as cursor:
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password VARCHAR(128) NULL;")
        print("Column 'password' added successfully to users table.")
    except Exception as e:
        print(f"Error or already exists: {e}")
