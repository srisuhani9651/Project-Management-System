import uuid

from sqlalchemy import DDL, Boolean, Column, DateTime, ForeignKey, event, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class ProjectMember(Base):
    """
    WHAT IT DOES:
    Database table model for managing project membership in the 'tracker' schema.

    EXPECTED RESULT:
    Maps ProjectMember instances to the 'tracker.project_members' PostgreSQL table.
    """
    __tablename__ = "project_members"
    __table_args__ = {"schema": "tracker"}

    # Primary Key
    project_member_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Key to Project
    project_id = Column(UUID(as_uuid=True), ForeignKey("tracker.projects.project_id"), nullable=False)

    # Foreign Key to User (Member)
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.user_master.user_id"), nullable=False)

    # Creator Information (User who added the member)
    created_by = Column(UUID(as_uuid=True), ForeignKey("auth.user_master.user_id"), nullable=True)

    # Member Status & Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# Automatically create the 'tracker' schema if it does not exist before table creation
event.listen(
    ProjectMember.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS tracker;"),
)
