import React from 'react'

/**
 * RemindersPanel — slide-in drawer showing all saved medication reminders.
 * Shows mock mode warning if Firebase is not configured.
 */
export default function RemindersPanel({ reminders, isMockMode, notifGranted, onRemove, onClose }) {
  return (
    <div
      className="absolute inset-y-0 right-0 w-72 z-50 flex flex-col shadow-2xl"
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            💊 Medication Reminders
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {isMockMode ? '📦 Mock mode (no Firebase)' : '🔥 Firebase connected'}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm hover:opacity-70 transition-opacity"
          style={{ background: 'var(--border)', color: 'var(--text-primary)' }}
        >
          ✕
        </button>
      </div>

      {/* Notification permission warning */}
      {!notifGranted && (
        <div
          className="mx-3 mt-3 px-3 py-2 rounded-lg text-xs"
          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
        >
          ⚠️ Allow browser notifications to receive reminder alerts
        </div>
      )}

      {/* Reminders list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {reminders.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">💊</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No reminders yet
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Say "Remind me to take aspirin at 8 AM"
            </div>
          </div>
        ) : (
          reminders.map(r => (
            <div
              key={r.id}
              className="mb-2 p-3 rounded-xl"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                    {r.medication}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.times.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(r.id)}
                  className="text-xs px-2 py-1 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0"
                  style={{ background: '#fee2e2', color: '#dc2626' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer tip */}
      <div
        className="px-4 py-3 text-xs flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        💡 Tip: Say "What medications do I have today?" to hear your schedule
      </div>
    </div>
  )
}