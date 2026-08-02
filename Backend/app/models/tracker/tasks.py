import uuid

from sqlalchemy import DDL, Boolean, Column, DateTime, ForeignKey, String, event, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Task(Base):
    """
    WHAT IT DOES:
    Database table model for managing task details in the 'tracker' schema.

    EXPECTED RESULT:
    Maps Task instances to the 'tracker.tasks' PostgreSQL table.
    """
    __tablename__ = "tasks"
    __table_args__ = {"schema": "tracker"}

    # Primary Key
    task_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Key to Project
    project_id = Column(UUID(as_uuid=True), ForeignKey("tracker.projects.project_id"), nullable=False)

    # Task Details
    title = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)

    # Foreign Keys to LOV and Auth tables
    status_id = Column(UUID(as_uuid=True), ForeignKey("lov.master_status.status_id"), nullable=True)
    priority_id = Column(UUID(as_uuid=True), ForeignKey("lov.master_priority.priority_id"), nullable=True)
    task_type_id = Column(UUID(as_uuid=True), ForeignKey("lov.master_task_type.task_type_id"), nullable=True)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("auth.user_master.user_id"), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("auth.user_master.user_id"), nullable=True)

    # Task Dates & Timeline
    due_date = Column(DateTime(timezone=True), nullable=True)
    estimated_time_of_completion = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Status and Timestamps
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# Automatically create the 'tracker' schema if it does not exist before table creation
event.listen(
    Task.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS tracker;"),
)