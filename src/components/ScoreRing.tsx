export function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const color = value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={64} cy={64} r={r} fill="none" stroke="oklch(0.27 0.03 258)" strokeWidth={12} />
        <circle cx={64} cy={64} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 64 64)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={28} fontWeight={800} fill="oklch(0.98 0.005 250)">{value}</text>
      </svg>
      <span style={{ fontSize: 12, color: 'oklch(0.72 0.02 252)' }}>{label}</span>
    </div>
  )
}