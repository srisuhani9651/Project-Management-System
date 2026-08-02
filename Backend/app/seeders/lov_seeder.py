import logging
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.lov.category import Category
from app.models.lov.priority import Priority
from app.models.lov.project_type import ProjectType
from app.models.lov.status import Status
from app.models.lov.task_type import TaskType

# Set up logging for seeder progress
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def seed_categories(db: Session) -> None:
    """
    WHAT IT DOES:
    Seeds default project categories into the 'lov.master_category' table.

    EXPECTED RESULT:
    Inserts missing category records while avoiding duplicates.
    """
    categories = ["Development", "Design", "Testing", "Documentation"]
    for name in categories:
        exists = db.query(Category).filter(Category.category_name == name).first()
        if not exists:
            db.add(Category(category_name=name))
            logger.info(f"Added Category: {name}")


def seed_priorities(db: Session) -> None:
    """
    WHAT IT DOES:
    Seeds default priority levels into the 'lov.master_priority' table.

    EXPECTED RESULT:
    Inserts missing priority records while avoiding duplicates.
    """
    priorities = [
        {"name": "Low", "desc": "Low urgency item"},
        {"name": "Medium", "desc": "Medium urgency item"},
        {"name": "High", "desc": "High urgency item"},
    ]
    for item in priorities:
        exists = db.query(Priority).filter(Priority.priority_name == item["name"]).first()
        if not exists:
            db.add(Priority(priority_name=item["name"], priority_description=item["desc"]))
            logger.info(f"Added Priority: {item['name']}")


def seed_project_types(db: Session) -> None:
    """
    WHAT IT DOES:
    Seeds default project types into the 'lov.master_project_type' table.

    EXPECTED RESULT:
    Inserts missing project type records while avoiding duplicates.
    """
    project_types = [
        {"name": "Personal", "desc": "Personal project"},
        {"name": "Team", "desc": "Internal team project"},
        {"name": "Client", "desc": "External client project"},
    ]
    for item in project_types:
        exists = db.query(ProjectType).filter(ProjectType.type_name == item["name"]).first()
        if not exists:
            db.add(ProjectType(type_name=item["name"], type_description=item["desc"]))
            logger.info(f"Added Project Type: {item['name']}")


def seed_statuses(db: Session) -> None:
    """
    WHAT IT DOES:
    Seeds default work statuses into the 'lov.master_status' table.

    EXPECTED RESULT:
    Inserts missing status records while avoiding duplicates.
    """
    statuses = [
        {"name": "Todo", "desc": "Task or project yet to be started"},
        {"name": "In Progress", "desc": "Task or project currently active"},
        {"name": "Completed", "desc": "Task or project finished"},
    ]
    for item in statuses:
        exists = db.query(Status).filter(Status.status_name == item["name"]).first()
        if not exists:
            db.add(Status(status_name=item["name"], status_description=item["desc"]))
            logger.info(f"Added Status: {item['name']}")


def seed_task_types(db: Session) -> None:
    """
    WHAT IT DOES:
    Seeds default task types into the 'lov.master_task_type' table.

    EXPECTED RESULT:
    Inserts missing task type records while avoiding duplicates.
    """
    task_types = [
        {"name": "Bug", "desc": "Defect or error fix"},
        {"name": "Feature", "desc": "New capability or functionality"},
        {"name": "Improvement", "desc": "Enhancement to existing functionality"},
    ]
    for item in task_types:
        exists = db.query(TaskType).filter(TaskType.type_name == item["name"]).first()
        if not exists:
            db.add(TaskType(type_name=item["name"], type_description=item["desc"]))
            logger.info(f"Added Task Type: {item['name']}")


def run_seeders() -> None:
    """
    WHAT IT DOES:
    Orchestrates all LOV seeders in a single atomic database transaction.
    Commits on success, rolls back on error, and closes the session.

    EXPECTED RESULT:
    Populates all LOV tables safely and idempotently.
    """
    db = SessionLocal()
    try:
        logger.info("Starting LOV database seeding...")

        seed_categories(db)
        seed_priorities(db)
        seed_project_types(db)
        seed_statuses(db)
        seed_task_types(db)

        # Commit all changes after successful execution
        db.commit()
        logger.info("LOV database seeding completed successfully!")
    except Exception as e:
        # Roll back transaction if any error occurs
        db.rollback()
        logger.error(f"Seeding failed! Transaction rolled back. Error: {e}")
        raise e
    finally:
        # Guarantee session closure
        db.close()


if __name__ == "__main__":
    run_seeders()
