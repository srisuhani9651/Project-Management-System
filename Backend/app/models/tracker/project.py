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
    project_id= Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Project Details
    project_name= Column(String(255), nullable=False)
    project_description = Column(String(255), nullable=True)

    # Foreign Keys to LOV tables
    status_id= Column(UUID(as_uuid=True), ForeignKey("lov.master_status.status_id"), nullable=False)
    priority_id= Column(UUID(as_uuid=True), ForeignKey("lov.master_priority.priority_id"), nullable=False)
    project_type_id = Column(UUID(as_uuid=True), ForeignKey("lov.master_project_type.project_type_id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("lov.master_category.category_id"), nullable=False)

    # Dates and Timeline
    planned_start_date = Column(DateTime(timezone=True), nullable=False)
    planned_end_date = Column(DateTime(timezone=True), nullable=False)
    actual_start_date = Column(DateTime(timezone=True), nullable=True)
    actual_end_date = Column(DateTime(timezone=True), nullable=True)
    estimated_duration = Column(Integer, nullable=False)

    # Audit and Creator Information
    created_by = Column(UUID(as_uuid=True), ForeignKey("auth.user_master.user_id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
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

