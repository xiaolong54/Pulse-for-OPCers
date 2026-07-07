import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tooltip,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  SyncOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ApiOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getDbSources,
  createDbSource,
  deleteDbSource,
  testDbConnection,
  syncDbSource,
} from '../services/dbsource'

const { Title, Text } = Typography

// ---- Types ----
interface DbSource {
  id: number
  name: string
  db_type: string
  host: string
  port: number
  database: string
  username: string
  table_names: string
  status: string
  last_sync_at: string | null
  created_at: string
}

// ---- Status helpers ----
const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  connected: { label: '已连接', color: 'success', icon: <CheckCircleOutlined /> },
  disconnected: { label: '未连接', color: 'default', icon: <CloseCircleOutlined /> },
  error: { label: '连接异常', color: 'error', icon: <CloseCircleOutlined /> },
  syncing: { label: '同步中', color: 'processing', icon: <SyncOutlined spin /> },
}

function getStatusDisplay(status: string) {
  return statusMap[status] || { label: status, color: 'default', icon: null }
}

// ---- DB Type helpers ----
const dbTypeMap: Record<string, { label: string; color: string }> = {
  mysql: { label: 'MySQL', color: 'blue' },
  postgresql: { label: 'PostgreSQL', color: 'purple' },
  sqlserver: { label: 'SQL Server', color: 'orange' },
  oracle: { label: 'Oracle', color: 'red' },
}

function getDbTypeDisplay(dbType: string) {
  return dbTypeMap[dbType] || { label: dbType, color: 'default' }
}

// ---- CreateDbSourceModal ----
function CreateDbSourceModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await createDbSource(values)
      message.success('数据库连接创建成功')
      form.resetFields()
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errorFields) {
        return
      }
      message.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="新建数据库连接"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="连接名称"
          rules={[{ required: true, message: '请输入连接名称' }]}
        >
          <Input placeholder="请输入连接名称" />
        </Form.Item>
        <Form.Item
          name="db_type"
          label="数据库类型"
          rules={[{ required: true, message: '请选择数据库类型' }]}
          initialValue="mysql"
        >
          <Select
            placeholder="请选择数据库类型"
            options={[
              { label: 'MySQL', value: 'mysql' },
              { label: 'PostgreSQL', value: 'postgresql' },
              { label: 'SQL Server', value: 'sqlserver' },
              { label: 'Oracle', value: 'oracle' },
            ]}
          />
        </Form.Item>
        <Space size="large" style={{ width: '100%' }}>
          <Form.Item
            name="host"
            label="主机地址"
            rules={[{ required: true, message: '请输入主机地址' }]}
            style={{ width: 300 }}
          >
            <Input placeholder="localhost" />
          </Form.Item>
          <Form.Item
            name="port"
            label="端口"
            rules={[{ required: true, message: '请输入端口' }]}
            initialValue={3306}
            style={{ width: 150 }}
          >
            <InputNumber placeholder="3306" style={{ width: '100%' }} min={1} max={65535} />
          </Form.Item>
        </Space>
        <Form.Item
          name="database"
          label="数据库名"
          rules={[{ required: true, message: '请输入数据库名' }]}
        >
          <Input placeholder="请输入数据库名" />
        </Form.Item>
        <Space size="large" style={{ width: '100%' }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
            style={{ width: 240 }}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ width: 240 }}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Space>
        <Form.Item
          name="table_names"
          label="表名"
          tooltip="多个表名用逗号分隔，留空表示同步所有表"
        >
          <Input.TextArea placeholder="表1,表2,表3（留空表示同步所有表）" rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

// ---- DbSources (main) ----
export default function DbSources() {
  const [dbSources, setDbSources] = useState<DbSource[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [testingIds, setTestingIds] = useState<Set<number>>(new Set())
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set())

  const fetchDbSources = useCallback(() => {
    setLoading(true)
    getDbSources()
      .then((data) => {
        setDbSources(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setDbSources([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchDbSources()
  }, [fetchDbSources])

  const handleTest = async (record: DbSource) => {
    setTestingIds((prev) => new Set(prev).add(record.id))
    try {
      await testDbConnection(record.id)
      message.success(`「${record.name}」连接测试成功`)
      fetchDbSources()
    } catch {
      message.error('连接测试失败，请检查配置')
    } finally {
      setTestingIds((prev) => {
        const next = new Set(prev)
        next.delete(record.id)
        return next
      })
    }
  }

  const handleSync = async (record: DbSource) => {
    setSyncingIds((prev) => new Set(prev).add(record.id))
    try {
      await syncDbSource(record.id)
      message.success(`「${record.name}」同步任务已启动`)
      fetchDbSources()
    } catch {
      message.error('同步失败，请重试')
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev)
        next.delete(record.id)
        return next
      })
    }
  }

  const handleDelete = async (record: DbSource) => {
    try {
      await deleteDbSource(record.id)
      message.success('数据库连接已删除')
      fetchDbSources()
    } catch {
      message.error('删除失败，请重试')
    }
  }

  const columns: ColumnsType<DbSource> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <DatabaseOutlined style={{ color: '#1677FF' }} />
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'db_type',
      key: 'db_type',
      width: 120,
      render: (v: string) => {
        const { label, color } = getDbTypeDisplay(v)
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '主机',
      dataIndex: 'host',
      key: 'host',
      width: 150,
      ellipsis: true,
      render: (v: string, record: DbSource) => (
        <Text copyable={{ text: `${v}:${record.port}` }}>{v}:{record.port}</Text>
      ),
    },
    {
      title: '数据库',
      dataIndex: 'database',
      key: 'database',
      width: 150,
      ellipsis: true,
    },
    {
      title: '表名',
      dataIndex: 'table_names',
      key: 'table_names',
      width: 200,
      ellipsis: true,
      render: (v: string) => (
        <Tooltip title={v || '全部表'}>
          <Text type="secondary">{v || '全部表'}</Text>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => {
        const { label, color, icon } = getStatusDisplay(v)
        return (
          <Tag color={color} icon={icon}>
            {label}
          </Tag>
        )
      },
    },
    {
      title: '最后同步',
      dataIndex: 'last_sync_at',
      key: 'last_sync_at',
      width: 170,
      render: (v: string | null) =>
        v ? <Text type="secondary">{v}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="测试连接">
            <Button
              type="link"
              size="small"
              icon={<ApiOutlined />}
              loading={testingIds.has(record.id)}
              onClick={() => handleTest(record)}
            />
          </Tooltip>
          <Tooltip title="同步数据">
            <Button
              type="link"
              size="small"
              icon={<SyncOutlined />}
              loading={syncingIds.has(record.id)}
              onClick={() => handleSync(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此数据库连接？"
            description="删除后不可恢复，关联数据将被清除。"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            数据库连接
          </Title>
          <Text type="secondary">管理MySQL数据库连接，配置数据同步</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDbSources}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            新建连接
          </Button>
        </Space>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">共 {dbSources.length} 个数据库连接</Text>
        </div>

        <Table
          columns={columns}
          dataSource={dbSources}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Card>

      {/* Create Modal */}
      <CreateDbSourceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchDbSources}
      />
    </div>
  )
}
