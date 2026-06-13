import { AppShell } from '../components/AppShell'
import { useData } from '../context/DataContext'
import { formatINR } from '../lib/utils'
import { useState } from 'react'
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData()
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    const t = Number(target)
    if (!title.trim() || !t || t <= 0) {
      toast.error('Enter a goal name and a valid target amount')
      return
    }
    setAdding(true)
    await addGoal({ title: title.trim(), target_amount: t, saved_amount: 0, deadline: deadline || null })
    setTitle(''); setTarget(''); setDeadline('')
    setAdding(false)
    toast.success('Goal added 🎯')
  }

  async function contribute(id: string, current: number, target: number) {
    const input = prompt('How much did you add to this goal? (₹)')
    if (!input) return
    const amt = Number(input)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    const next = Math.min(current + amt, target)
    await updateGoal(id, { saved_amount: next })
    toast.success(`Added ${formatINR(amt)} 🎉`)
  }

  const inp: React.CSSProperties = {
    height: 42, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 60%)',
    borderRadius: 10, padding: '0 14px', color: 'oklch(0.98 0.005 250)', fontSize: 14, outline: 'none',
  }

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 6 }}>Savings Goals</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>What are you saving for?</h1>
        </div>

        {/* Add goal */}
        <div className="glass" style={{ borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> New Goal
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
            <input style={inp} placeholder="e.g. Emergency Fund, Goa Trip" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input style={inp} type="number" placeholder="Target ₹" value={target} onChange={(e) => setTarget(e.target.value)} />
            <input style={inp} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <button onClick={handleAdd} disabled={adding} className="shadow-glow" style={{ height: 42, padding: '0 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: 14, opacity: adding ? 0.6 : 1 }}>
              Add
            </button>
          </div>
        </div>

        {/* Goals list */}
        {goals.length === 0 ? (
          <div className="glass" style={{ borderRadius: 24, padding: 40, textAlign: 'center', color: 'oklch(0.72 0.02 252)' }}>
            <Target size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No goals yet. Add your first savings goal above — it's the best way to stay motivated.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.saved_amount / g.target_amount) * 100))
              const done = pct >= 100
              return (
                <div key={g.id} className="glass" style={{ borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>{g.title}</div>
                      {g.deadline && <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', marginTop: 2 }}>by {new Date(g.deadline).toLocaleDateString('en-IN')}</div>}
                    </div>
                    <button onClick={() => deleteGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: 'oklch(0.72 0.02 252)' }}>{formatINR(g.saved_amount)} of {formatINR(g.target_amount)}</span>
                      <span style={{ fontWeight: 700, color: done ? '#22c55e' : '#14b8a6' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 6, background: 'oklch(0.27 0.03 258 / 80%)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 6, background: done ? '#22c55e' : 'var(--gradient-primary)', transition: 'width 0.4s' }} />
                    </div>
                  </div>

                  {done ? (
                    <div style={{ textAlign: 'center', color: '#22c55e', fontWeight: 600, fontSize: 14 }}>🎉 Goal reached!</div>
                  ) : (
                    <button onClick={() => contribute(g.id, g.saved_amount, g.target_amount)} style={{ height: 38, borderRadius: 10, border: '1px solid oklch(0.32 0.025 258 / 60%)', cursor: 'pointer', background: 'transparent', color: '#14b8a6', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <TrendingUp size={15} /> Add money
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
