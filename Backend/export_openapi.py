import json
from app.main import app

def export_schema():
    """Generates and writes openapi.json file for Swagger/Postman imports."""
    openapi_schema = app.openapi()
    with open("openapi.json", "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2)
    print("Successfully exported openapi.json Swagger specification file.")

if __name__ == "__main__":
    export_schema()
