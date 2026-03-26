import { useCallback } from 'react'

const OFFLINE_PLAN = {
  goal: 'muscle building (high calorie)',
  diet: 'non-vegetarian',
  calories: '~2400 kcal/day',
  source: 'offline',
  days: [
    { day:'Monday',    breakfast:{name:'Egg & Oats', items:['4 eggs','oats','banana'], calories:600}, lunch:{name:'Chicken & Rice', items:['200g chicken','rice','veg'], calories:750}, snack:{name:'Whey + PB', items:['whey','peanut butter'], calories:350}, dinner:{name:'Fish & Pasta', items:['fish','pasta','olive oil'], calories:700}},
    { day:'Tuesday',   breakfast:{name:'Paneer Wrap', items:['paneer','roti','cheese'], calories:620}, lunch:{name:'Mutton Curry', items:['150g mutton','rice','ghee'], calories:780}, snack:{name:'Trail Mix', items:['nuts','raisins'], calories:320}, dinner:{name:'Chicken Stir-fry', items:['chicken','noodles','oil'], calories:680}},
    { day:'Wednesday', breakfast:{name:'Greek Yogurt Bowl', items:['curd','granola','honey'], calories:580}, lunch:{name:'Beef/Chicken Bowl', items:['beef/chicken','rice','beans'], calories:760}, snack:{name:'Protein Shake', items:['whey','milk','banana'], calories:360}, dinner:{name:'Paneer Tikka', items:['paneer','naan','butter'], calories:680}},
    { day:'Thursday',  breakfast:{name:'Paratha & Eggs', items:['2 paratha','3 eggs'], calories:620}, lunch:{name:'Chicken Biryani', items:['biryani','raita'], calories:780}, snack:{name:'Cheese Sandwich', items:['bread','cheese','butter'], calories:320}, dinner:{name:'Fish Curry', items:['fish','rice','ghee'], calories:680}},
    { day:'Friday',    breakfast:{name:'Upma + Nuts', items:['upma','cashews'], calories:580}, lunch:{name:'Keema & Rice', items:['keema','rice','oil'], calories:760}, snack:{name:'Chana + Jaggery', items:['roasted chana','gud'], calories:300}, dinner:{name:'Chicken Pasta', items:['chicken','pasta','cheese'], calories:700}},
    { day:'Saturday',  breakfast:{name:'Idli + Ghee', items:['4 idli','ghee','sambar'], calories:560}, lunch:{name:'Paneer Butter', items:['paneer','naan','butter'], calories:780}, snack:{name:'Lassi', items:['yogurt','sugar'], calories:300}, dinner:{name:'Tandoori Chicken', items:['chicken','rice','butter'], calories:720}},
    { day:'Sunday',    breakfast:{name:'Poha + Peanuts', items:['poha','peanuts'], calories:560}, lunch:{name:'Fish Fry Plate', items:['fish','rice','veg','oil'], calories:760}, snack:{name:'Peanut Butter Toast', items:['pb','bread'], calories:320}, dinner:{name:'Egg Curry', items:['4 eggs','rice','ghee'], calories:720}},
  ]
}

export function useMealPlanner() {

  const isMealPlanQuery = useCallback((text) => {
    const t = text.toLowerCase()
    const direct = [
      'meal plan','meal planner','diet plan','weekly diet','weekly meal',
      '7 day','seven day','food plan','diet chart','what should i eat',
      'plan my meals','plan my diet','खाना','डाइट',
    ]
    if (direct.some(k => t.includes(k))) return true
    const planWords = ['plan','suggest','create','make','give','prepare','design','help me with']
    const foodWords = ['meal','meals','food','diet','eating','eat','menu','nutrition']
    if (planWords.some(w => t.includes(w)) && foodWords.some(w => t.includes(w))) return true
    const weekWords = ['week','weekly','daily','everyday','each day','per day']
    if (weekWords.some(w => t.includes(w)) && foodWords.some(w => t.includes(w))) return true
    return false
  }, [])

  const generateMealPlan = useCallback(async (transcript, apiKey) => {
    const t = transcript.toLowerCase()

    const nonVegSignals = ['non veg','non-veg','non vegetarian','non-vegetarian','chicken','fish','egg','meat','prawn','mutton']
    const veganSignals   = ['vegan','plant based','plant-based','no dairy','no eggs']
    const vegSignals     = ['vegetarian','veg ',"veg.",'veg diet','no meat','no chicken','no fish','no egg','paneer']

    const isNonVeg   = nonVegSignals.some(k => t.includes(k))
    const isVegan    = veganSignals.some(k => t.includes(k))
    const isVeg      = !isNonVeg && !isVegan && vegSignals.some(k => t.includes(k))

    const diet = isVegan ? 'vegan' : isNonVeg ? 'non-vegetarian' : isVeg ? 'vegetarian' : 'non-vegetarian'

    const isWeightLoss = t.includes('lose weight') || t.includes('weight loss') || t.includes('slim') || t.includes('deficit')
    const isMuscle    = t.includes('muscle') || t.includes('protein') || t.includes('gym') || t.includes('workout') || t.includes('bulk') || t.includes('high calorie') || t.includes('mass')
    const isDiabetic  = t.includes('diabet') || t.includes('sugar')

    const goal = isWeightLoss ? 'weight loss (low calorie ~1400-1600 kcal/day)'
      : isMuscle ? 'muscle building (high calorie ~2400-2800 kcal/day)'
      : isDiabetic ? 'diabetes management (low glycemic index, controlled carbs)'
      : 'balanced healthy living (~1800-2000 kcal/day)'

    const minCalories = isMuscle ? 2200 : isWeightLoss ? 1400 : 1700
    const maxCalories = isMuscle ? 2800 : isWeightLoss ? 1700 : 2400

    const callGroq = async () => {
      if (!apiKey) throw new Error('missing-key')
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2200,
          temperature: 0.35,
          messages: [
            {
              role: 'system',
              content: `You are an Indian sports nutritionist. Generate a 7-day meal plan.
CRITICAL: Return ONLY raw JSON. No markdown or backticks.
Format:
{"goal":"string","diet":"string","calories":"string","days":[{"day":"Monday","breakfast":{"name":"string","items":["item1","item2"],"calories":300},"lunch":{"name":"string","items":["item1","item2"],"calories":450},"snack":{"name":"string","items":["item1"],"calories":150},"dinner":{"name":"string","items":["item1","item2"],"calories":400}}]}
Rules:
- Exactly 7 days.
- Keep item names <= 3 words.
- Target daily calories between ${minCalories} and ${maxCalories}. Prefer upper end for muscle building/high calorie.
- Ensure protein is high for muscle requests.`
            },
            { role: 'user', content: `7-day ${diet} Indian meal plan for ${goal}.` }
          ]
        })
      })
      if (!r.ok) throw new Error(`Groq API ${r.status}`)
      return await r.json()
    }

    const validateAndClamp = (plan) => {
      if (!plan?.days?.length) return null
      plan.days = plan.days.slice(0, 7)
      const parsedCals = Number(String(plan.calories || '').replace(/[^\d]/g,'')) || minCalories
      const clamped = Math.min(Math.max(parsedCals, minCalories), maxCalories)
      plan.calories = `${clamped} kcal/day`
      return plan
    }

    let plan = null
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const data = await callGroq()
        const raw  = data.choices?.[0]?.message?.content?.trim()
        if (!raw) continue
        const cleaned = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```$/,'').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (!jsonMatch) continue
        const parsed = JSON.parse(jsonMatch[0])
        const ok = validateAndClamp(parsed)
        if (ok) { plan = ok; break }
      } catch (e) {
        if (attempt === 1) throw e
      }
    }

    if (!plan) {
      return { ...OFFLINE_PLAN, diet, goal }
    }
    return plan
  }, [])

  const buildMealText = useCallback((plan) => {
    const day1 = plan.days[0]
    return `I've created a 7-day ${plan.diet} meal plan for ${plan.goal}. Calories: ${plan.calories}. ${plan.days[0].day} breakfast: ${day1.breakfast.name}. Lunch: ${day1.lunch.name}. Dinner: ${day1.dinner.name}. Swipe to view all days.`
  }, [])

  return { isMealPlanQuery, generateMealPlan, buildMealText }
}