from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.auth.user_master import UserMaster
from app.models.tracker.project import Project
from app.models.tracker.project_members import ProjectMember
from app.services.schemas.member import (
    AddMembersResponse,
    ProjectMemberResponse,
    UserDropdownItem,
)


class MemberService:

    @staticmethod
    def get_users_dropdown(db: Session) -> List[UserDropdownItem]:
        """Returns all active users as value/label dropdown items."""
        users = db.query(UserMaster).all()
        return [UserDropdownItem(value=u.user_id, label=u.full_name) for u in users]  # type: ignore

    @staticmethod
    def add_members(db: Session, project_id: UUID, user_ids: List[UUID]) -> AddMembersResponse:
        """
        Adds multiple members to a project.
        Skips duplicates (existing active members).
        Returns updated member list.
        """
        existing_ids = {
            m.user_id
            for m in db.query(ProjectMember.user_id)  # type: ignore
            .filter(ProjectMember.project_id == project_id, ProjectMember.is_active == True)  # type: ignore
            .all()
        }

        added, skipped = 0, 0
        for uid in user_ids:
            if uid in existing_ids:
                skipped += 1
            else:
                db.add(ProjectMember(project_id=project_id, user_id=uid))  # type: ignore
                existing_ids.add(uid)
                added += 1

        db.commit()

        # Return updated full member list for this project
        members = (
            db.query(ProjectMember, UserMaster)
            .join(UserMaster, UserMaster.user_id == ProjectMember.user_id)  # type: ignore
            .filter(ProjectMember.project_id == project_id, ProjectMember.is_active == True)  # type: ignore
            .all()
        )

        member_list = [
            ProjectMemberResponse(
                project_member_id=m.project_member_id,  # type: ignore
                project_id=m.project_id,  # type: ignore
                user_id=m.user_id,  # type: ignore
                full_name=u.full_name,  # type: ignore
                email=u.email,  # type: ignore
                joined_at=m.joined_at,  # type: ignore
                is_active=m.is_active,  # type: ignore
            )
            for m, u in members
        ]

        return AddMembersResponse(
            message=f"{added} member(s) added, {skipped} duplicate(s) skipped.",
            added=added,
            skipped=skipped,
            members=member_list,
        )

    @staticmethod
    def get_project_members(db: Session, project_id: UUID) -> List[ProjectMemberResponse]:
        """Returns all active members for a given project (including project owner)."""
        project = db.query(Project).filter(Project.project_id == project_id, Project.is_active == True).first()

        rows = (
            db.query(ProjectMember, UserMaster)
            .join(UserMaster, UserMaster.user_id == ProjectMember.user_id)  # type: ignore
            .filter(ProjectMember.project_id == project_id, ProjectMember.is_active == True)  # type: ignore
            .all()
        )

        existing_user_ids = {m.user_id for m, u in rows}
        member_list = [
            ProjectMemberResponse(
                project_member_id=m.project_member_id,  # type: ignore
                project_id=m.project_id,  # type: ignore
                user_id=m.user_id,  # type: ignore
                full_name=u.full_name,  # type: ignore
                email=u.email,  # type: ignore
                joined_at=m.joined_at,  # type: ignore
                is_active=m.is_active,  # type: ignore
            )
            for m, u in rows
        ]

        if project and project.created_by and project.created_by not in existing_user_ids:
            owner = db.query(UserMaster).filter(UserMaster.user_id == project.created_by).first()
            if owner:
                member_list.insert(
                    0,
                    ProjectMemberResponse(
                        project_member_id=project.project_id,  # type: ignore
                        project_id=project.project_id,  # type: ignore
                        user_id=owner.user_id,  # type: ignore
                        full_name=owner.full_name,  # type: ignore
                        email=owner.email,  # type: ignore
                        is_active=True,  # type: ignore
                    )
                )

        return member_list
