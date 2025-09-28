from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ads.views import AnimalTypeViewSet, PetAdViewSet, PetPhotoViewSet

router = DefaultRouter()

router.register("animal-types", AnimalTypeViewSet)
router.register("ads", PetAdViewSet)
router.register("photos", PetPhotoViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
