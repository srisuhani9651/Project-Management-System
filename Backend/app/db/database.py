import os
import psycopg
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# ==============================================================================
# ENVIRONMENT & DATABASE CONFIGURATION
# ==============================================================================
# Load environment variables from .env file
load_dotenv()

# Read connection parameters from environment variables
DB_HOST = os.getenv("DATABASE_HOST")
DB_PORT = os.getenv("DATABASE_PORT")
DB_USER = os.getenv("DATABASE_USER")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
DB_NAME = os.getenv("DATABASE_NAME", "project_management")

# Build PostgreSQL connection string using the psycopg driver
DATABASE_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


# ==============================================================================
# DATABASE CREATION CHECK
# ==============================================================================

def create_database_if_not_exists():
    """
    WHAT IT DOES:
    Connects to the default PostgreSQL 'postgres' database and checks if the target 
    database ('project_management') exists. If it does not exist, it creates it.

    EXPECTED RESULT:
    Creates the database if missing. If the database already exists, it leaves it untouched.
    """
    try:
        conn_info = f"host={DB_HOST} port={DB_PORT} user={DB_USER} password={DB_PASSWORD} dbname=postgres"
        with psycopg.connect(conn_info, autocommit=True) as conn:
            conn.execute(
                psycopg.sql.SQL("CREATE DATABASE {}").format(
                    psycopg.sql.Identifier(DB_NAME)
                )
            )
            print(f"Database '{DB_NAME}' created successfully.")
    except psycopg.errors.DuplicateDatabase:
        # Database already exists - skip creation
        pass
    except Exception as e:
        print(f"Database check notice: {e}")


# Ensure target database exists before SQLAlchemy engine connects
create_database_if_not_exists()


# ==============================================================================
# SQLALCHEMY CONNECTION & SESSION SETUP
# ==============================================================================

# engine: Central connection pool manager for database operations
engine = create_engine(DATABASE_URL)

# SessionLocal: Factory for creating isolated database sessions per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: Declarative base class inherited by ORM models
Base = declarative_base()


def init_db():
    """
    WHAT IT DOES:
    Creates missing tables for imported SQLAlchemy models in the database.

    EXPECTED RESULT:
    Ensures model tables are initialized on startup.
    """
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def get_db():
    """
    WHAT IT DOES:
    FastAPI dependency function that yields a database session per HTTP request
    and automatically closes it when the request completes.

    EXPECTED RESULT:
    Provides isolated database sessions for API handlers.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()