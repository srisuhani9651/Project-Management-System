import uuid

from sqlalchemy import DDL, Boolean, Column, DateTime, String, event, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class ProjectType(Base):
    """
    WHAT IT DOES:
    Database table model for managing project type details in the 'lov' schema.

    EXPECTED RESULT:
    Maps ProjectType instances to the 'lov.master_project_type' PostgreSQL table.
    """
    __tablename__ = "master_project_type"
    __table_args__ = {"schema": "lov"}

    project_type_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type_name = Column(String(255), nullable=False)
    type_description = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# Automatically create the 'lov' schema if it does not exist before table creation
event.listen(
    ProjectType.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS lov;"),
)
