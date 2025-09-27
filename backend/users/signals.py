from typing import Any

from django.db.models.signals import pre_save
from django.dispatch import receiver

from users.models import User


@receiver(pre_save, sender=User)
def set_default_role(sender: type[User], instance: User, **kwargs: Any) -> None:
    if instance._state.adding and not instance.role:
        instance.role = "user"
