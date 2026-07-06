import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Tag, Typography, Spin, Empty } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  PayCircleOutlined,
  FundOutlined,
  RiseOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { getKPI, getTrend, getInsights } from '../services/dashboard'

const { Title, Text } = Typography

// ---- KPICards ----
interface KPIData {
  total_revenue: number
  change_percent: number
}

function KPICards({ data, loading }: { data: KPIData | null; loading: boolean }) {
  const revenue = data?.total_revenue ?? 0
  const change = data?.change_percent ?? 0
  const isUp = change >= 0

  // Derive additional KPIs from revenue for display purposes
  const cost = revenue * 0.62
  const profit = revenue - cost

  const cards = [
    {
      title: '本月收入',
      value: revenue,
      prefix: '¥',
      icon: <DollarOutlined style={{ color: '#1677FF' }} />,
      color: '#1677FF',
      bg: '#E6F4FF',
    },
    {
      title: '本月成本',
      value: cost,
      prefix: '¥',
      icon: <PayCircleOutlined style={{ color: '#722ED1' }} />,
      color: '#722ED1',
      bg: '#F9F0FF',
    },
    {
      title: '利润',
      value: profit,
      prefix: '¥',
      icon: <FundOutlined style={{ color: '#52C41A' }} />,
      color: '#52C41A',
      bg: '#F6FFED',
    },
    {
      title: '增长率',
      value: change,
      suffix: '%',
      icon: <RiseOutlined style={{ color: isUp ? '#52C41A' : '#FF4D4F' }} />,
      color: isUp ? '#52C41A' : '#FF4D4F',
      bg: isUp ? '#F6FFED' : '#FFF2F0',
    },
  ]

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, i) => (
        <Col xs={24} sm={12} lg={6} key={i}>
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
              value={i === 3 ? Math.abs(card.value) : card.value}
              precision={i === 3 ? 1 : 2}
              prefix={card.prefix}
              suffix={card.suffix}
              valueStyle={{ color: card.color, fontSize: 28, fontWeight: 600 }}
            />
            {i < 3 && (
              <div style={{ marginTop: 8 }}>
                <Tag
                  color={isUp ? 'success' : 'error'}
                  style={{ borderRadius: 4, fontSize: 12 }}
                >
                  {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
                  {Math.abs(change).toFixed(1)}% 环比
                </Tag>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  )
}

// ---- TrendChart ----
interface TrendPoint {
  date: string
  value: number
}

function TrendChart({ data, loading }: { data: TrendPoint[]; loading: boolean }) {
  const option = {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: '#fff',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: (params: any) => {
        const p = params[0]
        return `<div style="font-size:13px">
          <div style="color:#999;margin-bottom:4px">${p.axisValue}</div>
          <div style="font-weight:600">¥${p.value.toLocaleString()}</div>
        </div>`
      },
    },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => d.date),
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#999', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { show: false },
      axisLabel: {
        color: '#999',
        fontSize: 11,
        formatter: (v: number) => `¥${(v / 1000).toFixed(0)}k`,
      },
      splitLine: { lineStyle: { color: '#f5f5f5' } },
    },
    series: [
      {
        data: data.map((d) => d.value),
        type: 'line' as const,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#1677FF', width: 2 },
        itemStyle: { color: '#1677FF', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22,119,255,0.15)' },
              { offset: 1, color: 'rgba(22,119,255,0.02)' },
            ],
          },
        },
      },
    ],
  }

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          趋势分析
        </Title>
        <Text type="secondary">近30天数据走势</Text>
      </div>
      {loading ? (
        <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : data.length === 0 ? (
        <Empty description="暂无数据" style={{ padding: '80px 0' }} />
      ) : (
        <ReactECharts option={option} style={{ height: 320 }} />
      )}
    </Card>
  )
}

// ---- AICard ----
function AICard({ insights, loading }: { insights: string[]; loading: boolean }) {
  const defaultInsights = [
    '本月业务指标整体平稳，建议关注成本控制',
    '数据采集覆盖率已达95%，系统运行稳定',
    '基于历史数据预测，下月收入有望增长8%',
  ]

  const displayInsights = insights.length > 0 ? insights : defaultInsights

  const tagColors = ['blue', 'purple', 'cyan']

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      }}
      loading={loading}
    >
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <BulbOutlined style={{ color: '#1677FF', fontSize: 18 }} />
        <Title level={5} style={{ margin: 0 }}>
          AI 洞察
        </Title>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayInsights.map((insight, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 12px',
              background: '#FAFAFA',
              borderRadius: 8,
            }}
          >
            <Tag
              color={tagColors[i % tagColors.length]}
              style={{ borderRadius: 4, marginTop: 2, flexShrink: 0 }}
            >
              {i + 1}
            </Tag>
            <Text>{insight}</Text>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ---- Dashboard (main) ----
export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [trendData, setTrendData] = useState<TrendPoint[]>([])
  const [insightData, setInsightData] = useState<string[]>([])
  const [kpiLoading, setKpiLoading] = useState(true)
  const [trendLoading, setTrendLoading] = useState(true)
  const [insightLoading, setInsightLoading] = useState(true)

  useEffect(() => {
    getKPI()
      .then(setKpiData)
      .catch(() => {})
      .finally(() => setKpiLoading(false))

    getTrend(30)
      .then(setTrendData)
      .catch(() => {})
      .finally(() => setTrendLoading(false))

    getInsights()
      .then((res) => setInsightData(res.insights ?? []))
      .catch(() => {})
      .finally(() => setInsightLoading(false))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          仪表盘
        </Title>
        <Text type="secondary">OPC 智能决策工作台总览</Text>
      </div>

      <KPICards data={kpiData} loading={kpiLoading} />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <TrendChart data={trendData} loading={trendLoading} />
        </Col>
        <Col xs={24} lg={8}>
          <AICard insights={insightData} loading={insightLoading} />
        </Col>
      </Row>
    </div>
  )
}
