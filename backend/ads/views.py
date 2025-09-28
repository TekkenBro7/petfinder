from rest_framework import permissions, serializers, viewsets

from ads.models import AnimalType, PetAd, PetPhoto
from ads.serializers import AnimalTypeSerializer, PetAdSerializer, PetPhotoSerializer


class AnimalTypeViewSet(viewsets.ModelViewSet):
    queryset = AnimalType.objects.all()
    serializer_class = AnimalTypeSerializer
    permission_classes = [permissions.AllowAny]


class PetAdViewSet(viewsets.ModelViewSet):
    queryset = (
        PetAd.objects.all().select_related("animal_type", "author").prefetch_related("photos")
    )
    serializer_class = PetAdSerializer

    def perform_create(self, serializer: serializers.BaseSerializer) -> None:
        serializer.save(author=self.request.user)


class PetPhotoViewSet(viewsets.ModelViewSet):
    queryset = PetPhoto.objects.all()
    serializer_class = PetPhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
