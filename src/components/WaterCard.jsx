import React from 'react'

export default function WaterCard({ data, type }) {
  const { total, pct, goalMl, glasses, amount, log } = data
  const displayTotal = type === 'log' ? data.newTotal : total
  const displayPct   = type === 'log' ? data.newPct   : pct
  const displayGlass = type === 'log' ? data.glasses   : glasses

  const color = displayPct >= 100 ? '#00c27a' : displayPct >= 60 ? '#60a5fa' : '#f59e0b'

  return (
    <div style={{ minWidth: 220 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, fontFamily:'var(--font-display)' }}>
        <span style={{ fontSize:20 }}>💧</span>
        <div>
          <div style={{ fontWeight:700, fontSize:13 }}>
            {type === 'log' ? `+${amount}ml logged!` : 'Water Intake Today'}
          </div>
          <div style={{ fontSize:10, opacity:0.6, fontFamily:'var(--font-mono)' }}>
            Daily goal: {goalMl}ml
          </div>
        </div>
      </div>

      {/* Big number */}
      <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:10 }}>
        <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:36, color, lineHeight:1 }}>
          {displayTotal}
        </span>
        <span style={{ fontSize:12, opacity:0.7 }}>ml</span>
        <span style={{ fontSize:12, opacity:0.5, marginLeft:4 }}>/ {goalMl}ml</span>
      </div>

      {/* Progress bar */}
      <div style={{ height:8, borderRadius:99, background:'rgba(255,255,255,0.1)', overflow:'hidden', marginBottom:6 }}>
        <div style={{
          height:'100%', borderRadius:99,
          width:`${displayPct}%`,
          background: displayPct >= 100
            ? 'linear-gradient(90deg,#00c27a,#00e892)'
            : displayPct >= 60
            ? 'linear-gradient(90deg,#3b82f6,#60a5fa)'
            : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
          transition: 'width 0.6s ease',
        }}/>
      </div>

      {/* Glasses row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', gap:4 }}>
          {[...Array(8)].map((_,i) => (
            <span key={i} style={{
              fontSize:14, opacity: i < displayGlass ? 1 : 0.2,
              filter: i < displayGlass ? 'none' : 'grayscale(1)',
              transition:'all 0.3s',
            }}>💧</span>
          ))}
        </div>
        <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color }}>
          {displayPct}%
        </span>
      </div>

      {/* Today's log */}
      {log && log.length > 0 && (
        <div style={{
          padding:'8px 10px', borderRadius:8,
          background:'rgba(255,255,255,0.05)',
          border:'1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize:10, opacity:0.5, marginBottom:4, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Today's log
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {log.slice(-6).map(e => (
              <span key={e.id} style={{
                fontSize:10, padding:'2px 7px', borderRadius:99,
                background:'rgba(96,165,250,0.15)',
                border:'1px solid rgba(96,165,250,0.2)',
                color:'#93c5fd', fontFamily:'var(--font-mono)',
              }}>
                {e.amount}ml · {e.time}
              </span>
            ))}
          </div>
        </div>
      )}

      {displayPct >= 100 && (
        <div style={{ fontSize:12, color:'#00c27a', textAlign:'center', marginTop:8, fontWeight:600 }}>
          🎉 Daily goal reached!
        </div>
      )}
    </div>
  )
}