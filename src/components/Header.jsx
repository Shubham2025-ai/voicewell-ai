import React, { useState } from 'react'
import EmotionBadge from './EmotionBadge.jsx'

export const PAGES = [
  { id:'home',         icon:'🎙️', label:'Voice'     },
  { id:'health',       icon:'🩺',  label:'Health'    },
  { id:'nutrition',    icon:'🍽️', label:'Nutrition'  },
  { id:'medications',  icon:'💊',  label:'Meds'      },
  { id:'appointments', icon:'📅',  label:'Appts'     },
  { id:'dashboard',    icon:'📊',  label:'Stats'     },
]

export default function Header({
  language, onLanguageToggle,
  darkMode, onDarkToggle,
  onClearChat, onSummary,
  emotion, emotionLoading,
  reminderCount, isConnected,
  activePage, onNavigate,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header style={{
        height: 58,
        background: 'rgba(4,4,4,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 0,
        flexShrink: 0, position: 'relative', zIndex: 100,
        boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
      }}>

        {/* ── Logo ── */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, minWidth:150 }}>
          <div style={{
            width:32, height:32, borderRadius:9, flexShrink:0,
            background:'linear-gradient(135deg,#00e87a,#00b85e)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, boxShadow:'0 0 16px rgba(0,232,122,0.3), 0 2px 8px rgba(0,0,0,0.4)',
          }}>🎙️</div>
          <div>
            <div style={{
              fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:14, color:'#fff', letterSpacing:'-0.5px', lineHeight:1.1,
            }}>VoiceWell AI</div>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
              <div style={{
                width:5, height:5, borderRadius:'50%',
                background: isConnected ? '#00e87a' : '#444',
                boxShadow: isConnected ? '0 0 6px #00e87a' : 'none',
                transition: 'all 0.3s',
              }}/>
              <span style={{ fontSize:9, color: isConnected ? '#2a6644' : '#333', fontFamily:'var(--font-mono)', letterSpacing:'0.04em' }}>
                {isConnected ? 'live' : 'offline'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Center nav ── */}
        <nav style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          display:'flex', alignItems:'center', gap:1,
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:12, padding:'4px',
        }}>
          {PAGES.map(p => {
            const active = activePage === p.id
            return (
              <button key={p.id} onClick={() => onNavigate(p.id)} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 13px', borderRadius:8,
                border:'none', cursor:'pointer', fontSize:11.5,
                fontFamily:'var(--font-body)', fontWeight: active ? 700 : 400,
                transition:'all 0.15s', position:'relative',
                background: active
                  ? 'linear-gradient(135deg,#00e87a,#00c264)'
                  : 'transparent',
                color: active ? '#000' : 'rgba(255,255,255,0.35)',
                boxShadow: active ? '0 2px 12px rgba(0,232,122,0.3)' : 'none',
                transform: active ? 'scale(1)' : 'scale(0.97)',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color='rgba(255,255,255,0.75)'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='scale(1)' }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='scale(0.97)' }}}
              >
                <span style={{ fontSize:13 }}>{p.icon}</span>
                <span>{p.label}</span>
                {p.id==='medications' && reminderCount > 0 && (
                  <span style={{
                    position:'absolute', top:-5, right:-4,
                    minWidth:15, height:15, borderRadius:99,
                    padding:'0 3px',
                    background:'#ff3d5a', color:'#fff',
                    fontSize:8, fontWeight:800,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid rgba(4,4,4,0.97)',
                    boxShadow:'0 0 6px rgba(255,61,90,0.5)',
                    fontFamily:'var(--font-mono)',
                  }}>{reminderCount > 9 ? '9+' : reminderCount}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Right controls ── */}
        <div style={{ display:'flex', alignItems:'center', gap:4, marginLeft:'auto', flexShrink:0 }}>

          {emotion && (
            <div style={{ marginRight:2 }}>
              <EmotionBadge emotion={emotion} loading={emotionLoading} />
            </div>
          )}

          {/* Divider */}
          <div style={{ width:1, height:16, background:'rgba(255,255,255,0.07)', margin:'0 2px' }} />

          {/* Summary */}
          <HBtn onClick={onSummary}   icon="📋" tip="Session summary" />
          {/* Clear */}
          <HBtn onClick={onClearChat} icon="🗑️" tip="Clear chat" />

          {/* Divider */}
          <div style={{ width:1, height:16, background:'rgba(255,255,255,0.07)', margin:'0 2px' }} />

          {/* Language toggle */}
          <button onClick={onLanguageToggle} style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'5px 10px', borderRadius:8,
            border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(255,255,255,0.04)',
            cursor:'pointer', fontSize:11, color:'rgba(255,255,255,0.45)',
            fontFamily:'var(--font-mono)', fontWeight:600, letterSpacing:'0.03em',
            transition:'all 0.15s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.18)';e.currentTarget.style.color='rgba(255,255,255,0.8)';e.currentTarget.style.background='rgba(255,255,255,0.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.color='rgba(255,255,255,0.45)';e.currentTarget.style.background='rgba(255,255,255,0.04)'}}
          >
            <span style={{fontSize:14}}>{language==='en-US'?'🇬🇧':'🇮🇳'}</span>
            <span>{language==='en-US'?'EN':'हिं'}</span>
          </button>

          {/* Dark mode */}
          <HBtn onClick={onDarkToggle} icon={darkMode ? '☀️' : '🌙'} tip={darkMode ? 'Light mode' : 'Dark mode'} />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{
              display:'none',
              width:32, height:32, borderRadius:8,
              border:'1px solid rgba(255,255,255,0.08)',
              background: mobileOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              cursor:'pointer', color:'rgba(255,255,255,0.55)', fontSize:15,
              alignItems:'center', justifyContent:'center',
              transition:'all 0.15s',
            }}
            className="hamburger-btn"
          >{mobileOpen ? '✕' : '☰'}</button>
        </div>
      </header>

      {/* ── Mobile nav dropdown ── */}
      {mobileOpen && (
        <div style={{
          background:'rgba(6,6,6,0.98)',
          backdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(255,255,255,0.07)',
          padding:'10px 16px 14px',
          display:'flex', flexWrap:'wrap', gap:6,
          zIndex:99, position:'relative',
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {PAGES.map(p => {
            const active = activePage === p.id
            return (
              <button key={p.id}
                onClick={() => { onNavigate(p.id); setMobileOpen(false) }}
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  padding:'8px 16px', borderRadius:9,
                  border: active ? '1px solid rgba(0,232,122,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  background: active ? 'rgba(0,232,122,0.1)' : 'rgba(255,255,255,0.03)',
                  cursor:'pointer', fontSize:12.5, fontWeight: active ? 700 : 400,
                  color: active ? '#00e87a' : 'rgba(255,255,255,0.5)',
                  fontFamily:'var(--font-body)', transition:'all 0.14s',
                  boxShadow: active ? '0 0 12px rgba(0,232,122,0.15)' : 'none',
                }}
              >{p.icon} {p.label}</button>
            )
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          header nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (max-width: 1024px) {
          header nav button span:last-of-type { display: none; }
          header nav button { padding: 6px 10px !important; }
        }
      `}</style>
    </>
  )
}

function HBtn({ onClick, tip, icon }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={tip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:32, height:32, borderRadius:8,
        border:`1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        cursor:'pointer', fontSize:14,
        color: hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.15s',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
      }}
    >{icon}</button>
  )
}