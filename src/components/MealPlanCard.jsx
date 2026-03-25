import React, { useState } from 'react'

const MEAL_CONFIG = {
  breakfast: { icon: '🌅', label: 'Breakfast', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  lunch:     { icon: '☀️',  label: 'Lunch',     color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  snack:     { icon: '🍎',  label: 'Snack',     color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.2)' },
  dinner:    { icon: '🌙',  label: 'Dinner',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
}

const DAY_SHORT  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const DAYS_FULL  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function estimateMacros(meal, goal = '') {
  const cal = meal.calories || 0
  const isHighProtein = goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('protein')
  const isLowCarb     = goal.toLowerCase().includes('diabet') || goal.toLowerCase().includes('weight loss')
  const protein = isHighProtein ? Math.round(cal * 0.35 / 4) : Math.round(cal * 0.2 / 4)
  const carbs   = isLowCarb    ? Math.round(cal * 0.3  / 4) : Math.round(cal * 0.5 / 4)
  const fat     = Math.max(0, Math.round((cal - protein * 4 - carbs * 4) / 9))
  return { protein, carbs, fat }
}

function MacroBar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: 9, color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}g</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, width: pct + '%', background: color, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

function CaloriRing({ value, total }) {
  const pct  = Math.min(100, Math.round((value / Math.max(total, 1)) * 100))
  const r    = 18
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width="44" height="44" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
      <circle cx="22" cy="22" r={r} fill="none" stroke="#00e87a" strokeWidth="3.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x="22" y="22" textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: '22px 22px', fontSize: 8, fill: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        {pct}%
      </text>
    </svg>
  )
}

function LoadingInline({ onRetry }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
      padding:'10px 12px', borderRadius:10, margin:'10px 14px'
    }}>
      <div className="spinner" style={{
        width:16, height:16, borderRadius:'50%',
        border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'#00e87a',
        animation:'spin 1s linear infinite'
      }} />
      <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>Generating meal plan…</div>
      {onRetry && (
        <button onClick={onRetry} style={{
          marginLeft:'auto', fontSize:12, fontWeight:700,
          background:'rgba(0,232,122,0.12)', color:'#00e87a',
          border:'1px solid rgba(0,232,122,0.35)', borderRadius:8,
          padding:'6px 10px', cursor:'pointer'
        }}>Retry</button>
      )}
    </div>
  )
}

export default function MealPlanCard({ plan, onRetry }) {
  const [activeDay,    setActiveDay]  = useState(0)
  const [expandedMeal, setExpanded]   = useState(null)

  if (plan === 'loading') {
    return <LoadingInline />
  }
  if (!plan || !plan.days?.length) {
    return (
      <div style={{
        border:'1px dashed rgba(255,255,255,0.12)', borderRadius:14,
        padding:'12px 14px', background:'rgba(255,255,255,0.02)'
      }}>
        <div style={{fontSize:12, color:'rgba(255,255,255,0.6)'}}>No meal plan yet.</div>
        <button onClick={onRetry} style={{
          marginTop:8, padding:'8px 12px', borderRadius:10,
          border:'1px solid rgba(0,232,122,0.4)', background:'rgba(0,232,122,0.12)',
          color:'#00e87a', fontWeight:700, cursor:'pointer', fontSize:12
        }}>Generate again</button>
      </div>
    )
  }

  const day    = plan.days[activeDay]
  const meals  = ['breakfast', 'lunch', 'snack', 'dinner']

  const dayTotal    = meals.reduce((s, m) => s + (day[m]?.calories || 0), 0)
  const weekTotal   = plan.days.reduce((s, d) => s + meals.reduce((ms, m) => ms + (d[m]?.calories || 0), 0), 0)
  const avgCalories = Math.round(weekTotal / plan.days.length)

  const dayMacros = meals.reduce((acc, m) => {
    if (!day[m]) return acc
    const mac = estimateMacros(day[m], plan.goal)
    return { protein: acc.protein + mac.protein, carbs: acc.carbs + mac.carbs, fat: acc.fat + mac.fat }
  }, { protein: 0, carbs: 0, fat: 0 })

  const goalColor = plan.goal?.includes('weight') ? '#f59e0b'
    : plan.goal?.includes('muscle')  ? '#10b981'
    : plan.goal?.includes('diabet')  ? '#8b5cf6'
    : '#00e87a'

  return (
    <div style={{ minWidth: 260 }}>
      {/* Header */}
      <div style={{
        padding: '14px 14px 12px',
        borderRadius: '14px 14px 0 0',
        background: 'linear-gradient(135deg, rgba(0,232,122,0.08), rgba(0,232,122,0.03))',
        border: '1px solid rgba(0,232,122,0.15)', borderBottom: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(0,232,122,0.12)', border: '1px solid rgba(0,232,122,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🍽️</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-0.3px' }}>
                7-Day Meal Plan
              </div>
              <div style={{ fontSize: 10, color: '#00e87a', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: 1 }}>
                {plan.diet?.toUpperCase()} · {avgCalories} KCAL/DAY AVG
              </div>
            </div>
          </div>
          <div style={{
            padding: '3px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', whiteSpace: 'nowrap',
            background: `${goalColor}18`, color: goalColor, border: `1px solid ${goalColor}30`,
          }}>
            {plan.goal?.split('(')[0]?.trim()?.slice(0, 18) || 'Balanced'}
          </div>
        </div>

        {/* Day tabs */}
        <div style={{ display: 'flex', gap: 3 }}>
          {plan.days.map((d, i) => {
            const dayName = d.day || DAYS_FULL[i] || `Day ${i+1}`
            const short   = DAY_SHORT[DAYS_FULL.indexOf(dayName)] || dayName.slice(0, 3)
            return (
              <button key={i} onClick={() => { setActiveDay(i); setExpanded(null) }} style={{
                flex: 1, padding: '5px 2px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
                background: i === activeDay ? '#00e87a' : 'rgba(255,255,255,0.06)',
                color:       i === activeDay ? '#000'    : 'rgba(255,255,255,0.45)',
                transition: 'all 0.15s',
                boxShadow: i === activeDay ? '0 2px 8px rgba(0,232,122,0.3)' : 'none',
              }}>{short}</button>
            )
          })}
        </div>
      </div>

      {/* Day summary strip */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderBottom: 'none',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <CaloriRing value={dayTotal} total={avgCalories * 1.3} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>{day.day || DAYS_FULL[activeDay]}</span>
            <span style={{ color: '#00e87a', fontFamily: 'var(--font-mono)' }}>{dayTotal} kcal</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <MacroBar label="Protein" value={dayMacros.protein} max={180} color="#10b981" />
            <MacroBar label="Carbs"   value={dayMacros.carbs}   max={300} color="#f59e0b" />
            <MacroBar label="Fat"     value={dayMacros.fat}     max={100} color="#8b5cf6" />
          </div>
        </div>
      </div>

      {/* Meals */}
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
        {meals.map((mealType, mi) => {
          const meal   = day[mealType]
          if (!meal) return null
          const cfg    = MEAL_CONFIG[mealType]
          const macros = estimateMacros(meal, plan.goal)
          const isOpen = expandedMeal === mealType
          const isLast = mi === meals.length - 1
          return (
            <div key={mealType} style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setExpanded(isOpen ? null : mealType)} style={{
                width: '100%', padding: '10px 14px',
                background: isOpen ? cfg.bg : 'rgba(255,255,255,0.02)',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'background 0.15s',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>{cfg.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>
                      {meal.calories} kcal
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {meal.name}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>›</div>
              </button>

              {isOpen && (
                <div style={{
                  padding: '0 14px 12px 54px', background: cfg.bg,
                  borderTop: `1px solid ${cfg.border}`,
                  animation: 'mealFadeIn 0.18s ease',
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8, marginBottom: 10 }}>
                    {meal.items?.map((item, i) => (
                      <span key={i} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 99,
                        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)',
                      }}>{item}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { label: 'P', value: macros.protein, color: '#10b981' },
                      { label: 'C', value: macros.carbs,   color: '#f59e0b' },
                      { label: 'F', value: macros.fat,     color: '#8b5cf6' },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: 4, fontSize: 8, fontWeight: 700,
                          background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{m.label}</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{m.value}g</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Week overview + navigation */}
      <div style={{
        marginTop: 8, padding: '8px 12px', borderRadius: 10,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 20 }}>
          {plan.days.map((d, i) => {
            const dayKcal = meals.reduce((s, m) => s + (d[m]?.calories || 0), 0)
            const h = Math.max(4, Math.round((dayKcal / (avgCalories * 1.3)) * 20))
            return (
              <div key={i} onClick={() => { setActiveDay(i); setExpanded(null) }} style={{
                width: 10, height: h, borderRadius: 3, cursor: 'pointer',
                background: i === activeDay ? '#00e87a' : 'rgba(255,255,255,0.12)',
                transition: 'all 0.15s',
                boxShadow: i === activeDay ? '0 0 6px rgba(0,232,122,0.4)' : 'none',
              }} />
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => { setActiveDay(d => Math.max(0, d-1)); setExpanded(null) }}
            disabled={activeDay === 0}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
              color: activeDay === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
              fontSize: 11, padding: '3px 10px', cursor: activeDay === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
            }}>← Prev</button>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
            {activeDay+1}/{plan.days.length}
          </span>
          <button onClick={() => { setActiveDay(d => Math.min(plan.days.length-1, d+1)); setExpanded(null) }}
            disabled={activeDay === plan.days.length-1}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
              color: activeDay === plan.days.length-1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
              fontSize: 11, padding: '3px 10px', cursor: activeDay === plan.days.length-1 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
            }}>Next →</button>
        </div>
      </div>

      <style>{`
        @keyframes mealFadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      `}</style>
    </div>
  )
}