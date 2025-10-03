from datetime import date
from typing import Any

from django.core.files.uploadedfile import UploadedFile
from rest_framework import serializers

from ads import validators
from ads.models import AnimalType, Comment, FavoriteAd, PetAd, PetPhoto


class AnimalTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalType
        fields = ["id", "name"]


class PetPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetPhoto
        fields = ["id", "image", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


class PetAdSerializer(serializers.ModelSerializer):
    photos = PetPhotoSerializer(many=True, read_only=True)
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(
            max_length=10 * 1024 * 1024,
            allow_empty_file=False,
        ),
        write_only=True,
        required=False,
        allow_empty=True,
        max_length=10,
    )

    animal_type = AnimalTypeSerializer(read_only=True)
    animal_type_id = serializers.PrimaryKeyRelatedField(
        queryset=AnimalType.objects.all(), source="animal_type", write_only=True
    )
    is_active = serializers.BooleanField(default=True)

    class Meta:
        model = PetAd
        fields = [
            "id",
            "title",
            "description",
            "animal_type",
            "animal_type_id",
            "breed",
            "location",
            "date_lost",
            "contact_phone",
            "author",
            "is_active",
            "created_at",
            "updated_at",
            "photos",
            "uploaded_photos",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at", "photos", "contact_phone"]

    def validate_title(self, value: str) -> str:
        return validators.validate_title(value)

    def validate_description(self, value: str) -> str:
        return validators.validate_description(value)

    def validate_date_lost(self, value: date) -> date:
        return validators.validate_date_lost(value)

    def validate_uploaded_photos(self, value: list[UploadedFile]) -> list[UploadedFile]:
        return validators.validate_uploaded_photos(value)

    def create(self, validated_data: dict[str, Any]) -> PetAd:
        uploaded_photos = validated_data.pop("uploaded_photos", [])

        if not validated_data.get("contact_phone") and self.context["request"].user.phone:
            validated_data["contact_phone"] = self.context["request"].user.phone

        pet_ad = PetAd.objects.create(**validated_data)
        for photo in uploaded_photos:
            PetPhoto.objects.create(ad=pet_ad, image=photo)

        return pet_ad

    def update(self, instance: PetAd, validated_data: dict[str, Any]) -> PetAd:
        uploaded_photos = validated_data.pop("uploaded_photos", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if uploaded_photos is not None:
            for photo in instance.photos.all():  # type: ignore
                photo.image.delete(save=False)
                photo.delete()

            if (
                uploaded_photos
                and hasattr(uploaded_photos[0], "name")
                and uploaded_photos[0].name != "delete_all_photos.png"
            ):
                for photo in uploaded_photos:
                    PetPhoto.objects.create(ad=instance, image=photo)

        return instance


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(source="author", read_only=True)
    ad_id = serializers.PrimaryKeyRelatedField(
        queryset=PetAd.objects.all(), source="ad", write_only=True
    )
    ad = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "text",
            "author",
            "author_id",
            "ad",
            "ad_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "author", "author_id", "ad", "created_at", "updated_at"]

    def validate_text(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Comment text cannot be empty.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Comment must be at least 2 characters long.")
        if len(value) > 1000:
            raise serializers.ValidationError("Comment cannot exceed 1000 characters.")
        return value.strip()


class FavoriteAdSerializer(serializers.ModelSerializer):
    ad = PetAdSerializer(read_only=True)
    ad_id = serializers.PrimaryKeyRelatedField(
        queryset=PetAd.objects.all(), source="ad", write_only=True
    )

    class Meta:
        model = FavoriteAd
        fields = ["id", "ad", "ad_id", "created_at"]
        read_only_fields = ["id", "ad", "created_at"]
