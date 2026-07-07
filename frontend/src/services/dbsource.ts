import api from './api'

export async function getDbSources() {
  const { data } = await api.get('/db-sources')
  return data
}

export async function createDbSource(source: any) {
  const { data } = await api.post('/db-sources', source)
  return data
}

export async function deleteDbSource(id: number) {
  const { data } = await api.delete(`/db-sources/${id}`)
  return data
}

export async function testDbConnection(id: number) {
  const { data } = await api.post(`/db-sources/${id}/test`)
  return data
}

export async function syncDbSource(id: number) {
  const { data } = await api.post(`/db-sources/${id}/sync`)
  return data
}

export async function getDbTables(id: number) {
  const { data } = await api.get(`/db-sources/${id}/tables`)
  return data
}
