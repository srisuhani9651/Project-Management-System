from typing import Any, List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.tracker.project import Project
from app.models.lov.category import Category
from app.models.lov.priority import Priority
from app.models.lov.project_type import ProjectType
from app.models.lov.status import Status
from app.models.lov.task_type import TaskType
from app.services.schemas.project import (
    CreateProjectResponse,
    LOVItem,
    ProjectCreate,
    ProjectLOVResponse,
    ProjectResponse,
    ProjectUpdate,
    UpdateProjectResponse,
)


class ProjectService:
    @staticmethod
    def get_lov_options(db: Session) -> ProjectLOVResponse:
        """Retrieves database List of Values (LOV) options for project setup."""
        statuses = [
            LOVItem(id=s.status_id, name=s.status_name)  
            for s in db.query(Status).filter(Status.is_active == True).all()
        ]
        priorities = [
            LOVItem(id=p.priority_id, name=p.priority_name)  
            for p in db.query(Priority).filter(Priority.is_active == True).all()
        ]
        project_types = [
            LOVItem(id=pt.project_type_id, name=pt.type_name)  
            for pt in db.query(ProjectType).filter(ProjectType.is_active == True).all()
        ]
        categories = [
            LOVItem(id=c.category_id, name=c.category_name) 
            for c in db.query(Category).filter(Category.is_active == True).all()
        ]
        task_types = [
            LOVItem(id=tt.task_type_id, name=tt.type_name) 
            for tt in db.query(TaskType).filter(TaskType.is_active == True).all()
        ]

        return ProjectLOVResponse(
            statuses=statuses,
            priorities=priorities,
            project_types=project_types,
            categories=categories,
            task_types=task_types,
        )

    @staticmethod
    def create_project(
        project_data: ProjectCreate,
        current_user_id: Any,
        db: Session
    ) -> CreateProjectResponse:
        """Business logic to create a new Project record."""
        existing = db.query(Project).filter(
            Project.project_name == project_data.project_name,
            Project.created_by == current_user_id,
            Project.is_active == True
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A project with this name already exists."
            )

        new_project = Project(
            project_name=project_data.project_name,
            project_description=project_data.project_description,
            status_id=project_data.status_id,
            priority_id=project_data.priority_id,
            project_type_id=project_data.project_type_id,
            category_id=project_data.category_id,
            planned_start_date=project_data.planned_start_date,
            planned_end_date=project_data.planned_end_date,
            actual_start_date=project_data.actual_start_date,
            actual_end_date=project_data.actual_end_date,
            estimated_duration=project_data.estimated_duration,
            created_by=current_user_id,
            is_active=True
        )

        db.add(new_project)
        db.commit()
        db.refresh(new_project)

        project_res = ProjectService._format_project_response(new_project, db)

        return CreateProjectResponse(
            message="Project created successfully",
            project=project_res
        )

    @staticmethod
    def update_project(
        project_id: Any,
        project_data: ProjectUpdate,
        current_user_id: Any,
        db: Session
    ) -> UpdateProjectResponse:
        """Business logic to update an existing Project record."""
        project = db.query(Project).filter(
            Project.project_id == project_id,
            Project.is_active == True
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found."
            )

        update_dict = project_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(project, key, value)

        db.commit()
        db.refresh(project)

        project_res = ProjectService._format_project_response(project, db)

        return UpdateProjectResponse(
            message="Project updated successfully",
            project=project_res
        )

    @staticmethod
    def get_all_projects(current_user_id: Any, db: Session) -> List[ProjectResponse]:
        """Retrieves all active projects created by the user."""
        projects = db.query(Project).filter(
            Project.created_by == current_user_id,
            Project.is_active == True
        ).order_by(Project.created_at.desc()).all()

        return [ProjectService._format_project_response(p, db) for p in projects]

    @staticmethod
    def get_project_by_id(project_id: Any, db: Session) -> ProjectResponse:
        """Retrieves a single project by ID."""
        project = db.query(Project).filter(
            Project.project_id == project_id,
            Project.is_active == True
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found."
            )

        return ProjectService._format_project_response(project, db)

    @staticmethod
    def _format_project_response(project: Any, db: Session) -> ProjectResponse:
        """Helper to format Project ORM model with populated LOV names."""
        status_name = None
        priority_name = None
        project_type_name = None
        category_name = None

        if project.status_id:
            st = db.query(Status).filter(Status.status_id == project.status_id).first()
            if st:
                status_name = st.status_name 

        if project.priority_id:
            pr = db.query(Priority).filter(Priority.priority_id == project.priority_id).first()
            if pr:
                priority_name = pr.priority_name

        if project.project_type_id:
            pt = db.query(ProjectType).filter(ProjectType.project_type_id == project.project_type_id).first()
            if pt:
                project_type_name = pt.type_name

        if project.category_id:
            cat = db.query(Category).filter(Category.category_id == project.category_id).first()
            if cat:
                category_name = cat.category_name

        return ProjectResponse(
            project_id=project.project_id,  
            project_name=project.project_name,  
            project_description=project.project_description,  
            status_id=project.status_id,  
            status_name=status_name,
            priority_id=project.priority_id,  
            priority_name=priority_name,
            project_type_id=project.project_type_id,  
            project_type_name=project_type_name,
            category_id=project.category_id,  
            category_name=category_name,
            planned_start_date=project.planned_start_date, 
            planned_end_date=project.planned_end_date, 
            actual_start_date=project.actual_start_date, 
            actual_end_date=project.actual_end_date, 
            estimated_duration=project.estimated_duration,  
            created_by=project.created_by, 
            is_active=project.is_active, 
            created_at=project.created_at,  
            updated_at=project.updated_at,  
        )
