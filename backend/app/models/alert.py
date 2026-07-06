from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, func
from app.core.database import Base


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    condition = Column(String(20), nullable=False)  # >, <, =
    threshold = Column(Float, nullable=False)
    severity = Column(String(20), default="warning")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("alert_rules.id"))
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="warning")
    status = Column(String(20), default="pending")  # pending/resolved
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
