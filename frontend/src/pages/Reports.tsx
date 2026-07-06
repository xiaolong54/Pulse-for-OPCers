import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

const Reports = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>智能报告</Title>
      <Card>
        <Paragraph>
          此页面将展示AI自动生成的报告功能，包括：
        </Paragraph>
        <ul>
          <li>日报/周报/月报自动生成</li>
          <li>关键指标可视化</li>
          <li>异常事件汇总</li>
          <li>决策建议与执行跟踪</li>
        </ul>
      </Card>
    </div>
  )
}

export default Reports