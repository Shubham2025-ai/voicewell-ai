import React from 'react'
import Card3D from './Card3D.jsx'

export default function HeroSection({ onSetInputValue, onFocusInput }) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2rem 2rem' }}>
      {/* Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, animation: 'float-up 0.8s ease-out' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 99,
            background: 'rgba(0,232,122,0.08)',
            border: '1px solid rgba(0,232,122,0.2)',
            boxShadow: '0 4px 16px rgba(0,232,122,0.1)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#00e87a',
              boxShadow: '0 0 10px #00e87a',
              display: 'inline-block',
              animation: 'pulse-scale 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#00e87a',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
            }}
          >
            AI VOICE AGENTS · HACKATHON 2026
          </span>
        </div>
      </div>

      {/* Main heading */}
      <div style={{ textAlign: 'center', marginBottom: 20, animation: 'float-up 0.8s ease-out 0.1s backwards' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            margin: 0,
            fontSize: 'clamp(42px, 6vw, 76px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-2px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Your AI </span>
          <span
            style={{
              background: 'linear-gradient(135deg, #00e87a, #00b85e)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(0,232,122,0.35), 0 0 120px rgba(0,232,122,0.15)',
              filter: 'drop-shadow(0 0 20px rgba(0,232,122,0.3))',
            }}
          >
            Health
          </span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Companion</span>
        </h1>
      </div>

      {/* Subheading */}
      <p
        style={{
          textAlign: 'center',
          margin: '0 auto 32px',
          fontSize: 17,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7,
          maxWidth: 560,
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          animation: 'float-up 0.8s ease-out 0.2s backwards',
        }}
      >
        Voice-first. Emotion-aware. Multilingual. Ask about symptoms, find doctors nearby,
        manage medications — all through{' '}
        <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>natural conversation</span>.
      </p>

      {/* Quick start and capabilities grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Quick start card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(0,232,122,0.15)',
            borderRadius: 16,
            padding: '1.75rem',
            gridRow: 'span 2',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 2px rgba(0,232,122,0.1)',
            animation: 'card-flip 0.8s ease-out 0.3s backwards',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.25)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            Quick start
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { icon: '🤒', label: 'Headache', full: 'I have a headache since morning' },
              { icon: '😰', label: 'Stress', full: "I'm feeling very stressed and anxious" },
              { icon: '📊', label: 'BMI', full: 'My weight is 70kg and height is 5 feet 8 inches' },
              { icon: '💊', label: 'Drug check', full: 'Can I take ibuprofen with aspirin?' },
              { icon: '🏥', label: 'Find doctor', full: 'Find a doctor near me' },
              { icon: '💧', label: 'Log water', full: 'I drank a glass of water' },
              { icon: '🍽️', label: 'Meal plan', full: 'Plan my vegetarian meals for the week' },
              { icon: '📅', label: 'Appointment', full: 'Book a checkup for tomorrow at 10 AM' },
            ].map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  onSetInputValue(c.full)
                  setTimeout(() => onFocusInput(), 50)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 13px',
                  borderRadius: 10,
                  border: '1px solid rgba(0,232,122,0.15)',
                  background: 'rgba(0,232,122,0.05)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  width: '100%',
                  animation: `float-up 0.6s ease-out ${0.4 + i * 0.05}s backwards`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,232,122,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(0,232,122,0.4)'
                  e.currentTarget.style.transform = 'translateX(4px) translateZ(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,232,122,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,232,122,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(0,232,122,0.15)'
                  e.currentTarget.style.transform = 'translateX(0) translateZ(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{c.icon}</span>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-body)' }}>
                  {c.label}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                  →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Capabilities card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(0,232,122,0.15)',
            borderRadius: 16,
            padding: '1.75rem 2rem',
            gridColumn: 'span 2',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 2px rgba(0,232,122,0.1)',
            animation: 'card-flip 0.8s ease-out 0.15s backwards',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,232,122,0.04)'
            e.currentTarget.style.borderColor = 'rgba(0,232,122,0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
            e.currentTarget.style.borderColor = 'rgba(0,232,122,0.15)'
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.25)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            All capabilities
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { icon: '🎙️', name: 'Voice pipeline', tag: 'STT · LLM · TTS', color: '#00e87a' },
              { icon: '😰', name: 'Emotion detection', tag: 'HuggingFace AI', color: '#a78bfa' },
              { icon: '🧠', name: '8-turn memory', tag: 'Multi-turn context', color: '#60a5fa' },
              { icon: '🇮🇳', name: 'Hindi support', tag: 'Auto-detect language', color: '#fbbf24' },
              { icon: '💊', name: 'Medication alerts', tag: 'Firebase + browser notif', color: '#00e87a' },
              { icon: '🏥', name: 'Doctor finder', tag: 'GPS + OpenStreetMap', color: '#fbbf24' },
              { icon: '📊', name: 'BMI calculator', tag: 'Instant voice calc', color: '#60a5fa' },
              { icon: '💊', name: 'Drug interactions', tag: 'OpenFDA database', color: '#ff6b6b' },
              { icon: '🧘', name: 'Breathing guide', tag: '4-7-8 animated', color: '#a78bfa' },
              { icon: '💧', name: 'Water tracker', tag: 'Daily goal + reminders', color: '#38bdf8' },
              { icon: '🍽️', name: 'Meal planner', tag: '7-day AI-generated', color: '#00e87a' },
              { icon: '📅', name: 'Calendar booking', tag: 'Google Calendar API', color: '#60a5fa' },
            ].map((c, i) => (
              <Card3D key={i} {...c} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
