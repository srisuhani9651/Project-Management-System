from enum import Enum
from typing import Any, Dict, Optional, Union
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.auth.user_master import UserMaster
from app.models.lov.status import Status
from app.models.tracker.project import Project
from app.models.tracker.project_members import ProjectMember
from app.models.tracker.tasks import Task


class Action(str, Enum):
    PROJECT_VIEW = "project:view"
    PROJECT_UPDATE = "project:update"
    PROJECT_DELETE = "project:delete"
    TASK_VIEW = "task:view"
    TASK_CREATE = "task:create"
    TASK_UPDATE = "task:update"
    TASK_DELETE = "task:delete"
    TASK_COMPLETE = "task:complete"


class PBACAuthorizationError(HTTPException):
    """Custom HTTPException for PBAC 403 Forbidden responses."""
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def is_project_member(user_id: UUID, project_id: UUID, db: Session) -> bool:
    """
    Evaluates if a user is a member of a project.
    A user is considered a project member if:
    1. They are the project owner/creator (project.created_by == user_id)
    2. They have an active entry in tracker.project_members.
    3. OR they are assigned to an active task in this project (and automatically added as a member).
    """
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.is_active == True
    ).first()

    if not project:
        return False

    if str(project.created_by) == str(user_id):
        return True

    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id,
        ProjectMember.is_active == True
    ).first()

    if member is not None:
        return True

    # Check if the user is assigned to any active task in this project
    assigned_task = db.query(Task).filter(
        Task.project_id == project_id,
        Task.assignee_id == user_id,
        Task.is_active == True
    ).first()

    if assigned_task is not None:
        try:
            new_member = ProjectMember(project_id=project_id, user_id=user_id, is_active=True)
            db.add(new_member)
            db.commit()
        except Exception:
            db.rollback()
        return True

    return False


def is_completion_status(status_id: Optional[UUID], db: Session) -> bool:
    """Helper to check if a status_id corresponds to 'Completed' or 'Done' status."""
    if not status_id:
        return False
    st = db.query(Status).filter(Status.status_id == status_id).first()
    return st is not None and str(st.status_name).lower().strip() in ("completed", "done")


def get_project(project_id: Union[UUID, str], db: Session) -> Project:
    """Helper to fetch an active project or raise 404."""
    if isinstance(project_id, str):
        try:
            project_id = UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid project ID format.")

    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.is_active == True
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return project


def get_task(task_id: Union[UUID, str], db: Session) -> Task:
    """Helper to fetch an active task or raise 404."""
    if isinstance(task_id, str):
        try:
            task_id = UUID(task_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid task ID format.")

    task = db.query(Task).filter(
        Task.task_id == task_id,
        Task.is_active == True
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found."
        )
    return task


# ==============================================================================
# PBAC POLICY EVALUATORS
# ==============================================================================

def eval_project_view(user: UserMaster, project: Project, db: Session) -> bool:
    """Policy: Only project members can view a project."""
    if not is_project_member(user.user_id, project.project_id, db):
        raise PBACAuthorizationError("Access denied: Only project members can view this project.")
    return True


def eval_project_update(user: UserMaster, project: Project, db: Session) -> bool:
    """Policy: Only the project owner can update a project."""
    if str(project.created_by) != str(user.user_id):
        raise PBACAuthorizationError("Access denied: Only the project owner can update this project.")
    return True


def eval_project_delete(user: UserMaster, project: Project, db: Session) -> bool:
    """Policy: Only the project owner can delete a project."""
    if str(project.created_by) != str(user.user_id):
        raise PBACAuthorizationError("Access denied: Only the project owner can delete this project.")
    return True


def eval_task_view(user: UserMaster, task: Task, db: Session) -> bool:
    """
    Policy: Task View PBAC:
    - Project Owner: Can view all tasks in their projects.
    - Non-owner Project Member: Can view tasks assigned to or created by them.
    """
    project = get_project(task.project_id, db)
    is_owner = str(project.created_by) == str(user.user_id)
    is_assignee = task.assignee_id and str(task.assignee_id) == str(user.user_id)
    is_creator = task.created_by and str(task.created_by) == str(user.user_id)

    if is_owner or is_assignee or is_creator:
        return True

    raise PBACAuthorizationError("Access denied: You can only view tasks assigned to you or created by you in this project.")


def eval_task_create(user: UserMaster, project_id: UUID, db: Session) -> bool:
    """Policy: Only project members can create tasks."""
    if not is_project_member(user.user_id, project_id, db):
        raise PBACAuthorizationError("Access denied: Only project members can create tasks in this project.")
    return True


def eval_task_update(user: UserMaster, task: Task, db: Session) -> bool:
    """Policy: Task update is allowed only if the user created the task or is the assignee."""
    is_creator = str(task.created_by) == str(user.user_id)
    is_assignee = task.assignee_id and str(task.assignee_id) == str(user.user_id)

    if not (is_creator or is_assignee):
        raise PBACAuthorizationError("Access denied: Only the task creator or assignee can update this task.")
    return True


def eval_task_delete(user: UserMaster, task: Task, db: Session) -> bool:
    """Policy: Task delete is allowed only if the task status is Todo and the requester is the project owner."""
    project = get_project(task.project_id, db)

    # Check 1: Requester must be project owner
    if str(project.created_by) != str(user.user_id):
        raise PBACAuthorizationError("Access denied: Only the project owner can delete tasks from this project.")

    # Check 2: Task status must be 'Todo' / 'To Do'
    status_obj = db.query(Status).filter(Status.status_id == task.status_id).first()
    status_name = status_obj.status_name.lower().strip() if status_obj else ""

    if status_name not in ("todo", "to do"):
        raise PBACAuthorizationError(
            f"Access denied: Tasks can only be deleted if status is 'Todo'. Current status is '{status_obj.status_name if status_obj else 'Unknown'}'."
        )
    return True


def eval_task_complete(user: UserMaster, task: Task, update_data: Optional[Dict[str, Any]], db: Session) -> bool:
    """
    Policy: Task completion is allowed only if the task has an assignee and all required task fields are completed.
    Takes into account proposed updates (if update_data is passed).
    """
    def get_field(field_name: str) -> Any:
        if update_data and field_name in update_data and update_data[field_name] is not None:
            return update_data[field_name]
        return getattr(task, field_name, None)

    assignee_id = get_field("assignee_id")

    # 1. Must have an assignee
    if not assignee_id:
        raise PBACAuthorizationError("Access denied: Task cannot be completed without an assignee.")

    # 2. All required task fields must be completed
    required_fields = {
        "title": get_field("title"),
        "description": get_field("description"),
        "project_id": get_field("project_id"),
        "status_id": get_field("status_id"),
        "priority_id": get_field("priority_id"),
        "task_type_id": get_field("task_type_id"),
        "due_date": get_field("due_date"),
    }

    missing_or_empty = []
    for field_name, val in required_fields.items():
        if val is None or (isinstance(val, str) and not val.strip()):
            missing_or_empty.append(field_name)

    if missing_or_empty:
        raise PBACAuthorizationError(
            f"Access denied: Task cannot be completed because required fields are incomplete or missing: {', '.join(missing_or_empty)}."
        )

    return True


# ==============================================================================
# CENTRAL AUTHORIZATION ENTRYPOINT
# ==============================================================================

def authorize(
    user: UserMaster,
    action: Union[Action, str],
    resource: Any,
    db: Session,
    context: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Centralized PBAC Authorization entrypoint.
    Evaluates policy for given action and resource for user.
    Raises 403 Forbidden HTTP Exception if authorization fails.

    :param user: Current authenticated user (UserMaster).
    :param action: PBAC Action (e.g., Action.PROJECT_VIEW, Action.TASK_UPDATE, etc.).
    :param resource: Target resource instance, UUID, dict, or ID string.
    :param db: SQLAlchemy Session.
    :param context: Extra context dict (e.g. proposed update payload).
    :return: True if authorized.
    """
    if not user or not getattr(user, "user_id", None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or invalid."
        )

    action_str = action.value if isinstance(action, Action) else str(action)

    if action_str == Action.PROJECT_VIEW:
        project = resource if isinstance(resource, Project) else get_project(resource, db)
        return eval_project_view(user, project, db)

    elif action_str == Action.PROJECT_UPDATE:
        project = resource if isinstance(resource, Project) else get_project(resource, db)
        return eval_project_update(user, project, db)

    elif action_str == Action.PROJECT_DELETE:
        project = resource if isinstance(resource, Project) else get_project(resource, db)
        return eval_project_delete(user, project, db)

    elif action_str == Action.TASK_VIEW:
        task = resource if isinstance(resource, Task) else get_task(resource, db)
        return eval_task_view(user, task, db)

    elif action_str == Action.TASK_CREATE:
        if isinstance(resource, UUID):
            project_id = resource
        elif isinstance(resource, str):
            project_id = UUID(resource)
        elif isinstance(resource, Project):
            project_id = resource.project_id
        elif isinstance(resource, dict) and "project_id" in resource:
            project_id = UUID(str(resource["project_id"]))
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project ID required for task creation authorization.")
        return eval_task_create(user, project_id, db)

    elif action_str == Action.TASK_UPDATE:
        task = resource if isinstance(resource, Task) else get_task(resource, db)
        return eval_task_update(user, task, db)

    elif action_str == Action.TASK_DELETE:
        task = resource if isinstance(resource, Task) else get_task(resource, db)
        return eval_task_delete(user, task, db)

    elif action_str == Action.TASK_COMPLETE:
        task = resource if isinstance(resource, Task) else get_task(resource, db)
        update_payload = context.get("update_data") if context else None
        return eval_task_complete(user, task, update_payload, db)

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown PBAC action '{action_str}'."
        )
