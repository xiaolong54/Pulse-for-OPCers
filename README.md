# Pulse for OPCers

> 🎯 专为小公司OPC（运营指挥中心）打造的智能决策工作台

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ 核心功能

### 📊 智能仪表盘
- KPI卡片：本月收入、成本、利润、增长率
- 30天趋势图（ECharts）
- AI自动生成的业务洞察

### 📈 数据分析
- 多维度筛选（分类、区域、时间）
- 折线图/柱状图切换
- 明细数据表格 + CSV导出

### ⚠️ 预警中心
- 预警列表（红/橙/绿三级）
- 一键处理预警
- 预警统计卡片

### 📄 报告中心
- AI自动生成报告（月度/季度/年度/自定义）
- 报告列表、预览、删除
- 多格式导出（PDF/Word/Excel）

### ✅ 任务管理
- 任务CRUD（创建、读取、更新、删除）
- 任务统计（全部、待办、进行中、已完成）
- 状态筛选、完成任务操作

### 📁 数据导入
- 支持Excel (.xlsx, .xls)、CSV (.csv)、JSON (.json) 格式
- 拖拽或点击上传文件
- 数据预览（显示前10行）
- 导入记录管理

### 🔗 API数据源
- API来源CRUD
- 手动同步
- 同步日志查看

### 🗄️ 数据库连接
- MySQL数据库连接
- 连接测试
- 数据同步

### 🤖 AI分析
- **趋势预测**：自定义时间范围，显示预测值和置信区间
- **智能分析建议**：一键生成关键洞察和行动建议
- **异常检测**：自动检测数据异常并分析原因
- **决策模拟**：输入决策方案，AI模拟结果和风险评估

### 💬 AI助手
- 右下角悬浮按钮
- 上下文感知对话
- 基于当前数据分析

## 🖥️ 界面预览

### 首页仪表盘
- 4个KPI卡片：本月收入、成本、利润、增长率
- 30天趋势图（ECharts）
- AI自动生成的业务洞察

### 数据分析
- 分类/区域/时间筛选
- 折线图/柱状图切换
- 明细数据表格 + CSV导出

### 报告中心
- AI自动生成报告
- 报告列表、预览、删除

### 任务管理
- 任务列表、统计卡片
- 状态筛选、完成任务操作

### 数据导入
- 拖拽上传 Excel/CSV/JSON 文件
- 数据预览、确认导入

### API数据源
- API来源CRUD
- 手动同步、同步日志

### 数据库连接
- MySQL连接配置
- 连接测试、数据同步

### AI分析
- 趋势预测图表
- 智能分析建议
- 异常检测结果
- 决策模拟分析

## 🚀 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### 1. 克隆项目

```bash
git clone https://github.com/xiaolong54/Pulse-for-OPCers.git
cd Pulse-for-OPCers
```

### 2. 启动数据库

```bash
docker-compose up -d postgres redis
```

### 3. 配置后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r app/requirements.txt

# 创建.env文件
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost/opc_workbench
AI_API_KEY=你的DeepSeek_API_Key
AI_API_URL=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat
SECRET_KEY=your-random-secret-key
EOF

# 初始化数据库
alembic upgrade head

# 导入种子数据
python -m app.seed

# 启动后端
uvicorn app.main:app --reload --port 8000
```

### 4. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 5. 访问应用

- 前端：http://localhost:3000
- 后端API：http://localhost:8000
- API文档：http://localhost:8000/docs

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 编辑者 | editor | editor123 |
| 查看者 | viewer | viewer123 |

## 📁 项目结构

```
Pulse-for-OPCers/
├── backend/                    # 后端服务
│   ├── app/
│   │   ├── api/               # API路由
│   │   │   ├── auth.py        # 用户认证
│   │   │   ├── dashboard.py   # 仪表盘API
│   │   │   ├── analysis.py    # 数据分析API
│   │   │   ├── alert.py       # 预警API
│   │   │   ├── report.py      # 报告API
│   │   │   ├── task.py        # 任务API
│   │   │   ├── import.py      # 导入API
│   │   │   ├── datasource.py  # 数据源API
│   │   │   ├── dbsource.py    # 数据库连接API
│   │   │   ├── ai.py          # AI对话API
│   │   │   └── ai_predict.py  # AI分析API
│   │   ├── models/            # 数据模型
│   │   ├── services/          # 业务服务
│   │   ├── core/              # 核心配置
│   │   └── seed.py            # 种子数据
│   ├── alembic/               # 数据库迁移
│   └── app/requirements.txt
│
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── pages/             # 页面组件
│   │   │   ├── Dashboard.tsx  # 首页仪表盘
│   │   │   ├── Analysis.tsx   # 数据分析
│   │   │   ├── Alerts.tsx     # 预警中心
│   │   │   ├── Reports.tsx    # 报告中心
│   │   │   ├── Tasks.tsx      # 任务管理
│   │   │   ├── Import.tsx     # 数据导入
│   │   │   ├── DataSources.tsx # API数据源
│   │   │   ├── DbSources.tsx  # 数据库连接
│   │   │   ├── AIAnalysis.tsx # AI分析
│   │   │   └── Login.tsx      # 登录页
│   │   ├── components/        # 公共组件
│   │   │   ├── Sidebar.tsx    # 侧边栏
│   │   │   └── AIPanel.tsx    # AI对话面板
│   │   ├── services/          # API服务
│   │   └── store/             # 状态管理
│   └── package.json
│
├── docker-compose.yml          # Docker配置
└── docs/                       # 项目文档
    ├── superpowers/specs/      # 设计文档
    └── superpowers/plans/      # 实施计划
```

## 🛠️ 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **UI库**：Ant Design 5
- **图表**：ECharts
- **状态管理**：Zustand
- **构建工具**：Vite

### 后端
- **框架**：FastAPI
- **数据库**：PostgreSQL
- **ORM**：SQLAlchemy
- **缓存**：Redis
- **认证**：JWT

### AI
- **模型**：DeepSeek Chat
- **能力**：对话分析、数据洞察、趋势预测、决策模拟、异常检测

## 📊 数据模型

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| metrics | 业务指标表 |
| alert_rules | 预警规则表 |
| alerts | 预警记录表 |
| reports | 报告表 |
| tasks | 任务表 |
| import_records | 导入记录表 |
| api_sources | API数据源表 |
| db_sources | 数据库连接表 |
| sync_logs | 同步日志表 |

## 🔧 API接口

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户

### 仪表盘
- `GET /api/dashboard/kpi` - 获取KPI数据
- `GET /api/dashboard/trend` - 获取趋势数据
- `GET /api/dashboard/insights` - 获取AI洞察

### 数据分析
- `GET /api/analysis/categories` - 获取分类列表
- `GET /api/analysis/regions` - 获取区域列表
- `GET /api/analysis/data` - 获取数据列表
- `GET /api/analysis/chart-data` - 获取图表数据

### 预警
- `GET /api/alerts` - 获取预警列表
- `GET /api/alerts/stats` - 获取预警统计
- `POST /api/alerts/{id}/resolve` - 处理预警

### 报告
- `GET /api/reports` - 获取报告列表
- `POST /api/reports/generate` - AI生成报告
- `GET /api/reports/{id}` - 获取报告详情
- `DELETE /api/reports/{id}` - 删除报告

### 任务
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/{id}` - 更新任务
- `DELETE /api/tasks/{id}` - 删除任务
- `POST /api/tasks/{id}/complete` - 完成任务
- `GET /api/tasks/stats` - 任务统计

### 数据导入
- `POST /api/import/upload` - 上传文件
- `POST /api/import/confirm/{id}` - 确认导入
- `GET /api/import/records` - 导入记录

### API数据源
- `GET /api/datasources` - 获取数据源列表
- `POST /api/datasources` - 创建数据源
- `PUT /api/datasources/{id}` - 更新数据源
- `DELETE /api/datasources/{id}` - 删除数据源
- `POST /api/datasources/{id}/sync` - 手动同步
- `GET /api/datasources/{id}/logs` - 同步日志

### 数据库连接
- `GET /api/db-sources` - 获取数据库连接列表
- `POST /api/db-sources` - 创建连接
- `DELETE /api/db-sources/{id}` - 删除连接
- `POST /api/db-sources/{id}/test` - 测试连接
- `POST /api/db-sources/{id}/sync` - 手动同步
- `GET /api/db-sources/{id}/tables` - 获取表列表

### AI分析
- `POST /api/ai/chat` - AI对话
- `POST /api/ai/predict` - 趋势预测
- `POST /api/ai/analyze` - 智能分析建议
- `POST /api/ai/detect-anomaly` - 异常检测
- `POST /api/ai/simulate` - 决策模拟

## 📝 开发说明

### 添加新页面

1. 在 `frontend/src/pages/` 创建页面组件
2. 在 `frontend/src/App.tsx` 添加路由
3. 在 `frontend/src/components/Sidebar.tsx` 添加菜单项

### 添加新API

1. 在 `backend/app/api/` 创建路由文件
2. 在 `backend/app/main.py` 注册路由
3. 在 `frontend/src/services/` 创建API服务

### 数据库迁移

```bash
# 创建迁移
alembic revision --autogenerate -m "描述"

# 执行迁移
alembic upgrade head
```

## 🐳 Docker部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

- GitHub：[@xiaolong54](https://github.com/xiaolong54)
- 项目地址：[Pulse-for-OPCers](https://github.com/xiaolong54/Pulse-for-OPCers)

---

**Pulse** - 让决策更智能 🚀
