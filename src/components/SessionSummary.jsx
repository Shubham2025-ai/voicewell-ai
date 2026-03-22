import React, { useState } from 'react'

/**
 * SessionSummary — shown when user asks for a summary or at session end.
 * Groq generates the summary; this component renders it beautifully.
 */
export default function SessionSummary({ summary, onClose, onSpeak }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = [
      'VoiceWell AI — Session Summary',
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      summary.overview,
      '',
      'Topics discussed:',
      ...summary.topics.map(t => `• ${t}`),
      '',
      'Health tips:',
      ...summary.tips.map(t => `• ${t}`),
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="mx-2 mb-4 rounded-2xl overflow-hidden summary-enter"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--teal)', color: '#fff' }}
      >
        <div className="flex items-center gap-2">
          <span>📋</span>
          <span className="font-semibold text-sm">Session Summary</span>
          <span className="text-xs opacity-75">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSpeak(
              `Here's your session summary. ${summary.overview} Topics covered: ${summary.topics.join(', ')}. Tips for you: ${summary.tips.join('. ')}`
            )}
            className="text-xs px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            🔊 Read
          </button>
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            {copied ? '✅' : '📋 Copy'}
          </button>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3" style={{ background: 'var(--bubble-agent-bg)' }}>

        {/* Overview */}
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
          {summary.overview}
        </p>

        {/* Topics */}
        {summary.topics?.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--teal)' }}>
              Topics Discussed
            </div>
            <div className="flex flex-wrap gap-1.5">
              {summary.topics.map((t, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Health tips */}
        {summary.tips?.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--teal)' }}>
              Personalised Tips For You
            </div>
            <div className="space-y-1.5">
              {summary.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span className="mt-0.5 flex-shrink-0">✦</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}