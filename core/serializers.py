# core/serializers.py
"""Serializers for the TaskFlow core models.

These serializers translate Django model instances to JSON representations for
the DRF API and handle validation on input. They are deliberately thin – the
business logic lives in the viewsets and the models.
"""

from rest_framework import serializers
from .models import User, Task, Bug


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "username"]


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="assignee", write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "priority",
            "status",
            "assignee",
            "assignee_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "assignee"]


class BugSerializer(TaskSerializer):
    class Meta(TaskSerializer.Meta):
        model = Bug
        fields = TaskSerializer.Meta.fields
        # No extra fields – proxy model reuses same serializer.
