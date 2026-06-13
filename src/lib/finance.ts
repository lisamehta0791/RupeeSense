import type { Category, Transaction } from './demo-data'

export interface Analysis {
  total: number
  byCategory: { category: Category; amount: number; pct: number }[]
  daily: { date: string; amount: number }[]
  monthly: { month: string; amount: number }[]
  heatmap: { day: string; hour: number; value: number }[]
  shameScore: number
  shameLevel: string
  shameRoast: string
  healthScore: number
  subscores: { label: string; value: number }[]
  personality: { name: string; icon: string; description: string; risk: string; tip: string }
  suspicious: Transaction[]
  topMerchants: { merchant: string; amount: number; count: number }[]
  opportunityCost: { item: string; price: number; qty: number }[]
  recommendations: {
    topAction: string
    monthlySavings: number
    annualSavings: number
    scoreImprovement: number
    items: { title: string; detail: string; saves: number }[]
  }
  futureProjection: { months: string[]; current: number[]; improved: number[] }
}

export function analyze(txns: Transaction[]): Analysis {
  const total = txns.reduce((s, t) => s + t.amount, 0)

  const map = new Map<Category, number>()
  for (const t of txns) map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  const byCategory = [...map.entries()]
    .map(([category, amount]) => ({ category, amount, pct: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount)

  const dailyMap = new Map<string, number>()
  for (const t of txns) {
    const d = t.date.slice(0, 10)
    dailyMap.set(d, (dailyMap.get(d) ?? 0) + t.amount)
  }
  const daily = [...dailyMap.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const monthlyMap = new Map<string, number>()
  for (const t of txns) {
    const m = t.date.slice(0, 7)
    monthlyMap.set(m, (monthlyMap.get(m) ?? 0) + t.amount)
  }
  const monthly = [...monthlyMap.entries()]
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const heatRaw = new Map<string, number>()
  for (const t of txns) {
    const dt = new Date(t.date)
    const k = `${daysOfWeek[dt.getDay()]}-${dt.getHours()}`
    heatRaw.set(k, (heatRaw.get(k) ?? 0) + t.amount)
  }
  const heatmap = [...heatRaw.entries()].map(([key, value]) => {
    const [day, h] = key.split('-')
    return { day, hour: Number(h), value }
  })

  const food = byCategory.find((c) => c.category === 'Food')?.amount ?? 0
  const subs = byCategory.find((c) => c.category === 'Subscriptions')?.amount ?? 0
  const shop = byCategory.find((c) => c.category === 'Shopping')?.amount ?? 0

  const shameScore = Math.min(100, Math.round(
    ((food / (total || 1)) * 40 + (subs / (total || 1)) * 30 + (shop / (total || 1)) * 30) * 2
  ))
  const shameLevel = shameScore <= 30 ? 'Responsible' : shameScore <= 60 ? 'Concerning' : 'Disaster Mode'
  const roasts = [
    `Spent ₹${food.toLocaleString('en-IN')} on food delivery. Your bank account has filed for emotional damages.`,
    `Your Swiggy driver knows you better than your relatives.`,
    `₹${subs.toLocaleString('en-IN')} on subscriptions. You're not a creator — you're a subscriber to your own poverty.`,
    `Saving money? Hilarious. Try saving the receipts first.`,
    `₹${shop.toLocaleString('en-IN')} on shopping. The cart was full. The fridge isn't.`,
  ]
  const shameRoast = roasts[Math.floor(Math.random() * roasts.length)]

  const savingsScore = Math.max(0, Math.min(100, 100 - shameScore))
  const diversityScore = Math.min(100, byCategory.length * 15)
  const budgetScore = Math.max(0, 100 - Math.round((total / 60) / 1000 * 10))
  const healthScore = Math.round(savingsScore * 0.5 + diversityScore * 0.25 + budgetScore * 0.25)

  const subscores = [
    { label: 'Savings', value: savingsScore },
    { label: 'Diversity', value: diversityScore },
    { label: 'Budget', value: budgetScore },
    { label: 'Awareness', value: Math.min(100, txns.length * 2) },
  ]

  const personalities = [
    { threshold: 40, name: 'Mindful Spender', icon: '🧘', description: 'You spend thoughtfully across categories.', risk: 'Low', tip: 'Keep an emergency fund at 3–6 months of expenses.' },
    { threshold: 65, name: 'Impulse Buyer', icon: '🛍️', description: 'Weekend deals are your weakness. The dopamine is real.', risk: 'Medium', tip: 'Use a 24-hour rule before any purchase over ₹500.' },
    { threshold: 100, name: 'Chaos Spender', icon: '🔥', description: 'Every UPI notification is a surprise. Even to you.', risk: 'High', tip: 'Set up auto-debit for savings before you can spend it.' },
  ]
  const personality = personalities.find((p) => shameScore <= p.threshold) ?? personalities[2]

  const suspicious = txns.filter((t) => t.suspicious)

  const merchantMap = new Map<string, { amount: number; count: number }>()
  for (const t of txns) {
    const e = merchantMap.get(t.merchant) ?? { amount: 0, count: 0 }
    e.amount += t.amount; e.count++
    merchantMap.set(t.merchant, e)
  }
  const topMerchants = [...merchantMap.entries()]
    .map(([merchant, v]) => ({ merchant, ...v }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const wasteAmount = food * 0.3 + subs * 0.4
  const opportunityCost = [
    { item: 'MacBook Air M2', price: 114900, qty: Math.floor(wasteAmount / 114900) },
    { item: 'iPhone 15', price: 79900, qty: Math.floor(wasteAmount / 79900) },
    { item: 'Europe Trip', price: 85000, qty: Math.floor(wasteAmount / 85000) },
    { item: 'PS5', price: 54990, qty: Math.floor(wasteAmount / 54990) },
    { item: 'Month of SIPs', price: 5000, qty: Math.floor(wasteAmount / 5000) },
  ]

  const monthlySavings = Math.round(food * 0.3 + subs * 0.5 + shop * 0.2)
  const recommendations = {
    topAction: `Cut food delivery by 30% — saves ₹${Math.round(food * 0.3).toLocaleString('en-IN')}/mo`,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    scoreImprovement: Math.min(25, Math.round(monthlySavings / 500)),
    items: [
      { title: 'Reduce food delivery', detail: 'Cook 3 extra meals/week', saves: Math.round(food * 0.3) },
      { title: 'Audit subscriptions', detail: `You have ₹${subs.toLocaleString('en-IN')} in subs`, saves: Math.round(subs * 0.4) },
      { title: 'Shopping budget', detail: 'Set a ₹2,000 impulse limit', saves: Math.round(shop * 0.2) },
      { title: 'UPI limit alerts', detail: 'Enable spending alerts in your bank app', saves: Math.round(total * 0.05) },
    ],
  }

  const now = new Date()
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return d.toLocaleString('en-IN', { month: 'short' })
  })
  const monthlyBase = total / 2
  const futureProjection = {
    months,
    current: months.map((_, i) => Math.round(monthlyBase * (i + 1) * (1 + 0.02 * i))),
    improved: months.map((_, i) => Math.round((monthlyBase - monthlySavings) * (i + 1) * (1 + 0.01 * i))),
  }

  return { total, byCategory, daily, monthly, heatmap, shameScore, shameLevel, shameRoast, healthScore, subscores, personality, suspicious, topMerchants, opportunityCost, recommendations, futureProjection }
}