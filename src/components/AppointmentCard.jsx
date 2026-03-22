import React from 'react'

export default function AppointmentCard({ data }) {
  return (
    <div style={{ minWidth: 220 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        fontFamily: 'var(--font-display)',
      }}>
        <span style={{ fontSize: 18 }}>{data.created ? '✅' : '📅'}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            {data.created ? 'Appointment Created!' : 'Appointment Ready'}
          </div>
          <div style={{ fontSize: 10, opacity: 0.65, fontFamily: 'var(--font-mono)' }}>
            {data.created ? 'Saved to Google Calendar' : 'Tap to save to Google Calendar'}
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{
        padding: '10px 12px', borderRadius: 10, marginBottom: 10,
        background: data.created ? 'rgba(0,194,122,0.1)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${data.created ? 'rgba(0,194,122,0.3)' : 'rgba(255,255,255,0.12)'}`,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, fontFamily: 'var(--font-display)' }}>
          🩺 {data.title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9 }}>
            <span>📆</span> {data.date}
          </div>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9 }}>
            <span>🕐</span> {data.time} IST · 1 hour
          </div>
          {data.created && (
            <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)' }}>
              <span>🔔</span> Reminders: 1 day + 1 hour before
            </div>
          )}
        </div>
      </div>

      {/* View in Calendar button */}
      {data.link && (
        <a
          href={data.link}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '9px', borderRadius: 10,
            background: 'var(--green)', color: '#000',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            fontFamily: 'var(--font-display)', transition: 'all 0.15s',
          }}
        >
          📅 View in Google Calendar
        </a>
      )}

      <div style={{
        fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 6,
        fontFamily: 'var(--font-mono)', textAlign: 'center',
      }}>
        ⚠️ Please confirm appointment with doctor's office
      </div>
    </div>
  )
}