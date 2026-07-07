from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.core.database import Base


class ApiSource(Base):
    __tablename__ = "api_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    endpoint = Column(String(500), nullable=False)
    method = Column(String(10), default="GET")
    auth_type = Column(String(20), default="none")
    auth_config = Column(JSON, default={})
    headers = Column(JSON, default={})
    data_mapping = Column(JSON, default={})
    sync_cron = Column(String(50), default="")
    last_sync_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())
