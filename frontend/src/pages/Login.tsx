import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useUserStore } from '../store/userStore'
import api from '../services/api'

const { Title, Text } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()
  const login = useUserStore((s) => s.login)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      if (isRegister) {
        await api.post('/auth/register', values)
      }
      await login(values.username, values.password)
      message.success(isRegister ? '注册成功' : '登录成功')
      navigate('/')
    } catch (err: any) {
      const detail = err?.response?.data?.detail || '操作失败'
      message.error(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} align="center">
          <Title level={3} style={{ margin: 0 }}>
            OPC智能决策工作台
          </Title>
          <Text type="secondary">{isRegister ? '创建新账户' : '请登录您的账户'}</Text>
        </Space>

        <Form name="login" onFinish={onFinish} size="large" autoComplete="off">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isRegister ? '注册' : '登录'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? '已有账户？去登录' : '没有账户？去注册'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
