from app.services.ai_service import chat_with_ai
from sqlalchemy.orm import Session
from app.models.metric import Metric
from sqlalchemy import func, and_
from datetime import datetime, timedelta
import json
import re


async def predict_trend(metric_name: str, days: int, db: Session) -> dict:
    """趋势预测服务"""
    since = datetime.now() - timedelta(days=days * 2)
    data = db.query(Metric).filter(
        and_(
            Metric.name.like(f"%{metric_name}%"),
            Metric.recorded_at >= since
        )
    ).order_by(Metric.recorded_at).all()

    if not data:
        return {"predictions": [], "message": "未找到历史数据"}

    data_str = "\n".join([
        f"{d.recorded_at.strftime('%Y-%m-%d')}: {d.value} {d.unit or ''}"
        for d in data[-30:]
    ])

    prompt = f"""基于以下历史数据，预测未来{days}天的{metric_name}趋势：

历史数据：
{data_str}

请以JSON格式返回，格式：{{"predictions": [{{"date": "2026-07-10", "value": 100, "lower": 90, "upper": 110}}]}}
需要包含未来{days}天每天的预测值、下限和上限。
只返回JSON，不要其他内容。"""

    result = await chat_with_ai(prompt)
    try:
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {"predictions": []}
    except (json.JSONDecodeError, AttributeError):
        return {"predictions": []}


async def analyze_metric(metric_name: str, db: Session) -> dict:
    """智能分析建议服务"""
    # 获取统计数据
    stats = db.query(
        func.avg(Metric.value).label('avg'),
        func.min(Metric.value).label('min'),
        func.max(Metric.value).label('max'),
        func.count(Metric.id).label('count')
    ).filter(
        Metric.name.like(f"%{metric_name}%")
    ).first()

    if not stats or stats.count == 0:
        return {"analysis": "暂无数据可分析", "suggestions": []}

    # 获取最近数据趋势
    recent_data = db.query(Metric).filter(
        Metric.name.like(f"%{metric_name}%")
    ).order_by(Metric.recorded_at.desc()).limit(10).all()

    recent_str = "\n".join([
        f"{d.recorded_at.strftime('%Y-%m-%d')}: {d.value}"
        for d in reversed(recent_data)
    ])

    prompt = f"""分析以下指标数据并提供建议：

指标名称：{metric_name}
统计信息：
- 平均值：{stats.avg:.2f}
- 最小值：{stats.min:.2f}
- 最大值：{stats.max:.2f}
- 数据点数：{stats.count}

最近数据趋势：
{recent_str}

请以JSON格式返回分析结果：
{{"analysis": "分析结论", "suggestions": ["建议1", "建议2"], "risk_level": "low/medium/high"}}
只返回JSON，不要其他内容。"""

    result = await chat_with_ai(prompt)
    try:
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {"analysis": "分析失败", "suggestions": [], "risk_level": "unknown"}
    except (json.JSONDecodeError, AttributeError):
        return {"analysis": "分析失败", "suggestions": [], "risk_level": "unknown"}


async def detect_anomaly(metric_name: str, threshold: float, db: Session) -> dict:
    """异常检测服务"""
    # 获取历史数据计算基准
    since = datetime.now() - timedelta(days=30)
    data = db.query(Metric).filter(
        and_(
            Metric.name.like(f"%{metric_name}%"),
            Metric.recorded_at >= since
        )
    ).order_by(Metric.recorded_at.desc()).all()

    if not data:
        return {"anomalies": [], "message": "暂无数据"}

    # 计算统计基准
    values = [d.value for d in data]
    avg = sum(values) / len(values)
    std_dev = (sum((x - avg) ** 2 for x in values) / len(values)) ** 0.5

    # 检测异常（超过阈值倍标准差）
    anomalies = []
    for d in data:
        if std_dev > 0 and abs(d.value - avg) > threshold * std_dev:
            anomalies.append({
                "date": d.recorded_at.strftime('%Y-%m-%d %H:%M'),
                "value": d.value,
                "deviation": round(abs(d.value - avg) / std_dev, 2) if std_dev > 0 else 0,
                "type": "异常偏高" if d.value > avg else "异常偏低"
            })

    # AI分析异常原因
    if anomalies:
        anomaly_str = "\n".join([
            f"{a['date']}: {a['value']} ({a['type']}, 偏差{a['deviation']}σ)"
            for a in anomalies[:5]
        ])

        prompt = f"""以下{metric_name}数据出现异常，请分析可能原因：

基准值：{avg:.2f}，标准差：{std_dev:.2f}
异常数据：
{anomaly_str}

请以JSON格式返回：
{{"possible_causes": ["原因1", "原因2"], "recommendations": ["建议1", "建议2"]}}
只返回JSON，不要其他内容。"""

        ai_result = await chat_with_ai(prompt)
        try:
            json_match = re.search(r'\{.*\}', ai_result, re.DOTALL)
            if json_match:
                ai_analysis = json.loads(json_match.group())
            else:
                ai_analysis = {"possible_causes": [], "recommendations": []}
        except (json.JSONDecodeError, AttributeError):
            ai_analysis = {"possible_causes": [], "recommendations": []}
    else:
        ai_analysis = {"possible_causes": [], "recommendations": []}

    return {
        "anomalies": anomalies,
        "statistics": {
            "average": round(avg, 2),
            "std_dev": round(std_dev, 2),
            "threshold": threshold
        },
        "ai_analysis": ai_analysis
    }


async def simulate_decision(metric_name: str, scenario: str, db: Session) -> dict:
    """决策模拟服务"""
    # 获取当前数据状态
    current = db.query(Metric).filter(
        Metric.name.like(f"%{metric_name}%")
    ).order_by(Metric.recorded_at.desc()).first()

    if not current:
        return {"simulation": "暂无数据进行模拟", "impacts": []}

    stats = db.query(
        func.avg(Metric.value).label('avg'),
        func.min(Metric.value).label('min'),
        func.max(Metric.value).label('max')
    ).filter(
        Metric.name.like(f"%{metric_name}%")
    ).first()

    prompt = f"""基于以下指标数据，模拟决策影响：

指标：{metric_name}
当前值：{current.value}
历史平均：{stats.avg:.2f}
历史范围：{stats.min:.2f} - {stats.max:.2f}

决策场景：{scenario}

请以JSON格式返回模拟结果：
{{"simulation": "模拟结论", "impacts": [{{"aspect": "影响方面", "impact": "具体影响", "probability": "high/medium/low"}}], "risks": ["风险1", "风险2"], "recommendations": ["建议1", "建议2"]}}
只返回JSON，不要其他内容。"""

    result = await chat_with_ai(prompt)
    try:
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {"simulation": "模拟失败", "impacts": [], "risks": [], "recommendations": []}
    except (json.JSONDecodeError, AttributeError):
        return {"simulation": "模拟失败", "impacts": [], "risks": [], "recommendations": []}
