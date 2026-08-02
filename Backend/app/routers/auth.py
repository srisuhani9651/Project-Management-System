from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.schemas.user import RegisterResponse, UserRegister
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
