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
      height: 'var(--header-h)',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.25rem',
      gap: '12px',
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: 'auto' }}>
        <div style={{
          width: 36, height: 36,
          background: 'var(--accent)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
          boxShadow: '0 0 12px var(--accent-glow)',
          flexShrink: 0,
        }}>
          🎙️
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            VoiceWell AI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isConnected ? 'var(--accent)' : 'var(--text-3)',
              boxShadow: isConnected ? '0 0 6px var(--accent)' : 'none',
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Emotion badge — desktop only */}
        {emotion && (
          <div style={{ marginLeft: 8, display: 'none' }} className="sm:block">
            <EmotionBadge emotion={emotion} loading={emotionLoading} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

        {/* Summary */}
        <HeaderBtn onClick={onSummary} tip="Session summary" icon="📋" />

        {/* Reminders */}
        <div style={{ position: 'relative' }}>
          <HeaderBtn onClick={onRemindersToggle} tip="Medication reminders" icon="💊" />
          {reminderCount > 0 && (
            <div style={{
              position: 'absolute', top: -3, right: -3,
              width: 16, height: 16,
              background: 'var(--danger)',
              borderRadius: '50%',
              fontSize: 9, fontWeight: 700,
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--surface)',
            }}>
              {reminderCount}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />

        {/* Language */}
        <button
          onClick={onLanguageToggle}
          data-tip="Toggle language"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12, fontWeight: 500,
            color: 'var(--text-2)',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 14 }}>{language === 'en-US' ? '🇬🇧' : '🇮🇳'}</span>
          <span>{language === 'en-US' ? 'EN' : 'हिं'}</span>
        </button>

        {/* Dark mode */}
        <HeaderBtn onClick={onDarkToggle} tip={darkMode ? 'Light mode' : 'Dark mode'} icon={darkMode ? '☀️' : '🌙'} />

        {/* Clear */}
        <HeaderBtn onClick={onClearChat} tip="Clear conversation" icon="🗑️" />
      </div>
    </header>
  )
}

function HeaderBtn({ onClick, tip, icon }) {
  return (
    <button
      onClick={onClick}
      data-tip={tip}
      style={{
        width: 34, height: 34,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 15,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)' }}
    >
      {icon}
    </button>
  )
}