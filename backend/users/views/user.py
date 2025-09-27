from rest_framework import viewsets
from rest_framework.serializers import BaseSerializer

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
