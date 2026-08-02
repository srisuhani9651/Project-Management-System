import os
import re
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key_change_in_production")
EXPIRY_TIME_STR = os.getenv("EXPIRY_TIME", "1h")
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hashes a plain text password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a stored hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def parse_expiry_time(expiry_str: str) -> timedelta:
    """Parses duration strings like '1h', '30m', '1d' into timedelta."""
    if not expiry_str:
        return timedelta(hours=1)
    match = re.match(r"^(\d+)\s*([a-zA-Z]*)$", expiry_str.strip().lower())
    if not match:
        return timedelta(hours=1)
    value, unit = int(match.group(1)), match.group(2)
    units = {
        "h": "hours", "hr": "hours", "hours": "hours", "hour": "hours",
        "m": "minutes", "min": "minutes", "minutes": "minutes", "minute": "minutes",
        "d": "days", "day": "days", "days": "days",
        "s": "seconds", "sec": "seconds", "seconds": "seconds", "second": "seconds",
    }
    key = units.get(unit, "minutes")
    return timedelta(**{key: value})


def create_access_token(data: dict) -> str:
    """Encodes user payload into a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + parse_expiry_time(EXPIRY_TIME_STR)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    if isinstance(encoded_jwt, bytes):
        return encoded_jwt.decode("utf-8")
    return encoded_jwt

