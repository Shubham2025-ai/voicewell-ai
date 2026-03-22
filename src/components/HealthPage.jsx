import React, { useState } from 'react'
import { PageShell, PageHero, SectionLabel, FeatureCard, InfoBox } from './PageShell.jsx'
import BreathingExercise from './BreathingExercise.jsx'

const SYMPTOMS = [
  { icon:'🤒', label:'Fever & Cold',       desc:'Temp, chills, congestion',  query:'I have fever and cold since yesterday' },
  { icon:'🤕', label:'Headache',            desc:'Migraine, tension pain',     query:'I have a bad headache since morning' },
  { icon:'🤢', label:'Nausea',              desc:'Vomiting, stomach upset',    query:'I feel nauseous and want to vomit' },
  { icon:'😮‍💨', label:'Breathing Issues', desc:'Shortness of breath',        query:'I am having difficulty breathing lightly' },
  { icon:'😰', label:'Anxiety & Stress',    desc:'Mental health support',      query:'I am feeling very stressed and anxious' },
  { icon:'💪', label:'Body Pain',           desc:'Joints, muscles, back',      query:'I have severe body pain and fatigue' },
]

const TOOLS = [
  { icon:'📊', label:'BMI Calculator',      desc:'Weight + height → BMI',      query:'My weight is 70kg and height is 5 feet 8 inches', accent:true },
  { icon:'💊', label:'Drug Interaction',    desc:'Check medication safety',     query:'Can I take ibuprofen with aspirin?',            accent:true },
  { icon:'🏥', label:'Find Nearby Doctor',  desc:'GPS-based clinic finder',     query:'Find a doctor near me',                        accent:true },
]

export default function HealthPage({ onQuery, speak }) {
  const [showBreathing, setShowBreathing] = useState(false)

  return (
    <PageShell>
      <PageHero icon="🩺" title="Health Centre" subtitle="Symptom checker · BMI · Drug interactions · Doctor finder" />

      {/* Breathing card — featured */}
      <div
        onClick={() => setShowBreathing(v => !v)}
        style={{
          padding:'16px 18px', borderRadius:14, cursor:'pointer',
          background:'linear-gradient(135deg, rgba(0,232,122,0.07), rgba(0,232,122,0.02))',
          border:'1px solid rgba(0,232,122,0.18)',
          display:'flex', alignItems:'center', gap:14,
          transition:'all 0.18s',
        }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,232,122,0.4)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,232,122,0.18)'}
      >
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          background:'rgba(0,232,122,0.1)', border:'1px solid rgba(0,232,122,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
        }}>🧘</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'#00e87a', marginBottom:3 }}>
            4-7-8 Breathing Exercise
          </div>
          <div style={{ fontSize:11.5, color:'#2a5a40', lineHeight:1.5 }}>
            Animated guided breathing · Reduces stress in under 2 minutes
          </div>
        </div>
        <div style={{ fontSize:18, color:'rgba(0,232,122,0.4)' }}>
          {showBreathing ? '▲' : '▶'}
        </div>
      </div>

      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} onSpeak={speak} />}

      {/* Symptom checker grid */}
      <div>
        <SectionLabel>Symptom checker — tap to ask</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
          {SYMPTOMS.map((s,i) => (
            <button key={i} onClick={() => onQuery(s.query)} style={{
              padding:'13px', borderRadius:12,
              border:'1px solid #1a1a1a', background:'#0d0d0d',
              cursor:'pointer', textAlign:'left',
              fontFamily:'var(--font-body)', transition:'all 0.15s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2a2a2a';e.currentTarget.style.background='#111'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#1a1a1a';e.currentTarget.style.background='#0d0d0d'}}
            >
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text-1)', marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:10.5, color:'var(--text-3)' }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Health tools */}
      <div>
        <SectionLabel>Health tools</SectionLabel>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:10 }}>
          {TOOLS.map((t,i) => (
            <button key={i} onClick={() => onQuery(t.query)} style={{
              padding:'13px 15px', borderRadius:12,
              border:`1px solid ${t.accent ? 'rgba(0,232,122,0.15)' : '#1a1a1a'}`,
              background: t.accent ? 'rgba(0,232,122,0.03)' : '#0d0d0d',
              cursor:'pointer', textAlign:'left', fontFamily:'var(--font-body)',
              display:'flex', alignItems:'center', gap:12, transition:'all 0.15s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent?'rgba(0,232,122,0.35)':'#2a2a2a'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=t.accent?'rgba(0,232,122,0.15)':'#1a1a1a'}}
            >
              <div style={{
                width:38, height:38, borderRadius:10, flexShrink:0,
                background: t.accent ? 'rgba(0,232,122,0.08)' : '#111',
                border: `1px solid ${t.accent ? 'rgba(0,232,122,0.15)' : '#1e1e1e'}`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
              }}>{t.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', marginBottom:2 }}>{t.label}</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>{t.desc}</div>
              </div>
              <div style={{ marginLeft:'auto', color:'#2a2a2a', fontSize:16 }}>›</div>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency */}
      <div style={{
        padding:'14px 16px', borderRadius:12,
        background:'rgba(255,61,90,0.04)', border:'1px solid rgba(255,61,90,0.15)',
      }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#ff3d5a', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
          🚨 Medical Emergency
        </div>
        <div style={{ fontSize:11.5, color:'#6a2a35', lineHeight:1.7 }}>
          Chest pain / can't breathe / stroke → Call <strong style={{color:'#ff3d5a'}}>112</strong> immediately<br/>
          Mental health crisis → iCall <strong style={{color:'#ff3d5a'}}>9152987821</strong>
        </div>
      </div>
    </PageShell>
  )
}