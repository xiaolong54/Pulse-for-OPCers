from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), default="")
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), default="viewer")  # admin/editor/viewer
    preferences = Column(JSON, default={})
    created_at = Column(DateTime, server_default=func.now())
