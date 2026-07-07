from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.db_source import DbSource
from app.models.user import User
from app.services import dbsource_service

router = APIRouter(prefix="/api/db-sources", tags=["db-sources"])


# -- Pydantic schemas -----------------------------------------------------------

class DbSourceCreate(BaseModel):
    name: str
    db_type: str = "mysql"
    host: str
    port: int = 3306
    database_name: str
    username: str = ""
    password_encrypted: str = ""
    table_name: str = ""
    sync_mode: str = "full"
    sync_cron: str = ""


class DbSourceUpdate(BaseModel):
    name: Optional[str] = None
    db_type: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None
    password_encrypted: Optional[str] = None
    table_name: Optional[str] = None
    sync_mode: Optional[str] = None
    sync_cron: Optional[str] = None
    status: Optional[str] = None


# -- Helpers ---------------------------------------------------------------------

def _source_to_dict(source: DbSource) -> dict:
    return {
        "id": source.id,
        "name": source.name,
        "db_type": source.db_type,
        "host": source.host,
        "port": source.port,
        "database_name": source.database_name,
        "username": source.username,
        "password_encrypted": "***",
        "table_name": source.table_name,
        "sync_mode": source.sync_mode,
        "sync_cron": source.sync_cron,
        "last_sync_at": str(source.last_sync_at) if source.last_sync_at else None,
        "status": source.status,
        "created_at": str(source.created_at) if source.created_at else None,
    }


def _get_source_or_404(source_id: int, db: Session) -> DbSource:
    source = db.query(DbSource).filter(DbSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="数据库源不存在")
    return source


# -- Endpoints -------------------------------------------------------------------

@router.get("")
def list_db_sources(
    status: Optional[str] = Query(None, description="按状态筛选"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取数据库连接列表"""
    q = db.query(DbSource)
    if status:
        q = q.filter(DbSource.status == status)
    results = q.order_by(DbSource.created_at.desc()).all()
    return [_source_to_dict(s) for s in results]


@router.post("")
def create_db_source(data: DbSourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """创建数据库连接"""
    source = DbSource(
        name=data.name,
        db_type=data.db_type,
        host=data.host,
        port=data.port,
        database_name=data.database_name,
        username=data.username,
        password_encrypted=data.password_encrypted,
        table_name=data.table_name,
        sync_mode=data.sync_mode,
        sync_cron=data.sync_cron,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return _source_to_dict(source)


@router.put("/{source_id}")
def update_db_source(source_id: int, data: DbSourceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """更新数据库连接"""
    source = _get_source_or_404(source_id, db)
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(source, key, value)
    db.commit()
    db.refresh(source)
    return _source_to_dict(source)


@router.delete("/{source_id}")
def delete_db_source(source_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """删除数据库连接"""
    source = _get_source_or_404(source_id, db)
    db.delete(source)
    db.commit()
    return {"ok": True, "message": "数据库连接已删除"}


@router.post("/{source_id}/test")
def test_db_connection(source_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """测试数据库连接"""
    source = _get_source_or_404(source_id, db)
    return dbsource_service.test_connection(source)


@router.post("/{source_id}/sync")
def sync_db_source(source_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """手动同步数据库"""
    return dbsource_service.sync_from_db(source_id, db)


@router.get("/{source_id}/tables")
def get_db_tables(source_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """获取数据库表列表"""
    source = _get_source_or_404(source_id, db)
    return dbsource_service.get_tables(source)
