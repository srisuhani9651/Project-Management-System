from fastapi import FastAPI
from app.db.database import init_db

app = FastAPI(title="Project Management API")

# Initialize database schema and tables
init_db()


@app.get("/")
def home():
    return {
        "message": "Welcome to Project Management API"
    }


