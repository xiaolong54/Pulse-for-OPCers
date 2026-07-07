from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from app.core.database import get_db
from app.services.ai_prediction import (
    predict_trend,
    analyze_metric,
    detect_anomaly,
    simulate_decision
)

router = APIRouter(prefix="/api/ai", tags=["ai-predict"])


class PredictRequest(BaseModel):
    metric_name: str = Field(..., description="指标名称")
    days: int = Field(default=7, ge=1, le=30, description="预测天数")


class AnalyzeRequest(BaseModel):
    metric_name: str = Field(..., description="指标名称")


class AnomalyRequest(BaseModel):
    metric_name: str = Field(..., description="指标名称")
    threshold: float = Field(default=2.0, ge=0.5, le=5.0, description="异常阈值(标准差倍数)")


class SimulateRequest(BaseModel):
    metric_name: str = Field(..., description="指标名称")
    scenario: str = Field(..., description="决策场景描述")


@router.post("/predict")
async def predict(req: PredictRequest, db: Session = Depends(get_db)):
    """趋势预测接口"""
    try:
        result = await predict_trend(req.metric_name, req.days, db)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"预测失败: {str(e)}")


@router.post("/analyze")
async def analyze(req: AnalyzeRequest, db: Session = Depends(get_db)):
    """智能分析建议接口"""
    try:
        result = await analyze_metric(req.metric_name, db)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")


@router.post("/detect-anomaly")
async def detect(req: AnomalyRequest, db: Session = Depends(get_db)):
    """异常检测接口"""
    try:
        result = await detect_anomaly(req.metric_name, req.threshold, db)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"异常检测失败: {str(e)}")


@router.post("/simulate")
async def simulate(req: SimulateRequest, db: Session = Depends(get_db)):
    """决策模拟接口"""
    try:
        result = await simulate_decision(req.metric_name, req.scenario, db)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"模拟失败: {str(e)}")
