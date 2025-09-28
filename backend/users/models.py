from typing import Any

import phonenumbers
from django.contrib.auth.models import AbstractUser
from django.db import models

from users.validators import validate_phone


class User(AbstractUser):
    ROLE_CHOICES = (
        ("user", "User"),
        ("admin", "Admin"),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    phone = models.CharField(
        max_length=15, blank=True, default="", unique=True, validators=[validate_phone]
    )
    email = models.EmailField(unique=True, blank=True, null=True) # type: ignore

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def save(self, *args: Any, **kwargs: Any) -> None:
        if self.phone:
            try:
                number = phonenumbers.parse(self.phone, None)
                self.phone = phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164)
            except phonenumbers.NumberParseException:
                pass
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.username
