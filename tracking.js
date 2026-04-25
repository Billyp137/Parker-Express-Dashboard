// api/tracking.js — Vercel serverless function
// Fetches live tracking events from Starshipit

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

  const { number } = req.query
  if (!number) return res.status(400).json({ error: 'Missing tracking number' })

  try {
    const response = await fetch(
      `https://api.starshipit.com/api/track?tracking_number=${encodeURIComponent(number)}`,
      {
        headers: {
          'StarShipIT-Api-Key': apiKey,
          'Ocp-Apim-Subscription-Key': process.env.STARSHIPIT_SUBSCRIPTION_KEY || '',
          'Content-Type': 'application/json',
        }
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Starshipit tracking error:', response.status, err)
      return res.status(response.status).json({ error: 'Upstream API error' })
    }

    const data = await response.json()
    const order = data.order || {}

    const events = (order.tracking_events || []).map(e => ({
      timestamp: e.date
        ? new Date(e.date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
        : '—',
      description: e.description || e.status || '—',
      location: e.location || '—',
      completed: true,
    }))

    return res.status(200).json({
      trackingNumber: number,
      status: normaliseStatus(order.status),
      carrier: order.carrier || '—',
      recipient: order.destination?.name || '—',
      destination: [order.destination?.city, order.destination?.state].filter(Boolean).join(' ') || '—',
      estDelivery: order.estimated_delivery
        ? new Date(order.estimated_delivery).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—',
      events,
    })
  } catch (err) {
    console.error('Tracking handler error:', err)
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
