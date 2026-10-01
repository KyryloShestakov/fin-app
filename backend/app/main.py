from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.db.database import get_db


app = FastAPI(
    title="Financial Companies API",
    version="1.0.0",
    description="API for Czech company financial and registry data.",
)


app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Financial Companies API is running"
    }


@app.get("/api/health")
def health(
    db: Session = Depends(get_db),
):
    db.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
    }