from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), default="custom")
    content = Column(Text, default="")
    file_path = Column(String(500), default="")
    generated_by = Column(String(20), default="ai")
    created_at = Column(DateTime, server_default=func.now())
