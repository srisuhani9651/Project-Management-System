from typing import Any, List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.auth.user_master import UserMaster
from app.models.lov.priority import Priority
from app.models.lov.status import Status
from app.models.lov.task_type import TaskType
from app.models.tracker.project import Project
from app.models.tracker.tasks import Task
from app.services.schemas.task import (
    CreateTaskResponse,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
    UpdateTaskResponse,
)


class TaskService:
    @staticmethod
    def create_task(
        task_data: TaskCreate,
        current_user_id: Any,
        db: Session
    ) -> CreateTaskResponse:
        """Business logic to create a new Task record."""
        # Verify parent project exists
        project = db.query(Project).filter(
            Project.project_id == task_data.project_id,
            Project.is_active == True
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent project with ID '{task_data.project_id}' not found."
            )

        new_task = Task(
            project_id=task_data.project_id,
            title=task_data.title,
            description=task_data.description,
            status_id=task_data.status_id,
            priority_id=task_data.priority_id,
            task_type_id=task_data.task_type_id,
            assignee_id=task_data.assignee_id,
            created_by=current_user_id,
            due_date=task_data.due_date,
            completed_at=task_data.completed_at,
            is_active=True
        )

        db.add(new_task)
        db.commit()
        db.refresh(new_task)

        task_res = TaskService._format_task_response(new_task, db)

        return CreateTaskResponse(
            message="Task created successfully",
            task=task_res
        )

    @staticmethod
    def update_task(
        task_id: Any,
        task_data: TaskUpdate,
        current_user_id: Any,
        db: Session
    ) -> UpdateTaskResponse:
        """Business logic to update an existing Task record."""
        task = db.query(Task).filter(
            Task.task_id == task_id,
            Task.is_active == True
        ).first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID '{task_id}' not found."
            )

        update_dict = task_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(task, key, value)

        db.commit()
        db.refresh(task)

        task_res = TaskService._format_task_response(task, db)

        return UpdateTaskResponse(
            message="Task updated successfully",
            task=task_res
        )

    @staticmethod
    def get_all_tasks(project_id: Optional[Any], db: Session) -> List[TaskResponse]:
        """Retrieves active tasks, optionally filtered by project_id."""
        query = db.query(Task).filter(Task.is_active == True)
        if project_id:
            query = query.filter(Task.project_id == project_id)

        tasks = query.order_by(Task.created_at.desc()).all()
        return [TaskService._format_task_response(t, db) for t in tasks]

    @staticmethod
    def get_task_by_id(task_id: Any, db: Session) -> TaskResponse:
        """Retrieves a single task by ID."""
        task = db.query(Task).filter(
            Task.task_id == task_id,
            Task.is_active == True
        ).first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID '{task_id}' not found."
            )

        return TaskService._format_task_response(task, db)

    @staticmethod
    def _format_task_response(task: Any, db: Session) -> TaskResponse:
        """Helper to format Task ORM model with populated LOV and User names."""
        status_name = None
        priority_name = None
        task_type_name = None
        assignee_name = None

        if task.status_id:
            st = db.query(Status).filter(Status.status_id == task.status_id).first()
            if st:
                status_name = st.status_name  # type: ignore

        if task.priority_id:
            pr = db.query(Priority).filter(Priority.priority_id == task.priority_id).first()
            if pr:
                priority_name = pr.priority_name  # type: ignore

        if task.task_type_id:
            tt = db.query(TaskType).filter(TaskType.task_type_id == task.task_type_id).first()
            if tt:
                task_type_name = tt.type_name  # type: ignore

        if task.assignee_id:
            usr = db.query(UserMaster).filter(UserMaster.user_id == task.assignee_id).first()
            if usr:
                assignee_name = usr.full_name  # type: ignore

        return TaskResponse(
            task_id=task.task_id,  # type: ignore
            project_id=task.project_id,  # type: ignore
            title=task.title,  # type: ignore
            description=task.description,  # type: ignore
            status_id=task.status_id,  # type: ignore
            status_name=status_name,
            priority_id=task.priority_id,  # type: ignore
            priority_name=priority_name,
            task_type_id=task.task_type_id,  # type: ignore
            task_type_name=task_type_name,
            assignee_id=task.assignee_id,  # type: ignore
            assignee_name=assignee_name,
            created_by=task.created_by,  # type: ignore
            due_date=task.due_date,  # type: ignore
            completed_at=task.completed_at,  # type: ignore
            is_active=task.is_active,  # type: ignore
            created_at=task.created_at,  # type: ignore
            updated_at=task.updated_at,  # type: ignore
        )
