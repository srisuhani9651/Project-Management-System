from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

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
# UNIFIED DYNAMIC POST ROUTE WITH PATH VARIABLE DIFFERENTIATOR
# ==============================================================================

@router.post(
    "/api/manage/{entity_type}",
    status_code=status.HTTP_201_CREATED,
    summary="Unified Create API (Path variable differentiator: 'project' or 'task')",
    description="Creates a new Project or Task depending on the '{entity_type}' path variable ('project' or 'task')."
)
def manage_create_entity(
    entity_type: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
) -> Any:
    """
    Unified POST handler for CREATING entities.
    - entity_type = 'project' or 'projects' -> Creates a new project
    - entity_type = 'task' or 'tasks' -> Creates a new task
    """
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
    description="Updates an existing Project or Task depending on '{entity_type}' path variable and '{entity_id}'."
)
def manage_update_entity(
    entity_type: str,
    entity_id: UUID,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
) -> Any:
    """
    Unified POST handler for UPDATING entities.
    - entity_type = 'project' or 'projects' -> Updates project with entity_id
    - entity_type = 'task' or 'tasks' -> Updates task with entity_id
    """
    entity = entity_type.lower().strip()

    if entity in ("project", "projects"):
        try:
            project_data = ProjectUpdate.model_validate(payload)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid payload for project update: {str(e)}"
            )
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
    """Direct route to update an existing project."""
    return ProjectService.update_project(
        project_id=project_id,
        project_data=project_data,
        current_user_id=current_user.user_id,
        db=db
    )


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
    """Fetch all projects created by current user."""
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
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Fetch a single project by ID."""
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
    """Direct route to create a new task."""
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
    """Direct route to update an existing task."""
    return TaskService.update_task(
        task_id=task_id,
        task_data=task_data,
        current_user_id=current_user.user_id,
        db=db
    )


@router.get(
    "/tasks",
    response_model=List[TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="List all tasks"
)
def list_tasks(
    project_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Fetch all tasks, optionally filtered by project_id."""
    return TaskService.get_all_tasks(project_id=project_id, db=db)


@router.get(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get task details by ID"
)
def get_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Fetch a single task by ID."""
    return TaskService.get_task_by_id(task_id=task_id, db=db)
