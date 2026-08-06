# core/models.py
"""Core application models for TaskFlow.

We define a custom user model extending Django's AbstractUser so that the project
can be easily extended with profile fields later without touching the built‑in
auth tables. The model is referenced in `settings.AUTH_USER_MODEL`.

Two main domain entities are provided:

* **Task** – Represents a work item (feature, story, or bug). It includes a
  title, description, priority, status, optional assignee and timestamps.
* **Bug** – A proxy model that inherits from ``Task`` and is used only for a
  distinct admin representation. Keeping bugs as a proxy keeps the database
  schema simple while allowing separate UI sections.

The design showcases common Django patterns (choices, foreign keys,
`auto_now_add`, `auto_now`).
"""

from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models


class User(AbstractUser):
    """Custom user model.

    No additional fields are required for the MVP, but inheriting from
    ``AbstractUser`` gives us full control for future extensions.
    """

    # Placeholder for future profile fields, e.g., ``team`` or ``avatar``.
    pass


class Task(models.Model):
    """A task or story in the Agile board.

    ``priority`` and ``status`` are implemented as ``TextChoices`` for clarity
    and to provide human‑readable labels in the admin and API.
    """

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Status(models.TextChoices):
        TODO = "todo", "To Do"
        IN_PROGRESS = "in_progress", "In Progress"
        DONE = "done", "Done"
        # ``bug`` status is represented via the ``Bug`` proxy model.

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.TODO
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    class Meta:
        ordering = ["-created_at"]


class Bug(Task):
    """Proxy model for tasks that are bugs.

    It inherits all fields from ``Task`` but appears as a separate model in the
    Django admin and can be filtered on the frontend via the ``type`` flag.
    """

    class Meta:
        proxy = True
        verbose_name = "Bug"
        verbose_name_plural = "Bugs"
