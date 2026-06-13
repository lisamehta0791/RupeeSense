import { AppShell } from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'
import Papa from 'papaparse'

export default function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth()
  const { deleteAllData, transactions } = useData()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name ?? '')

  function exportCSV() {
    if (transactions.length === 0) { toast.error('No transactions to export'); return }
    const rows = transactions.map((t) => ({
      date: new Date(t.date).toISOString().slice(0, 10),
      merchant: t.merchant,
      amount: t.amount,
      category: t.category,
      note: t.note ?? '',
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rupeesense-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported CSV')
  }

  const card: React.CSSProperties = { borderRadius: 24, padding: 24, marginBottom: 0 }
  const inp: React.CSSProperties = { width: '100%', height: 40, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 60%)', borderRadius: 8, padding: '0 12px', color: 'oklch(0.98 0.005 250)', fontSize: 14, outline: 'none' }
  const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'oklch(0.72 0.02 252)', marginBottom: 6, display: 'block' }

  return (
    <AppShell>
      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 6 }}>Settings</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Profile & data</h1>
        </div>

        <div className="glass" style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, color: 'white', background: `linear-gradient(135deg, ${user?.avatarColor ?? '#14b8a6'}, #14b8a6)`, flexShrink: 0 }}>
              {user?.name[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={label}>Display Name</label>
            <input style={inp} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button onClick={() => { updateProfile({ name }); toast.success('Profile updated') }} style={{ height: 40, padding: '0 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: 14 }}>
            Save Changes
          </button>
        </div>

        <div className="glass" style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Transaction Data</div>
          <div style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)', marginBottom: 16 }}>
            You have {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} loaded.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={exportCSV} style={{ height: 40, padding: '0 20px', borderRadius: 8, border: '1px solid oklch(0.32 0.025 258 / 60%)', cursor: 'pointer', background: 'transparent', color: '#14b8a6', fontWeight: 600, fontSize: 14 }}>
              Export CSV
            </button>
            <button onClick={() => { if (confirm('Permanently delete ALL your transactions? This cannot be undone.')) { deleteAllData(); toast.success('All data permanently deleted'); navigate('/dashboard') } }} style={{ height: 40, padding: '0 20px', borderRadius: 8, border: '1px solid oklch(0.66 0.22 27 / 50%)', cursor: 'pointer', background: 'oklch(0.66 0.22 27 / 10%)', color: '#ef4444', fontWeight: 600, fontSize: 14 }}>
              Delete All Data
            </button>
          </div>
        </div>

        <div className="glass" style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Account</div>
          <button onClick={async () => { await signOut(); navigate('/auth') }} style={{ height: 40, padding: '0 20px', borderRadius: 8, border: '1px solid oklch(0.32 0.025 258 / 60%)', cursor: 'pointer', background: 'transparent', color: 'inherit', fontWeight: 600, fontSize: 14 }}>
            Sign Out
          </button>
        </div>
      </div>
    </AppShell>
  )
}