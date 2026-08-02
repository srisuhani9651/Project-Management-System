import uuid

from sqlalchemy import DDL, Boolean, Column, DateTime, String, event, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Priority(Base):
    """
    WHAT IT DOES:
    Database table model for managing priority details in the 'lov' schema.

    EXPECTED RESULT:
    Maps Priority instances to the 'lov.master_priority' PostgreSQL table.
    """
    __tablename__ = "master_priority"
    __table_args__ = {"schema": "lov"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    priority_name = Column(String(255), nullable=False)
    priority_description = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# Automatically create the 'auth' schema if it does not exist before table creation
event.listen(
    Priority.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS lov;"),
)