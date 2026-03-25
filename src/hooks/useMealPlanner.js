import { useCallback } from 'react'

/**
 * useMealPlanner — generates a personalised 7-day Indian meal plan via Groq.
 * Detects dietary preferences from voice and generates a structured plan.
 */

export function useMealPlanner() {

  const isMealPlanQuery = useCallback((text) => {
    const t = text.toLowerCase()

    // Direct keyword matches
    const direct = [
      'meal plan','meal planner','diet plan','weekly diet','weekly meal',
      '7 day','seven day','food plan','diet chart','what should i eat',
      'plan my meals','plan my diet','खाना','डाइट',
    ]
    if (direct.some(k => t.includes(k))) return true

    // Flexible: plan/suggest/create + meal/food/diet/eat/menu
    const planWords = ['plan','suggest','create','make','give','prepare','design','help me with']
    const foodWords = ['meal','meals','food','diet','eating','eat','menu','nutrition']
    if (planWords.some(w => t.includes(w)) && foodWords.some(w => t.includes(w))) return true

    // week + food
    const weekWords = ['week','weekly','daily','everyday','each day','per day']
    if (weekWords.some(w => t.includes(w)) && foodWords.some(w => t.includes(w))) return true

    return false
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

    const callGroq = async (days) => {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2000,
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: `You are an Indian nutritionist. Generate a ${days}-day meal plan.
CRITICAL: Return ONLY a raw JSON object. No markdown, no backticks, no explanation.
Exact format:
{"goal":"string","diet":"string","calories":"string","days":[{"day":"Monday","breakfast":{"name":"string","items":["item1","item2"],"calories":300},"lunch":{"name":"string","items":["item1","item2"],"calories":450},"snack":{"name":"string","items":["item1"],"calories":150},"dinner":{"name":"string","items":["item1","item2"],"calories":400}}]}
Keep item names SHORT (max 3 words each). Include exactly ${days} days.`
            },
            {
              role: 'user',
              content: `${days}-day ${diet} Indian meal plan for ${goal}.`
            }
          ]
        })
      })
      if (!r.ok) throw new Error(`Groq API ${r.status}`)
      return await r.json()
    }

    // Try 7-day plan first, fall back to 3-day if it fails
    let plan = null
    for (const days of [7, 3]) {
      try {
        const data = await callGroq(days)
        const raw  = data.choices?.[0]?.message?.content?.trim()
        if (!raw) continue

        // Strip any accidental markdown fences
        const cleaned = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```$/,'').trim()

        // Extract JSON object
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (!jsonMatch) continue

        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.days?.length > 0) { plan = parsed; break }
      } catch { continue }
    }

    if (!plan) throw new Error('Could not generate meal plan')
    return plan
  }, [])

  const buildMealText = useCallback((plan) => {
    const day1 = plan.days[0]
    return `I've created a 7-day ${plan.diet} meal plan for ${plan.goal}. Here's your plan starting Monday — swipe through each day. Monday breakfast: ${day1.breakfast.name}. Lunch: ${day1.lunch.name}. Dinner: ${day1.dinner.name}.`
  }, [])

  return { isMealPlanQuery, generateMealPlan, buildMealText }
}