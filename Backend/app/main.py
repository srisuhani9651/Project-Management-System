from fastapi import FastAPI
from app.db.database import init_db
from app.routers import auth

# ==============================================================================
# FASTAPI APPLICATION SETUP
# ==============================================================================
# Initialize FastAPI application
# Result: Creates core backend app instance with interactive API docs (/docs)
app = FastAPI(
    title="Project Management API",
    description="Backend API services for Project Management System",
    version="1.0.0"
)

# WHAT IT DOES:
# Initializes the database, verifies connections, auto-creates schemas/tables, and seeds LOV data.
# EXPECTED RESULT: Database schemas, tables, and LOV records ready on server launch.
init_db()

# Include Routers
app.include_router(auth.router)


# ==============================================================================
# API ROUTE DEFINITIONS
# ==============================================================================

@app.get("/")
def home():
    """
    WHAT IT DOES:
    Root health check endpoint. Returns a standard welcome message for GET requests.

    EXPECTED RESULT:
    Returns JSON object: {"message": "Welcome to Project Management API"}
    """
    return {
        "message": "Welcome to Project Management API"
    }





