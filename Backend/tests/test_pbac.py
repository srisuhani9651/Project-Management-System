import pytest
from datetime import datetime, timezone
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.models import (
    UserMaster,
    Project,
    ProjectMember,
    Task,
    Status,
    Priority,
    ProjectType,
    Category,
    TaskType,
)
from app.middleware.auth_middleware import get_current_user

test_data = {}

# Create SQLite in-memory engine for fast, isolated PBAC testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed LOV Tables
    todo_status = Status(status_id=uuid4(), status_name="Todo", is_active=True)
    in_progress_status = Status(status_id=uuid4(), status_name="In Progress", is_active=True)
    done_status = Status(status_id=uuid4(), status_name="Done", is_active=True)

    priority = Priority(priority_id=uuid4(), priority_name="High", is_active=True)
    project_type = ProjectType(project_type_id=uuid4(), type_name="Software", is_active=True)
    category = Category(category_id=uuid4(), category_name="Development", is_active=True)
    task_type = TaskType(task_type_id=uuid4(), type_name="Feature", is_active=True)

    # Seed Users
    owner_user = UserMaster(user_id=uuid4(), full_name="Project Owner", email="owner@test.com", password_hash="hash")
    member_user = UserMaster(user_id=uuid4(), full_name="Project Member", email="member@test.com", password_hash="hash")
    stranger_user = UserMaster(user_id=uuid4(), full_name="Stranger User", email="stranger@test.com", password_hash="hash")
    assignee_user = UserMaster(user_id=uuid4(), full_name="Assignee User", email="assignee@test.com", password_hash="hash")

    db.add_all([
        todo_status, in_progress_status, done_status,
        priority, project_type, category, task_type,
        owner_user, member_user, stranger_user, assignee_user
    ])
    db.commit()

    # Seed Project created by owner_user
    project = Project(
        project_id=uuid4(),
        project_name="Test Project",
        project_description="PBAC Test Project",
        status_id=todo_status.status_id,
        priority_id=priority.priority_id,
        project_type_id=project_type.project_type_id,
        category_id=category.category_id,
        planned_start_date=datetime.now(timezone.utc),
        planned_end_date=datetime.now(timezone.utc),
        estimated_duration=10,
        created_by=owner_user.user_id,
        is_active=True,
    )
    db.add(project)
    db.commit()

    # Add member_user and assignee_user as project members
    pm1 = ProjectMember(project_member_id=uuid4(), project_id=project.project_id, user_id=member_user.user_id, is_active=True)
    pm2 = ProjectMember(project_member_id=uuid4(), project_id=project.project_id, user_id=assignee_user.user_id, is_active=True)
    db.add_all([pm1, pm2])
    db.commit()

    # Store objects for tests
    test_data.update({
        "todo_status": todo_status,
        "in_progress_status": in_progress_status,
        "done_status": done_status,
        "priority": priority,
        "project_type": project_type,
        "category": category,
        "task_type": task_type,
        "owner": owner_user,
        "member": member_user,
        "stranger": stranger_user,
        "assignee": assignee_user,
        "project": project,
    })

    yield
    Base.metadata.drop_all(bind=engine)


def set_user(user: UserMaster):
    """Sets the authenticated user for test requests."""
    app.dependency_overrides[get_current_user] = lambda: user


# ==============================================================================
# PBAC TEST CASES
# ==============================================================================

def test_project_visibility_policy():
    """Policy: Only project members can view a project."""
    data = test_data
    project_id = str(data["project"].project_id)

    # 1. Project Owner can view
    set_user(data["owner"])
    res = client.get(f"/projects/{project_id}")
    assert res.status_code == 200

    # 2. Project Member can view
    set_user(data["member"])
    res = client.get(f"/projects/{project_id}")
    assert res.status_code == 200

    # 3. Non-member (Stranger) gets 403 Forbidden
    set_user(data["stranger"])
    res = client.get(f"/projects/{project_id}")
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"] or "Access denied" in res.json()["detail"]


def test_project_update_delete_policy():
    """Policy: Only the project owner can update or delete a project."""
    data = test_data
    project_id = str(data["project"].project_id)

    update_payload = {"project_name": "Updated Title"}

    # 1. Project Member trying to update -> 403 Forbidden
    set_user(data["member"])
    res = client.post(f"/projects/{project_id}", json=update_payload)
    assert res.status_code == 403

    # 2. Stranger trying to update -> 403 Forbidden
    set_user(data["stranger"])
    res = client.post(f"/projects/{project_id}", json=update_payload)
    assert res.status_code == 403

    # 3. Owner updating project -> 200 OK
    set_user(data["owner"])
    res = client.post(f"/projects/{project_id}", json=update_payload)
    assert res.status_code == 200


def test_task_creation_policy():
    """Policy: Only project members can create tasks."""
    data = test_data
    project_id = str(data["project"].project_id)

    task_payload = {
        "project_id": project_id,
        "title": "New Member Task",
        "description": "Task created by member",
        "status_id": str(data["todo_status"].status_id),
        "priority_id": str(data["priority"].priority_id),
        "task_type_id": str(data["task_type"].task_type_id),
        "assignee_id": str(data["assignee"].user_id),
        "due_date": datetime.now(timezone.utc).isoformat(),
    }

    # 1. Non-member (Stranger) trying to create task -> 403 Forbidden
    set_user(data["stranger"])
    res = client.post("/tasks", json=task_payload)
    assert res.status_code == 403

    # 2. Project Member creating task -> 201 Created
    set_user(data["member"])
    res = client.post("/tasks", json=task_payload)
    assert res.status_code == 201


def test_task_update_policy():
    """Policy: Allowed only if the user created the task or is the assignee."""
    data = test_data
    db = TestingSessionLocal()

    # Create a task by owner assigned to assignee
    task = Task(
        task_id=uuid4(),
        project_id=data["project"].project_id,
        title="Update Test Task",
        description="Description",
        status_id=data["todo_status"].status_id,
        priority_id=data["priority"].priority_id,
        task_type_id=data["task_type"].task_type_id,
        assignee_id=data["assignee"].user_id,
        created_by=data["owner"].user_id,
        due_date=datetime.now(timezone.utc),
        is_active=True,
    )
    db.add(task)
    db.commit()
    task_id = str(task.task_id)
    db.close()

    update_payload = {"title": "Updated Task Title"}

    # 1. Project Member (neither creator nor assignee) trying to update -> 403 Forbidden
    set_user(data["member"])
    res = client.post(f"/tasks/{task_id}", json=update_payload)
    assert res.status_code == 403

    # 2. Assignee updating task -> 200 OK
    set_user(data["assignee"])
    res = client.post(f"/tasks/{task_id}", json=update_payload)
    assert res.status_code == 200

    # 3. Creator (Owner) updating task -> 200 OK
    set_user(data["owner"])
    res = client.post(f"/tasks/{task_id}", json=update_payload)
    assert res.status_code == 200


def test_task_completion_policy():
    """Policy: Task completion is allowed only if task has an assignee and all required fields are completed."""
    data = test_data
    db = TestingSessionLocal()

    # Create task without assignee
    unassigned_task = Task(
        task_id=uuid4(),
        project_id=data["project"].project_id,
        title="Unassigned Task",
        description="Missing assignee",
        status_id=data["todo_status"].status_id,
        priority_id=data["priority"].priority_id,
        task_type_id=data["task_type"].task_type_id,
        assignee_id=None,
        created_by=data["owner"].user_id,
        due_date=datetime.now(timezone.utc),
        is_active=True,
    )
    db.add(unassigned_task)
    db.commit()
    task_id = str(unassigned_task.task_id)
    db.close()

    # Attempt to complete unassigned task -> 403 Forbidden
    set_user(data["owner"])
    res = client.post(f"/tasks/{task_id}", json={"status_id": str(data["done_status"].status_id)})
    assert res.status_code == 403
    assert "without an assignee" in res.json()["detail"]


def test_task_delete_policy():
    """Policy: Allowed only if task status is Todo and requester is project owner."""
    data = test_data
    db = TestingSessionLocal()

    # Task 1: Todo status
    todo_task = Task(
        task_id=uuid4(),
        project_id=data["project"].project_id,
        title="Todo Task",
        status_id=data["todo_status"].status_id,
        priority_id=data["priority"].priority_id,
        task_type_id=data["task_type"].task_type_id,
        assignee_id=data["assignee"].user_id,
        created_by=data["member"].user_id,
        due_date=datetime.now(timezone.utc),
        is_active=True,
    )
    # Task 2: In Progress status
    inprogress_task = Task(
        task_id=uuid4(),
        project_id=data["project"].project_id,
        title="In Progress Task",
        status_id=data["in_progress_status"].status_id,
        priority_id=data["priority"].priority_id,
        task_type_id=data["task_type"].task_type_id,
        assignee_id=data["assignee"].user_id,
        created_by=data["member"].user_id,
        due_date=datetime.now(timezone.utc),
        is_active=True,
    )
    db.add_all([todo_task, inprogress_task])
    db.commit()

    todo_id = str(todo_task.task_id)
    inprogress_id = str(inprogress_task.task_id)
    db.close()

    # 1. Non-owner (Member) trying to delete Todo task -> 403 Forbidden
    set_user(data["member"])
    res = client.delete(f"/tasks/{todo_id}")
    assert res.status_code == 403

    # 2. Owner trying to delete In Progress task -> 403 Forbidden
    set_user(data["owner"])
    res = client.delete(f"/tasks/{inprogress_id}")
    assert res.status_code == 403
    assert "only be deleted if status is 'Todo'" in res.json()["detail"]

    # 3. Owner deleting Todo task -> 200 OK
    set_user(data["owner"])
    res = client.delete(f"/tasks/{todo_id}")
    assert res.status_code == 200


def test_assigned_user_visibility_and_auto_membership():
    """Policy: User assigned to a task gains project membership and can view/list their assigned tasks."""
    data = test_data
    project_id = str(data["project"].project_id)

    # 1. Assigned user can list tasks and see their assigned task
    set_user(data["assignee"])
    res = client.get("/tasks")
    assert res.status_code == 200
    returned_tasks = res.json()
    assert any(str(t.get("assignee_id")) == str(data["assignee"].user_id) for t in returned_tasks)

    # 2. Assigned user automatically has project visibility
    res_proj = client.get(f"/projects/{project_id}")
    assert res_proj.status_code == 200


def test_non_owner_member_task_scoping():
    """Policy: Non-owner member can ONLY view tasks assigned to them in a project."""
    data = test_data
    project_id = str(data["project"].project_id)

    # Member user (non-owner) fetches project tasks
    set_user(data["member"])
    res = client.get(f"/tasks?project_id={project_id}")
    assert res.status_code == 200
    member_tasks = res.json()
    # All returned tasks must be assigned to member
    assert all(str(t.get("assignee_id")) == str(data["member"].user_id) for t in member_tasks)
