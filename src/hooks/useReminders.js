import { useState, useEffect, useRef } from 'react'

/**
 * useReminders — fixed time parsing:
 * - Single-pass regex: matches "HH:MM AM/PM" first, then "H AM/PM" only if not already captured
 * - Normalises to 24h "HH:MM" for reliable notification matching
 * - Checks every 30s, fires once per day per reminder
 * - Speaks reminder aloud + browser notification
 */

// ── Firebase lazy init ────────────────────────────────────────────────────────
let db = null
async function getDB() {
  if (db) return db
  const apiKey    = import.meta.env.VITE_FIREBASE_API_KEY
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  const appId     = import.meta.env.VITE_FIREBASE_APP_ID
  if (!apiKey || !projectId || !appId) return null
  try {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getFirestore }           = await import('firebase/firestore')
    const cfg = { apiKey, projectId, appId,
      authDomain:    `${projectId}.firebaseapp.com`,
      storageBucket: `${projectId}.appspot.com`,
    }
    const app = getApps().length ? getApps()[0] : initializeApp(cfg)
    db = getFirestore(app)
    return db
  } catch { return null }
}

// ── Session ID ────────────────────────────────────────────────────────────────
const SESSION_ID = (() => {
  let id = localStorage.getItem('vw_session')
  if (!id) { id = 'session_' + Math.random().toString(36).slice(2,10); localStorage.setItem('vw_session', id) }
  return id
})()

// ── Mock storage ──────────────────────────────────────────────────────────────
const MOCK_KEY = 'vw_reminders'
const mockStore = {
  getAll: ()    => JSON.parse(localStorage.getItem(MOCK_KEY) || '[]'),
  add:    (r)   => { const a = mockStore.getAll(); a.push(r); localStorage.setItem(MOCK_KEY, JSON.stringify(a)) },
  remove: (id)  => { const a = mockStore.getAll().filter(r => r.id !== id); localStorage.setItem(MOCK_KEY, JSON.stringify(a)) },
}

// ── Time helpers ──────────────────────────────────────────────────────────────

/** Convert any time string → "HH:MM" 24h. Returns null if unparseable. */
function to24h(raw) {
  if (!raw) return null
  const s = raw.trim().toUpperCase().replace(/\s+/g, ' ')

  // "HH:MM AM/PM"
  const m1 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
  if (m1) {
    let h = parseInt(m1[1]), min = m1[2], p = m1[3]
    if (p === 'AM' && h === 12) h = 0
    if (p === 'PM' && h !== 12) h += 12
    return `${String(h).padStart(2,'0')}:${min}`
  }

  // "H AM/PM" (no minutes)
  const m2 = s.match(/^(\d{1,2})\s*(AM|PM)$/)
  if (m2) {
    let h = parseInt(m2[1]), p = m2[2]
    if (p === 'AM' && h === 12) h = 0
    if (p === 'PM' && h !== 12) h += 12
    return `${String(h).padStart(2,'0')}:00`
  }

  // "HH:MM" plain 24h
  const m3 = s.match(/^(\d{1,2}):(\d{2})$/)
  if (m3) return `${m3[1].padStart(2,'0')}:${m3[2]}`

  return null
}

/** Current time as "HH:MM" 24h */
function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

/** Today as "YYYY-MM-DD" */
function todayStr() { return new Date().toISOString().slice(0,10) }

// ── Parse natural language reminder ──────────────────────────────────────────
export function parseReminderText(text) {
  const t = text.toLowerCase()

  // ── Step 1: Extract medication name ───────────────────────────────────────
  // Try multiple patterns in priority order
  let medication = 'medication'

  // Pattern A: "remind me to take X at ..."  OR  "take X at ..."
  const pA = t.match(/(?:remind\s+me\s+to\s+take|to\s+take|take)\s+(my\s+)?([a-z0-9][a-z0-9 ]{1,30}?)(?:\s+at\b|\s+every\b|\s+daily\b|\s+tonight|\s+today|\s+tomorrow|$)/i)
  if (pA) medication = pA[2].trim()

  // Pattern B: "reminder for X at ..." OR "set reminder for X"
  else {
    const pB = t.match(/reminder\s+(?:for|to\s+take)\s+(my\s+)?([a-z0-9][a-z0-9 ]{1,30}?)(?:\s+at\b|\s+every\b|\s+daily\b|$)/i)
    if (pB) medication = pB[2].trim()
  }

  // Clean up medication name
  medication = medication.replace(/\b(my|the|a|an)\b/g, '').replace(/\s+/g, ' ').trim()
  if (!medication || medication.length < 2) medication = 'medication'

  // ── Step 2: Extract times ─────────────────────────────────────────────────
  const wordMap = {
    morning:   '8:00 AM',
    afternoon: '2:00 PM',
    evening:   '6:00 PM',
    night:     '9:00 PM',
    tonight:   '9:00 PM',
    noon:      '12:00 PM',
    lunch:     '12:00 PM',
    midnight:  '12:00 AM',
  }

  const times   = []
  const seen24h = new Set()

  // Single regex — H:MM AM/PM MUST come before H AM/PM to avoid partial match
  const timeRe = /\b(\d{1,2}:\d{2}\s*(?:am|pm)|\d{1,2}\s*(?:am|pm))\b/gi
  let match
  while ((match = timeRe.exec(text)) !== null) {
    const raw  = match[1].trim()
    const norm = to24h(raw)
    if (norm && !seen24h.has(norm)) {
      seen24h.add(norm)
      times.push(raw.replace(/\s+/g, ' ').toUpperCase())
    }
  }

  // Word-based times
  for (const [word, val] of Object.entries(wordMap)) {
    if (t.includes(word)) {
      const norm = to24h(val)
      if (norm && !seen24h.has(norm)) {
        seen24h.add(norm)
        times.push(val)
      }
    }
  }

  if (times.length === 0) times.push('8:00 AM')
  return { medication, times }
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useReminders() {
  const [reminders,    setReminders]    = useState([])
  const [isMockMode,   setIsMockMode]   = useState(true)
  const [notifGranted, setNotifGranted] = useState(false)
  const firedRef                        = useRef({})   // fired-today cache

  useEffect(() => { loadReminders(); askNotifPermission() }, [])

  // Check every 30s
  useEffect(() => {
    const id = setInterval(() => checkDue(reminders), 30_000)
    return () => clearInterval(id)
  }, [reminders, notifGranted])

  // ── Load ──────────────────────────────────────────────────────────────────
  async function loadReminders() {
    const firedb = await getDB()
    if (!firedb) { setIsMockMode(true); setReminders(mockStore.getAll()); return }
    setIsMockMode(false)
    try {
      const { collection, getDocs } = await import('firebase/firestore')
      const snap = await getDocs(collection(firedb, 'sessions', SESSION_ID, 'reminders'))
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setReminders(mockStore.getAll()) }
  }

  // ── Add ───────────────────────────────────────────────────────────────────
  async function addReminder(medication, times) {
    const r = { id: Date.now().toString(), medication, times, createdAt: new Date().toISOString() }
    const firedb = await getDB()
    if (firedb) {
      try {
        const { collection, addDoc } = await import('firebase/firestore')
        const ref = await addDoc(collection(firedb, 'sessions', SESSION_ID, 'reminders'), r)
        r.id = ref.id
      } catch { mockStore.add(r) }
    } else { mockStore.add(r) }
    setReminders(prev => [...prev, r])
    return r
  }

  // ── Remove ────────────────────────────────────────────────────────────────
  async function removeReminder(id) {
    const firedb = await getDB()
    if (firedb) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore')
        await deleteDoc(doc(firedb, 'sessions', SESSION_ID, 'reminders', id))
      } catch {}
    } else { mockStore.remove(id) }
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  // ── Notification permission ───────────────────────────────────────────────
  async function askNotifPermission() {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') { setNotifGranted(true); return }
    if (Notification.permission !== 'denied') {
      const p = await Notification.requestPermission()
      setNotifGranted(p === 'granted')
    }
  }

  // ── Check due reminders ───────────────────────────────────────────────────
  function checkDue(currentReminders) {
    const now   = nowHHMM()
    const today = todayStr()

    currentReminders.forEach(r => {
      r.times.forEach(t => {
        const norm = to24h(t)
        if (!norm) return

        const key = `${r.id}_${norm}_${today}`
        if (firedRef.current[key]) return   // already fired today

        if (norm === now) {
          firedRef.current[key] = true

          // Browser notification
          if (notifGranted) {
            new Notification('💊 VoiceWell Reminder', {
              body: `Time to take your ${r.medication}!`,
              icon: '/favicon.ico',
            })
          }

          // Voice alert
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
            const u = new SpeechSynthesisUtterance(
              `Reminder! Time to take your ${r.medication}.`
            )
            u.rate = 0.9
            window.speechSynthesis.speak(u)
          }
        }
      })
    })
  }

  return { reminders, isMockMode, notifGranted, addReminder, removeReminder, parseReminderText, loadReminders }
}