from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.auth.user_master import UserMaster
from app.services.schemas.user import (
    LoginResponse,
    LogoutResponse,
    RegisterResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.utils.security import create_access_token, hash_password, verify_password


class AuthService:
    @staticmethod
    def register_new_user(user_data: UserRegister, db: Session) -> RegisterResponse:
       
        existing_user = db.query(UserMaster).filter(UserMaster.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        hashed_pwd = hash_password(user_data.password)

        new_user = UserMaster(
            full_name=user_data.full_name,
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_pwd
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        access_token = create_access_token(
            data={"sub": str(new_user.user_id), "email": new_user.email}
        )

        return RegisterResponse(
            message="User registered successfully",
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user)
        )

    @staticmethod
    def login_user(login_data: UserLogin, db: Session) -> LoginResponse:
        """
        Business logic for user login:
        1. Checks if a user with the given email exists.
        2. Verifies the password hash against the stored hash.
        3. Returns HTTP 401 Unauthorized if email doesn't exist or password is wrong.
        4. Generates and returns a signed JWT access token upon successful verification.
        """
        user = db.query(UserMaster).filter(UserMaster.email == login_data.email).first()
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(
            data={"sub": str(user.user_id), "email": user.email}
        )

        return LoginResponse(
            message="Login successful",
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    @staticmethod
    def logout_user() -> LogoutResponse:
        """
        Business logic for user logout:
        Confirms successful user logout.
        """
        return LogoutResponse(message="Successfully logged out")
