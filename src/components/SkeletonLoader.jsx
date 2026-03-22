import React from 'react'

/**
 * SkeletonLoader — shown while app initialises (hooks loading, voices loading).
 * Replaces blank flash on first load with a polished skeleton.
 */
export default function SkeletonLoader() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Header skeleton */}
      <div
        style={{
          height: '60px',
          background: 'var(--header-bg)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          gap: '12px',
        }}
      >
        <div style={pulse({ width: 36, height: 36, borderRadius: 10 })} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={pulse({ width: 100, height: 14, borderRadius: 6 })} />
          <div style={pulse({ width: 70,  height: 10, borderRadius: 6 })} />
        </div>
      </div>

      {/* Chat skeleton */}
      <div style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Agent bubble */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={pulse({ width: 28, height: 28, borderRadius: '50%' })} />
          <div style={pulse({ width: '70%', height: 64, borderRadius: '18px 18px 18px 4px' })} />
        </div>
        {/* User bubble */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: 'row-reverse' }}>
          <div style={pulse({ width: 28, height: 28, borderRadius: '50%' })} />
          <div style={pulse({ width: '50%', height: 44, borderRadius: '18px 18px 4px 18px' })} />
        </div>
        {/* Agent bubble */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={pulse({ width: 28, height: 28, borderRadius: '50%' })} />
          <div style={pulse({ width: '60%', height: 52, borderRadius: '18px 18px 18px 4px' })} />
        </div>
      </div>

      {/* Bottom bar skeleton */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={pulse({ width: 80, height: 80, borderRadius: '50%' })} />
        <div style={pulse({ width: '80%', height: 40, borderRadius: 99 })} />
      </div>
    </div>
  )
}

function pulse(style) {
  return {
    ...style,
    background: 'var(--border)',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    flexShrink: 0,
  }
}