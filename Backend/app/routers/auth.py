from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.auth.user_master import UserMaster
from app.services.schemas.user import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginResponse,
    LogoutResponse,
    RegisterResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    UserUpdateSettings,
    UpdateSettingsResponse,
    VerifyResetCodeRequest,
    VerifyResetCodeResponse,
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


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Request a password reset code (Unauthenticated)",
    description=(
        "Generates a stateless 6-digit TOTP code (valid for 30 seconds), derived from the user's "
        "id + current password hash + a server secret via HMAC — never persisted to the database — "
        "and emails it to the user."
    )
)
def forgot_password(
    request_data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return AuthService.forgot_password(request_data=request_data, db=db)


@router.post(
    "/verify-reset-code",
    response_model=VerifyResetCodeResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify the 6-digit TOTP reset code (Unauthenticated)",
    description="Verifies the code against the current +/- 30s TOTP window and issues a short-lived reset token."
)
def verify_reset_code(
    request_data: VerifyResetCodeRequest,
    db: Session = Depends(get_db)
):
    return AuthService.verify_reset_code(request_data=request_data, db=db)


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Set a new password using a verified reset token (Unauthenticated)",
    description="Validates the short-lived reset token issued by /auth/verify-reset-code and updates the password."
)
def reset_password(
    request_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    return AuthService.reset_password(request_data=request_data, db=db)
