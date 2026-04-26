// api/shipments.js — Vercel serverless function
// Proxies to Starshipit API keeping the API key server-side

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'x-client-token, Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const clientToken = req.headers['x-client-token']
  if (!clientToken) return res.status(400).json({ error: 'Missing client token' })

  // Look up API key from environment variables
  // Format: PX_APIKEY_<TOKEN> e.g. PX_APIKEY_maple_ab1234=sk_live_...
  const envKey = `PX_APIKEY_${clientToken.replace(/[^a-z0-9_]/gi, '_').toUpperCase()}`
  const apiKey = process.env[envKey]

  if (!apiKey) return res.status(401).json({ error: 'No API key configured for this client' })

  const { page = 1, limit = 50, status, date_from, date_to } = req.query

  try {
    const params = new URLSearchParams({ resultsperpage: limit, page })
    if (status) params.set('status', status)
    if (date_from) params.set('date_start', date_from)
    if (date_to) params.set('date_end', date_to)

    const response = await fetch(`https://api.starshipit.com/api/orders?${params}`, {
      headers: {
        'StarShipIT-Api-Key': apiKey,
        'Ocp-Apim-Subscription-Key': process.env.STARSHIPIT_SUBSCRIPTION_KEY || '',
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Starshipit error:', response.status, err)
      return res.status(response.status).json({ error: 'Upstream API error' })
    }

    const data = await response.json()
                            console.log('data.data type:', typeof data.data, 'isArray:', Array.isArray(data.data), 'preview:', JSON.stringify(data.data).substring(0, 300))

    // Normalise Starshipit response to our format
    const shipments = (data.data || []).map(o => ({
      id: o.order_id,
      trackingNumber: o.tracking_number || o.order_number,
      reference: o.order_number,
      recipient: o.destination?.name || '—',
      destination: [o.destination?.city, o.destination?.state, o.destination?.postcode].filter(Boolean).join(' '),
      carrier: o.carrier || '—',
      status: normaliseStatus(o.status),
      weight: o.packages?.reduce((s, p) => s + (p.weight || 0), 0).toFixed(1) + ' kg',
      dispatchDate: o.shipment_date ? new Date(o.shipment_date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
      estDelivery: o.estimated_delivery ? new Date(o.estimated_delivery).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
      dispatchDateRaw: o.shipment_date ? new Date(o.shipment_date) : null,
    }))

    return res.status(200).json({ shipments, total: data.total_records || shipments.length })
  } catch (err) {
    console.error('Handler error:', err)
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
