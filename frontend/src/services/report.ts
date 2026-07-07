import api from './api'

export async function getReports() {
  const { data } = await api.get('/reports')
  return data
}

export async function generateReport(type: string, title = '') {
  const { data } = await api.post('/reports/generate', { type, title })
  return data
}

export async function getReport(id: number) {
  const { data } = await api.get(`/reports/${id}`)
  return data
}

export async function deleteReport(id: number) {
  const { data } = await api.delete(`/reports/${id}`)
  return data
}
