import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, ArrowRight, Mail, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (user) navigate('/dashboard') }, [user, navigate])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'signin') { await signIn(email, password); toast.success('Welcome back!') }
      else { await signUp(name, email, password); toast.success('Account created!') }
      navigate('/dashboard')
    } catch (err) { toast.error((err as Error).message) }
    finally { setBusy(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%', height: 42,
    background: 'oklch(0.27 0.03 258 / 60%)',
    border: '1px solid oklch(0.32 0.025 258 / 60%)',
    borderRadius: 8, padding: '0 12px 0 38px',
    color: 'oklch(0.98 0.005 250)', fontSize: 14, outline: 'none',
  }

  return (
    <div className="bg-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-strong" style={{ width: '100%', maxWidth: 420, borderRadius: 24, padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div className="shadow-glow" style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)' }}>
            <Wallet size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20 }}>Rupee<span className="text-gradient">Sense</span></span>
        </div>

        <div style={{ display: 'flex', background: 'oklch(0.27 0.03 258 / 60%)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {(['signin', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
              background: mode === m ? 'oklch(0.32 0.025 258)' : 'transparent',
              color: mode === m ? 'oklch(0.98 0.005 250)' : 'oklch(0.72 0.02 252)',
            }}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'oklch(0.72 0.02 252)', pointerEvents: 'none' }} />
              <input style={inp} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'oklch(0.72 0.02 252)', pointerEvents: 'none' }} />
            <input style={inp} type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'oklch(0.72 0.02 252)', pointerEvents: 'none' }} />
            <input style={inp} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={busy} type="submit" className="shadow-glow" style={{
            marginTop: 4, height: 44, borderRadius: 10, border: 'none',
            cursor: busy ? 'not-allowed' : 'pointer',
            background: 'var(--gradient-primary)', color: 'white',
            fontWeight: 600, fontSize: 15, opacity: busy ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'oklch(0.72 0.02 252)' }}>
          Powered by Supabase Auth + Gemini AI
        </p>
      </div>
    </div>
  )
}