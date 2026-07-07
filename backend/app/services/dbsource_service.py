import pymysql
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.models.db_source import DbSource


def _build_connection_url(source: DbSource) -> str:
    """Build a PyMySQL-compatible SQLAlchemy connection URL from a DbSource."""
    password = source.password_encrypted or ""
    return (
        f"mysql+pymysql://{source.username}:{password}"
        f"@{source.host}:{source.port}/{source.database_name}"
        f"?charset=utf8mb4"
    )


def _make_engine(source: DbSource):
    """Create a short-lived SQLAlchemy engine for the given external database."""
    url = _build_connection_url(source)
    return create_engine(url, pool_pre_ping=True, connect_args={"connect_timeout": 10})


def test_connection(source: DbSource) -> dict:
    """
    Test connectivity to the database represented by *source*.

    Returns {"success": True, "message": "..."} on success,
    or {"success": False, "message": "..."} on failure.
    """
    engine = _make_engine(source)
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"success": True, "message": "连接成功"}
    except Exception as exc:
        return {"success": False, "message": f"连接失败: {exc}"}
    finally:
        engine.dispose()


def get_tables(source: DbSource) -> list[dict]:
    """
    Return a list of tables (with row counts) in the target database.

    Each element: {"name": "...", "rows": int}
    """
    engine = _make_engine(source)
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]

            table_list = []
            for tbl in tables:
                try:
                    count_result = conn.execute(text(f"SELECT COUNT(*) FROM `{tbl}`"))
                    row_count = count_result.scalar()
                except Exception:
                    row_count = 0
                table_list.append({"name": tbl, "rows": row_count})
            return table_list
    finally:
        engine.dispose()


def sync_from_db(source_id: int, db: Session) -> dict:
    """
    Sync (pull) data from the external MySQL database.

    For now this performs a lightweight connectivity check and records the
    sync timestamp. A full ETL pipeline can be layered on later.

    Returns a result dict suitable for the API response.
    """
    source = db.query(DbSource).filter(DbSource.id == source_id).first()
    if not source:
        return {"success": False, "message": "数据源不存在"}

    engine = _make_engine(source)
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

            # If a table_name is specified, count its rows
            records_count = 0
            if source.table_name:
                try:
                    result = conn.execute(
                        text(f"SELECT COUNT(*) FROM `{source.table_name}`")
                    )
                    records_count = result.scalar()
                except Exception:
                    pass

        source.last_sync_at = datetime.utcnow()
        db.commit()

        return {
            "success": True,
            "message": "同步成功",
            "records_count": records_count,
            "last_sync_at": str(source.last_sync_at),
        }
    except Exception as exc:
        return {"success": False, "message": f"同步失败: {exc}"}
    finally:
        engine.dispose()
