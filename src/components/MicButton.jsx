import React from 'react'

export default function MicButton({ isListening, isSpeaking, onClick, onStop, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

      {/* Outer ring + button */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Outer decorative ring */}
        <div style={{
          position: 'absolute',
          width: 96, height: 96,
          borderRadius: '50%',
          border: `1px solid ${isListening ? 'rgba(255,77,109,0.3)' : 'var(--border)'}`,
          transition: 'all 0.3s',
        }} />
        <div style={{
          position: 'absolute',
          width: 112, height: 112,
          borderRadius: '50%',
          border: `1px solid ${isListening ? 'rgba(255,77,109,0.15)' : 'transparent'}`,
          transition: 'all 0.3s',
        }} />

        {/* Main mic button */}
        <button
          onClick={isSpeaking ? onStop : onClick}
          disabled={false}
          className={isListening ? 'mic-active' : (!isSpeaking ? 'mic-idle' : '')}
          style={{
            width: 76, height: 76,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontFamily: 'var(--font-body)',
            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            position: 'relative',
            zIndex: 1,
            ...(isSpeaking ? {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              transform: 'scale(0.95)',
            } : isListening ? {
              background: 'linear-gradient(135deg, var(--danger), #ff8e8e)',
              transform: 'scale(1.05)',
            } : {
              background: 'var(--accent)',
              transform: 'scale(1)',
            }),
          }}
          onMouseEnter={e => { if (!isListening && !isSpeaking) e.currentTarget.style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { if (!isListening && !isSpeaking) e.currentTarget.style.transform = 'scale(1)' }}
          aria-label={isSpeaking ? 'Stop speaking' : isListening ? 'Stop listening' : 'Start speaking'}
        >
          {isSpeaking ? '⏹' : isListening ? '⏹' : '🎤'}
        </button>
      </div>

      {/* Status pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px',
        borderRadius: 99,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        fontSize: 12, fontWeight: 500,
        color: isSpeaking ? '#667eea' : isListening ? 'var(--danger)' : 'var(--text-3)',
        transition: 'all 0.3s',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: isSpeaking ? '#667eea' : isListening ? 'var(--danger)' : 'var(--text-3)',
          boxShadow: isListening ? '0 0 6px var(--danger)' : isSpeaking ? '0 0 6px #667eea' : 'none',
          transition: 'all 0.3s',
        }} />
        {isSpeaking ? 'Agent speaking — tap to stop'
          : isListening ? 'Listening…'
          : 'Tap to speak'}
      </div>

      {/* Stop button row when speaking */}
      {isSpeaking && (
        <button
          onClick={onStop}
          className="fade-up"
          style={{
            padding: '6px 18px',
            borderRadius: 99,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text-2)',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          Stop speaking
        </button>
      )}

      {/* Errors */}
      {error === 'mic-denied' && (
        <div style={{ fontSize: 12, color: 'var(--danger)', textAlign: 'center', maxWidth: 240 }}>
          Mic access denied. Allow in Chrome settings and refresh.
        </div>
      )}
      {error === 'not-supported' && (
        <div style={{ fontSize: 12, color: 'var(--danger)', textAlign: 'center', maxWidth: 240 }}>
          Please open in Chrome for voice features.
        </div>
      )}
    </div>
  )
}