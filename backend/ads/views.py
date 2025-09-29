from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, serializers, viewsets
from rest_framework.filters import OrderingFilter

from ads.filters import PetAdFilter
from ads.models import AnimalType, PetAd, PetPhoto
from ads.permissions import IsAdminOrReadOnly, IsOwnerOrAdmin
from ads.serializers import AnimalTypeSerializer, PetAdSerializer, PetPhotoSerializer


class AnimalTypeViewSet(viewsets.ModelViewSet):
    queryset = AnimalType.objects.all()
    serializer_class = AnimalTypeSerializer
    permission_classes = [IsAdminOrReadOnly]


class PetAdViewSet(viewsets.ModelViewSet):
    queryset = (
        PetAd.objects.all().select_related("animal_type", "author").prefetch_related("photos")
    )
    serializer_class = PetAdSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PetAdFilter
    ordering_fields = ["date_lost", "created_at", "title"]
    ordering = ["-created_at"]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

    def perform_create(self, serializer: serializers.BaseSerializer) -> None:
        serializer.save(author=self.request.user)


class PetPhotoViewSet(viewsets.ModelViewSet):
    queryset = PetPhoto.objects.all()
    serializer_class = PetPhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]
