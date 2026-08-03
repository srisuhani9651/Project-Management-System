import hashlib
import jwt
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.auth.user_master import UserMaster
from app.services.email_service import EmailService
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
from app.utils.security import (
    create_access_token,
    create_password_reset_token,
    decode_password_reset_token,
    hash_password,
    verify_password,
)
from app.utils.totp import generate_totp, verify_totp


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

    @staticmethod
    def forgot_password(request_data: ForgotPasswordRequest, db: Session) -> ForgotPasswordResponse:
        """
        Step 1: Generates a stateless 30-second TOTP code (derived from the user's
        id + current password hash + a server secret — never stored anywhere) and
        emails it to the user. Always returns the same generic message regardless
        of whether the email exists, to avoid leaking account existence.
        """
        generic_response = ForgotPasswordResponse()
        clean_email = request_data.email.strip().lower()
        user = db.query(UserMaster).filter(func.lower(UserMaster.email) == clean_email).first()

        if not user:
            return generic_response

        try:
            code = generate_totp(str(user.user_id), str(user.hashed_password))
            EmailService.send_password_reset_email(
                to_email=str(user.email),
                user_name=str(user.full_name),
                code=code,
            )
        except Exception:
            # Never let email/delivery issues surface as a distinguishable error —
            # keeps the endpoint's response uniform and non-enumerable.
            pass

        return generic_response

    @staticmethod
    def verify_reset_code(request_data: VerifyResetCodeRequest, db: Session) -> VerifyResetCodeResponse:
        """
        Step 2: Verifies the 6-digit TOTP code against the current +/- 30s window.
        On success, issues a short-lived signed reset token (Step 3 uses this
        instead of the OTP, since the OTP itself may have already expired).
        """
        invalid_exc = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please request a new one.",
        )

        clean_email = request_data.email.strip().lower()
        user = db.query(UserMaster).filter(func.lower(UserMaster.email) == clean_email).first()
        if not user:
            raise invalid_exc

        if not verify_totp(str(user.user_id), str(user.hashed_password), request_data.code):
            raise invalid_exc

        reset_token = create_password_reset_token(
            user_id=str(user.user_id),
            email=str(user.email),
            hashed_password=str(user.hashed_password),
        )

        return VerifyResetCodeResponse(reset_token=reset_token)

    @staticmethod
    def reset_password(request_data: ResetPasswordRequest, db: Session) -> ResetPasswordResponse:
        """Step 3: Validates the short-lived reset token and sets the new password."""
        invalid_exc = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset session. Please restart the password reset process.",
        )

        try:
            payload = decode_password_reset_token(request_data.reset_token)
        except jwt.PyJWTError:
            raise invalid_exc

        clean_email = request_data.email.strip().lower()
        if payload.get("email") != clean_email:
            raise invalid_exc

        user = db.query(UserMaster).filter(func.lower(UserMaster.email) == clean_email).first()
        if not user or str(user.user_id) != str(payload.get("sub")):
            raise invalid_exc

        # Fingerprint check: token was minted against the password hash at verify-time.
        # If the password already changed since (e.g. token replay), this rejects it.
        current_fp = hashlib.sha256(str(user.hashed_password).encode("utf-8")).hexdigest()[:16]
        if payload.get("pwd_fp") != current_fp:
            raise invalid_exc

        user.hashed_password = hash_password(request_data.new_password)
        db.commit()

        return ResetPasswordResponse()
