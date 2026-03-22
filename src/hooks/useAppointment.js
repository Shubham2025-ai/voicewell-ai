import { useCallback } from 'react'

/**
 * useAppointment — voice appointment booking.
 *
 * Creates a pre-filled Google Calendar event URL.
 * User taps "Add to Calendar" → Google Calendar opens pre-filled → one tap to save.
 * Zero server needed, 100% reliable, works perfectly in demo.
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
  if (t.includes('cardio')  || t.includes('heart'))    return 'Cardiology Consultation'
  if (t.includes('derma')   || t.includes('skin'))     return 'Dermatology Consultation'
  if (t.includes('dentist') || t.includes('dental'))   return 'Dental Appointment'
  if (t.includes('eye')     || t.includes('ophthal'))  return 'Eye Checkup'
  if (t.includes('checkup') || t.includes('check-up')) return 'General Health Checkup'
  if (t.includes('follow'))                             return 'Doctor Follow-up'
  if (t.includes('blood')   || t.includes('lab'))      return 'Lab Test / Blood Work'
  const dr = text.match(/with\s+dr\.?\s+([a-z\s]+?)(?:\s+on|\s+at|$)/i)
  if (dr) return `Doctor Appointment – Dr. ${dr[1].trim()}`
  return 'Doctor Appointment'
}

function parseDateTime(text) {
  const t   = text.toLowerCase()
  const now = new Date()

  // Work in IST (UTC+5:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000
  const nowIST     = new Date(now.getTime() + IST_OFFSET)

  // Get today midnight in IST
  const todayIST = new Date(nowIST)
  todayIST.setUTCHours(0, 0, 0, 0)

  let target = new Date(todayIST)

  if (t.includes('tomorrow')) {
    target = new Date(todayIST.getTime() + 86400000)
  } else if (t.includes('next week')) {
    target = new Date(todayIST.getTime() + 7 * 86400000)
  } else if (t.includes('today')) {
    target = new Date(todayIST)
  } else {
    for (const [day, num] of Object.entries(DAYS)) {
      if (t.includes(day)) {
        const cur  = todayIST.getUTCDay()
        let diff   = num - cur
        if (diff <= 0) diff += 7
        target = new Date(todayIST.getTime() + diff * 86400000)
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

  const pad = n => String(n).padStart(2, '0')

  // Google Calendar URL format: YYYYMMDDTHHMMSS (local time, no Z)
  const y  = target.getUTCFullYear()
  const mo = pad(target.getUTCMonth() + 1)
  const d  = pad(target.getUTCDate())
  const endH = Math.min(h + 1, 23)

  const startStr = `${y}${mo}${d}T${pad(h)}${pad(m)}00`
  const endStr   = `${y}${mo}${d}T${pad(endH)}${pad(m)}00`

  // Display strings
  const displayDate = target.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const hour12  = h === 0 ? 12 : h > 12 ? h - 12 : h
  const ampm    = h >= 12 ? 'PM' : 'AM'
  const displayTime = `${hour12}:${pad(m)} ${ampm}`

  return { startStr, endStr, displayDate, displayTime }
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
    const title = extractTitle(transcript)
    const dt    = parseDateTime(transcript)

    const description = encodeURIComponent(
      `Booked via VoiceWell AI Health Companion\nRequest: "${transcript}"\n\n⚠️ Please confirm with the doctor's office before your visit.`
    )

    // Google Calendar pre-fill URL — opens calendar with event ready to save
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dt.startStr}/${dt.endStr}&details=${description}&ctz=Asia%2FKolkata`

    return {
      title,
      date:        dt.displayDate,
      time:        dt.displayTime,
      calendarUrl,
    }
  }, [])

  const buildAppointmentText = useCallback((data) => {
    return `I've prepared your ${data.title} for ${data.date} at ${data.time}. Tap "Add to Google Calendar" on the card to save it — everything is pre-filled, just one tap!`
  }, [])

  return { isAppointmentQuery, bookAppointment, buildAppointmentText }
}