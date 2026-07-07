# Pulse V2 第二阶段设计文档（数据源对接）

## 1. 项目概述

### 1.1 版本目标

在V2第一阶段基础上，增加数据源对接功能，支持文件导入、API对接、数据库连接。

### 1.2 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 文件导入 | Excel/CSV/JSON导入，字段映射，数据校验 | P0 |
| API对接 | REST API，手动/定时同步 | P1 |
| 数据库连接 | MySQL直连，全量/增量同步 | P1 |

---

## 2. 文件导入

### 2.1 功能设计

```
文件导入
├── 支持格式
│   ├── Excel (.xlsx, .xls)
│   ├── CSV (.csv)
│   └── JSON (.json)
├── 导入流程
│   ├── 上传文件
│   ├── 数据预览
│   ├── 字段映射
│   ├── 数据校验
│   └── 确认导入
└── 导入记录
    ├── 导入历史
    ├── 导入状态
    └── 错误日志
```

### 2.2 数据模型

```sql
-- 导入记录表
CREATE TABLE import_records (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(200) NOT NULL,
    file_type VARCHAR(20),  -- excel/csv/json
    file_size INTEGER,
    records_count INTEGER,
    status VARCHAR(20),  -- pending/success/failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 API设计

```
POST   /api/import/upload      # 上传文件
POST   /api/import/preview     # 预览数据
POST   /api/import/confirm     # 确认导入
GET    /api/import/records     # 导入记录
```

---

## 3. API对接

### 3.1 功能设计

```
API对接
├── 数据源配置
│   ├── API端点URL
│   ├── 认证方式（API Key/OAuth/无认证）
│   ├── 请求方式（GET/POST）
│   ├── 请求头配置
│   └── 数据映射规则
├── 同步方式
│   ├── 手动同步（点击触发）
│   └── 定时同步（Cron表达式）
└── 同步管理
    ├── 同步日志
    ├── 同步状态
    └── 错误处理
```

### 3.2 数据模型

```sql
-- API数据源配置表
CREATE TABLE api_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) DEFAULT 'GET',
    auth_type VARCHAR(20),  -- none/api_key/oauth
    auth_config JSONB,
    headers JSONB,
    data_mapping JSONB,
    sync_cron VARCHAR(50),
    last_sync_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 同步日志表
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES api_sources(id),
    sync_type VARCHAR(20),  -- manual/auto
    status VARCHAR(20),  -- success/failed
    records_count INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 API设计

```
GET    /api/datasources              # 获取数据源列表
POST   /api/datasources              # 创建数据源
PUT    /api/datasources/{id}         # 更新数据源
DELETE /api/datasources/{id}         # 删除数据源
POST   /api/datasources/{id}/sync    # 手动同步
GET    /api/datasources/{id}/logs    # 同步日志
```

---

## 4. 数据库连接（MySQL）

### 4.1 功能设计

```
数据库连接
├── 连接配置
│   ├── 主机地址
│   ├── 端口
│   ├── 数据库名
│   ├── 用户名
│   ├── 密码
│   └── 表名
├── 数据同步
│   ├── 全量同步
│   ├── 增量同步（基于时间戳）
│   └── 定时同步
└── 连接管理
    ├── 连接测试
    ├── 连接状态
    └── 同步日志
```

### 4.2 数据模型

```sql
-- 数据库连接配置表
CREATE TABLE db_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    db_type VARCHAR(20) DEFAULT 'mysql',
    host VARCHAR(200) NOT NULL,
    port INTEGER DEFAULT 3306,
    database_name VARCHAR(100) NOT NULL,
    username VARCHAR(100),
    password_encrypted VARCHAR(500),
    table_name VARCHAR(100),
    sync_mode VARCHAR(20) DEFAULT 'full',
    sync_cron VARCHAR(50),
    last_sync_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 API设计

```
GET    /api/db-sources              # 获取数据库连接列表
POST   /api/db-sources              # 创建连接
PUT    /api/db-sources/{id}         # 更新连接
DELETE /api/db-sources/{id}         # 删除连接
POST   /api/db-sources/{id}/test    # 测试连接
POST   /api/db-sources/{id}/sync    # 手动同步
GET    /api/db-sources/{id}/tables  # 获取表列表
```

---

## 5. 技术实现

### 5.1 前端新增组件

```
frontend/src/
├── pages/
│   ├── Import.tsx           # 文件导入页面
│   ├── DataSources.tsx      # 数据源管理页面
│   └── DbSources.tsx        # 数据库连接页面
├── components/
│   ├── FileUpload.tsx       # 文件上传组件
│   ├── DataPreview.tsx      # 数据预览组件
│   └── FieldMapping.tsx     # 字段映射组件
└── services/
    ├── import.ts            # 导入API服务
    ├── datasource.ts        # 数据源API服务
    └── dbsource.ts          # 数据库连接API服务
```

### 5.2 后端新增模块

```
backend/app/
├── api/
│   ├── import.py            # 导入API
│   ├── datasource.py        # 数据源API
│   └── dbsource.py          # 数据库连接API
├── models/
│   ├── import_record.py     # 导入记录模型
│   ├── api_source.py        # API数据源模型
│   ├── db_source.py         # 数据库连接模型
│   └── sync_log.py          # 同步日志模型
├── services/
│   ├── import_service.py    # 导入服务
│   ├── datasource_service.py # 数据源服务
│   └── dbsource_service.py  # 数据库连接服务
└── utils/
    ├── file_parser.py       # 文件解析工具
    └── db_connector.py      # 数据库连接工具
```

---

## 6. 实现阶段

### 第一步（1周）

- 文件导入（Excel/CSV/JSON）

### 第二步（1-2周）

- API对接（REST + 手动/定时同步）

### 第三步（1周）

- 数据库连接（MySQL）

---

## 7. 验证标准

### 文件导入

- [ ] 支持Excel、CSV、JSON格式
- [ ] 数据预览正常
- [ ] 字段映射功能正常
- [ ] 数据校验准确
- [ ] 导入记录完整

### API对接

- [ ] API配置功能正常
- [ ] 手动同步正常
- [ ] 定时同步正常
- [ ] 同步日志完整

### 数据库连接

- [ ] MySQL连接正常
- [ ] 连接测试功能正常
- [ ] 全量同步正常
- [ ] 增量同步正常
