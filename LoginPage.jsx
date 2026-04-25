import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Simple PIN protection for admin — change ADMIN_PIN in env vars
  const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('px_admin', '1')
      navigate('/admin')
    } else {
      setError('Incorrect PIN')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Logo size="lg" className="justify-center mb-10" />
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-lg font-semibold text-white mb-1">Admin Access</div>
            <div className="text-sm text-zinc-500">Enter your PIN to continue</div>
          </div>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••"
            className="w-full bg-dark border border-border rounded-xl px-4 py-3 text-center text-xl text-white tracking-widest outline-none focus:border-gold transition-colors mb-3"
            autoFocus
          />
          {error && <div className="text-xs text-red-400 text-center mb-3">{error}</div>}
          <button onClick={handleLogin} className="w-full bg-gold hover:bg-gold-dark text-black font-semibold py-3 rounded-xl transition-colors">
            Enter
          </button>
        </div>
      </div>
    </div>
  )
}
