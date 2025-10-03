from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ads.views import (
    AnimalTypeViewSet,
    CommentViewSet,
    FavoriteAdViewSet,
    PetAdViewSet,
    PetPhotoViewSet,
    yandex_geocode_proxy,
    yandex_suggest_proxy,
)

router = DefaultRouter()

router.register("animal-types", AnimalTypeViewSet)
router.register("ads", PetAdViewSet)
router.register("photos", PetPhotoViewSet)
router.register("comments", CommentViewSet)
router.register("favorites", FavoriteAdViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("yandex/suggest/", yandex_suggest_proxy, name="yandex-suggest"),
    path("yandex/geocode/", yandex_geocode_proxy, name="yandex-geocode"),
]
