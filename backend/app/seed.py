"""运行: python -m app.seed"""
from app.core.database import SessionLocal, engine, Base
from app.models.metric import Metric
from app.models.alert import Alert, AlertRule
from app.models.user import User
from app.models.report import Report
from app.core.security import hash_password
from datetime import datetime, timedelta
import random

# 创建表
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# 检查是否已有数据
if db.query(User).first():
    print("数据已存在，跳过")
    exit()

print("创建种子数据...")

# 1. 创建默认用户
users = [
    User(username="admin", password_hash=hash_password("admin123"), role="admin"),
    User(username="editor", password_hash=hash_password("editor123"), role="editor"),
    User(username="viewer", password_hash=hash_password("viewer123"), role="viewer"),
]
db.add_all(users)
db.flush()

# 2. 创建30天的指标数据
categories = ["销售", "成本", "利润"]
regions = ["华东", "华南", "华北", "西南", "东北"]
units = {"销售": "万元", "成本": "万元", "利润": "万元"}

metrics = []
for day in range(30):
    date = datetime.now() - timedelta(days=29 - day)
    for cat in categories:
        for region in regions:
            # 基础值 + 随机波动
            base = {"销售": 50, "成本": 30, "利润": 20}[cat]
            value = base + random.uniform(-10, 10)
            metrics.append(Metric(
                name=f"{cat}-{region}",
                value=round(value, 2),
                unit=units[cat],
                category=cat,
                region=region,
                recorded_at=date
            ))

db.add_all(metrics)
db.flush()

# 3. 创建预警规则
rules = [
    AlertRule(metric_name="销售", condition="<", threshold=30, severity="high"),
    AlertRule(metric_name="成本", condition=">", threshold=45, severity="medium"),
    AlertRule(metric_name="利润", condition="<", threshold=10, severity="high"),
    AlertRule(metric_name="销售", condition="<", threshold=40, severity="warning"),
]
db.add_all(rules)
db.flush()

# 4. 创建预警记录
alerts = [
    Alert(rule_id=1, message="华东区域销售额低于安全线（28万元）", severity="high", status="pending"),
    Alert(rule_id=2, message="华南区域成本超预算（48万元）", severity="medium", status="pending"),
    Alert(rule_id=3, message="华北区域利润过低（8万元）", severity="high", status="resolved"),
    Alert(rule_id=4, message="西南区域销售下滑", severity="warning", status="pending"),
]
db.add_all(alerts)
db.flush()

# 5. 创建报告
reports = [
    Report(title="2024年6月运营报告", type="monthly", content="本月整体运营情况良好...", generated_by="ai"),
    Report(title="Q2季度分析报告", type="quarterly", content="Q2季度各项指标稳步增长...", generated_by="ai"),
    Report(title="华东区域专项分析", type="custom", content="华东区域表现突出...", generated_by="ai"),
]
db.add_all(reports)

# 提交
db.commit()
db.close()

print("种子数据创建成功！")

print("\n用户账号：")
print("  管理员：admin / admin123")
print("  编辑者：editor / editor123")
print("  查看者：viewer / viewer123")
print(f"\n数据统计：")
print(f"  用户：3个")
print(f"  指标数据：{len(metrics)}条")
print(f"  预警规则：{len(rules)}条")
print(f"  预警记录：{len(alerts)}条")
print(f"  报告：{len(reports)}条")
