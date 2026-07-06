from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.metric import Metric
from app.models.alert import Alert
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/kpi")
def get_kpi(db: Session = Depends(get_db)):
    today = datetime.now()
    month_start = today.replace(day=1)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    current = db.query(func.sum(Metric.value)).filter(Metric.recorded_at >= month_start).scalar() or 0
    previous = db.query(func.sum(Metric.value)).filter(
        Metric.recorded_at >= last_month_start, Metric.recorded_at < month_start
    ).scalar() or 0

    change = ((current - previous) / previous * 100) if previous > 0 else 0
    return {"total_revenue": round(current, 2), "change_percent": round(change, 1)}


@router.get("/trend")
def get_trend(days: int = Query(30), db: Session = Depends(get_db)):
    since = datetime.now() - timedelta(days=days)
    results = db.query(
        func.date(Metric.recorded_at).label("date"),
        func.sum(Metric.value).label("value")
    ).filter(
        Metric.recorded_at >= since
    ).group_by(
        func.date(Metric.recorded_at)
    ).order_by("date").all()

    return [{"date": str(r.date), "value": round(r.value, 2)} for r in results]


@router.get("/insights")
def get_insights(db: Session = Depends(get_db)):
    month_start = datetime.now().replace(day=1)
    total = db.query(func.sum(Metric.value)).filter(Metric.recorded_at >= month_start).scalar() or 0
    count = db.query(Metric).filter(Metric.recorded_at >= month_start).count()

    insights = []
    if total > 0:
        insights.append(f"本月数据总值：¥{total:,.0f}")
    if count > 0:
        insights.append(f"本月数据点数：{count}")
    return {"insights": insights}
