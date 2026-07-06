import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Table,
  Typography,
  Spin,
  Empty,
  Tag,
  Space,
  Segmented,
} from 'antd'
import {
  DownloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  getCategories,
  getRegions,
  getData,
  getChartData,
} from '../services/analysis'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

// ---- Types ----
interface DataRecord {
  id: number
  name: string
  value: number
  unit: string
  category: string
  region: string
  date: string
}

interface ChartPoint {
  date: string
  value: number
}

interface FilterState {
  category: string
  region: string
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
}

// ---- FilterBar ----
function FilterBar({
  categories,
  regions,
  filters,
  onFiltersChange,
  onExport,
}: {
  categories: string[]
  regions: string[]
  filters: FilterState
  onFiltersChange: (f: FilterState) => void
  onExport: () => void
}) {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        marginBottom: 16,
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              分类
            </Text>
          </div>
          <Select
            placeholder="全部分类"
            allowClear
            style={{ width: '100%' }}
            value={filters.category || undefined}
            onChange={(v) =>
              onFiltersChange({ ...filters, category: v || '' })
            }
            options={categories.map((c) => ({ label: c, value: c }))}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              区域
            </Text>
          </div>
          <Select
            placeholder="全部区域"
            allowClear
            style={{ width: '100%' }}
            value={filters.region || undefined}
            onChange={(v) =>
              onFiltersChange({ ...filters, region: v || '' })
            }
            options={regions.map((r) => ({ label: r, value: r }))}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              时间范围
            </Text>
          </div>
          <RangePicker
            style={{ width: '100%' }}
            value={filters.dateRange as any}
            onChange={(dates) =>
              onFiltersChange({ ...filters, dateRange: dates as any })
            }
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <div style={{ marginBottom: 4 }}>&nbsp;</div>
          <Button
            icon={<DownloadOutlined />}
            onClick={onExport}
            style={{ width: '100%' }}
          >
            导出数据
          </Button>
        </Col>
      </Row>
    </Card>
  )
}

// ---- MainChart ----
function MainChart({
  data,
  loading,
  chartType,
  onChartTypeChange,
}: {
  data: ChartPoint[]
  loading: boolean
  chartType: string
  onChartTypeChange: (t: string) => void
}) {
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
          <div style="font-weight:600">${p.value.toLocaleString()}</div>
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
        formatter: (v: number) =>
          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`,
      },
      splitLine: { lineStyle: { color: '#f5f5f5' } },
    },
    series: [
      {
        data: data.map((d) => d.value),
        type: (chartType === 'bar' ? 'bar' : 'line') as 'bar' | 'line',
        smooth: chartType === 'line',
        symbol: chartType === 'line' ? 'circle' : undefined,
        symbolSize: chartType === 'line' ? 6 : undefined,
        barMaxWidth: 40,
        lineStyle:
          chartType === 'line'
            ? { color: '#1677FF', width: 2 }
            : undefined,
        itemStyle: {
          color: chartType === 'bar' ? '#1677FF' : '#1677FF',
          borderWidth: chartType === 'line' ? 2 : 0,
          borderColor: chartType === 'line' ? '#fff' : undefined,
          borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : undefined,
        },
        areaStyle:
          chartType === 'line'
            ? {
                color: {
                  type: 'linear' as const,
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(22,119,255,0.15)' },
                    { offset: 1, color: 'rgba(22,119,255,0.02)' },
                  ],
                },
              }
            : undefined,
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
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={5} style={{ margin: 0 }}>
            数据趋势
          </Title>
          <Text type="secondary">按日期汇总的数据走势</Text>
        </div>
        <Segmented
          value={chartType}
          onChange={(v) => onChartTypeChange(v as string)}
          options={[
            {
              label: (
                <Space>
                  <LineChartOutlined />
                  折线图
                </Space>
              ),
              value: 'line',
            },
            {
              label: (
                <Space>
                  <BarChartOutlined />
                  柱状图
                </Space>
              ),
              value: 'bar',
            },
          ]}
        />
      </div>
      {loading ? (
        <div
          style={{
            height: 360,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spin />
        </div>
      ) : data.length === 0 ? (
        <Empty description="暂无数据" style={{ padding: '100px 0' }} />
      ) : (
        <ReactECharts option={option} style={{ height: 360 }} />
      )}
    </Card>
  )
}

// ---- DataTable ----
function DataTable({ data, loading }: { data: DataRecord[]; loading: boolean }) {
  const columns: ColumnsType<DataRecord> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '数值',
      dataIndex: 'value',
      key: 'value',
      sorter: (a, b) => a.value - b.value,
      render: (v: number) => (
        <Text strong style={{ color: '#1677FF' }}>
          {v.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '区域',
      dataIndex: 'region',
      key: 'region',
      render: (v: string) => <Tag color="green">{v}</Tag>,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
  ]

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
          数据明细
        </Title>
        <Text type="secondary">
          共 {data.length} 条记录
        </Text>
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

// ---- Analysis (main) ----
export default function Analysis() {
  const [categories, setCategories] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    region: '',
    dateRange: null,
  })
  const [chartType, setChartType] = useState('line')
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [tableData, setTableData] = useState<DataRecord[]>([])
  const [chartLoading, setChartLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)

  // Build query params from filters
  const getParams = useCallback(() => {
    const params: Record<string, string> = {}
    if (filters.category) params.category = filters.category
    if (filters.region) params.region = filters.region
    if (filters.dateRange?.[0])
      params.start = filters.dateRange[0].format('YYYY-MM-DD')
    if (filters.dateRange?.[1])
      params.end = filters.dateRange[1].format('YYYY-MM-DD')
    return params
  }, [filters])

  // Fetch categories and regions on mount
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
    getRegions()
      .then((data) => setRegions(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Fetch data when filters change
  useEffect(() => {
    const params = getParams()

    setChartLoading(true)
    getChartData(params)
      .then((data) => setChartData(Array.isArray(data) ? data : []))
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false))

    setTableLoading(true)
    getData(params)
      .then((data) => setTableData(Array.isArray(data) ? data : []))
      .catch(() => setTableData([]))
      .finally(() => setTableLoading(false))
  }, [getParams])

  // Export to CSV
  const handleExport = () => {
    if (tableData.length === 0) return

    const headers = ['名称', '数值', '单位', '分类', '区域', '日期']
    const rows = tableData.map((r) => [
      r.name,
      r.value,
      r.unit,
      r.category,
      r.region,
      r.date,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const BOM = '﻿'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analysis_${dayjs().format('YYYYMMDD_HHmmss')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          数据分析
        </Title>
        <Text type="secondary">多维度数据筛选与可视化分析</Text>
      </div>

      <FilterBar
        categories={categories}
        regions={regions}
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      <MainChart
        data={chartData}
        loading={chartLoading}
        chartType={chartType}
        onChartTypeChange={setChartType}
      />

      <div style={{ marginTop: 16 }}>
        <DataTable data={tableData} loading={tableLoading} />
      </div>
    </div>
  )
}
