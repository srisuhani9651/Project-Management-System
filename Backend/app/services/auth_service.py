from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

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
from app.utils.security import create_access_token, hash_password, verify_password


class AuthService:
    @staticmethod
    def register_new_user(user_data: UserRegister, db: Session) -> RegisterResponse:
        clean_email = user_data.email.strip().lower()
        existing_user = db.query(UserMaster).filter(func.lower(UserMaster.email) == clean_email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        hashed_pwd = hash_password(user_data.password)

        new_user = UserMaster(
            full_name=user_data.full_name.strip(),
            email=clean_email,
            username=user_data.username.strip() if user_data.username else None,
            hashed_password=hashed_pwd
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        access_token = create_access_token(
            data={"sub": str(new_user.user_id), "email": str(new_user.email)}
        )

        return RegisterResponse(
            message="User registered successfully",
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user)
        )

    @staticmethod
    def login_user(login_data: UserLogin, db: Session) -> LoginResponse:
        clean_email = login_data.email.strip().lower()
        user = db.query(UserMaster).filter(func.lower(UserMaster.email) == clean_email).first()
        if user:
            is_valid = verify_password(login_data.password, str(user.hashed_password))
        else:
            is_valid = False

        if not user or not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(
            data={"sub": str(user.user_id), "email": str(user.email)}
        )

        return LoginResponse(
            message="Login successful",
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    @staticmethod
    def logout_user() -> LogoutResponse:
        return LogoutResponse(message="Successfully logged out")

    @staticmethod
    def update_user_settings(current_user, settings_data: UserUpdateSettings, db: Session) -> UpdateSettingsResponse:
        # Check password reset request
        if settings_data.new_password:
            if not settings_data.current_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required to set a new password."
                )
            if not verify_password(settings_data.current_password, str(current_user.hashed_password)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect current password provided."
                )
            current_user.hashed_password = hash_password(settings_data.new_password)

        # Update full name
        if settings_data.full_name is not None and settings_data.full_name.strip() != "":
            current_user.full_name = settings_data.full_name.strip()

        # Update preferred username ("What should we call you?")
        if settings_data.username is not None:
            current_user.username = settings_data.username.strip()

        db.commit()
        db.refresh(current_user)

        return UpdateSettingsResponse(
            message="Settings updated successfully",
            user=UserResponse.model_validate(current_user)
        )
