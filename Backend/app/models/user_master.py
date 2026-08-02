import uuid

from sqlalchemy import DDL, Boolean, Column, DateTime, String, event, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class UserMaster(Base):
    """
    WHAT IT DOES:
    Database table model for managing user records in the 'auth' schema.

    EXPECTED RESULT:
    Maps UserMaster instances to the 'auth.user_master' PostgreSQL table.
    """
    __tablename__ = "user_master"
    __table_args__ = {"schema": "auth"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100),nullable=True )
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# Automatically create the 'auth' schema if it does not exist before table creation
event.listen(
    UserMaster.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS auth;"),
)