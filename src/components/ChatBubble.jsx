import React, { useState } from 'react'

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={isUser ? 'bubble-right' : 'bubble-left'} style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 12,
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30,
        borderRadius: isUser ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
        background: isUser
          ? 'linear-gradient(135deg, #667eea, #764ba2)'
          : 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600, color: '#fff',
        flexShrink: 0,
        boxShadow: isUser ? 'none' : '0 0 8px var(--accent-glow)',
        letterSpacing: '-0.3px',
      }}>
        {isUser ? 'You' : '✦'}
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '72%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: 4,
      }}>
        <div
          className="group"
          style={{
            padding: '10px 14px',
            borderRadius: isUser
              ? '16px 16px 4px 16px'
              : '16px 16px 16px 4px',
            fontSize: 14,
            lineHeight: 1.6,
            ...(isUser ? {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(102,126,234,0.3)',
            } : {
              background: 'var(--surface)',
              color: 'var(--text-1)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }),
          }}
        >
          {message.nutritionCard ? (
            <NutritionCard data={message.nutritionCard} />
          ) : message.weatherCard ? (
            <WeatherCard data={message.weatherCard} />
          ) : (
            message.content
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {message.time}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text-3)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
          {!isUser && message.latency && (
            <span className="latency-badge" style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 6,
              background: 'var(--accent-bg)',
              color: 'var(--accent-2)',
              fontFamily: 'var(--font-mono)',
            }}>
              {message.latency}ms
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function NutritionCard({ data }) {
  const items = [
    { label: 'Calories', value: `${data.calories}`, unit: 'kcal', color: '#ff6b6b' },
    { label: 'Protein',  value: `${data.protein}`,  unit: 'g',    color: '#4ecdc4' },
    { label: 'Carbs',    value: `${data.carbs}`,    unit: 'g',    color: '#45b7d1' },
    { label: 'Fat',      value: `${data.fat}`,      unit: 'g',    color: '#f7dc6f' },
  ]
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
        🥗 {data.name}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {items.map(({ label, value, unit, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: '6px 10px',
          }}>
            <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color }}>
              {value}<span style={{ fontSize: 10, fontWeight: 400, opacity: 0.8, marginLeft: 2 }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeatherCard({ data }) {
  const aqiColor = ['', '#00c896', '#f59e0b', '#f59e0b', '#ef4444', '#9b2335'][data.aqi] || '#8896a5'
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
        🌤️ {data.city}
      </div>
      <div style={{ fontSize: 24, fontWeight: 300, marginBottom: 4 }}>{data.temp}°C</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8, textTransform: 'capitalize' }}>{data.description}</div>
      {data.aqi && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.1)',
          padding: '4px 10px', borderRadius: 99,
          fontSize: 12,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: aqiColor }} />
          AQI {data.aqi} · {data.aqiLabel}
        </div>
      )}
      {data.tip && (
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.85, fontStyle: 'italic' }}>
          {data.tip}
        </div>
      )}
    </div>
  )
}