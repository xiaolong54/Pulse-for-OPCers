from app.models.report import Report
from app.services.ai_service import chat_with_ai
from datetime import datetime
from sqlalchemy.orm import Session


async def generate_report_content(report_type: str, data_context: str) -> str:
    """使用AI生成报告内容"""
    prompt = f"生成{report_type}报告，基于以下数据：{data_context}\n请包含：概述、数据分析、趋势、建议。"
    return await chat_with_ai(prompt)


def get_reports(
    db: Session,
    report_type: str = None,
    format: str = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    """获取报告列表"""
    q = db.query(Report)
    if report_type:
        q = q.filter(Report.type == report_type)
    if format:
        q = q.filter(Report.format == format)
    total = q.count()
    reports = q.order_by(Report.created_at.desc()).offset(offset).limit(limit).all()
    return {
        "total": total,
        "items": [
            {
                "id": r.id,
                "title": r.title,
                "type": r.type,
                "format": r.format,
                "data_range": r.data_range,
                "file_size": r.file_size,
                "download_count": r.download_count,
                "generated_by": r.generated_by,
                "created_at": str(r.created_at),
            }
            for r in reports
        ],
    }


def get_report_by_id(db: Session, report_id: int) -> dict | None:
    """获取报告详情"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return None
    return {
        "id": report.id,
        "title": report.title,
        "type": report.type,
        "content": report.content,
        "format": report.format,
        "data_range": report.data_range,
        "file_path": report.file_path,
        "file_size": report.file_size,
        "download_count": report.download_count,
        "generated_by": report.generated_by,
        "created_at": str(report.created_at),
        "updated_at": str(report.updated_at) if report.updated_at else None,
    }


def create_report(db: Session, report_data: dict) -> dict:
    """创建报告记录"""
    report = Report(**report_data)
    db.add(report)
    db.commit()
    db.refresh(report)
    return {
        "id": report.id,
        "title": report.title,
        "type": report.type,
        "format": report.format,
        "data_range": report.data_range,
        "generated_by": report.generated_by,
        "created_at": str(report.created_at),
    }


def delete_report(db: Session, report_id: int) -> bool:
    """删除报告"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return False
    db.delete(report)
    db.commit()
    return True


def increment_download_count(db: Session, report_id: int) -> bool:
    """增加下载次数"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return False
    report.download_count += 1
    db.commit()
    return True
