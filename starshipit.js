// Starshipit API service
// All calls go through /api/* Vercel serverless functions to keep API keys server-side

const BASE = '/api'

export async function getShipments(token, { page = 1, limit = 50, status, dateFrom, dateTo } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (status)   params.set('status', status)
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo)   params.set('date_to', dateTo)
  const res = await fetch(`${BASE}/shipments?${params}`, {
    headers: { 'x-client-token': token }
  })
  if (!res.ok) throw new Error(`Shipments error: ${res.status}`)
  return res.json()
}

export async function getTracking(token, trackingNumber) {
  const res = await fetch(`${BASE}/tracking?number=${encodeURIComponent(trackingNumber)}`, {
    headers: { 'x-client-token': token }
  })
  if (!res.ok) throw new Error(`Tracking error: ${res.status}`)
  return res.json()
}

export async function getSummary(token, { dateFrom, dateTo } = {}) {
  const params = new URLSearchParams()
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo)   params.set('date_to', dateTo)
  const res = await fetch(`${BASE}/summary?${params}`, {
    headers: { 'x-client-token': token }
  })
  if (!res.ok) throw new Error(`Summary error: ${res.status}`)
  return res.json()
}

export async function getRates(token) {
  const res = await fetch(`${BASE}/rates`, {
    headers: { 'x-client-token': token }
  })
  if (!res.ok) throw new Error(`Rates error: ${res.status}`)
  return res.json()
}
