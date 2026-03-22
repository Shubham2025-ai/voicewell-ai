import React from 'react'
import EmotionBadge from './EmotionBadge.jsx'

export default function Header({
  language, onLanguageToggle,
  darkMode, onDarkToggle,
  onClearChat, onSummary,
  emotion, emotionLoading,
  reminderCount, onRemindersToggle,
  isConnected,
}) {
  return (
    <header style={{
      background: 'var(--header-bg)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      height: 58,
      display: 'flex', alignItems: 'center',
      padding: '0 1.25rem', gap: 12,
      flexShrink: 0, position: 'relative', zIndex: 20,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--green)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 17, boxShadow: '0 0 14px var(--green-glow)',
          flexShrink: 0,
        }}>🎙️</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 15, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.2,
          }}>VoiceWell AI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: isConnected ? 'var(--green)' : '#666',
              boxShadow: isConnected ? '0 0 5px var(--green)' : 'none',
            }}/>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
              {isConnected ? 'online' : 'offline'}
            </span>
          </div>
        </div>

        {/* Emotion badge */}
        {emotion && <div className="hidden sm:block" style={{ marginLeft: 6 }}>
          <EmotionBadge emotion={emotion} loading={emotionLoading} />
        </div>}

        {/* Medical disclaimer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 9px', borderRadius: 99,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 10, color: 'rgba(255,255,255,0.4)',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12 }}>ⓘ</span>
          <span className="hidden sm:inline">AI · Not medical advice</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Btn onClick={onSummary}          tip="Session summary"        icon="📋" />
        <div style={{ position: 'relative' }}>
          <Btn onClick={onRemindersToggle} tip="Medication reminders"   icon="💊" />
          {reminderCount > 0 && (
            <div style={{
              position: 'absolute', top: -3, right: -3,
              width: 15, height: 15, borderRadius: '50%',
              background: 'var(--red)', color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--header-bg)',
            }}>{reminderCount}</div>
          )}
        </div>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <button onClick={onLanguageToggle} data-tip="Toggle language" style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
          fontFamily: 'var(--font-body)', transition: 'all 0.15s',
        }}>
          <span style={{ fontSize: 13 }}>{language === 'en-US' ? '🇬🇧' : '🇮🇳'}</span>
          {language === 'en-US' ? 'EN' : 'हिं'}
        </button>
        <Btn onClick={onDarkToggle}  tip={darkMode ? 'Light mode' : 'Dark mode'} icon={darkMode ? '☀️' : '🌙'} />
        <Btn onClick={onClearChat}   tip="Clear chat"                  icon="🗑️" />
      </div>
    </header>
  )
}

function Btn({ onClick, tip, icon }) {
  return (
    <button onClick={onClick} data-tip={tip} style={{
      width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.06)', cursor: 'pointer', fontSize: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
    >{icon}</button>
  )
}