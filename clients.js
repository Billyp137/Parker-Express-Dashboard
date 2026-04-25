// Client config — stored in localStorage (admin browser only)
// API keys never leave the server side; tokens are non-sensitive identifiers

const STORAGE_KEY = 'px_clients'

export function getClients() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveClients(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
}

export function addClient({ name, apiKey }) {
  const clients = getClients()
  const token = generateToken(name)
  const id = Date.now().toString(36)
  const newClient = { id, name, token, apiKey, createdAt: new Date().toISOString() }
  clients.push(newClient)
  saveClients(clients)
  return newClient
}

export function updateClient(id, updates) {
  const clients = getClients()
  const idx = clients.findIndex(c => c.id === id)
  if (idx === -1) return null
  clients[idx] = { ...clients[idx], ...updates }
  saveClients(clients)
  return clients[idx]
}

export function deleteClient(id) {
  const clients = getClients().filter(c => c.id !== id)
  saveClients(clients)
}

export function getClientByToken(token) {
  return getClients().find(c => c.token === token) || null
}

function generateToken(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${slug}_${rand}`
}

// Default clients — pre-seeded for Parker Express
export function seedDefaultClients() {
  if (getClients().length > 0) return
  const defaults = [
    { name: 'Maple Movement', apiKey: '' },
    { name: 'Gochi', apiKey: '' },
    { name: 'Elite Reformer', apiKey: '' },
  ]
  defaults.forEach(addClient)
}
