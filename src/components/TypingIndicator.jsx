import React from 'react'

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3 bubble-enter">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: 'var(--teal)', color: '#fff' }}
      >
        VW
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-sm"
        style={{
          background: 'var(--bubble-agent-bg)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="w-2 h-2 rounded-full dot-1" style={{ background: 'var(--teal)' }} />
        <div className="w-2 h-2 rounded-full dot-2" style={{ background: 'var(--teal)' }} />
        <div className="w-2 h-2 rounded-full dot-3" style={{ background: 'var(--teal)' }} />
      </div>
    </div>
  )
}