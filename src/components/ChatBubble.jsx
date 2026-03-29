import React, { useState, useEffect } from 'react'
import DrugInteractionCard from './DrugInteractionCard.jsx'
import BMICard from './BMICard.jsx'
import DoctorFinderCard from './DoctorFinderCard.jsx'
import AppointmentCard from './AppointmentCard.jsx'
import WaterCard from './WaterCard.jsx'
import MealPlanCard from './MealPlanCard.jsx'

export default function ChatBubble({ message, onSpeak, onQuery }) {
  const isUser  = message.role === 'user'
  const [copied, setCopied]   = useState(false)
  const [displayed, setDisplayed] = useState(isUser ? message.content : '')
  const [typing, setTyping]   = useState(false)

  useEffect(() => {
    if (isUser || message.nutritionCard || message.weatherCard ||
        message.drugCard || message.bmiCard || message.doctorCard ||
        message.appointmentCard || message.waterCard || message.mealPlanCard) {
      setDisplayed(message.content)
      return
    }
    setTyping(true)
    setDisplayed('')
    const text  = message.content
    let i       = 0
    const speed = Math.max(10, Math.min(28, 1000 / text.length))
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(timer); setTyping(false) }
    }, speed)
    return () => clearInterval(timer)
  }, [message.content, isUser]) // eslint-disable-line

  const copy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const play = () => {
    if (typeof onSpeak === 'function') onSpeak(message.content)
  }

  const hasCard = message.nutritionCard || message.weatherCard || message.drugCard ||
                  message.bmiCard || message.doctorCard || message.appointmentCard ||
                  message.waterCard || message.mealPlanCard

  return (
    <div className={isUser ? 'pop-r' : 'pop-l'} style={{
      display:'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems:'flex-end', gap:8, marginBottom:16,
    }}>
      {/* Avatar */}
      <div style={{
        width:28, height:28, borderRadius: isUser ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
        background: isUser
          ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
          : 'linear-gradient(135deg,#00e87a,#00c264)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, fontWeight:700,
        color: isUser ? '#fff' : '#000',
        flexShrink:0,
        boxShadow: isUser
          ? '0 4px 12px rgba(99,102,241,0.4), inset 0 1px 2px rgba(255,255,255,0.2)'
          : '0 4px 12px rgba(0,232,122,0.35), inset 0 1px 2px rgba(255,255,255,0.15)',
        fontFamily:'var(--font-display)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = isUser
          ? '0 6px 16px rgba(99,102,241,0.5), inset 0 1px 2px rgba(255,255,255,0.3)'
          : '0 6px 16px rgba(0,232,122,0.5), inset 0 1px 2px rgba(255,255,255,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = isUser
          ? '0 4px 12px rgba(99,102,241,0.4), inset 0 1px 2px rgba(255,255,255,0.2)'
          : '0 4px 12px rgba(0,232,122,0.35), inset 0 1px 2px rgba(255,255,255,0.15)';
      }}
      >
        {isUser ? 'U' : '✦'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: hasCard ? '85%' : '72%',
        display:'flex', flexDirection:'column',
        alignItems: isUser ? 'flex-end' : 'flex-start', gap:4,
      }}>
        <div
          style={{
            padding: hasCard ? '12px 14px' : '10px 14px',
            fontSize:13.5, lineHeight:1.65,
            fontFamily:'var(--font-body)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(isUser ? {
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff',
              borderRadius:'16px 16px 4px 16px',
              boxShadow:'0 6px 20px rgba(99,102,241,0.3), inset 0 1px 2px rgba(255,255,255,0.2)',
            } : {
              background:'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(12px)',
              color:'var(--text-1)',
              border:'1px solid rgba(0,232,122,0.15)',
              borderRadius:'16px 16px 16px 4px',
              boxShadow:'0 6px 20px rgba(0,0,0,0.5), inset 0 1px 2px rgba(0,232,122,0.08)',
            }),
          }}
          aria-live={isUser ? undefined : 'polite'}
          role={isUser ? 'presentation' : 'status'}
          onMouseEnter={(e) => {
            if (!isUser) {
              e.currentTarget.style.background = 'rgba(17, 17, 17, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(0,232,122,0.25)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6), inset 0 1px 2px rgba(0,232,122,0.12)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUser) {
              e.currentTarget.style.background = 'rgba(17, 17, 17, 0.8)';
              e.currentTarget.style.borderColor = 'rgba(0,232,122,0.15)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5), inset 0 1px 2px rgba(0,232,122,0.08)';
            }
          }}
        >
          {message.nutritionCard   ? <NutritionCard   data={message.nutritionCard} />
          :message.weatherCard    ? <WeatherCard     data={message.weatherCard} />
          :message.drugCard       ? <DrugInteractionCard data={message.drugCard} />
          :message.bmiCard        ? <BMICard         data={message.bmiCard} />
          :message.doctorCard     ? <DoctorFinderCard data={message.doctorCard} />
          :message.appointmentCard? <AppointmentCard  data={message.appointmentCard} />
          :message.waterCard      ? <WaterCard        data={message.waterCard} type={message.waterType} />
          :message.mealPlanCard   ? <MealPlanCard     plan={message.mealPlanCard} />
          : <span className={typing ? 'cursor' : ''}>{displayed}</span>}
        </div>

        {/* Clarifier options as chips (if provided) */}
        {!isUser && message.options?.length > 0 && (
          <div
            className="options-row"
            role="group"
            aria-label="Clarification options"
            style={{ display:'flex', gap:8, flexWrap:'wrap' }}
          >
            {message.options.map(opt => (
              <button
                key={opt}
                onClick={() => onQuery?.(opt)}
                aria-label={`Select: ${opt}`}
                style={{
                  padding:'6px 10px',
                  borderRadius:12,
                  border:'1px solid rgba(255,255,255,0.12)',
                  background:'rgba(255,255,255,0.05)',
                  color:'rgba(255,255,255,0.85)',
                  fontSize:12,
                  cursor:'pointer',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display:'flex', alignItems:'center', gap:7,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}>
          <span style={{ fontSize:10, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
            {message.time}
          </span>
          {!isUser && !typing && (
            <>
              <button onClick={play} aria-label="Play message audio" style={{
                fontSize:10, padding:'1px 6px', borderRadius:5,
                border:'1px solid var(--border)', background:'var(--surface-2)',
                color:'var(--text-3)', cursor:'pointer', fontFamily:'var(--font-body)',
                transition:'all 0.14s',
              }}>play</button>
              <button onClick={copy} aria-label="Copy message text" style={{
                fontSize:10, padding:'1px 6px', borderRadius:5,
                border:'1px solid var(--border)', background:'var(--surface-2)',
                color:'var(--text-3)', cursor:'pointer', fontFamily:'var(--font-body)',
                transition:'all 0.14s',
              }}>
                {copied ? '✓' : 'copy'}
              </button>
            </>
          )}
          {!isUser && message.latency && (
            <span className="lbadge" style={{
              fontSize:9, padding:'1px 5px', borderRadius:5,
              background:'rgba(0,232,122,0.1)', color:'#00e87a',
              fontFamily:'var(--font-mono)',
            }}>{message.latency}ms</span>
          )}
        </div>
      </div>
    </div>
  )
}

function NutritionCard({ data }) {
  return (
    <div>
      <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, marginBottom:10 }}>🥗 {data.name}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {[{l:'Calories',v:`${data.calories}`,u:'kcal',c:'#ff6b6b'},{l:'Protein',v:`${data.protein}`,u:'g',c:'#00e87a'},{l:'Carbs',v:`${data.carbs}`,u:'g',c:'#60a5fa'},{l:'Fat',v:`${data.fat}`,u:'g',c:'#fbbf24'}].map(({l,v,u,c})=>(
          <div key={l} style={{background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'6px 10px'}}>
            <div style={{fontSize:10,opacity:0.6,marginBottom:1}}>{l}</div>
            <div style={{fontSize:15,fontWeight:700,color:c,fontFamily:'var(--font-display)'}}>{v}<span style={{fontSize:10,opacity:0.7,marginLeft:2}}>{u}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeatherCard({ data }) {
  return (
    <div>
      <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:12,marginBottom:6}}>🌤️ {data.city}</div>
      <div style={{fontSize:28,fontWeight:300,fontFamily:'var(--font-display)',marginBottom:3}}>{data.temp}°C</div>
      <div style={{fontSize:12,opacity:0.7,marginBottom:8,textTransform:'capitalize'}}>{data.description}</div>
      {data.aqi&&<div style={{display:'inline-flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.07)',padding:'3px 10px',borderRadius:99,fontSize:11}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:['','#00e87a','#f59e0b','#f59e0b','#ef4444','#9b2335'][data.aqi]||'#888'}}/>
        AQI {data.aqi} · {data.aqiLabel}
      </div>}
      {data.tip&&<div style={{fontSize:11,marginTop:8,opacity:0.75,fontStyle:'italic'}}>{data.tip}</div>}
    </div>
  )
}