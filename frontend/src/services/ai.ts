import api from './api'

export async function chatAI(message: string, context = '') {
  const { reply } = await api.post('/ai/chat', { message, context })
  return reply
}

export async function getInsights() {
  const { insights } = await api.get('/ai/insights')
  return insights
}
