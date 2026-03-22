import React, { useState } from 'react'
import { PageShell, PageHero, SectionLabel } from './PageShell.jsx'

const SPECIALISTS = [
  { icon:'🫀', label:'Cardiologist',    sub:'Heart & cardiovascular',  query:'Book a cardiologist appointment for tomorrow at 10 AM' },
  { icon:'🦷', label:'Dentist',          sub:'Dental & oral care',       query:'Book a dental appointment for Friday at 11 AM' },
  { icon:'👁️', label:'Eye Doctor',       sub:'Vision & ophthalmology',   query:'Book an eye checkup for next Monday at 9 AM' },
  { icon:'🩺', label:'General Checkup',  sub:'Full health examination',  query:'Book a general health checkup for tomorrow at 10 AM' },
  { icon:'🔬', label:'Lab / Blood Test', sub:'Pathology & diagnostics',  query:'Book a blood test appointment for tomorrow at 8 AM' },
  { icon:'🧠', label:'Neurologist',      sub:'Brain & nervous system',   query:'Book a neurology consultation for Friday at 3 PM' },
  { icon:'🦴', label:'Orthopaedic',      sub:'Bones, joints & muscles',  query:'Book an orthopaedic appointment for Monday at 11 AM' },
  { icon:'🌡️', label:'Gynaecologist',   sub:'Women\'s health',          query:'Book a gynaecology appointment for Saturday at 10 AM' },
]

export default function AppointmentsPage({ onQuery }) {
  const [input, setInput] = useState('')

  return (
    <PageShell>
      <PageHero icon="📅" title="Appointments" subtitle="Voice-book appointments · Opens in Google Calendar" />

      {/* How it works */}
      <div style={{
        padding:'14px 16px', borderRadius:12,
        background:'rgba(0,232,122,0.03)', border:'1px solid rgba(0,232,122,0.1)',
      }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#00e87a', marginBottom:10, fontFamily:'var(--font-mono)', letterSpacing:'0.05em' }}>
          HOW IT WORKS
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {[
            ['01', 'Tap any specialist or type a custom request'],
            ['02', 'VoiceWell extracts date, time and appointment type'],
            ['03', 'Tap "Add to Google Calendar" — event pre-filled'],
            ['04', 'Reminders set automatically: 1 day + 1 hour before'],
          ].map(([n,s])=>(
            <div key={n} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ fontSize:9, fontWeight:700, color:'#00e87a', fontFamily:'var(--font-mono)', opacity:0.5, marginTop:1, flexShrink:0 }}>{n}</span>
              <span style={{ fontSize:12, color:'#2a4a38', lineHeight:1.5 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom booking */}
      <div>
        <SectionLabel>Custom booking</SectionLabel>
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&input.trim()){onQuery(input.trim());setInput('')}}}
            placeholder="e.g. Book a checkup for Friday at 10 AM"
            style={{
              flex:1, padding:'11px 15px', borderRadius:10,
              border:'1px solid #1e1e1e', background:'#0d0d0d',
              color:'var(--text-1)', fontSize:13,
              fontFamily:'var(--font-body)', outline:'none', transition:'border-color 0.14s',
            }}
            onFocus={e=>e.target.style.borderColor='rgba(0,232,122,0.3)'}
            onBlur={e=>e.target.style.borderColor='#1e1e1e'}
          />
          <button
            onClick={()=>{if(input.trim()){onQuery(input.trim());setInput('')}}}
            style={{
              padding:'11px 18px', borderRadius:10, border:'none',
              background:'linear-gradient(135deg,#00e87a,#00c264)', color:'#000',
              fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', flexShrink:0,
            }}>Book</button>
        </div>
      </div>

      {/* Quick book grid */}
      <div>
        <SectionLabel>Quick book</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
          {SPECIALISTS.map((s,i)=>(
            <button key={i} onClick={()=>onQuery(s.query)} style={{
              padding:'14px 12px', borderRadius:12,
              border:'1px solid #1a1a1a', background:'#0d0d0d',
              cursor:'pointer', textAlign:'left', fontFamily:'var(--font-body)',
              transition:'all 0.15s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,232,122,0.2)';e.currentTarget.style.background='rgba(0,232,122,0.025)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#1a1a1a';e.currentTarget.style.background='#0d0d0d'}}
            >
              <div style={{ fontSize:22, marginBottom:7 }}>{s.icon}</div>
              <div style={{ fontSize:12.5, fontWeight:700, color:'var(--text-1)', marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:10.5, color:'var(--text-3)' }}>{s.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'10px 13px', borderRadius:10, background:'#080808', border:'1px solid #111', fontSize:11, color:'#2a2a2a', fontFamily:'var(--font-mono)' }}>
        ⚠️ Please confirm appointment directly with the doctor's office
      </div>
    </PageShell>
  )
}