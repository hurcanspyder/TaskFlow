from django.core.management.base import BaseCommand
from core.models import User, Task, Bug

class Command(BaseCommand):
    help = "Seed database with default user and sample tasks/bugs"

    def handle(self, *args, **options):
        # Create test user
        user, created = User.objects.get_or_create(username="admin", email="admin@taskflow.dev")
        if created:
            user.set_password("admin123")
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user (admin / admin123)"))
        else:
            user.set_password("admin123")
            user.save()
            self.stdout.write(self.style.SUCCESS("Updated admin password (admin / admin123)"))

        demo_user, _ = User.objects.get_or_create(username="developer", email="dev@taskflow.dev")
        demo_user.set_password("dev123")
        demo_user.save()

        # Create sample tasks if none exist
        if Task.objects.count() == 0:
            t1 = Task.objects.create(
                title="Design System Architecture",
                description="Draft high-level architecture diagram and API schema documentation.",
                priority=Task.Priority.HIGH,
                status=Task.Status.DONE,
                assignee=user,
            )
            t2 = Task.objects.create(
                title="JWT Authentication Implementation",
                description="Implement DRF SimpleJWT token obtain and refresh endpoints with custom claims.",
                priority=Task.Priority.HIGH,
                status=Task.Status.IN_PROGRESS,
                assignee=demo_user,
            )
            t3 = Task.objects.create(
                title="Kanban Board React Component",
                description="Build interactive drag-and-drop Kanban columns with real-time status sync.",
                priority=Task.Priority.MEDIUM,
                status=Task.Status.IN_PROGRESS,
                assignee=user,
            )
            t4 = Task.objects.create(
                title="Export Analytics to CSV",
                description="Add REST endpoint for downloading sprint metrics and task completion logs.",
                priority=Task.Priority.LOW,
                status=Task.Status.TODO,
                assignee=demo_user,
            )
            t5 = Task.objects.create(
                title="UI Theme Customizer",
                description="Allow users to toggle between dark mode and sleek glassmorphism themes.",
                priority=Task.Priority.LOW,
                status=Task.Status.TODO,
                assignee=user,
            )

            # Create sample bugs
            Bug.objects.create(
                title="Fix CORS preflight header mismatch",
                description="OPTIONS requests fail on localhost:3000 due to missing Allowed-Headers.",
                priority=Task.Priority.HIGH,
                status=Task.Status.IN_PROGRESS,
                assignee=user,
            )
            Bug.objects.create(
                title="Token refresh memory leak on unmount",
                description="Axios interceptor keeps retrying token refresh after component unmounts.",
                priority=Task.Priority.MEDIUM,
                status=Task.Status.TODO,
                assignee=demo_user,
            )

            self.stdout.write(self.style.SUCCESS("Seeded sample tasks and bugs successfully!"))
        else:
            self.stdout.write("Database already contains tasks.")
