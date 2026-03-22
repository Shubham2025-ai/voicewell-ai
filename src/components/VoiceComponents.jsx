import React from 'react'

export function Waveform({ isActive }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:3, height:28 }}>
      {[...Array(13)].map((_,i) => (
        <div key={i} className={isActive ? 'wave-bar' : ''} style={{
          width:2.5, borderRadius:99,
          height: isActive ? 22 : 2,
          background: isActive
            ? `hsl(${148+i*5},80%,${52+i}%)`
            : '#1c1c1c',
          transition: isActive ? 'none' : 'height 0.4s, background 0.4s',
          animationDelay:`${i*0.055}s`,
        }}/>
      ))}
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="pop-l" style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:16 }}>
      <div style={{
        width:28, height:28, borderRadius:'8px 8px 8px 2px', flexShrink:0,
        background:'linear-gradient(135deg,#00e87a,#00c264)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, fontWeight:700, color:'#000',
        boxShadow:'0 2px 8px rgba(0,232,122,0.25)',
        fontFamily:'var(--font-display)',
      }}>✦</div>
      <div style={{
        padding:'11px 15px', borderRadius:'16px 16px 16px 4px',
        background:'#111', border:'1px solid #1e1e1e',
        boxShadow:'0 2px 10px rgba(0,0,0,0.5)',
        display:'flex', alignItems:'center', gap:5,
      }}>
        {[1,2,3].map(i=>(
          <div key={i} className={`d${i}`} style={{
            width:6,height:6,borderRadius:'50%',background:'#00e87a',
          }}/>
        ))}
      </div>
    </div>
  )
}

export function ContextPill({ turnCount }) {
  if (turnCount === 0) return null
  const pct = Math.min(turnCount/8*100,100)
  return (
    <div className="slide-up" style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'4px 12px', borderRadius:99,
      background:'#0f0f0f', border:'1px solid #1e1e1e',
      fontSize:10, color:'#333', fontFamily:'var(--font-mono)',
    }}>
      <div style={{ width:32,height:2,borderRadius:99,background:'#1a1a1a',overflow:'hidden' }}>
        <div style={{ height:'100%',width:`${pct}%`,background:'#00e87a',borderRadius:99,transition:'width 0.5s' }}/>
      </div>
      {Math.min(turnCount,8)}/8 turns in context
    </div>
  )
}