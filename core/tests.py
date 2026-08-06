from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.models import User, Task, Bug

class TaskFlowAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.token_url = reverse("token_obtain_pair")
        self.tasks_url = reverse("task-list")
        self.bugs_url = reverse("bug-list")
        self.users_url = reverse("user-list")

        # Get JWT Token
        response = self.client.post(self.token_url, {"username": "testuser", "password": "password123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_jwt_login_success(self):
        response = self.client.post(self.token_url, {"username": "testuser", "password": "password123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_create_task(self):
        data = {
            "title": "Build Auth Flow",
            "description": "Implement login and signup views",
            "priority": Task.Priority.HIGH,
            "status": Task.Status.TODO,
        }
        response = self.client.post(self.tasks_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.get().title, "Build Auth Flow")

    def test_update_task_status(self):
        task = Task.objects.create(
            title="Initial Task", priority=Task.Priority.MEDIUM, status=Task.Status.TODO, assignee=self.user
        )
        url = reverse("task-detail", kwargs={"pk": task.id})
        response = self.client.patch(url, {"status": Task.Status.IN_PROGRESS})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, Task.Status.IN_PROGRESS)

    def test_delete_task(self):
        task = Task.objects.create(title="Task to delete")
        url = reverse("task-detail", kwargs={"pk": task.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_create_bug_proxy_model(self):
        data = {
            "title": "NullPointerException in user profile",
            "description": "Avatar URL is unhandled when null",
            "priority": Task.Priority.HIGH,
            "status": Task.Status.IN_PROGRESS,
        }
        response = self.client.post(self.bugs_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Bug.objects.count(), 1)

    def test_unauthenticated_access_rejected(self):
        self.client.credentials()  # Remove token
        response = self.client.get(self.tasks_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
