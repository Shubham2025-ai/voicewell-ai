import React, { useState } from 'react'
import EmotionBadge from './EmotionBadge.jsx'

export const PAGES = [
  { id: 'home',         icon: '🎙️', label: 'Voice'       },
  { id: 'health',       icon: '🩺', label: 'Health'      },
  { id: 'nutrition',    icon: '🍽️', label: 'Nutrition'   },
  { id: 'medications',  icon: '💊', label: 'Meds'        },
  { id: 'appointments', icon: '📅', label: 'Appts'       },
  { id: 'dashboard',    icon: '📊', label: 'Stats'       },
]

export default function Header({
  language, onLanguageToggle,
  darkMode, onDarkToggle,
  onClearChat, onSummary,
  emotion, emotionLoading,
  reminderCount,
  isConnected,
  activePage, onNavigate,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      background: '#000000',
      borderBottom: '1px solid #1a1a1a',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      padding: '0 1rem',
      gap: 0,
      flexShrink: 0,
      position: 'relative',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, boxShadow: '0 0 12px rgba(0,255,136,0.3)',
          flexShrink: 0,
        }}>🎙️</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 14, color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1.1,
          }}>VoiceWell AI</div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: isConnected ? '#00ff88' : '#444',
              boxShadow: isConnected ? '0 0 5px #00ff88' : 'none',
            }}/>
            <span style={{ fontSize: 9, color: '#444', fontFamily:'var(--font-mono)' }}>
              {isConnected ? 'live' : 'offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Center nav tabs — desktop */}
      <nav style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 2,
        background: '#0d0d0d',
        border: '1px solid #1f1f1f',
        borderRadius: 10, padding: '3px',
      }} className="hidden md:flex">
        {PAGES.map(page => {
          const isActive = activePage === page.id
          return (
            <button
              key={page.id}
              onClick={() => onNavigate(page.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 7,
                border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: isActive ? 700 : 400,
                fontFamily: 'var(--font-body)',
                background: isActive
                  ? 'linear-gradient(135deg,#00ff88,#00cc6a)'
                  : 'transparent',
                color: isActive ? '#000' : '#555',
                transition: 'all 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#aaa' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#555' }}
            >
              <span style={{ fontSize: 12 }}>{page.icon}</span>
              {page.label}
              {page.id === 'medications' && reminderCount > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  width: 13, height: 13, borderRadius: '50%',
                  background: '#ff4444', color: '#fff',
                  fontSize: 8, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #000',
                }}>{reminderCount}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Right controls */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>

        {/* Emotion badge */}
        {emotion && (
          <div className="hidden sm:block">
            <EmotionBadge emotion={emotion} loading={emotionLoading} />
          </div>
        )}

        {/* Disclaimer pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 99,
          background: '#0d0d0d', border: '1px solid #1f1f1f',
          fontSize: 9, color: '#333', fontFamily:'var(--font-mono)',
          flexShrink: 0,
        }} className="hidden lg:flex">
          <span>ⓘ</span>
          <span>Not medical advice</span>
        </div>

        <div style={{ width:1, height:16, background:'#1f1f1f' }} />

        {/* Summary */}
        <IconBtn onClick={onSummary} tip="Session summary" icon="📋" />

        {/* Language */}
        <button onClick={onLanguageToggle} data-tip="Toggle language" style={{
          display:'flex', alignItems:'center', gap:4,
          padding:'4px 9px', borderRadius:7,
          border:'1px solid #1f1f1f', background:'#0d0d0d',
          cursor:'pointer', fontSize:11, fontWeight:500,
          color:'#666', fontFamily:'var(--font-body)', transition:'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor='#333'}
        onMouseLeave={e => e.currentTarget.style.borderColor='#1f1f1f'}
        >
          <span style={{ fontSize:13 }}>{language==='en-US'?'🇬🇧':'🇮🇳'}</span>
          <span>{language==='en-US'?'EN':'हिं'}</span>
        </button>

        {/* Dark mode */}
        <IconBtn onClick={onDarkToggle} tip={darkMode?'Light':'Dark'} icon={darkMode?'☀️':'🌙'} />

        {/* Clear */}
        <IconBtn onClick={onClearChat} tip="Clear chat" icon="🗑️" />

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden"
          style={{
            width:30, height:30, borderRadius:7,
            border:'1px solid #1f1f1f', background:'#0d0d0d',
            cursor:'pointer', fontSize:14, color:'#666',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}
        >☰</button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden" style={{
          position:'absolute', top:56, left:0, right:0,
          background:'#050505', borderBottom:'1px solid #1a1a1a',
          padding:'8px', display:'flex', flexWrap:'wrap', gap:6,
          zIndex:200,
        }}>
          {PAGES.map(page => {
            const isActive = activePage === page.id
            return (
              <button key={page.id} onClick={() => { onNavigate(page.id); setMenuOpen(false) }} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'8px 14px', borderRadius:8,
                border: isActive ? '1px solid #00ff88' : '1px solid #1f1f1f',
                background: isActive ? 'rgba(0,255,136,0.1)' : '#0d0d0d',
                cursor:'pointer', fontSize:12, fontWeight: isActive ? 700 : 400,
                color: isActive ? '#00ff88' : '#666',
                fontFamily:'var(--font-body)',
              }}>
                <span>{page.icon}</span>{page.label}
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}

function IconBtn({ onClick, tip, icon }) {
  return (
    <button onClick={onClick} data-tip={tip} style={{
      width:30, height:30, borderRadius:7,
      border:'1px solid #1f1f1f', background:'#0d0d0d',
      cursor:'pointer', fontSize:14,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#555', transition:'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor='#333'; e.currentTarget.style.color='#aaa' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='#1f1f1f'; e.currentTarget.style.color='#555' }}
    >{icon}</button>
  )
}