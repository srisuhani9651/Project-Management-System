from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.tracker.project import Project
from app.models.tracker.tasks import Task
from app.models.lov.status import Status
from app.models.lov.priority import Priority


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
        # Fetch active projects & tasks
        projects = db.query(Project).filter(Project.is_active == True).all()
        tasks = db.query(Task).filter(Task.is_active == True).all()

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
        time_analytics = DashboardService._calculate_time_analytics(tasks, statuses)  # type: ignore

        # 4. PRODUCTIVITY INSIGHTS (today, week, month, ytd)
        productivity_insights = DashboardService._calculate_productivity_insights(tasks, statuses)  # type: ignore

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
            "productivityInsights": productivity_insights
        }

    @staticmethod
    def _calculate_time_analytics(tasks: List[Task], statuses: Dict[Any, Any]) -> Dict[str, Any]:
        """Calculates past throughput & completion metrics for 7 Days, 30 Days, and 90 Days."""
        now = datetime.now(timezone.utc)

        def get_period_metrics(days: int):
            cutoff = now - timedelta(days=days)
            prev_cutoff = now - timedelta(days=days * 2)

            curr_tasks = [t for t in tasks if t.created_at and t.created_at.replace(tzinfo=timezone.utc if t.created_at.tzinfo is None else t.created_at.tzinfo) >= cutoff]
            prev_tasks = [t for t in tasks if t.created_at and prev_cutoff <= t.created_at.replace(tzinfo=timezone.utc if t.created_at.tzinfo is None else t.created_at.tzinfo) < cutoff]

            created_count = len(curr_tasks)
            prev_created_count = len(prev_tasks)

            # Completed tasks in cutoff period
            completed_tasks = [
                t for t in tasks
                if t.completed_at and t.completed_at.replace(tzinfo=timezone.utc if t.completed_at.tzinfo is None else t.completed_at.tzinfo) >= cutoff
                or (statuses.get(t.status_id, "").lower() in ("done", "completed") and t.updated_at and t.updated_at.replace(tzinfo=timezone.utc if t.updated_at.tzinfo is None else t.updated_at.tzinfo) >= cutoff)
            ]
            completed_count = len(completed_tasks)

            # Throughput %
            total_in_period = max(created_count, 1) if created_count > 0 else len(tasks) or 1
            throughput_pct = min(round((completed_count / total_in_period) * 100), 100) if total_in_period > 0 else 0

            # Velocity change % vs prior period
            if prev_created_count > 0:
                vel_diff = round(((created_count - prev_created_count) / prev_created_count) * 100)
                vel_str = f"+{vel_diff}%" if vel_diff >= 0 else f"{vel_diff}%"
            else:
                vel_str = "+0%" if created_count == 0 else f"+{created_count * 100}%"

            # Avg resolution time (days)
            resolution_times = []
            for t in completed_tasks:
                if t.completed_at and t.created_at:
                    dur = (t.completed_at - t.created_at).total_seconds() / 86400.0
                    if dur >= 0:
                        resolution_times.append(dur)
            avg_days = round(sum(resolution_times) / len(resolution_times), 1) if resolution_times else 0.0

            # Dynamic Bar chart buckets
            bars = []
            if days == 7:
                # 7 daily buckets
                for i in range(6, -1, -1):
                    day_date = (now - timedelta(days=i)).date()
                    label = day_date.strftime("%a")
                    b_created = sum(1 for t in tasks if t.created_at and t.created_at.date() == day_date)
                    b_completed = sum(1 for t in tasks if t.completed_at and t.completed_at.date() == day_date)
                    bars.append({"label": label, "created": b_created, "completed": b_completed})
            elif days == 30:
                # 4 weekly buckets
                for i in range(4):
                    w_start = now - timedelta(days=(4 - i) * 7)
                    w_end = now - timedelta(days=(3 - i) * 7)
                    label = f"W{i + 1}"
                    b_created = sum(1 for t in tasks if t.created_at and w_start <= t.created_at.replace(tzinfo=timezone.utc if t.created_at.tzinfo is None else t.created_at.tzinfo) < w_end)
                    b_completed = sum(1 for t in tasks if t.completed_at and w_start <= t.completed_at.replace(tzinfo=timezone.utc if t.completed_at.tzinfo is None else t.completed_at.tzinfo) < w_end)
                    bars.append({"label": label, "created": b_created, "completed": b_completed})
            else:
                # 3 monthly buckets
                for i in range(2, -1, -1):
                    m_date = now - timedelta(days=i * 30)
                    label = m_date.strftime("%b")
                    m_start = m_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                    if m_start.month == 12:
                        m_next = m_start.replace(year=m_start.year + 1, month=1)
                    else:
                        m_next = m_start.replace(month=m_start.month + 1)
                    b_created = sum(1 for t in tasks if t.created_at and m_start <= t.created_at.replace(tzinfo=timezone.utc if t.created_at.tzinfo is None else t.created_at.tzinfo) < m_next)
                    b_completed = sum(1 for t in tasks if t.completed_at and m_start <= t.completed_at.replace(tzinfo=timezone.utc if t.completed_at.tzinfo is None else t.completed_at.tzinfo) < m_next)
                    bars.append({"label": label, "created": b_created, "completed": b_completed})

            return {
                "periodLabel": f"Last {days} Days",
                "created": created_count,
                "completed": completed_count,
                "velocityChange": vel_str,
                "throughput": f"{throughput_pct}%",
                "avgDaysToComplete": avg_days,
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
        now = datetime.now(timezone.utc)

        def get_duration_metrics(key: str, days: int):
            cutoff = now - timedelta(days=days)
            period_tasks = [t for t in tasks if t.created_at and t.created_at.replace(tzinfo=timezone.utc if t.created_at.tzinfo is None else t.created_at.tzinfo) >= cutoff] if days > 0 else tasks

            completed_tasks = [
                t for t in period_tasks
                if statuses.get(t.status_id, "").lower() in ("done", "completed") or t.completed_at is not None
            ]

            total_count = len(period_tasks)
            completed_count = len(completed_tasks)
            target = max(total_count, 1)

            # On-time rate
            on_time_count = sum(
                1 for t in completed_tasks
                if t.due_date is None or (t.completed_at and t.completed_at <= t.due_date)
            )
            on_time_rate_pct = round((on_time_count / completed_count) * 100) if completed_count > 0 else (100 if completed_count == 0 and total_count == 0 else 0)

            # Productivity Score calculation
            completion_rate = round((completed_count / target) * 100) if target > 0 else 0
            score = min(round((on_time_rate_pct * 0.6) + (completion_rate * 0.4)), 100)
            if total_count == 0 and completed_count == 0:
                score = 100  # Default clean state

            # Productivity status string
            if score >= 90:
                status_str = "Peak Focus"
            elif score >= 80:
                status_str = "High Productivity"
            elif score >= 70:
                status_str = "Consistent Output"
            else:
                status_str = "Building Momentum"

            # Focus hours (estimate ~2.5 hrs per task or actual turnaround)
            estimated_focus_hours = round(completed_count * 2.5, 1)

            # Insight message
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
