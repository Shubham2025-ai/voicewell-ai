import { useCallback } from 'react'

/**
 * useNutrition — fetches nutrition data from Open Food Facts API.
 * Free, no API key needed, covers Indian + global foods.
 *
 * Detects nutrition queries from user speech and returns structured data
 * that renders as a NutritionCard inside the chat bubble.
 */

// Common foods with pre-set data (covers most demo queries instantly)
const FOOD_DB = {
  rice:        { name: 'Rice (cooked, 1 cup)', calories: 206, protein: 4.3, carbs: 44.5, fat: 0.4 },
  'brown rice': { name: 'Brown Rice (cooked, 1 cup)', calories: 216, protein: 5, carbs: 44, fat: 1.8 },
  roti:        { name: 'Roti / Chapati (1 piece)', calories: 104, protein: 3.1, carbs: 18, fat: 2.5 },
  dal:         { name: 'Dal (cooked, 1 cup)', calories: 230, protein: 18, carbs: 40, fat: 0.9 },
  chicken:     { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  egg:         { name: 'Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  banana:      { name: 'Banana (1 medium)', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  apple:       { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  milk:        { name: 'Milk (1 cup, whole)', calories: 149, protein: 8, carbs: 12, fat: 8 },
  paneer:      { name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 3.6, fat: 20 },
  oats:        { name: 'Oats (cooked, 1 cup)', calories: 166, protein: 5.9, carbs: 28, fat: 3.6 },
  'peanut butter': { name: 'Peanut Butter (2 tbsp)', calories: 188, protein: 8, carbs: 6, fat: 16 },
  almonds:     { name: 'Almonds (1 oz / 23 nuts)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  dahi:        { name: 'Dahi / Yogurt (1 cup)', calories: 154, protein: 8.5, carbs: 17, fat: 3.8 },
  idli:        { name: 'Idli (2 pieces)', calories: 132, protein: 4.6, carbs: 26, fat: 0.5 },
  dosa:        { name: 'Dosa (1 plain)', calories: 168, protein: 3.9, carbs: 27, fat: 5.4 },
  samosa:      { name: 'Samosa (1 piece)', calories: 262, protein: 3.5, carbs: 28, fat: 15 },
  maggi:       { name: 'Maggi Noodles (1 packet)', calories: 350, protein: 7, carbs: 50, fat: 14 },
  'whey protein': { name: 'Whey Protein (1 scoop)', calories: 120, protein: 25, carbs: 3, fat: 1.5 },
}

// Keywords that indicate a nutrition query
const NUTRITION_KEYWORDS = [
  'calories', 'calorie', 'nutrition', 'protein', 'carbs', 'fat', 'macro',
  'nutritional', 'how much', 'nutrient', 'diet', 'caloric',
  'खाने में', 'कैलोरी', 'प्रोटीन',
]

const FOOD_NAMES = Object.keys(FOOD_DB)

export function useNutrition() {

  /** Returns true if the text is asking about nutrition */
  const isNutritionQuery = useCallback((text) => {
    const t = text.toLowerCase()
    return NUTRITION_KEYWORDS.some(k => t.includes(k)) ||
           (FOOD_NAMES.some(f => t.includes(f)) &&
            (t.includes('eat') || t.includes('have') || t.includes('in') || t.includes('contains')))
  }, [])

  /** Extracts food name from text and returns nutrition data */
  const getNutrition = useCallback(async (text) => {
    const t = text.toLowerCase()

    // Check local DB first (instant, no API call)
    for (const food of FOOD_NAMES) {
      if (t.includes(food)) {
        return { ...FOOD_DB[food], source: 'local' }
      }
    }

    // Fallback: try Open Food Facts search API
    try {
      // Extract likely food word (noun after "in" or "of" or "about")
      const match = t.match(/(?:in|of|about|for)\s+([a-z\s]+?)(?:\?|$|\s+calories|\s+nutrition)/)
      const query = match ? match[1].trim() : t.replace(/calories|nutrition|protein|carbs|fat|how much|in|of|about/gi, '').trim()

      if (!query || query.length < 2) return null

      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`
      const res  = await fetch(url)
      if (!res.ok) return null

      const data    = await res.json()
      const product = data?.products?.[0]
      if (!product?.nutriments) return null

      const n = product.nutriments
      return {
        name:     product.product_name || query,
        calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
        protein:  Math.round((n['proteins_100g'] || 0) * 10) / 10,
        carbs:    Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
        fat:      Math.round((n['fat_100g'] || 0) * 10) / 10,
        source:   'openfoodfacts',
      }
    } catch {
      return null
    }
  }, [])

  /** Build a voice-friendly text summary from nutrition data */
  const buildNutritionText = useCallback((data) => {
    if (!data) return null
    return `${data.name} has about ${data.calories} calories, ${data.protein}g protein, ${data.carbs}g carbs, and ${data.fat}g fat per serving.`
  }, [])

  return { isNutritionQuery, getNutrition, buildNutritionText }
}