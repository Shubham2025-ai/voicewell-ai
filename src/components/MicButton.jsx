import React, { useEffect, useRef } from 'react'

export default function MicButton({ isListening, isSpeaking, onClick, onStop, error }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const frame     = useRef(0)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const W = 130, H = 130
    c.width = W; c.height = H

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const cx = W/2, cy = H/2, bars = 32, baseR = 48
      for (let i = 0; i < bars; i++) {
        const angle = (i/bars) * Math.PI * 2 - Math.PI/2
        const noise = isListening
          ? Math.abs(Math.sin(frame.current*0.09 + i*0.8)) * 12 + Math.random()*6
          : isSpeaking
          ? Math.abs(Math.sin(frame.current*0.05 + i*0.5)) * 8
          : 2
        const x1 = cx + Math.cos(angle)*baseR
        const y1 = cy + Math.sin(angle)*baseR
        const x2 = cx + Math.cos(angle)*(baseR+noise)
        const y2 = cy + Math.sin(angle)*(baseR+noise)
        const alpha = isListening ? 0.7 : isSpeaking ? 0.45 : 0.15
        const color = isListening ? `rgba(255,61,90,${alpha})` : `rgba(0,232,122,${alpha})`
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1,y1)
        ctx.lineTo(x2,y2)
        ctx.stroke()
      }
      frame.current++
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [isListening, isSpeaking])

  const label = isSpeaking ? 'Stop speaking' : isListening ? 'Stop listening' : 'Start voice input'
  const statusText = isSpeaking ? 'speaking — tap to stop' : isListening ? 'listening…' : 'tap to speak'
  const statusColor = isSpeaking ? '#8b5cf6' : isListening ? '#ff3d5a' : 'rgba(255,255,255,0.55)'
  const dotColor = isSpeaking ? '#8b5cf6' : isListening ? '#ff3d5a' : '#6b7280'

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <div style={{ position:'relative', width:130, height:130, flexShrink:0 }}>
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0 }} />

        {/* Glow background */}
        {(isListening || isSpeaking) && (
          <div style={{
            position:'absolute', inset:0,
            borderRadius:'50%',
            background: isListening
              ? 'radial-gradient(circle, rgba(255,61,90,0.15) 0%, rgba(255,61,90,0) 70%)'
              : 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)',
            animation: 'pulse-scale 2s ease-in-out infinite',
          }}
          />
        )}

        {/* Pulse rings */}
        {isListening && (
          <>
            <div className="mic-ring-1" style={{ position:'absolute', inset:26, borderRadius:'50%', border:'2px solid rgba(255,61,90,0.5)', boxShadow: '0 0 12px rgba(255,61,90,0.3)' }} />
            <div className="mic-ring-2" style={{ position:'absolute', inset:26, borderRadius:'50%', border:'1px solid rgba(255,61,90,0.3)', boxShadow: '0 0 8px rgba(255,61,90,0.2)' }} />
          </>
        )}

        {/* Main button */}
        <button
          type="button"
          aria-pressed={isListening || isSpeaking}
          aria-label={label}
          onClick={isSpeaking ? onStop : onClick}
          className={!isListening && !isSpeaking ? 'mic-breathe' : ''}
          style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:62, height:62, borderRadius:'50%',
            border:'none', cursor:'pointer', fontSize:22,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontFamily:'var(--font-body)',
            outline:'none',
            boxShadow: isSpeaking
              ? '0 8px 24px rgba(99,102,241,0.5), inset 0 1px 2px rgba(255,255,255,0.2)'
              : isListening
              ? '0 8px 24px rgba(255,61,90,0.5), inset 0 1px 2px rgba(255,255,255,0.15)'
              : '0 6px 20px rgba(0,232,122,0.35), inset 0 1px 2px rgba(255,255,255,0.2)',
            ...(isSpeaking ? {
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            } : isListening ? {
              background:'linear-gradient(135deg,#ff3d5a,#ff7080)',
              transform:'translate(-50%,-50%) scale(1.12)',
            } : {
              background:'linear-gradient(135deg,#00e87a,#00c264)',
            }),
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              isSpeaking ? onStop?.() : onClick?.()
            }
          }}
          onMouseEnter={(e) => {
            if (!isListening && !isSpeaking) {
              e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.08)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,232,122,0.5), inset 0 1px 2px rgba(255,255,255,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isListening && !isSpeaking) {
              e.currentTarget.style.transform = 'translate(-50%,-50%)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,232,122,0.35), inset 0 1px 2px rgba(255,255,255,0.2)';
            }
          }}
        >
          {isSpeaking ? '⏹' : isListening ? '⏹' : '🎤'}
        </button>
      </div>

      {/* Status */}
      <div role="status" aria-live="polite" style={{
        padding:'6px 14px', borderRadius:99,
        background:'rgba(0,0,0,0.6)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(0,232,122,0.2)',
        fontSize:11, fontFamily:'var(--font-mono)',
        color: statusColor,
        display:'flex', alignItems:'center', gap:6,
        transition:'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.03)',
      }}>
        <div style={{
          width:6, height:6, borderRadius:'50%',
          background: dotColor,
          boxShadow: isListening ? '0 0 8px #ff3d5a' : isSpeaking ? '0 0 8px #8b5cf6' : 'none',
          transition: 'all 0.3s',
          animation: (isListening || isSpeaking) ? 'pulse-scale 1.5s ease-in-out infinite' : 'none',
        }}/>
        {statusText}
      </div>

      {error==='mic-denied'   && <div style={{fontSize:11,color:'#ff3d5a',textAlign:'center',maxWidth:200}}>Mic blocked. Allow in Chrome → refresh.</div>}
      {error==='not-supported'&& <div style={{fontSize:11,color:'#ff3d5a',textAlign:'center',maxWidth:200}}>Open in Chrome for voice.</div>}
    </div>
  )
}