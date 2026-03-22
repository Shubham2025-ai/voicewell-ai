import React, { useState } from 'react'
import BreathingExercise from './BreathingExercise.jsx'

const SYMPTOM_CHECKS = [
  { icon: '🤒', label: 'Fever & Cold',      query: 'I have fever and cold since yesterday' },
  { icon: '🤕', label: 'Headache',           query: 'I have a bad headache since morning' },
  { icon: '😮‍💨', label: 'Breathing Issues',  query: 'I am having difficulty breathing' },
  { icon: '🤢', label: 'Nausea & Vomiting', query: 'I feel nauseous and want to vomit' },
  { icon: '😰', label: 'Anxiety & Stress',   query: 'I am feeling very stressed and anxious' },
  { icon: '💊', label: 'Drug Interaction',   query: 'Can I take ibuprofen with aspirin?' },
  { icon: '📊', label: 'Check my BMI',       query: 'My weight is 70kg and height is 5 feet 8 inches' },
  { icon: '🏥', label: 'Find Doctor',        query: 'Find a doctor near me' },
]

export default function HealthPage({ onQuery, speak }) {
  const [showBreathing, setShowBreathing] = useState(false)

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'1.25rem' }}>
      {/* Hero */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--text-1)', marginBottom:4 }}>
          Health Centre
        </div>
        <div style={{ fontSize:13, color:'var(--text-3)' }}>
          Symptom checker, BMI, drug interactions and more
        </div>
      </div>

      {/* Breathing exercise card */}
      <div
        onClick={() => setShowBreathing(true)}
        style={{
          padding:'14px 16px', borderRadius:16, marginBottom:'1rem', cursor:'pointer',
          background:'linear-gradient(135deg, rgba(0,194,122,0.15), rgba(0,194,122,0.05))',
          border:'1px solid rgba(0,194,122,0.3)', transition:'all 0.2s',
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:28 }}>🧘</span>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--green)', marginBottom:2 }}>
              Breathing Exercise
            </div>
            <div style={{ fontSize:12, color:'var(--text-3)' }}>
              4-7-8 technique · Reduces stress in 2 minutes
            </div>
          </div>
          <div style={{ marginLeft:'auto', fontSize:18, opacity:0.5 }}>›</div>
        </div>
      </div>

      {showBreathing && (
        <BreathingExercise
          onClose={() => setShowBreathing(false)}
          onSpeak={speak}
        />
      )}

      {/* Quick symptom checks */}
      <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, fontFamily:'var(--font-mono)' }}>
        Quick checks — tap to ask
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {SYMPTOM_CHECKS.map((s, i) => (
          <button key={i} onClick={() => onQuery(s.query)} style={{
            padding:'12px', borderRadius:12, border:'1px solid var(--border)',
            background:'var(--surface)', cursor:'pointer', textAlign:'left',
            transition:'all 0.15s', fontFamily:'var(--font-body)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.background='var(--green-dim)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)' }}
          >
            <div style={{ fontSize:22, marginBottom:5 }}>{s.icon}</div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-1)' }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Emergency info */}
      <div style={{
        marginTop:'1.25rem', padding:'12px 14px', borderRadius:12,
        background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
      }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#ef4444', marginBottom:4 }}>
          🚨 Medical Emergency?
        </div>
        <div style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6 }}>
          Call <strong style={{ color:'#ef4444' }}>112</strong> immediately for chest pain, difficulty breathing, or stroke symptoms.
          Mental health crisis: iCall <strong style={{ color:'#ef4444' }}>9152987821</strong>
        </div>
      </div>
    </div>
  )
}