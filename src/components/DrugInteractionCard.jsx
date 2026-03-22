import React from 'react'

/**
 * DrugInteractionCard — renders drug interaction results beautifully in chat.
 */
export default function DrugInteractionCard({ data }) {
  const sevColors = {
    high:     { bg: '#3f0f0f', border: '#ef4444', text: '#fca5a5', icon: '🚨' },
    moderate: { bg: '#3f2a00', border: '#f59e0b', text: '#fcd34d', icon: '⚠️' },
    check:    { bg: 'var(--surface-3)', border: 'var(--border-2)', text: 'var(--text-2)', icon: 'ℹ️' },
    low:      { bg: 'var(--green-dim)', border: 'var(--green)', text: 'var(--green)', icon: '✅' },
  }
  const s = sevColors[data.severity] || sevColors.check

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${s.border}`,
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px', background: s.bg,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{s.icon}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: s.text, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Drug Interaction Check
          </div>
          <div style={{ fontSize: 11, color: s.text, opacity: 0.8, marginTop: 1 }}>
            {data.drugs.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(' + ')}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 99,
            background: `${s.border}30`, color: s.text,
            fontFamily: 'var(--font-mono)', fontWeight: 600,
          }}>
            {data.severity === 'high' ? 'HIGH RISK' : data.severity === 'moderate' ? 'MODERATE' : data.severity === 'low' ? 'SAFE' : 'REVIEW'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px', background: 'var(--surface)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.6, margin: 0 }}>
          {data.effect}
        </p>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          Source: {data.source === 'openfda' ? 'OpenFDA Drug Labels' : data.source === 'local' ? 'Medical Reference DB' : 'General Guidelines'} · Always consult a doctor
        </div>
      </div>
    </div>
  )
}