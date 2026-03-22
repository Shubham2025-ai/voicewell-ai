import React from 'react'
import { EMOTION_META } from '../hooks/useEmotion.js'

export default function EmotionBadge({ emotion, loading }) {
  const m = EMOTION_META[emotion] || EMOTION_META.neutral
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: m.bg, border: `1px solid ${m.color}30`,
      fontSize: 11, fontWeight: 500, color: m.color,
      transition: 'all 0.4s', opacity: loading ? 0.5 : 1,
      fontFamily: 'var(--font-body)',
    }}>
      <span style={{ fontSize: 13 }}>{m.emoji}</span>
      {m.label}
    </div>
  )
}