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
    UserResponse,
    UserUpdateSettings,
    UpdateSettingsResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


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
    return AuthService.logout_user()


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile (Authenticated)",
    description="Returns profile information for the authenticated user."
)
def get_me(
    current_user: UserMaster = Depends(get_current_user)
):
    return UserResponse.model_validate(current_user)


@router.put(
    "/settings",
    response_model=UpdateSettingsResponse,
    status_code=status.HTTP_200_OK,
    summary="Update User Settings & Password (Authenticated)",
    description="Updates user profile, preferred username ('What should we call you?'), and resets password."
)
def update_user_settings(
    settings_data: UserUpdateSettings,
    current_user: UserMaster = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AuthService.update_user_settings(current_user=current_user, settings_data=settings_data, db=db)
