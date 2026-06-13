import { AppShell } from '../components/AppShell'
import { useData } from '../context/DataContext'
import { useProfile } from '../context/ProfileContext'
import { formatINR } from '../lib/utils'
import { getSavings, getComparisons, type PeriodComparison } from '../lib/periods'
import { useState } from 'react'
import { Wallet, PiggyBank, ArrowDown, ArrowUp } from 'lucide-react'
import { toast } from 'sonner'

function ComparisonCard({ c, emphasis }: { c: PeriodComparison; emphasis?: boolean }) {
  const good = c.spentLess
  const color = good ? '#22c55e' : '#ef4444'
  const Arrow = good ? ArrowDown : ArrowUp
  return (
    <div className="glass" style={{ borderRadius: 20, padding: 22, border: emphasis ? '1px solid oklch(0.7 0.15 165 / 50%)' : undefined }}>
      <div style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)', marginBottom: 10 }}>{c.label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{formatINR(c.current)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color, fontWeight: 700, fontSize: 14 }}>
          <Arrow size={15} />
          {Math.abs(c.pctChange)}%
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)', marginTop: 8 }}>
        {good
          ? `You spent ${formatINR(Math.abs(c.diff))} less than the previous period 🎉`
          : c.diff === 0
            ? 'Same as the previous period.'
            : `You spent ${formatINR(c.diff)} more than the previous period.`}
      </div>
      <div style={{ fontSize: 12, color: 'oklch(0.6 0.02 252)', marginTop: 4 }}>
        Previous: {formatINR(c.previous)}
      </div>
    </div>
  )
}

export default function SavingsPage() {
  const { transactions, hasData } = useData()
  const { profile, setIncome, loading } = useProfile()
  const [incomeInput, setIncomeInput] = useState('')

  const savings = getSavings(transactions, profile.monthly_income)
  const cmp = getComparisons(transactions)

  async function saveIncome() {
    const v = Number(incomeInput)
    if (!v || v <= 0) { toast.error('Enter a valid monthly income'); return }
    await setIncome(v)
    setIncomeInput('')
    toast.success('Income saved — savings calculated')
  }

  const inp: React.CSSProperties = {
    height: 44, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 60%)',
    borderRadius: 10, padding: '0 14px', color: 'oklch(0.98 0.005 250)', fontSize: 15, outline: 'none',
  }

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 6 }}>Savings & Comparisons</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>How much are you actually saving?</h1>
        </div>

        {/* Income prompt — shows if income not set yet */}
        {!loading && !savings.hasIncome && (
          <div className="glass" style={{ borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="shadow-glow" style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)', flexShrink: 0 }}>
                <Wallet size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>First, what's your monthly income?</div>
                <div style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)' }}>We use this to calculate your real savings: income − what you spend.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, maxWidth: 420 }}>
              <input style={{ ...inp, flex: 1 }} type="number" placeholder="e.g. 50000" value={incomeInput} onChange={(e) => setIncomeInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveIncome() }} />
              <button onClick={saveIncome} className="shadow-glow" style={{ height: 44, padding: '0 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: 14 }}>
                Save
              </button>
            </div>
          </div>
        )}

        {/* Savings result */}
        {savings.hasIncome && (
          <div className="glass-strong" style={{ borderRadius: 24, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <PiggyBank size={22} color="#14b8a6" />
              <div style={{ fontSize: 17, fontWeight: 700 }}>This month so far</div>
              <button onClick={() => setIncomeInput(String(profile.monthly_income))} style={{ marginLeft: 'auto', fontSize: 12, color: '#14b8a6', background: 'none', border: 'none', cursor: 'pointer' }}>
                Income: {formatINR(savings.income)} (edit)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', marginBottom: 4 }}>Income</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{formatINR(savings.income)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', marginBottom: 4 }}>Spent</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{formatINR(savings.spentThisMonth)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', marginBottom: 4 }}>Saved</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: savings.onTrack ? '#22c55e' : '#ef4444' }}>{formatINR(savings.saved)}</div>
              </div>
            </div>

            {/* savings bar */}
            <div style={{ height: 12, borderRadius: 8, background: 'oklch(0.27 0.03 258 / 80%)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, savings.savedPct))}%`, borderRadius: 8, background: savings.onTrack ? '#22c55e' : '#ef4444', transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)', marginTop: 10 }}>
              {savings.onTrack
                ? `You're saving ${savings.savedPct}% of your income this month. ${savings.savedPct >= 20 ? 'Excellent — keep it up!' : 'Try to push toward 20%.'}`
                : `You've spent more than your income this month — ${formatINR(Math.abs(savings.saved))} over. Time to slow down.`}
            </div>
          </div>
        )}

        {!hasData && (
          <div className="glass" style={{ borderRadius: 24, padding: 24, textAlign: 'center', color: 'oklch(0.72 0.02 252)' }}>
            Add some transactions on the Dashboard to see comparisons.
          </div>
        )}

        {/* Comparisons */}
        {hasData && (
          <>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 0' }}>Spending over time</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
              <ComparisonCard c={cmp.month} emphasis />
              <ComparisonCard c={cmp.week} />
              <ComparisonCard c={cmp.year} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
