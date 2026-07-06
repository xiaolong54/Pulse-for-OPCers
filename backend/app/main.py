from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base

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