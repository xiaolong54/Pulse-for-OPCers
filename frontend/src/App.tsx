import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider, Spin, Layout } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect } from 'react'
import { useUserStore } from './store/userStore'
import Sidebar from './components/Sidebar'
import AIPanel from './components/AIPanel'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import Alerts from './pages/Alerts'
import Tasks from './pages/Tasks'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Import from './pages/Import'
import DataSources from './pages/DataSources'
import DbSources from './pages/DbSources'

const { Content } = Layout

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useUserStore((s) => s.user)
  const loading = useUserStore((s) => s.loading)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 220, background: '#F5F5F5' }}>
        <Content style={{ padding: 24, minHeight: '100vh' }}>
          <Outlet />
        </Content>
      </Layout>
      <AIPanel />
    </Layout>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/import" element={<Import />} />
        <Route path="/datasources" element={<DataSources />} />
        <Route path="/dbsources" element={<DbSources />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  const checkAuth = useUserStore((s) => s.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  )
}

export default App
