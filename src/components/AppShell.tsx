import { Navbar } from './Navbar'
import { FloatingChat } from './FloatingChat'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {children}
      </main>
      <FloatingChat />
    </div>
  )
}