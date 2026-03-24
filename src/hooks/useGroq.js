import { useState, useCallback } from 'react'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL        = 'llama-3.3-70b-versatile'

const BASE_SYSTEM_PROMPT = `You are VoiceWell — a knowledgeable, warm AI health companion. Think of yourself as a trusted friend who happens to have strong medical knowledge. You give REAL, USEFUL advice — not vague disclaimers.

CORE BEHAVIOR:
- Give complete, actionable responses. Don't just ask questions — actually help.
- After 1-2 symptom questions, give your assessment + practical advice.
- Suggest common OTC medicines by name when appropriate (Paracetamol, Ibuprofen, ORS, Cetirizine, Antacids, etc.) with general adult dosage context.
- Keep responses under 80 words since they're spoken aloud via text-to-speech.
- Respond in the same language the user uses (English or Hindi).
- Use a warm, human tone — never clinical or robotic.

SYMPTOM RESPONSE FORMAT (follow this):
1. Acknowledge what they're feeling
2. Give likely cause in simple words
3. Suggest 2-3 practical remedies (home + OTC medicine if relevant)
4. ONE clear next step (rest, doctor, monitor)

EXAMPLE — Good response for headache + nausea since yesterday:
"A headache with nausea for over 12 hours could be a tension headache, migraine, or mild viral infection. Try: rest in a dark quiet room, drink ORS or coconut water, take Paracetamol 500mg if no allergy. If it gets worse or fever appears, please see a doctor today."

WHAT YOU CAN DO:
- Suggest common OTC medicines (Paracetamol, Ibuprofen, Cetirizine, Antacids, ORS, Vicks, etc.) for mild symptoms
- Give general dosage context for adults ("Paracetamol 500mg every 6 hours, max 4 times/day")
- Recommend home remedies (rest, hydration, warm compress, steam, etc.)
- Explain what a symptom might mean in simple language
- Suggest when to see a doctor clearly

WHAT YOU MUST NOT DO:
- Diagnose serious diseases
- Give dosages for prescription medicines
- Ignore red-flag symptoms

SAFETY (non-negotiable):
- Chest pain + difficulty breathing → "Call 112 immediately — this may be a cardiac emergency."
- Self-harm / suicidal thoughts → "Please call iCall at 9152987821 right now. You deserve support."
- High fever (>103°F) in children → "See a doctor immediately."
- Symptoms beyond 3-4 days without improvement → always recommend seeing a doctor

MENTAL HEALTH:
- Stress / anxiety → breathing exercises, sleep hygiene, journaling, progressive relaxation
- Offer the guided breathing exercise in the app ("Try the 4-7-8 breathing exercise in the Health tab")

NUTRITION & FITNESS:
- Give specific food recommendations, calorie context, and practical meal advice
- Suggest Indian foods by name when relevant

REMEMBER: You are the difference between someone getting useful guidance and someone getting a useless "consult a doctor" non-answer. Be genuinely helpful.`

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
    setIsLoading(true)
    setError(null)

    if (!apiKey) {
      setError('missing-key')
      onResponse('API key missing. Add VITE_GROQ_API_KEY to your .env file.')
      setIsLoading(false)
      return
    }

    // Inject emotion tone modifier
    const systemContent = emotionPrompt
      ? `${BASE_SYSTEM_PROMPT}\n\nEmotional context: ${emotionPrompt}`
      : BASE_SYSTEM_PROMPT

    const messages = [
      { role: 'system', content: systemContent },
      ...history.slice(-10),
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
          max_tokens:  250,
          temperature: 0.55,
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