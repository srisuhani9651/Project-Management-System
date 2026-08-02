from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="", tags=["Dashboard Analytics"])


@router.get(
    "/api/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Get Single Unified Dashboard Telemetry API",
    description="Returns all dynamic metrics (Pending Tasks, Task Distribution by Project, Time Analytics, and Productivity Insights) calculated directly from PostgreSQL project & task data."
)
def get_dashboard_telemetry(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Single unified API returning live, dynamic dashboard data.
    """
    return DashboardService.get_full_dashboard_telemetry(db=db)


@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Get Single Unified Dashboard Telemetry API (Alias)",
    description="Alias route for GET /api/dashboard."
)
def get_dashboard_telemetry_alias(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Alias for single unified dashboard endpoint."""
    return DashboardService.get_full_dashboard_telemetry(db=db)
