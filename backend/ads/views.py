from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

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
