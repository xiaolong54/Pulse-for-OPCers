import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

const Settings = () => {
  return (
    <div>
      <Title level={3}>系统设置</Title>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Paragraph>
          此页面将展示系统配置功能，包括：
        </Paragraph>
        <ul>
          <li>数据源配置</li>
          <li>告警规则设置</li>
          <li>AI模型参数调整</li>
          <li>用户权限管理</li>
        </ul>
      </Card>
    </div>
  )
}

export default Settings
