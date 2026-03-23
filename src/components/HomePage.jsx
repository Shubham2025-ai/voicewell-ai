import React, { useState, useEffect, useRef } from 'react'
import ChatBubble      from './ChatBubble.jsx'
import { Waveform, TypingIndicator, ContextPill } from './VoiceComponents.jsx'
import MicButton       from './MicButton.jsx'
import SessionSummary  from './SessionSummary.jsx'

const SUGGESTIONS = [
  { icon:'🤒', text:'I have a headache'          },
  { icon:'😰', text:"I'm feeling stressed"        },
  { icon:'📊', text:'Calculate my BMI'            },
  { icon:'💊', text:'Drug interaction check'      },
  { icon:'🏥', text:'Find doctor near me'         },
  { icon:'💧', text:'Log water intake'            },
  { icon:'🍽️', text:'Plan my meals'              },
  { icon:'📅', text:'Book an appointment'         },
]

const TICKER = [
  'Voice STT + TTS pipeline',
  'Emotion detection via HuggingFace',
  'Multi-turn context — 8 turns',
  'Hindi auto-detect + switch',
  'Medication reminders + Firebase',
  'GPS-based doctor finder',
  'BMI + drug interaction checker',
  'Google Calendar booking',
  '7-day AI meal planner',
  'Water intake tracker',
]

const PREVIEW_ROWS = [
  { icon:'🎙️', label:'Voice',       val:'EN + हिं',           color:'#00e87a' },
  { icon:'😰', label:'Emotion',      val:'neutral → stressed',  color:'#a78bfa' },
  { icon:'🧠', label:'Memory',       val:'8-turn context',      color:'#60a5fa' },
  { icon:'💊', label:'Reminders',    val:'Firebase sync',       color:'#00e87a' },
  { icon:'🏥', label:'Doctor',       val:'GPS · OpenStreetMap', color:'#fbbf24' },
  { icon:'📅', label:'Calendar',     val:'Google Calendar',     color:'#60a5fa' },
  { icon:'💧', label:'Hydration',    val:'2.5L daily goal',     color:'#38bdf8' },
  { icon:'🍽️', label:'Nutrition',   val:'7-day plan · macros', color:'#00e87a' },
]

export default function HomePage({
  messages, isListening, isSpeaking, isLoading,
  interimText, turnCount, summary, loadingSummary,
  inputValue, setInputValue,
  onMicClick, onStop, onSend,
  onCloseSummary, speak, language, error,
}) {
  const chatEndRef   = useRef(null)
  const [tick, setTick] = useState(0)
  const hasMessages  = messages.filter(m => m.role !== 'loading').length > 1

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, summary])

  useEffect(() => {
    const t = setInterval(() => setTick(i => (i + 1) % TICKER.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      {!hasMessages && (
        <div style={{
          flex:1, overflowY:'auto',
          display:'flex', flexDirection:'column',
          position:'relative',
        }}>
          {/* Subtle dot grid */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
            backgroundImage:'radial-gradient(circle, rgba(0,232,122,0.08) 1px, transparent 1px)',
            backgroundSize:'28px 28px',
          }}/>

          {/* Main content */}
          <div style={{
            flex:1, display:'grid',
            gridTemplateColumns:'1fr 420px',
            gap:0, position:'relative', zIndex:1,
            minHeight:0,
          }}>

            {/* ── LEFT PANEL ───────────────────────────────── */}
            <div style={{
              padding:'2.5rem 2rem 1.5rem 2.5rem',
              display:'flex', flexDirection:'column', justifyContent:'center',
              borderRight:'1px solid #0f0f0f',
            }}>

              {/* Live badge */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'5px 12px', borderRadius:99, width:'fit-content',
                background:'rgba(0,232,122,0.06)', border:'1px solid rgba(0,232,122,0.2)',
                fontSize:10, color:'#00e87a', fontFamily:'var(--font-mono)',
                marginBottom:22, letterSpacing:'0.08em',
              }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#00e87a', boxShadow:'0 0 8px #00e87a' }}/>
                AI VOICE AGENTS · HACKATHON 2026
              </div>

              {/* Headline — fixed sizing */}
              <div style={{
                fontFamily:'var(--font-display)', fontWeight:800,
                lineHeight:1.1, letterSpacing:'-1px', marginBottom:18,
              }}>
                <div style={{ fontSize:36, color:'#ffffff' }}>Talk to Your</div>
                <div style={{
                  fontSize:48, color:'#00e87a',
                  textShadow:'0 0 40px rgba(0,232,122,0.3)',
                }}>AI Doctor.</div>
                <div style={{ fontSize:32, color:'#2a2a2a', fontWeight:500 }}>Anytime.</div>
              </div>

              {/* Subtitle */}
              <p style={{
                fontSize:13, color:'#3a3a3a', lineHeight:1.8,
                maxWidth:360, marginBottom:20, fontFamily:'var(--font-body)',
              }}>
                Voice-first health companion. Detects emotion, checks symptoms,
                finds doctors, manages medications — in{' '}
                <span style={{ color:'#555', fontWeight:600 }}>English & Hindi</span>.
              </p>

              {/* Ticker */}
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'7px 13px', borderRadius:99, width:'fit-content',
                background:'#0a0a0a', border:'1px solid #1e1e1e',
                marginBottom:24, overflow:'hidden',
              }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'#00e87a', flexShrink:0 }}/>
                <span style={{ fontSize:11, color:'#444', fontFamily:'var(--font-mono)', whiteSpace:'nowrap' }}>
                  {TICKER[tick]}
                </span>
                <span style={{ fontSize:10, color:'#1e1e1e', fontFamily:'var(--font-mono)', flexShrink:0 }}>
                  +{TICKER.length - 1} more
                </span>
              </div>

              {/* Stats row */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
                {[
                  { val:'15', label:'Features',   color:'#00e87a' },
                  { val:'9',  label:'Free APIs',   color:'#60a5fa' },
                  { val:'<1s',label:'Response',    color:'#a78bfa' },
                  { val:'5',  label:'API sources', color:'#fbbf24' },
                ].map(s=>(
                  <div key={s.label} style={{
                    padding:'10px 16px', borderRadius:10,
                    background:'#080808', border:'1px solid #161616',
                    textAlign:'center', minWidth:72,
                    transition:'border-color 0.14s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#2a2a2a'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='#161616'}
                  >
                    <div style={{
                      fontFamily:'var(--font-display)', fontWeight:800,
                      fontSize:22, color:s.color, lineHeight:1,
                    }}>{s.val}</div>
                    <div style={{ fontSize:9, color:'#2a2a2a', fontFamily:'var(--font-mono)', marginTop:3 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick action pills — ALL visible in a grid */}
              <div>
                <div style={{ fontSize:9, color:'#1e1e1e', fontFamily:'var(--font-mono)', marginBottom:8, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  Quick start
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                  {SUGGESTIONS.map((s,i)=>(
                    <button key={i} onClick={()=>setInputValue(s.text)} style={{
                      display:'flex', alignItems:'center', gap:7,
                      padding:'7px 10px', borderRadius:8,
                      border:'1px solid #141414', background:'#080808',
                      cursor:'pointer', fontSize:11.5, color:'#333',
                      fontFamily:'var(--font-body)', transition:'all 0.14s',
                      textAlign:'left', whiteSpace:'nowrap', overflow:'hidden',
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,232,122,0.2)';e.currentTarget.style.color='#888'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#141414';e.currentTarget.style.color='#333'}}
                    >
                      <span style={{ fontSize:13, flexShrink:0 }}>{s.icon}</span>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL — Live preview ────────────────── */}
            <div style={{
              padding:'2rem 1.5rem',
              display:'flex', flexDirection:'column', gap:0,
              background:'#040404',
              borderLeft:'1px solid #0f0f0f',
            }}>

              {/* Panel header */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                marginBottom:16, paddingBottom:12,
                borderBottom:'1px solid #0f0f0f',
              }}>
                <span style={{ fontSize:9, color:'#222', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  Live Session Preview
                </span>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#00e87a', boxShadow:'0 0 6px #00e87a' }}/>
                  <span style={{ fontSize:9, color:'#00e87a', fontFamily:'var(--font-mono)' }}>active</span>
                </div>
              </div>

              {/* Feature rows */}
              <div style={{ flex:1 }}>
                {PREVIEW_ROWS.map((r,i)=>(
                  <div key={i} style={{
                    display:'grid', gridTemplateColumns:'22px 1fr auto',
                    alignItems:'center', gap:10,
                    padding:'9px 0',
                    borderBottom: i < PREVIEW_ROWS.length-1 ? '1px solid #0a0a0a' : 'none',
                  }}>
                    <span style={{ fontSize:13, textAlign:'center' }}>{r.icon}</span>
                    <span style={{ fontSize:11, color:'#282828', fontFamily:'var(--font-body)' }}>{r.label}</span>
                    <span style={{ fontSize:10.5, color:r.color, fontFamily:'var(--font-mono)', fontWeight:600, textAlign:'right' }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Tech hash */}
              <div style={{
                marginTop:14, padding:'10px 12px', borderRadius:8,
                background:'#020202', border:'1px solid #0a0a0a',
              }}>
                <div style={{ fontSize:9, color:'#161616', fontFamily:'var(--font-mono)', marginBottom:4, letterSpacing:'0.06em' }}>
                  STACK FINGERPRINT
                </div>
                <div style={{ fontSize:8.5, color:'#141414', fontFamily:'var(--font-mono)', wordBreak:'break-all', lineHeight:1.6 }}>
                  react18·vite·groq·hf·firebase·osm·openfda·owm·gcal
                </div>
                <div style={{ fontSize:8, color:'#0f0f0f', fontFamily:'var(--font-mono)', marginTop:4 }}>
                  sha: a7f3c91e·4b2d86e0·f5a1c3d7·e9b2f4a8
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={onMicClick}
                style={{
                  marginTop:14, padding:'12px',
                  borderRadius:10, border:'1px solid rgba(0,232,122,0.2)',
                  background:'rgba(0,232,122,0.06)',
                  cursor:'pointer', fontSize:12, fontWeight:700,
                  color:'#00e87a', fontFamily:'var(--font-display)',
                  transition:'all 0.15s', textAlign:'center',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,232,122,0.1)';e.currentTarget.style.borderColor='rgba(0,232,122,0.35)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,232,122,0.06)';e.currentTarget.style.borderColor='rgba(0,232,122,0.2)'}}
              >
                🎙️ Tap mic to start talking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT ─────────────────────────────────────────────── */}
      {hasMessages && (
        <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1rem' }}>
          {turnCount > 0 && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
              <ContextPill turnCount={turnCount} />
            </div>
          )}
          {messages.map((msg,idx) =>
            msg.role==='loading'
              ? <TypingIndicator key={idx}/>
              : <ChatBubble key={idx} message={msg}/>
          )}
          {loadingSummary && (
            <div style={{ textAlign:'center', padding:'1rem', color:'#333', fontSize:13 }}>
              ✨ Generating summary…
            </div>
          )}
          {summary && (
            <SessionSummary
              summary={summary}
              onClose={onCloseSummary}
              onSpeak={text=>speak(text,language)}
            />
          )}
          {interimText && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
              <div style={{
                padding:'8px 14px', fontSize:12.5, fontStyle:'italic',
                borderRadius:'16px 16px 4px 16px',
                background:'rgba(0,232,122,0.05)', border:'1px dashed rgba(0,232,122,0.15)',
                color:'#2a4a38', maxWidth:'72%',
              }}>{interimText}…</div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>
      )}

      {/* ── INPUT ZONE ───────────────────────────────────────── */}
      <div style={{
        borderTop:'1px solid #0d0d0d',
        background:'#030303',
        padding:'0.875rem 1.5rem 1rem',
        flexShrink:0,
      }}>
        {hasMessages && <Waveform isActive={isSpeaking}/>}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginTop: hasMessages ? 10 : 0 }}>
          <MicButton
            isListening={isListening} isSpeaking={isSpeaking}
            onClick={onMicClick} onStop={onStop} error={error}
          />
          <div style={{ flex:1 }}>
            <form onSubmit={onSend} style={{ display:'flex', gap:8 }}>
              <input
                type="text" value={inputValue}
                onChange={e=>setInputValue(e.target.value)}
                disabled={isListening||isSpeaking||isLoading}
                placeholder={hasMessages?'Continue the conversation…':'Or type here to start talking…'}
                style={{
                  flex:1, padding:'11px 18px', borderRadius:99,
                  border:'1px solid #1a1a1a', background:'#0d0d0d',
                  color:'var(--text-1)', fontSize:13,
                  fontFamily:'var(--font-body)', outline:'none',
                  transition:'border-color 0.15s',
                }}
                onFocus={e=>e.target.style.borderColor='rgba(0,232,122,0.35)'}
                onBlur={e=>e.target.style.borderColor='#1a1a1a'}
              />
              <button
                type="submit"
                disabled={isListening||isSpeaking||isLoading||!inputValue.trim()}
                style={{
                  padding:'11px 24px', borderRadius:99, border:'none',
                  background:'linear-gradient(135deg,#00e87a,#00c264)',
                  color:'#000', fontSize:13, fontWeight:700,
                  cursor:'pointer', fontFamily:'var(--font-display)', flexShrink:0,
                  opacity:(!inputValue.trim()||isLoading)?0.3:1,
                  transition:'opacity 0.14s',
                }}
              >Send</button>
            </form>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, padding:'0 4px' }}>
              <span style={{ fontSize:9, color:'#181818', fontFamily:'var(--font-mono)' }}>
                Chrome only · No audio stored · Voice is processed locally
              </span>
              {isLoading && (
                <span style={{ fontSize:9, color:'#00e87a', fontFamily:'var(--font-mono)' }}>
                  thinking…
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}