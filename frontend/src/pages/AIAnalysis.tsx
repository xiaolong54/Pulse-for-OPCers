import { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Spin,
  Empty,
  Tag,
  Space,
  Alert,
  Input,
  List,
  Divider,
  message,
} from 'antd'
import {
  LineChartOutlined,
  BulbOutlined,
  WarningOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import {
  predictTrend,
  analyzeData,
  detectAnomaly,
  simulateDecision,
} from '../services/ai_prediction'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// ---- Types ----
interface PredictionPoint {
  date: string
  value: number
  lower?: number
  upper?: number
}

interface PredictionResult {
  metric_name?: string
  predictions?: PredictionPoint[]
  trend?: string
  summary?: string
}

interface AnalysisResult {
  insights?: string[]
  recommendations?: string[]
  summary?: string
}

interface AnomalyItem {
  metric?: string
  date?: string
  value?: number
  expected?: number
  deviation?: string
  description?: string
}

interface AnomalyResult {
  anomalies?: AnomalyItem[]
  summary?: string
  total_checked?: number
  anomaly_count?: number
}

interface SimulationResult {
  scenario?: string
  impacts?: { area: string; effect: string; score: number }[]
  risk_level?: string
  recommendation?: string
  summary?: string
}

// ---- Metric options ----
const metricOptions = [
  { label: '销售额', value: 'sales' },
  { label: '用户数', value: 'users' },
  { label: '转化率', value: 'conversion_rate' },
  { label: '订单量', value: 'orders' },
  { label: '活跃用户', value: 'active_users' },
  { label: '平均客单价', value: 'avg_order_value' },
]

const dayOptions = [7, 14, 30, 60, 90]

// ---- Trend Prediction Panel ----
function TrendPredictionPanel() {
  const [metric, setMetric] = useState<string>('sales')
  const [days, setDays] = useState<number>(30)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)

  const handlePredict = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await predictTrend(metric, days)
      setResult(data)
    } catch (err: any) {
      message.error(err?.response?.data?.detail || '趋势预测请求失败')
    } finally {
      setLoading(false)
    }
  }

  const chartOption = result?.predictions?.length
    ? {
        tooltip: {
          trigger: 'axis' as const,
          backgroundColor: '#fff',
          borderColor: '#e8e8e8',
          borderWidth: 1,
          textStyle: { color: '#333' },
        },
        legend: { data: ['预测值', '置信区间'], top: 0, right: 0 },
        grid: { left: 60, right: 20, top: 40, bottom: 30 },
        xAxis: {
          type: 'category' as const,
          data: result.predictions.map((p) => p.date),
          axisLine: { lineStyle: { color: '#e8e8e8' } },
          axisLabel: { color: '#999', fontSize: 11 },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value' as const,
          axisLine: { show: false },
          axisLabel: { color: '#999', fontSize: 11 },
          splitLine: { lineStyle: { color: '#f5f5f5' } },
        },
        series: [
          {
            name: '预测值',
            type: 'line',
            data: result.predictions.map((p) => p.value),
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
          ...(result.predictions[0]?.lower != null
            ? [
                {
                  name: '置信区间',
                  type: 'line',
                  data: result.predictions.map((p) => p.upper ?? p.value),
                  lineStyle: { opacity: 0 },
                  areaStyle: { color: 'rgba(22,119,255,0.08)' },
                  stack: 'confidence',
                  symbol: 'none',
                },
                {
                  name: '置信下限',
                  type: 'line',
                  data: result.predictions.map((p) => p.lower ?? p.value),
                  lineStyle: { opacity: 0 },
                  areaStyle: { color: '#fff' },
                  stack: 'confidence',
                  symbol: 'none',
                },
              ]
            : []),
        ],
      }
    : null

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          <LineChartOutlined style={{ marginRight: 8, color: '#1677FF' }} />
          趋势预测
        </Title>
        <Text type="secondary">选择指标和时间范围，AI 预测未来走势</Text>
      </div>

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>预测指标</Text>
          </div>
          <Select
            style={{ width: '100%' }}
            value={metric}
            onChange={setMetric}
            options={metricOptions}
          />
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>预测天数</Text>
          </div>
          <Select
            style={{ width: '100%' }}
            value={days}
            onChange={setDays}
            options={dayOptions.map((d) => ({ label: `${d} 天`, value: d }))}
          />
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 4 }}>&nbsp;</div>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handlePredict}
            loading={loading}
            style={{ width: '100%' }}
          >
            开始预测
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin tip="AI 正在分析预测中..." />
        </div>
      ) : result?.predictions?.length ? (
        <>
          <ReactECharts option={chartOption} style={{ height: 320 }} />
          {result.summary && (
            <Alert
              type="info"
              showIcon
              message="预测摘要"
              description={result.summary}
              style={{ marginTop: 16 }}
            />
          )}
          {result.trend && (
            <Tag color="blue" style={{ marginTop: 12 }}>
              趋势方向: {result.trend}
            </Tag>
          )}
        </>
      ) : result ? (
        <Empty description="暂无预测数据" style={{ padding: '80px 0' }} />
      ) : (
        <Empty description="请选择指标并点击开始预测" style={{ padding: '80px 0' }} />
      )}
    </Card>
  )
}

// ---- Analysis Suggestions Panel ----
function AnalysisPanel() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await analyzeData()
      setResult(data)
    } catch (err: any) {
      message.error(err?.response?.data?.detail || '智能分析请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
          智能分析建议
        </Title>
        <Text type="secondary">AI 一键生成数据分析报告与建议</Text>
      </div>

      <Button
        type="primary"
        icon={<BulbOutlined />}
        onClick={handleAnalyze}
        loading={loading}
        style={{ marginBottom: 16 }}
      >
        一键生成分析
      </Button>

      {loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin tip="AI 正在深度分析数据..." />
        </div>
      ) : result ? (
        <div>
          {result.summary && (
            <Alert
              type="success"
              showIcon
              message="分析总结"
              description={result.summary}
              style={{ marginBottom: 16 }}
            />
          )}
          {result.insights && result.insights.length > 0 && (
            <>
              <Divider orientation="left" plain>
                <Text strong>数据洞察</Text>
              </Divider>
              <List
                dataSource={result.insights}
                renderItem={(item) => (
                  <List.Item>
                    <Tag color="blue" style={{ marginRight: 8 }}>洞察</Tag>
                    {item}
                  </List.Item>
                )}
                style={{ marginBottom: 16 }}
              />
            </>
          )}
          {result.recommendations && result.recommendations.length > 0 && (
            <>
              <Divider orientation="left" plain>
                <Text strong>优化建议</Text>
              </Divider>
              <List
                dataSource={result.recommendations}
                renderItem={(item, index) => (
                  <List.Item>
                    <Tag color="green" style={{ marginRight: 8 }}>建议 {index + 1}</Tag>
                    {item}
                  </List.Item>
                )}
              />
            </>
          )}
          {!result.insights?.length && !result.recommendations?.length && !result.summary && (
            <Empty description="暂无分析结果" />
          )}
        </div>
      ) : (
        <Empty description="点击上方按钮生成分析报告" style={{ padding: '60px 0' }} />
      )}
    </Card>
  )
}

// ---- Anomaly Detection Panel ----
function AnomalyDetectionPanel() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnomalyResult | null>(null)

  const handleDetect = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await detectAnomaly()
      setResult(data)
    } catch (err: any) {
      message.error(err?.response?.data?.detail || '异常检测请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          <WarningOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          异常检测
        </Title>
        <Text type="secondary">AI 自动检测数据中的异常波动</Text>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          danger
          icon={<WarningOutlined />}
          onClick={handleDetect}
          loading={loading}
        >
          一键检测异常
        </Button>
        {result?.total_checked != null && (
          <Text type="secondary">
            已检测 {result.total_checked} 项指标，发现 {result.anomaly_count ?? 0} 个异常
          </Text>
        )}
      </Space>

      {loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin tip="AI 正在扫描异常数据..." />
        </div>
      ) : result?.anomalies?.length ? (
        <div>
          {result.summary && (
            <Alert
              type="warning"
              showIcon
              message="检测摘要"
              description={result.summary}
              style={{ marginBottom: 16 }}
            />
          )}
          <List
            dataSource={result.anomalies}
            renderItem={(item) => (
              <List.Item>
                <Card
                  size="small"
                  style={{ width: '100%', borderLeft: '3px solid #ff4d4f' }}
                >
                  <Row justify="space-between" align="top">
                    <Col flex="1">
                      <Text strong>{item.metric || item.description || '未知指标'}</Text>
                      {item.date && (
                        <Text type="secondary" style={{ marginLeft: 12 }}>
                          {item.date}
                        </Text>
                      )}
                      <Paragraph style={{ margin: '4px 0 0 0' }} type="secondary">
                        {item.description}
                      </Paragraph>
                    </Col>
                    <Col>
                      <Space>
                        {item.value != null && (
                          <Tag color="red">实际: {item.value}</Tag>
                        )}
                        {item.expected != null && (
                          <Tag color="green">预期: {item.expected}</Tag>
                        )}
                        {item.deviation && (
                          <Tag color="orange">偏差: {item.deviation}</Tag>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </div>
      ) : result ? (
        <Alert
          type="success"
          showIcon
          message="未检测到异常"
          description={result.summary || '所有指标均在正常范围内'}
        />
      ) : (
        <Empty description="点击上方按钮开始异常检测" style={{ padding: '60px 0' }} />
      )}
    </Card>
  )
}

// ---- Decision Simulation Panel ----
function DecisionSimulationPanel() {
  const [decision, setDecision] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)

  const handleSimulate = async () => {
    if (!decision.trim()) {
      message.warning('请输入决策方案')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await simulateDecision(decision)
      setResult(data)
    } catch (err: any) {
      message.error(err?.response?.data?.detail || '决策模拟请求失败')
    } finally {
      setLoading(false)
    }
  }

  const riskColorMap: Record<string, string> = {
    low: 'green',
    medium: 'orange',
    high: 'red',
  }

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          <ExperimentOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          决策模拟
        </Title>
        <Text type="secondary">输入决策方案，AI 模拟其潜在影响</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <TextArea
            placeholder="请输入决策方案描述，例如：将产品价格下调10%以提升市场份额"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Col>
        <Col span={24}>
          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            onClick={handleSimulate}
            loading={loading}
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
          >
            开始模拟
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin tip="AI 正在模拟决策影响..." />
        </div>
      ) : result ? (
        <div>
          {result.risk_level && (
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ marginRight: 8 }}>风险等级:</Text>
              <Tag color={riskColorMap[result.risk_level] || 'default'}>
                {result.risk_level.toUpperCase()}
              </Tag>
            </div>
          )}

          {result.summary && (
            <Alert
              type="info"
              showIcon
              message="模拟摘要"
              description={result.summary}
              style={{ marginBottom: 16 }}
            />
          )}

          {result.impacts && result.impacts.length > 0 && (
            <>
              <Divider orientation="left" plain>
                <Text strong>影响评估</Text>
              </Divider>
              <List
                dataSource={result.impacts}
                renderItem={(item) => (
                  <List.Item>
                    <Card size="small" style={{ width: '100%' }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>{item.area}</Text>
                          <Paragraph style={{ margin: '4px 0 0 0' }} type="secondary">
                            {item.effect}
                          </Paragraph>
                        </Col>
                        <Col>
                          <Tag
                            color={item.score >= 70 ? 'green' : item.score >= 40 ? 'orange' : 'red'}
                          >
                            影响分: {item.score}
                          </Tag>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            </>
          )}

          {result.recommendation && (
            <Alert
              type="success"
              showIcon
              message="AI 建议"
              description={result.recommendation}
              style={{ marginTop: 16 }}
            />
          )}

          {!result.impacts?.length && !result.summary && !result.recommendation && (
            <Empty description="暂无模拟结果" />
          )}
        </div>
      ) : (
        <Empty description="输入决策方案并点击开始模拟" style={{ padding: '60px 0' }} />
      )}
    </Card>
  )
}

// ---- AIAnalysis (main) ----
export default function AIAnalysis() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          AI 智能分析
        </Title>
        <Text type="secondary">基于 AI 的趋势预测、数据分析、异常检测与决策模拟</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24}>
          <TrendPredictionPanel />
        </Col>
        <Col xs={24} lg={12}>
          <AnalysisPanel />
        </Col>
        <Col xs={24} lg={12}>
          <AnomalyDetectionPanel />
        </Col>
        <Col xs={24} lg={24}>
          <DecisionSimulationPanel />
        </Col>
      </Row>
    </div>
  )
}
