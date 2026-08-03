from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException, status
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
    def get_users_dropdown(
        db: Session,
        project_id: Optional[UUID] = None,
        exclude_project_members: bool = False,
        exclude_user_id: Optional[UUID] = None,
    ) -> List[UserDropdownItem]:
        """
        Returns users as value/label dropdown items.
        If project_id & exclude_project_members is True, excludes users who are already
        active members or owner of the specified project at the database query level.
        If exclude_user_id is passed, excludes that user from the dropdown.
        """
        query = db.query(UserMaster)

        if project_id and exclude_project_members:
            # Query existing member user_ids for this project
            existing_member_ids = {
                m[0]
                for m in db.query(ProjectMember.user_id)
                .filter(ProjectMember.project_id == project_id, ProjectMember.is_active == True)
                .all()
            }

            # Query project owner if present
            project = db.query(Project).filter(Project.project_id == project_id, Project.is_active == True).first()
            if project and project.created_by:
                existing_member_ids.add(project.created_by)

            if existing_member_ids:
                query = query.filter(~UserMaster.user_id.in_(existing_member_ids))  # type: ignore

        if exclude_user_id:
            query = query.filter(UserMaster.user_id != exclude_user_id)  # type: ignore

        users = query.order_by(UserMaster.full_name.asc()).all()  # type: ignore
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
        return AddMembersResponse(
            message=f"{added} member(s) added, {skipped} duplicate(s) skipped.",
            added=added,
            skipped=skipped,
            members=MemberService.get_project_members(db, project_id),
        )

    @staticmethod
    def get_project_members(
        db: Session,
        project_id: UUID,
        exclude_user_id: Optional[UUID] = None,
    ) -> List[ProjectMemberResponse]:
        """
        Returns active members for a given project (including project owner).
        Optionally excludes a specified exclude_user_id at the DB query level.
        """
        project = db.query(Project).filter(Project.project_id == project_id, Project.is_active == True).first()

        query = (
            db.query(ProjectMember, UserMaster)
            .join(UserMaster, UserMaster.user_id == ProjectMember.user_id)  # type: ignore
            .filter(ProjectMember.project_id == project_id, ProjectMember.is_active == True)  # type: ignore
        )

        if exclude_user_id:
            query = query.filter(UserMaster.user_id != exclude_user_id)  # type: ignore

        rows = query.all()

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
            if not exclude_user_id or str(project.created_by) != str(exclude_user_id):
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

    @staticmethod
    def get_member_or_404(db: Session, project_member_id: UUID) -> ProjectMember:
        """Fetches an active project member record or raises 404."""
        member = db.query(ProjectMember).filter(
            ProjectMember.project_member_id == project_member_id,
            ProjectMember.is_active == True
        ).first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project member with ID '{project_member_id}' not found."
            )
        return member

    @staticmethod
    def remove_member(db: Session, project_member_id: UUID) -> Dict[str, Any]:
        """
        Removes (deactivates) a member from a project.
        The project owner cannot be removed via this endpoint.
        """
        member = MemberService.get_member_or_404(db, project_member_id)

        project = db.query(Project).filter(Project.project_id == member.project_id).first()
        if project and str(project.created_by) == str(member.user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The project owner cannot be removed from the project."
            )

        member.is_active = False
        db.commit()

        return {
            "message": "Member removed successfully.",
            "project_member_id": member.project_member_id,
        }
