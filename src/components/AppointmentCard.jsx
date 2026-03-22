import React, { useState } from 'react'

export default function AppointmentCard({ data }) {
  const [clicked, setClicked] = useState(false)

  const handleAdd = () => {
    window.open(data.calendarUrl, '_blank')
    setClicked(true)
  }

  return (
    <div style={{ minWidth: 230 }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12, fontFamily: 'var(--font-display)',
      }}>
        <span style={{ fontSize: 20 }}>📅</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Appointment Ready</div>
          <div style={{ fontSize: 10, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>
            Tap below to save to Google Calendar
          </div>
        </div>
      </div>

      {/* Details card */}
      <div style={{
        padding: '10px 12px', borderRadius: 10, marginBottom: 10,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{
          fontWeight: 700, fontSize: 14, marginBottom: 8,
          fontFamily: 'var(--font-display)',
        }}>
          🩺 {data.title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, opacity: 0.9 }}>
            <span>📆</span>
            <span>{data.date}</span>
          </div>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, opacity: 0.9 }}>
            <span>🕐</span>
            <span>{data.time} IST · 1 hour</span>
          </div>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, opacity: 0.7 }}>
            <span>📍</span>
            <span>Confirm location with doctor</span>
          </div>
        </div>
      </div>

      {/* Add to Calendar button */}
      <button
        onClick={handleAdd}
        style={{
          width: '100%', padding: '11px 16px',
          borderRadius: 10, border: 'none',
          background: clicked ? 'rgba(0,194,122,0.2)' : 'var(--green)',
          color: clicked ? 'var(--green)' : '#000',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.25s',
          border: clicked ? '1px solid var(--green)' : 'none',
        }}
      >
        <span style={{ fontSize: 16 }}>{clicked ? '✅' : '📅'}</span>
        {clicked ? 'Google Calendar is opening…' : 'Add to Google Calendar'}
      </button>

      {/* Disclaimer */}
      <div style={{
        fontSize: 9, color: 'rgba(255,255,255,0.3)',
        marginTop: 7, textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        lineHeight: 1.5,
      }}>
        ⚠️ Please confirm appointment with doctor's office · Reminder only
      </div>
    </div>
  )
}