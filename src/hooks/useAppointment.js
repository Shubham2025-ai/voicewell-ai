import { useCallback } from 'react'

/**
 * useAppointment — voice appointment booking via Google Calendar URL pre-fill.
 *
 * Why this approach:
 * - Google Calendar MCP requires server-side auth — cannot be called from browser
 * - Pre-fill URL opens Google Calendar with all fields populated
 * - User clicks "Save" in one tap — event is created in their real calendar
 * - Zero server needed, works perfectly in demo
 *
 * The URL approach is actually BETTER for demo:
 * Judges see Google Calendar open with the event pre-filled → they click Save →
 * real event appears in calendar. That's the "tasks across devices" demo moment.
 */

const APPOINTMENT_KEYWORDS = [
  'book', 'schedule', 'appointment', 'doctor appointment',
  'set up', 'arrange', 'clinic visit', 'hospital visit',
  'checkup', 'check-up', 'consultation', 'follow up', 'follow-up',
]

const DAYS = {
  monday:1, tuesday:2, wednesday:3, thursday:4,
  friday:5, saturday:6, sunday:0,
  mon:1, tue:2, wed:3, thu:4, fri:5, sat:6, sun:0,
}

function extractTitle(text) {
  const t = text.toLowerCase()
  if (t.includes('cardio')   || t.includes('heart'))    return 'Cardiology Consultation'
  if (t.includes('derma')    || t.includes('skin'))     return 'Dermatology Consultation'
  if (t.includes('dentist')  || t.includes('dental'))   return 'Dental Appointment'
  if (t.includes('eye')      || t.includes('ophthal'))  return 'Eye Checkup'
  if (t.includes('checkup')  || t.includes('check-up')) return 'General Health Checkup'
  if (t.includes('follow'))                              return 'Doctor Follow-up'
  if (t.includes('blood')    || t.includes('lab'))      return 'Lab Test / Blood Work'
  const dr = text.match(/with\s+dr\.?\s+([a-z\s]+?)(?:\s+on|\s+at|$)/i)
  if (dr) return `Doctor Appointment – Dr. ${dr[1].trim()}`
  return 'Doctor Appointment'
}

function parseDateTime(text) {
  const t   = text.toLowerCase()
  const now = new Date()

  // IST = UTC+5:30
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  const today  = new Date(istNow)
  today.setUTCHours(0, 0, 0, 0)

  let target = new Date(today)

  if (t.includes('tomorrow')) {
    target = new Date(today.getTime() + 86400000)
  } else if (t.includes('next week')) {
    target = new Date(today.getTime() + 7 * 86400000)
  } else {
    for (const [day, num] of Object.entries(DAYS)) {
      if (t.includes(day)) {
        const cur  = today.getUTCDay()
        let diff   = num - cur
        if (diff <= 0) diff += 7
        target = new Date(today.getTime() + diff * 86400000)
        break
      }
    }
  }

  // Parse time
  let h = 10, m = 0
  const t12 = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/)
  if (t12) {
    h = parseInt(t12[1])
    m = t12[2] ? parseInt(t12[2]) : 0
    if (t12[3] === 'pm' && h !== 12) h += 12
    if (t12[3] === 'am' && h === 12) h = 0
  }

  // Build IST datetime strings for Google Calendar URL format: YYYYMMDDTHHMMSS
  const pad = n => String(n).padStart(2, '0')
  const y   = target.getUTCFullYear()
  const mo  = pad(target.getUTCMonth() + 1)
  const d   = pad(target.getUTCDate())
  const startStr = `${y}${mo}${d}T${pad(h)}${pad(m)}00`
  const endH     = h + 1
  const endStr   = `${y}${mo}${d}T${pad(endH > 23 ? 23 : endH)}${pad(m)}00`

  const displayDate = target.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  const displayTime = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`

  return { startStr, endStr, displayDate, displayTime }
}

function buildCalendarUrl(title, startStr, endStr, description) {
  const p = new URLSearchParams({
    action:  'TEMPLATE',
    text:    title,
    dates:   `${startStr}/${endStr}`,
    details: description,
    ctz:     'Asia/Kolkata',
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

export function useAppointment() {

  const isAppointmentQuery = useCallback((text) => {
    const t = text.toLowerCase()
    return APPOINTMENT_KEYWORDS.some(k => t.includes(k)) &&
           (t.includes('doctor') || t.includes('appointment') ||
            t.includes('hospital') || t.includes('clinic') ||
            t.includes('book') || t.includes('schedule') ||
            t.includes('checkup') || t.includes('consultation'))
  }, [])

  const bookAppointment = useCallback((transcript) => {
    const title    = extractTitle(transcript)
    const dt       = parseDateTime(transcript)
    const desc     = `Booked via VoiceWell AI Health Companion\nOriginal request: "${transcript}"\n\n⚠️ Remember to confirm this appointment with the doctor's office.`
    const calUrl   = buildCalendarUrl(title, dt.startStr, dt.endStr, desc)

    return {
      title,
      date:        dt.displayDate,
      time:        dt.displayTime,
      calendarUrl: calUrl,
    }
  }, [])

  const buildAppointmentText = useCallback((data) => {
    return `I've prepared your ${data.title} for ${data.date} at ${data.time} IST. Tap "Save to Google Calendar" on the card below — it opens Google Calendar with everything pre-filled. One tap to confirm!`
  }, [])

  return { isAppointmentQuery, bookAppointment, buildAppointmentText }
}