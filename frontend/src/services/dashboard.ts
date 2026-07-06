import api from './api'

export async function getKPI() {
  const { data } = await api.get('/dashboard/kpi')
  return data
}

export async function getTrend(days = 30) {
  const { data } = await api.get('/dashboard/trend', { params: { days } })
  return data
}

export async function getInsights() {
  const { data } = await api.get('/dashboard/insights')
  return data
}
