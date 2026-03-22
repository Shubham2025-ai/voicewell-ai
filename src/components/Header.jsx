import React from 'react'
import EmotionBadge from './EmotionBadge.jsx'

export default function Header({
  language, onLanguageToggle,
  darkMode, onDarkToggle,
  onClearChat, onSummary,
  emotion, emotionLoading,
  reminderCount, onRemindersToggle,
}) {
  return (
    <header
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
        >
          🎙️
        </div>
        <div>
          <div className="font-bold text-base text-white leading-tight">VoiceWell AI</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Health companion</div>
        </div>
        {emotion && (
          <div className="ml-2 hidden sm:block">
            <EmotionBadge emotion={emotion} loading={emotionLoading} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">

        {/* Summary */}
        <button
          onClick={onSummary}
          data-tip="Session summary"
          className="tooltip w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          📋
        </button>

        {/* Reminders */}
        <button
          onClick={onRemindersToggle}
          data-tip="Medication reminders"
          className="tooltip relative w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          💊
          {reminderCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
              style={{ background: '#ef4444', color: '#fff', fontSize: '9px' }}
            >
              {reminderCount}
            </span>
          )}
        </button>

        {/* Language */}
        <button
          onClick={onLanguageToggle}
          data-tip="Toggle language"
          className="tooltip flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <span>{language === 'en-US' ? '🇬🇧' : '🇮🇳'}</span>
          <span>{language === 'en-US' ? 'EN' : 'हिं'}</span>
        </button>

        {/* Dark mode */}
        <button
          onClick={onDarkToggle}
          data-tip={darkMode ? 'Light mode' : 'Dark mode'}
          className="tooltip w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Clear */}
        <button
          onClick={onClearChat}
          data-tip="Clear chat"
          className="tooltip w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          🗑️
        </button>
      </div>
    </header>
  )
}