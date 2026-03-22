import React, { useEffect, useRef } from 'react'

export default function MicButton({ isListening, isSpeaking, onClick, onStop, error }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  // Canvas voice visualizer ring
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 140, H = 140
    canvas.width = W; canvas.height = H
    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const cx = W / 2, cy = H / 2
      const bars = 36
      const baseR = 52

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
        const noise = isListening
          ? Math.abs(Math.sin(frame * 0.08 + i * 0.7)) * 14 + Math.random() * 8
          : isSpeaking
          ? Math.abs(Math.sin(frame * 0.05 + i * 0.5)) * 10
          : 2
        const r1 = baseR
        const r2 = baseR + noise

        const x1 = cx + Math.cos(angle) * r1
        const y1 = cy + Math.sin(angle) * r1
        const x2 = cx + Math.cos(angle) * r2
        const y2 = cy + Math.sin(angle) * r2

        const hue = isListening ? 0 : isSpeaking ? 250 : 145
        const alpha = isListening ? 0.8 : isSpeaking ? 0.5 : 0.25
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      frame++
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [isListening, isSpeaking])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* Canvas visualizer + mic button */}
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Pulse rings when listening */}
        {isListening && <>
          <div className="mic-pulse-1" style={{
            position: 'absolute', inset: '28px',
            borderRadius: '50%', border: '2px solid var(--red)',
          }} />
          <div className="mic-pulse-2" style={{
            position: 'absolute', inset: '28px',
            borderRadius: '50%', border: '1px solid var(--red)',
          }} />
        </>}

        {/* Main button */}
        <button
          onClick={isSpeaking ? onStop : onClick}
          className={!isListening && !isSpeaking ? 'mic-breathe' : ''}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 68, height: 68,
            borderRadius: '50%', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            fontFamily: 'var(--font-body)',
            ...(isSpeaking ? {
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            } : isListening ? {
              background: 'linear-gradient(135deg,var(--red),#ff8080)',
              transform: 'translate(-50%,-50%) scale(1.08)',
            } : {
              background: 'var(--green)',
              color: '#000',
            }),
          }}
          aria-label={isSpeaking ? 'Stop' : isListening ? 'Stop listening' : 'Start speaking'}
        >
          {isSpeaking ? '⏹' : isListening ? '⏹' : '🎤'}
        </button>
      </div>

      {/* Status pill */}
      <div style={{
        padding: '5px 14px', borderRadius: 99,
        background: 'var(--surface)', border: '1px solid var(--border)',
        fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-mono)',
        color: isSpeaking ? '#8b5cf6' : isListening ? 'var(--red)' : 'var(--text-3)',
        display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: 'var(--shadow)', transition: 'all 0.3s',
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: isSpeaking ? '#8b5cf6' : isListening ? 'var(--red)' : 'var(--text-3)',
          boxShadow: isListening ? '0 0 6px var(--red)' : 'none',
        }} />
        {isSpeaking ? 'speaking — tap to stop' : isListening ? 'listening…' : 'tap to speak'}
      </div>

      {/* Errors */}
      {error === 'mic-denied' && (
        <div style={{ fontSize: 11, color: 'var(--red)', textAlign: 'center', maxWidth: 200 }}>
          Mic blocked. Allow in Chrome → refresh.
        </div>
      )}
      {error === 'not-supported' && (
        <div style={{ fontSize: 11, color: 'var(--red)', textAlign: 'center', maxWidth: 200 }}>
          Use Chrome for voice features.
        </div>
      )}
    </div>
  )
}