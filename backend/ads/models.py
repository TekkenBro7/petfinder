from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class AnimalType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = "Animal Type"
        verbose_name_plural = "Animal Types"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class PetAd(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    animal_type = models.ForeignKey(AnimalType, on_delete=models.PROTECT, related_name="ads")
    breed = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200)
    date_lost = models.DateField()
    contact_phone = models.CharField(max_length=20)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ads")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["animal_type", "is_active"]),
            models.Index(fields=["location"]),
            models.Index(fields=["date_lost"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.animal_type.name})"


class PetPhoto(models.Model):
    ad = models.ForeignKey(PetAd, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="pet_photos/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["uploaded_at"]

    def __str__(self) -> str:
        return f"{self.ad.title} ({self.ad.animal_type.name})"


class Comment(models.Model):
    ad = models.ForeignKey(PetAd, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["ad", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"Comment by {self.author.username} on {self.ad.title}"


class FavoriteAd(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorite_ads")
    ad = models.ForeignKey(PetAd, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "ad"]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.username} - {self.ad.title}"
