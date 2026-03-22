import React, { useState } from 'react'

const APPOINTMENT_TYPES = [
  { icon:'🫀', label:'Cardiologist',       query:'Book a cardiologist appointment for tomorrow at 10 AM' },
  { icon:'🦷', label:'Dentist',             query:'Book a dental appointment for Friday at 11 AM' },
  { icon:'👁️', label:'Eye Doctor',          query:'Book an eye checkup for next Monday at 9 AM' },
  { icon:'🩺', label:'General Checkup',     query:'Book a general health checkup for tomorrow at 10 AM' },
  { icon:'🔬', label:'Lab Test',            query:'Book a blood test appointment for tomorrow at 8 AM' },
  { icon:'🧠', label:'Neurologist',         query:'Book a neurology consultation for Friday at 3 PM' },
]

export default function AppointmentsPage({ onQuery }) {
  const [customInput, setCustomInput] = useState('')

  const handleCustom = (e) => {
    e.preventDefault()
    if (!customInput.trim()) return
    onQuery(customInput.trim())
    setCustomInput('')
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'1.25rem' }}>
      {/* Hero */}
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--text-1)', marginBottom:4 }}>
          Appointments
        </div>
        <div style={{ fontSize:13, color:'var(--text-3)' }}>
          Book and manage doctor appointments via Google Calendar
        </div>
      </div>

      {/* Custom booking */}
      <div style={{
        padding:'16px', borderRadius:16, marginBottom:'1.25rem',
        background:'linear-gradient(135deg, rgba(0,194,122,0.12), rgba(0,194,122,0.04))',
        border:'1px solid rgba(0,194,122,0.25)',
      }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--green)', marginBottom:10, fontFamily:'var(--font-display)' }}>
          📅 Book a custom appointment
        </div>
        <form onSubmit={handleCustom} style={{ display:'flex', gap:8 }}>
          <input
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="e.g. Book a checkup for Friday at 10 AM"
            style={{
              flex:1, padding:'10px 14px', borderRadius:10,
              border:'1px solid rgba(0,194,122,0.3)', background:'rgba(0,0,0,0.2)',
              color:'var(--text-1)', fontSize:13, fontFamily:'var(--font-body)', outline:'none',
            }}
          />
          <button type="submit" style={{
            padding:'10px 16px', borderRadius:10, border:'none',
            background:'var(--green)', color:'#000',
            fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)',
          }}>Book</button>
        </form>
      </div>

      {/* Quick appointment types */}
      <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, fontFamily:'var(--font-mono)' }}>
        Quick book
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1.25rem' }}>
        {APPOINTMENT_TYPES.map((a, i) => (
          <button key={i} onClick={() => onQuery(a.query)} style={{
            padding:'12px', borderRadius:12, border:'1px solid var(--border)',
            background:'var(--surface)', cursor:'pointer', textAlign:'left',
            transition:'all 0.15s', fontFamily:'var(--font-body)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.background='var(--green-dim)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)' }}
          >
            <div style={{ fontSize:22, marginBottom:5 }}>{a.icon}</div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-1)' }}>{a.label}</div>
          </button>
        ))}
      </div>

      {/* How it works */}
      <div style={{
        padding:'14px', borderRadius:12,
        background:'var(--surface-2)', border:'1px solid var(--border)',
      }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginBottom:8 }}>
          How it works
        </div>
        {[
          '1. Tap any appointment type or type a custom request',
          '2. VoiceWell extracts the date, time and appointment type',
          '3. Tap "Add to Google Calendar" in the result card',
          '4. Event is created with reminders — 1 day + 1 hour before',
        ].map((step, i) => (
          <div key={i} style={{ fontSize:11, color:'var(--text-3)', marginBottom:4, lineHeight:1.5 }}>
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}