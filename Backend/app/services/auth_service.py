from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.auth.user_master import UserMaster
from app.services.schemas.user import RegisterResponse, UserRegister, UserResponse
from app.utils.security import create_access_token, hash_password


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
