import React from 'react'

export default function Waveform({ isActive }) {
  return (
    <div className="flex items-center justify-center gap-1 h-10 my-1">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${isActive ? 'wave-bar' : ''}`}
          style={{
            height: isActive ? undefined : '3px',
            background: isActive ? 'var(--teal)' : 'var(--border)',
            animationDelay: isActive ? `${i * 0.07}s` : undefined,
            minHeight: '3px',
          }}
        />
      ))}
    </div>
  )
}