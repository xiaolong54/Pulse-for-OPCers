import api from './api'

export async function predictTrend(metricName: string, days: number) {
  const { data } = await api.post('/ai/predict', null, { params: { metric_name: metricName, days } })
  return data
}

export async function analyzeData() {
  const { data } = await api.post('/ai/analyze')
  return data
}

export async function detectAnomaly() {
  const { data } = await api.post('/ai/detect-anomaly')
  return data
}

export async function simulateDecision(decision: string) {
  const { data } = await api.post(`/ai/simulate?decision=${encodeURIComponent(decision)}`)
  return data
}
