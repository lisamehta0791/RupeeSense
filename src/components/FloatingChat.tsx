import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Paperclip } from 'lucide-react'
import { askAI, type ChatMessage, type FinancialContext } from '../lib/ai'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

interface Msg {
  role: 'user' | 'assistant'
  content: string
  image?: string
}

const QUICK = [
  'Best SIPs for beginners?',
  'How to build emergency fund?',
  'PPF vs ELSS — which is better?',
  'How to start stock investing?',
]

export function FloatingChat() {
  const { user } = useAuth()
  const { analysis } = useData()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: `Hey ${user?.name?.split(' ')[0] ?? 'there'} 👋 Ask me anything — spending advice, investment tips, or upload a bank statement screenshot for instant analysis!` },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking, open])

  function getContext(): FinancialContext | null {
    if (!analysis) return null
    return {
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
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      alert('Image must be under 4MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if ((!q && !imagePreview) || thinking) return

    const userMsg: Msg = {
      role: 'user',
      content: q || 'Please analyse this image.',
      image: imagePreview ?? undefined,
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    const imgToSend = imagePreview
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
    setThinking(true)

    const history: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }))
    const response = await askAI(q || 'Analyse this image.', getContext(), history, imgToSend ?? undefined)

    setMessages((m) => [...m, { role: 'assistant', content: response }])
    setThinking(false)
  }

  function renderText(text: string) {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
    )
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((x) => !x)}
        className="shadow-glow"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg) scale(0.9)' : 'scale(1)',
        }}
      >
        {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
      </button>

      {/* Unread dot */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 72, right: 24, zIndex: 1001,
          width: 10, height: 10, borderRadius: '50%',
          background: '#22c55e',
          border: '2px solid oklch(0.18 0.03 255)',
        }} />
      )}

      {/* Chat window */}
      {open && (
        <div
          className="glass-strong"
          style={{
            position: 'fixed', bottom: 92, right: 24, zIndex: 999,
            width: 'min(380px, calc(100vw - 32px))',
            borderRadius: 20,
            display: 'flex', flexDirection: 'column',
            maxHeight: 'min(560px, calc(100vh - 120px))',
            overflow: 'hidden',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid oklch(0.32 0.025 258 / 40%)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--gradient-primary)', flexShrink: 0 }}>
              <Bot size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>RupeeSense AI</div>
              <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
                Online · Powered by Groq
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'oklch(0.72 0.02 252)', padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
                {m.image && (
                  <img src={m.image} alt="uploaded" style={{ maxWidth: 180, borderRadius: 10, border: '1px solid oklch(0.32 0.025 258 / 40%)' }} />
                )}
                <div style={{
                  maxWidth: '85%', padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? 'var(--gradient-primary)' : 'oklch(0.27 0.03 258 / 80%)',
                  border: m.role === 'assistant' ? '1px solid oklch(0.32 0.025 258 / 40%)' : 'none',
                  fontSize: 13, lineHeight: 1.55,
                }}>
                  {renderText(m.content)}
                </div>
              </div>
            ))}

            {thinking && (
              <div style={{ display: 'flex', gap: 5, padding: '8px 4px' }}>
                {[0,1,2].map((i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#14b8a6', display: 'inline-block', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick suggestions — only show if few messages */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)} style={{ padding: '4px 10px', borderRadius: 14, fontSize: 11, border: '1px solid oklch(0.32 0.025 258 / 60%)', background: 'transparent', cursor: 'pointer', color: 'oklch(0.72 0.02 252)', whiteSpace: 'nowrap' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Image preview */}
          {imagePreview && (
            <div style={{ padding: '0 12px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={imagePreview} alt="preview" style={{ height: 48, borderRadius: 8, border: '1px solid oklch(0.32 0.025 258 / 60%)' }} />
              <button onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 11 }}>
                Remove
              </button>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid oklch(0.32 0.025 258 / 40%)', display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: 'none' }}
              id="float-file"
            />
            <label htmlFor="float-file" title="Upload image/PDF" style={{ cursor: 'pointer', color: 'oklch(0.72 0.02 252)', display: 'flex', alignItems: 'center', padding: 4, flexShrink: 0 }}>
              <Paperclip size={16} />
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask anything about money…"
              style={{ flex: 1, height: 36, background: 'oklch(0.27 0.03 258 / 60%)', border: '1px solid oklch(0.32 0.025 258 / 60%)', borderRadius: 10, padding: '0 12px', color: 'oklch(0.98 0.005 250)', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={() => send()}
              disabled={thinking || (!input.trim() && !imagePreview)}
              className="shadow-glow"
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--gradient-primary)', display: 'grid', placeItems: 'center', flexShrink: 0, opacity: thinking || (!input.trim() && !imagePreview) ? 0.4 : 1 }}
            >
              <Send size={14} color="white" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}