import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useWaterIntake — tracks daily water intake via voice.
 * - "I drank a glass of water" → logs 250ml
 * - "Log 500ml water" → logs specific amount
 * - "How much water have I had?" → reads back total
 * - Browser notifications every 2 hours to remind drinking
 * - Stores in localStorage, resets daily
 */

const DAILY_GOAL_ML  = 2500  // 2.5L recommended
const GLASS_ML       = 250   // 1 glass = 250ml
const REMINDER_INTERVAL_MS = 2 * 60 * 60 * 1000  // 2 hours

const WATER_LOG_KEY  = 'vw_water_log'
const WATER_DATE_KEY = 'vw_water_date'

const WATER_KEYWORDS = [
  'water', 'drank', 'drink', 'glass', 'bottle', 'hydrat',
  'fluid', 'intake', 'ml', 'litre', 'liter', 'how much water',
  'water intake', 'पानी',
]

const WATER_LOG_TRIGGERS = [
  'drank', 'drink', 'had', 'consumed', 'log', 'drank a glass',
  'drank water', 'drank a bottle', 'had water',
]

function getTodayKey() {
  return new Date().toLocaleDateString('en-IN')
}

function loadTodayLog() {
  const savedDate = localStorage.getItem(WATER_DATE_KEY)
  const today     = getTodayKey()
  if (savedDate !== today) {
    // New day — reset
    localStorage.setItem(WATER_DATE_KEY, today)
    localStorage.setItem(WATER_LOG_KEY, JSON.stringify([]))
    return []
  }
  try {
    return JSON.parse(localStorage.getItem(WATER_LOG_KEY) || '[]')
  } catch { return [] }
}

function saveLog(log) {
  localStorage.setItem(WATER_DATE_KEY, getTodayKey())
  localStorage.setItem(WATER_LOG_KEY, JSON.stringify(log))
}

function extractAmount(text) {
  const t = text.toLowerCase()
  // Specific ml amount: "500ml", "500 ml"
  const mlMatch = t.match(/(\d+(?:\.\d+)?)\s*ml/)
  if (mlMatch) return Math.round(parseFloat(mlMatch[1]))

  // Litres: "1.5 litre", "2 liter"
  const lMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:litre|liter|l\b)/)
  if (lMatch) return Math.round(parseFloat(lMatch[1]) * 1000)

  // Glasses: "2 glasses", "a glass"
  const glassMatch = t.match(/(\d+)\s*glass/)
  if (glassMatch) return parseInt(glassMatch[1]) * GLASS_ML
  if (t.includes('a glass') || t.includes('one glass')) return GLASS_ML

  // Bottle: "a bottle", "2 bottles"
  const bottleMatch = t.match(/(\d+)\s*bottle/)
  if (bottleMatch) return parseInt(bottleMatch[1]) * 500
  if (t.includes('a bottle')) return 500

  // Cup: "a cup"
  if (t.includes('cup')) return 200

  // Default: 1 glass
  return GLASS_ML
}

function isCheckingWater(text) {
  const t = text.toLowerCase()
  return (t.includes('how much water') || t.includes('water intake') ||
          t.includes('how many glasses') || t.includes('water today') ||
          t.includes('water have i') || t.includes('hydration')) &&
         !WATER_LOG_TRIGGERS.some(k => t.includes(k))
}

function isLoggingWater(text) {
  const t = text.toLowerCase()
  return WATER_LOG_TRIGGERS.some(k => t.includes(k)) && t.includes('water') ||
         t.match(/log\s+\d+\s*ml/) ||
         t.includes('drank a glass') || t.includes('had a glass') ||
         t.includes('drank a bottle') || t.includes('drank water')
}

export function useWaterIntake() {
  const [log,     setLog]     = useState(() => loadTodayLog())
  const timerRef              = useRef(null)
  const [notifOk, setNotifOk] = useState(false)

  const total = log.reduce((sum, e) => sum + e.amount, 0)
  const pct   = Math.min(Math.round((total / DAILY_GOAL_ML) * 100), 100)

  // Request notification permission + start reminder timer
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => setNotifOk(p === 'granted'))
    }
    if (Notification.permission === 'granted') setNotifOk(true)

    timerRef.current = setInterval(() => {
      const currentLog  = loadTodayLog()
      const currentTotal = currentLog.reduce((s, e) => s + e.amount, 0)
      if (currentTotal < DAILY_GOAL_ML && notifOk) {
        new Notification('💧 VoiceWell — Hydration Reminder', {
          body: `You've had ${currentTotal}ml today. Goal: ${DAILY_GOAL_ML}ml. Time to drink some water!`,
          icon: '/favicon.ico',
        })
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(`Hydration reminder! You've had ${Math.round(currentTotal/250)} glasses of water today. Try to drink some more!`)
          u.rate = 0.9
          window.speechSynthesis.speak(u)
        }
      }
    }, REMINDER_INTERVAL_MS)

    return () => clearInterval(timerRef.current)
  }, [notifOk])

  const isWaterQuery = useCallback((text) => {
    const t = text.toLowerCase()
    return WATER_KEYWORDS.some(k => t.includes(k))
  }, [])

  const logWater = useCallback((transcript) => {
    const amount  = extractAmount(transcript)
    const entry   = { amount, time: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }), id: Date.now() }
    const newLog  = [...loadTodayLog(), entry]
    saveLog(newLog)
    setLog(newLog)
    const newTotal = newLog.reduce((s, e) => s + e.amount, 0)
    const newPct   = Math.min(Math.round((newTotal / DAILY_GOAL_ML) * 100), 100)
    return { amount, newTotal, newPct, glasses: Math.round(newTotal / 250), goalMl: DAILY_GOAL_ML }
  }, [])

  const getStatus = useCallback(() => {
    return { total, pct, glasses: Math.round(total / 250), goalMl: DAILY_GOAL_ML, log }
  }, [total, pct, log])

  const buildWaterText = useCallback((data, type) => {
    if (type === 'log') {
      const left = Math.max(0, data.goalMl - data.newTotal)
      if (data.newTotal >= data.goalMl) {
        return `Great job! You've hit your daily water goal of ${data.goalMl}ml. You've had ${data.glasses} glasses today. Stay hydrated!`
      }
      return `Logged ${data.amount}ml of water. You've had ${data.newTotal}ml today — ${data.newPct}% of your daily goal. About ${Math.ceil(left/250)} more glasses to go!`
    }
    // status check
    if (data.total === 0) return "You haven't logged any water today. Try to drink at least 8 glasses — about 2 litres — throughout the day."
    if (data.total >= data.goalMl) return `Amazing! You've reached your daily water goal with ${data.glasses} glasses (${data.total}ml). Keep it up!`
    const left = data.goalMl - data.total
    return `You've had ${data.glasses} glasses (${data.total}ml) today — ${data.pct}% of your ${data.goalMl}ml goal. Try to drink ${Math.ceil(left/250)} more glasses.`
  }, [])

  return { isWaterQuery, isLoggingWater, isCheckingWater, logWater, getStatus, buildWaterText, total, pct, log, goalMl: DAILY_GOAL_ML }
}