import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Space,
  Modal,
  Upload,
  message,
  Tooltip,
  Empty,
  Progress,
} from 'antd'
import {
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import {
  uploadFile,
  confirmImport,
  getImportRecords,
  getImportPreview,
  deleteImportRecord,
} from '../services/import'

const { Title, Text } = Typography
const { Dragger } = Upload
const { confirm } = Modal

// ---- Types ----
interface ImportRecord {
  id: number
  filename: string
  format: string
  record_count: number
  status: string
  created_at: string
}

interface PreviewData {
  headers: string[]
  rows: any[][]
  total: number
}

// ---- Status helpers ----
const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'warning' },
  confirmed: { label: '已导入', color: 'success' },
  failed: { label: '导入失败', color: 'error' },
}

const formatMap: Record<string, { icon: React.ReactNode; color: string }> = {
  xlsx: { icon: <FileExcelOutlined />, color: '#52C41A' },
  xls: { icon: <FileExcelOutlined />, color: '#52C41A' },
  csv: { icon: <FileTextOutlined />, color: '#1677FF' },
  json: { icon: <FileOutlined />, color: '#722ED1' },
}

function getStatusDisplay(status: string) {
  return statusMap[status] || { label: status, color: 'default' }
}

function getFormatDisplay(format: string) {
  return formatMap[format] || { icon: <FileOutlined />, color: '#999' }
}

// ---- PreviewModal ----
function PreviewModal({
  open,
  record,
  onClose,
}: {
  open: boolean
  record: ImportRecord | null
  onClose: () => void
}) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && record) {
      setLoading(true)
      getImportPreview(record.id)
        .then(setPreviewData)
        .catch(() => {
          message.error('获取预览数据失败')
        })
        .finally(() => setLoading(false))
    }
  }, [open, record])

  if (!record) return null

  const columns = previewData?.headers.map((header, index) => ({
    title: header,
    dataIndex: index,
    key: index,
    ellipsis: true,
    width: 150,
  })) || []

  const dataSource = previewData?.rows.map((row, rowIndex) => {
    const item: any = { key: rowIndex }
    row.forEach((cell, cellIndex) => {
      item[cellIndex] = cell
    })
    return item
  }) || []

  return (
    <Modal
      title="数据预览"
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={800}
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>{record.filename}</Text>
            <Tag color={getStatusDisplay(record.status).color}>
              {getStatusDisplay(record.status).label}
            </Tag>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              共 {record.record_count} 条记录
            </Text>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Progress type="circle" percent={75} />
          </div>
        ) : previewData && previewData.rows.length > 0 ? (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 'max-content', y: 400 }}
            size="small"
            bordered
          />
        ) : (
          <Empty description="暂无预览数据" />
        )}
      </div>
    </Modal>
  )
}

// ---- Import (main) ----
export default function Import() {
  const [records, setRecords] = useState<ImportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewRecord, setPreviewRecord] = useState<ImportRecord | null>(null)

  const fetchRecords = useCallback(() => {
    setLoading(true)
    getImportRecords()
      .then((data) => {
        setRecords(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setRecords([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    setUploading(true)
    try {
      const result = await uploadFile(file as File)
      message.success('文件上传成功')
      onSuccess?.(result)
      fetchRecords()
    } catch (error) {
      message.error('文件上传失败')
      onError?.(error as Error)
    } finally {
      setUploading(false)
    }
  }

  const handleConfirm = (record: ImportRecord) => {
    confirm({
      title: '确认导入',
      icon: <ExclamationCircleOutlined />,
      content: `确定要导入「${record.filename}」中的 ${record.record_count} 条数据吗？`,
      okText: '确认导入',
      cancelText: '取消',
      onOk: async () => {
        try {
          await confirmImport(record.id)
          message.success('数据导入成功')
          fetchRecords()
        } catch {
          message.error('导入失败，请重试')
        }
      },
    })
  }

  const handlePreview = (record: ImportRecord) => {
    setPreviewRecord(record)
    setPreviewOpen(true)
  }

  const handleDelete = (record: ImportRecord) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除导入记录「${record.filename}」吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteImportRecord(record.id)
          message.success('记录已删除')
          fetchRecords()
        } catch {
          message.error('删除失败，请重试')
        }
      },
    })
  }

  const columns: ColumnsType<ImportRecord> = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
      render: (v: string, record) => {
        const { icon, color } = getFormatDisplay(record.format)
        return (
          <Space>
            <span style={{ color, fontSize: 18 }}>{icon}</span>
            <Text strong>{v}</Text>
          </Space>
        )
      },
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      width: 100,
      render: (v: string) => {
        const format = v.toUpperCase()
        return <Tag>{format}</Tag>
      },
    },
    {
      title: '记录数',
      dataIndex: 'record_count',
      key: 'record_count',
      width: 100,
      render: (v: number) => <Text>{v.toLocaleString()}</Text>,
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
      title: '导入时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="确认导入">
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirm(record)}
              />
            </Tooltip>
          )}
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

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv,.json',
    customRequest: handleUpload,
    showUploadList: false,
    disabled: uploading,
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          数据导入
        </Title>
        <Text type="secondary">上传数据文件，支持 Excel、CSV、JSON 格式</Text>
      </div>

      {/* Upload Area */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          marginBottom: 16,
        }}
      >
        <Dragger {...uploadProps} style={{ padding: '20px 0' }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1677FF' }} />
          </p>
          <p className="ant-upload-text">
            {uploading ? '正在上传...' : '点击或拖拽文件到此区域上传'}
          </p>
          <p className="ant-upload-hint">
            支持 .xlsx、.xls、.csv、.json 格式文件
          </p>
        </Dragger>
      </Card>

      {/* Records Table */}
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
              导入记录
            </Title>
            <Text type="secondary">共 {records.length} 条记录</Text>
          </div>
          <Button icon={<ReloadOutlined />} onClick={fetchRecords}>
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={records}
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

      {/* Preview Modal */}
      <PreviewModal
        open={previewOpen}
        record={previewRecord}
        onClose={() => {
          setPreviewOpen(false)
          setPreviewRecord(null)
        }}
      />
    </div>
  )
}
