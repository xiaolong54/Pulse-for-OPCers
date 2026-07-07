import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Tabs,
  Popconfirm,
} from 'antd'
import {
  FileTextOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getTasks,
  getTaskStats,
  createTask,
  completeTask,
  deleteTask,
} from '../services/task'

const { Title, Text } = Typography

// ---- Types ----
interface TaskRecord {
  id: number
  title: string
  project: string
  assignee: string
  priority: string
  status: string
  due_date: string
  created_at: string
}

interface TaskStats {
  total: number
  todo: number
  in_progress: number
  completed: number
}

// ---- Priority helpers ----
const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: 'red' },
  medium: { label: '中', color: 'orange' },
  low: { label: '低', color: 'green' },
}

function getPriorityDisplay(priority: string) {
  return priorityMap[priority] || { label: priority, color: 'default' }
}

// ---- Status helpers ----
const statusMap: Record<string, { label: string; color: string }> = {
  todo: { label: '待办', color: 'default' },
  in_progress: { label: '进行中', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
}

function getStatusDisplay(status: string) {
  return statusMap[status] || { label: status, color: 'default' }
}

// ---- StatsCards ----
function StatsCards({ stats, loading }: { stats: TaskStats; loading: boolean }) {
  const cards = [
    {
      title: '全部任务',
      value: stats.total,
      icon: <FileTextOutlined style={{ color: '#1677FF' }} />,
      bg: '#E6F4FF',
      color: '#1677FF',
    },
    {
      title: '待办',
      value: stats.todo,
      icon: <ClockCircleOutlined style={{ color: '#FA8C16' }} />,
      bg: '#FFF7E6',
      color: '#FA8C16',
    },
    {
      title: '进行中',
      value: stats.in_progress,
      icon: <SyncOutlined style={{ color: '#722ED1' }} />,
      bg: '#F9F0FF',
      color: '#722ED1',
    },
    {
      title: '已完成',
      value: stats.completed,
      icon: <CheckCircleOutlined style={{ color: '#52C41A' }} />,
      bg: '#F6FFED',
      color: '#52C41A',
    },
  ]

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, i) => (
        <Col xs={24} sm={12} md={6} key={i}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
            loading={loading}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  marginRight: 12,
                }}
              >
                {card.icon}
              </div>
              <Text type="secondary">{card.title}</Text>
            </div>
            <Statistic
              value={card.value}
              valueStyle={{ color: card.color, fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

// ---- TaskTable ----
function TaskTable({
  data,
  loading,
  onComplete,
  onDelete,
}: {
  data: TaskRecord[]
  loading: boolean
  onComplete: (id: number) => void
  onDelete: (id: number) => void
}) {
  const columns: ColumnsType<TaskRecord> = [
    {
      title: '任务',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      width: 120,
      ellipsis: true,
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (v: string) => {
        const { label, color } = getPriorityDisplay(v)
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => {
        const { label, color } = getStatusDisplay(v)
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '截止日期',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {record.status !== 'completed' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => onComplete(record.id)}
            >
              完成
            </Button>
          )}
          <Popconfirm
            title="确定删除此任务？"
            onConfirm={() => onDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
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
  )
}

// ---- CreateTaskModal ----
function CreateTaskModal({
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
      await createTask({
        ...values,
        due_date: values.due_date?.format('YYYY-MM-DD'),
      })
      message.success('任务创建成功')
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
      title="新建任务"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="project"
              label="所属项目"
              rules={[{ required: true, message: '请选择项目' }]}
            >
              <Select
                placeholder="请选择项目"
                options={[
                  { label: '项目A', value: '项目A' },
                  { label: '项目B', value: '项目B' },
                  { label: '项目C', value: '项目C' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="assignee"
              label="负责人"
              rules={[{ required: true, message: '请输入负责人' }]}
            >
              <Input placeholder="请输入负责人" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select
                placeholder="请选择优先级"
                options={[
                  { label: '高', value: 'high' },
                  { label: '中', value: 'medium' },
                  { label: '低', value: 'low' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="due_date"
              label="截止日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择截止日期" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

// ---- Tasks (main) ----
export default function Tasks() {
  const [stats, setStats] = useState<TaskStats>({ total: 0, todo: 0, in_progress: 0, completed: 0 })
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [statsLoading, setStatsLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Fetch stats
  const fetchStats = useCallback(() => {
    setStatsLoading(true)
    getTaskStats()
      .then((data) => {
        if (data) setStats(data)
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  // Fetch tasks with filters
  const fetchTasks = useCallback(() => {
    setTasksLoading(true)
    const params: Record<string, string> = {}
    if (statusFilter) params.status = statusFilter
    getTasks(params)
      .then((data) => {
        setTasks(Array.isArray(data) ? data : [])
      })
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false))
  }, [statusFilter])

  // Initial load
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Reload tasks when filter changes
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Complete task handler
  const handleComplete = async (id: number) => {
    try {
      await completeTask(id)
      message.success('任务已完成')
      fetchTasks()
      fetchStats()
    } catch {
      message.error('操作失败，请重试')
    }
  }

  // Delete task handler
  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id)
      message.success('任务已删除')
      fetchTasks()
      fetchStats()
    } catch {
      message.error('删除失败，请重试')
    }
  }

  // Create task success handler
  const handleCreateSuccess = () => {
    fetchTasks()
    fetchStats()
  }

  // Tab items
  const tabItems = [
    { key: '', label: '全部' },
    { key: 'todo', label: '待办' },
    { key: 'in_progress', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            任务管理
          </Title>
          <Text type="secondary">管理项目任务，追踪任务进度</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          新建任务
        </Button>
      </div>

      <StatsCards stats={stats} loading={statsLoading} />

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          marginTop: 16,
        }}
      >
        <Tabs
          activeKey={statusFilter}
          onChange={setStatusFilter}
          items={tabItems}
          style={{ marginBottom: 0 }}
        />
        <TaskTable
          data={tasks}
          loading={tasksLoading}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      </Card>

      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
