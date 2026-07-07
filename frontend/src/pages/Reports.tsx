import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Space,
  Modal,
  Select,
  Input,
  message,
  Tooltip,
  Empty,
} from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getReports, generateReport, getReport, deleteReport } from '../services/report'

const { Title, Text, Paragraph } = Typography
const { confirm } = Modal

// ---- Types ----
interface ReportRecord {
  id: number
  title: string
  type: string
  source: string
  status: string
  created_at: string
  content?: string
}

// ---- Type helpers ----
const typeMap: Record<string, { label: string; color: string }> = {
  monthly: { label: '月度报告', color: 'blue' },
  quarterly: { label: '季度报告', color: 'purple' },
  yearly: { label: '年度报告', color: 'gold' },
  custom: { label: '自定义报告', color: 'cyan' },
}

const statusMap: Record<string, { label: string; color: string }> = {
  completed: { label: '已完成', color: 'green' },
  generating: { label: '生成中', color: 'processing' },
  failed: { label: '生成失败', color: 'red' },
}

function getTypeDisplay(type: string) {
  return typeMap[type] || { label: type, color: 'default' }
}

function getStatusDisplay(status: string) {
  return statusMap[status] || { label: status, color: 'default' }
}

// ---- GenerateModal ----
function GenerateModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [type, setType] = useState<string>('monthly')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      await generateReport(type, title)
      message.success('报告生成任务已提交')
      setTitle('')
      setType('monthly')
      onSuccess()
      onClose()
    } catch {
      message.error('报告生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="生成报告"
      open={open}
      onCancel={onClose}
      onOk={handleGenerate}
      okText="生成"
      cancelText="取消"
      confirmLoading={loading}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 0' }}>
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            报告类型
          </Text>
          <Select
            value={type}
            onChange={setType}
            style={{ width: '100%' }}
            options={[
              { label: '月度报告', value: 'monthly' },
              { label: '季度报告', value: 'quarterly' },
              { label: '年度报告', value: 'yearly' },
              { label: '自定义报告', value: 'custom' },
            ]}
          />
        </div>
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            报告标题（可选）
          </Text>
          <Input
            placeholder="留空将自动生成标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            allowClear
          />
        </div>
      </div>
    </Modal>
  )
}

// ---- PreviewModal ----
function PreviewModal({
  open,
  report,
  onClose,
}: {
  open: boolean
  report: ReportRecord | null
  onClose: () => void
}) {
  if (!report) return null

  const { label: typeLabel, color: typeColor } = getTypeDisplay(report.type)
  const { label: statusLabel, color: statusColor } = getStatusDisplay(report.status)

  return (
    <Modal
      title="报告预览"
      open={open}
      onCancel={onClose}
      footer={
        <Button onClick={onClose}>关闭</Button>
      }
      width={720}
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: '0 0 8px' }}>{report.title}</Title>
          <Space size="middle">
            <Tag color={typeColor}>{typeLabel}</Tag>
            <Tag color={statusColor}>{statusLabel}</Tag>
            <Text type="secondary">{report.created_at}</Text>
          </Space>
        </div>
        {report.source && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">来源：{report.source}</Text>
          </div>
        )}
        <Card
          bordered={false}
          style={{ background: '#FAFAFA', borderRadius: 8 }}
        >
          {report.content ? (
            <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {report.content}
            </Paragraph>
          ) : (
            <Empty description="暂无预览内容" />
          )}
        </Card>
      </div>
    </Modal>
  )
}

// ---- Reports (main) ----
export default function Reports() {
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewReport, setPreviewReport] = useState<ReportRecord | null>(null)

  const fetchReports = useCallback(() => {
    setLoading(true)
    getReports()
      .then((data) => {
        setReports(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setReports([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handlePreview = async (id: number) => {
    try {
      const data = await getReport(id)
      setPreviewReport(data)
      setPreviewOpen(true)
    } catch {
      message.error('获取报告详情失败')
    }
  }

  const handleDelete = (record: ReportRecord) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除报告「${record.title}」吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteReport(record.id)
          message.success('报告已删除')
          fetchReports()
        } catch {
          message.error('删除失败，请重试')
        }
      },
    })
  }

  const columns: ColumnsType<ReportRecord> = [
    {
      title: '报告标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1677FF' }} />
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (v: string) => {
        const { label, color } = getTypeDisplay(v)
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (v: string) => <Text type="secondary">{v || '--'}</Text>,
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
      title: '生成时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record.id)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          报告中心
        </Title>
        <Text type="secondary">查看和管理系统自动生成的各类分析报告</Text>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0 }}>
              报告列表
            </Title>
            <Text type="secondary">共 {reports.length} 份报告</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchReports}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setGenerateOpen(true)}
            >
              生成报告
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={reports}
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

      <GenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSuccess={fetchReports}
      />

      <PreviewModal
        open={previewOpen}
        report={previewReport}
        onClose={() => {
          setPreviewOpen(false)
          setPreviewReport(null)
        }}
      />
    </div>
  )
}
