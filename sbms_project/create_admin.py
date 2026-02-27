import os
import django
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sbms_project.settings')
django.setup()

from core.models import User

def create_sbms_admin():
    username = "navis"
    password = "navis123"
    email = "navis@sbms.gov"
    
    # Check if user already exists
    user = User.objects.filter(email=email).first()
    if user:
        user.password = make_password(password)
        user.role = 'Admin'
        user.full_name = "Navis (Superuser)"
        user.save()
        print(f"User {username} updated successfully.")
    else:
        User.objects.create(
            full_name="Navis (Superuser)",
            email=email,
            password=make_password(password),
            dob='1990-01-01',
            gender='Other',
            aadhaar_no="ADMIN_NAVIS_001",
            state='Tamil Nadu',
            district='Chennai',
            income=9999999,
            occupation='System Administrator',
            education='Doctorate',
            role='Admin'
        )
        print(f"User {username} created successfully.")

if __name__ == "__main__":
    create_sbms_admin()
