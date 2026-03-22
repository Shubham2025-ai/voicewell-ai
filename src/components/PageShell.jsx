import React from 'react'

/** Shared layout wrapper — ensures all pages look consistent */
export function PageShell({ children }) {
  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: 'var(--bg)',
      padding: '1.5rem 1.25rem',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}>
      {children}
    </div>
  )
}

/** Page title + subtitle block */
export function PageHero({ icon, title, subtitle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{
        width:42, height:42, borderRadius:12, flexShrink:0,
        background:'#111', border:'1px solid #1e1e1e',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
        boxShadow:'0 2px 10px rgba(0,0,0,0.5)',
      }}>{icon}</div>
      <div>
        <div style={{
          fontFamily:'var(--font-display)', fontWeight:800,
          fontSize:18, color:'var(--text-1)', letterSpacing:'-0.4px',
        }}>{title}</div>
        <div style={{ fontSize:11.5, color:'var(--text-3)', marginTop:1 }}>{subtitle}</div>
      </div>
    </div>
  )
}

/** Section label */
export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize:10, fontWeight:600, color:'#2a2a2a',
      textTransform:'uppercase', letterSpacing:'0.08em',
      fontFamily:'var(--font-mono)',
      paddingBottom:6, borderBottom:'1px solid #111',
    }}>{children}</div>
  )
}

/** Clickable feature card */
export function FeatureCard({ icon, label, desc, onClick, accent }) {
  return (
    <button onClick={onClick} className="feat-card" style={{
      padding:'14px', borderRadius:12,
      border:`1px solid ${accent ? 'rgba(0,232,122,0.2)' : '#1a1a1a'}`,
      background: accent ? 'rgba(0,232,122,0.04)' : '#0d0d0d',
      cursor:'pointer', textAlign:'left',
      fontFamily:'var(--font-body)', width:'100%',
    }}>
      <div style={{ fontSize:22, marginBottom:7 }}>{icon}</div>
      <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text-1)', marginBottom:3 }}>{label}</div>
      {desc && <div style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.5 }}>{desc}</div>}
    </button>
  )
}

/** Info/tip box */
export function InfoBox({ icon, text, color='#1a1a1a' }) {
  return (
    <div style={{
      padding:'10px 13px', borderRadius:10,
      background:'#0a0a0a', border:`1px solid ${color}`,
      fontSize:11.5, color:'var(--text-3)', lineHeight:1.6,
      display:'flex', gap:8,
    }}>
      <span style={{ flexShrink:0, fontSize:14 }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

/** Quick action pill button */
export function QuickBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'8px 14px', borderRadius:8,
      border:'1px solid #1a1a1a', background:'#0d0d0d',
      cursor:'pointer', fontSize:11.5,
      color:'var(--text-2)', fontFamily:'var(--font-body)',
      transition:'all 0.14s', textAlign:'left', width:'100%',
    }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor='#00e87a';e.currentTarget.style.color='var(--text-1)'}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor='#1a1a1a';e.currentTarget.style.color='var(--text-2)'}}
    >{label}</button>
  )
}

/** Stat card */
export function StatCard({ label, value, unit, color='#00e87a' }) {
  return (
    <div style={{
      padding:'14px', borderRadius:12,
      background:'#0d0d0d', border:'1px solid #1a1a1a',
      textAlign:'center',
    }}>
      <div style={{
        fontFamily:'var(--font-display)', fontWeight:800,
        fontSize:26, color, lineHeight:1, marginBottom:4,
      }}>{value}<span style={{fontSize:12,opacity:0.6,marginLeft:2}}>{unit}</span></div>
      <div style={{ fontSize:10, color:'#333', fontFamily:'var(--font-mono)' }}>{label}</div>
    </div>
  )
}