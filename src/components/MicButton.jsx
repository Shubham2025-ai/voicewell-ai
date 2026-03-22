import React from 'react'

/**
 * MicButton — improved with:
 * - Stop/interrupt button when agent is speaking (separate red ✕ button)
 * - Three distinct states: idle / listening / speaking
 * - Cleaner design with label ring
 */
export default function MicButton({ isListening, isSpeaking, onClick, onStop, error }) {
  return (
    <div className="flex flex-col items-center gap-3">

      {/* Button row */}
      <div className="flex items-center gap-5">

        {/* Stop button — only visible while agent speaks */}
        {isSpeaking && (
          <button
            onClick={onStop}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base
                       shadow-md transition-all active:scale-95 hover:scale-105"
            style={{ background: '#ef4444' }}
            title="Stop speaking"
          >
            ⏹
          </button>
        )}

        {/* Main mic button */}
        <button
          onClick={onClick}
          disabled={isSpeaking}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center
            text-white text-3xl shadow-lg transition-all duration-200
            active:scale-95
            ${isSpeaking
              ? 'cursor-not-allowed opacity-40'
              : isListening
                ? 'pulse-ring hover:scale-105 cursor-pointer'
                : 'hover:scale-105 cursor-pointer'
            }
          `}
          style={{
            background: isSpeaking
              ? 'var(--text-secondary)'
              : isListening
                ? '#ef4444'
                : 'var(--teal)',
            boxShadow: isListening
              ? '0 0 0 4px rgba(239,68,68,0.15)'
              : isSpeaking
                ? 'none'
                : '0 0 0 4px rgba(13,148,136,0.15)',
          }}
          aria-label={isListening ? 'Stop listening' : 'Start speaking'}
        >
          {isListening ? '⏹' : '🎤'}
        </button>

        {/* Spacer to balance the stop button */}
        {isSpeaking && <div className="w-11 h-11" />}
      </div>

      {/* Status label */}
      <div
        className="text-sm font-medium px-4 py-1 rounded-full"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          color: isSpeaking
            ? 'var(--teal)'
            : isListening
              ? '#ef4444'
              : 'var(--text-secondary)',
        }}
      >
        {isSpeaking
          ? '🔊 Agent is speaking…'
          : isListening
            ? '🔴 Listening… tap to stop'
            : '🎤 Tap to speak'
        }
      </div>

      {/* Error messages */}
      {error === 'mic-denied' && (
        <p className="text-xs text-red-500 text-center max-w-xs">
          Mic blocked. Allow microphone in Chrome settings → refresh page.
        </p>
      )}
      {error === 'not-supported' && (
        <p className="text-xs text-red-500 text-center max-w-xs">
          Web Speech API not supported. Please open in Chrome.
        </p>
      )}
      {error === 'no-speech' && (
        <p className="text-xs text-amber-500 text-center max-w-xs">
          No speech detected — please speak closer to the mic.
        </p>
      )}
    </div>
  )
}