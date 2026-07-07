import api from './api'

export async function getTasks(params?: { project?: string; status?: string }) {
  const { data } = await api.get('/tasks', { params })
  return data
}

export async function createTask(task: any) {
  const { data } = await api.post('/tasks', task)
  return data
}

export async function updateTask(id: number, task: any) {
  const { data } = await api.put(`/tasks/${id}`, task)
  return data
}

export async function deleteTask(id: number) {
  const { data } = await api.delete(`/tasks/${id}`)
  return data
}

export async function completeTask(id: number) {
  const { data } = await api.post(`/tasks/${id}/complete`)
  return data
}

export async function getTaskStats() {
  const { data } = await api.get('/tasks/stats')
  return data
}
