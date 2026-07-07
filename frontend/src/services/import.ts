import api from './api'

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/import/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function confirmImport(id: number) {
  const { data } = await api.post(`/import/confirm/${id}`)
  return data
}

export async function getImportRecords() {
  const { data } = await api.get('/import/records')
  return data
}

export async function getImportPreview(id: number) {
  const { data } = await api.get(`/import/preview/${id}`)
  return data
}

export async function deleteImportRecord(id: number) {
  const { data } = await api.delete(`/import/records/${id}`)
  return data
}
