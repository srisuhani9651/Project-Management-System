from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    """Schema for creating a project."""
    project_name: str = Field(..., min_length=1, max_length=255, description="Name of the project (Mandatory)")
    status_id: UUID = Field(..., description="Status ID (Mandatory)")
    priority_id: UUID = Field(..., description="Priority ID (Mandatory)")
    project_type_id: UUID = Field(..., description="Project Type ID (Mandatory)")
    category_id: UUID = Field(..., description="Category ID (Mandatory)")
    planned_start_date: datetime = Field(..., description="Planned start date (Mandatory)")
    planned_end_date: datetime = Field(..., description="Planned end date (Mandatory)")
    estimated_duration: int = Field(..., ge=1, description="Estimated duration in days (Mandatory)")
    project_description: Optional[str] = Field(None, max_length=255, description="Description of the project (Optional)")
    actual_start_date: Optional[datetime] = Field(None, description="Actual start date (Optional)")
    actual_end_date: Optional[datetime] = Field(None, description="Actual end date (Optional)")


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    project_name: Optional[str] = Field(None, min_length=1, max_length=255)
    project_description: Optional[str] = None
    status_id: Optional[UUID] = None
    priority_id: Optional[UUID] = None
    project_type_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    is_active: Optional[bool] = None


class ProjectResponse(BaseModel):
    """Schema for returning project details."""
    project_id: UUID
    project_name: str
    project_description: Optional[str] = None
    status_id: Optional[UUID] = None
    status_name: Optional[str] = None
    priority_id: Optional[UUID] = None
    priority_name: Optional[str] = None
    project_type_id: Optional[UUID] = None
    project_type_name: Optional[str] = None
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    total_tasks: int = 0
    completed_tasks: int = 0
    pending_tasks: int = 0
    progress: int = 0
    created_by: Optional[UUID] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CreateProjectResponse(BaseModel):
    message: str = "Project created successfully"
    project: ProjectResponse


class UpdateProjectResponse(BaseModel):
    message: str = "Project updated successfully"
    project: ProjectResponse


class LOVItem(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class ProjectLOVResponse(BaseModel):
    statuses: List[LOVItem]
    priorities: List[LOVItem]
    project_types: List[LOVItem]
    categories: List[LOVItem]
    task_types: List[LOVItem] = []
