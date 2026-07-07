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
  Select,
  message,
  Tooltip,
  Popconfirm,
  Timeline,
  Empty,
  Spin,
  Descriptions,
} from 'antd'
import {
  PlusOutlined,
  SyncOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getDataSources,
  createDataSource,
  deleteDataSource,
  syncDataSource,
  getSyncLogs,
} from '../services/datasource'

const { Title, Text } = Typography

// ---- Types ----
interface DataSource {
  id: number
  name: string
  api_url: string
  method: string
  auth_type: string
  status: string
  last_sync_at: string | null
  created_at: string
}

interface SyncLog {
  id: number
  status: string
  message: string
  records_synced: number
  started_at: string
  finished_at: string
}

// ---- Status helpers ----
const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: '正常', color: 'success', icon: <CheckCircleOutlined /> },
  inactive: { label: '未激活', color: 'default', icon: <ClockCircleOutlined /> },
  error: { label: '异常', color: 'error', icon: <CloseCircleOutlined /> },
  syncing: { label: '同步中', color: 'processing', icon: <SyncOutlined spin /> },
}

function getStatusDisplay(status: string) {
  return statusMap[status] || { label: status, color: 'default', icon: null }
}

// ---- Auth type helpers ----
const authMap: Record<string, { label: string; color: string }> = {
  none: { label: '无认证', color: 'default' },
  api_key: { label: 'API Key', color: 'blue' },
  bearer: { label: 'Bearer Token', color: 'purple' },
  basic: { label: 'Basic Auth', color: 'cyan' },
}

function getAuthDisplay(auth: string) {
  return authMap[auth] || { label: auth, color: 'default' }
}

// ---- Method helpers ----
const methodMap: Record<string, { color: string }> = {
  GET: { color: 'green' },
  POST: { color: 'blue' },
  PUT: { color: 'orange' },
  DELETE: { color: 'red' },
}

// ---- SyncLogModal ----
function SyncLogModal({
  open,
  dataSource,
  onClose,
}: {
  open: boolean
  dataSource: DataSource | null
  onClose: () => void
}) {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && dataSource) {
      setLoading(true)
      getSyncLogs(dataSource.id)
        .then((data) => {
          setLogs(Array.isArray(data) ? data : [])
        })
        .catch(() => {
          message.error('获取同步日志失败')
          setLogs([])
        })
        .finally(() => setLoading(false))
    }
  }, [open, dataSource])

  if (!dataSource) return null

  const logStatusMap: Record<string, { color: string }> = {
    success: { color: 'green' },
    failed: { color: 'red' },
    partial: { color: 'orange' },
  }

  return (
    <Modal
      title={`同步日志 - ${dataSource.name}`}
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={640}
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        <Descriptions
          bordered
          column={2}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="数据源名称">{dataSource.name}</Descriptions.Item>
          <Descriptions.Item label="API地址">
            <Text copyable={{ text: dataSource.api_url }} ellipsis style={{ maxWidth: 300 }}>
              {dataSource.api_url}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="加载中..." />
          </div>
        ) : logs.length > 0 ? (
          <Timeline
            items={logs.map((log) => {
              const logStatus = logStatusMap[log.status] || { color: 'gray' }
              return {
                color: logStatus.color,
                children: (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <Tag color={logStatus.color}>
                          {log.status === 'success' ? '成功' : log.status === 'failed' ? '失败' : '部分成功'}
                        </Tag>
                        <Text type="secondary">{log.started_at}</Text>
                      </Space>
                      {log.records_synced > 0 && (
                        <Text type="secondary">同步 {log.records_synced} 条</Text>
                      )}
                    </div>
                    {log.message && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">{log.message}</Text>
                      </div>
                    )}
                  </div>
                ),
              }
            })}
          />
        ) : (
          <Empty description="暂无同步日志" />
        )}
      </div>
    </Modal>
  )
}

// ---- CreateDataSourceModal ----
function CreateDataSourceModal({
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
      await createDataSource(values)
      message.success('数据源创建成功')
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
      title="新建数据源"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="数据源名称"
          rules={[{ required: true, message: '请输入数据源名称' }]}
        >
          <Input placeholder="请输入数据源名称" />
        </Form.Item>
        <Form.Item
          name="api_url"
          label="API 地址"
          rules={[
            { required: true, message: '请输入 API 地址' },
            { type: 'url', message: '请输入有效的 URL 地址' },
          ]}
        >
          <Input placeholder="https://api.example.com/data" />
        </Form.Item>
        <Space size="large" style={{ width: '100%' }}>
          <Form.Item
            name="method"
            label="请求方式"
            rules={[{ required: true, message: '请选择请求方式' }]}
            style={{ width: 200 }}
          >
            <Select
              placeholder="请选择请求方式"
              options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="auth_type"
            label="认证方式"
            rules={[{ required: true, message: '请选择认证方式' }]}
            style={{ width: 200 }}
          >
            <Select
              placeholder="请选择认证方式"
              options={[
                { label: '无认证', value: 'none' },
                { label: 'API Key', value: 'api_key' },
                { label: 'Bearer Token', value: 'bearer' },
                { label: 'Basic Auth', value: 'basic' },
              ]}
            />
          </Form.Item>
        </Space>
        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.auth_type !== cur.auth_type}
        >
          {({ getFieldValue }) => {
            const authType = getFieldValue('auth_type')
            if (authType === 'api_key') {
              return (
                <Form.Item
                  name="auth_value"
                  label="API Key"
                  rules={[{ required: true, message: '请输入 API Key' }]}
                >
                  <Input.Password placeholder="请输入 API Key" />
                </Form.Item>
              )
            }
            if (authType === 'bearer') {
              return (
                <Form.Item
                  name="auth_value"
                  label="Bearer Token"
                  rules={[{ required: true, message: '请输入 Token' }]}
                >
                  <Input.Password placeholder="请输入 Bearer Token" />
                </Form.Item>
              )
            }
            if (authType === 'basic') {
              return (
                <Space size="large" style={{ width: '100%' }}>
                  <Form.Item
                    name="auth_username"
                    label="用户名"
                    rules={[{ required: true, message: '请输入用户名' }]}
                    style={{ width: 200 }}
                  >
                    <Input placeholder="用户名" />
                  </Form.Item>
                  <Form.Item
                    name="auth_password"
                    label="密码"
                    rules={[{ required: true, message: '请输入密码' }]}
                    style={{ width: 200 }}
                  >
                    <Input.Password placeholder="密码" />
                  </Form.Item>
                </Space>
              )
            }
            return null
          }}
        </Form.Item>
      </Form>
    </Modal>
  )
}

// ---- DataSources (main) ----
export default function DataSources() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [logRecord, setLogRecord] = useState<DataSource | null>(null)
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set())

  const fetchDataSources = useCallback(() => {
    setLoading(true)
    getDataSources()
      .then((data) => {
        setDataSources(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setDataSources([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchDataSources()
  }, [fetchDataSources])

  const handleSync = async (record: DataSource) => {
    setSyncingIds((prev) => new Set(prev).add(record.id))
    try {
      await syncDataSource(record.id)
      message.success(`「${record.name}」同步任务已启动`)
      fetchDataSources()
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

  const handleDelete = async (record: DataSource) => {
    try {
      await deleteDataSource(record.id)
      message.success('数据源已删除')
      fetchDataSources()
    } catch {
      message.error('删除失败，请重试')
    }
  }

  const handleViewLogs = (record: DataSource) => {
    setLogRecord(record)
    setLogOpen(true)
  }

  const columns: ColumnsType<DataSource> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <ApiOutlined style={{ color: '#1677FF' }} />
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: '接口地址',
      dataIndex: 'api_url',
      key: 'api_url',
      ellipsis: true,
      render: (v: string) => (
        <Tooltip title={v}>
          <Text
            copyable={{ text: v }}
            style={{ maxWidth: 260 }}
            ellipsis
          >
            {v}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '请求方式',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (v: string) => {
        const { color } = methodMap[v] || { color: 'default' }
        return <Tag color={color}>{v}</Tag>
      },
    },
    {
      title: '认证方式',
      dataIndex: 'auth_type',
      key: 'auth_type',
      width: 120,
      render: (v: string) => {
        const { label, color } = getAuthDisplay(v)
        return <Tag color={color}>{label}</Tag>
      },
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="同步数据">
            <Button
              type="link"
              size="small"
              icon={<SyncOutlined />}
              loading={syncingIds.has(record.id)}
              onClick={() => handleSync(record)}
            />
          </Tooltip>
          <Tooltip title="同步日志">
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleViewLogs(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此数据源？"
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
            API 数据源
          </Title>
          <Text type="secondary">管理外部 API 数据接口，配置数据同步</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDataSources}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            新建数据源
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
          <Text type="secondary">共 {dataSources.length} 个数据源</Text>
        </div>

        <Table
          columns={columns}
          dataSource={dataSources}
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
      <CreateDataSourceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchDataSources}
      />

      {/* Sync Logs Modal */}
      <SyncLogModal
        open={logOpen}
        dataSource={logRecord}
        onClose={() => {
          setLogOpen(false)
          setLogRecord(null)
        }}
      />
    </div>
  )
}
