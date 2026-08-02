import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DDL, Boolean, Column, DateTime, String, event, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped

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

    user_id= Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    full_name= Column(String(255), nullable=False)  # type: ignore
    email= Column(String(255), unique=True, nullable=False)  # type: ignore
    username= Column(String(100), nullable=True)  # type: ignore
    hashed_password= Column(String(255), nullable=False)  # type: ignore
    created_at= Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at= Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )  # type: ignore


# Automatically create the 'auth' schema if it does not exist before table creation
event.listen(
    UserMaster.__table__,
    "before_create",
    DDL("CREATE SCHEMA IF NOT EXISTS auth;"),
)