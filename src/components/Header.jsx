import React, { useState } from 'react'
import EmotionBadge from './EmotionBadge.jsx'

export const PAGES = [
  { id:'home',         icon:'🎙️', label:'Voice'    },
  { id:'health',       icon:'🩺',  label:'Health'   },
  { id:'nutrition',    icon:'🍽️', label:'Nutrition' },
  { id:'medications',  icon:'💊',  label:'Meds'     },
  { id:'appointments', icon:'📅',  label:'Appts'    },
  { id:'dashboard',    icon:'📊',  label:'Stats'    },
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
        height: 52,
        background: '#000',
        borderBottom: '1px solid #1c1c1c',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 0,
        flexShrink: 0, position: 'relative', zIndex: 100,
      }}>

        {/* ── Logo ──────────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0, minWidth:140 }}>
          <div style={{
            width:30, height:30, borderRadius:8, flexShrink:0,
            background:'linear-gradient(135deg,#00e87a,#00b85e)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, boxShadow:'0 0 10px rgba(0,232,122,0.25)',
          }}>🎙️</div>
          <div>
            <div style={{
              fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:13.5, color:'#fff', letterSpacing:'-0.4px', lineHeight:1.1,
            }}>VoiceWell AI</div>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:1 }}>
              <div style={{
                width:5, height:5, borderRadius:'50%',
                background: isConnected ? '#00e87a' : '#333',
                boxShadow: isConnected ? '0 0 5px #00e87a' : 'none',
              }}/>
              <span style={{ fontSize:9, color:'#333', fontFamily:'var(--font-mono)' }}>
                {isConnected ? 'live' : 'offline'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Center pill nav — desktop ──────────────────── */}
        <nav style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          display:'flex', alignItems:'center', gap:1,
          background:'#0f0f0f',
          border:'1px solid #1e1e1e',
          borderRadius:10, padding:'3px',
        }} className="hidden md:flex">
          {PAGES.map(p => {
            const active = activePage === p.id
            return (
              <button key={p.id} onClick={() => onNavigate(p.id)} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 12px', borderRadius:7,
                border:'none', cursor:'pointer', fontSize:11,
                fontFamily:'var(--font-body)', fontWeight: active ? 700 : 400,
                transition:'all 0.14s', position:'relative',
                background: active ? 'linear-gradient(135deg,#00e87a,#00c264)' : 'transparent',
                color: active ? '#000' : '#505050',
                boxShadow: active ? '0 2px 10px rgba(0,232,122,0.25)' : 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color='#aaa' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color='#505050' }}
              >
                <span style={{ fontSize:12 }}>{p.icon}</span>
                {p.label}
                {p.id==='medications' && reminderCount>0 && (
                  <span style={{
                    position:'absolute', top:-4, right:-4,
                    width:14, height:14, borderRadius:'50%',
                    background:'#ff3d5a', color:'#fff',
                    fontSize:8, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border:'1.5px solid #000',
                  }}>{reminderCount>9?'9+':reminderCount}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Right controls ─────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', gap:5, marginLeft:'auto', flexShrink:0 }}>

          {emotion && <div className="hidden lg:block"><EmotionBadge emotion={emotion} loading={emotionLoading} /></div>}

          <div style={{
            display:'flex', alignItems:'center', gap:3,
            padding:'3px 9px', borderRadius:99,
            background:'#0a0a0a', border:'1px solid #1a1a1a',
            fontSize:9, color:'#2a2a2a', fontFamily:'var(--font-mono)',
          }} className="hidden xl:flex">
            <span>ⓘ</span><span>Not medical advice</span>
          </div>

          <div style={{ width:1, height:14, background:'#1c1c1c', margin:'0 2px' }} />

          <HBtn onClick={onSummary}        tip="Session summary"   icon="📋" />
          <HBtn onClick={onClearChat}      tip="Clear chat"        icon="🗑️" />

          <button onClick={onLanguageToggle} style={{
            display:'flex', alignItems:'center', gap:4,
            padding:'4px 9px', borderRadius:7,
            border:'1px solid #1c1c1c', background:'#0a0a0a',
            cursor:'pointer', fontSize:11, color:'#555',
            fontFamily:'var(--font-body)', transition:'all 0.14s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#333';e.currentTarget.style.color='#bbb'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#1c1c1c';e.currentTarget.style.color='#555'}}
          >
            <span style={{fontSize:13}}>{language==='en-US'?'🇬🇧':'🇮🇳'}</span>
            <span>{language==='en-US'?'EN':'हिं'}</span>
          </button>

          <HBtn onClick={onDarkToggle} tip={darkMode?'Light mode':'Dark mode'} icon={darkMode?'☀️':'🌙'} />

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={()=>setMobileOpen(o=>!o)} style={{
            width:30, height:30, borderRadius:7,
            border:'1px solid #1c1c1c', background:'#0a0a0a',
            cursor:'pointer', color:'#555', fontSize:15,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>☰</button>
        </div>
      </header>

      {/* ── Mobile dropdown ─────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden" style={{
          background:'#050505', borderBottom:'1px solid #1a1a1a',
          padding:10, display:'flex', flexWrap:'wrap', gap:6, zIndex:99,
          position:'relative',
        }}>
          {PAGES.map(p => {
            const active = activePage===p.id
            return (
              <button key={p.id} onClick={()=>{onNavigate(p.id);setMobileOpen(false)}} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'7px 14px', borderRadius:8,
                border: active ? '1px solid #00e87a' : '1px solid #1c1c1c',
                background: active ? 'rgba(0,232,122,0.08)' : '#0f0f0f',
                cursor:'pointer', fontSize:12, fontWeight: active ? 700 : 400,
                color: active ? '#00e87a' : '#555',
                fontFamily:'var(--font-body)',
              }}>
                {p.icon} {p.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

function HBtn({ onClick, tip, icon }) {
  return (
    <button onClick={onClick} data-tip={tip} style={{
      width:30, height:30, borderRadius:7,
      border:'1px solid #1c1c1c', background:'#0a0a0a',
      cursor:'pointer', fontSize:14, color:'#444',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'all 0.14s',
    }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor='#333';e.currentTarget.style.color='#aaa'}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor='#1c1c1c';e.currentTarget.style.color='#444'}}
    >{icon}</button>
  )
}