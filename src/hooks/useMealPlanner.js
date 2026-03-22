import { useCallback } from 'react'

/**
 * useMealPlanner — generates a personalised 7-day Indian meal plan via Groq.
 * Detects dietary preferences from voice and generates a structured plan.
 */

const MEAL_KEYWORDS = [
  'meal plan', 'meal planner', 'diet plan', 'weekly diet',
  'what should i eat', 'plan my meals', 'plan my diet',
  'weekly meal', '7 day', 'seven day', 'food plan',
  'diet chart', 'खाना', 'डाइट',
]

export function useMealPlanner() {

  const isMealPlanQuery = useCallback((text) => {
    const t = text.toLowerCase()
    return MEAL_KEYWORDS.some(k => t.includes(k))
  }, [])

  const generateMealPlan = useCallback(async (transcript, apiKey) => {
    if (!apiKey) throw new Error('missing-key')

    const t = transcript.toLowerCase()

    // Detect preferences
    const isVeg       = t.includes('vegetarian') || t.includes('veg ') || t.includes('no meat') || !t.includes('non-veg')
    const isVegan     = t.includes('vegan')
    const isWeightLoss = t.includes('lose weight') || t.includes('weight loss') || t.includes('slim') || t.includes('diet')
    const isMuscle    = t.includes('muscle') || t.includes('protein') || t.includes('gym') || t.includes('workout')
    const isDiabetic  = t.includes('diabet') || t.includes('sugar')

    const goal = isWeightLoss ? 'weight loss (low calorie ~1400-1600 kcal/day)'
      : isMuscle ? 'muscle building (high protein ~2000-2200 kcal/day)'
      : isDiabetic ? 'diabetes management (low glycemic index, controlled carbs)'
      : 'balanced healthy living (~1800-2000 kcal/day)'

    const diet = isVegan ? 'vegan' : isVeg ? 'vegetarian' : 'non-vegetarian'

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: `You are a professional Indian nutritionist. Generate a 7-day meal plan.
Return ONLY valid JSON in this exact format, no markdown, no extra text:
{
  "goal": "string",
  "diet": "string",
  "calories": "string",
  "days": [
    {
      "day": "Monday",
      "breakfast": {"name": "string", "items": ["item1","item2"], "calories": number},
      "lunch":     {"name": "string", "items": ["item1","item2"], "calories": number},
      "snack":     {"name": "string", "items": ["item1"],         "calories": number},
      "dinner":    {"name": "string", "items": ["item1","item2"], "calories": number}
    }
  ]
}
Use realistic Indian foods. All 7 days must be included.`
          },
          {
            role: 'user',
            content: `Generate a 7-day ${diet} Indian meal plan for ${goal}. Original request: "${transcript}"`
          }
        ]
      })
    })

    if (!res.ok) throw new Error(`Groq API ${res.status}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content?.trim()

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response format')
    const plan = JSON.parse(jsonMatch[0])

    if (!plan.days || plan.days.length === 0) throw new Error('Empty meal plan')
    return plan
  }, [])

  const buildMealText = useCallback((plan) => {
    const day1 = plan.days[0]
    return `I've created a 7-day ${plan.diet} meal plan for ${plan.goal}. Here's your plan starting Monday — swipe through each day. Monday breakfast: ${day1.breakfast.name}. Lunch: ${day1.lunch.name}. Dinner: ${day1.dinner.name}.`
  }, [])

  return { isMealPlanQuery, generateMealPlan, buildMealText }
}