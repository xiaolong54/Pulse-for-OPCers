import api from './api'

export async function getAlerts(params?: { status?: string; severity?: string }) {
  const { data } = await api.get('/alerts', { params })
  return data
}

export async function getAlertStats() {
  const { data } = await api.get('/alerts/stats')
  return data
}

export async function resolveAlert(id: number) {
  const { data } = await api.post(`/alerts/${id}/resolve`)
  return data
}

export async function getAlertRules() {
  const { data } = await api.get('/alerts/rules')
  return data
}
