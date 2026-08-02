from datetime import datetime
import uuid
from uuid import UUID as PyUUID

from sqlalchemy import DDL, Boolean, Column, DateTime, ForeignKey, String, event, func, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped

from app.db.database import Base


class Project(Base):
    """
    WHAT IT DOES:
    Database table model for managing project details in the 'tracker' schema.

    EXPECTED RESULT:
    Maps Project instances to the 'tracker.projects' PostgreSQL table.
    """
    __tablename__ = "projects"
    __table_args__ = {"schema": "tracker"}

    # Primary Key
    project_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Project Details
    project_name: Mapped[str] = Column(String(255), nullable=False)
    project_description: Mapped[str | None] = Column(String(255), nullable=True)

    # Foreign Keys to LOV tables
    status_id: Mapped[PyUUID | None] = Column(UUID(as_uuid=True), ForeignKey("lov.master_status.status_id"), nullable=True)
    priority_id: Mapped[PyUUID | None] = Column(UUID(as_uuid=True), ForeignKey("lov.master_priority.priority_id"), nullable=True)
    project_type_id: Mapped[PyUUID | None] = Column(UUID(as_uuid=True), ForeignKey("lov.master_project_type.project_type_id"), nullable=True)
    category_id: Mapped[PyUUID | None] = Column(UUID(as_uuid=True), ForeignKey("lov.master_category.category_id"), nullable=True)

    # Dates and Timeline
    planned_start_date: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    planned_end_date: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    actual_start_date: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    actual_end_date: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    estimated_duration: Mapped[int | None] = Column(Integer, nullable=True)

    # Audit and Creator Information
    created_by: Mapped[PyUUID | None] = Column(UUID(as_uuid=True), ForeignKey("auth.user_master.user_id"), nullable=True)
    is_active: Mapped[bool] = Column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# Automatically create the 'tracker' schema if it does not exist before table creation
event.listen(
    Project.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS tracker;"),
)

