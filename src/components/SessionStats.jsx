import React from 'react'

/**
 * SessionStats — shows REAL session metrics only.
 * No simulated data. Every number is accurate.
 */
export default function SessionStats({ turnCount, avgLatency, apiCallCount, emotionCount }) {
  const stats = [
    { label: 'Turns today',      value: turnCount,    unit: '',    icon: '💬', color: 'var(--green)' },
    { label: 'Avg response',     value: avgLatency ? `${avgLatency}` : '—', unit: avgLatency ? 'ms' : '', icon: '⚡', color: avgLatency < 1000 ? 'var(--green)' : '#f59e0b' },
    { label: 'API calls made',   value: apiCallCount, unit: '',    icon: '🔗', color: 'var(--green)' },
    { label: 'Emotions detected',value: emotionCount, unit: '',    icon: '🧠', color: 'var(--green)' },
  ]

  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 'var(--radius)',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 10, fontFamily: 'var(--font-mono)',
      }}>
        Session stats
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stats.map(({ label, value, unit, icon, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              {label}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: value === '—' ? 'var(--text-3)' : color,
              fontFamily: 'var(--font-mono)',
            }}>
              {value}{unit && <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7, marginLeft: 2 }}>{unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}