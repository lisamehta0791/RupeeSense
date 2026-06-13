import { AppShell } from '../components/AppShell'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { ScoreRing } from '../components/ScoreRing'
import { Typewriter } from '../components/Typewriter'
import { formatINR } from '../lib/utils'
import { useEffect, useRef, useState } from 'react'
import {
  Sparkles, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp,
  Wand2, Rocket, Flame, Coffee, ShoppingBag, ArrowRight, RotateCcw, Upload,
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, LineChart, Line, AreaChart, Area, CartesianGrid, Legend,
} from 'recharts'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { Link } from 'react-router-dom'
import type { Transaction } from '../lib/demo-data'
import type { Analysis } from '../lib/finance'

const COLORS = ['#14B8A6','#22C55E','#F59E0B','#EF4444','#8B5CF6','#3B82F6','#EC4899','#64748B']
const LOADING_LINES = [
  'Judging your life choices…',
  'Counting your Swiggy sins…',
  'Consulting your future self…',
  'Tracking subscription leaks…',
  'Measuring wallet damage…',
]

function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="glass" style={{ borderRadius: 24, padding: 24, ...style }}>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { hasData, analysis, loadDemo, addTransactions, clearView } = useData()
  const [analyzing, setAnalyzing] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)
  const [entryMode, setEntryMode] = useState(false)  // show the add-data panel even when history exists

  useEffect(() => {
    if (!analyzing) return
    const id = setInterval(() => setLineIdx((i) => (i + 1) % LOADING_LINES.length), 900)
    return () => clearInterval(id)
  }, [analyzing])

  function runAnalyze() {
    setEntryMode(false)
    setAnalyzing(true)
    setTimeout(() => {
      if (!hasData) loadDemo()
      setAnalyzing(false)
      toast.success('Analysis complete. Brace yourself.')
    }, 2600)
  }

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Header */}
        <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', marginBottom: 8, fontWeight: 600 }}>Welcome back</div>
            <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Hi {user?.name}, ready for some <span className="text-gradient">brutal honesty</span>?
            </h1>
            <p style={{ color: 'oklch(0.72 0.02 252)', marginTop: 8, maxWidth: 520, lineHeight: 1.6, margin: '8px 0 0' }}>
              Connect your transactions and let RupeeSense reflect your financial reality back at you. Mathematically. Mercilessly.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button onClick={runAnalyze} disabled={analyzing} className="shadow-glow" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              borderRadius: 10, border: 'none', cursor: analyzing ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: 14, background: 'var(--gradient-primary)', color: 'white', opacity: analyzing ? 0.7 : 1,
            }}>
              <Sparkles size={15} /> Analyse My Spending
            </button>
            {hasData && (
              <button onClick={() => { clearView(); setEntryMode(true); toast.success('Enter new data below — your saved history is safe') }} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                borderRadius: 10, border: '1px solid oklch(0.32 0.025 258 / 60%)',
                cursor: 'pointer', fontWeight: 600, fontSize: 14,
                background: 'transparent', color: 'inherit',
              }}>
                <RotateCcw size={15} /> Reset / Enter Data
              </button>
            )}
          </div>
        </section>

        {analyzing && <AnalyzingPanel line={LOADING_LINES[lineIdx]} />}
        {!analyzing && (!hasData || entryMode) && (
          <>
            {entryMode && hasData && (
              <button onClick={() => setEntryMode(false)} style={{
                alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10, border: '1px solid oklch(0.32 0.025 258 / 60%)',
                cursor: 'pointer', fontWeight: 600, fontSize: 13, background: 'transparent', color: 'inherit',
              }}>
                ← Back to my analysis
              </button>
            )}
            <Onboarding
              onDemo={() => { loadDemo(); setEntryMode(false) }}
              onAdd={(t) => { addTransactions(t) }}
            />
          </>
        )}
        {!analyzing && hasData && !entryMode && analysis && (
          <>
            <ShameAndScore analysis={analysis} />
            <PersonalityAndFraud analysis={analysis} />
            <CategoryAndTrends analysis={analysis} />
            <FutureSelf analysis={analysis} />
            <Opportunity analysis={analysis} />
            <Recommendations analysis={analysis} />
            <RecentTransactions />
          </>
        )}
      </div>
    </AppShell>
  )
}

function AnalyzingPanel({ line }: { line: string }) {
  return (
    <GlassCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="shadow-glow float-slow" style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)', flexShrink: 0 }}>
          <Sparkles size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600 }}>AI Scanning</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}><Typewriter key={line} text={line} /></div>
        </div>
      </div>
      <div style={{ marginTop: 20, height: 8, borderRadius: 999, background: 'oklch(0.27 0.03 258)', overflow: 'hidden' }}>
        <div className="shimmer" style={{ height: '100%', width: '50%', background: 'var(--gradient-primary)', borderRadius: 999 }} />
      </div>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {['Parsing UPI history','Classifying merchants','Detecting anomalies','Building roast engine'].map((s) => (
          <div key={s} style={{ borderRadius: 8, background: 'oklch(0.27 0.03 258 / 40%)', padding: '6px 10px', fontSize: 11, color: 'oklch(0.72 0.02 252)', border: '1px solid oklch(0.32 0.025 258 / 30%)' }}>{s}</div>
        ))}
      </div>
    </GlassCard>
  )
}

function Onboarding({ onDemo, onAdd }: { onDemo: () => void; onAdd: (t: Transaction[]) => void }) {
  const [pasted, setPasted] = useState('')
  const [tab, setTab] = useState<'paste' | 'csv' | 'manual'>('paste')
  const fileRef = useRef<HTMLInputElement>(null)

  function importPasted() {
    const lines = pasted.split(/\n+/).map((l) => l.trim()).filter(Boolean)
    const txns: Transaction[] = []
    for (const l of lines) {
      const parts = l.split(/[,\t]/).map((p) => p.trim())
      const merchant = parts[0] || 'Unknown'
      const amount = Number((parts[1] || '').replace(/[^\d.]/g, ''))
      if (!amount || isNaN(amount)) continue
      const category = (parts[2] as Transaction['category']) || 'Other'
      txns.push({ id: crypto.randomUUID(), date: new Date().toISOString(), merchant, amount, category })
    }
    if (!txns.length) { toast.error("Couldn't parse. Try: Swiggy, 450, Food"); return }
    onAdd(txns); setPasted('')
    toast.success(`Imported ${txns.length} transactions`)
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as Record<string, string>[]
        const txns: Transaction[] = []
        for (const row of rows) {
          const merchant = row.merchant || row.Merchant || row.description || row.Description || row.narration || row.Narration || row['Transaction Description'] || 'Unknown'
          const rawAmount = row.amount || row.Amount || row.debit || row.Debit || row.withdrawal || row.Withdrawal || row['Debit Amount'] || ''
          const amount = Number(rawAmount.toString().replace(/[^\d.]/g, ''))
          const rawDate = row.date || row.Date || row['Transaction Date'] || row['Value Date'] || ''
          let date = new Date().toISOString()
          if (rawDate) { const p = new Date(rawDate); if (!isNaN(p.getTime())) date = p.toISOString() }
          const rawCat = row.category || row.Category || ''
          const valid = ['Food','Shopping','Bills','Transport','Entertainment','Subscriptions','Rent','Other']
          const category = (valid.includes(rawCat) ? rawCat : 'Other') as Transaction['category']
          if (!amount || isNaN(amount)) continue
          txns.push({ id: crypto.randomUUID(), date, merchant: merchant.trim(), amount, category })
        }
        if (!txns.length) { toast.error('No valid rows. Need columns: merchant, amount, date'); return }
        onAdd(txns)
        toast.success(`Imported ${txns.length} transactions from CSV`)
        if (fileRef.current) fileRef.current.value = ''
      },
      error: (err) => toast.error('CSV error: ' + err.message),
    })
  }

  const inp: React.CSSProperties = { width: '100%', height: 40, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 60%)', borderRadius: 8, padding: '0 12px', color: 'oklch(0.98 0.005 250)', fontSize: 14, outline: 'none' }

  return (
    <GlassCard>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px' }}>Connect your money</h2>
          <p style={{ color: 'oklch(0.72 0.02 252)', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 360 }}>
            Paste UPI history, upload a CSV, or enter transactions manually.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 340, marginBottom: 20 }}>
            {[{icon:'🟢',title:'Google Pay',sub:'Coming soon'},{icon:'🏦',title:'Bank CSV',sub:'Upload & import'},{icon:'📋',title:'Paste UPI',sub:'Copy from app'},{icon:'✍️',title:'Manual Entry',sub:'Type below'}].map((t) => (
              <div key={t.title} style={{ borderRadius: 14, padding: 14, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 40%)' }}>
                <div style={{ fontSize: 22 }}>{t.icon}</div>
                <div style={{ fontWeight: 600, marginTop: 8, fontSize: 14 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', marginTop: 2 }}>{t.sub}</div>
              </div>
            ))}
          </div>
          <button onClick={onDemo} className="shadow-glow" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: 'var(--gradient-primary)', color: 'white' }}>
            <Rocket size={15} /> Use Demo Data
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', gap: 4, background: 'oklch(0.27 0.03 258 / 60%)', borderRadius: 10, padding: 4, marginBottom: 16 }}>
            {(['paste','csv','manual'] as const).map((m) => (
              <button key={m} onClick={() => setTab(m)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: tab === m ? 'oklch(0.32 0.025 258)' : 'transparent', color: tab === m ? 'inherit' : 'oklch(0.72 0.02 252)' }}>
                {m === 'paste' ? 'Paste UPI' : m === 'csv' ? 'CSV Upload' : 'Manual'}
              </button>
            ))}
          </div>

          {tab === 'paste' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={8}
                placeholder={'Swiggy, 450, Food\nFlipkart, 2499, Shopping\nNetflix, 799, Subscriptions'}
                style={{ ...inp, height: 'auto', padding: 12, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
              <button onClick={importPasted} style={{ ...inp, height: 40, cursor: 'pointer', background: 'var(--gradient-primary)', border: 'none', color: 'white', fontWeight: 600 }}>Import Transactions</button>
            </div>
          )}

          {tab === 'csv' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 28, borderRadius: 12, border: '2px dashed oklch(0.32 0.025 258 / 60%)', textAlign: 'center' }}>
                <Upload size={28} style={{ margin: '0 auto 10px', color: '#14b8a6', display: 'block' }} />
                <p style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Upload your bank statement CSV<br />
                  <span style={{ fontSize: 11 }}>Supports: merchant/description, amount/debit, date, category</span>
                </p>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} id="csv-upload" />
                <label htmlFor="csv-upload" style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: 14 }}>
                  Choose CSV File
                </label>
              </div>
              <p style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', margin: 0 }}>
                💡 Works with HDFC, ICICI, SBI, Axis and most Indian bank CSV exports.
              </p>
            </div>
          )}

          {tab === 'manual' && <ManualEntry onAdd={(t) => onAdd([t])} />}
        </div>
      </div>
    </GlassCard>
  )
}

function ManualEntry({ onAdd }: { onAdd: (t: Transaction) => void }) {
  const [m, setM] = useState('')
  const [a, setA] = useState('')
  const [c, setC] = useState<Transaction['category']>('Food')
  const inp: React.CSSProperties = { width: '100%', height: 40, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 60%)', borderRadius: 8, padding: '0 12px', color: 'oklch(0.98 0.005 250)', fontSize: 14, outline: 'none' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input style={inp} placeholder="Merchant name" value={m} onChange={(e) => setM(e.target.value)} />
      <input style={inp} placeholder="Amount (₹)" value={a} onChange={(e) => setA(e.target.value)} />
      <select style={{ ...inp, cursor: 'pointer' }} value={c} onChange={(e) => setC(e.target.value as Transaction['category'])}>
        {['Food','Shopping','Bills','Transport','Entertainment','Subscriptions','Rent','Other'].map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <button onClick={() => {
        const amt = Number(a.replace(/[^\d.]/g, ''))
        if (!m || !amt) { toast.error('Enter merchant + amount'); return }
        onAdd({ id: crypto.randomUUID(), date: new Date().toISOString(), merchant: m, amount: amt, category: c })
        setM(''); setA('')
        toast.success('Transaction added')
      }} style={{ height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600 }}>
        Add Transaction
      </button>
    </div>
  )
}

function ShameAndScore({ analysis }: { analysis: Analysis }) {
  const grad = analysis.shameScore <= 30 ? 'linear-gradient(135deg,#10b981,#14b8a6)' : analysis.shameScore <= 60 ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'linear-gradient(135deg,#f97316,#ef4444)'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
      <div style={{ borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden', gridColumn: 'span 2', background: grad, boxShadow: 'var(--shadow-danger)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle at 30% 20%,white,transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            <Flame size={14} /> Shame-O-Meter
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'clamp(3.5rem,10vw,6rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: 'white' }}>{analysis.shameScore}</div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>{analysis.shameLevel}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Risk level based on spending behavior</div>
            </div>
          </div>
          <div style={{ marginTop: 20, fontSize: 16, lineHeight: 1.6, color: 'white' }}>
            <Typewriter text={analysis.shameRoast} />
          </div>
          <div style={{ marginTop: 20, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${analysis.shameScore}%`, background: 'rgba(255,255,255,0.9)', borderRadius: 999 }} />
          </div>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
            <span>Saint</span><span>Needs work</span><span>Danger</span><span>Disaster</span>
          </div>
        </div>
      </div>

      <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#14b8a6', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
          <ShieldCheck size={13} /> Money Health Score
        </div>
        <div style={{ alignSelf: 'center', margin: '16px 0' }}><ScoreRing value={analysis.healthScore} label="Overall" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
          {analysis.subscores.map((s) => (
            <div key={s.label} style={{ borderRadius: 10, background: 'oklch(0.27 0.03 258 / 60%)', padding: '10px 12px', border: '1px solid oklch(0.32 0.025 258 / 30%)' }}>
              <div style={{ fontSize: 11, color: 'oklch(0.72 0.02 252)' }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
              <div style={{ height: 4, borderRadius: 999, background: 'oklch(0.18 0.03 255)', overflow: 'hidden', marginTop: 4 }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: 'var(--gradient-primary)', borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function PersonalityAndFraud({ analysis }: { analysis: Analysis }) {
  const p = analysis.personality
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
      <GlassCard>
        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 12 }}>Financial Personality</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 28, background: 'oklch(0.27 0.03 258 / 70%)', border: '1px solid oklch(0.32 0.025 258 / 30%)', flexShrink: 0 }}>{p.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)' }}>Risk: <span style={{ color: 'inherit', fontWeight: 600 }}>{p.risk}</span></div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)', marginTop: 12, lineHeight: 1.6 }}>{p.description}</p>
        <div style={{ marginTop: 12, borderRadius: 10, background: 'oklch(0.72 0.13 180 / 10%)', border: '1px solid oklch(0.72 0.13 180 / 30%)', padding: '10px 14px', fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: '#14b8a6' }}>Tip:</span> {p.tip}
        </div>
      </GlassCard>

      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
          <AlertTriangle size={13} /> Fraud Detection
        </div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {analysis.suspicious.length > 0 ? `${analysis.suspicious.length} suspicious transaction${analysis.suspicious.length > 1 ? 's' : ''}` : 'No anomalies detected'}
        </div>
        {analysis.suspicious.length > 0 ? (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analysis.suspicious.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, background: 'oklch(0.66 0.22 27 / 10%)', border: '1px solid oklch(0.66 0.22 27 / 40%)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.merchant}</div>
                  <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', marginTop: 2 }}>{t.suspicious_reason}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontWeight: 600, color: '#ef4444' }}>{formatINR(t.amount)}</div>
                  <div style={{ fontSize: 11, color: 'oklch(0.72 0.02 252)' }}>Risk: High</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: 8, fontSize: 13, color: 'oklch(0.72 0.02 252)' }}>All transactions look consistent with your usual patterns.</p>
        )}
      </GlassCard>
    </div>
  )
}

function CategoryAndTrends({ analysis }: { analysis: Analysis }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600 }}>Spending Breakdown</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>By Category</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'oklch(0.72 0.02 252)' }}>Total</div>
              <div style={{ fontWeight: 600 }}>{formatINR(analysis.total)}</div>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={analysis.byCategory} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={82} paddingAngle={2}>
                  {analysis.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12 }} formatter={(v) => formatINR(v as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
            {analysis.byCategory.map((c, i) => (
              <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  {c.category}
                </span>
                <span style={{ color: 'oklch(0.72 0.02 252)' }}>{(c.pct * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600 }}>Daily Spend Trend</div>
          <div style={{ fontSize: 17, fontWeight: 600, margin: '4px 0 16px' }}>Last {analysis.daily.length} days</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={analysis.daily}>
                <defs>
                  <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} hide />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12 }} formatter={(v) => formatINR(v as number)} />
                <Area type="monotone" dataKey="amount" stroke="#14B8A6" fill="url(#ag)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600 }}>Category Comparison</div>
        <div style={{ fontSize: 17, fontWeight: 600, margin: '4px 0 16px' }}>Where your rupees actually go</div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={analysis.byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12 }} formatter={(v) => formatINR(v as number)} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {analysis.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  )
}

function FutureSelf({ analysis }: { analysis: Analysis }) {
  const data = analysis.futureProjection.months.map((m, i) => ({
    month: m,
    Current: analysis.futureProjection.current[i],
    Improved: analysis.futureProjection.improved[i],
  }))
  return (
    <GlassCard>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600 }}>Future Self Projection</div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>Where you'll be in 12 months</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {[
            { label: 'Annual spend', value: formatINR(analysis.futureProjection.current.at(-1) || 0), color: '#ef4444' },
            { label: 'Potential savings', value: formatINR(analysis.recommendations.annualSavings), color: '#22c55e' },
            { label: 'Score boost', value: `+${analysis.recommendations.scoreImprovement} pts`, color: '#14b8a6' },
          ].map((m) => (
            <div key={m.label} style={{ borderRadius: 10, background: 'oklch(0.27 0.03 258 / 60%)', padding: '10px 14px', border: '1px solid oklch(0.32 0.025 258 / 30%)', minWidth: 120 }}>
              <div style={{ fontSize: 11, color: 'oklch(0.72 0.02 252)' }}>{m.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12 }} formatter={(v) => formatINR(v as number)} />
            <Legend wrapperStyle={{ color: '#94A3B8' }} />
            <Line type="monotone" dataKey="Current" stroke="#EF4444" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Improved" stroke="#22C55E" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}

function Opportunity({ analysis }: { analysis: Analysis }) {
  const icons = [Coffee, ShoppingBag, Sparkles, Rocket, TrendingUp]
  return (
    <GlassCard>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 600 }}>Opportunity Cost</div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>What you could have bought instead</div>
        </div>
        <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)', marginLeft: 'auto', marginTop: 4 }}>Based on food + impulse spend</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12 }}>
        {analysis.opportunityCost.map((o, i) => {
          const Icon = icons[i % icons.length]
          return (
            <div key={o.item} style={{ borderRadius: 16, padding: 16, background: 'oklch(0.27 0.03 258 / 80%)', border: '1px solid oklch(0.32 0.025 258 / 30%)' }}>
              <Icon size={18} color="#f59e0b" />
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{o.item}</div>
              <div style={{ fontSize: 11, color: 'oklch(0.72 0.02 252)', marginTop: 4 }}>{formatINR(o.price)} each</div>
              <div className="text-gradient" style={{ fontSize: 24, fontWeight: 900, marginTop: 10 }}>×{o.qty}</div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

function Recommendations({ analysis }: { analysis: Analysis }) {
  const r = analysis.recommendations
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
      <div className="glass-strong" style={{ borderRadius: 24, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
          <Wand2 size={13} /> Top AI Action
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4 }}>{r.topAction}</div>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Monthly savings', value: formatINR(r.monthlySavings), color: '#22c55e' },
            { label: 'Annual savings', value: formatINR(r.annualSavings), color: '#22c55e' },
            { label: 'Score boost', value: `+${r.scoreImprovement} pts`, color: '#14b8a6' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'oklch(0.72 0.02 252)' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>
        <Link to="/advisor" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 13, color: '#14b8a6', textDecoration: 'none' }}>
          Ask the AI Advisor <ArrowRight size={13} />
        </Link>
      </div>

      <GlassCard>
        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 12 }}>Savings Recommendations</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
          {r.items.map((it) => (
            <div key={it.title} style={{ borderRadius: 14, padding: 14, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 30%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{it.title}</div>
                <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <TrendingDown size={12} style={{ display: 'inline', marginRight: 2 }} />{formatINR(it.saves)}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)' }}>{it.detail}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function RecentTransactions() {
  const { transactions } = useData()
  return (
    <GlassCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Recent Transactions</div>
        <Link to="/history" style={{ fontSize: 13, color: '#14b8a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          View all <ArrowRight size={13} />
        </Link>
      </div>
      {transactions.slice(0, 8).map((t) => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid oklch(0.32 0.025 258 / 40%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'oklch(0.27 0.03 258 / 70%)', border: '1px solid oklch(0.32 0.025 258 / 30%)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
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
    </GlassCard>
  )
}