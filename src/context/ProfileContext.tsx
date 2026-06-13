import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export interface Profile {
  monthly_income: number | null
  monthly_budget: number | null
  currency: string
}

interface ProfileCtx {
  profile: Profile
  loading: boolean
  setIncome: (amount: number) => Promise<void>
  setMonthlyBudget: (amount: number) => Promise<void>
}

const DEFAULT: Profile = { monthly_income: null, monthly_budget: null, currency: 'INR' }
const Ctx = createContext<ProfileCtx | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user) { setProfile(DEFAULT); setLoading(false); return }
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_income, monthly_budget, currency')
        .eq('id', user.id)
        .maybeSingle()
      if (cancelled) return
      if (error) console.error('load profile:', error.message)
      setProfile({
        monthly_income: data?.monthly_income != null ? Number(data.monthly_income) : null,
        monthly_budget: data?.monthly_budget != null ? Number(data.monthly_budget) : null,
        currency: data?.currency ?? 'INR',
      })
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const setIncome = useCallback(async (amount: number) => {
    if (!user) return
    setProfile((p) => ({ ...p, monthly_income: amount }))
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, monthly_income: amount, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    if (error) console.error('setIncome:', error.message)
  }, [user])

  const setMonthlyBudget = useCallback(async (amount: number) => {
    if (!user) return
    setProfile((p) => ({ ...p, monthly_budget: amount }))
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, monthly_budget: amount, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    if (error) console.error('setMonthlyBudget:', error.message)
  }, [user])

  return (
    <Ctx.Provider value={{ profile, loading, setIncome, setMonthlyBudget }}>
      {children}
    </Ctx.Provider>
  )
}

export function useProfile() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useProfile must be inside ProfileProvider')
  return v
}
