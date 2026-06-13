import { AppShell } from '../components/AppShell'
import { useData } from '../context/DataContext'
import { formatINR } from '../lib/utils'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function InsightsPage() {
  const { analysis, hasData } = useData()

  if (!hasData || !analysis) {
    return (
      <AppShell>
        <div className="glass" style={{ borderRadius: 24, padding: 32, textAlign: 'center', color: 'oklch(0.72 0.02 252)' }}>
          Load data on the Dashboard first.
        </div>
      </AppShell>
    )
  }

  const max = Math.max(...analysis.heatmap.map((h) => h.value), 1)

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 6 }}>Insights</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Deep patterns in your spending</h1>
        </div>

        <div className="glass" style={{ borderRadius: 24, padding: 24 }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Spending Heatmap</div>
          <div style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)', marginBottom: 16 }}>When during the week do your rupees vanish?</div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 600 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(24,1fr)', gap: 3, marginBottom: 4 }}>
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} style={{ fontSize: 9, color: 'oklch(0.72 0.02 252)', textAlign: 'center' }}>{h}</div>
                ))}
              </div>
              {DAYS.map((day) => (
                <div key={day} style={{ display: 'grid', gridTemplateColumns: '48px repeat(24,1fr)', gap: 3, marginBottom: 3 }}>
                  <div style={{ fontSize: 11, color: 'oklch(0.72 0.02 252)', display: 'flex', alignItems: 'center' }}>{day}</div>
                  {Array.from({ length: 24 }, (_, h) => {
                    const cell = analysis.heatmap.find((x) => x.day === day && x.hour === h)
                    const intensity = cell ? cell.value / max : 0
                    return (
                      <div key={h} title={cell ? formatINR(cell.value) : ''} style={{
                        height: 18, borderRadius: 3,
                        background: intensity > 0 ? `oklch(0.72 0.13 ${180 - intensity * 40} / ${0.2 + intensity * 0.8})` : 'oklch(0.27 0.03 258 / 40%)',
                      }} />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 24, padding: 24 }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Top 5 Merchants</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analysis.topMerchants.map((m, i) => (
              <div key={m.merchant} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{m.merchant}</span>
                    <span style={{ fontWeight: 600 }}>{formatINR(m.amount)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'oklch(0.27 0.03 258)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(m.amount / analysis.topMerchants[0].amount) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 999 }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', flexShrink: 0 }}>{m.count}x</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}