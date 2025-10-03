import logging
import os

import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

logger = logging.getLogger(__name__)

User = get_user_model()

username = os.getenv("DJANGO_SUPERUSER_USERNAME")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if not username or not password:
    raise ValueError("DJANGO_SUPERUSER_USERNAME and DJANGO_SUPERUSER_PASSWORD must be set")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, password=password)
    logger.info(f"Superuser '{username}' created successfully.")
else:
    logger.warning(f"Superuser '{username}' already exists.")
    