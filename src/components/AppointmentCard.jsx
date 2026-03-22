import React, { useState } from 'react'

/**
 * AppointmentCard — shows a booking confirmation with
 * one-click Google Calendar save button.
 */
export default function AppointmentCard({ data }) {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    window.open(data.calendarUrl, '_blank')
    setSaved(true)
  }

  return (
    <div style={{ minWidth: 220 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        fontFamily: 'var(--font-display)',
      }}>
        <span style={{ fontSize: 18 }}>📅</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Appointment Ready</div>
          <div style={{ fontSize: 10, opacity: 0.65, fontFamily: 'var(--font-mono)' }}>
            Tap below to save to Google Calendar
          </div>
        </div>
      </div>

      {/* Appointment details */}
      <div style={{
        padding: '10px 12px', borderRadius: 10, marginBottom: 10,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
          🩺 {data.title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85 }}>
            <span>📆</span> {data.date}
          </div>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85 }}>
            <span>🕐</span> {data.time} IST · 1 hour
          </div>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85 }}>
            <span>📍</span> To be confirmed with doctor
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        style={{
          width: '100%', padding: '10px', borderRadius: 10, border: 'none',
          background: saved ? 'var(--green-dim)' : 'var(--green)',
          color: saved ? 'var(--green)' : '#000',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all 0.2s',
          border: saved ? '1px solid var(--green)' : 'none',
        }}
      >
        {saved ? '✅ Opening Google Calendar…' : '📅 Save to Google Calendar'}
      </button>

      <div style={{
        fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 6,
        fontFamily: 'var(--font-mono)', textAlign: 'center',
      }}>
        ⚠️ Reminder only · Confirm appointment with doctor's office
      </div>
    </div>
  )
}