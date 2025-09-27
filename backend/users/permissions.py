from typing import Any

from rest_framework import permissions
from rest_framework.permissions import SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import APIView


class IsAdminOrSelf(permissions.BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        action = getattr(view, "action", None)
        if action == "create" and not request.user.is_authenticated:
            return True

        if not request.user.is_authenticated:
            return False

        return True

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        role = getattr(request.user, "role", None)
        if role == "admin":
            return True

        if role == "user" and obj == request.user:
            return request.method in SAFE_METHODS or request.method in ("PUT", "PATCH")

        return False
