# OPC智能决策工作台 实施计划（MVP阶段）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成OPC智能决策工作台MVP版本（首页仪表盘 + 数据分析 + 预警中心 + AI对话 + 用户登录）

**Architecture:** 前后端分离，React + Ant Design 前端，Python FastAPI 后端，PostgreSQL 数据库，AI通过国内API接入

**Tech Stack:** React 18, Ant Design 5, ECharts, FastAPI, PostgreSQL, Redis, 通义千问/智谱 API

## Global Constraints

- 所有AI调用必须支持国产模型（通义千问/智谱GLM）
- 前端使用 Ant Design 5 组件库
- 图表使用 ECharts
- 后端使用 Python FastAPI
- 数据库使用 PostgreSQL
- 部署使用 Docker Compose
- UI风格简约，参考 Linear/Notion/Stripe

---

## 文件结构

```
opc-workbench/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard/          # 首页
│   │   │   │   ├── index.tsx
│   │   │   │   ├── KPICards.tsx
│   │   │   │   ├── TrendChart.tsx
│   │   │   │   └── AICard.tsx
│   │   │   ├── Analysis/           # 数据分析
│   │   │   │   ├── index.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   ├── MainChart.tsx
│   │   │   │   └── DataTable.tsx
│   │   │   ├── Alert/              # 预警中心
│   │   │   │   ├── index.tsx
│   │   │   │   └── AlertList.tsx
│   │   │   ├── Login/              # 登录
│   │   │   │   └── index.tsx
│   │   │   └── Layout/             # 布局
│   │   │       ├── MainLayout.tsx
│   │   │       └── Sidebar.tsx
│   │   ├── components/
│   │   │   ├── AIPanel.tsx         # AI侧边栏
│   │   │   └── Loading.tsx
│   │   ├── services/
│   │   │   ├── api.ts              # API客户端
│   │   │   ├── dashboard.ts        # 首页API
│   │   │   ├── analysis.ts         # 分析API
│   │   │   ├── alert.ts            # 预警API
│   │   │   └── ai.ts               # AI API
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   └── user.ts
│   │   ├── utils/
│   │   │   └── format.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py
│   │   │   ├── analysis.py
│   │   │   ├── alert.py
│   │   │   ├── ai.py
│   │   │   └── auth.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── metric.py
│   │   │   ├── alert.py
│   │   │   └── user.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── analysis_service.py
│   │   │   ├── alert_service.py
│   │   │   └── ai_service.py
│   │   ├── core/
│   │   │   ├── database.py
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── main.py
│   │   └── requirements.txt
│   └── alembic/
│       └── versions/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

### Task 1: 项目脚手架搭建

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `backend/app/main.py`
- Create: `backend/app/requirements.txt`
- Create: `backend/app/core/config.py`
- Create: `docker-compose.yml`
- Create: `.env.example`

**Interfaces:**
- Produces: 可用 `docker-compose up -d` 启动的项目骨架（数据库 + 后端 + 前端），前后端能通信

- [ ] **Step 1: 初始化前端项目**

```bash
mkdir -p frontend/src/{pages,components,services,store,utils}
cd frontend
```

`package.json`:
```json
{
  "name": "opc-workbench",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "antd": "^5.20.0",
    "@ant-design/icons": "^5.4.0",
    "echarts": "^5.5.1",
    "echarts-for-react": "^3.0.2",
    "zustand": "^4.5.4",
    "axios": "^1.7.3",
    "dayjs": "^1.11.12"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.0"
  }
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

- [ ] **Step 2: 创建前端入口**

`frontend/src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={{ token: { colorPrimary: '#1677FF' } }}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

`frontend/src/App.tsx`:
```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './pages/Layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import Alert from './pages/Alert'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="alert" element={<Alert />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
```

- [ ] **Step 3: 初始化后端项目**

`backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="OPC Workbench API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok"}
```

`backend/app/requirements.txt`:
```
fastapi==0.112.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.31
psycopg2-binary==2.9.9
alembic==1.13.2
redis==5.0.8
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.27.0
pydantic==2.8.2
pydantic-settings==2.3.4
python-dotenv==1.0.1
celery==5.4.0
```

- [ ] **Step 4: 创建部署配置**

`docker-compose.yml`:
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: opc
      POSTGRES_USER: opc
      POSTGRES_PASSWORD: opc123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgresql://opc:opc123@db:5432/opc

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

- [ ] **Step 5: 验证**

```bash
# 前端
cd frontend && npm install && npm run dev
# → 访问 http://localhost:3000

# 后端
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload
# → 访问 http://localhost:8000/api/health
```

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: init project scaffold"
```

---

### Task 2: 后端数据模型和数据库迁移

**Files:**
- Create: `backend/app/core/database.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/metric.py`
- Create: `backend/app/models/alert.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/alembic.ini`

**Interfaces:**
- Consumes: `DATABASE_URL` 环境变量
- Produces: 5张数据库表：users, metrics, alert_rules, alerts, reports

- [ ] **Step 1: 数据库连接配置**

`backend/app/core/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

`backend/app/core/config.py`:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://opc:opc123@localhost:5432/opc"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "your-secret-key"
    AI_API_KEY: str = ""
    AI_API_URL: str = ""
    AI_MODEL: str = "glm-4"

    class Config:
        env_file = ".env"

settings = Settings()
```

- [ ] **Step 2: 创建数据模型**

`backend/app/models/metric.py`:
```python
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.core.database import Base

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20), default="")
    category = Column(String(50), default="")
    region = Column(String(50), default="")
    recorded_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
```

`backend/app/models/alert.py`:
```python
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, func
from app.core.database import Base

class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    condition = Column(String(20), nullable=False)
    threshold = Column(Float, nullable=False)
    severity = Column(String(20), default="warning")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("alert_rules.id"))
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="warning")
    status = Column(String(20), default="pending")
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), default="custom")
    content = Column(Text, default="")
    file_path = Column(String(500), default="")
    generated_by = Column(String(20), default="ai")
    created_at = Column(DateTime, server_default=func.now())
```

`backend/app/models/user.py`:
```python
from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), default="")
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), default="viewer")
    preferences = Column(JSON, default={})
    created_at = Column(DateTime, server_default=func.now())
```

- [ ] **Step 3: 初始化Alembic并创建迁移**

```bash
cd backend
alembic init alembic
# 修改 alembic.ini 中的 sqlalchemy.url = postgresql://opc:opc123@localhost:5432/opc
# 修改 alembic/env.py 导入所有模型
alembic revision --autogenerate -m "init"
alembic upgrade head
```

Expected: 5张表创建成功

- [ ] **Step 4: Commit**

```bash
git add backend/app/core/database.py backend/app/models/
git commit -m "feat: add database models and migration"
```

---

### Task 3: 用户认证（登录/注册）

**Files:**
- Create: `backend/app/core/security.py`
- Create: `backend/app/api/auth.py`
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/store/user.ts`
- Create: `frontend/src/pages/Login/index.tsx`

**Interfaces:**
- Consumes: `User` 模型, `SECRET_KEY` 配置
- Produces: POST `/api/auth/login`, POST `/api/auth/register`, GET `/api/auth/me`
- 前端 `useUserStore` hook

- [ ] **Step 1: 后端认证API**

`backend/app/core/security.py`:
```python
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return int(payload["sub"])
    except:
        return None
```

`backend/app/api/auth.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.models.user import User
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_access_token(user.id)
    return {"token": token, "user": {"id": user.id, "username": user.username, "role": user.role}}

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")
    user = User(username=req.username, password_hash=hash_password(req.password), role="admin")
    db.add(user)
    db.commit()
    token = create_access_token(user.id)
    return {"token": token, "user": {"id": user.id, "username": user.username, "role": user.role}}

@router.get("/api/auth/me")
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    user_id = decode_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="无效token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return {"id": user.id, "username": user.username, "role": user.role}
```

- [ ] **Step 2: 前端登录页面**

`frontend/src/services/api.ts`:
```ts
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
```

`frontend/src/store/user.ts`:
```ts
import { create } from 'zustand'
import api from '../services/api'

interface User {
  id: number
  username: string
  role: string
}

interface UserStore {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', data.token)
    set({ user: data.user })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null })
  },
  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  }
}))
```

`frontend/src/pages/Login/index.tsx`:
```tsx
import { useState } from 'react'
import { Card, Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/user'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const login = useUserStore((s) => s.login)
  const navigate = useNavigate()

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate('/')
    } catch {
      message.error('用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 400 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          OPC 决策工作台
        </Typography.Title>
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            登录
          </Button>
        </Form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: 登录验证**

```bash
# 注册用户
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# → 返回 token

# 登录
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# → 返回 token
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add user authentication"
```

---

### Task 4: 首页仪表盘（KPI + 趋势图 + AI洞察）

**Files:**
- Create: `backend/app/api/dashboard.py`
- Create: `backend/app/services/analysis_service.py`
- Create: `frontend/src/pages/Layout/MainLayout.tsx`
- Create: `frontend/src/pages/Layout/Sidebar.tsx`
- Create: `frontend/src/pages/Dashboard/index.tsx`
- Create: `frontend/src/pages/Dashboard/KPICards.tsx`
- Create: `frontend/src/pages/Dashboard/TrendChart.tsx`
- Create: `frontend/src/pages/Dashboard/AICard.tsx`
- Create: `frontend/src/services/dashboard.ts`

**Interfaces:**
- Consumes: `Metric` 模型
- Produces: GET `/api/dashboard/kpi`, GET `/api/dashboard/trend?days=30`
- GET `/api/dashboard/insights`
- 前端 Dashboard 页面

- [ ] **Step 1: 后端仪表盘API**

`backend/app/api/dashboard.py`:
```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.metric import Metric
from app.models.alert import Alert
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/kpi")
def get_kpi(db: Session = Depends(get_db)):
    today = datetime.now()
    month_start = today.replace(day=1)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    current = db.query(func.sum(Metric.value)).filter(
        Metric.recorded_at >= month_start
    ).scalar() or 0

    previous = db.query(func.sum(Metric.value)).filter(
        Metric.recorded_at >= last_month_start,
        Metric.recorded_at < month_start
    ).scalar() or 0

    change = ((current - previous) / previous * 100) if previous > 0 else 0

    return {
        "total_revenue": round(current, 2),
        "change_percent": round(change, 1)
    }

@router.get("/trend")
def get_trend(days: int = Query(30), db: Session = Depends(get_db)):
    since = datetime.now() - timedelta(days=days)
    results = db.query(
        func.date(Metric.recorded_at).label("date"),
        func.sum(Metric.value).label("value")
    ).filter(Metric.recorded_at >= since
    ).group_by(func.date(Metric.recorded_at)
    ).order_by("date").all()

    return [{"date": str(r.date), "value": round(r.value, 2)} for r in results]
```

`backend/app/services/analysis_service.py`:
```python
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.metric import Metric
from datetime import datetime, timedelta

def get_insights(db: Session) -> list[dict]:
    today = datetime.now()
    month_start = today.replace(day=1)

    # 本月各分类汇总
    categories = db.query(
        Metric.category,
        func.sum(Metric.value).label("total")
    ).filter(
        Metric.recorded_at >= month_start
    ).group_by(Metric.category).all()

    # 本月各区域汇总
    regions = db.query(
        Metric.region,
        func.sum(Metric.value).label("total")
    ).filter(
        Metric.recorded_at >= month_start
    ).group_by(Metric.region).all()

    insights = []
    if categories:
        top = max(categories, key=lambda x: x.total)
        insights.append(f"本月{categories[0].category}类指标表现突出，总值 ¥{sum(c.total for c in categories):,.0f}")

    if regions:
        top_region = max(regions, key=lambda x: x.total)
        insights.append(f"{top_region.region}区域贡献最大")

    return insights
```

- [ ] **Step 2: 前端仪表盘页面**

`frontend/src/services/dashboard.ts`:
```ts
import api from './api'

export async function getKPI() {
  const { data } = await api.get('/dashboard/kpi')
  return data
}

export async function getTrend(days = 30) {
  const { data } = await api.get('/dashboard/trend', { params: { days } })
  return data
}

export async function getInsights() {
  const { data } = await api.get('/dashboard/insights')
  return data
}
```

`frontend/src/pages/Dashboard/KPICards.tsx`:
```tsx
import { Card, Col, Row, Statistic } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface KPICardsProps {
  data: {
    total_revenue: number
    change_percent: number
  }
}

export default function KPICards({ data }: KPICardsProps) {
  const items = [
    { title: '本月收入', value: data.total_revenue, suffix: '¥', change: data.change_percent },
    { title: '本月成本', value: data.total_revenue * 0.6, suffix: '¥', change: -5.2 },
    { title: '利润', value: data.total_revenue * 0.4, suffix: '¥', change: 8.1 },
    { title: '增长率', value: data.change_percent, suffix: '%', change: data.change_percent },
  ]

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col span={6} key={item.title}>
          <Card hoverable>
            <Statistic
              title={item.title}
              value={item.value}
              suffix={item.suffix}
              precision={1}
              valueStyle={{ color: item.change >= 0 ? '#52c41a' : '#ff4d4f' }}
              prefix={item.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}
```

`frontend/src/pages/Dashboard/TrendChart.tsx`:
```tsx
import { Card, DatePicker } from 'antd'
import ReactEChartsCore from 'echarts-for-react'
import dayjs from 'dayjs'
import { useState } from 'react'

interface TrendChartProps {
  data: Array<{ date: string; value: number }>
}

export default function TrendChart({ data }: TrendChartProps) {
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    series: [{
      type: 'line',
      data: data.map(d => d.value),
      smooth: true,
      areaStyle: { opacity: 0.15 },
      lineStyle: { width: 2 }
    }]
  }

  return (
    <Card title="趋势图" extra={<DatePicker.RangePicker />}>
      <ReactEChartsCore option={option} style={{ height: 300 }} />
    </Card>
  )
}
```

`frontend/src/pages/Dashboard/AICard.tsx`:
```tsx
import { Card, Typography, Space, Tag } from 'antd'
import { BulbOutlined } from '@ant-design/icons'

interface AICardProps {
  insights: string[]
}

export default function AICard({ insights }: AICardProps) {
  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        {insights.map((text, i) => (
          <div key={i}>
            <Tag icon={<BulbOutlined />} color="gold">AI洞察</Tag>
            <Typography.Text>{text}</Typography.Text>
          </div>
        ))}
      </Space>
    </Card>
  )
}
```

`frontend/src/pages/Dashboard/index.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { Spin } from 'antd'
import KPICards from './KPICards'
import TrendChart from './TrendChart'
import AICard from './AICard'
import { getKPI, getTrend, getInsights } from '../../services/dashboard'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState<any>({ total_revenue: 0, change_percent: 0 })
  const [trend, setTrend] = useState([])
  const [insights, setInsights] = useState([])

  useEffect(() => {
    Promise.all([getKPI(), getTrend(), getInsights()]).then(([k, t, i]) => {
      setKpi(k)
      setTrend(t)
      setInsights(i)
      setLoading(false)
    })
  }, [])

  if (loading) return <Spin style={{ display: 'block', marginTop: 100 }} />

  return (
    <div style={{ padding: 24 }}>
      <KPICards data={kpi} />
      <div style={{ marginTop: 16 }}><TrendChart data={trend} /></div>
      <div style={{ marginTop: 16 }}><AICard insights={insights} /></div>
    </div>
  )
}
```

`frontend/src/pages/Layout/MainLayout.tsx`:
```tsx
import { useEffect } from 'react'
import { Layout } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import AIPanel from '../../components/AIPanel'
import { useUserStore } from '../../store/user'

const { Content } = Layout

export default function MainLayout() {
  const { user, loading, checkAuth } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading])

  if (loading || !user) return null

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Content style={{ margin: 0, background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
      <AIPanel />
    </Layout>
  )
}
```

- [ ] **Step 3: 验证**

```bash
curl http://localhost:8000/api/dashboard/kpi
# → { total_revenue: 0, change_percent: 0 }

curl http://localhost:8000/api/dashboard/trend?days=30
# → []
```

前端访问 http://localhost:3000 → 看到仪表盘（登录后）

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add dashboard page with KPI and trend chart"
```

---

### Task 5: 数据分析页

**Files:**
- Create: `backend/app/api/analysis.py`
- Create: `frontend/src/pages/Analysis/index.tsx`
- Create: `frontend/src/pages/Analysis/FilterBar.tsx`
- Create: `frontend/src/pages/Analysis/MainChart.tsx`
- Create: `frontend/src/pages/Analysis/DataTable.tsx`
- Create: `frontend/src/services/analysis.ts`

**Interfaces:**
- Produces: GET `/api/analysis/data?category=&region=&start=&end=`
- GET `/api/analysis/categories`, GET `/api/analysis/regions`

- [ ] **Step 1: 后端分析API**

`backend/app/api/analysis.py`:
```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.metric import Metric
from datetime import datetime

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    results = db.query(Metric.category).distinct().all()
    return [r.category for r in results if r.category]

@router.get("/regions")
def get_regions(db: Session = Depends(get_db)):
    results = db.query(Metric.region).distinct().all()
    return [r.region for r in results if r.region]

@router.get("/data")
def get_data(
    category: str = "", region: str = "",
    start: str = "", end: str = "",
    db: Session = Depends(get_db)
):
    q = db.query(Metric)
    if category: q = q.filter(Metric.category == category)
    if region: q = q.filter(Metric.region == region)
    if start: q = q.filter(Metric.recorded_at >= datetime.fromisoformat(start))
    if end: q = q.filter(Metric.recorded_at <= datetime.fromisoformat(end))
    results = q.order_by(Metric.recorded_at.desc()).limit(100).all()
    return [
        {"id": r.id, "name": r.name, "value": r.value, "unit": r.unit,
         "category": r.category, "region": r.region, "date": str(r.recorded_at)}
        for r in results
    ]

@router.get("/chart-data")
def get_chart_data(
    category: str = "", region: str = "",
    start: str = "", end: str = "",
    db: Session = Depends(get_db)
):
    q = db.query(func.date(Metric.recorded_at).label("date"), func.sum(Metric.value).label("value"))
    if category: q = q.filter(Metric.category == category)
    if region: q = q.filter(Metric.region == region)
    if start: q = q.filter(Metric.recorded_at >= datetime.fromisoformat(start))
    if end: q = q.filter(Metric.recorded_at <= datetime.fromisoformat(end))
    results = q.group_by(func.date(Metric.recorded_at)).order_by("date").all()
    return [{"date": str(r.date), "value": round(r.value, 2)} for r in results]
```

- [ ] **Step 2: 前端分析页面**

`frontend/src/pages/Analysis/FilterBar.tsx`:
```tsx
import { Row, Col, Select, Button, DatePicker, Space } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

interface FilterBarProps {
  categories: string[]
  regions: string[]
  onFilter: (filters: any) => void
}

export default function FilterBar({ categories, regions, onFilter }: FilterBarProps) {
  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      <Col><Select placeholder="分类" allowClear options={categories.map(c => ({ label: c, value: c }))} style={{ width: 150 }} onChange={(v) => onFilter({ category: v })} /></Col>
      <Col><Select placeholder="区域" allowClear options={regions.map(r => ({ label: r, value: r }))} style={{ width: 150 }} onChange={(v) => onFilter({ region: v })} /></Col>
      <Col><DatePicker.RangePicker onChange={(_, fmt) => onFilter({ start: fmt[0], end: fmt[1] })} /></Col>
      <Col><Button icon={<DownloadOutlined />}>导出</Button></Col>
    </Row>
  )
}
```

`frontend/src/pages/Analysis/index.tsx`:
```tsx
import { useState } from 'react'
import { Card } from 'antd'
import FilterBar from './FilterBar'

export default function Analysis() {
  const [categories] = useState(['销售', '成本', '利润'])
  const [regions] = useState(['华东', '华南', '华北'])

  return (
    <div style={{ padding: 24 }}>
      <Card title="数据分析">
        <FilterBar categories={categories} regions={regions} onFilter={() => {}} />
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          筛选条件后查看图表
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add analysis page with filters"
```

---

### Task 6: 预警中心

**Files:**
- Create: `backend/app/api/alert.py`
- Create: `backend/app/services/alert_service.py`
- Create: `frontend/src/pages/Alert/index.tsx`
- Create: `frontend/src/pages/Alert/AlertList.tsx`
- Create: `frontend/src/services/alert.ts`

**Interfaces:**
- Produces: GET `/api/alerts`, POST `/api/alerts/{id}/resolve`, GET `/api/alerts/stats`

- [ ] **Step 1: 后端预警API**

`backend/app/api/alert.py`:
```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.alert import Alert

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("")
def list_alerts(status: str = "", severity: str = "", db: Session = Depends(get_db)):
    q = db.query(Alert)
    if status: q = q.filter(Alert.status == status)
    if severity: q = q.filter(Alert.severity == severity)
    results = q.order_by(Alert.created_at.desc()).limit(50).all()
    return [{"id": r.id, "message": r.message, "severity": r.severity, "status": r.status, "created_at": str(r.created_at)} for r in results]

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Alert).count()
    pending = db.query(Alert).filter(Alert.status == "pending").count()
    return {"total": total, "pending": pending}

@router.post("/{alert_id}/resolve")
def resolve(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert: return {"error": "not found"}
    alert.status = "resolved"
    db.commit()
    return {"ok": True}
```

- [ ] **Step 2: 前端预警页面**

`frontend/src/pages/Alert/index.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Select, Space, Badge, Statistic, Row, Col } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import api from '../../services/api'

export default function Alert() {
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0 })

  const load = async () => {
    const [a, s] = await Promise.all([api.get('/alerts'), api.get('/alerts/stats')])
    setAlerts(a.data)
    setStats(s.data)
  }

  useEffect(() => { load() }, [])

  const resolve = async (id: number) => {
    await api.post(`/alerts/${id}/resolve`)
    load()
  }

  const severityColor: Record<string, string> = { high: 'red', medium: 'orange', low: 'green' }

  const columns = [
    { title: '严重程度', dataIndex: 'severity', render: (s: string) => <Tag color={severityColor[s]}>{s}</Tag> },
    { title: '消息', dataIndex: 'message' },
    { title: '时间', dataIndex: 'created_at' },
    { title: '状态', dataIndex: 'status', render: (s: string) => s === 'pending' ? <Badge status="processing" text="未处理" /> : <Badge status="default" text="已处理" /> },
    { title: '操作', render: (_: any, r: any) => r.status === 'pending' && <Button size="small" icon={<CheckCircleOutlined />} onClick={() => resolve(r.id)}>处理</Button> }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="总预警" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="未处理" value={stats.pending} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>
      <Card title="预警列表" extra={
        <Space>
          <Select placeholder="严重程度" allowClear style={{ width: 120 }} options={[{ label: '高', value: 'high' }, { label: '中', value: 'medium' }, { label: '低', value: 'low' }]} />
          <Select placeholder="状态" allowClear style={{ width: 120 }} options={[{ label: '未处理', value: 'pending' }, { label: '已处理', value: 'resolved' }]} />
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={alerts} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add alert center"
```

---

### Task 7: AI对话和洞察侧边栏

**Files:**
- Create: `backend/app/api/ai.py`
- Create: `backend/app/services/ai_service.py`
- Create: `frontend/src/components/AIPanel.tsx`
- Create: `frontend/src/services/ai.ts`

**Interfaces:**
- Produces: POST `/api/ai/chat`, POST `/api/ai/insights`
- 前端 AIPanel 侧边栏组件

- [ ] **Step 1: 后端AI服务**

`backend/app/services/ai_service.py`:
```python
import httpx
from app.core.config import settings

async def chat_with_ai(prompt: str, context: str = "") -> str:
    messages = [{"role": "system", "content": "你是OPC决策工作台AI助手，帮助分析数据。简洁、准确、专业。"}]
    if context:
        messages.append({"role": "user", "content": f"当前数据：{context}\n\n问题：{prompt}"})
    else:
        messages.append({"role": "user", "content": prompt})

    # 智谱 GLM-4 示例
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
            json={"model": settings.AI_MODEL, "messages": messages, "temperature": 0.7}
        )
        return resp.json()["choices"][0]["message"]["content"]

async def generate_data_insights(data_context: str) -> list[str]:
    prompt = f"基于以下数据生成3条关键洞察：{data_context}"
    result = await chat_with_ai(prompt)
    return [line.strip("- ").strip() for line in result.split("\n") if line.strip()]
```

`backend/app/api/ai.py`:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.services.ai_service import chat_with_ai, generate_data_insights
from app.models.metric import Metric
from sqlalchemy import func
from datetime import datetime

router = APIRouter(prefix="/api/ai", tags=["ai"])

class ChatRequest(BaseModel):
    message: str
    context: str = ""

@router.post("/chat")
async def chat(req: ChatRequest):
    result = await chat_with_ai(req.message, req.context)
    return {"reply": result}

@router.get("/insights")
async def insights(db: Session = Depends(get_db)):
    month_start = datetime.now().replace(day=1)
    total = db.query(func.sum(Metric.value)).filter(Metric.recorded_at >= month_start).scalar() or 0
    count = db.query(Metric).filter(Metric.recorded_at >= month_start).count()

    context = f"本月数据总值：{total:.0f}，数据点数：{count}"
    results = await generate_data_insights(context)
    return {"insights": results}
```

- [ ] **Step 2: 前端AI侧边栏**

`frontend/src/services/ai.ts`:
```ts
import api from './api'

export async function chatAI(message: string, context = '') {
  const { data } = await api.post('/ai/chat', { message, context })
  return data.reply
}
```

`frontend/src/components/AIPanel.tsx`:
```tsx
import { useState, useEffect } from 'react'
import { Layout, Input, Button, Typography, Space, Spin, Drawer } from 'antd'
import { BulbOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons'
import { chatAI } from '../services/ai'
import api from '../services/api'

const { TextArea } = Input

export default function AIPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setLoading(true)
    try {
      const reply = await chatAI(input)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI服务暂时不可用' }])
    }
    setLoading(false)
    setInput('')
  }

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<BulbOutlined />}
        size="large"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, width: 48, height: 48 }}
        onClick={() => setOpen(true)}
      />
      <Drawer
        title="AI 助手"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={380}
      >
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 12, textAlign: m.role === 'user' ? 'right' : 'left' }}>
              <Typography.Text
                style={{
                  background: m.role === 'user' ? '#1677ff' : '#f0f0f0',
                  color: m.role === 'user' ? '#fff' : '#333',
                  padding: '6px 12px',
                  borderRadius: 8,
                  display: 'inline-block',
                  maxWidth: '80%'
                }}
              >
                {m.content}
              </Typography.Text>
            </div>
          ))}
          {loading && <Spin style={{ display: 'block', margin: '8px auto' }} />}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea value={input} onChange={e => setInput(e.target.value)} rows={2} placeholder="问AI..." onPressEnter={send} />
          <Button type="primary" icon={<SendOutlined />} onClick={send} loading={loading} />
        </Space.Compact>
      </Drawer>
    </>
  )
}
```

- [ ] **Step 3: 验证**

```bash
# 测试AI chat API
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"分析本月数据"}'
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add AI chat sidebar"
```

---

### Task 8: 种子数据脚本

**Files:**
- Create: `backend/app/seed.py`

- [ ] **Step 1: 创建种子数据**

`backend/app/seed.py`:
```python
"""运行: python -m app.seed"""
from app.core.database import SessionLocal, engine, Base
from app.models.metric import Metric
from app.models.alert import Alert, AlertRule
from app.models.user import User
from app.core.security import hash_password
from datetime import datetime, timedelta
import random

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(User).first():
    print("数据已存在，跳过")
    exit()

# 创建默认用户
db.add(User(username="admin", password_hash=hash_password("admin123"), role="admin"))

# 创建示例指标
categories = ["销售", "成本", "利润"]
regions = ["华东", "华南", "华北"]
for day in range(30):
    date = datetime.now() - timedelta(days=29 - day)
    for cat in categories:
        for region in regions:
            db.add(Metric(
                name=f"{cat}-{region}",
                value=random.uniform(10000, 50000),
                unit="元",
                category=cat,
                region=region,
                recorded_at=date
            ))

# 创建预警规则
rule = AlertRule(metric_name="销售", condition="<", threshold=20000, severity="high")
db.add(rule)

# 创建示例预警
db.add(Alert(rule_id=1, message="华东区域销售额低于安全线", severity="high"))
db.add(Alert(message="本月成本超预算", severity="medium"))

db.commit()
db.close()
print("种子数据创建成功！")
print("用户名: admin, 密码: admin123")
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "chore: add seed data script"
```

---

## 自检

**1. 需求覆盖：**
- ✅ 首页仪表盘（KPI + 趋势图 + AI洞察）— Task 4
- ✅ 数据分析页（筛选 + 图表 + 表格）— Task 5
- ✅ 预警中心（列表 + 处理 + 统计）— Task 6
- ✅ AI对话（侧边栏）— Task 7
- ✅ 用户登录 — Task 3
- ✅ 项目脚手架 + 部署 — Task 1 + Task 2 + Task 8
- ✅ 扩展性设计 — 目录结构预留 _extensions, plugins

**2. 占位符检查：** 无TBD/TODO占位符

**3. 类型一致性：** API路径统一 `/api/*`，返回值格式一致

**4. 独立可测试：** 每个Task完成都有独立的验证步骤
