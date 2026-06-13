import { AppShell } from '../components/AppShell'
import { useData } from '../context/DataContext'
import { formatINR } from '../lib/utils'
import { useState } from 'react'
import { Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = ['Food', 'Shopping', 'Bills', 'Transport', 'Entertainment', 'Subscriptions', 'Rent', 'Other'] as const

export default function BudgetsPage() {
  const { budgets, setBudget, deleteBudget, analysis } = useData()
  const [category, setCategory] = useState<string>('Food')
  const [limit, setLimit] = useState('')

  // current-month spend per category from the analysis
  const spendByCat = new Map<string, number>()
  if (analysis) for (const c of analysis.byCategory) spendByCat.set(c.category, c.amount)

  async function handleSet() {
    const l = Number(limit)
    if (!l || l <= 0) { toast.error('Enter a valid limit'); return }
    await setBudget(category, l)
    setLimit('')
    toast.success(`Budget set for ${category}`)
  }

  const inp: React.CSSProperties = {
    height: 42, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 60%)',
    borderRadius: 10, padding: '0 14px', color: 'oklch(0.98 0.005 250)', fontSize: 14, outline: 'none',
  }

  const sorted = [...budgets].sort((a, b) => a.category.localeCompare(b.category))

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 6 }}>Budgets</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Set limits, get warned</h1>
        </div>

        {/* Set budget */}
        <div className="glass" style={{ borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={18} /> Set a monthly limit
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10 }}>
            <select style={inp} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input style={inp} type="number" placeholder="Monthly limit ₹" value={limit} onChange={(e) => setLimit(e.target.value)} />
            <button onClick={handleSet} className="shadow-glow" style={{ height: 42, padding: '0 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: 14 }}>
              Save
            </button>
          </div>
        </div>

        {/* Budget bars */}
        {sorted.length === 0 ? (
          <div className="glass" style={{ borderRadius: 24, padding: 40, textAlign: 'center', color: 'oklch(0.72 0.02 252)' }}>
            <Wallet size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No budgets yet. Set a limit above and we'll warn you when you're close to overspending.</p>
          </div>
        ) : (
          <div className="glass" style={{ borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {sorted.map((b) => {
              const spent = spendByCat.get(b.category) ?? 0
              const pct = Math.round((spent / b.monthly_limit) * 100)
              const over = spent > b.monthly_limit
              const warn = pct >= 80 && !over
              const color = over ? '#ef4444' : warn ? '#f59e0b' : '#22c55e'
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15 }}>
                      {over ? <AlertTriangle size={16} color={color} /> : <CheckCircle2 size={16} color={color} />}
                      {b.category}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)' }}>
                        {formatINR(spent)} / {formatINR(b.monthly_limit)}
                      </span>
                      <button onClick={() => deleteBudget(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}>Remove</button>
                    </div>
                  </div>
                  <div style={{ height: 10, borderRadius: 6, background: 'oklch(0.27 0.03 258 / 80%)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, borderRadius: 6, background: color, transition: 'width 0.4s' }} />
                  </div>
                  {over && <div style={{ fontSize: 12, color, marginTop: 4 }}>⚠️ Over budget by {formatINR(spent - b.monthly_limit)}</div>}
                  {warn && <div style={{ fontSize: 12, color, marginTop: 4 }}>You've used {pct}% of this budget.</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
