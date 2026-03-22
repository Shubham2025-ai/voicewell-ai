import React from 'react'

export default function ContextPill({ turnCount }) {
  if (turnCount === 0) return null
  const pct = Math.min((turnCount / 8) * 100, 100)

  return (
    <div className="fade-up" style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '5px 12px',
      borderRadius: 99,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      fontSize: 11,
      color: 'var(--text-3)',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{
        width: 40, height: 3,
        borderRadius: 99,
        background: 'var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--accent)',
          borderRadius: 99,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span>{turnCount}/8 turns in memory</span>
    </div>
  )
}