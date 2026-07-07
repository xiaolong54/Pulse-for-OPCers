from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base


class DbSource(Base):
    __tablename__ = "db_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    db_type = Column(String(20), default="mysql")
    host = Column(String(200), nullable=False)
    port = Column(Integer, default=3306)
    database_name = Column(String(100), nullable=False)
    username = Column(String(100), default="")
    password_encrypted = Column(String(500), default="")
    table_name = Column(String(100), default="")
    sync_mode = Column(String(20), default="full")
    sync_cron = Column(String(50), default="")
    last_sync_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())
