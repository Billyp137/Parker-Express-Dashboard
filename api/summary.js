// api/summary.js — Vercel serverless function
// Returns aggregated metrics for a client

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'x-client-token, Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const clientToken = req.headers['x-client-token']
  if (!clientToken) return res.status(400).json({ error: 'Missing client token' })

  const envKey = `PX_APIKEY_${clientToken.replace(/[^a-z0-9_]/gi, '_').toUpperCase()}`
  const apiKey = process.env[envKey]
  if (!apiKey) return res.status(401).json({ error: 'No API key configured for this client' })

  const { date_from, date_to } = req.query

  try {
    // Fetch all orders for the period — paginate if needed
    const params = new URLSearchParams({ resultsperpage: 250, page: 1 })
    if (date_from) params.set('date_start', date_from)
    if (date_to) params.set('date_end', date_to)

    const response = await fetch(`https://api.starshipit.com/api/orders/all?${params}`, {
      headers: {
        'StarShipIT-Api-Key': apiKey,
        'Ocp-Apim-Subscription-Key': process.env.STARSHIPIT_SUBSCRIPTION_KEY || '',
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) return res.status(response.status).json({ error: 'Upstream API error' })

    const data = await response.json()
    const orders = data.orders || []

    // Aggregate stats
    const statusCounts = {}
    const carrierCounts = {}
    const dailyCounts = {}

    orders.forEach(o => {
      const status = normaliseStatus(o.status)
      statusCounts[status] = (statusCounts[status] || 0) + 1

      const carrier = o.carrier || 'Unknown'
      carrierCounts[carrier] = (carrierCounts[carrier] || 0) + 1

      if (o.shipment_date) {
        const day = o.shipment_date.slice(0, 10)
        dailyCounts[day] = (dailyCounts[day] || 0) + 1
      }
    })

    const total = orders.length
    const delivered = statusCounts['Delivered'] || 0

    return res.status(200).json({
      total,
      delivered,
      inTransit: (statusCounts['In Transit'] || 0) + (statusCounts['Out for Delivery'] || 0),
      pending: statusCounts['Pending'] || 0,
      exceptions: statusCounts['Exception'] || 0,
      successRate: total ? Math.round(delivered / total * 100) : 0,
      statusBreakdown: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      carrierBreakdown: Object.entries(carrierCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
      dailyBreakdown: Object.entries(dailyCounts).sort().map(([date, count]) => ({ date, count })),
    })
  } catch (err) {
    console.error('Summary handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function normaliseStatus(s) {
  if (!s) return 'Pending'
  const lower = s.toLowerCase()
  if (lower.includes('delivered')) return 'Delivered'
  if (lower.includes('out for delivery') || lower.includes('out_for_delivery')) return 'Out for Delivery'
  if (lower.includes('transit') || lower.includes('in_transit')) return 'In Transit'
  if (lower.includes('exception') || lower.includes('failed') || lower.includes('undeliverable')) return 'Exception'
  if (lower.includes('pending') || lower.includes('ready')) return 'Pending'
  return s
}
