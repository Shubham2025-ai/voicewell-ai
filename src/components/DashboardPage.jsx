import React from 'react'
import { PageShell, PageHero, SectionLabel, StatCard } from './PageShell.jsx'
import MoodTimeline from './MoodTimeline.jsx'

const FEATURES = [
  { icon:'🎙️', name:'Voice Pipeline',      desc:'STT → LLM → TTS',          color:'#00e87a' },
  { icon:'😰', name:'Emotion Detection',    desc:'HuggingFace AI',            color:'#8b5cf6' },
  { icon:'🧠', name:'Multi-turn Context',   desc:'8-turn memory',             color:'#60a5fa' },
  { icon:'🇮🇳', name:'Hindi Support',      desc:'Auto-detect language',       color:'#f59e0b' },
  { icon:'💊', name:'Med Reminders',        desc:'Firebase + browser notifs', color:'#00e87a' },
  { icon:'🏥', name:'Doctor Finder',        desc:'GPS + OpenStreetMap',       color:'#60a5fa' },
  { icon:'📊', name:'BMI Calculator',       desc:'Instant voice calc',        color:'#00e87a' },
  { icon:'💊', name:'Drug Interaction',     desc:'OpenFDA API',               color:'#ff3d5a' },
  { icon:'🧘', name:'Breathing Guide',      desc:'4-7-8 animated',           color:'#8b5cf6' },
  { icon:'🥗', name:'Nutrition Lookup',     desc:'Open Food Facts API',       color:'#00e87a' },
  { icon:'🌤️', name:'Weather + AQI',       desc:'OpenWeatherMap API',        color:'#60a5fa' },
  { icon:'📅', name:'Calendar Booking',     desc:'Google Calendar',           color:'#f59e0b' },
  { icon:'💧', name:'Water Tracker',        desc:'Daily goal + reminders',    color:'#60a5fa' },
  { icon:'🍽️', name:'Meal Planner',        desc:'7-day AI-generated',        color:'#00e87a' },
  { icon:'📋', name:'Session Summary',      desc:'Groq AI recap',             color:'#8b5cf6' },
]

const STACK = [
  'React 18', 'Vite', 'Tailwind', 'Groq LLM', 'Llama 3.3 70B',
  'HuggingFace', 'Firebase', 'OpenStreetMap', 'Overpass API',
  'OpenFDA', 'Open Food Facts', 'OpenWeatherMap', 'Web Speech API',
  'Google Calendar', 'Nominatim',
]

export default function DashboardPage({ turnCount, avgLatency, apiCallCount, emotionCount, moodHistory, messages }) {
  const userMsgs  = messages.filter(m=>m.role==='user').length
  const agentMsgs = messages.filter(m=>m.role==='assistant').length

  return (
    <PageShell>
      <PageHero icon="📊" title="Dashboard" subtitle="Session analytics · Feature overview · Tech stack" />

      {/* Main stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <StatCard label="Turns today"      value={turnCount}                                    color="#00e87a" />
        <StatCard label="Avg response"     value={avgLatency ?? '—'} unit={avgLatency?'ms':''}  color={avgLatency && avgLatency<1000?'#00e87a':'#f59e0b'} />
        <StatCard label="API calls"        value={apiCallCount}                                  color="#60a5fa" />
        <StatCard label="Emotions tracked" value={emotionCount}                                  color="#8b5cf6" />
      </div>

      {/* Message breakdown */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
        {[
          { label:'You said',   value:userMsgs,  color:'#8b5cf6' },
          { label:'AI replied', value:agentMsgs, color:'#00e87a' },
          { label:'Features',   value:15,         color:'#60a5fa' },
        ].map(s=>(
          <div key={s.label} style={{
            padding:'12px', borderRadius:12, textAlign:'center',
            background:'#0d0d0d', border:'1px solid #1a1a1a',
          }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:24, color:s.color, lineHeight:1, marginBottom:4 }}>
              {s.value}
            </div>
            <div style={{ fontSize:10, color:'#2a2a2a', fontFamily:'var(--font-mono)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mood timeline */}
      {moodHistory.length > 0 && (
        <div>
          <SectionLabel>Mood timeline this session</SectionLabel>
          <div style={{ background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:12, padding:'14px', marginTop:10 }}>
            <MoodTimeline history={moodHistory} />
          </div>
        </div>
      )}

      {/* All features */}
      <div>
        <SectionLabel>All features — {FEATURES.length} total</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:10 }}>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{
              padding:'10px 12px', borderRadius:10,
              background:'#0a0a0a', border:'1px solid #141414',
              display:'flex', alignItems:'center', gap:9,
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{f.icon}</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:11.5, fontWeight:600, color:f.color, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {f.name}
                </div>
                <div style={{ fontSize:9.5, color:'#2a2a2a', fontFamily:'var(--font-mono)', marginTop:1 }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <SectionLabel>Tech stack</SectionLabel>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }}>
          {STACK.map(t=>(
            <span key={t} style={{
              fontSize:10.5, padding:'4px 9px', borderRadius:99,
              background:'rgba(0,232,122,0.05)', color:'#2a5a40',
              border:'1px solid rgba(0,232,122,0.1)', fontFamily:'var(--font-mono)',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Built by */}
      <div style={{
        padding:'14px 16px', borderRadius:12,
        background:'#080808', border:'1px solid #111',
        textAlign:'center',
      }}>
        <div style={{ fontSize:11, color:'#1e1e1e', fontFamily:'var(--font-mono)', marginBottom:4 }}>
          HACKATHON 2026 · AI VOICE AGENTS TRACK
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:'#2a2a2a', fontFamily:'var(--font-display)' }}>
          Built with ♥ by Shubham
        </div>
      </div>
    </PageShell>
  )
}