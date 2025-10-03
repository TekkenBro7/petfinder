import logging
import os

import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

logger = logging.getLogger(__name__)

User = get_user_model()

username = "admin"
password = "1234"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
        username=username, password=password, email=f"{username}@example.com", role="admin"
    )
    logger.info(f"Superuser '{username}' created successfully.")
else:
    logger.warning(f"Superuser '{username}' already exists.")
