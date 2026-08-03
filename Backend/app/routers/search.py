from typing import Any, Dict, List, Optional
from uuid import UUID
from difflib import SequenceMatcher

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.auth.user_master import UserMaster
from app.models.tracker.project import Project
from app.models.tracker.project_members import ProjectMember
from app.models.tracker.tasks import Task
from app.models.lov.status import Status
from app.models.lov.priority import Priority

router = APIRouter(prefix="", tags=["Global Search"])


def calculate_fuzzy_score(query: str, target: Optional[str]) -> float:
    """
    Calculates fuzzy similarity score (0.0 to 1.0) between query and target string safely.
    Ranks exact, prefix, and substring matches higher than approximate edit distance.
    """
    if not target or not query:
        return 0.0

    q = query.strip().lower()
    t = target.strip().lower()

    if not q or not t:
        return 0.0

    # 1. Exact match
    if q == t:
        return 1.0

    # 2. Prefix match
    if t.startswith(q):
        return 0.9 + 0.09 * (len(q) / len(t))

    # 3. Substring match
    if q in t:
        return 0.75 + 0.15 * (len(q) / len(t))

    # 4. Non-recursive word matches
    t_words = t.split()
    word_scores = []
    for w in t_words:
        if w == q:
            word_scores.append(0.95)
        elif w.startswith(q):
            word_scores.append(0.85)
        elif q in w:
            word_scores.append(0.75)
        else:
            r = SequenceMatcher(None, q, w).ratio()
            if r >= 0.5:
                word_scores.append(r * 0.8)

    if word_scores:
        return max(word_scores)

    # 5. Overall SequenceMatcher ratio
    ratio = SequenceMatcher(None, q, t).ratio()
    return ratio if ratio >= 0.4 else 0.0


@router.get("/api/search", summary="Global PBAC-filtered fuzzy search for Projects and Tasks")
@router.get("/search", summary="Global PBAC-filtered fuzzy search for Projects and Tasks (alias)")
def global_search(
    q: str = Query("", description="Search query string"),
    limit: int = Query(8, description="Max results per group"),
    db: Session = Depends(get_db),
    current_user: UserMaster = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Global fuzzy search API across Projects and Tasks.
    Enforces PBAC rules: user only receives projects and tasks they are authorized to view.
    Ranks best matches first using fuzzy scoring.
    """
    query_str = q.strip().lower()
    if not query_str:
        return {"query": "", "projects": [], "tasks": []}

    user_id = current_user.user_id

    # -------------------------------------------------------------
    # 1. PBAC Accessible Projects Query
    # -------------------------------------------------------------
    member_project_ids = [
        pm[0]
        for pm in db.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == user_id,
            ProjectMember.is_active == True
        ).all()
    ]

    if member_project_ids:
        project_filter = or_(
            Project.created_by == user_id,
            Project.project_id.in_(member_project_ids)
        )
    else:
        project_filter = (Project.created_by == user_id)

    accessible_projects = db.query(Project).filter(
        Project.is_active == True,
        project_filter
    ).all()

    matched_projects = []
    for proj in accessible_projects:
        name_score = calculate_fuzzy_score(query_str, proj.project_name)
        key_str = proj.project_name[:3].upper() if proj.project_name else "PROJ"
        key_score = calculate_fuzzy_score(query_str, key_str)
        desc_score = calculate_fuzzy_score(query_str, proj.project_description) * 0.7

        best_score = max(name_score, key_score, desc_score)
        if best_score >= 0.35:
            matched_projects.append({
                "id": str(proj.project_id),
                "name": proj.project_name,
                "key": key_str,
                "description": proj.project_description or "",
                "category": proj.category_name if hasattr(proj, "category_name") else "Development",
                "score": round(best_score, 3)
            })

    matched_projects.sort(key=lambda p: p["score"], reverse=True)
    matched_projects = matched_projects[:limit]

    # -------------------------------------------------------------
    # 2. PBAC Accessible Tasks Query
    # -------------------------------------------------------------
    accessible_project_ids = [p.project_id for p in accessible_projects]

    if accessible_project_ids:
        task_filter = or_(
            Task.project_id.in_(accessible_project_ids),
            Task.assignee_id == user_id,
            Task.created_by == user_id
        )
    else:
        task_filter = or_(
            Task.assignee_id == user_id,
            Task.created_by == user_id
        )

    accessible_tasks = db.query(Task).filter(
        Task.is_active == True,
        task_filter
    ).all()

    status_ids = {t.status_id for t in accessible_tasks if t.status_id}
    statuses = {s.status_id: s.status_name for s in db.query(Status).filter(Status.status_id.in_(status_ids)).all()} if status_ids else {}
    proj_map = {p.project_id: p.project_name for p in accessible_projects}

    matched_tasks = []
    for t in accessible_tasks:
        title_score = calculate_fuzzy_score(query_str, t.title)
        desc_score = calculate_fuzzy_score(query_str, t.description) * 0.8

        best_score = max(title_score, desc_score)
        if best_score >= 0.35:
            proj_name = proj_map.get(t.project_id, "Project")
            matched_tasks.append({
                "id": str(t.task_id),
                "project_id": str(t.project_id),
                "title": t.title,
                "description": t.description or "",
                "status": statuses.get(t.status_id, "To Do"),
                "project_name": proj_name,
                "score": round(best_score, 3)
            })

    matched_tasks.sort(key=lambda tk: tk["score"], reverse=True)
    matched_tasks = matched_tasks[:limit]

    return {
        "query": query_str,
        "projects": matched_projects,
        "tasks": matched_tasks
    }
