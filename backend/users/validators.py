import re

import phonenumbers
from django.core.exceptions import ValidationError
from rest_framework import serializers


def validate_phone(value: str) -> None:
    if not re.fullmatch(r"[+\d\s\-\(\)]+", value):
        raise ValidationError("The phone number contains invalid characters.")

    try:
        number = phonenumbers.parse(value, None)
        if not phonenumbers.is_valid_number(number):
            raise ValidationError("Enter the correct phone number.")
        if phonenumbers.region_code_for_number(number) not in ["RU", "BY"]:
            raise ValidationError("Only Russian and Belarusian numbers are supported..")
    except phonenumbers.NumberParseException:
        raise ValidationError("Incorrect phone number format.")


def validate_username(value: str) -> str:
    if len(value) < 3:
        raise serializers.ValidationError("Username must be at least 3 characters long")
    return value
