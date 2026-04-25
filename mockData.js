// Mock data — used when no API key is set or for demo mode
import { subDays, format } from 'date-fns'

const CARRIERS = ['Australia Post', 'StarTrack', 'Couriers Please', 'Aramex', 'TNT Express']
const STATUSES = ['Delivered', 'Delivered', 'Delivered', 'In Transit', 'In Transit', 'Out for Delivery', 'Pending', 'Exception']
const CITIES = ['Melbourne VIC 3000', 'Sydney NSW 2000', 'Brisbane QLD 4000', 'Perth WA 6000', 'Adelaide SA 5000', 'Hobart TAS 7000', 'Darwin NT 0800', 'Canberra ACT 2600']
const NAMES = ['Sarah Chen', 'Marcus Webb', 'Priya Patel', 'James O\'Brien', 'Lily Nguyen', 'Tom Barker', 'Emma Walsh', 'Ryan Scott', 'Zoe Anderson', 'Liam Harris', 'Mia Thompson', 'Noah Williams']

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

export function generateMockShipments(clientId, count = 60) {
  const seed = clientId.charCodeAt(0)
  const shipments = []
  for (let i = 0; i < count; i++) {
    const daysAgo = rndInt(0, 89)
    const dispatchDate = subDays(new Date(), daysAgo)
    const estDelivery = subDays(new Date(), Math.max(0, daysAgo - rndInt(1, 4)))
    const status = STATUSES[Math.floor((i * seed) % STATUSES.length)]
    const carrier = CARRIERS[Math.floor((i + seed) % CARRIERS.length)]
    shipments.push({
      id: `ship_${clientId}_${i}`,
      trackingNumber: `PE${clientId.toUpperCase().slice(0, 2)}${String(100000 + i * 7 + seed).slice(0, 6)}`,
      recipient: NAMES[(i + seed) % NAMES.length],
      destination: CITIES[(i * 2 + seed) % CITIES.length],
      carrier,
      status,
      weight: (rndInt(1, 50) * 0.1).toFixed(1) + ' kg',
      dispatchDate: format(dispatchDate, 'dd MMM yyyy'),
      estDelivery: format(estDelivery, 'dd MMM yyyy'),
      dispatchDateRaw: dispatchDate,
      reference: `ORD-${String(10000 + i + seed * 3).slice(0, 5)}`,
    })
  }
  return shipments.sort((a, b) => b.dispatchDateRaw - a.dispatchDateRaw)
}

export function generateMockTracking(trackingNumber) {
  const now = new Date()
  return {
    trackingNumber,
    status: 'In Transit',
    carrier: 'Australia Post',
    events: [
      { timestamp: format(subDays(now, 3), 'dd MMM, h:mm a'), description: 'Order received by Parker Express', location: 'South Melbourne VIC 3205', completed: true },
      { timestamp: format(subDays(now, 3), 'dd MMM, h:mm a'), description: 'Shipment picked up', location: 'South Melbourne VIC 3205', completed: true },
      { timestamp: format(subDays(now, 2), 'dd MMM, h:mm a'), description: 'Arrived at carrier facility', location: 'Melbourne Parcel Facility VIC', completed: true },
      { timestamp: format(subDays(now, 1), 'dd MMM, h:mm a'), description: 'In transit to destination', location: 'Sydney NSW Sortation Centre', completed: true },
      { timestamp: format(now, 'dd MMM, h:mm a'), description: 'Out for delivery', location: 'Sydney NSW 2000', completed: false },
      { timestamp: '—', description: 'Delivered', location: '—', completed: false },
    ]
  }
}
