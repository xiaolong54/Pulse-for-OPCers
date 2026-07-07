from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.report_service import (
    generate_report_content,
    get_reports,
    get_report_by_id,
    create_report,
    delete_report,
    increment_download_count,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])


class GenerateReportRequest(BaseModel):
    title: str
    report_type: str = "custom"
    data_context: str = ""
    format: str = "markdown"
    data_range: str = ""


class ReportResponse(BaseModel):
    id: int
    title: str
    type: str
    format: str
    data_range: str
    file_size: int
    download_count: int
    generated_by: str
    created_at: str


@router.get("")
def list_reports(
    report_type: Optional[str] = Query(None, description="报告类型"),
    format: Optional[str] = Query(None, description="报告格式"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取报告列表"""
    return get_reports(db, report_type=report_type, format=format, limit=limit, offset=offset)


@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """获取报告详情"""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    return report


@router.post("/generate")
async def generate_report(req: GenerateReportRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """AI生成报告"""
    # 使用AI生成报告内容
    content = await generate_report_content(req.report_type, req.data_context)

    # 计算文件大小（UTF-8编码的字节数）
    file_size = len(content.encode("utf-8"))

    # 创建报告记录
    report_data = {
        "title": req.title,
        "type": req.report_type,
        "content": content,
        "format": req.format,
        "data_range": req.data_range,
        "file_size": file_size,
        "generated_by": "ai",
    }
    report = create_report(db, report_data)

    return {
        **report,
        "content": content,
    }


@router.delete("/{report_id}")
def remove_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """删除报告"""
    success = delete_report(db, report_id)
    if not success:
        raise HTTPException(status_code=404, detail="报告不存在")
    return {"success": True, "message": "报告已删除"}


@router.post("/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """下载报告（记录下载次数）"""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    increment_download_count(db, report_id)
    return {
        "id": report["id"],
        "title": report["title"],
        "content": report["content"],
        "format": report["format"],
    }
