import React, { useState } from 'react'

export default function ChromeWarning() {
  const [dismissed, setDismissed] = useState(false)
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  if (isChrome || dismissed) return null

  return (
    <div className="warn-slide" style={{
      background: '#7c2d12',
      borderBottom: '1px solid #c2410c',
      padding: '8px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 13, color: '#fed7aa',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 16 }}>⚠️</span>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)' }}>
        Voice features require <strong style={{ color: '#fff' }}>Google Chrome</strong>.
        Other browsers don't support the Web Speech API.
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', border: '1px solid #c2410c', color: '#fed7aa',
          padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
          fontSize: 12, fontFamily: 'var(--font-body)',
        }}
      >
        Dismiss
      </button>
    </div>
  )
}