import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, LayoutDashboard, History, Sparkles, Trophy, Bot, Settings, LogOut, Target, PiggyBank, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: History },
  { to: '/insights', label: 'Insights', icon: Sparkles },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/advisor', label: 'AI Advisor', icon: Bot },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/savings', label: 'Savings', icon: TrendingUp },
] as const

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      backdropFilter: 'blur(20px)',
      background: 'oklch(0.18 0.03 255 / 80%)',
      borderBottom: '1px solid oklch(0.32 0.025 258 / 40%)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div className="shadow-glow" style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)', flexShrink: 0 }}>
            <Wallet size={18} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 18, color: 'oklch(0.98 0.005 250)' }}>
            Rupee<span className="text-gradient">Sense</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: 4, marginLeft: 16, flexShrink: 0 }}>
          {links.map((l) => {
            const Icon = l.icon
            const active = pathname.startsWith(l.to)
            return (
              <Link key={l.to} to={l.to} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                fontSize: 14, fontWeight: 500, textDecoration: 'none',
                background: active ? 'oklch(0.27 0.03 258)' : 'transparent',
                color: active ? 'oklch(0.98 0.005 250)' : 'oklch(0.72 0.02 252)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}>
                <Icon size={15} />{l.label}
              </Link>
            )
          })}
        </nav>

        {user && (
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button onClick={() => setOpen((x) => !x)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 12px 4px 4px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              background: 'oklch(0.27 0.03 258 / 80%)', color: 'inherit',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: 14, color: 'white',
                background: `linear-gradient(135deg, ${user.avatarColor}, #14b8a6)`,
              }}>
                {user.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 14 }}>{user.name}</span>
            </button>
            {open && (
              <div className="glass-strong" style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                borderRadius: 12, padding: 8, minWidth: 180, zIndex: 50,
              }}>
                <div style={{ padding: '6px 12px 10px', fontSize: 12, color: 'oklch(0.72 0.02 252)', borderBottom: '1px solid oklch(0.32 0.025 258 / 40%)', marginBottom: 4 }}>
                  {user.email}
                </div>
                <button onClick={() => { navigate('/settings'); setOpen(false) }} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Settings size={14} /> Settings
                </button>
                <button onClick={handleSignOut} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}