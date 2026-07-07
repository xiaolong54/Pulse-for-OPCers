import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  LineChartOutlined,
  AlertOutlined,
  FileTextOutlined,
  SettingOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout
const { Title } = Typography

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '首页',
  },
  {
    key: '/analysis',
    icon: <LineChartOutlined />,
    label: '数据分析',
  },
  {
    key: '/alerts',
    icon: <AlertOutlined />,
    label: '预警中心',
  },
  {
    key: '/tasks',
    icon: <CheckSquareOutlined />,
    label: '任务管理',
  },
  {
    key: '/reports',
    icon: <FileTextOutlined />,
    label: '报告中心',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '设置',
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Sider
      width={220}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Title level={4} style={{ margin: 0, color: '#1677FF' }}>
          OPC 工作台
        </Title>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, paddingTop: 8 }}
      />
    </Sider>
  )
}
