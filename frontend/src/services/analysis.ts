import api from './api'

export async function getCategories() {
  const { data } = await api.get('/analysis/categories')
  return data
}

export async function getRegions() {
  const { data } = await api.get('/analysis/regions')
  return data
}

export async function getData(params: {
  category?: string
  region?: string
  start?: string
  end?: string
}) {
  const { data } = await api.get('/analysis/data', { params })
  return data
}

export async function getChartData(params: {
  category?: string
  region?: string
  start?: string
  end?: string
}) {
  const { data } = await api.get('/analysis/chart-data', { params })
  return data
}
