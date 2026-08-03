from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
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


@router.get("/users", response_model=List[UserDropdownItem], summary="Get all users for dropdown")
def get_users_dropdown(
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Returns all users as value/label items for a multi-select dropdown."""
    return MemberService.get_users_dropdown(db)


@router.get("/{project_id}", response_model=List[ProjectMemberResponse], summary="Get project members")
def get_project_members(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Returns all active members for a project (Enforces PBAC Project Visibility)."""
    authorize(current_user, Action.PROJECT_VIEW, project_id, db)
    return MemberService.get_project_members(db, project_id)


@router.post("", response_model=AddMembersResponse, status_code=status.HTTP_201_CREATED, summary="Add members to a project")
def add_members(
    payload: AddMembersRequest,
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
):
    """Adds multiple members to a project (Enforces PBAC Project Update - Owner only)."""
    authorize(current_user, Action.PROJECT_UPDATE, payload.project_id, db)
    return MemberService.add_members(db, payload.project_id, payload.user_ids)
