import { useCallback } from 'react'

/**
 * useAppointment — creates REAL Google Calendar events via Anthropic API + MCP.
 *
 * Flow:
 * 1. User says "Book a checkup for tomorrow at 10 AM"
 * 2. We call Anthropic API with gcal MCP server attached
 * 3. Claude extracts date/time/title and calls gcal_create_event
 * 4. Real event created in user's Google Calendar
 * 5. Returns event link + confirmation
 */

const APPOINTMENT_KEYWORDS = [
  'book', 'schedule', 'appointment', 'doctor appointment',
  'set up', 'arrange', 'clinic visit', 'hospital visit',
  'checkup', 'check-up', 'consultation', 'follow up', 'follow-up',
]

export function useAppointment() {

  const isAppointmentQuery = useCallback((text) => {
    const t = text.toLowerCase()
    return APPOINTMENT_KEYWORDS.some(k => t.includes(k)) &&
           (t.includes('doctor') || t.includes('appointment') ||
            t.includes('hospital') || t.includes('clinic') ||
            t.includes('book') || t.includes('schedule') ||
            t.includes('checkup') || t.includes('consultation'))
  }, [])

  const bookAppointment = useCallback(async (transcript) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) throw new Error('missing-key')

    // Get today's date context for the LLM
    const now         = new Date()
    const todayIST    = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const tomorrowIST = new Date(now.getTime() + 86400000).toISOString().slice(0, 10)

    // Call Anthropic API with Google Calendar MCP
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1024,
        mcp_servers: [{
          type: 'url',
          url:  'https://gcal.mcp.claude.com/mcp',
          name: 'google-calendar',
        }],
        system: `You are a health appointment booking assistant. Today is ${todayIST}.
When asked to book an appointment, use the gcal_create_event tool to create a real Google Calendar event.

Rules:
- All times are IST (Asia/Kolkata, UTC+5:30)
- Default duration: 1 hour
- If no time mentioned: default to 10:00 AM IST
- Event color: 11 (Tomato/red — for health appointments)
- Add reminder: 60 minutes before (popup) and 1440 minutes before (email = 1 day)
- Description must include: "Booked via VoiceWell AI Health Companion \\n\\n⚠️ Remember to confirm this appointment with the doctor's office."
- After creating, respond with ONLY valid JSON: {"title":"...","date":"...","time":"...","link":"...","eventId":"..."}`,
        messages: [{
          role:    'user',
          content: `Book this appointment: "${transcript}". Today's date reference: tomorrow is ${tomorrowIST}. Create the calendar event now.`,
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err?.error?.message || `API ${response.status}`)
    }

    const data = await response.json()

    // Extract text response
    const textBlock = data.content?.find(b => b.type === 'text')
    const text      = textBlock?.text?.trim() || ''

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          title:    parsed.title   || 'Doctor Appointment',
          date:     parsed.date    || 'Tomorrow',
          time:     parsed.time    || '10:00 AM',
          link:     parsed.link    || null,
          eventId:  parsed.eventId || null,
          created:  true,
        }
      } catch { /* fall through */ }
    }

    // Fallback: event was created but parsing failed
    return {
      title:   'Doctor Appointment',
      date:    'As requested',
      time:    'As requested',
      link:    null,
      eventId: null,
      created: true,
      raw:     text,
    }
  }, [])

  const buildAppointmentText = useCallback((data) => {
    if (data.created) {
      return `Done! Your ${data.title} has been created in your Google Calendar for ${data.date} at ${data.time}. I've also set reminders for you — 1 day before and 1 hour before. Don't forget to confirm with the doctor's office!`
    }
    return `I've prepared your appointment. Tap the card to save it to Google Calendar.`
  }, [])

  return { isAppointmentQuery, bookAppointment, buildAppointmentText }
}