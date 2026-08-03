import base64
import hashlib
import hmac
import struct
import time
from typing import Optional

# Server Secret Key used for HMAC hashing
SERVER_SECRET_KEY = "PROJECT_FLOW_SECURE_SERVER_SECRET_KEY_2026_TOTP"


def _derive_user_totp_secret(user_id: str, hashed_password: str) -> bytes:
    """
    Statelessly derives a unique TOTP secret for a user using server secret + user_id + hashed_password.
    No secret or OTP is ever stored in the database!
    If the user changes their password, old TOTP codes automatically become invalid.
    """
    key_material = f"{user_id}:{hashed_password}".encode("utf-8")
    return hmac.new(SERVER_SECRET_KEY.encode("utf-8"), key_material, hashlib.sha256).digest()


def generate_totp(user_id: str, hashed_password: str, time_step: int = 30) -> str:
    """
    Generates a 6-digit TOTP code for the given user for the current 30-second interval.
    """
    secret = _derive_user_totp_secret(str(user_id), str(hashed_password))
    current_time = int(time.time()) // time_step
    
    # Pack 8-byte big-endian integer of the time step
    msg = struct.pack(">Q", current_time)
    hmac_hash = hmac.new(secret, msg, hashlib.sha1).digest()
    
    # Dynamic truncation
    offset = hmac_hash[-1] & 0x0F
    code_int = struct.unpack(">I", hmac_hash[offset:offset + 4])[0] & 0x7FFFFFFF
    
    code = str(code_int % 1000000).zfill(6)
    return code


def verify_totp(user_id: str, hashed_password: str, code: str, time_step: int = 30, valid_window: int = 1) -> bool:
    """
    Verifies a 6-digit TOTP code against the current and adjacent 30-second time steps.
    """
    if not code or len(code.strip()) != 6 or not code.isdigit():
        return False

    clean_code = code.strip()
    secret = _derive_user_totp_secret(str(user_id), str(hashed_password))
    current_time = int(time.time()) // time_step

    # Check current 30-second window and adjacent windows (clock drift tolerance)
    for i in range(-valid_window, valid_window + 1):
        test_step = current_time + i
        msg = struct.pack(">Q", test_step)
        hmac_hash = hmac.new(secret, msg, hashlib.sha1).digest()
        
        offset = hmac_hash[-1] & 0x0F
        code_int = struct.unpack(">I", hmac_hash[offset:offset + 4])[0] & 0x7FFFFFFF
        generated_code = str(code_int % 1000000).zfill(6)
        
        if hmac.compare_digest(generated_code, clean_code):
            return True

    return False
