import { useCallback } from 'react'

/**
 * useAppointment — voice-to-Google-Calendar appointment booking.
 *
 * How it works:
 * 1. Detects appointment booking intent from voice
 * 2. Extracts date, time, doctor/purpose from transcript using Groq
 * 3. Calls our booking endpoint which uses Google Calendar MCP
 * 4. Returns confirmation with calendar link
 *
 * Since we can't call Google Calendar MCP directly from browser,
 * we use a Groq-powered extraction + show a pre-filled Google Calendar
 * quick-add link that opens in one click — no server needed!
 */

const APPOINTMENT_KEYWORDS = [
  'book', 'schedule', 'appointment', 'doctor appointment', 'meeting',
  'set up', 'fix a', 'arrange', 'remind me to go', 'clinic visit',
  'hospital visit', 'checkup', 'check-up', 'consultation',
]

const DAYS_OF_WEEK = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 0,
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
}

/**
 * Parse date/time from natural language
 * Returns ISO date string for IST (UTC+5:30)
 */
function parseDateTime(text) {
  const t     = text.toLowerCase()
  const now   = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  // Find target date
  let targetDate = new Date(today)

  if (t.includes('tomorrow')) {
    targetDate.setDate(today.getDate() + 1)
  } else if (t.includes('today')) {
    targetDate = new Date(today)
  } else if (t.includes('next week')) {
    targetDate.setDate(today.getDate() + 7)
  } else {
    // Check day of week
    for (const [day, dayNum] of Object.entries(DAYS_OF_WEEK)) {
      if (t.includes(day)) {
        const todayDay = today.getDay()
        let diff = dayNum - todayDay
        if (diff <= 0) diff += 7   // always in the future
        targetDate.setDate(today.getDate() + diff)
        break
      }
    }
  }

  // Find target time
  let hours = 10, minutes = 0  // default 10 AM

  const timeMatch12 = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/)
  if (timeMatch12) {
    hours   = parseInt(timeMatch12[1])
    minutes = timeMatch12[2] ? parseInt(timeMatch12[2]) : 0
    if (timeMatch12[3] === 'pm' && hours !== 12) hours += 12
    if (timeMatch12[3] === 'am' && hours === 12) hours = 0
  }

  // IST offset: UTC+5:30
  const istOffset  = 5.5 * 60  // minutes
  const startLocal = new Date(targetDate)
  startLocal.setHours(hours, minutes, 0, 0)

  const startUTC = new Date(startLocal.getTime() - istOffset * 60 * 1000)
  const endUTC   = new Date(startUTC.getTime() + 60 * 60 * 1000)  // 1 hour

  return {
    startISO:  startUTC.toISOString(),
    endISO:    endUTC.toISOString(),
    startLocal: startLocal,
    displayDate: startLocal.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' }),
    displayTime: startLocal.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true }),
    timeZone:  'Asia/Kolkata',
  }
}

/**
 * Extract appointment title/purpose from text
 */
function extractTitle(text) {
  const t = text.toLowerCase()
  if (t.includes('cardiologist') || t.includes('heart'))      return 'Cardiology Consultation'
  if (t.includes('dermatologist') || t.includes('skin'))      return 'Dermatology Consultation'
  if (t.includes('dentist') || t.includes('dental'))          return 'Dental Appointment'
  if (t.includes('eye') || t.includes('ophthalmologist'))     return 'Eye Checkup'
  if (t.includes('checkup') || t.includes('check-up'))        return 'General Health Checkup'
  if (t.includes('follow up') || t.includes('follow-up'))     return 'Doctor Follow-up'
  if (t.includes('blood test') || t.includes('lab'))          return 'Lab Test / Blood Work'

  // Extract "with Dr. X" pattern
  const drMatch = text.match(/with\s+dr\.?\s+([a-z\s]+?)(?:\s+on|\s+at|\s+for|$)/i)
  if (drMatch) return `Doctor Appointment - Dr. ${drMatch[1].trim()}`

  return 'Doctor Appointment'
}

/**
 * Build Google Calendar quick-add URL
 * Opens pre-filled "Create event" page — user just clicks Save
 */
function buildCalendarUrl(title, startISO, endISO, description) {
  const start = startISO.replace(/[-:]/g, '').replace('.000Z', 'Z')
  const end   = endISO.replace(/[-:]/g, '').replace('.000Z', 'Z')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text:   title,
    dates:  `${start}/${end}`,
    details: description,
    ctz:    'Asia/Kolkata',
  })
  return `https://calendar.google.com/calendar/render?${params}`
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

  const bookAppointment = useCallback(async (transcript, apiKey) => {
    // Parse from voice
    const title       = extractTitle(transcript)
    const dateTime    = parseDateTime(transcript)
    const description = `Booked via VoiceWell AI\nOriginal request: "${transcript}"\n\n⚠️ This is a reminder — please confirm with your doctor's office.`
    const calUrl      = buildCalendarUrl(title, dateTime.startISO, dateTime.endISO, description)

    // Also try to create via Groq-structured extraction for display
    return {
      title,
      date:        dateTime.displayDate,
      time:        dateTime.displayTime,
      startISO:    dateTime.startISO,
      endISO:      dateTime.endISO,
      calendarUrl: calUrl,
      description,
    }
  }, [])

  const buildAppointmentText = useCallback((data) => {
    return `I've prepared a ${data.title} for ${data.date} at ${data.time}. Click the card below to save it to your Google Calendar in one tap.`
  }, [])

  return { isAppointmentQuery, bookAppointment, buildAppointmentText }
}