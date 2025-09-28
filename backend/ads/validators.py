from datetime import date

from django.core.files.uploadedfile import UploadedFile
from rest_framework import serializers


def validate_title(value: str) -> str:
    if len(value.strip()) < 5:
        raise serializers.ValidationError("Title must contain at least 5 characters.")
    if len(value) > 100:
        raise serializers.ValidationError("Title cannot exceed 200 characters.")
    return value


def validate_description(value: str) -> str:
    if len(value.strip()) < 10:
        raise serializers.ValidationError("Description must contain at least 10 characters.")
    if len(value) > 2000:
        raise serializers.ValidationError("Description cannot exceed 2000 characters.")
    return value


def validate_date_lost(value: date) -> date:
    if value > date.today():
        raise serializers.ValidationError("Lost date cannot be in the future.")
    return value


def validate_uploaded_photos(value: list[UploadedFile]) -> list[UploadedFile]:
    if len(value) > 10:
        raise serializers.ValidationError("You cannot upload more than 10 photos.")

    allowed_types = ["image/jpeg", "image/png"]
    for photo in value:
        if photo.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Invalid file type: {photo.content_type}. "
                f"Allowed types: {', '.join(allowed_types)}"
            )

        if photo.size is not None and photo.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                f"File {photo.name} is too large. Maximum allowed size: 5MB."
            )

    return value
