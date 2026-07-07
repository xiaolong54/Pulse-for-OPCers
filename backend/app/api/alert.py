from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.alert import Alert, AlertRule
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("")
def list_alerts(
    status: str = "",
    severity: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Alert)
    if status:
        q = q.filter(Alert.status == status)
    if severity:
        q = q.filter(Alert.severity == severity)
    results = q.order_by(Alert.created_at.desc()).limit(50).all()
    return [
        {
            "id": r.id,
            "message": r.message,
            "severity": r.severity,
            "status": r.status,
            "created_at": str(r.created_at),
        }
        for r in results
    ]


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Alert).count()
    pending = db.query(Alert).filter(Alert.status == "pending").count()
    high = db.query(Alert).filter(
        Alert.severity.in_(["high", "critical"]), Alert.status == "pending"
    ).count()
    return {"total": total, "pending": pending, "high": high}


@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"error": "not found"}
    alert.status = "resolved"
    alert.resolved_at = datetime.now()
    db.commit()
    return {"ok": True}


@router.get("/rules")
def list_rules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rules = db.query(AlertRule).all()
    return [
        {
            "id": r.id,
            "metric_name": r.metric_name,
            "condition": r.condition,
            "threshold": r.threshold,
            "severity": r.severity,
            "enabled": r.enabled,
        }
        for r in rules
    ]
