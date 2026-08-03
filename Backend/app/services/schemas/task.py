from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """Schema for creating a task."""
    project_id: UUID = Field(..., description="ID of the project this task belongs to (Mandatory)")
    title: str = Field(..., min_length=1, max_length=255, description="Title of the task (Mandatory)")
    status_id: UUID = Field(..., description="Status ID (Mandatory)")
    priority_id: UUID = Field(..., description="Priority ID (Mandatory)")
    task_type_id: UUID = Field(..., description="Task Type ID (Mandatory)")
    assignee_id: UUID = Field(..., description="Assignee User ID (Mandatory)")
    due_date: datetime = Field(..., description="Due date (Mandatory)")
    description: Optional[str] = Field(None, max_length=255, description="Description of the task (Optional)")
    completed_at: Optional[datetime] = Field(None, description="Completion date (Optional)")


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    project_id: Optional[UUID] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status_id: Optional[UUID] = None
    priority_id: Optional[UUID] = None
    task_type_id: Optional[UUID] = None
    assignee_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class TaskResponse(BaseModel):
    """Schema for returning task details."""
    task_id: UUID
    project_id: UUID
    project_name: Optional[str] = None
    project_owner_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    status_id: Optional[UUID] = None
    status_name: Optional[str] = None
    priority_id: Optional[UUID] = None
    priority_name: Optional[str] = None
    task_type_id: Optional[UUID] = None
    task_type_name: Optional[str] = None
    assignee_id: Optional[UUID] = None
    assignee_name: Optional[str] = None
    created_by: Optional[UUID] = None
    creator_name: Optional[str] = None
    created_by_name: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CreateTaskResponse(BaseModel):
    message: str = "Task created successfully"
    task: TaskResponse


class UpdateTaskResponse(BaseModel):
    message: str = "Task updated successfully"
    task: TaskResponse
