from typing import Any

from rest_framework import permissions
from rest_framework.permissions import SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import APIView


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, "role", None) == "admin"


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        if request.method in SAFE_METHODS:
            return True

        role = getattr(request.user, "role", None)

        if role == "admin":
            return True

        if role == "user" and hasattr(obj, "author"):
            return obj.author == request.user or request.method in SAFE_METHODS

        return False
