from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.import_record import ImportRecord
from app.models.user import User
from app.services.import_service import parse_file, preview_data

router = APIRouter(prefix="/api/import", tags=["import"])

# In-memory store for parsed data awaiting confirmation
# Key: import record ID, Value: parsed records list
_pending_data: dict[int, list[dict]] = {}


class ImportRecordResponse(BaseModel):
    id: int
    filename: str
    file_type: Optional[str] = None
    file_size: int
    records_count: int
    status: str
    error_message: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PreviewResponse(BaseModel):
    id: int
    filename: str
    columns: list[str]
    rows: list[dict]
    total: int


@router.post("/upload", response_model=PreviewResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """上传文件并解析，返回数据预览"""
    # Validate file extension
    filename = file.filename or "unknown"
    ext = filename.split(".")[-1].lower()
    supported = ["xlsx", "xls", "csv", "json"]
    if ext not in supported:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式: {ext}，支持的格式: {', '.join(supported)}",
        )

    # Read file content
    content = await file.read()
    file_size = len(content)

    # Create import record with pending status
    record = ImportRecord(
        filename=filename,
        file_type=ext,
        file_size=file_size,
        status="pending",
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Parse file
    try:
        records = parse_file(content, filename)
    except Exception as e:
        record.status = "failed"
        record.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=400, detail=f"文件解析失败: {e}")

    # Store parsed data in memory for later confirmation
    _pending_data[record.id] = records
    record.records_count = len(records)
    db.commit()

    # Return preview
    preview = preview_data(records)
    return PreviewResponse(
        id=record.id,
        filename=filename,
        columns=preview["columns"],
        rows=preview["rows"],
        total=preview["total"],
    )


@router.post("/confirm/{record_id}")
def confirm_import(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """确认导入，将状态更新为成功"""
    record = db.query(ImportRecord).filter(ImportRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="导入记录不存在")

    if record.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"当前状态为 {record.status}，无法确认导入",
        )

    # Check if parsed data exists
    if record_id not in _pending_data:
        raise HTTPException(
            status_code=400,
            detail="解析数据已过期，请重新上传文件",
        )

    # Mark as success and clean up
    record.status = "success"
    db.commit()

    # Remove from pending store
    records = _pending_data.pop(record_id, [])

    return {
        "success": True,
        "message": f"成功导入 {record.records_count} 条记录",
        "record_id": record_id,
        "records_count": record.records_count,
    }


@router.get("/records")
def list_import_records(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取导入记录列表"""
    query = db.query(ImportRecord)
    if status:
        query = query.filter(ImportRecord.status == status)
    total = query.count()
    records = (
        query.order_by(ImportRecord.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {
        "total": total,
        "records": [
            {
                "id": r.id,
                "filename": r.filename,
                "file_type": r.file_type,
                "file_size": r.file_size,
                "records_count": r.records_count,
                "status": r.status,
                "error_message": r.error_message,
                "created_at": str(r.created_at) if r.created_at else None,
            }
            for r in records
        ],
    }
