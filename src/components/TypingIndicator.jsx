import React from 'react'

export default function TypingIndicator() {
  return (
    <div className="bubble-left" style={{
      display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12,
    }}>
      <div style={{
        width: 30, height: 30,
        borderRadius: '10px 10px 10px 2px',
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600, color: '#fff',
        boxShadow: '0 0 8px var(--accent-glow)',
        flexShrink: 0,
      }}>
        ✦
      </div>
      <div style={{
        padding: '12px 16px',
        borderRadius: '16px 16px 16px 4px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}>
        {[1,2,3].map(i => (
          <div
            key={i}
            className={`dot-${i}`}
            style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: 'var(--accent)',
            }}
          />
        ))}
      </div>
    </div>
  )
}