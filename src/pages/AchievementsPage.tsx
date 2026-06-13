import { AppShell } from '../components/AppShell'
import { useData } from '../context/DataContext'

const BADGES = [
  { id: 'first-analysis', title: 'First Analysis', description: 'Ran your first spending analysis.', icon: '🪞' },
  { id: 'budget-beginner', title: 'Budget Beginner', description: 'Logged 10+ transactions.', icon: '📒' },
  { id: 'smart-saver', title: 'Smart Saver', description: 'Kept food spend under ₹500 on a day.', icon: '💎' },
  { id: 'saving-streak', title: 'Saving Streak', description: '3 days in a row under daily average.', icon: '🔥' },
  { id: 'no-delivery-week', title: 'No Delivery Week', description: 'Zero food delivery for 7 days.', icon: '🥗' },
  { id: 'financial-pro', title: 'Financial Discipline Pro', description: 'Spent across 5+ categories with budget held.', icon: '🏆' },
]

export default function AchievementsPage() {
  const { achievements, transactions } = useData()

  const unlocked = new Set(achievements)
  if (transactions.length >= 10) unlocked.add('budget-beginner')

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#14b8a6', fontWeight: 600, marginBottom: 6 }}>Achievements</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Your financial milestones</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {BADGES.map((b) => {
            const earned = unlocked.has(b.id)
            return (
              <div key={b.id} className={earned ? 'glass' : ''} style={{
                borderRadius: 20, padding: 20,
                background: earned ? undefined : 'oklch(0.23 0.03 260 / 40%)',
                border: earned ? undefined : '1px solid oklch(0.32 0.025 258 / 30%)',
                opacity: earned ? 1 : 0.5,
              }}>
                <div style={{ fontSize: 36, marginBottom: 12, filter: earned ? 'none' : 'grayscale(1)' }}>{b.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: 'oklch(0.72 0.02 252)', lineHeight: 1.5 }}>{b.description}</div>
                {earned && (
                  <div style={{ marginTop: 12, fontSize: 11, color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✓ Unlocked
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}