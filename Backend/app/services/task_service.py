from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.auth.user_master import UserMaster
from app.models.lov.category import Category
from app.models.lov.priority import Priority
from app.models.lov.project_type import ProjectType
from app.models.lov.status import Status
from app.models.lov.task_type import TaskType
from app.models.tracker.project import Project
from app.models.tracker.project_members import ProjectMember
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
        # 1. Verify parent project exists
        project = db.query(Project).filter(
            Project.project_id == task_data.project_id,
            Project.is_active == True
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent project with ID '{task_data.project_id}' not found."
            )

        # 2. Verify assignee_id exists in auth.user_master if specified
        if task_data.assignee_id:
            assignee = db.query(UserMaster).filter(UserMaster.user_id == task_data.assignee_id).first()
            if not assignee:
                task_data.assignee_id = current_user_id
        else:
            task_data.assignee_id = current_user_id

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

        # Auto-add assigned user to project_members table if not already present
        TaskService._ensure_assignee_is_project_member(new_task.project_id, new_task.assignee_id, db)

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

        # Auto-sync completed_at if status_id is updated but completed_at is not explicitly set
        if "status_id" in update_dict and "completed_at" not in update_dict:
            st = db.query(Status).filter(Status.status_id == task.status_id).first()
            if st:
                s_name = str(st.status_name).lower()
                if s_name in ("completed", "done"):
                    from datetime import datetime, timezone
                    task.completed_at = datetime.now(timezone.utc)
                else:
                    task.completed_at = None

        db.commit()
        db.refresh(task)

        # Auto-add assigned user to project_members table if not already present
        TaskService._ensure_assignee_is_project_member(task.project_id, task.assignee_id, db)

        task_res = TaskService._format_task_response(task, db)

        return UpdateTaskResponse(
            message="Task updated successfully",
            task=task_res
        )

    @staticmethod
    def _ensure_assignee_is_project_member(project_id: Any, assignee_id: Any, db: Session):
        """Ensures the assigned user is an active member in tracker.project_members for project_id."""
        if not project_id or not assignee_id:
            return

        try:
            member = db.query(ProjectMember).filter(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == assignee_id
            ).first()

            if not member:
                new_member = ProjectMember(project_id=project_id, user_id=assignee_id, is_active=True)
                db.add(new_member)
                db.commit()
            elif not member.is_active:
                member.is_active = True
                db.commit()
        except Exception:
            db.rollback()

    @staticmethod
    def delete_task(task_id: Any, db: Session) -> Dict[str, Any]:
        """Business logic to soft-delete a task."""
        task = db.query(Task).filter(
            Task.task_id == task_id,
            Task.is_active == True
        ).first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID '{task_id}' not found."
            )

        task.is_active = False
        db.commit()

        return {"message": f"Task '{task_id}' deleted successfully"}

    @staticmethod
    def get_all_tasks(
        db: Session,
        current_user_id: Optional[Any] = None,
        project_id: Optional[Any] = None,
        assignee_id: Optional[Any] = None,
        status_id: Optional[Any] = None,
        priority_id: Optional[Any] = None,
        search: Optional[str] = None,
    ) -> List[TaskResponse]:
        """
        Retrieves active tasks strictly filtered by PBAC policy rules at the database query level:
        - Project Owner (Project.created_by == current_user_id): can view ALL tasks in their projects.
        - Non-owner Project Member: can ONLY view tasks assigned to or created by them.
        """
        query = db.query(Task).filter(Task.is_active == True)

        if project_id:
            query = query.filter(Task.project_id == project_id)  # type: ignore
        elif current_user_id:
            # Global task query for user: All tasks in projects they own or are member of + tasks assigned to or created by them
            owned_or_member_proj_ids = {
                p[0]
                for p in db.query(Project.project_id).filter(
                    Project.created_by == current_user_id,
                    Project.is_active == True
                ).all()
            } | {
                pm[0]
                for pm in db.query(ProjectMember.project_id).filter(
                    ProjectMember.user_id == current_user_id,
                    ProjectMember.is_active == True
                ).all()
            }

            query = query.filter(
                or_(
                    Task.project_id.in_(owned_or_member_proj_ids),  # type: ignore
                    Task.assignee_id == current_user_id,  # type: ignore
                    Task.created_by == current_user_id  # type: ignore
                )
            )

        if assignee_id:
            query = query.filter(Task.assignee_id == assignee_id)  # type: ignore

        if status_id:
            query = query.filter(Task.status_id == status_id)  # type: ignore

        if priority_id:
            query = query.filter(Task.priority_id == priority_id)  # type: ignore

        if search and search.strip():
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_pattern),  # type: ignore
                    Task.description.ilike(search_pattern)  # type: ignore
                )
            )

        tasks = query.order_by(Task.created_at.desc()).all()  # type: ignore
        return TaskService._format_tasks_list(tasks, db)

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
    def _format_tasks_list(tasks: List[Any], db: Session) -> List[TaskResponse]:
        """Batch-loads all LOVs, Projects, and User names to format TaskResponse list with zero N+1 queries."""
        if not tasks:
            return []

        project_ids = {t.project_id for t in tasks if t.project_id}
        status_ids = {t.status_id for t in tasks if t.status_id}
        priority_ids = {t.priority_id for t in tasks if t.priority_id}
        task_type_ids = {t.task_type_id for t in tasks if t.task_type_id}
        user_ids = ({t.assignee_id for t in tasks if t.assignee_id} | 
                    {t.created_by for t in tasks if t.created_by})

        projects = {p.project_id: (p.project_name, p.created_by) for p in db.query(Project).filter(Project.project_id.in_(project_ids)).all()} if project_ids else {}
        statuses = {s.status_id: s.status_name for s in db.query(Status).filter(Status.status_id.in_(status_ids)).all()} if status_ids else {}
        priorities = {p.priority_id: p.priority_name for p in db.query(Priority).filter(Priority.priority_id.in_(priority_ids)).all()} if priority_ids else {}
        task_types = {tt.task_type_id: tt.type_name for tt in db.query(TaskType).filter(TaskType.task_type_id.in_(task_type_ids)).all()} if task_type_ids else {}
        users = {u.user_id: u.full_name for u in db.query(UserMaster).filter(UserMaster.user_id.in_(user_ids)).all()} if user_ids else {}

        res = []
        for task in tasks:
            p_info = projects.get(task.project_id)
            res.append(
                TaskResponse(
                    task_id=task.task_id,  # type: ignore
                    project_id=task.project_id,  # type: ignore
                    project_name=p_info[0] if p_info else None,
                    project_owner_id=p_info[1] if p_info else None,
                    title=task.title,  # type: ignore
                    description=task.description,  # type: ignore
                    status_id=task.status_id,  # type: ignore
                    status_name=statuses.get(task.status_id),
                    priority_id=task.priority_id,  # type: ignore
                    priority_name=priorities.get(task.priority_id),
                    task_type_id=task.task_type_id,  # type: ignore
                    task_type_name=task_types.get(task.task_type_id),
                    assignee_id=task.assignee_id,  # type: ignore
                    assignee_name=users.get(task.assignee_id),
                    created_by=task.created_by,  # type: ignore
                    creator_name=users.get(task.created_by),
                    created_by_name=users.get(task.created_by),
                    due_date=task.due_date,  # type: ignore
                    completed_at=task.completed_at,  # type: ignore
                    is_active=task.is_active,  # type: ignore
                    created_at=task.created_at,  # type: ignore
                    updated_at=task.updated_at,  # type: ignore
                )
            )
        return res

    @staticmethod
    def _format_task_response(task: Any, db: Session) -> TaskResponse:
        """Helper to format single Task ORM model."""
        return TaskService._format_tasks_list([task], db)[0]
