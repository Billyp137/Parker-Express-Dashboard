import { useState, useEffect } from 'react'
import { Plus, Trash2, Copy, Eye, EyeOff, ExternalLink, CheckCircle, Key, Users } from 'lucide-react'
import Logo from '../components/Logo'
import { getClients, addClient, updateClient, deleteClient, seedDefaultClients } from '../services/clients'

const DASHBOARD_BASE = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.host}/client`
  : 'https://dashboard.parkerexpress.com.au/client'

export default function AdminPage() {
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [showKeys, setShowKeys] = useState({})
  const [copied, setCopied] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    seedDefaultClients()
    setClients(getClients())
  }, [])

  const refresh = () => setClients(getClients())

  const handleAdd = () => {
    if (!newName.trim()) return
    addClient({ name: newName.trim(), apiKey: newKey.trim() })
    setNewName('')
    setNewKey('')
    setShowForm(false)
    refresh()
  }

  const handleUpdateKey = (id, key) => {
    updateClient(id, { apiKey: key })
    refresh()
  }

  const handleDelete = (id, name) => {
    if (confirm(`Remove ${name} from the dashboard? Their link will stop working.`)) {
      deleteClient(id)
      refresh()
    }
  }

  const copyLink = (token) => {
    const url = `${DASHBOARD_BASE}/${token}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(p => ({ ...p, [token]: true }))
    setTimeout(() => setCopied(p => ({ ...p, [token]: false })), 2000)
  }

  const toggleKeyVisibility = (id) => {
    setShowKeys(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <div className="min-h-screen bg-dark">
      <header className="bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="text-xs text-zinc-500 bg-card border border-border px-3 py-1.5 rounded-lg">
            Admin Panel
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Client Dashboard Manager</h1>
          <p className="text-zinc-500 text-sm">Add client API keys and share their unique dashboard links.</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Active Clients</div>
            <div className="text-2xl font-semibold text-white">{clients.length}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">API Keys Set</div>
            <div className="text-2xl font-semibold text-gold">{clients.filter(c => c.apiKey).length}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Live Dashboards</div>
            <div className="text-2xl font-semibold text-green-400">{clients.filter(c => c.apiKey).length}</div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Key size={16} className="text-gold mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gold mb-1">How to connect a client</div>
              <ol className="text-xs text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Log into your Starshipit account and go to the client's child account</li>
                <li>Copy their API key from Settings → API</li>
                <li>Paste it into the field below for that client</li>
                <li>Send them their unique dashboard link — that's it!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Client list */}
        <div className="space-y-3 mb-6">
          {clients.map(client => (
            <div key={client.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-semibold text-white">{client.name}</div>
                  <div className="text-xs text-zinc-600 font-mono mt-0.5">
                    Added {new Date(client.createdAt).toLocaleDateString('en-AU')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${client.apiKey ? 'bg-green-950 text-green-400' : 'bg-zinc-900 text-zinc-500'}`}>
                    {client.apiKey ? 'Live' : 'Demo mode'}
                  </span>
                  <button onClick={() => handleDelete(client.id, client.name)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/30">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* API Key field */}
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 mb-1.5">Starshipit Child Account API Key</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-dark border border-border-light rounded-lg px-3 gap-2">
                    <Key size={12} className="text-zinc-600 shrink-0" />
                    <input
                      type={showKeys[client.id] ? 'text' : 'password'}
                      value={client.apiKey || ''}
                      onChange={e => handleUpdateKey(client.id, e.target.value)}
                      placeholder="Paste API key from Starshipit..."
                      className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-700 outline-none py-2.5 font-mono"
                    />
                  </div>
                  <button onClick={() => toggleKeyVisibility(client.id)} className="px-3 border border-border rounded-lg text-zinc-500 hover:text-white transition-colors">
                    {showKeys[client.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {!client.apiKey && (
                  <div className="text-xs text-zinc-600 mt-1.5">No API key — dashboard will show demo data until you add one</div>
                )}
              </div>

              {/* Dashboard link */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Client Dashboard Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-dark border border-border rounded-lg px-3">
                    <span className="text-xs text-zinc-600 font-mono truncate py-2.5">
                      {DASHBOARD_BASE}/{client.token}
                    </span>
                  </div>
                  <button
                    onClick={() => copyLink(client.token)}
                    className={`flex items-center gap-1.5 px-4 border rounded-lg text-xs font-medium transition-all ${
                      copied[client.token]
                        ? 'border-green-700 text-green-400 bg-green-950'
                        : 'border-border text-zinc-400 hover:border-gold hover:text-gold'
                    }`}
                  >
                    {copied[client.token] ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                  <a
                    href={`/client/${client.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 border border-border rounded-lg text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                  >
                    <ExternalLink size={12} /> Preview
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add client form */}
        {showForm ? (
          <div className="bg-card border border-gold/30 rounded-xl p-5">
            <div className="text-sm font-medium text-white mb-4">Add new client</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Client / Business name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Maple Movement"
                  className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-gold transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Starshipit API Key (optional — can add later)</label>
                <input
                  type="password"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  placeholder="Paste API key..."
                  className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-gold transition-colors font-mono"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleAdd} disabled={!newName.trim()} className="bg-gold hover:bg-gold-dark disabled:opacity-40 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                  Add Client
                </button>
                <button onClick={() => { setShowForm(false); setNewName(''); setNewKey('') }} className="px-5 py-2 border border-border rounded-lg text-zinc-400 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-border hover:border-gold text-zinc-500 hover:text-gold rounded-xl py-4 text-sm transition-all"
          >
            <Plus size={16} /> Add new client
          </button>
        )}
      </main>
    </div>
  )
}
