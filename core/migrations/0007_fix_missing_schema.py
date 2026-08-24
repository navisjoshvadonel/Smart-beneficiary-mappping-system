"""
Migration 0007: Safely add missing columns/tables to Railway MySQL.
Uses raw SQL with IF NOT EXISTS patterns to be idempotent (safe to run multiple times).
"""
from django.db import migrations


def column_exists(db, cursor, table_name, column_name):
    """Use Django's database introspection across MySQL and SQLite."""
    if table_name not in db.introspection.table_names():
        return False
    columns = db.introspection.get_table_description(cursor, table_name)
    return any(column.name == column_name for column in columns)


def add_schemes_is_active(apps, schema_editor):
    """Add is_active column to Schemes if it doesn't already exist."""
    db = schema_editor.connection
    with db.cursor() as cursor:
        exists = column_exists(db, cursor, 'Schemes', 'is_active')
        if not exists:
            cursor.execute("ALTER TABLE Schemes ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1")
            print("  ✅ Added Schemes.is_active")
        else:
            print("  ⏭  Schemes.is_active already exists")


def add_schemes_eligibility_rules(apps, schema_editor):
    """Add eligibility_rules JSON column to Schemes if it doesn't already exist."""
    db = schema_editor.connection
    with db.cursor() as cursor:
        exists = column_exists(db, cursor, 'Schemes', 'eligibility_rules')
        if not exists:
            cursor.execute("ALTER TABLE Schemes ADD COLUMN eligibility_rules JSON")
            print("  ✅ Added Schemes.eligibility_rules")
        else:
            print("  ⏭  Schemes.eligibility_rules already exists")


def ensure_announcements_table(apps, schema_editor):
    """Create Announcements table if it doesn't exist (safety net for Railway)."""
    db = schema_editor.connection
    with db.cursor() as cursor:
        exists = 'Announcements' in db.introspection.table_names()
        if not exists:
            schema_editor.create_model(apps.get_model('core', 'Announcement'))
            print("  ✅ Created Announcements table")
        else:
            print("  ⏭  Announcements table already exists")


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_announcement'),
    ]

    operations = [
        migrations.RunPython(ensure_announcements_table, noop),
        migrations.RunPython(add_schemes_is_active, noop),
        migrations.RunPython(add_schemes_eligibility_rules, noop),
    ]
