import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

const Analysis = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>数据分析</Title>
      <Card>
        <Paragraph>
          此页面将展示AI驱动的数据分析功能，包括：
        </Paragraph>
        <ul>
          <li>实时数据监控</li>
          <li>异常检测与预警</li>
          <li>趋势分析与预测</li>
          <li>智能决策建议</li>
        </ul>
      </Card>
    </div>
  )
}

export default Analysis