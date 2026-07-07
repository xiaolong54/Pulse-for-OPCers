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
    format = Column(String(20), default="markdown")  # markdown/pdf/word/excel
    data_range = Column(String(50), default="")  # e.g. "2026-07"
    file_size = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
