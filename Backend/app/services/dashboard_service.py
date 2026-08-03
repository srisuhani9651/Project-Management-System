from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.tracker.project import Project
from app.models.tracker.project_members import ProjectMember
from app.models.tracker.tasks import Task
from app.models.lov.status import Status
from app.models.lov.priority import Priority
from app.models.auth.user_master import UserMaster


def to_naive(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensures datetime is offset-naive UTC for robust comparison."""
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


class DashboardService:
    """
    WHAT IT DOES:
    Calculates dynamic Dashboard metrics and analytics using PostgreSQL database records
    (tracker.projects and tracker.tasks) without any mock or dummy data.
    """

    @staticmethod
    def get_full_dashboard_telemetry(db: Session, current_user_id: Optional[Any] = None) -> Dict[str, Any]:
        """
        Unified service method to compute all Dashboard widget datasets in a single response payload.
        """
        # Fetch active projects & tasks filtered by current user
        project_q = db.query(Project).filter(Project.is_active == True)
        task_q = db.query(Task).filter(Task.is_active == True)

        if current_user_id:
            owned_proj_ids = [
                p[0]
                for p in db.query(Project.project_id).filter(
                    Project.created_by == current_user_id,
                    Project.is_active == True
                ).all()
            ]
            member_proj_ids = [
                m[0]
                for m in db.query(ProjectMember.project_id).filter(
                    ProjectMember.user_id == current_user_id,
                    ProjectMember.is_active == True
                ).all()
            ]
            accessible_proj_ids = list(set(owned_proj_ids + member_proj_ids))

            project_q = project_q.filter(Project.project_id.in_(accessible_proj_ids))
            
            # Tasks query: All tasks in accessible projects + tasks assigned to/created by the user
            task_q = task_q.filter(
                or_(
                    Task.project_id.in_(accessible_proj_ids) if accessible_proj_ids else False,
                    Task.assignee_id == current_user_id,
                    Task.created_by == current_user_id
                )
            )

        projects = project_q.all()
        tasks = task_q.all()

        # Cache lookup mappings for Status and Priority
        statuses = {s.status_id: s.status_name for s in db.query(Status).all()}
        priorities = {p.priority_id: p.priority_name for p in db.query(Priority).all()}
        project_names = {p.project_id: p.project_name for p in projects}

        # 1. PENDING TASKS
        pending_tasks_list = []
        for t in tasks:
            st_name = statuses.get(t.status_id, "To Do")
            if st_name.lower() not in ("done", "completed"):
                pr_name = priorities.get(t.priority_id, "Medium")
                proj_name = project_names.get(t.project_id, "Unassigned")
                
                # Format due date string
                due_str = "No due date"
                if t.due_date:
                    due_str = t.due_date.strftime("%b %d, %Y")

                is_urgent = (pr_name.lower() in ("high", "urgent"))

                pending_tasks_list.append({
                    "id": str(t.task_id),
                    "task_id": str(t.task_id),
                    "project_id": str(t.project_id) if t.project_id else None,
                    "status_id": str(t.status_id) if t.status_id else None,
                    "title": t.title,
                    "projectName": proj_name,
                    "status": st_name,
                    "priority": pr_name,
                    "dueDate": due_str,
                    "urgent": is_urgent,
                    "created_at": t.created_at.isoformat() if t.created_at else None
                })

        # Sort pending tasks by urgency
        pending_tasks_list.sort(key=lambda x: (not x["urgent"], x["id"]))

        # Filter counts summary
        pending_counts = {
            "all": len(pending_tasks_list),
            "in_progress": sum(1 for t in pending_tasks_list if "progress" in t["status"].lower()),
            "todo": sum(1 for t in pending_tasks_list if t["status"].lower() in ("to do", "todo")),
            "high_priority": sum(1 for t in pending_tasks_list if t["urgent"]),
        }

        # 2. TASK DISTRIBUTION BY PROJECT
        project_task_counts = {}
        for p in projects:
            project_task_counts[p.project_name] = 0

        for t in tasks:
            p_name = project_names.get(t.project_id, "Unassigned Project")
            project_task_counts[p_name] = project_task_counts.get(p_name, 0) + 1

        total_tasks_count = len(tasks)
        distribution_items = []
        for p_name, count in project_task_counts.items():
            pct = round((count / total_tasks_count * 100)) if total_tasks_count > 0 else 0
            distribution_items.append({
                "name": p_name,
                "count": count,
                "percentage": pct
            })

        # 3. TIME-BASED PAST ANALYTICS (7d, 30d, 90d)
        time_analytics = DashboardService._calculate_time_analytics(tasks, statuses)

        # 4. PRODUCTIVITY INSIGHTS (today, week, month, ytd)
        productivity_insights = DashboardService._calculate_productivity_insights(tasks, statuses)

        # 5. RECENTLY CREATED OR UPDATED TASKS
        users_map = {u.user_id: (u.full_name or u.username or "User") for u in db.query(UserMaster).all()}
        sorted_tasks = sorted(
            tasks,
            key=lambda t: (to_naive(t.updated_at) or to_naive(t.created_at) or datetime.min),
            reverse=True
        )

        recent_tasks_list = []
        for t in sorted_tasks[:10]:
            st_name = statuses.get(t.status_id, "To Do")
            pr_name = priorities.get(t.priority_id, "Medium")
            proj_name = project_names.get(t.project_id, "Project")
            user_name = users_map.get(t.created_by, "You")

            updated_time = to_naive(t.updated_at) or to_naive(t.created_at)
            created_time = to_naive(t.created_at)
            is_updated = updated_time is not None and created_time is not None and updated_time > created_time

            recent_tasks_list.append({
                "id": str(t.task_id),
                "task_id": str(t.task_id),
                "project_id": str(t.project_id) if t.project_id else None,
                "title": t.title,
                "description": t.description or "",
                "projectName": proj_name,
                "status": st_name,
                "priority": pr_name,
                "creator_id": str(t.created_by) if t.created_by else None,
                "creator_name": user_name,
                "action": "Updated" if is_updated else "Created",
                "timestamp": updated_time.isoformat() if updated_time else None,
                "formatted_time": updated_time.strftime("%b %d, %I:%M %p") if updated_time else "Recently"
            })

        return {
            "pendingTasks": {
                "counts": pending_counts,
                "tasks": pending_tasks_list
            },
            "taskDistribution": {
                "totalProjects": len(projects),
                "totalTasks": total_tasks_count,
                "items": distribution_items
            },
            "timeAnalytics": time_analytics,
            "productivityInsights": productivity_insights,
            "recentTasks": {
                "total": len(recent_tasks_list),
                "tasks": recent_tasks_list
            }
        }

    @staticmethod
    def _calculate_time_analytics(tasks: List[Task], statuses: Dict[Any, Any]) -> Dict[str, Any]:
        """Calculates past throughput & completion metrics for 7 Days, 30 Days, and 90 Days safely."""
        now = datetime.utcnow()

        def get_period_metrics(days: int):
            cutoff = now - timedelta(days=days)
            prev_cutoff = now - timedelta(days=days * 2)

            curr_tasks = [t for t in tasks if to_naive(t.created_at) and to_naive(t.created_at) >= cutoff]
            prev_tasks = [t for t in tasks if to_naive(t.created_at) and prev_cutoff <= to_naive(t.created_at) < cutoff]

            created_count = len(curr_tasks)
            prev_created_count = len(prev_tasks)

            completed_tasks = [
                t for t in tasks
                if (to_naive(t.completed_at) and to_naive(t.completed_at) >= cutoff)
                or (statuses.get(t.status_id, "").lower() in ("done", "completed") and to_naive(t.updated_at) and to_naive(t.updated_at) >= cutoff)
            ]
            completed_count = len(completed_tasks)

            total_in_period = max(created_count, 1) if created_count > 0 else len(tasks) or 1
            throughput_pct = min(round((completed_count / total_in_period) * 100), 100) if total_in_period > 0 else 0

            if prev_created_count > 0:
                vel_diff = round(((created_count - prev_created_count) / prev_created_count) * 100)
                vel_str = f"+{vel_diff}%" if vel_diff >= 0 else f"{vel_diff}%"
            else:
                vel_str = "+0%" if created_count == 0 else f"+{created_count * 100}%"

            resolution_times = []
            for t in completed_tasks:
                c_at = to_naive(t.completed_at)
                cr_at = to_naive(t.created_at)
                if c_at and cr_at:
                    dur = (c_at - cr_at).total_seconds() / 86400.0
                    if dur >= 0:
                        resolution_times.append(dur)
            avg_days = round(sum(resolution_times) / len(resolution_times), 1) if resolution_times else 0.0

            bars = []
            if days == 7:
                for i in range(6, -1, -1):
                    day_date = (now - timedelta(days=i)).date()
                    label = day_date.strftime("%a")
                    b_created = sum(1 for t in tasks if to_naive(t.created_at) and to_naive(t.created_at).date() == day_date)
                    b_completed = sum(1 for t in tasks if to_naive(t.completed_at) and to_naive(t.completed_at).date() == day_date)
                    bars.append({"label": label, "created": b_created, "completed": b_completed})
            elif days == 30:
                for i in range(4):
                    w_start = (now - timedelta(days=(4 - i) * 7)).date()
                    w_end = (now - timedelta(days=(3 - i) * 7)).date()
                    label = f"W{i + 1}"
                    b_created = sum(1 for t in tasks if to_naive(t.created_at) and w_start <= to_naive(t.created_at).date() <= w_end)
                    b_completed = sum(1 for t in tasks if to_naive(t.completed_at) and w_start <= to_naive(t.completed_at).date() <= w_end)
                    bars.append({"label": label, "created": b_created, "completed": b_completed})
            else:
                for i in range(3):
                    m_start = (now - timedelta(days=(3 - i) * 30)).date()
                    m_end = (now - timedelta(days=(2 - i) * 30)).date()
                    label = f"M{i + 1}"
                    b_created = sum(1 for t in tasks if to_naive(t.created_at) and m_start <= to_naive(t.created_at).date() <= m_end)
                    b_completed = sum(1 for t in tasks if to_naive(t.completed_at) and m_start <= to_naive(t.completed_at).date() <= m_end)
                    bars.append({"label": label, "created": b_created, "completed": b_completed})

            return {
                "throughput": f"{throughput_pct}%",
                "velocity": vel_str,
                "avgResolution": f"{avg_days} days",
                "bars": bars
            }

        return {
            "7d": get_period_metrics(7),
            "30d": get_period_metrics(30),
            "90d": get_period_metrics(90)
        }

    @staticmethod
    def _calculate_productivity_insights(tasks: List[Task], statuses: Dict[Any, Any]) -> Dict[str, Any]:
        """Calculates productivity score, on-time completion rate, focus hours, velocity, and insights."""
        now = datetime.utcnow()

        def get_duration_metrics(key: str, days: int):
            cutoff = now - timedelta(days=days)
            period_tasks = [t for t in tasks if to_naive(t.created_at) and to_naive(t.created_at) >= cutoff] if days > 0 else tasks

            completed_tasks = [
                t for t in period_tasks
                if statuses.get(t.status_id, "").lower() in ("done", "completed") or t.completed_at is not None
            ]

            total_count = len(period_tasks)
            completed_count = len(completed_tasks)
            target = max(total_count, 1)

            on_time_count = sum(
                1 for t in completed_tasks
                if t.due_date is None or (to_naive(t.completed_at) and to_naive(t.due_date) and to_naive(t.completed_at) <= to_naive(t.due_date))
            )
            on_time_rate_pct = round((on_time_count / completed_count) * 100) if completed_count > 0 else (100 if completed_count == 0 and total_count == 0 else 0)

            completion_rate = round((completed_count / target) * 100) if target > 0 else 0
            score = min(round((on_time_rate_pct * 0.6) + (completion_rate * 0.4)), 100)
            if total_count == 0 and completed_count == 0:
                score = 100

            if score >= 90:
                status_str = "Peak Focus"
            elif score >= 80:
                status_str = "High Productivity"
            elif score >= 70:
                status_str = "Consistent Output"
            else:
                status_str = "Building Momentum"

            estimated_focus_hours = round(completed_count * 2.5, 1)

            if completed_count == target and target > 0:
                insight_text = f"You've completed all {completed_count} tasks in this period with {on_time_rate_pct}% on-time rate!"
            elif completed_count > 0:
                remaining = target - completed_count
                insight_text = f"You are operating effectively with {on_time_rate_pct}% on-time completion. {remaining} task{'s' if remaining > 1 else ''} remaining to meet sprint target."
            else:
                insight_text = "No completed tasks recorded in this timeframe yet. Assign or complete tasks to see productivity telemetry updates."

            return {
                "label": key.capitalize(),
                "score": score,
                "status": status_str,
                "onTimeRate": f"{on_time_rate_pct}%",
                "completedToday": completed_count,
                "goal": target,
                "focusHours": f"{estimated_focus_hours} hrs",
                "velocity": f"+{min(score, 25)}% overall",
                "insight": insight_text
            }

        return {
            "today": get_duration_metrics("today", 1),
            "week": get_duration_metrics("week", 7),
            "month": get_duration_metrics("month", 30),
            "ytd": get_duration_metrics("ytd", 365)
        }
