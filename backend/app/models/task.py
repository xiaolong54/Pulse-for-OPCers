from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Float, func
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    project = Column(String(100), default="")
    assignee = Column(String(50), default="")
    priority = Column(String(20), default="medium")  # high/medium/low
    status = Column(String(20), default="todo")  # todo/in_progress/done
    start_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    estimated_hours = Column(Float, default=0)
    actual_hours = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now())
