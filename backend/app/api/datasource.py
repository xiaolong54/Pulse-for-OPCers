from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import httpx

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.api_source import ApiSource
from app.models.sync_log import SyncLog
from app.models.user import User

router = APIRouter(prefix="/api/datasources", tags=["datasources"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ApiSourceCreate(BaseModel):
    name: str
    endpoint: str
    method: str = "GET"
    auth_type: str = "none"
    auth_config: Dict[str, Any] = {}
    headers: Dict[str, Any] = {}
    data_mapping: Dict[str, Any] = {}
    sync_cron: str = ""


class ApiSourceUpdate(BaseModel):
    name: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    auth_type: Optional[str] = None
    auth_config: Optional[Dict[str, Any]] = None
    headers: Optional[Dict[str, Any]] = None
    data_mapping: Optional[Dict[str, Any]] = None
    sync_cron: Optional[str] = None
    status: Optional[str] = None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _source_to_dict(source: ApiSource) -> dict:
    return {
        "id": source.id,
        "name": source.name,
        "endpoint": source.endpoint,
        "method": source.method,
        "auth_type": source.auth_type,
        "auth_config": source.auth_config,
        "headers": source.headers,
        "data_mapping": source.data_mapping,
        "sync_cron": source.sync_cron,
        "last_sync_at": str(source.last_sync_at) if source.last_sync_at else None,
        "status": source.status,
        "created_at": str(source.created_at),
    }


def _log_to_dict(log: SyncLog) -> dict:
    return {
        "id": log.id,
        "source_id": log.source_id,
        "sync_type": log.sync_type,
        "status": log.status,
        "records_count": log.records_count,
        "error_message": log.error_message,
        "created_at": str(log.created_at),
    }


def _build_auth_headers(source: ApiSource) -> dict:
    """Build request headers based on auth configuration."""
    extra_headers: dict = dict(source.headers or {})

    auth_type = source.auth_type
    auth_config = source.auth_config or {}

    if auth_type == "bearer":
        token = auth_config.get("token", "")
        if token:
            extra_headers["Authorization"] = f"Bearer {token}"
    elif auth_type == "api_key":
        key = auth_config.get("api_key", "")
        header_name = auth_config.get("header_name", "X-API-Key")
        if key:
            extra_headers[header_name] = key
    elif auth_type == "basic":
        # httpx handles basic auth via the `auth` parameter, but we
        # encode it here for simplicity.
        import base64
        username = auth_config.get("username", "")
        password = auth_config.get("password", "")
        if username:
            credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
            extra_headers["Authorization"] = f"Basic {credentials}"

    return extra_headers


def _execute_sync(source: ApiSource) -> tuple[int, str]:
    """Call the remote API endpoint and return (records_count, error_message)."""
    headers = _build_auth_headers(source)
    method = (source.method or "GET").upper()

    try:
        with httpx.Client(timeout=30.0) as client:
            if method == "POST":
                resp = client.post(source.endpoint, headers=headers)
            elif method == "PUT":
                resp = client.put(source.endpoint, headers=headers)
            elif method == "PATCH":
                resp = client.patch(source.endpoint, headers=headers)
            else:
                resp = client.get(source.endpoint, headers=headers)

            resp.raise_for_status()

            # Try to count records from the JSON response
            data = resp.json()
            if isinstance(data, list):
                return len(data), ""
            elif isinstance(data, dict):
                # Common patterns: {"data": [...]} or {"items": [...], "total": N}
                for key in ("data", "items", "results", "records"):
                    if key in data and isinstance(data[key], list):
                        return len(data[key]), ""
                return 1, ""
            else:
                return 0, ""

    except httpx.HTTPStatusError as exc:
        return 0, f"HTTP {exc.response.status_code}: {exc.response.text[:500]}"
    except httpx.RequestError as exc:
        return 0, f"Request error: {str(exc)[:500]}"
    except Exception as exc:
        return 0, f"Unexpected error: {str(exc)[:500]}"


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("")
def list_datasources(
    status: Optional[str] = Query(None, description="按状态筛选"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取API数据源列表"""
    q = db.query(ApiSource)
    if status:
        q = q.filter(ApiSource.status == status)
    results = q.order_by(ApiSource.created_at.desc()).all()
    return [_source_to_dict(s) for s in results]


@router.post("")
def create_datasource(data: ApiSourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """创建API数据源"""
    source = ApiSource(
        name=data.name,
        endpoint=data.endpoint,
        method=data.method,
        auth_type=data.auth_type,
        auth_config=data.auth_config,
        headers=data.headers,
        data_mapping=data.data_mapping,
        sync_cron=data.sync_cron,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return _source_to_dict(source)


@router.put("/{source_id}")
def update_datasource(source_id: int, data: ApiSourceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """更新API数据源"""
    source = db.query(ApiSource).filter(ApiSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(source, key, value)

    db.commit()
    db.refresh(source)
    return _source_to_dict(source)


@router.delete("/{source_id}")
def delete_datasource(source_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """删除API数据源"""
    source = db.query(ApiSource).filter(ApiSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")

    db.delete(source)
    db.commit()
    return {"ok": True, "message": "数据源已删除"}


@router.post("/{source_id}/sync")
def sync_datasource(source_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """手动同步API数据源"""
    source = db.query(ApiSource).filter(ApiSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")

    # Create a pending sync log
    sync_log = SyncLog(source_id=source.id, sync_type="manual", status="running")
    db.add(sync_log)
    db.commit()
    db.refresh(sync_log)

    # Execute the actual sync
    records_count, error_message = _execute_sync(source)

    # Update sync log
    if error_message:
        sync_log.status = "failed"
        sync_log.error_message = error_message
    else:
        sync_log.status = "success"
        sync_log.records_count = records_count

    # Update source last_sync_at
    source.last_sync_at = datetime.utcnow()

    db.commit()
    db.refresh(sync_log)

    return _log_to_dict(sync_log)


@router.get("/{source_id}/logs")
def list_sync_logs(
    source_id: int,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取数据源的同步日志"""
    source = db.query(ApiSource).filter(ApiSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")

    logs = (
        db.query(SyncLog)
        .filter(SyncLog.source_id == source_id)
        .order_by(SyncLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [_log_to_dict(log) for log in logs]
