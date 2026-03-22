import React, { useState } from 'react'

export default function ChatBubble({ message }) {
  const isUser  = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`flex w-full mb-3 items-end gap-2 ${isUser ? 'bubble-user flex-row-reverse' : 'bubble-agent flex-row'}`}>

      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mb-1 shadow-sm"
        style={{
          background: isUser ? '#475569' : 'var(--teal)',
          color: '#fff',
          fontSize: '10px',
        }}
      >
        {isUser ? 'You' : 'VW'}
      </div>

      {/* Bubble + footer */}
      <div className={`group relative max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-2.5 text-sm leading-relaxed"
          style={isUser ? {
            background: 'var(--teal)',
            color: '#fff',
            borderRadius: '18px 18px 4px 18px',
            boxShadow: '0 2px 8px rgba(13,148,136,0.25)',
          } : {
            background: 'var(--bubble-agent-bg)',
            color: 'var(--bubble-agent-text)',
            border: '1px solid var(--border)',
            borderRadius: '18px 18px 18px 4px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Nutrition card embedded in bubble */}
          {message.nutritionCard ? (
            <NutritionCard data={message.nutritionCard} />
          ) : message.weatherCard ? (
            <WeatherCard data={message.weatherCard} />
          ) : (
            message.content
          )}
        </div>

        {/* Footer: time + copy + latency */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{message.time}</span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs px-2 py-0.5 rounded-md hover:scale-105"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {copied ? '✅' : '📋'}
            </button>
          )}

          {!isUser && message.latency && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md latency-badge font-mono"
              style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}
            >
              {message.latency}ms
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Nutrition card ──────────────────────────────────────── */
function NutritionCard({ data }) {
  return (
    <div className="pop-in">
      <div className="font-semibold mb-2 flex items-center gap-2">
        <span>🥗</span> {data.name}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: 'Calories', value: `${data.calories} kcal`, icon: '🔥' },
          { label: 'Protein',  value: `${data.protein}g`,      icon: '💪' },
          { label: 'Carbs',    value: `${data.carbs}g`,        icon: '🌾' },
          { label: 'Fat',      value: `${data.fat}g`,          icon: '🫒' },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="rounded-lg px-2 py-1.5 flex items-center gap-1"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <span>{icon}</span>
            <div>
              <div style={{ opacity: 0.75, fontSize: '10px' }}>{label}</div>
              <div className="font-semibold">{value}</div>
            </div>
          </div>
        ))}
      </div>
      {data.text && <div className="mt-2 text-xs opacity-80">{data.text}</div>}
    </div>
  )
}

/* ── Weather card ────────────────────────────────────────── */
function WeatherCard({ data }) {
  return (
    <div className="pop-in">
      <div className="font-semibold mb-1 flex items-center gap-2">
        <span>🌤️</span> {data.city} Weather
      </div>
      <div className="text-xs opacity-90 mb-1">{data.description} · {data.temp}°C</div>
      {data.aqi && (
        <div
          className="text-xs px-2 py-1 rounded-lg inline-block mt-1"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          AQI {data.aqi} · {data.aqiLabel}
        </div>
      )}
      {data.tip && <div className="mt-2 text-xs opacity-85">💡 {data.tip}</div>}
    </div>
  )
}