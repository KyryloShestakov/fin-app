from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.db.database import get_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Financial Companies API",
    version="1.0.0",
    description="API for Czech company financial and registry data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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