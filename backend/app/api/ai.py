from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.services.ai_service import chat_with_ai, generate_data_insights
from app.models.metric import Metric

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str
    context: str = ""


@router.post("/chat")
async def chat(req: ChatRequest):
    """AI对话接口"""
    result = await chat_with_ai(req.message, req.context)
    return {"reply": result}


@router.get("/insights")
async def insights(db: Session = Depends(get_db)):
    """获取AI数据洞察"""
    month_start = datetime.now().replace(day=1)
    total = (
        db.query(func.sum(Metric.value))
        .filter(Metric.recorded_at >= month_start)
        .scalar()
        or 0
    )
    count = db.query(Metric).filter(Metric.recorded_at >= month_start).count()

    context = f"本月数据总值：{total:.0f}，数据点数：{count}"
    results = await generate_data_insights(context)
    return {"insights": results}
