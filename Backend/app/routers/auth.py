from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.auth.user_master import UserMaster
from app.services.schemas.user import (
    LoginResponse,
    LogoutResponse,
    RegisterResponse,
    UserLogin,
    UserRegister,
)
from app.services.auth_service import AuthService

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user (Unauthenticated)",
    description="Registers a new user, hashes the password, saves to the database, and returns a JWT access token."
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Route handler for user registration.
    Delegates all business logic & controller operations to AuthService.
    """
    return AuthService.register_new_user(user_data=user_data, db=db)


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login user (Unauthenticated)",
    description="Authenticates user with email and password, returning a JWT access token."
)
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Route handler for user login.
    Delegates authentication logic to AuthService.
    """
    return AuthService.login_user(login_data=login_data, db=db)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout user (Authenticated)",
    description="Logs out the currently authenticated user."
)
def logout_user(
    current_user: UserMaster = Depends(get_current_user)
):
    """
    Route handler for user logout.
    Requires Bearer token in Authorization header.
    """
    return AuthService.logout_user()
