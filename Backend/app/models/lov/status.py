import uuid

from sqlalchemy import DDL, Boolean, Column, DateTime, String, event, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Status(Base):
    """
    WHAT IT DOES:
    Database table model for managing status details in the 'lov' schema.

    EXPECTED RESULT:
    Maps Status instances to the 'lov.master_status' PostgreSQL table.
    """
    __tablename__ = "master_status"
    __table_args__ = {"schema": "lov"}

    status_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status_name = Column(String(255), nullable=False)
    status_description = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# Automatically create the 'auth' schema if it does not exist before table creation
event.listen(
    Status.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS lov;"),
)