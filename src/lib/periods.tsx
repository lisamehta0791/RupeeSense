import type { Transaction } from './demo-data'

// ---- date helpers (local time) ----
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function startOfWeek(d: Date) { const x = startOfDay(d); x.setDate(x.getDate() - x.getDay()); return x } // Sunday start
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function startOfYear(d: Date) { return new Date(d.getFullYear(), 0, 1) }

function sumBetween(txns: Transaction[], from: Date, to: Date): number {
  let s = 0
  for (const t of txns) {
    const d = new Date(t.date)
    if (d >= from && d < to) s += t.amount
  }
  return s
}

export interface PeriodComparison {
  label: string          // e.g. "This month vs last month"
  current: number        // spend in current period
  previous: number       // spend in previous period
  diff: number           // current - previous (negative = spent less = good)
  pctChange: number      // % change vs previous (negative = down)
  spentLess: boolean     // true if you spent less than previous period
}

function buildComparison(label: string, txns: Transaction[], curFrom: Date, curTo: Date, prevFrom: Date, prevTo: Date): PeriodComparison {
  const current = sumBetween(txns, curFrom, curTo)
  const previous = sumBetween(txns, prevFrom, prevTo)
  const diff = current - previous
  const pctChange = previous > 0 ? Math.round((diff / previous) * 100) : (current > 0 ? 100 : 0)
  return { label, current, previous, diff, pctChange, spentLess: diff < 0 }
}

export interface Comparisons {
  week: PeriodComparison
  month: PeriodComparison
  year: PeriodComparison
}

export function getComparisons(txns: Transaction[], now = new Date()): Comparisons {
  // WEEK
  const wStart = startOfWeek(now)
  const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 7)
  const wPrevStart = new Date(wStart); wPrevStart.setDate(wPrevStart.getDate() - 7)

  // MONTH
  const mStart = startOfMonth(now)
  const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const mPrevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // YEAR
  const yStart = startOfYear(now)
  const yEnd = new Date(now.getFullYear() + 1, 0, 1)
  const yPrevStart = new Date(now.getFullYear() - 1, 0, 1)

  return {
    week: buildComparison('This week vs last week', txns, wStart, wEnd, wPrevStart, wStart),
    month: buildComparison('This month vs last month', txns, mStart, mEnd, mPrevStart, mStart),
    year: buildComparison('This year vs last year', txns, yStart, yEnd, yPrevStart, yStart),
  }
}

export interface SavingsResult {
  hasIncome: boolean
  income: number
  spentThisMonth: number
  saved: number          // income - spentThisMonth
  savedPct: number       // saved / income * 100
  onTrack: boolean       // saving something positive
}

// Real savings = monthly income - what you actually spent this calendar month
export function getSavings(txns: Transaction[], monthlyIncome: number | null, now = new Date()): SavingsResult {
  const mStart = startOfMonth(now)
  const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const spentThisMonth = sumBetween(txns, mStart, mEnd)
  if (monthlyIncome == null || monthlyIncome <= 0) {
    return { hasIncome: false, income: 0, spentThisMonth, saved: 0, savedPct: 0, onTrack: false }
  }
  const saved = monthlyIncome - spentThisMonth
  const savedPct = Math.round((saved / monthlyIncome) * 100)
  return { hasIncome: true, income: monthlyIncome, spentThisMonth, saved, savedPct, onTrack: saved > 0 }
}
