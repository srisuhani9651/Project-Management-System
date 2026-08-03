from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.auth.user_master import UserMaster
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="", tags=["Dashboard Analytics"])


@router.get(
    "/api/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Get Unified Dashboard Telemetry for current user",
)
def get_dashboard_telemetry(
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user),
) -> Dict[str, Any]:
    return DashboardService.get_full_dashboard_telemetry(
        db=db, current_user_id=current_user.user_id  # type: ignore
    )


@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Get Unified Dashboard Telemetry (Alias)",
)
def get_dashboard_telemetry_alias(
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user),
) -> Dict[str, Any]:
    return DashboardService.get_full_dashboard_telemetry(
        db=db, current_user_id=current_user.user_id  # type: ignore
    )
