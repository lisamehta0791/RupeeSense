// src/lib/ai.ts
// Uses Groq (free, fast) for AI. Falls back gracefully.
// Text model:  llama-3.3-70b-versatile  (current production model)
// Vision model: meta-llama/llama-4-scout-17b-16e-instruct
// Auto-fallback: llama-3.1-8b-instant if the 70B daily limit is hit.

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY as string
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

const TEXT_MODEL = 'llama-3.3-70b-versatile'
const TEXT_FALLBACK = 'llama-3.1-8b-instant'
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

export interface FinancialContext {
  total: number
  topCategory: string
  topAmount: number
  shameScore: number
  healthScore: number
  shameRoast: string
  monthlySavings: number
  subscriptions: number
  food: number
  shopping: number
  userName: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | ContentPart[]
}

export interface ContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

function buildSystemPrompt(context: FinancialContext | null): string {
  if (!context) {
    return `You are RupeeSense's AI Financial Advisor — brutally honest, funny, and genuinely helpful.
You speak like a knowledgeable Indian CA friend. You give advice on:
- Personal finance, budgeting, saving
- Indian stock market, mutual funds, SIPs
- Fixed deposits, PPF, NPS, ELSS
- How to start investing as a beginner
- Tax saving strategies
Keep responses concise (under 150 words), use INR (₹), be specific and actionable.
Use **bold** for key numbers and terms.
This is educational guidance, not SEBI-registered advice.`
  }

  return `You are RupeeSense's AI Financial Advisor — brutally honest, funny, and genuinely helpful.
You speak like a knowledgeable Indian CA friend, not a corporate bot.

User's financial snapshot:
- Name: ${context.userName}
- Total spend (last 60 days): ₹${context.total.toLocaleString('en-IN')}
- Top spending category: ${context.topCategory} (₹${context.topAmount.toLocaleString('en-IN')})
- Money Health Score: ${context.healthScore}/100
- Shame-O-Meter: ${context.shameScore}/100
- AI Roast: "${context.shameRoast}"
- Potential monthly savings: ₹${context.monthlySavings.toLocaleString('en-IN')}
- Food spend: ₹${context.food.toLocaleString('en-IN')}
- Subscriptions: ₹${context.subscriptions.toLocaleString('en-IN')}
- Shopping: ₹${context.shopping.toLocaleString('en-IN')}

You can also advise on:
- Indian stock market, mutual funds, SIPs, index funds
- Fixed deposits, PPF, NPS, ELSS tax saving
- How to start investing, emergency funds
- EMI decisions, loan advice

Rules:
- Under 150 words per response
- Use **bold** for key numbers
- Be specific, use actual ₹ amounts from the data
- Light roast is fine but stay genuinely helpful
- Never make up data not given above
- This is educational guidance, not SEBI-registered advice — remind the user to do their own research before investing.`
}

interface GroqArgs {
  model: string
  messages: unknown[]
}

async function callGroq({ model, messages }: GroqArgs): Promise<Response> {
  return fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: 400, temperature: 0.7 }),
  })
}

export async function askAI(
  userMessage: string,
  context: FinancialContext | null,
  history: ChatMessage[],
  imageBase64?: string
): Promise<string> {
  if (!GROQ_KEY) {
    return '⚠️ Groq API key not configured. Add VITE_GROQ_API_KEY to your .env.local file. Get a free key at console.groq.com'
  }

  let userContent: string | ContentPart[]
  if (imageBase64) {
    userContent = [
      { type: 'image_url', image_url: { url: imageBase64 } },
      { type: 'text', text: userMessage || 'Analyse this financial document and give me insights.' },
    ]
  } else {
    userContent = userMessage
  }

  const messages = [
    { role: 'system', content: buildSystemPrompt(context) },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userContent },
  ]

  const primaryModel = imageBase64 ? VISION_MODEL : TEXT_MODEL

  try {
    let res = await callGroq({ model: primaryModel, messages })

    if (!res.ok && !imageBase64) {
      const errBody = await res.clone().json().catch(() => ({} as any))
      const code = errBody?.error?.code
      const msg = (errBody?.error?.message ?? '').toLowerCase()
      if (code === 'rate_limit_exceeded' || msg.includes('decommission') || msg.includes('rate limit')) {
        res = await callGroq({ model: TEXT_FALLBACK, messages })
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as any))
      console.error('Groq error:', err)
      if (err.error?.code === 'rate_limit_exceeded') {
        return '⏱️ Daily/rate limit hit on the free tier. Wait a bit and try again, or upgrade your Groq plan.'
      }
      return `AI error: ${err.error?.message ?? 'Unknown error'}`
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? 'No response from AI.'
  } catch (e) {
    console.error(e)
    return '🔌 Network error. Check your internet connection.'
  }
}
