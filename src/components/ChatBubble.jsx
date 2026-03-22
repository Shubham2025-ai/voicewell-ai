import React, { useState, useEffect } from 'react'

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [displayed, setDisplayed] = useState(isUser ? message.content : '')
  const [typing, setTyping] = useState(false)

  // Typewriter effect for agent messages
  useEffect(() => {
    if (isUser || message.nutritionCard || message.weatherCard) {
      setDisplayed(message.content)
      return
    }
    setTyping(true)
    setDisplayed('')
    const text = message.content
    let i = 0
    const speed = Math.max(12, Math.min(30, 1200 / text.length)) // adaptive speed
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(timer); setTyping(false) }
    }, speed)
    return () => clearInterval(timer)
  }, [message.content, isUser]) // eslint-disable-line

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={isUser ? 'pop-right' : 'pop-left'} style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: 8, marginBottom: 14,
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: isUser ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
        background: isUser
          ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
          : 'var(--green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: isUser ? '#fff' : '#000',
        flexShrink: 0,
        boxShadow: isUser ? 'none' : '0 0 10px var(--green-glow)',
        fontFamily: 'var(--font-display)',
      }}>
        {isUser ? 'U' : '✦'}
      </div>

      <div style={{
        maxWidth: '74%', display: 'flex', flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4,
      }}>
        <div style={{
          padding: '10px 14px',
          fontSize: 14, lineHeight: 1.65,
          fontFamily: 'var(--font-body)',
          ...(isUser ? {
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff',
            borderRadius: '16px 16px 4px 16px',
            boxShadow: '0 3px 14px rgba(99,102,241,0.3)',
          } : {
            background: 'var(--surface)',
            color: 'var(--text-1)',
            border: '1px solid var(--border)',
            borderRadius: '16px 16px 16px 4px',
            boxShadow: 'var(--shadow)',
          }),
        }}>
          {message.nutritionCard ? <NutritionCard data={message.nutritionCard} />
           : message.weatherCard  ? <WeatherCard  data={message.weatherCard}  />
           : <span className={typing ? 'cursor-blink' : ''}>{displayed}</span>
          }
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {message.time}
          </span>
          {!isUser && !typing && (
            <button onClick={handleCopy} style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 5,
              border: '1px solid var(--border)', background: 'var(--surface-2)',
              color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}>
              {copied ? '✓ copied' : 'copy'}
            </button>
          )}
          {!isUser && message.latency && (
            <span className="lbadge" style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 5,
              background: 'var(--green-dim)', color: 'var(--green-2)',
              fontFamily: 'var(--font-mono)',
            }}>{message.latency}ms</span>
          )}
        </div>
      </div>
    </div>
  )
}

function NutritionCard({ data }) {
  const items = [
    { l:'Cal',     v:`${data.calories}`, u:'kcal', c:'#ff6b6b' },
    { l:'Protein', v:`${data.protein}`,  u:'g',    c:'var(--green)' },
    { l:'Carbs',   v:`${data.carbs}`,    u:'g',    c:'#60a5fa' },
    { l:'Fat',     v:`${data.fat}`,      u:'g',    c:'#fbbf24' },
  ]
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
        🥗 {data.name}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {items.map(({ l, v, u, c }) => (
          <div key={l} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '6px 10px' }}>
            <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 1 }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: c, fontFamily: 'var(--font-display)' }}>
              {v}<span style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}>{u}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeatherCard({ data }) {
  const aqiColors = ['','#00c27a','#f59e0b','#f59e0b','#ef4444','#9b2335']
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
        🌤️ {data.city}
      </div>
      <div style={{ fontSize: 26, fontWeight: 300, fontFamily: 'var(--font-display)', marginBottom: 2 }}>
        {data.temp}°C
      </div>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, textTransform: 'capitalize' }}>
        {data.description}
      </div>
      {data.aqi && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 99, fontSize: 11,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: aqiColors[data.aqi] || '#888' }} />
          AQI {data.aqi} · {data.aqiLabel}
        </div>
      )}
      {data.tip && <div style={{ fontSize: 11, marginTop: 8, opacity: 0.8, fontStyle: 'italic' }}>{data.tip}</div>}
    </div>
  )
}