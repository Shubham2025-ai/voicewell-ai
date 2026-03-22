import React from 'react'

export function Waveform({ isActive }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:3, height:32 }}>
      {[...Array(11)].map((_,i) => (
        <div key={i} className={isActive ? 'bar-dance' : ''} style={{
          width: 3, borderRadius: 99,
          height: isActive ? 24 : 3,
          background: isActive
            ? `hsl(${148 + i*3},70%,${50+i*2}%)`
            : 'var(--border)',
          transition: isActive ? 'none' : 'height 0.4s, background 0.4s',
          animationDelay: `${i*0.06}s`,
        }}/>
      ))}
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="pop-left" style={{
      display:'flex', alignItems:'flex-end', gap:8, marginBottom:14,
    }}>
      <div style={{
        width:28, height:28, borderRadius:'8px 8px 8px 2px',
        background:'var(--green)', display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:11, fontWeight:700, color:'#000',
        boxShadow:'0 0 10px var(--green-glow)', flexShrink:0,
        fontFamily:'var(--font-display)',
      }}>✦</div>
      <div style={{
        padding:'12px 16px', borderRadius:'16px 16px 16px 4px',
        background:'var(--surface)', border:'1px solid var(--border)',
        boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:5,
      }}>
        {[1,2,3].map(i => (
          <div key={i} className={`d${i}`} style={{
            width:7, height:7, borderRadius:'50%', background:'var(--green)',
          }}/>
        ))}
      </div>
    </div>
  )
}

export function ContextPill({ turnCount }) {
  if (turnCount === 0) return null
  const pct = Math.min(turnCount/8*100, 100)
  return (
    <div className="slide-up" style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'4px 12px', borderRadius:99,
      background:'var(--surface)', border:'1px solid var(--border)',
      fontSize:10, color:'var(--text-3)', fontFamily:'var(--font-mono)',
      boxShadow:'var(--shadow)',
    }}>
      <div style={{ width:36, height:3, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:'var(--green)', transition:'width 0.5s' }}/>
      </div>
      {Math.min(turnCount,8)}/8 turns in context
    </div>
  )
}