import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sbms_project.settings")
django.setup()

from django.db import connection

sql = """
ALTER TABLE schemes
ADD COLUMN created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
ADD COLUMN updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);
"""

try:
    with connection.cursor() as cursor:
        cursor.execute(sql)
    print("Successfully added created_at and updated_at to schemes table.")
except Exception as e:
    print(f"Error: {e}")
