import { AppShell } from '../components/AppShell'
import { useData } from '../context/DataContext'
import { formatINR } from '../lib/utils'
import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

function groupBy(transactions: { date: string; amount: number }[], key: 'day' | 'week' | 'month' | 'year') {
  const map = new Map<string, number>()
  for (const t of transactions) {
    const d = new Date(t.date)
    let k = ''
    if (key === 'day') k = d.toISOString().slice(0, 10)
    else if (key === 'week') { const tmp = new Date(d); tmp.setDate(d.getDate() - d.getDay()); k = 'W ' + tmp.toISOString().slice(0, 10) }
    else if (key === 'month') k = d.toISOString().slice(0, 7)
    else k = d.getFullYear().toString()
    map.set(k, (map.get(k) ?? 0) + t.amount)
  }
  return [...map.entries()].map(([label, amount]) => ({ label, amount })).sort((a, b) => a.label.localeCompare(b.label))
}

export default function HistoryPage() {
  const { transactions, hasData } = useData()
  const [tab, setTab] = useState<'day' | 'week' | 'month' | 'year'>('month')

  const views = useMemo(() => ({
    day: groupBy(transactions, 'day'),
    week: groupBy(transactions, 'week'),
    month: groupBy(transactions, 'month'),
    year: groupBy(transactions, 'year'),
  }), [transactions])

  const card: React.CSSProperties = { borderRadius: 24, padding: 24 }

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 6 }}>History & Trends</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Your spending across time</h1>
        </div>

        {!hasData ? (
          <div className="glass" style={card}>
            <p style={{ textAlign: 'center', color: 'oklch(0.72 0.02 252)', margin: 0 }}>No transactions yet. Go to Dashboard and load demo data to populate history.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 4, background: 'oklch(0.27 0.03 258 / 60%)', borderRadius: 10, padding: 4, maxWidth: 320 }}>
              {(['day','week','month','year'] as const).map((k) => (
                <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: tab === k ? 'oklch(0.32 0.025 258)' : 'transparent', color: tab === k ? 'inherit' : 'oklch(0.72 0.02 252)', textTransform: 'capitalize' }}>
                  {k === 'day' ? 'Daily' : k === 'week' ? 'Weekly' : k === 'month' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
            </div>

            <div className="glass" style={card}>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>
                {tab === 'day' ? 'Daily' : tab === 'week' ? 'Weekly' : tab === 'month' ? 'Monthly' : 'Yearly'} Spending
              </div>
              <div style={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={views[tab]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12 }} formatter={(v) => formatINR(v as number)} />
                    <Bar dataKey="amount" fill="#14B8A6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass" style={card}>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>All Transactions</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {transactions.map((t) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid oklch(0.32 0.025 258 / 40%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'oklch(0.27 0.03 258 / 70%)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {t.merchant[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.merchant}</div>
                        <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', marginTop: 1 }}>
                          {new Date(t.date).toLocaleDateString('en-IN')} · {t.category}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: t.suspicious ? '#ef4444' : 'inherit', flexShrink: 0, marginLeft: 12 }}>{formatINR(t.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}