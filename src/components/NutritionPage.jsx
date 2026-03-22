import React, { useState } from 'react'
import { PageShell, PageHero, SectionLabel } from './PageShell.jsx'

const MEAL_PRESETS = [
  { icon:'🥗', label:'Vegetarian',    sub:'Balanced plant-based',    query:'Plan my vegetarian meals for the week' },
  { icon:'🍗', label:'High Protein',  sub:'Muscle building focus',   query:'Plan a high protein non-vegetarian diet for muscle building' },
  { icon:'🥦', label:'Weight Loss',   sub:'Low calorie 1400 kcal',   query:'Plan a vegetarian weight loss diet for the week' },
  { icon:'🩺', label:'Diabetic',      sub:'Low glycemic index',      query:'Plan a diabetic friendly low sugar diet for the week' },
  { icon:'💪', label:'Gym & Fitness', sub:'High calorie 2200 kcal',  query:'Plan a high calorie gym diet plan for the week' },
  { icon:'🌱', label:'Vegan',         sub:'No animal products',      query:'Plan a vegan Indian meal plan for the week' },
]

const WATER_QUICK = [
  { label:'1 Glass',    sub:'250ml',   query:'I drank a glass of water' },
  { label:'1 Bottle',   sub:'500ml',   query:'I drank 500ml of water' },
  { label:'1 Litre',    sub:'1000ml',  query:'I drank 1 litre of water' },
  { label:'Status',     sub:'Check',   query:'How much water have I had today?' },
]

export default function NutritionPage({ onQuery, waterTotal, waterPct, waterLog, goalMl }) {
  const [tab, setTab] = useState('water')
  const glasses = Math.round(waterTotal / 250)
  const waterColor = waterPct >= 100 ? '#00e87a' : waterPct >= 60 ? '#60a5fa' : '#f59e0b'

  return (
    <PageShell>
      <PageHero icon="🍽️" title="Nutrition & Hydration" subtitle="Daily water tracking · AI-generated meal plans" />

      {/* Tab switcher */}
      <div style={{
        display:'flex', gap:3, padding:3,
        background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:10,
      }}>
        {[{id:'water',label:'💧 Water'},{id:'meals',label:'🍽️ Meal Plan'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, padding:'7px 0', borderRadius:8, border:'none', cursor:'pointer',
            fontSize:12, fontWeight: tab===t.id ? 700 : 400,
            fontFamily:'var(--font-body)', transition:'all 0.14s',
            background: tab===t.id ? 'linear-gradient(135deg,#00e87a,#00c264)' : 'transparent',
            color: tab===t.id ? '#000' : '#444',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'water' && (
        <>
          {/* Water tracker card */}
          <div style={{
            padding:'20px', borderRadius:14,
            background:'#0d0d0d', border:'1px solid #1a1a1a',
          }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontSize:11, color:'#333', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                Daily hydration
              </div>
              <div style={{
                fontSize:10, padding:'3px 9px', borderRadius:99,
                background: waterPct>=100 ? 'rgba(0,232,122,0.1)' : 'rgba(96,165,250,0.1)',
                color: waterColor, fontFamily:'var(--font-mono)', border:`1px solid ${waterColor}30`,
              }}>
                {waterPct}% of goal
              </div>
            </div>

            {/* Big number */}
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:14 }}>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:48, color:waterColor, lineHeight:1 }}>
                {waterTotal}
              </span>
              <span style={{ fontSize:13, color:'#333' }}>ml</span>
              <span style={{ fontSize:12, color:'#222', marginLeft:4 }}>/ {goalMl}ml</span>
            </div>

            {/* Progress bar */}
            <div style={{ height:4, borderRadius:99, background:'#111', overflow:'hidden', marginBottom:12 }}>
              <div style={{
                height:'100%', borderRadius:99, background:waterColor,
                width:`${Math.min(waterPct,100)}%`, transition:'width 0.6s ease',
              }}/>
            </div>

            {/* Glass icons */}
            <div style={{ display:'flex', gap:5, marginBottom:12 }}>
              {[...Array(8)].map((_,i)=>(
                <span key={i} style={{ fontSize:15, opacity: i<glasses ? 1 : 0.12, transition:'all 0.3s' }}>💧</span>
              ))}
              <span style={{ fontSize:11, color:'#333', marginLeft:'auto', fontFamily:'var(--font-mono)', alignSelf:'center' }}>
                {glasses}/8 glasses
              </span>
            </div>

            {/* Recent log */}
            {waterLog && waterLog.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, paddingTop:12, borderTop:'1px solid #111' }}>
                {waterLog.slice(-6).map(e=>(
                  <span key={e.id} style={{
                    fontSize:10, padding:'3px 8px', borderRadius:99,
                    background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.15)',
                    color:'#60a5fa', fontFamily:'var(--font-mono)',
                  }}>{e.amount}ml · {e.time}</span>
                ))}
              </div>
            )}

            {waterPct >= 100 && (
              <div style={{ marginTop:12, fontSize:12, color:'#00e87a', fontWeight:700, textAlign:'center' }}>
                🎉 Daily goal reached!
              </div>
            )}
          </div>

          {/* Quick log */}
          <div>
            <SectionLabel>Quick log</SectionLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
              {WATER_QUICK.map((w,i)=>(
                <button key={i} onClick={()=>onQuery(w.query)} style={{
                  padding:'13px', borderRadius:12,
                  border:'1px solid #1a1a1a', background:'#0d0d0d',
                  cursor:'pointer', textAlign:'center', fontFamily:'var(--font-body)',
                  transition:'all 0.14s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(96,165,250,0.3)';e.currentTarget.style.background='rgba(96,165,250,0.04)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#1a1a1a';e.currentTarget.style.background='#0d0d0d'}}
                >
                  <div style={{ fontSize:20, marginBottom:4 }}>💧</div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text-1)' }}>{w.label}</div>
                  <div style={{ fontSize:10.5, color:'#333', marginTop:2 }}>{w.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding:'10px 13px', borderRadius:10, background:'#080808', border:'1px solid #111', fontSize:11, color:'#2a2a2a', fontFamily:'var(--font-mono)' }}>
            💡 Browser notification every 2 hours if goal not reached
          </div>
        </>
      )}

      {tab === 'meals' && (
        <>
          <div style={{
            padding:'14px 16px', borderRadius:12,
            background:'rgba(0,232,122,0.04)', border:'1px solid rgba(0,232,122,0.12)',
            fontSize:12, color:'#2a5a40', lineHeight:1.6,
          }}>
            ✨ AI generates a personalised 7-day Indian meal plan with breakfast, lunch, snacks and dinner — including calorie counts.
          </div>

          <div>
            <SectionLabel>Choose your plan</SectionLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
              {MEAL_PRESETS.map((m,i)=>(
                <button key={i} onClick={()=>onQuery(m.query)} style={{
                  padding:'14px 12px', borderRadius:12,
                  border:'1px solid #1a1a1a', background:'#0d0d0d',
                  cursor:'pointer', textAlign:'left', fontFamily:'var(--font-body)',
                  transition:'all 0.15s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,232,122,0.25)';e.currentTarget.style.background='rgba(0,232,122,0.03)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#1a1a1a';e.currentTarget.style.background='#0d0d0d'}}
                >
                  <div style={{ fontSize:24, marginBottom:7 }}>{m.icon}</div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:'var(--text-1)', marginBottom:2 }}>{m.label}</div>
                  <div style={{ fontSize:10.5, color:'var(--text-3)' }}>{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding:'10px 13px', borderRadius:10, background:'#080808', border:'1px solid #111', fontSize:11, color:'#2a2a2a', fontFamily:'var(--font-mono)' }}>
            💡 Or switch to Voice tab and say "Plan my meals for the week"
          </div>
        </>
      )}
    </PageShell>
  )
}