from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.core.database import Base


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20), default="")
    category = Column(String(50), default="")
    region = Column(String(50), default="")
    recorded_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
