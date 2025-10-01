from rest_framework import viewsets
from rest_framework.serializers import BaseSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request

from users.models import User
from users.permissions import IsAdminOrSelf
from users.serializers import UserCreateSerializer, UserDetailSerializer, UserListSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminOrSelf]

    def get_serializer_class(self) -> type[BaseSerializer]:
        if self.action == "list":
            return UserListSerializer
        elif self.action == "create":
            return UserCreateSerializer
        return UserDetailSerializer

    @action(detail=False, methods=["get"])
    def me(self, request: Request) -> Response:
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
