import re
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    """
    WHAT IT DOES: Pydantic request schema for user registration.
    EXPECTED RESULT: Validates incoming request payload for /register route.
    """
    full_name: str = Field(..., description="User's full name", min_length=1)
    email: EmailStr = Field(..., description="User's email address")
    username: Optional[str] = Field(None, description="Optional username")
    password: str = Field(..., description="Plain text password", min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter (A-Z)")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter (a-z)")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit (0-9)")
        if not re.search(r"[!@#$%^&*]", v):
            raise ValueError("Password must contain at least one special character (!@#$%^&*)")
        return v


class UserResponse(BaseModel):
    """
    WHAT IT DOES: Pydantic response schema for user details.
    EXPECTED RESULT: Formats user details in API responses.
    """
    user_id: UUID
    full_name: str
    email: str
    username: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RegisterResponse(BaseModel):
    """
    WHAT IT DOES: Response schema returned after successful registration.
    EXPECTED RESULT: Contains success message, JWT access token, and created user details.
    """
    message: str = "User registered successfully"
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserLogin(BaseModel):
    """
    WHAT IT DOES: Pydantic request schema for user login.
    EXPECTED RESULT: Validates incoming request payload for /login route.
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's plain text password")


class LoginResponse(BaseModel):
    """
    WHAT IT DOES: Response schema returned after successful authentication.
    EXPECTED RESULT: Contains success message, JWT access token, and user details.
    """
    message: str = "Login successful"
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LogoutResponse(BaseModel):
    """
    WHAT IT DOES: Response schema returned after successful logout.
    EXPECTED RESULT: Contains success message.
    """
    message: str = "Successfully logged out"


