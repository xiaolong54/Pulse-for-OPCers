import api from './api'

export async function chatAI(message: string, context = '') {
  const { data } = await api.post('/ai/chat', { message, context })
  return data.reply
}

export async function getInsights() {
  const { data } = await api.get('/ai/insights')
  return data.insights
}
