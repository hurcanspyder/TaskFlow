from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Task, Bug, User
from .serializers import TaskSerializer, BugSerializer, UserSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Expose read‑only user info (used for assigning tasks)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class TaskViewSet(viewsets.ModelViewSet):
    """CRUD for Task objects."""
    queryset = Task.objects.select_related('assignee')
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset()

class BugViewSet(viewsets.ModelViewSet):
    """CRUD for Bug objects (proxy of Task)."""
    queryset = Bug.objects.select_related('assignee')
    serializer_class = BugSerializer
    permission_classes = [permissions.IsAuthenticated]
