import { useState, useCallback, useRef } from 'react'

/**
 * useEmotion — detects emotion from text using HuggingFace Inference API
 * Model: j-hartmann/emotion-english-distilroberta-base
 * Returns: joy | sadness | anger | fear | surprise | disgust | neutral
 *
 * Runs async (non-blocking) — result comes after Groq response starts.
 * Falls back to 'neutral' on any error or timeout.
 */

const HF_API_URL =
  'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base'

// Map raw emotion labels → our 4 simplified states
const EMOTION_MAP = {
  joy:      'happy',
  surprise: 'happy',
  neutral:  'neutral',
  disgust:  'neutral',
  fear:     'stressed',
  anger:    'stressed',
  sadness:  'sad',
}

export const EMOTION_META = {
  happy:   { emoji: '😊', label: 'Feeling good',  color: '#16a34a', bg: '#dcfce7', prompt: 'The user seems happy and positive. Keep your tone warm and upbeat.' },
  neutral: { emoji: '😐', label: 'Neutral',        color: '#64748b', bg: '#f1f5f9', prompt: 'The user seems calm and neutral. Respond clearly and helpfully.' },
  stressed:{ emoji: '😰', label: 'Stressed',       color: '#d97706', bg: '#fef3c7', prompt: 'The user seems stressed or anxious. Be extra gentle, validating, and calm. Acknowledge their feelings first before giving advice.' },
  sad:     { emoji: '😔', label: 'Feeling low',    color: '#7c3aed', bg: '#ede9fe', prompt: 'The user seems sad or down. Lead with empathy and compassion. Be warm and supportive before anything else.' },
}

export function useEmotion() {
  const [emotion, setEmotion]   = useState('neutral')
  const [loading, setLoading]   = useState(false)
  const cacheRef                = useRef({})   // simple text → emotion cache

  const detectEmotion = useCallback(async (text) => {
    if (!text || text.length < 5) return 'neutral'

    // Check cache first (avoid repeat API calls for similar text)
    const key = text.slice(0, 60)
    if (cacheRef.current[key]) {
      setEmotion(cacheRef.current[key])
      return cacheRef.current[key]
    }

    const apiKey = import.meta.env.VITE_HF_API_KEY
    if (!apiKey) {
      // No key → simple keyword fallback
      return keywordFallback(text)
    }

    setLoading(true)
    try {
      const controller = new AbortController()
      const timeout    = setTimeout(() => controller.abort(), 4000)  // 4s timeout

      const res = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) throw new Error(`HF API ${res.status}`)

      const data    = await res.json()
      const scores  = data?.[0] || []
      const top     = scores.reduce((a, b) => a.score > b.score ? a : b, { label: 'neutral', score: 0 })
      const mapped  = EMOTION_MAP[top.label.toLowerCase()] || 'neutral'

      cacheRef.current[key] = mapped
      setEmotion(mapped)
      return mapped

    } catch {
      // Timeout or error → keyword fallback
      const fallback = keywordFallback(text)
      setEmotion(fallback)
      return fallback
    } finally {
      setLoading(false)
    }
  }, [])

  return { emotion, loading, detectEmotion }
}

/**
 * keywordFallback — simple keyword-based emotion when HF API is unavailable.
 * Good enough for demo purposes.
 */
function keywordFallback(text) {
  const t = text.toLowerCase()
  const stressed = ['anxious', 'anxiety', 'stress', 'stressed', 'panic', 'overwhelm',
                    'worried', 'worry', 'scared', 'nervous', 'tension', 'tight', 'chest']
  const sad      = ['sad', 'depressed', 'crying', 'hopeless', 'lonely', 'unhappy',
                    'miserable', 'down', 'low', 'exhausted', 'tired', 'empty']
  const happy    = ['happy', 'great', 'good', 'excited', 'wonderful', 'amazing',
                    'better', 'thankful', 'grateful', 'relieved']

  if (stressed.some(w => t.includes(w))) return 'stressed'
  if (sad.some(w => t.includes(w)))      return 'sad'
  if (happy.some(w => t.includes(w)))    return 'happy'
  return 'neutral'
}