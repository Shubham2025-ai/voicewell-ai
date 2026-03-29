import React, { useState } from 'react'

/**
 * BMICard — beautiful BMI result card shown in chat bubble with 3D effects.
 */
export default function BMICard({ data }) {
  const [isHovered, setIsHovered] = useState(false)
  // BMI scale: 0-40 mapped to 0-100%
  const bmiPct     = Math.min(Math.max((data.bmi / 40) * 100, 0), 100)
  const healthyMin = (18.5 / 40) * 100
  const healthyMax = (25   / 40) * 100

  return (
    <div style={{
      minWidth: 220,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: isHovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
    }}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 13,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        opacity: isHovered ? 1 : 0.9,
        transition: 'opacity 0.3s',
      }}>
        📊 BMI Result
      </div>

      {/* Big BMI number */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 4,
        background: `linear-gradient(135deg, ${data.color}20, ${data.color}00)`,
        padding: '8px 12px',
        borderRadius: 12,
        border: `1px solid ${data.color}30`,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 42,
          color: data.color,
          lineHeight: 1,
          textShadow: `0 0 20px ${data.color}40`,
        }}>
          {data.bmi}
        </span>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 14,
            color: data.color,
          }}>
            {data.category}
          </div>
          <div style={{
            fontSize: 10,
            opacity: 0.7,
            fontFamily: 'var(--font-mono)',
          }}>
            {data.weightKg}kg · {data.heightCm}cm
          </div>
        </div>
      </div>

      {/* BMI scale bar */}
      <div style={{ margin: '12px 0', position: 'relative' }}>
        <div style={{
          height: 8,
          borderRadius: 99,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(to right, #60a5fa 0%, #00c27a 46%, #f59e0b 62%, #ef4444 80%, #9b2335 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          {/* Healthy range overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${healthyMin}%`,
            width: `${healthyMax - healthyMin}%`,
            border: '2px solid rgba(255,255,255,0.8)',
            borderRadius: 4,
            boxShadow: 'inset 0 0 8px rgba(255,255,255,0.2)',
          }} />
        </div>
        {/* Pointer */}
        <div
          style={{
            position: 'absolute',
            top: -3,
            left: `calc(${bmiPct}% - 7px)`,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            border: `3px solid ${data.color}`,
            boxShadow: `0 0 12px ${data.color}, 0 0 24px ${data.color}60`,
            transition: 'all 0.6s ease',
            animation: 'pulse-scale 2s ease-in-out infinite',
          }}
        />
        {/* Scale labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          fontSize: 9,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span>Under 18.5</span>
          <span>18.5–25</span>
          <span>25–30</span>
          <span>30+</span>
        </div>
      </div>

      {/* Ideal range */}
      <div style={{
        padding: '8px 10px',
        borderRadius: 8,
        marginBottom: 8,
        background: 'rgba(0,232,122,0.1)',
        border: '1px solid rgba(0,232,122,0.25)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'var(--font-mono)',
      }}>
        Ideal weight range: {data.idealMin}–{data.idealMax} kg
      </div>

      {/* Advice */}
      <div style={{
        fontSize: 12,
        opacity: 0.9,
        lineHeight: 1.55,
        color: 'rgba(255,255,255,0.85)',
      }}>
        {data.advice}
      </div>
    </div>
  )
}