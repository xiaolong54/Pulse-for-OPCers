from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.models import Metric, AlertRule, Alert, Report, User, Task, ImportRecord

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting OPC Intelligent Decision Workbench...")
    # Create database tables (skip if database is not available)
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Warning: Could not connect to database: {e}")
        print("Application will start without database connection")
    yield
    # Shutdown
    print("Shutting down OPC Intelligent Decision Workbench...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="OPC智能决策工作台 API",
    version="1.0.0",
    lifespan=lifespan,
)

# Set all CORS enabled
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.analysis import router as analysis_router
from app.api.alert import router as alert_router
from app.api.ai import router as ai_router
from app.api.report import router as report_router
from app.api.task import router as task_router
import importlib
import_module = importlib.import_module("app.api.import")
import_router = import_module.router
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(analysis_router)
app.include_router(alert_router)
app.include_router(ai_router)
app.include_router(report_router)
app.include_router(task_router)
app.include_router(import_router)


@app.get("/")
def read_root():
    return {"message": "OPC智能决策工作台 API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/info")
def get_info():
    return {
        "app_name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": "development"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)