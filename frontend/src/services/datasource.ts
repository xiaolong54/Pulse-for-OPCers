import api from './api'

export async function getDataSources() {
  const { data } = await api.get('/datasources')
  return data
}

export async function createDataSource(source: any) {
  const { data } = await api.post('/datasources', source)
  return data
}

export async function deleteDataSource(id: number) {
  const { data } = await api.delete(`/datasources/${id}`)
  return data
}

export async function syncDataSource(id: number) {
  const { data } = await api.post(`/datasources/${id}/sync`)
  return data
}

export async function getSyncLogs(id: number) {
  const { data } = await api.get(`/datasources/${id}/logs`)
  return data
}
