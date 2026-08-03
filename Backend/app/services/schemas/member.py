from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel


class UserDropdownItem(BaseModel):
    """For multi-select dropdown: value/label pair."""
    value: UUID
    label: str

    class Config:
        from_attributes = True


class AddMembersRequest(BaseModel):
    """Payload to add multiple members to a project."""
    project_id: UUID
    user_ids: List[UUID]


class ProjectMemberResponse(BaseModel):
    """A single project member record."""
    project_member_id: UUID
    project_id: UUID
    user_id: UUID
    full_name: str
    email: str
    joined_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True


class AddMembersResponse(BaseModel):
    message: str
    added: int
    skipped: int
    members: List[ProjectMemberResponse]


class RemoveMemberResponse(BaseModel):
    message: str
    project_member_id: UUID
