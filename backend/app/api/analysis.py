from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.metric import Metric
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.get("/categories")
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = db.query(Metric.category).distinct().all()
    return [r.category for r in results if r.category]


@router.get("/regions")
def get_regions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = db.query(Metric.region).distinct().all()
    return [r.region for r in results if r.region]


@router.get("/data")
def get_data(
    category: str = "",
    region: str = "",
    start: str = "",
    end: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Metric)
    if category:
        q = q.filter(Metric.category == category)
    if region:
        q = q.filter(Metric.region == region)
    if start:
        q = q.filter(Metric.recorded_at >= datetime.fromisoformat(start))
    if end:
        q = q.filter(Metric.recorded_at <= datetime.fromisoformat(end))
    results = q.order_by(Metric.recorded_at.desc()).limit(100).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "value": r.value,
            "unit": r.unit,
            "category": r.category,
            "region": r.region,
            "date": str(r.recorded_at),
        }
        for r in results
    ]


@router.get("/chart-data")
def get_chart_data(
    category: str = "",
    region: str = "",
    start: str = "",
    end: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(
        func.date(Metric.recorded_at).label("date"),
        func.sum(Metric.value).label("value"),
    )
    if category:
        q = q.filter(Metric.category == category)
    if region:
        q = q.filter(Metric.region == region)
    if start:
        q = q.filter(Metric.recorded_at >= datetime.fromisoformat(start))
    if end:
        q = q.filter(Metric.recorded_at <= datetime.fromisoformat(end))
    results = (
        q.group_by(func.date(Metric.recorded_at)).order_by("date").all()
    )
    return [{"date": str(r.date), "value": round(r.value, 2)} for r in results]
