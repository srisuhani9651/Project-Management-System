import uuid

from sqlalchemy import DDL, Boolean, Column, DateTime, String, event, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Category(Base):
    """
    WHAT IT DOES:
    Database table model for managing Category details in the 'lov' schema.

    EXPECTED RESULT:
    Maps Category instances to the 'lov.master_category' PostgreSQL table.
    """
    __tablename__ = "master_category"
    __table_args__ = {"schema": "lov"}

    category_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# Automatically create the 'lov' schema if it does not exist before table creation
event.listen(
    Category.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS lov;"),
)