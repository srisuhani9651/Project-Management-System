from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.auth.user_master import UserMaster
from app.utils.security import ALGORITHM, SECRET_KEY

security_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> UserMaster:
    """
    Middleware/Dependency to authenticate requests using JWT Bearer Token.
    1. Extracts Bearer token from HTTP Authorization header.
    2. Decodes and verifies JWT signature and expiration.
    3. Retrieves and returns authenticated UserMaster object from DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(UserMaster).filter(UserMaster.user_id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    return user
