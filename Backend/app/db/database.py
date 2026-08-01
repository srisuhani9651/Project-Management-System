import os
import psycopg
from psycopg import sql
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env file
load_dotenv()

DB_HOST = os.getenv("DATABASE_HOST")
DB_PORT = os.getenv("DATABASE_PORT")
DB_USER = os.getenv("DATABASE_USER")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
DB_NAME = os.getenv("DATABASE_NAME", "project_management")


def create_database_if_not_exists():
    """Connects to the default 'postgres' database and creates the target database if missing."""
    try:
        conn_info = f"host={DB_HOST} port={DB_PORT} user={DB_USER} password={DB_PASSWORD} dbname=postgres"
        with psycopg.connect(conn_info, autocommit=True) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT 1 FROM pg_database WHERE datname = %s;", (DB_NAME,)
                )
                exists = cur.fetchone()
                if not exists:
                    cur.execute(
                        sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME))
                    )
                    print(f"Database '{DB_NAME}' created successfully.")
                else:
                    print(f"Database '{DB_NAME}' already exists.")
    except Exception as e:
        print(f"Database connection/creation check notice: {e}")


def create_schema_if_not_exists(schema_name: str = "auth"):
    """Ensures that the specified schema exists inside the target database."""
    try:
        conn_info = f"host={DB_HOST} port={DB_PORT} user={DB_USER} password={DB_PASSWORD} dbname={DB_NAME}"
        with psycopg.connect(conn_info, autocommit=True) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    sql.SQL("CREATE SCHEMA IF NOT EXISTS {};").format(
                        sql.Identifier(schema_name)
                    )
                )
                print(f"Schema '{schema_name}' checked/created successfully.")
    except Exception as e:
        print(f"Schema creation notice for '{schema_name}': {e}")


# Ensure the target database exists before SQLAlchemy connects
create_database_if_not_exists()

# Ensure required PostgreSQL schema exists
create_schema_if_not_exists("auth")

# Build SQLAlchemy connection URL (using psycopg driver)
DATABASE_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Import all models and create missing tables in the database."""
    import app.models  # noqa: F401
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Notice: Table initialization deferred or failed: {e}")


# Initialize tables automatically on load
init_db()


def get_db():
    """FastAPI dependency to provide a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()