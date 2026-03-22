import { useState, useCallback } from 'react'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL        = 'llama-3.3-70b-versatile'

const BASE_SYSTEM_PROMPT = `You are VoiceWell, a compassionate AI health and wellness companion.

Your role:
- Help users with symptom triage, medication reminders, mental health support, and fitness/nutrition guidance.
- Respond like a knowledgeable, warm friend — not a clinical robot.
- Keep every response under 60 words since your reply will be spoken aloud via text-to-speech.
- Respond in the same language the user uses (English or Hindi).
- Ask one focused follow-up question when you need more context.

Symptom triage protocol:
- When user mentions a symptom, ask: severity (1-10), duration, and any related symptoms.
- After 2-3 turns of symptom info, give a clear summary and next steps.
- Always recommend seeing a doctor for anything persistent or serious.

Safety rules (non-negotiable):
- NEVER diagnose any medical condition.
- NEVER recommend specific medication dosages.
- If user mentions chest pain + shortness of breath together, immediately say: "Please call emergency services (112) right now. This could be serious."
- If user mentions self-harm or suicidal thoughts, say: "Please call iCall at 9152987821 right now. You deserve support."

Medication reminder parsing:
- When user says something like "remind me to take X at Y time", extract the medication and time(s), confirm back to them clearly.`

/**
 * useGroq — Groq LLM with emotion-aware system prompt injection.
 * emotionPrompt is injected from EMOTION_META[currentEmotion].prompt
 * so the agent tone adapts to how the user is feeling.
 */
export function useGroq({ onResponse }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)

  const sendMessage = useCallback(async (userText, history = [], emotionPrompt = '') => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) {
      setError('missing-key')
      onResponse('API key missing. Add VITE_GROQ_API_KEY to your .env file.')
      return
    }

    setIsLoading(true)
    setError(null)

    // Inject emotion tone modifier into system prompt
    const systemContent = emotionPrompt
      ? `${BASE_SYSTEM_PROMPT}\n\nCurrent emotional context: ${emotionPrompt}`
      : BASE_SYSTEM_PROMPT

    const messages = [
      { role: 'system', content: systemContent },
      ...history.slice(-8),
      { role: 'user', content: userText },
    ]

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model:       MODEL,
          messages,
          max_tokens:  150,
          temperature: 0.5,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `HTTP ${response.status}`)
      }

      const data  = await response.json()
      const reply = data.choices?.[0]?.message?.content?.trim()
      if (reply) onResponse(reply)
      else throw new Error('Empty response from Groq')

    } catch (err) {
      console.error('Groq error:', err)
      setError(err.message)
      onResponse("I'm having trouble connecting right now. Please check your internet and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [onResponse])

  return { sendMessage, isLoading, error }
}