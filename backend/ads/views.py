import requests
import os
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from django.conf import settings

from ads.filters import PetAdFilter
from ads.models import AnimalType, Comment, FavoriteAd, PetAd, PetPhoto
from ads.permissions import IsAdminOrReadOnly, IsOwnerOrAdmin
from ads.serializers import (
    AnimalTypeSerializer,
    CommentSerializer,
    FavoriteAdSerializer,
    PetAdSerializer,
    PetPhotoSerializer,
)


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


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=["get"], url_path="ad/(?P<ad_id>[^/.]+)")
    def get_comments_by_ad(self, request, ad_id=None):
        comments = self.get_queryset().filter(ad_id=ad_id)
        page = self.paginate_queryset(comments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)


class FavoriteAdViewSet(viewsets.ModelViewSet):
    queryset = FavoriteAd.objects.all()
    serializer_class = FavoriteAdSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            FavoriteAd.objects.filter(user=self.request.user)
            .select_related("ad", "ad__animal_type")
            .prefetch_related("ad__photos")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def my_favorites(self, request):
        favorites = self.get_queryset()
        page = self.paginate_queryset(favorites)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="toggle/(?P<ad_id>[^/.]+)")
    def toggle_favorite(self, request, ad_id=None):
        try:
            ad = PetAd.objects.get(id=ad_id)
        except PetAd.DoesNotExist:
            return Response({"error": "Advertisement not found"}, status=status.HTTP_404_NOT_FOUND)

        favorite = FavoriteAd.objects.filter(user=request.user, ad=ad).first()

        if favorite:
            favorite.delete()
            return Response({"status": "removed", "is_favorited": False}, status=status.HTTP_200_OK)
        else:
            favorite = FavoriteAd.objects.create(user=request.user, ad=ad)
            serializer = self.get_serializer(favorite)
            return Response(
                {"status": "added", "is_favorited": True, "favorite": serializer.data},
                status=status.HTTP_201_CREATED,
            )

    @action(detail=False, methods=["get"], url_path="check/(?P<ad_id>[^/.]+)")
    def check_favorite(self, request, ad_id=None):
        is_favorited = FavoriteAd.objects.filter(user=request.user, ad_id=ad_id).exists()

        return Response({"is_favorited": is_favorited})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def yandex_suggest_proxy(request):
    query = request.GET.get("q", "")
    if not query:
        return Response(
            {"error": 'Query parameter "q" is required'}, status=status.HTTP_400_BAD_REQUEST
        )

    YANDEX_API_KEY = os.environ.get('YANDEX_API_KEY', '')

    url = "https://suggest-maps.yandex.ru/v1/suggest"
    params = {
        "apikey": YANDEX_API_KEY,
        "text": query,
        "lang": "ru_RU",
        "results": 10,
        "type": "geo",
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return Response(response.json())
    except requests.exceptions.Timeout:
        return Response({"error": "Request timeout"}, status=status.HTTP_408_REQUEST_TIMEOUT)
    except requests.exceptions.RequestException as e:
        return Response(
            {"error": f"Yandex API error: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY
        )


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def yandex_geocode_proxy(request):
    query = request.GET.get("q", "")
    if not query:
        return Response(
            {"error": 'Query parameter "q" is required'}, status=status.HTTP_400_BAD_REQUEST
        )

    YANDEX_API_KEY = os.environ.get('YANDEX_API_KEY', '')

    url = "https://geocode-maps.yandex.ru/1.x/"
    params = {"apikey": YANDEX_API_KEY, "geocode": query, "format": "json", "results": 10}

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return Response(response.json())
    except requests.exceptions.Timeout:
        return Response({"error": "Request timeout"}, status=status.HTTP_408_REQUEST_TIMEOUT)
    except requests.exceptions.RequestException as e:
        return Response(
            {"error": f"Yandex API error: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY
        )
