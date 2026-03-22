import React from 'react'
import { EMOTION_META } from '../hooks/useEmotion.js'

/**
 * EmotionBadge — shows the currently detected emotion with emoji + label.
 * Sits in the header area. Fades in on change.
 */
export default function EmotionBadge({ emotion, loading }) {
  const meta = EMOTION_META[emotion] || EMOTION_META.neutral

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-500"
      style={{
        background: meta.bg,
        color:      meta.color,
        border:     `1px solid ${meta.color}30`,
        opacity:    loading ? 0.5 : 1,
      }}
      title={`Detected mood: ${meta.label}`}
    >
      <span style={{ fontSize: '14px' }}>{meta.emoji}</span>
      <span>{loading ? 'Detecting…' : meta.label}</span>
    </div>
  )
}