import React, { useState, useEffect, useRef } from 'react'

/**
 * BreathingExercise — animated 4-7-8 breathing guide.
 * Triggered when stress/anxiety detected in conversation.
 * Agent speaks each phase aloud via TTS.
 */

const PHASES = [
  { label: 'Breathe in',  duration: 4, scale: 1.0, color: '#00c27a', instruction: 'Breathe in slowly through your nose for 4 counts.' },
  { label: 'Hold',        duration: 7, scale: 1.0, color: '#60a5fa', instruction: 'Hold your breath gently for 7 counts.' },
  { label: 'Breathe out', duration: 8, scale: 0.0, color: '#a78bfa', instruction: 'Breathe out completely through your mouth for 8 counts.' },
]

export default function BreathingExercise({ onClose, onSpeak }) {
  const [phase,     setPhase]     = useState(0)
  const [count,     setCount]     = useState(PHASES[0].duration)
  const [round,     setRound]     = useState(1)
  const [active,    setActive]    = useState(false)
  const [done,      setDone]      = useState(false)
  const [scale,     setScale]     = useState(0.4)
  const timerRef = useRef(null)
  const totalRounds = 3

  const currentPhase = PHASES[phase]

  useEffect(() => {
    if (!active || done) return

    // Speak the phase instruction
    onSpeak?.(currentPhase.instruction)

    // Animate scale
    const targetScale = phase === 0 ? 1.0 : phase === 1 ? 1.0 : 0.35
    const startScale  = phase === 0 ? 0.35 : scale
    const steps       = currentPhase.duration * 10
    let step = 0

    const anim = setInterval(() => {
      step++
      const t = step / steps
      setScale(startScale + (targetScale - startScale) * t)
      if (step >= steps) clearInterval(anim)
    }, 100)

    // Count down
    let remaining = currentPhase.duration
    setCount(remaining)

    timerRef.current = setInterval(() => {
      remaining--
      setCount(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        clearInterval(anim)
        // Move to next phase
        const nextPhase = (phase + 1) % PHASES.length
        if (nextPhase === 0) {
          // Completed one round
          if (round >= totalRounds) {
            setDone(true)
            setActive(false)
            onSpeak?.('Wonderful. You completed 3 rounds of 4-7-8 breathing. How do you feel?')
          } else {
            setRound(r => r + 1)
            setPhase(0)
          }
        } else {
          setPhase(nextPhase)
        }
      }
    }, 1000)

    return () => { clearInterval(timerRef.current); clearInterval(anim) }
  }, [active, phase, round]) // eslint-disable-line

  const handleStart = () => {
    setActive(true)
    setPhase(0)
    setRound(1)
    setDone(false)
    setCount(PHASES[0].duration)
    onSpeak?.('Let\'s begin the 4-7-8 breathing exercise. This will help calm your nervous system. Follow along with the circle.')
  }

  const handleStop = () => {
    clearInterval(timerRef.current)
    setActive(false)
    setScale(0.4)
    setPhase(0)
    setCount(PHASES[0].duration)
  }

  return (
    <div style={{
      margin: '8px 0 14px',
      padding: '20px',
      borderRadius: 20,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow)',
      textAlign: 'center',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🧘</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>
            4-7-8 Breathing
          </span>
          {active && (
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 99,
              background: 'var(--green-dim)', color: 'var(--green)',
              fontFamily: 'var(--font-mono)',
            }}>
              Round {round}/{totalRounds}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 16, color: 'var(--text-3)',
        }}>✕</button>
      </div>

      {done ? (
        /* Completion state */
        <div>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--text-1)', marginBottom: 6 }}>
            Exercise complete!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
            You completed 3 rounds. Your nervous system should feel calmer now.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={handleStart} style={btnStyle('var(--green)', '#000')}>Repeat</button>
            <button onClick={onClose}     style={btnStyle('var(--surface-2)', 'var(--text-2)', true)}>Close</button>
          </div>
        </div>
      ) : (
        /* Active / idle state */
        <div>
          {/* Animated breathing circle */}
          <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 16px' }}>
            {/* Outer glow ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${active ? currentPhase.color : 'var(--border)'}`,
              opacity: 0.3, transition: 'border-color 0.5s',
            }} />
            {/* Main breathing circle */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 100, height: 100,
              transform: `translate(-50%, -50%) scale(${active ? scale : 0.4})`,
              borderRadius: '50%',
              background: active
                ? `radial-gradient(circle, ${currentPhase.color}40, ${currentPhase.color}20)`
                : 'var(--surface-2)',
              border: `3px solid ${active ? currentPhase.color : 'var(--border)'}`,
              transition: active ? 'none' : 'all 0.5s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Count down number */}
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 28,
                color: active ? currentPhase.color : 'var(--text-3)',
              }}>
                {active ? count : '•'}
              </span>
            </div>
          </div>

          {/* Phase label */}
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
            color: active ? currentPhase.color : 'var(--text-3)',
            marginBottom: 4, transition: 'color 0.4s', minHeight: 24,
          }}>
            {active ? currentPhase.label : 'Ready to begin'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16, minHeight: 18 }}>
            {active ? `${currentPhase.duration}s · ${PHASES.map(p=>p.duration).join('-')} pattern` : 'Reduces stress in under 2 minutes'}
          </div>

          {/* Phase indicators */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            {PHASES.map((p, i) => (
              <div key={i} style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 11,
                background: active && phase === i ? `${p.color}20` : 'var(--surface-2)',
                border: `1px solid ${active && phase === i ? p.color : 'var(--border)'}`,
                color: active && phase === i ? p.color : 'var(--text-3)',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.3s',
              }}>
                {p.label} {p.duration}s
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {!active ? (
              <button onClick={handleStart} style={btnStyle('var(--green)', '#000')}>
                ▶ Start breathing
              </button>
            ) : (
              <button onClick={handleStop} style={btnStyle('var(--surface-2)', 'var(--text-2)', true)}>
                ⏹ Stop
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function btnStyle(bg, color, bordered = false) {
  return {
    padding: '8px 20px', borderRadius: 99,
    border: bordered ? '1px solid var(--border)' : 'none',
    background: bg, color,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-display)', transition: 'all 0.15s',
  }
}