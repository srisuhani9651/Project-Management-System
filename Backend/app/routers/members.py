from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.authorization.pbac import Action, authorize
from app.db.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.auth.user_master import UserMaster
from app.services.member_service import MemberService
from app.services.schemas.member import (
    AddMembersRequest,
    AddMembersResponse,
    ProjectMemberResponse,
    UserDropdownItem,
)

router = APIRouter(prefix="/api/members", tags=["Project Members"])


@router.get("/users", response_model=List[UserDropdownItem], summary="Get users for dropdown")
def get_users_dropdown(
    project_id: Optional[UUID] = Query(None, description="Optional project ID filter"),
    exclude_project_members: bool = Query(False, description="If True, excludes existing active project members & owner"),
    exclude_user_id: Optional[UUID] = Query(None, description="Optional user ID to exclude"),
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Returns users as value/label items for dropdowns with backend query filtering."""
    return MemberService.get_users_dropdown(
        db=db,
        project_id=project_id,
        exclude_project_members=exclude_project_members,
        exclude_user_id=exclude_user_id
    )


@router.get("/{project_id}", response_model=List[ProjectMemberResponse], summary="Get project members")
def get_project_members(
    project_id: UUID,
    exclude_user_id: Optional[UUID] = Query(None, description="Optional user ID to exclude"),
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Returns active members for a project (Enforces PBAC Project Visibility)."""
    authorize(current_user, Action.PROJECT_VIEW, project_id, db)
    return MemberService.get_project_members(
        db=db,
        project_id=project_id,
        exclude_user_id=exclude_user_id
    )


@router.post("", response_model=AddMembersResponse, status_code=status.HTTP_201_CREATED, summary="Add members to a project")
def add_members(
    payload: AddMembersRequest,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Adds multiple members to a project (Enforces PBAC Project Update - Owner only)."""
    authorize(current_user, Action.PROJECT_UPDATE, payload.project_id, db)
    return MemberService.add_members(db, payload.project_id, payload.user_ids)
