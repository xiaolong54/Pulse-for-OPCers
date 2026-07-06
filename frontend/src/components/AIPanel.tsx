import { useState, useRef, useEffect } from 'react'
import { Drawer, Input, Button, Spin, Typography, message } from 'antd'
import { BulbOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'
import { chatAI } from '../services/ai'

const { Text } = Typography
const { TextArea } = Input

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

export default function AIPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    // 添加用户消息
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const reply = await chatAI(text)
      setMessages((prev) => [...prev, { role: 'ai', content: reply }])
    } catch {
      message.error('AI 回复失败，请检查 API Key 配置或稍后重试')
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '抱歉，暂时无法回复。请检查 AI API 配置后重试。' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* 触发按钮 */}
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1677FF, #4096FF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(22,119,255,0.35)',
          zIndex: 1000,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,119,255,0.45)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(22,119,255,0.35)'
        }}
      >
        <BulbOutlined style={{ fontSize: 22, color: '#fff' }} />
      </div>

      {/* 侧边栏 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RobotOutlined style={{ color: '#1677FF', fontSize: 18 }} />
            <span>AI 助手</span>
          </div>
        }
        placement="right"
        width={380}
        open={open}
        onClose={() => setOpen(false)}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
        closable
      >
        {/* 对话区域 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                color: '#bbb',
              }}
            >
              <RobotOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <Text type="secondary">你好！我是 OPC AI 助手</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                有任何数据分析问题，随时问我
              </Text>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              {msg.role === 'ai' && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#E6F4FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <RobotOutlined style={{ color: '#1677FF', fontSize: 16 }} />
                </div>
              )}
              <div
                style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: msg.role === 'user' ? '#1677FF' : '#F5F5F5',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  fontSize: 14,
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#1677FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#E6F4FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RobotOutlined style={{ color: '#1677FF', fontSize: 16 }} />
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: '#F5F5F5',
                }}
              >
                <Spin size="small" />
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
                  思考中...
                </Text>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 输入区域 */}
        <div
          style={{
            borderTop: '1px solid #f0f0f0',
            padding: '12px 16px',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题... (Enter 发送)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1, borderRadius: 8, resize: 'none' }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim()}
            style={{ borderRadius: 8, height: 32, flexShrink: 0 }}
          />
        </div>
      </Drawer>
    </>
  )
}
