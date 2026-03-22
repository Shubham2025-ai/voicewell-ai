import React, { useState } from 'react'
import WaterCard from './WaterCard.jsx'
import MealPlanCard from './MealPlanCard.jsx'

const MEAL_PRESETS = [
  { icon:'🥗', label:'Vegetarian plan',          query:'Plan my vegetarian meals for the week' },
  { icon:'🍗', label:'High protein plan',         query:'Plan a high protein non-vegetarian diet for muscle building' },
  { icon:'🥦', label:'Weight loss plan',          query:'Plan a vegetarian weight loss diet for the week' },
  { icon:'🩺', label:'Diabetic-friendly plan',    query:'Plan a diabetic friendly low sugar diet for the week' },
  { icon:'💪', label:'Gym & fitness plan',        query:'Plan a high calorie gym diet plan for the week' },
  { icon:'🌱', label:'Vegan plan',                query:'Plan a vegan Indian meal plan for the week' },
]

const WATER_AMOUNTS = [
  { label:'1 glass (250ml)',  query:'I drank a glass of water' },
  { label:'500ml bottle',    query:'I drank 500ml of water' },
  { label:'1 litre',         query:'I drank 1 litre of water' },
  { label:'Check status',    query:'How much water have I had today?' },
]

export default function NutritionPage({ onQuery, waterTotal, waterPct, waterLog, goalMl }) {
  const [activeTab, setActiveTab] = useState('water')

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'1.25rem' }}>
      {/* Hero */}
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--text-1)', marginBottom:4 }}>
          Nutrition & Hydration
        </div>
        <div style={{ fontSize:13, color:'var(--text-3)' }}>
          Meal planning and water intake tracking
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:'1.25rem' }}>
        {[{id:'water',label:'💧 Water'},{id:'meals',label:'🍽️ Meal Plan'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:'7px 16px', borderRadius:99, border:'none', cursor:'pointer',
            fontSize:12, fontWeight:600, fontFamily:'var(--font-body)',
            background: activeTab===tab.id ? 'var(--green)' : 'var(--surface-2)',
            color:       activeTab===tab.id ? '#000' : 'var(--text-3)',
            border:      activeTab===tab.id ? 'none' : '1px solid var(--border)',
            transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'water' && (
        <>
          {/* Water tracker card */}
          <div style={{
            padding:'16px', borderRadius:16, marginBottom:'1rem',
            background:'var(--surface)', border:'1px solid var(--border)',
          }}>
            <WaterCard
              data={{ total:waterTotal, pct:waterPct, goalMl, glasses:Math.round(waterTotal/250), log:waterLog }}
              type="status"
            />
          </div>

          {/* Quick log buttons */}
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontFamily:'var(--font-mono)' }}>
            Quick log
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {WATER_AMOUNTS.map((w, i) => (
              <button key={i} onClick={() => onQuery(w.query)} style={{
                padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)',
                background:'var(--surface-2)', cursor:'pointer',
                fontSize:12, fontWeight:500, color:'var(--text-2)',
                fontFamily:'var(--font-body)', transition:'all 0.15s', textAlign:'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#60a5fa'; e.currentTarget.style.color='var(--text-1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)' }}
              >
                💧 {w.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:'1rem', padding:'10px', borderRadius:10, background:'var(--surface-2)', fontFamily:'var(--font-mono)' }}>
            💡 You'll get a browser notification every 2 hours if you haven't reached your goal
          </div>
        </>
      )}

      {activeTab === 'meals' && (
        <>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, fontFamily:'var(--font-mono)' }}>
            Choose a plan type
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {MEAL_PRESETS.map((m, i) => (
              <button key={i} onClick={() => onQuery(m.query)} style={{
                padding:'12px', borderRadius:12, border:'1px solid var(--border)',
                background:'var(--surface)', cursor:'pointer', textAlign:'left',
                transition:'all 0.15s', fontFamily:'var(--font-body)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.background='var(--green-dim)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)' }}
              >
                <div style={{ fontSize:22, marginBottom:5 }}>{m.icon}</div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-1)', lineHeight:1.4 }}>{m.label}</div>
              </button>
            ))}
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:'1rem', padding:'10px', borderRadius:10, background:'var(--surface-2)', fontFamily:'var(--font-mono)' }}>
            💡 Or say "Plan my meals for the week" on the Voice tab with your preferences
          </div>
        </>
      )}
    </div>
  )
}