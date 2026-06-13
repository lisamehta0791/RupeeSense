import { AppShell } from '../components/AppShell'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { askAI, type FinancialContext } from '../lib/ai'
import { toast } from 'sonner'

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'How can I save money?',
  'Where am I overspending?',
  'Can I afford a ₹50,000 trip?',
  'What should my monthly budget be?',
  'How do I improve my score?',
]

export default function AdvisorPage() {
  const { user } = useAuth()
  const { analysis } = useData()
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: `Hey ${user?.name ?? 'friend'} 👋 I'm your AI Financial Mirror. Ask me anything about your money — I've read your transactions and I won't sugarcoat it.` },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q || thinking) return
    setMessages((m) => [...m, { role: 'user', content: q }])
    setInput('')
    setThinking(true)

    let responseText = ''
    if (!analysis) {
      responseText = 'Load some transactions on the Dashboard first so I can actually analyse your money.'
    } else {
      const ctx: FinancialContext = {
        userName: user?.name ?? 'friend',
        total: analysis.total,
        topCategory: analysis.byCategory[0]?.category ?? 'Food',
        topAmount: analysis.byCategory[0]?.amount ?? 0,
        shameScore: analysis.shameScore,
        healthScore: analysis.healthScore,
        shameRoast: analysis.shameRoast,
        monthlySavings: analysis.recommendations.monthlySavings,
        food: analysis.byCategory.find((c) => c.category === 'Food')?.amount ?? 0,
        subscriptions: analysis.byCategory.find((c) => c.category === 'Subscriptions')?.amount ?? 0,
        shopping: analysis.byCategory.find((c) => c.category === 'Shopping')?.amount ?? 0,
      }
      try {
        responseText = await askAI(q, ctx, messages.map((m) => ({ role: m.role, content: m.content })))
      } catch {
        toast.error('AI request failed')
        responseText = 'Something went wrong. Check your VITE_GROQ_API_KEY in .env.local.'
      }
    }

    setMessages((m) => [...m, { role: 'assistant', content: responseText }])
    setThinking(false)
  }

  function renderContent(text: string) {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
    )
  }

  const inp: React.CSSProperties = { flex: 1, height: 44, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 60%)', borderRadius: 12, padding: '0 14px', color: 'oklch(0.98 0.005 250)', fontSize: 14, outline: 'none' }

  return (
    <AppShell>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="shadow-glow" style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)', flexShrink: 0 }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600 }}>AI Financial Advisor</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Talk to your money</h1>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            Powered by Groq
          </div>
        </div>

        <div className="glass-strong" style={{ borderRadius: 24, padding: 24 }}>
          <div style={{ height: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 10 }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)', flexShrink: 0 }}>
                    <Bot size={15} color="white" />
                  </div>
                )}
                <div style={{
                  maxWidth: '72%', padding: '12px 16px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? 'var(--gradient-primary)' : 'oklch(0.27 0.03 258 / 80%)',
                  border: m.role === 'assistant' ? '1px solid oklch(0.32 0.025 258 / 40%)' : 'none',
                  fontSize: 14, lineHeight: 1.6,
                }}>
                  {renderContent(m.content)}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', gap: 6, padding: '12px 16px', alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)', flexShrink: 0 }}>
                  <Bot size={15} color="white" />
                </div>
                {[0,1,2].map((i) => (
                  <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#14b8a6', display: 'inline-block', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} disabled={thinking} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, border: '1px solid oklch(0.32 0.025 258 / 60%)', background: 'transparent', cursor: 'pointer', color: 'oklch(0.72 0.02 252)', whiteSpace: 'nowrap' }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask about your spending, savings, or budget…"
              style={inp}
            />
            <button onClick={() => send()} disabled={thinking || !input.trim()} className="shadow-glow" style={{ width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--gradient-primary)', display: 'grid', placeItems: 'center', flexShrink: 0, opacity: thinking || !input.trim() ? 0.5 : 1 }}>
              <Send size={17} color="white" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}