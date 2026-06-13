import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { generateDemoTransactions, type Transaction } from '../lib/demo-data'
import { analyze, type Analysis } from '../lib/finance'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export interface Goal {
  id: string
  title: string
  target_amount: number
  saved_amount: number
  deadline: string | null
}

export interface Budget {
  id: string
  category: string
  monthly_limit: number
}

interface DataCtx {
  transactions: Transaction[]
  analysis: Analysis | null
  hasData: boolean
  isDemo: boolean
  loading: boolean
  loadDemo: () => Promise<void>
  addTransactions: (t: Transaction[]) => Promise<void>
  clearView: () => void
  deleteAllData: () => Promise<void>
  achievements: string[]
  unlockBadge: (id: string) => Promise<void>
  goals: Goal[]
  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  budgets: Budget[]
  setBudget: (category: string, monthly_limit: number) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
}

const Ctx = createContext<DataCtx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [achievements, setAchievements] = useState<string[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user) {
        setTransactions([]); setAchievements([]); setGoals([]); setBudgets([])
        setLoading(false)
        return
      }
      setLoading(true)
      const [txRes, achRes, goalRes, budRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('achievements').select('badge_id'),
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
        supabase.from('budgets').select('*'),
      ])
      if (cancelled) return
      if (txRes.error) console.error('load transactions:', txRes.error.message)
      if (achRes.error) console.error('load achievements:', achRes.error.message)

      setTransactions(
        (txRes.data ?? []).map((r: any) => ({
          id: r.id,
          date: r.date,
          merchant: r.merchant,
          amount: Number(r.amount),
          category: r.category,
          note: r.note ?? undefined,
          suspicious: r.suspicious ?? undefined,
          suspicious_reason: r.suspicious_reason ?? undefined,
        }))
      )
      setAchievements((achRes.data ?? []).map((r: any) => r.badge_id))
      setGoals(
        (goalRes.data ?? []).map((r: any) => ({
          id: r.id,
          title: r.title,
          target_amount: Number(r.target_amount),
          saved_amount: Number(r.saved_amount),
          deadline: r.deadline,
        }))
      )
      setBudgets(
        (budRes.data ?? []).map((r: any) => ({
          id: r.id,
          category: r.category,
          monthly_limit: Number(r.monthly_limit),
        }))
      )
      setIsDemo(false)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const unlockBadge = useCallback(async (id: string) => {
    if (!user) return
    let added = false
    setAchievements((prev) => {
      if (prev.includes(id)) return prev
      added = true
      return [...prev, id]
    })
    if (added) {
      const { error } = await supabase.from('achievements').insert({ user_id: user.id, badge_id: id })
      if (error && !error.message.includes('duplicate')) console.error('unlockBadge:', error.message)
    }
  }, [user])

  const addTransactions = useCallback(async (t: Transaction[]) => {
    if (!user || t.length === 0) return
    setTransactions((prev) => [...t, ...prev])
    setIsDemo(false)

    const rows = t.map((tx) => ({
      id: tx.id,
      user_id: user.id,
      date: tx.date,
      merchant: tx.merchant,
      amount: tx.amount,
      category: tx.category,
      note: tx.note ?? null,
      suspicious: tx.suspicious ?? false,
      suspicious_reason: tx.suspicious_reason ?? null,
    }))
    const { error } = await supabase.from('transactions').insert(rows)
    if (error) console.error('addTransactions:', error.message)
    await unlockBadge('first-analysis')
  }, [user, unlockBadge])

  const loadDemo = useCallback(async () => {
    setTransactions(generateDemoTransactions(60))
    setIsDemo(true)
    await unlockBadge('first-analysis')
  }, [unlockBadge])

  // Reset = clear the on-screen view only. Data stays safe in the database
  // and is reloaded on refresh / used by analysis. Demo preview is discarded.
  const clearView = useCallback(() => {
    if (isDemo) setTransactions([])
    setIsDemo(false)
  }, [isDemo])

  // Real, permanent delete (used in Settings, behind a confirm)
  const deleteAllData = useCallback(async () => {
    if (!user) { setTransactions([]); setIsDemo(false); return }
    setTransactions([])
    setIsDemo(false)
    const { error } = await supabase.from('transactions').delete().eq('user_id', user.id)
    if (error) console.error('deleteAllData:', error.message)
  }, [user])

  const addGoal = useCallback(async (g: Omit<Goal, 'id'>) => {
    if (!user) return
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: user.id, title: g.title, target_amount: g.target_amount, saved_amount: g.saved_amount, deadline: g.deadline })
      .select()
      .single()
    if (error) { console.error('addGoal:', error.message); return }
    setGoals((prev) => [{ id: data.id, title: data.title, target_amount: Number(data.target_amount), saved_amount: Number(data.saved_amount), deadline: data.deadline }, ...prev])
  }, [user])

  const updateGoal = useCallback(async (id: string, patch: Partial<Goal>) => {
    if (!user) return
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
    const { error } = await supabase.from('goals').update(patch).eq('id', id).eq('user_id', user.id)
    if (error) console.error('updateGoal:', error.message)
  }, [user])

  const deleteGoal = useCallback(async (id: string) => {
    if (!user) return
    setGoals((prev) => prev.filter((g) => g.id !== id))
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id)
    if (error) console.error('deleteGoal:', error.message)
  }, [user])

  const setBudget = useCallback(async (category: string, monthly_limit: number) => {
    if (!user) return
    const { data, error } = await supabase
      .from('budgets')
      .upsert({ user_id: user.id, category, monthly_limit }, { onConflict: 'user_id,category' })
      .select()
      .single()
    if (error) { console.error('setBudget:', error.message); return }
    setBudgets((prev) => {
      const others = prev.filter((b) => b.category !== category)
      return [...others, { id: data.id, category: data.category, monthly_limit: Number(data.monthly_limit) }]
    })
  }, [user])

  const deleteBudget = useCallback(async (id: string) => {
    if (!user) return
    setBudgets((prev) => prev.filter((b) => b.id !== id))
    const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id)
    if (error) console.error('deleteBudget:', error.message)
  }, [user])

  const analysis = useMemo(() => (transactions.length ? analyze(transactions) : null), [transactions])

  return (
    <Ctx.Provider value={{
      transactions, analysis, hasData: transactions.length > 0, isDemo, loading,
      loadDemo, addTransactions, clearView, deleteAllData,
      achievements, unlockBadge,
      goals, addGoal, updateGoal, deleteGoal,
      budgets, setBudget, deleteBudget,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData must be inside DataProvider')
  return v
}
