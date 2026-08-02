from fastapi import FastAPI
from app.db.database import init_db

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
# Initializes the database, verifies connections, and auto-creates schemas and tables on server startup.
# EXPECTED RESULT: Database schemas and tables are ready before handling requests.
init_db()


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




