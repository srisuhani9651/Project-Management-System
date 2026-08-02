# Models package initializer
# WHAT IT DOES: Defines public exports for the models package.
# EXPECTED RESULT: Enables clean imports directly from 'app.models'.
from app.models.user_master import UserMaster

__all__ = ["UserMaster"]

