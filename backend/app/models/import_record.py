from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.database import Base


class ImportRecord(Base):
    __tablename__ = "import_records"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(200), nullable=False)
    file_type = Column(String(20))  # excel/csv/json
    file_size = Column(Integer, default=0)
    records_count = Column(Integer, default=0)
    status = Column(String(20), default="pending")  # pending/success/failed
    error_message = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
