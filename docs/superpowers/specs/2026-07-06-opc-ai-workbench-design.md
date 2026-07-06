# 智能OPC决策工作台 设计文档

## 1. 项目概述

### 1.1 项目定位

为小公司OPC（运营指挥中心）和决策者打造的智能决策工作台，通过AI能力主动分析数据、发现异常、生成报告、提供决策建议。

**核心理念：** 简约但智能，好用优先。

### 1.2 目标用户

| 用户类型 | 使用场景 |
|----------|----------|
| OPC运营人员 | 日常监控、异常处理 |
| 部门经理 | 数据分析、资源调度 |
| 公司决策者（C-level） | 关键指标查看、决策参考 |

### 1.3 核心价值

| 传统系统 | 智能工作台 |
|----------|------------|
| 用户手动查数据 | AI主动推送洞察 |
| 用户自己看异常 | 自动检测预警 |
| 手动整理报告 | AI自动生成 |
| 无决策建议 | AI给出行动方案 |
| 固定报表 | 对话式探索 |

---

## 2. 功能设计

### 2.1 页面结构

```
OPC决策工作台
│
├── 1. 首页（仪表盘）— 关键指标概览
│
├── 2. 数据分析 — 深入查看图表和数据
│
├── 3. 报告中心 — 查看/生成/导出报告
│
├── 4. 预警中心 — 预警列表和处理
│
├── 5. 任务管理 — 项目排期和任务分配
│
├── 6. 设置 — 数据源、阈值、偏好
│
└── AI助手（侧边栏）— 随时可用的AI对话
```

### 2.2 各页面功能

#### 2.2.1 首页（仪表盘）

**目的：** 一眼看到业务全貌

**功能：**
- KPI卡片（4个关键指标：收入、成本、利润、客户）
- 趋势图（30天趋势，可切换指标）
- AI洞察卡片（3条关键洞察，AI自动生成）
- 最近预警（2-3条，点击跳转预警中心）

**交互：**
- KPI卡片点击 → 跳转数据分析页
- 趋势图支持时间范围切换
- AI洞察支持"查看详情"和"生成报告"

#### 2.2.2 数据分析页

**目的：** 深入探索数据

**功能：**
- 筛选栏（时间范围、指标、区域）
- 主图表区域（支持柱状图、折线图、饼图切换）
- 明细数据表格
- 数据导出（CSV/Excel）
- 内嵌AI问答（"问AI关于这些数据"）

**交互：**
- 图表支持缩放、hover查看详情
- 表格支持排序、筛选
- AI问答基于当前筛选的数据

#### 2.2.3 报告中心

**目的：** 管理和生成分析报告

**功能：**
- 报告列表（按时间排序）
- 报告预览和下载（PDF/Word）
- AI生成报告（选择类型：月度/季度/专项/自定义）
- 报告模板管理

**交互：**
- 点击报告 → 预览
- 选择报告类型 → AI自动生成
- 支持自定义报告模板

#### 2.2.4 预警中心

**目的：** 及时发现和处理异常

**功能：**
- 预警列表（按严重程度：红/黄/绿）
- 预警筛选（状态、严重程度）
- 预警处理（标记已处理、添加备注）
- 阈值设置（跳转设置页）
- 预警趋势统计

**交互：**
- 点击预警 → 查看详情和建议
- 批量处理
- 预警趋势图表

#### 2.2.5 任务管理

**目的：** 项目排期和任务跟踪

**功能：**
- 视图切换（列表/看板/甘特图）
- 任务CRUD（创建、编辑、完成、删除）
- 任务分配（负责人、截止日期）
- 进度跟踪
- AI排期建议

**交互：**
- 拖拽调整任务状态
- 点击任务 → 编辑详情
- AI排期 → 自动生成任务分解

#### 2.2.6 设置页

**目的：** 配置系统参数

**功能：**
- 数据源管理（添加/编辑/删除数据源）
- 预警阈值设置
- AI模型配置（选择模型、API Key）
- 用户偏好（语言、主题、通知方式）
- 团队管理（用户、权限）

#### 2.2.7 AI助手（侧边栏）

**目的：** 随时可用的AI对话，但不是主体

**功能：**
- 对话式问答
- 基于当前页面数据回答
- 支持追问和深入分析
- 可收起/展开

**交互：**
- 默认收起，不抢主界面
- 点击展开，支持对话
- 上下文感知（知道用户在看什么数据）

---

## 3. 技术架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    前端（模块化）                         │
│  React + Ant Design + ECharts/AntV                      │
├─────────────────────────────────────────────────────────┤
│                    后端                                   │
│  Python (FastAPI) + PostgreSQL + Redis                  │
├─────────────────────────────────────────────────────────┤
│                    AI层（插件化）                        │
│  国内AI API（通义千问/智谱/文心一言）                    │
└─────────────────────────────────────────────────────────┘
```

### 3.2 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端框架** | React 18 | 生态成熟，组件丰富 |
| **UI组件库** | Ant Design 5 | 国内生态好，组件全 |
| **图表库** | ECharts / AntV | 强大的数据可视化 |
| **状态管理** | Zustand / Redux Toolkit | 轻量级状态管理 |
| **路由** | React Router v6 | 标准路由方案 |
| **后端框架** | FastAPI (Python) | 异步高性能，AI生态好 |
| **数据库** | PostgreSQL | 主业务数据存储 |
| **缓存** | Redis | 热点数据缓存 |
| **AI接口** | 通义千问/智谱 API | 国内商业AI |
| **任务调度** | Celery | 定时分析任务 |
| **部署** | Docker + Docker Compose | 容器化部署 |

### 3.3 目录结构

```
opc-workbench/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── pages/            # 页面模块
│   │   │   ├── Dashboard/    # 首页
│   │   │   ├── Analysis/     # 数据分析
│   │   │   ├── Report/       # 报告中心
│   │   │   ├── Alert/        # 预警中心
│   │   │   ├── Task/         # 任务管理
│   │   │   ├── Settings/     # 设置
│   │   │   └── _extensions/  # 扩展页面
│   │   │
│   │   ├── components/       # 共享组件
│   │   │   ├── Charts/       # 图表组件
│   │   │   ├── Cards/        # 卡片组件
│   │   │   ├── Tables/       # 表格组件
│   │   │   └── AI/           # AI相关组件
│   │   │
│   │   ├── services/         # API服务
│   │   ├── hooks/            # 自定义Hook
│   │   ├── store/            # 状态管理
│   │   ├── utils/            # 工具函数
│   │   └── config/           # 配置
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # 后端项目
│   ├── app/
│   │   ├── modules/          # 业务模块
│   │   │   ├── data/         # 数据模块
│   │   │   ├── analysis/     # 分析模块
│   │   │   ├── report/       # 报告模块
│   │   │   ├── alert/        # 预警模块
│   │   │   ├── task/         # 任务模块
│   │   │   └── user/         # 用户模块
│   │   │
│   │   ├── services/         # 业务服务
│   │   ├── models/           # 数据模型
│   │   ├── api/              # API路由
│   │   ├── core/             # 核心配置
│   │   └── utils/            # 工具函数
│   │
│   ├── alembic/              # 数据库迁移
│   ├── requirements.txt
│   └── main.py
│
├── ai/                       # AI能力层
│   ├── plugins/              # AI插件
│   │   ├── analyzer.py       # 数据分析插件
│   │   ├── reporter.py       # 报告生成插件
│   │   ├── predictor.py      # 预测插件
│   │   └── advisor.py        # 决策建议插件
│   │
│   ├── prompts/              # 提示词模板
│   │   ├── analysis.md
│   │   ├── report.md
│   │   └── advice.md
│   │
│   └── adapters/             # 模型适配器
│       ├── zhipu.py          # 智谱
│       ├── qwen.py           # 通义千问
│       └── ernie.py          # 文心一言
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. 数据设计

### 4.1 核心数据表

```sql
-- 业务指标数据
CREATE TABLE metrics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),        -- 指标名称
    value DECIMAL(15,2),      -- 指标值
    unit VARCHAR(20),         -- 单位
    category VARCHAR(50),     -- 分类
    region VARCHAR(50),       -- 区域
    recorded_at TIMESTAMP,    -- 记录时间
    created_at TIMESTAMP DEFAULT NOW()
);

-- 预警规则
CREATE TABLE alert_rules (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100), -- 监控指标
    condition VARCHAR(20),    -- 条件（>, <, =）
    threshold DECIMAL(15,2),  -- 阈值
    severity VARCHAR(20),     -- 严重程度
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 预警记录
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES alert_rules(id),
    message TEXT,             -- 预警信息
    severity VARCHAR(20),     -- 严重程度
    status VARCHAR(20) DEFAULT 'pending', -- pending/resolved
    resolved_at TIMESTAMP,
    resolved_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 报告
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),       -- 报告标题
    type VARCHAR(50),         -- 类型（monthly/quarterly/custom）
    content TEXT,             -- 报告内容
    file_path VARCHAR(500),   -- 文件路径
    generated_by VARCHAR(20), -- 'ai' or 'manual'
    created_at TIMESTAMP DEFAULT NOW()
);

-- 任务
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),       -- 任务标题
    description TEXT,         -- 任务描述
    project VARCHAR(100),     -- 所属项目
    assignee_id INTEGER,      -- 负责人
    status VARCHAR(20) DEFAULT 'todo', -- todo/in_progress/done
    priority VARCHAR(20),     -- priority
    due_date DATE,            -- 截止日期
    parent_id INTEGER REFERENCES tasks(id), -- 父任务
    created_at TIMESTAMP DEFAULT NOW()
);

-- 用户
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100),
    password_hash VARCHAR(200),
    role VARCHAR(20) DEFAULT 'viewer', -- admin/editor/viewer
    preferences JSONB,        -- 用户偏好
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. AI能力设计

### 5.1 AI插件架构

```python
# AI插件接口
class AIPlugin:
    def __init__(self, adapter):
        self.adapter = adapter  # 模型适配器

    async def execute(self, context):
        raise NotImplementedError

# 数据分析插件
class AnalysisPlugin(AIPlugin):
    async def execute(self, data, question):
        prompt = self.build_prompt(data, question)
        result = await self.adapter.chat(prompt)
        return self.parse_result(result)

# 报告生成插件
class ReportPlugin(AIPlugin):
    async def execute(self, data, report_type):
        prompt = self.build_prompt(data, report_type)
        result = await self.adapter.chat(prompt)
        return self.format_report(result)

# 决策建议插件
class AdvisorPlugin(AIPlugin):
    async def execute(self, context):
        prompt = self.build_prompt(context)
        result = await self.adapter.chat(prompt)
        return self.parse_advice(result)
```

### 5.2 核心AI功能

| 功能 | 说明 | 触发方式 |
|------|------|----------|
| 数据分析 | 分析数据趋势、异常 | 用户提问/定时任务 |
| 报告生成 | 自动生成分析报告 | 用户请求/定时任务 |
| 异常检测 | 检测数据异常 | 定时任务 |
| 决策建议 | 提供行动建议 | 用户提问 |
| 智能预警 | AI增强的预警 | 数据变化时 |

---

## 6. UI/UX设计原则

### 6.1 设计风格

参考产品：
- **Linear** — 极简、专注、快
- **Notion** — 简洁但强大
- **Stripe** — 清晰的数据展示
- **Vercel** — 极简、好用

### 6.2 核心原则

1. **一眼看到关键指标** — 不需要点击
2. **AI洞察主动展示** — 不需要问
3. **需要深入时再探索** — 对话式交互
4. **智能但不打扰** — 预警在角落，不弹窗
5. **对话是辅助** — 侧边栏，不抢主界面

### 6.3 色彩方案

```
主色：#1677FF（Ant Design蓝）
成功：#52C41A（绿色）
警告：#FAAD14（黄色）
错误：#FF4D4F（红色）
背景：#F5F5F5（浅灰）
文字：#333333（深灰）
```

---

## 7. 扩展性设计

### 7.1 扩展点

| 扩展方向 | 设计方式 | 示例 |
|----------|----------|------|
| 新页面 | 路由模块化 | 新增"客户分析"页面 |
| 新功能 | 组件化 | 新增"数据对比"功能 |
| 新数据源 | 适配器模式 | 接入ERP、CRM系统 |
| 新AI能力 | 插件机制 | 接入预测模型 |
| 新图表 | 图表注册机制 | 自定义漏斗图 |
| 新报告模板 | 模板引擎 | 自定义报告格式 |

### 7.2 扩展模块预留

```
预留扩展模块
├── 📦 自定义仪表盘（用户自建看板）
├── 📦 多项目/多部门切换
├── 📦 团队协作（评论、@提醒）
├── 📦 更多数据源接入
├── 📦 更多AI能力（预测、模拟）
├── 📦 移动端适配
├── 📦 API开放平台
└── 📦 插件市场（自定义图表、报告模板）
```

---

## 8. MVP范围

### 第一阶段（MVP）— 2-3周

```
✅ 首页仪表盘（KPI + 趋势图 + AI洞察）
✅ 数据分析（基础图表 + 筛选 + 表格）
✅ 预警中心（基础预警列表）
✅ AI对话（侧边栏，基础问答）
✅ 用户登录
```

### 第二阶段 — 2-3周

```
✅ 报告中心（查看/生成/导出）
✅ 任务管理（列表/看板）
✅ 更多图表类型
✅ AI洞察增强
✅ 数据导入（Excel/CSV）
```

### 第三阶段 — 持续迭代

```
✅ 扩展模块
✅ 更多数据源
✅ 高级AI功能
✅ 移动端
✅ 团队协作
```

---

## 9. 部署方案

### 9.1 开发环境

```bash
# 前端
cd frontend && npm install && npm run dev

# 后端
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# 数据库
docker-compose up -d postgres redis
```

### 9.2 生产环境

```bash
# Docker Compose一键部署
docker-compose up -d
```

### 9.3 部署成本

| 组件 | 方案 | 月成本 |
|------|------|--------|
| 服务器 | 阿里云/腾讯云 2核4G | ¥100-200 |
| 数据库 | 云数据库PostgreSQL | ¥50-100 |
| AI API | 通义千问/智谱 | ¥50-200 |
| 域名 | .com域名 | ¥50/年 |
| **总计** | | **¥200-500/月** |

---

## 10. 数据接入方案

### 10.1 MVP阶段数据接入

| 方式 | 说明 | 优先级 |
|------|------|--------|
| **手动录入** | 表单输入关键指标 | P0 |
| **Excel/CSV上传** | 批量导入历史数据 | P0 |
| **API对接** | 对接企业现有系统 | P1 |

### 10.2 数据流程

```
数据来源 → 数据校验 → 数据清洗 → 数据存储 → 数据展示
   │           │           │           │           │
   ▼           ▼           ▼           ▼           ▼
 Excel      格式检查    去重/补全    PostgreSQL   仪表盘
 手动录入   类型检查    标准化       时序存储     图表
 API       范围检查                             AI分析
```

### 10.3 数据质量保障

- **录入校验**：格式、类型、范围检查
- **去重机制**：防止重复导入
- **异常标记**：异常数据标记但不丢弃
- **审计日志**：记录数据变更历史

---

## 11. 实时性设计

### 11.1 数据刷新策略

| 场景 | 刷新方式 | 说明 |
|------|----------|------|
| 首页KPI | 轮询（30s） | 轻量级，适合小数据量 |
| 预警通知 | WebSocket | 实时推送 |
| 图表数据 | 手动刷新 | 用户主动触发 |

### 11.2 实现方案

- **WebSocket**：用于预警通知、实时消息
- **轮询**：用于KPI数据更新
- **手动刷新**：用户点击刷新按钮

---

## 12. 通知机制

### 12.1 通知渠道

| 渠道 | 场景 | 优先级 |
|------|------|--------|
| **站内通知** | 所有预警 | P0 |
| **邮件通知** | 严重预警 | P1 |
| **钉钉/企微** | 严重预警 | P2 |

### 12.2 通知配置

```
设置 → 通知设置
├── 通知渠道选择
├── 通知频率（即时/汇总）
├── 免打扰时段
└── 通知模板
```

---

## 13. 数据安全

### 13.1 安全措施

| 层面 | 措施 |
|------|------|
| **传输安全** | HTTPS加密传输 |
| **存储安全** | 敏感数据加密存储 |
| **访问控制** | RBAC权限模型 |
| **审计日志** | 记录关键操作 |
| **数据备份** | 每日自动备份 |

### 13.2 权限模型

| 角色 | 权限 |
|------|------|
| **管理员** | 所有功能 + 系统设置 |
| **编辑者** | 数据录入 + 报告生成 + 任务管理 |
| **查看者** | 只读访问 |

---

## 14. 风险与对策

| 风险 | 对策 |
|------|------|
| AI API不稳定 | 多模型切换、降级处理 |
| 数据质量问题 | 数据校验、清洗机制 |
| 性能瓶颈 | 缓存、分页、异步处理 |
| 用户接受度 | 简洁UI、渐进式引导 |
| 扩展性不足 | 模块化设计、插件机制 |
| 数据安全风险 | 加密、权限、审计 |
| 通知不及时 | 多渠道、WebSocket |
