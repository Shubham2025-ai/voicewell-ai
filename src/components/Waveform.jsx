import React from 'react'

export default function Waveform({ isActive }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      height: 36,
    }}>
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className={isActive ? 'wave-bar' : ''}
          style={{
            width: 3,
            height: isActive ? 28 : 3,
            borderRadius: 99,
            background: isActive
              ? `hsl(${160 + i * 4}, 80%, ${isActive ? 55 : 40}%)`
              : 'var(--border)',
            transition: isActive ? 'none' : 'height 0.4s ease, background 0.4s ease',
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  )
}