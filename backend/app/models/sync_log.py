from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from app.core.database import Base


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("api_sources.id"), nullable=True)
    sync_type = Column(String(20), default="manual")
    status = Column(String(20), default="pending")
    records_count = Column(Integer, default=0)
    error_message = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
