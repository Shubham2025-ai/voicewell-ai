import { useCallback } from 'react'

/**
 * useBMI — detects and calculates BMI from voice input.
 * No API needed — pure math.
 */

const BMI_KEYWORDS = [
  'bmi', 'body mass', 'weight', 'height', 'kg', 'kilogram',
  'feet', 'foot', 'inch', 'cm', 'centimeter', 'calculate my',
  'am i overweight', 'am i obese', 'healthy weight',
]

const BMI_CALC_TRIGGERS = [
  'bmi', 'body mass index', 'am i overweight', 'am i obese',
  'healthy weight', 'calculate my weight', 'my weight is',
  'i weigh', 'i am', 'i\'m',
]

export function useBMI() {

  const isBMIQuery = useCallback((text) => {
    const t = text.toLowerCase()
    const hasBMI = t.includes('bmi') || t.includes('body mass') ||
                   t.includes('overweight') || t.includes('obese') ||
                   t.includes('healthy weight')
    const hasWeightHeight = (t.includes('kg') || t.includes('kilo') || t.includes('pound') || t.includes('lbs') || t.includes('weigh')) &&
                            (t.includes('cm') || t.includes('feet') || t.includes('foot') || t.includes('tall') || t.includes('height'))
    return hasBMI || hasWeightHeight
  }, [])

  const calculateBMI = useCallback((text) => {
    const t = text.toLowerCase()
    let weightKg = null
    let heightCm = null

    // Extract weight in kg
    const kgMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram)/)
    if (kgMatch) weightKg = parseFloat(kgMatch[1])

    // Extract weight in lbs
    const lbsMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound)/)
    if (lbsMatch) weightKg = parseFloat(lbsMatch[1]) * 0.453592

    // Extract height in cm
    const cmMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimeter|centimetre)/)
    if (cmMatch) heightCm = parseFloat(cmMatch[1])

    // Extract height in feet + inches: "5 foot 8", "5'8", "5 feet 8 inches"
    const ftInMatch = t.match(/(\d+)\s*(?:foot|feet|ft|')\s*(\d+)\s*(?:inch|inches|in|")?/)
    if (ftInMatch) {
      heightCm = (parseFloat(ftInMatch[1]) * 30.48) + (parseFloat(ftInMatch[2]) * 2.54)
    }

    // Extract height in feet only: "5.8 feet", "6 feet"
    const ftMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:foot|feet|ft)(?!\s*\d)/)
    if (ftMatch && !ftInMatch) {
      heightCm = parseFloat(ftMatch[1]) * 30.48
    }

    if (!weightKg || !heightCm) return null

    const heightM = heightCm / 100
    const bmi     = weightKg / (heightM * heightM)
    const bmiRound = Math.round(bmi * 10) / 10

    let category, color, advice
    if (bmi < 18.5) {
      category = 'Underweight'; color = '#60a5fa'
      advice = 'Consider consulting a doctor or nutritionist. A balanced, calorie-rich diet with strength training can help reach a healthy weight.'
    } else if (bmi < 25) {
      category = 'Healthy weight'; color = '#00c27a'
      advice = 'Great! Maintain your current lifestyle with regular exercise and a balanced diet.'
    } else if (bmi < 30) {
      category = 'Overweight'; color = '#f59e0b'
      advice = 'A moderate reduction in calories and 150 minutes of exercise per week can help reach a healthy range.'
    } else {
      category = 'Obese'; color = '#ef4444'
      advice = 'Please consult a doctor for a personalised weight management plan. Small, sustainable changes make a big difference.'
    }

    const idealMin = Math.round(18.5 * heightM * heightM)
    const idealMax = Math.round(24.9 * heightM * heightM)

    return {
      bmi:      bmiRound,
      category,
      color,
      advice,
      weightKg: Math.round(weightKg * 10) / 10,
      heightCm: Math.round(heightCm),
      idealMin,
      idealMax,
    }
  }, [])

  const buildBMIText = useCallback((data) => {
    if (!data) return null
    return `Your BMI is ${data.bmi}, which is in the ${data.category} range. Your ideal weight range for your height is ${data.idealMin} to ${data.idealMax} kg. ${data.advice}`
  }, [])

  return { isBMIQuery, calculateBMI, buildBMIText }
}