from django.apps import AppConfig
from django.conf import settings
import logging

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        from django.db.models.signals import post_migrate
        post_migrate.connect(create_default_admin, sender=self)

def create_default_admin(sender, **kwargs):
    from django.contrib.auth.models import User
    email = getattr(settings, 'ADMIN_EMAIL', 'admin@sbms.gov')
    password = getattr(settings, 'ADMIN_PASSWORD', 'admin123')
    
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', email, password)
        logging.getLogger(__name__).info("Default admin user 'admin' created automatically.")
