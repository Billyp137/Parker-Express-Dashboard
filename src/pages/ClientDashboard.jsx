import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Package, Truck, CheckCircle, AlertTriangle, Clock, Search, RefreshCw, ChevronRight } from 'lucide-react'
import { subDays, format, isAfter } from 'date-fns'
import Logo from '../components/Logo'
import StatusPill from '../components/StatusPill'
import MetricCard from '../components/MetricCard'
import { getClientByToken } from '../services/clients'
import { generateMockShipments, generateMockTracking } from '../services/mockData'

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

const STATUS_COLORS = {
  'Delivered': '#4ade80',
  'In Transit': '#60a5fa',
  'Out for Delivery': '#93c5fd',
  'Pending': '#F5A623',
  'Exception': '#f87171',
}

const TABS = ['Overview', 'Shipments', 'Tracking']

export default function ClientDashboard() {
  const { token } = useParams()
  const [client, setClient] = useState(null)
  const [shipments, setShipments] = useState([])
  const [activeTab, setActiveTab] = useState('Overview')
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [trackingInput, setTrackingInput] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const c = getClientByToken(token)
    if (c) {
      setClient(c)
      loadShipments(c)
    } else {
      setLoading(false)
    }
  }, [token])

  const loadShipments = useCallback(async (c) => {
    setLoading(true)
    try {
      if (c?.apiKey) {
        const res = await fetch('/api/shipments', {
          headers: { 'x-client-token': token }
        })
        if (res.ok) {
          const data = await res.json()
          setShipments(data.shipments || [])
          setLastUpdated(new Date())
          setLoading(false)
          return
        }
      }
      // Fallback to mock data
      await new Promise(r => setTimeout(r, 600))
      setShipments(generateMockShipments(c?.id || token, 72))
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [token])

  const filteredByRange = shipments.filter(s => {
    const cutoff = subDays(new Date(), range)
    return s.dispatchDateRaw ? isAfter(s.dispatchDateRaw, cutoff) : true
  })

  const stats = {
    total: filteredByRange.length,
    delivered: filteredByRange.filter(s => s.status === 'Delivered').length,
    inTransit: filteredByRange.filter(s => ['In Transit', 'Out for Delivery'].includes(s.status)).length,
    pending: filteredByRange.filter(s => s.status === 'Pending').length,
    exceptions: filteredByRange.filter(s => s.status === 'Exception').length,
  }
  stats.successRate = stats.total ? Math.round(stats.delivered / stats.total * 100) : 0

  const statusBreakdown = Object.entries(
    filteredByRange.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const dailyData = (() => {
    const days = range <= 7 ? 7 : range <= 30 ? 14 : 12
    const buckets = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i)
      buckets[format(d, 'dd MMM')] = 0
    }
    filteredByRange.forEach(s => {
      if (s.dispatchDateRaw) {
        const k = format(s.dispatchDateRaw, 'dd MMM')
        if (buckets[k] !== undefined) buckets[k]++
      }
    })
    return Object.entries(buckets).map(([date, count]) => ({ date, count }))
  })()

  const carrierData = Object.entries(
    filteredByRange.reduce((acc, s) => { acc[s.carrier] = (acc[s.carrier] || 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

  const filteredShipments = filteredByRange.filter(s => {
    const q = searchQuery.toLowerCase()
    const matchQ = !q || s.trackingNumber?.toLowerCase().includes(q) || s.recipient?.toLowerCase().includes(q) || s.reference?.toLowerCase().includes(q)
    const matchS = !statusFilter || s.status === statusFilter
    return matchQ && matchS
  })

  const handleTrack = async () => {
    if (!trackingInput.trim()) return
    setTrackingLoading(true)
    setTrackingResult(null)
    try {
      if (client?.apiKey) {
        const res = await fetch(`/api/tracking?number=${encodeURIComponent(trackingInput)}`, {
          headers: { 'x-client-token': token }
        })
        if (res.ok) { setTrackingResult(await res.json()); return }
      }
      await new Promise(r => setTimeout(r, 800))
      setTrackingResult(generateMockTracking(trackingInput))
    } finally {
      setTrackingLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <Logo size="lg" className="justify-center mb-6" />
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          Loading your dashboard...
        </div>
      </div>
    </div>
  )

  if (!client) return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <Logo size="lg" className="justify-center mb-6" />
        <div className="text-zinc-400 mb-2">Dashboard not found</div>
        <div className="text-zinc-600 text-sm">This link may be invalid or expired. Contact Parker Express for a new link.</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-zinc-500">Viewing dashboard for</div>
              <div className="text-sm font-semibold text-gold">{client.name}</div>
            </div>
            <button
              onClick={() => loadShipments(client)}
              className="p-2 rounded-lg hover:bg-card text-zinc-500 hover:text-white transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-border">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-gold text-gold'
                  : 'border-transparent text-zinc-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div>
            {/* Range filter */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                {RANGE_OPTIONS.map(o => (
                  <button
                    key={o.days}
                    onClick={() => setRange(o.days)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      range === o.days ? 'bg-gold text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-zinc-600 font-mono">
                Updated {format(lastUpdated, 'h:mm a')}
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              <MetricCard label="Total Shipments" value={stats.total} className="animate-fade-up stagger-1" />
              <MetricCard label="Delivered" value={stats.delivered} sub={`${stats.successRate}% success`} subColor="text-green-500" className="animate-fade-up stagger-2" />
              <MetricCard label="In Transit" value={stats.inTransit} sub="Active" subColor="text-blue-400" className="animate-fade-up stagger-3" />
              <MetricCard label="Pending" value={stats.pending} sub="Awaiting dispatch" subColor="text-yellow-500" className="animate-fade-up stagger-4" />
              <MetricCard label="Exceptions" value={stats.exceptions} sub={stats.exceptions > 0 ? 'Needs attention' : 'All clear'} subColor={stats.exceptions > 0 ? 'text-red-400' : 'text-green-500'} accent={stats.exceptions > 0} className="animate-fade-up stagger-5 col-span-2 lg:col-span-1" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Daily bar chart */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 animate-fade-up stagger-3">
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-medium">Shipments dispatched</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dailyData} barCategoryGap="30%">
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} cursor={{ fill: '#ffffff08' }} />
                    <Bar dataKey="count" fill="#F5A623" radius={[3, 3, 0, 0]} name="Shipments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status donut */}
              <div className="bg-card border border-border rounded-xl p-5 animate-fade-up stagger-4">
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-medium">Status breakdown</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                      {statusBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#555'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 mt-2">
                  {statusBreakdown.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#555' }} />
                        <span className="text-zinc-400">{s.name}</span>
                      </div>
                      <span className="text-white font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carrier split */}
            <div className="bg-card border border-border rounded-xl p-5 animate-fade-up stagger-5">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-medium">Carrier split</div>
              <div className="flex flex-col gap-3">
                {carrierData.map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-300">{c.name}</span>
                      <span className="text-zinc-500">{c.value} <span className="text-zinc-600">({Math.round(c.value / stats.total * 100)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all duration-700"
                        style={{ width: `${c.value / stats.total * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SHIPMENTS TAB */}
        {activeTab === 'Shipments' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 min-w-48">
                <Search size={14} className="text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search tracking, recipient, reference..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-card border border-border text-sm text-zinc-300 rounded-lg px-3 py-2 outline-none"
              >
                <option value="">All statuses</option>
                {['Delivered', 'In Transit', 'Out for Delivery', 'Pending', 'Exception'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                {RANGE_OPTIONS.map(o => (
                  <button key={o.days} onClick={() => setRange(o.days)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${range === o.days ? 'bg-gold text-black' : 'text-zinc-400 hover:text-white'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-zinc-600 mb-3">{filteredShipments.length} shipments</div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Tracking #', 'Reference', 'Recipient', 'Destination', 'Carrier', 'Dispatched', 'Est. Delivery', 'Status'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.slice(0, 100).map((s, i) => (
                      <tr key={s.id || i} className="border-b border-border hover:bg-surface transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gold">{s.trackingNumber}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{s.reference}</td>
                        <td className="px-4 py-3 text-zinc-200 whitespace-nowrap">{s.recipient}</td>
                        <td className="px-4 py-3 text-zinc-400 whitespace-nowrap text-xs">{s.destination}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{s.carrier}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{s.dispatchDate}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{s.estDelivery}</td>
                        <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                      </tr>
                    ))}
                    {filteredShipments.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-600 text-sm">No shipments found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TRACKING TAB */}
        {activeTab === 'Tracking' && (
          <div className="max-w-2xl">
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                placeholder="Enter tracking number (e.g. PEMM100034)"
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-gold transition-colors font-mono"
              />
              <button
                onClick={handleTrack}
                disabled={trackingLoading}
                className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-black font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm"
              >
                {trackingLoading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
                Track
              </button>
            </div>

            {trackingResult && (
              <div className="bg-card border border-border rounded-xl p-6 animate-fade-up stagger-1">
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Tracking number</div>
                    <div className="font-mono text-gold font-medium">{trackingResult.trackingNumber}</div>
                  </div>
                  <StatusPill status={trackingResult.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
                  <div><div className="text-xs text-zinc-500 mb-1">Carrier</div><div className="text-sm text-zinc-200">{trackingResult.carrier}</div></div>
                  <div><div className="text-xs text-zinc-500 mb-1">Current status</div><div className="text-sm text-zinc-200">{trackingResult.status}</div></div>
                </div>

                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-medium">Tracking Timeline</div>
                <div className="flex flex-col">
                  {trackingResult.events.map((event, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${event.completed ? 'bg-gold' : 'bg-border'}`} />
                        {i < trackingResult.events.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                      </div>
                      <div className={`pb-5 ${event.completed ? '' : 'opacity-40'}`}>
                        <div className={`text-sm font-medium ${event.completed ? 'text-white' : 'text-zinc-500'}`}>{event.description}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{event.location} · {event.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!trackingResult && !trackingLoading && (
              <div className="text-center py-16 text-zinc-600">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <div className="text-sm">Enter a tracking number to see live status</div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="text-xs text-zinc-600">Powered by Parker Express</div>
          <div className="text-xs text-zinc-600">dashboard.parkerexpress.com.au</div>
        </div>
      </footer>
    </div>
  )
}
