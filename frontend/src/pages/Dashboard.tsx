import { Card, Row, Col, Statistic } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const Dashboard = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1>OPC 智能决策工作台</h1>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card title="今日订单" bordered={false}>
            <Statistic
              title="订单量"
              value={1128}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="异常告警" bordered={false}>
            <Statistic
              title="待处理"
              value={93}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="处理效率" bordered={false}>
            <Statistic
              title="平均响应时间"
              value={11.28}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              suffix="分钟"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="决策建议" bordered={false}>
            <Statistic
              title="AI建议数"
              value={28}
              precision={0}
              valueStyle={{ color: '#722ed1' }}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard