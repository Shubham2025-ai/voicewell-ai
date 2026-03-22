import React, { useState } from 'react'

const MEAL_ICONS = { breakfast:'🌅', lunch:'☀️', snack:'🍎', dinner:'🌙' }
const DAY_SHORT  = { Monday:'Mon', Tuesday:'Tue', Wednesday:'Wed', Thursday:'Thu', Friday:'Fri', Saturday:'Sat', Sunday:'Sun' }

export default function MealPlanCard({ plan }) {
  const [activeDay, setActiveDay] = useState(0)

  if (!plan?.days?.length) return null

  const day     = plan.days[activeDay]
  const meals   = ['breakfast','lunch','snack','dinner']
  const dayTotal = meals.reduce((s, m) => s + (day[m]?.calories || 0), 0)

  return (
    <div style={{ minWidth: 240 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, fontFamily:'var(--font-display)' }}>
        <span style={{ fontSize:20 }}>🍽️</span>
        <div>
          <div style={{ fontWeight:700, fontSize:13 }}>7-Day Meal Plan</div>
          <div style={{ fontSize:10, opacity:0.6, fontFamily:'var(--font-mono)' }}>
            {plan.diet} · {plan.goal?.slice(0,30)}
          </div>
        </div>
      </div>

      {/* Day tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        {plan.days.map((d, i) => (
          <button key={i} onClick={() => setActiveDay(i)} style={{
            padding:'4px 8px', borderRadius:8, border:'none', cursor:'pointer',
            fontSize:10, fontWeight:600, flexShrink:0,
            fontFamily:'var(--font-mono)',
            background: i === activeDay ? 'var(--green)' : 'rgba(255,255,255,0.07)',
            color:       i === activeDay ? '#000'         : 'rgba(255,255,255,0.6)',
            transition: 'all 0.15s',
          }}>
            {DAY_SHORT[d.day] || d.day}
          </button>
        ))}
      </div>

      {/* Day header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:8,
      }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>
          {day.day}
        </div>
        <div style={{
          fontSize:10, padding:'2px 8px', borderRadius:99,
          background:'rgba(0,194,122,0.15)', color:'var(--green)',
          fontFamily:'var(--font-mono)',
        }}>
          ~{dayTotal} kcal
        </div>
      </div>

      {/* Meals */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {meals.map(mealType => {
          const meal = day[mealType]
          if (!meal) return null
          return (
            <div key={mealType} style={{
              padding:'8px 10px', borderRadius:10,
              background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ fontSize:13 }}>{MEAL_ICONS[mealType]}</span>
                  <span style={{ fontSize:11, fontWeight:600, textTransform:'capitalize', opacity:0.7, fontFamily:'var(--font-mono)' }}>
                    {mealType}
                  </span>
                </div>
                <span style={{ fontSize:10, opacity:0.5, fontFamily:'var(--font-mono)' }}>
                  {meal.calories} kcal
                </span>
              </div>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{meal.name}</div>
              <div style={{ fontSize:11, opacity:0.65, lineHeight:1.5 }}>
                {meal.items?.join(', ')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:10 }}>
        <button
          onClick={() => setActiveDay(d => Math.max(0, d-1))}
          disabled={activeDay === 0}
          style={{
            padding:'6px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)',
            background:'none', color:'rgba(255,255,255,0.5)',
            fontSize:12, cursor:activeDay === 0 ? 'not-allowed' : 'pointer',
            opacity: activeDay === 0 ? 0.3 : 1,
            fontFamily:'var(--font-body)',
          }}
        >← Prev</button>
        <span style={{ fontSize:11, opacity:0.4, alignSelf:'center', fontFamily:'var(--font-mono)' }}>
          {activeDay+1} / {plan.days.length}
        </span>
        <button
          onClick={() => setActiveDay(d => Math.min(plan.days.length-1, d+1))}
          disabled={activeDay === plan.days.length-1}
          style={{
            padding:'6px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)',
            background:'none', color:'rgba(255,255,255,0.5)',
            fontSize:12, cursor:activeDay === plan.days.length-1 ? 'not-allowed' : 'pointer',
            opacity: activeDay === plan.days.length-1 ? 0.3 : 1,
            fontFamily:'var(--font-body)',
          }}
        >Next →</button>
      </div>
    </div>
  )
}