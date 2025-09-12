import { useState } from 'react'
import { useAuth } from '@store/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin@123')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string>('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await login(email, password)
      location.href = '/'
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{maxWidth: 420, marginTop: 80}}>
      <div className="card">
        <h2>Admin Login</h2>
        {err && <div style={{color:'#fca5a5', margin:'8px 0'}}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="row" style={{flexDirection:'column', gap:10}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" autoFocus />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
            <button className="btn-primary" disabled={loading} type="submit">
              {loading ? '...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
      <p style={{color:'#9ca3af', marginTop:8}}>Default: <code>admin@example.com / Admin@123</code></p>
    </div>
  )
}
