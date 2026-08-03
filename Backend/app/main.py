import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import init_db
from app.routers import auth, tracker, dashboard, members


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Event Handler.
    1. Initializes database schemas and tables on launch.
    2. Automatically generates and exports openapi.json Swagger specification file.
    """
    init_db()
    try:
        openapi_schema = app.openapi()
        with open("openapi.json", "w", encoding="utf-8") as f:
            json.dump(openapi_schema, f, indent=2)
    except Exception as e:
        print(f"Error exporting openapi.json: {e}")
    yield


# ==============================================================================
# FASTAPI APPLICATION SETUP
# ==============================================================================
app = FastAPI(
    title="Project Management API",
    description="Backend API services for Project Management System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(tracker.router)
app.include_router(dashboard.router)
app.include_router(members.router)


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





