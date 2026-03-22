import React from 'react'
import SessionStats from './SessionStats.jsx'
import MoodTimeline from './MoodTimeline.jsx'

const FEATURES = [
  { icon:'🎙️', name:'Voice AI',          desc:'STT → LLM → TTS pipeline' },
  { icon:'😰', name:'Emotion Detection',  desc:'HuggingFace distilroberta' },
  { icon:'🧠', name:'Multi-turn Context', desc:'Last 8 turns remembered' },
  { icon:'🇮🇳', name:'Hindi Support',     desc:'Auto-detect + switch' },
  { icon:'💊', name:'Med Reminders',      desc:'Firebase + notifications' },
  { icon:'🏥', name:'Doctor Finder',      desc:'OpenStreetMap + GPS' },
  { icon:'📊', name:'BMI Calculator',     desc:'Instant voice calculation' },
  { icon:'💊', name:'Drug Checker',       desc:'OpenFDA API' },
  { icon:'🧘', name:'Breathing Guide',    desc:'4-7-8 technique, animated' },
  { icon:'🥗', name:'Nutrition Lookup',   desc:'Open Food Facts API' },
  { icon:'🌤️', name:'Weather + AQI',     desc:'OpenWeatherMap API' },
  { icon:'📅', name:'Calendar Booking',   desc:'Google Calendar pre-fill' },
  { icon:'💧', name:'Water Tracker',      desc:'Daily goal + reminders' },
  { icon:'🍽️', name:'Meal Planner',       desc:'7-day AI-generated plan' },
  { icon:'📋', name:'Session Summary',    desc:'Groq-powered AI recap' },
]

export default function DashboardPage({ turnCount, avgLatency, apiCallCount, emotionCount, moodHistory, messages }) {
  const userMessages  = messages.filter(m => m.role === 'user').length
  const agentMessages = messages.filter(m => m.role === 'assistant').length

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'1.25rem' }}>
      {/* Hero */}
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--text-1)', marginBottom:4 }}>
          Dashboard
        </div>
        <div style={{ fontSize:13, color:'var(--text-3)' }}>
          Session analytics and feature overview
        </div>
      </div>

      {/* Session stats */}
      <div style={{ marginBottom:'1.25rem' }}>
        <SessionStats
          turnCount={turnCount}
          avgLatency={avgLatency}
          apiCallCount={apiCallCount}
          emotionCount={emotionCount}
        />
      </div>

      {/* Message stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:'1.25rem' }}>
        {[
          { label:'You said',     value:userMessages,  color:'#8b5cf6' },
          { label:'AI replied',   value:agentMessages, color:'var(--green)' },
          { label:'API calls',    value:apiCallCount,  color:'#60a5fa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding:'12px', borderRadius:12, textAlign:'center',
            background:'var(--surface)', border:'1px solid var(--border)',
          }}>
            <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:22, color, marginBottom:3 }}>
              {value}
            </div>
            <div style={{ fontSize:10, color:'var(--text-3)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Mood timeline */}
      {moodHistory.length > 0 && (
        <div style={{ marginBottom:'1.25rem' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontFamily:'var(--font-mono)' }}>
            Mood timeline this session
          </div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'12px' }}>
            <MoodTimeline history={moodHistory} />
          </div>
        </div>
      )}

      {/* Features grid */}
      <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, fontFamily:'var(--font-mono)' }}>
        All features ({FEATURES.length})
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{
            padding:'8px 10px', borderRadius:10,
            background:'var(--surface)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span style={{ fontSize:16, flexShrink:0 }}>{f.icon}</span>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {f.name}
              </div>
              <div style={{ fontSize:9, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div style={{ marginTop:'1.25rem', padding:'14px', borderRadius:12, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', marginBottom:8 }}>Tech stack</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
          {['React 18','Vite','Tailwind','Groq LLM','HuggingFace','Firebase','OpenStreetMap','OpenFDA','Open Food Facts','OpenWeatherMap','Web Speech API'].map(t => (
            <span key={t} style={{
              fontSize:10, padding:'3px 8px', borderRadius:99,
              background:'rgba(0,194,122,0.1)', color:'var(--green)',
              border:'1px solid rgba(0,194,122,0.2)', fontFamily:'var(--font-mono)',
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}