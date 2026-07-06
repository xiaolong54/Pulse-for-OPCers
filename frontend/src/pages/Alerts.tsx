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
  Badge,
  Button,
  message,
} from 'antd'
import {
  AlertOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getAlerts,
  getAlertStats,
  resolveAlert,
  getAlertRules,
} from '../services/alert'

const { Title, Text } = Typography

// ---- Types ----
interface AlertRecord {
  id: number
  message: string
  severity: string
  status: string
  created_at: string
}

interface AlertStats {
  total: number
  pending: number
  high: number
}

interface AlertRuleRecord {
  id: number
  metric_name: string
  condition: string
  threshold: number
  severity: string
  enabled: boolean
}

// ---- Severity helpers ----
const severityMap: Record<string, { label: string; color: string }> = {
  critical: { label: '高', color: 'red' },
  high: { label: '高', color: 'red' },
  warning: { label: '中', color: 'orange' },
  medium: { label: '中', color: 'orange' },
  low: { label: '低', color: 'green' },
}

function getSeverityDisplay(severity: string) {
  return severityMap[severity] || { label: severity, color: 'default' }
}

// ---- StatsCards ----
function StatsCards({ stats, loading }: { stats: AlertStats; loading: boolean }) {
  const cards = [
    {
      title: '总预警数',
      value: stats.total,
      icon: <AlertOutlined style={{ color: '#1677FF' }} />,
      bg: '#E6F4FF',
      color: '#1677FF',
    },
    {
      title: '未处理数',
      value: stats.pending,
      icon: <WarningOutlined style={{ color: '#FA8C16' }} />,
      bg: '#FFF7E6',
      color: '#FA8C16',
    },
    {
      title: '高危预警数',
      value: stats.high,
      icon: <ExclamationCircleOutlined style={{ color: '#FF4D4F' }} />,
      bg: '#FFF2F0',
      color: '#FF4D4F',
    },
  ]

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, i) => (
        <Col xs={24} sm={8} key={i}>
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

// ---- FilterBar ----
function FilterBar({
  filters,
  onFiltersChange,
}: {
  filters: { status: string; severity: string }
  onFiltersChange: (f: { status: string; severity: string }) => void
}) {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        marginTop: 16,
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              状态
            </Text>
          </div>
          <Select
            placeholder="全部状态"
            allowClear
            style={{ width: '100%' }}
            value={filters.status || undefined}
            onChange={(v) => onFiltersChange({ ...filters, status: v || '' })}
            options={[
              { label: '未处理', value: 'pending' },
              { label: '已处理', value: 'resolved' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              严重程度
            </Text>
          </div>
          <Select
            placeholder="全部等级"
            allowClear
            style={{ width: '100%' }}
            value={filters.severity || undefined}
            onChange={(v) => onFiltersChange({ ...filters, severity: v || '' })}
            options={[
              { label: '高', value: 'critical' },
              { label: '中', value: 'warning' },
              { label: '低', value: 'low' },
            ]}
          />
        </Col>
      </Row>
    </Card>
  )
}

// ---- AlertTable ----
function AlertTable({
  data,
  loading,
  onResolve,
}: {
  data: AlertRecord[]
  loading: boolean
  onResolve: (id: number) => void
}) {
  const columns: ColumnsType<AlertRecord> = [
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (v: string) => {
        const { label, color } = getSeverityDisplay(v)
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '预警消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) =>
        v === 'pending' ? (
          <Badge status="processing" text="未处理" />
        ) : (
          <Badge status="default" text="已处理" />
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) =>
        record.status === 'pending' ? (
          <Button
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => onResolve(record.id)}
          >
            处理
          </Button>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>
            --
          </Text>
        ),
    },
  ]

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        marginTop: 16,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          预警列表
        </Title>
        <Text type="secondary">共 {data.length} 条预警</Text>
      </div>
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
    </Card>
  )
}

// ---- RulesTable ----
function RulesTable({
  data,
  loading,
}: {
  data: AlertRuleRecord[]
  loading: boolean
}) {
  const columns: ColumnsType<AlertRuleRecord> = [
    {
      title: '指标',
      dataIndex: 'metric_name',
      key: 'metric_name',
    },
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      width: 80,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 100,
      render: (v: number) => <Text>{v}</Text>,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (v: string) => {
        const { label, color } = getSeverityDisplay(v)
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (v: boolean) =>
        v ? (
          <Badge status="success" text="启用" />
        ) : (
          <Badge status="default" text="禁用" />
        ),
    },
  ]

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        marginTop: 16,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          预警规则
        </Title>
        <Text type="secondary">当前系统预警规则配置</Text>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />
    </Card>
  )
}

// ---- Alerts (main) ----
export default function Alerts() {
  const [stats, setStats] = useState<AlertStats>({ total: 0, pending: 0, high: 0 })
  const [alerts, setAlerts] = useState<AlertRecord[]>([])
  const [rules, setRules] = useState<AlertRuleRecord[]>([])
  const [filters, setFilters] = useState({ status: '', severity: '' })
  const [statsLoading, setStatsLoading] = useState(true)
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [rulesLoading, setRulesLoading] = useState(true)

  // Fetch stats
  const fetchStats = useCallback(() => {
    setStatsLoading(true)
    getAlertStats()
      .then((data) => {
        if (data) setStats(data)
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  // Fetch alerts with filters
  const fetchAlerts = useCallback(() => {
    setAlertsLoading(true)
    const params: Record<string, string> = {}
    if (filters.status) params.status = filters.status
    if (filters.severity) params.severity = filters.severity
    getAlerts(params)
      .then((data) => {
        setAlerts(Array.isArray(data) ? data : [])
      })
      .catch(() => setAlerts([]))
      .finally(() => setAlertsLoading(false))
  }, [filters])

  // Fetch rules
  const fetchRules = useCallback(() => {
    setRulesLoading(true)
    getAlertRules()
      .then((data) => {
        setRules(Array.isArray(data) ? data : [])
      })
      .catch(() => setRules([]))
      .finally(() => setRulesLoading(false))
  }, [])

  // Initial load
  useEffect(() => {
    fetchStats()
    fetchRules()
  }, [fetchStats, fetchRules])

  // Reload alerts when filters change
  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Resolve alert handler
  const handleResolve = async (id: number) => {
    try {
      await resolveAlert(id)
      message.success('预警已处理')
      fetchAlerts()
      fetchStats()
    } catch {
      message.error('处理失败，请重试')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          预警中心
        </Title>
        <Text type="secondary">实时监控系统预警，快速响应处理</Text>
      </div>

      <StatsCards stats={stats} loading={statsLoading} />

      <FilterBar filters={filters} onFiltersChange={setFilters} />

      <AlertTable
        data={alerts}
        loading={alertsLoading}
        onResolve={handleResolve}
      />

      <RulesTable data={rules} loading={rulesLoading} />
    </div>
  )
}
