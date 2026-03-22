import React from 'react'

/**
 * BMICard — beautiful BMI result card shown in chat bubble.
 */
export default function BMICard({ data }) {
  // BMI scale: 0-40 mapped to 0-100%
  const bmiPct     = Math.min(Math.max((data.bmi / 40) * 100, 0), 100)
  const healthyMin = (18.5 / 40) * 100
  const healthyMax = (25   / 40) * 100

  return (
    <div style={{ minWidth: 220 }}>
      {/* Title */}
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        📊 BMI Result
      </div>

      {/* Big BMI number */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 42, color: data.color, lineHeight: 1 }}>
          {data.bmi}
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: data.color }}>
            {data.category}
          </div>
          <div style={{ fontSize: 10, opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
            {data.weightKg}kg · {data.heightCm}cm
          </div>
        </div>
      </div>

      {/* BMI scale bar */}
      <div style={{ margin: '12px 0', position: 'relative' }}>
        <div style={{ height: 8, borderRadius: 99, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(to right, #60a5fa 0%, #00c27a 46%, #f59e0b 62%, #ef4444 80%, #9b2335 100%)' }}>
          {/* Healthy range overlay */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${healthyMin}%`, width: `${healthyMax - healthyMin}%`,
            border: '2px solid rgba(255,255,255,0.6)',
            borderRadius: 4,
          }} />
        </div>
        {/* Pointer */}
        <div style={{
          position: 'absolute', top: -3,
          left: `calc(${bmiPct}% - 7px)`,
          width: 14, height: 14, borderRadius: '50%',
          background: '#fff', border: `3px solid ${data.color}`,
          boxShadow: `0 0 6px ${data.color}`,
        }} />
        {/* Scale labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>
          <span>Under 18.5</span>
          <span>18.5–25</span>
          <span>25–30</span>
          <span>30+</span>
        </div>
      </div>

      {/* Ideal range */}
      <div style={{
        padding: '6px 10px', borderRadius: 8, marginBottom: 8,
        background: 'rgba(255,255,255,0.08)',
        fontSize: 11, color: 'rgba(255,255,255,0.8)',
        fontFamily: 'var(--font-mono)',
      }}>
        Ideal weight range: {data.idealMin}–{data.idealMax} kg
      </div>

      {/* Advice */}
      <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.55 }}>
        {data.advice}
      </div>
    </div>
  )
}