from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.authorization.pbac import Action, authorize, get_task, is_completion_status
from app.db.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.auth.user_master import UserMaster
from app.services.project_service import ProjectService
from app.services.task_service import TaskService
from app.services.schemas.project import (
    CreateProjectResponse,
    ProjectCreate,
    ProjectLOVResponse,
    ProjectResponse,
    ProjectUpdate,
    UpdateProjectResponse,
)
from app.services.schemas.task import (
    CreateTaskResponse,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
    UpdateTaskResponse,
)

router = APIRouter(prefix="", tags=["Projects & Tasks Management"])


# ==============================================================================
# UNIFIED DYNAMIC POST & DELETE ROUTES WITH PATH VARIABLE DIFFERENTIATOR
# ==============================================================================

@router.post(
    "/api/manage/{entity_type}",
    status_code=status.HTTP_201_CREATED,
    summary="Unified Create API (Path variable differentiator: 'project' or 'task')",
    description="Creates a new Project or Task depending on the '{entity_type}' path variable ('project' or 'task'). Enforces PBAC."
)
def manage_create_entity(
    entity_type: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
) -> Any:
    """Unified POST handler for CREATING entities with PBAC checks."""
    entity = entity_type.lower().strip()

    if entity in ("project", "projects"):
        try:
            project_data = ProjectCreate.model_validate(payload)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid payload for project creation: {str(e)}"
            )
        return ProjectService.create_project(
            project_data=project_data,
            current_user_id=current_user.user_id,
            db=db
        )

    elif entity in ("task", "tasks"):
        try:
            task_data = TaskCreate.model_validate(payload)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid payload for task creation: {str(e)}"
            )

        # PBAC Policy: Task Creation - Only project members can create tasks
        authorize(current_user, Action.TASK_CREATE, task_data.project_id, db)

        return TaskService.create_task(
            task_data=task_data,
            current_user_id=current_user.user_id,
            db=db
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid entity_type path parameter '{entity_type}'. Must be 'project' or 'task'."
        )


@router.post(
    "/api/manage/{entity_type}/{entity_id}",
    status_code=status.HTTP_200_OK,
    summary="Unified Update API (Path variable differentiator: 'project' or 'task' + entity_id)",
    description="Updates an existing Project or Task depending on '{entity_type}' path variable and '{entity_id}'. Enforces PBAC."
)
def manage_update_entity(
    entity_type: str,
    entity_id: UUID,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
) -> Any:
    """Unified POST handler for UPDATING entities with PBAC checks."""
    entity = entity_type.lower().strip()

    if entity in ("project", "projects"):
        try:
            project_data = ProjectUpdate.model_validate(payload)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid payload for project update: {str(e)}"
            )

        # PBAC Policy: Project Update - Only the project owner can update a project
        authorize(current_user, Action.PROJECT_UPDATE, entity_id, db)

        return ProjectService.update_project(
            project_id=entity_id,
            project_data=project_data,
            current_user_id=current_user.user_id,
            db=db
        )

    elif entity in ("task", "tasks"):
        try:
            task_data = TaskUpdate.model_validate(payload)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid payload for task update: {str(e)}"
            )

        task_obj = get_task(entity_id, db)

        # PBAC Policy: Task Update - Allowed only if user created the task or is assignee
        authorize(current_user, Action.TASK_UPDATE, task_obj, db)

        # PBAC Policy: Task Completion - If updating status to completed/done or setting completed_at
        status_id = payload.get("status_id") or task_data.status_id
        if is_completion_status(status_id, db) or payload.get("completed_at"):
            authorize(
                current_user,
                Action.TASK_COMPLETE,
                task_obj,
                db,
                context={"update_data": payload}
            )

        return TaskService.update_task(
            task_id=entity_id,
            task_data=task_data,
            current_user_id=current_user.user_id,
            db=db
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid entity_type path parameter '{entity_type}'. Must be 'project' or 'task'."
        )


@router.delete(
    "/api/manage/{entity_type}/{entity_id}",
    status_code=status.HTTP_200_OK,
    summary="Unified Delete API (Path variable differentiator: 'project' or 'task' + entity_id)",
    description="Deletes an existing Project or Task. Enforces PBAC."
)
def manage_delete_entity(
    entity_type: str,
    entity_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
) -> Any:
    """Unified DELETE handler with PBAC checks."""
    entity = entity_type.lower().strip()

    if entity in ("project", "projects"):
        # PBAC Policy: Project Delete - Only project owner can delete
        authorize(current_user, Action.PROJECT_DELETE, entity_id, db)
        return ProjectService.delete_project(project_id=entity_id, db=db)

    elif entity in ("task", "tasks"):
        # PBAC Policy: Task Delete - Allowed only if status is Todo and requester is project owner
        authorize(current_user, Action.TASK_DELETE, entity_id, db)
        return TaskService.delete_task(task_id=entity_id, db=db)

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid entity_type path parameter '{entity_type}'. Must be 'project' or 'task'."
        )


# ==============================================================================
# PROJECT DEDICATED ROUTES
# ==============================================================================

@router.get(
    "/projects/lov",
    response_model=ProjectLOVResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Project LOV Options (Authenticated)"
)
def get_project_lovs(
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Fetch LOV options for project creation and dropdowns."""
    return ProjectService.get_lov_options(db=db)


@router.post(
    "/projects",
    response_model=CreateProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project"
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Direct route to create a new project."""
    return ProjectService.create_project(
        project_data=project_data,
        current_user_id=current_user.user_id,
        db=db
    )


@router.post(
    "/projects/{project_id}",
    response_model=UpdateProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a project by ID"
)
def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Direct route to update an existing project (Enforces PBAC)."""
    authorize(current_user, Action.PROJECT_UPDATE, project_id, db)
    return ProjectService.update_project(
        project_id=project_id,
        project_data=project_data,
        current_user_id=current_user.user_id,
        db=db
    )


@router.delete(
    "/projects/{project_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a project by ID"
)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Direct route to delete an existing project (Enforces PBAC)."""
    authorize(current_user, Action.PROJECT_DELETE, project_id, db)
    return ProjectService.delete_project(project_id=project_id, db=db)


@router.get(
    "/projects",
    response_model=List[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="List user projects"
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Fetch all projects where current user is owner or member."""
    return ProjectService.get_all_projects(
        current_user_id=current_user.user_id,
        db=db
    )


@router.get(
    "/projects/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Get project details by ID"
)
def get_project_by_id(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Fetch a single project by ID (Enforces PBAC Project Visibility)."""
    authorize(current_user, Action.PROJECT_VIEW, project_id, db)
    return ProjectService.get_project_by_id(project_id=project_id, db=db)


# ==============================================================================
# TASK DEDICATED ROUTES
# ==============================================================================

@router.post(
    "/tasks",
    response_model=CreateTaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task"
)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Direct route to create a new task (Enforces PBAC Task Creation)."""
    authorize(current_user, Action.TASK_CREATE, task_data.project_id, db)
    return TaskService.create_task(
        task_data=task_data,
        current_user_id=current_user.user_id,
        db=db
    )


@router.post(
    "/tasks/{task_id}",
    response_model=UpdateTaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a task by ID"
)
def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Direct route to update an existing task (Enforces PBAC Task Update & Task Completion)."""
    task_obj = get_task(task_id, db)

    # PBAC Policy: Task Update
    authorize(current_user, Action.TASK_UPDATE, task_obj, db)

    # PBAC Policy: Task Completion (if completing task)
    if is_completion_status(task_data.status_id, db) or task_data.completed_at is not None:
        authorize(
            current_user,
            Action.TASK_COMPLETE,
            task_obj,
            db,
            context={"update_data": task_data.model_dump(exclude_unset=True)}
        )

    return TaskService.update_task(
        task_id=task_id,
        task_data=task_data,
        current_user_id=current_user.user_id,
        db=db
    )


@router.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a task by ID"
)
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Direct route to delete an existing task (Enforces PBAC Task Delete)."""
    authorize(current_user, Action.TASK_DELETE, task_id, db)
    return TaskService.delete_task(task_id=task_id, db=db)


@router.get(
    "/tasks",
    response_model=List[TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="List all tasks"
)
def list_tasks(
    project_id: Optional[UUID] = None,
    assignee_id: Optional[UUID] = None,
    status_id: Optional[UUID] = None,
    priority_id: Optional[UUID] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Fetch tasks strictly enforcing PBAC policy rules at the database query level."""
    if project_id:
        authorize(current_user, Action.PROJECT_VIEW, project_id, db)

    return TaskService.get_all_tasks(
        db=db,
        current_user_id=current_user.user_id,
        project_id=project_id,
        assignee_id=assignee_id,
        status_id=status_id,
        priority_id=priority_id,
        search=search
    )


@router.get(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get task details by ID"
)
def get_task_by_id(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Fetch a single task by ID (Enforces PBAC Task View policy)."""
    task_obj = get_task(task_id, db)
    authorize(current_user, Action.TASK_VIEW, task_obj, db)

    return TaskService.get_task_by_id(task_id=task_id, db=db)
