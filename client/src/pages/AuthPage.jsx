import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode]     = useState('login') // 'login' | 'register'
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [shopName, setShop] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        if (!shopName.trim()) { setError('Shop name is required.'); setLoading(false); return }
        await register(email, password, shopName)
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', background: '#1E2030', border: '1px solid #2D3250',
    borderRadius: 10, padding: '11px 14px', color: '#F9FAFB',
    fontSize: 14, fontFamily: 'var(--font-body)',
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: 48 }}>🏪</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0.5rem 0 0.25rem' }}>
            PasalBot
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            {isRegister ? 'Create your shop in 2 minutes' : 'Welcome back'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#1E2030', border: '1px solid #2D3250',
          borderRadius: 16, padding: '2rem',
        }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: '#13151F', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
                background: mode === m ? 'var(--color-brand)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--color-text-muted)',
                transition: 'all 0.2s',
              }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Shop Name *
                </label>
                <input value={shopName} onChange={e => setShop(e.target.value)}
                  placeholder="e.g. Priya's Pasal" style={inp} required />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Email *
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" style={inp} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Password *
              </label>
              <input type="password" value={password} onChange={e => setPass(e.target.value)}
                placeholder={isRegister ? 'At least 6 characters' : '••••••••'} style={inp} required />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#F87171', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#9A4A1E' : 'var(--color-brand)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '12px',
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
              transition: 'background 0.2s',
            }}>
              {loading ? 'Please wait…' : (isRegister ? '🚀 Create My Shop' : 'Sign In →')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
