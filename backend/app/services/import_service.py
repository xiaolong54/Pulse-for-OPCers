import pandas as pd
import json
from io import BytesIO


def parse_file(file_content: bytes, filename: str) -> list[dict]:
    """解析上传的文件，返回记录列表"""
    ext = filename.split(".")[-1].lower()
    if ext in ["xlsx", "xls"]:
        df = pd.read_excel(BytesIO(file_content))
    elif ext == "csv":
        df = pd.read_csv(BytesIO(file_content))
    elif ext == "json":
        return json.loads(file_content)
    else:
        raise ValueError(f"不支持的文件格式: {ext}")
    # Replace NaN with None for JSON serialization
    df = df.where(pd.notnull(df), None)
    return df.to_dict("records")


def preview_data(records: list[dict]) -> dict:
    """生成数据预览（前10条记录）"""
    if not records:
        return {"columns": [], "rows": [], "total": 0}
    columns = list(records[0].keys())
    return {"columns": columns, "rows": records[:10], "total": len(records)}
