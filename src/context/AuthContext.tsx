import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  avatarColor: string
}

interface AuthCtx {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (patch: Partial<{ name: string }>) => void
}

const Ctx = createContext<AuthCtx | null>(null)

function colorFromName(n: string) {
  const colors = ['#14B8A6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899']
  let h = 0
  for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return colors[h % colors.length]
}

function mapUser(sb: SupabaseUser): User {
  const name = (sb.user_metadata?.name as string) || sb.email?.split('@')[0] || 'User'
  return { id: sb.id, email: sb.email ?? '', name, avatarColor: colorFromName(name) }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapUser(session.user) : null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signUp(name: string, email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    if (error) throw new Error(error.message)
    const { error: siErr } = await supabase.auth.signInWithPassword({ email, password })
    if (siErr) throw new Error(siErr.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  function updateProfile(patch: Partial<{ name: string }>) {
    if (!user) return
    setUser({ ...user, ...patch })
    supabase.auth.updateUser({ data: patch })
  }

  return <Ctx.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be inside AuthProvider')
  return v
}