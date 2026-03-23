import React, { useState, useEffect, useRef } from 'react'
import ChatBubble      from './ChatBubble.jsx'
import { Waveform, TypingIndicator, ContextPill } from './VoiceComponents.jsx'
import MicButton       from './MicButton.jsx'
import SessionSummary  from './SessionSummary.jsx'

const SUGGESTIONS = [
  { icon:'🤒', text:'I have a headache'         },
  { icon:'😰', text:"I'm feeling stressed"       },
  { icon:'📊', text:'Calculate my BMI'           },
  { icon:'💊', text:'Drug interaction check'     },
  { icon:'🏥', text:'Find doctor near me'        },
  { icon:'💧', text:'Log water intake'           },
  { icon:'🍽️', text:'Plan my meals'             },
  { icon:'📅', text:'Book an appointment'        },
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
  { icon:'🎙️', label:'Voice',      val:'EN + हिं',            color:'#00e87a' },
  { icon:'😰', label:'Emotion',     val:'neutral → stressed',   color:'#a78bfa' },
  { icon:'🧠', label:'Memory',      val:'8-turn context',       color:'#60a5fa' },
  { icon:'💊', label:'Reminders',   val:'Firebase sync',        color:'#00e87a' },
  { icon:'🏥', label:'Doctor',      val:'GPS · OpenStreetMap',  color:'#fbbf24' },
  { icon:'📅', label:'Calendar',    val:'Google Calendar',      color:'#60a5fa' },
  { icon:'💧', label:'Hydration',   val:'2.5L daily goal',      color:'#38bdf8' },
  { icon:'🍽️', label:'Nutrition',  val:'7-day AI plan',        color:'#00e87a' },
]

export default function HomePage({
  messages, isListening, isSpeaking, isLoading,
  interimText, turnCount, summary, loadingSummary,
  inputValue, setInputValue,
  onMicClick, onStop, onSend,
  onCloseSummary, speak, language, error,
}) {
  const chatEndRef  = useRef(null)
  const [tick, setTick] = useState(0)
  const hasMessages = messages.filter(m => m.role !== 'loading').length > 1

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, summary])

  useEffect(() => {
    const t = setInterval(() => setTick(i => (i + 1) % TICKER.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      {!hasMessages && (
        <div style={{ flex:1, overflowY:'auto', position:'relative', display:'flex', flexDirection:'column' }}>

          {/* Dot grid background */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
            backgroundImage:'radial-gradient(circle, rgba(0,232,122,0.06) 1px, transparent 1px)',
            backgroundSize:'32px 32px',
          }}/>

          {/* Two-column grid */}
          <div style={{
            flex:1, display:'grid',
            gridTemplateColumns:'1fr 400px',
            position:'relative', zIndex:1,
            minHeight:0,
          }}>

            {/* ── LEFT ─────────────────────────────────── */}
            <div style={{
              padding:'2.5rem 2.5rem 2rem',
              display:'flex', flexDirection:'column', justifyContent:'center',
              borderRight:'1px solid #111',
            }}>

              {/* Badge */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'5px 13px', borderRadius:99, width:'fit-content',
                background:'rgba(0,232,122,0.08)', border:'1px solid rgba(0,232,122,0.25)',
                fontSize:10.5, color:'#00e87a', fontFamily:'var(--font-mono)',
                marginBottom:24, letterSpacing:'0.07em',
              }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#00e87a', boxShadow:'0 0 8px #00e87a' }}/>
                AI VOICE AGENTS · HACKATHON 2026
              </div>

              {/* Headline — proper contrast white */}
              <div style={{ fontFamily:'var(--font-display)', lineHeight:1.1, letterSpacing:'-1px', marginBottom:20 }}>
                <div style={{ fontSize:34, fontWeight:600, color:'#888' }}>Talk to Your</div>
                <div style={{
                  fontSize:52, fontWeight:800, color:'#00e87a',
                  textShadow:'0 0 50px rgba(0,232,122,0.25)',
                }}>AI Doctor.</div>
                <div style={{ fontSize:30, fontWeight:500, color:'#333' }}>Anytime.</div>
              </div>

              {/* Subtitle — visible grey */}
              <p style={{
                fontSize:13.5, color:'#666',
                lineHeight:1.75, maxWidth:380,
                marginBottom:22, fontFamily:'var(--font-body)',
              }}>
                Voice-first health companion. Detects emotion, checks symptoms,
                finds doctors, manages medications — in{' '}
                <span style={{ color:'#aaa', fontWeight:600 }}>English & Hindi</span>.
              </p>

              {/* Ticker */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:10,
                padding:'7px 14px', borderRadius:99, width:'fit-content',
                background:'#0d0d0d', border:'1px solid #222',
                marginBottom:24, maxWidth:340, overflow:'hidden',
              }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'#00e87a', flexShrink:0 }}/>
                <span style={{ fontSize:11.5, color:'#666', fontFamily:'var(--font-mono)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>
                  {TICKER[tick]}
                </span>
                <span style={{ fontSize:10, color:'#333', fontFamily:'var(--font-mono)', flexShrink:0 }}>
                  +{TICKER.length - 1}
                </span>
              </div>

              {/* Stats — visible colours */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
                {[
                  { val:'15', label:'features',    color:'#00e87a' },
                  { val:'9',  label:'free APIs',    color:'#60a5fa' },
                  { val:'<1s',label:'response',     color:'#a78bfa' },
                  { val:'5',  label:'integrations', color:'#fbbf24' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding:'11px 16px', borderRadius:10,
                    background:'#0d0d0d', border:'1px solid #1e1e1e',
                    textAlign:'center', minWidth:74,
                    transition:'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = s.color + '44'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
                  >
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:s.color, lineHeight:1 }}>
                      {s.val}
                    </div>
                    <div style={{ fontSize:9.5, color:'#444', fontFamily:'var(--font-mono)', marginTop:3 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick start pills — visible text */}
              <div>
                <div style={{
                  fontSize:9.5, color:'#333', fontFamily:'var(--font-mono)',
                  marginBottom:9, letterSpacing:'0.08em', textTransform:'uppercase',
                }}>
                  Quick start →
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => setInputValue(s.text)} style={{
                      display:'flex', alignItems:'center', gap:8,
                      padding:'8px 11px', borderRadius:8,
                      border:'1px solid #1e1e1e', background:'#0d0d0d',
                      cursor:'pointer', fontSize:12, color:'#666',
                      fontFamily:'var(--font-body)', transition:'all 0.14s',
                      textAlign:'left', whiteSpace:'nowrap', overflow:'hidden',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(0,232,122,0.3)'
                      e.currentTarget.style.color = '#ccc'
                      e.currentTarget.style.background = 'rgba(0,232,122,0.04)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#1e1e1e'
                      e.currentTarget.style.color = '#666'
                      e.currentTarget.style.background = '#0d0d0d'
                    }}
                    >
                      <span style={{ fontSize:14, flexShrink:0 }}>{s.icon}</span>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT — Preview card ─────────────────── */}
            <div style={{
              display:'flex', flexDirection:'column',
              background:'#050505',
              borderLeft:'1px solid #111',
            }}>

              {/* Card header */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'1.25rem 1.5rem 1rem',
                borderBottom:'1px solid #0f0f0f',
              }}>
                <span style={{
                  fontSize:10, color:'#333', fontFamily:'var(--font-mono)',
                  textTransform:'uppercase', letterSpacing:'0.1em',
                }}>
                  Live Session Preview
                </span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#00e87a', boxShadow:'0 0 7px #00e87a' }}/>
                  <span style={{ fontSize:9.5, color:'#00e87a', fontFamily:'var(--font-mono)' }}>active</span>
                </div>
              </div>

              {/* Feature rows — label properly visible */}
              <div style={{ flex:1, padding:'0 1.5rem', overflowY:'auto' }}>
                {PREVIEW_ROWS.map((r, i) => (
                  <div key={i} style={{
                    display:'grid',
                    gridTemplateColumns:'20px 1fr auto',
                    alignItems:'center', gap:12,
                    padding:'10px 0',
                    borderBottom: i < PREVIEW_ROWS.length - 1 ? '1px solid #0c0c0c' : 'none',
                  }}>
                    <span style={{ fontSize:13, textAlign:'center' }}>{r.icon}</span>
                    <span style={{ fontSize:12, color:'#555', fontFamily:'var(--font-body)' }}>{r.label}</span>
                    <span style={{
                      fontSize:11, color:r.color,
                      fontFamily:'var(--font-mono)', fontWeight:600,
                      textAlign:'right', whiteSpace:'nowrap',
                    }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Tech stack fingerprint */}
              <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid #0f0f0f' }}>
                <div style={{
                  padding:'10px 12px', borderRadius:8,
                  background:'#020202', border:'1px solid #0e0e0e',
                  marginBottom:12,
                }}>
                  <div style={{ fontSize:9, color:'#2a2a2a', fontFamily:'var(--font-mono)', marginBottom:5, letterSpacing:'0.08em' }}>
                    STACK FINGERPRINT
                  </div>
                  <div style={{ fontSize:9.5, color:'#3a3a3a', fontFamily:'var(--font-mono)', lineHeight:1.6 }}>
                    react18 · vite · groq · hf · firebase<br/>
                    osm · openfda · owm · gcal · web-speech
                  </div>
                </div>

                {/* Green CTA */}
                <button
                  onClick={onMicClick}
                  style={{
                    width:'100%', padding:'13px',
                    borderRadius:10,
                    border:'none',
                    background:'linear-gradient(135deg, #00e87a, #00c264)',
                    cursor:'pointer', fontSize:13, fontWeight:700,
                    color:'#000', fontFamily:'var(--font-display)',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    transition:'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  🎙️ Start talking now
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── CHAT ─────────────────────────────────────────── */}
      {hasMessages && (
        <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1rem' }}>
          {turnCount > 0 && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
              <ContextPill turnCount={turnCount} />
            </div>
          )}
          {messages.map((msg, idx) =>
            msg.role === 'loading'
              ? <TypingIndicator key={idx} />
              : <ChatBubble key={idx} message={msg} />
          )}
          {loadingSummary && (
            <div style={{ textAlign:'center', padding:'1rem', color:'#444', fontSize:13 }}>
              ✨ Generating session summary…
            </div>
          )}
          {summary && (
            <SessionSummary
              summary={summary}
              onClose={onCloseSummary}
              onSpeak={text => speak(text, language)}
            />
          )}
          {interimText && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
              <div style={{
                padding:'8px 14px', fontSize:12.5, fontStyle:'italic',
                borderRadius:'16px 16px 4px 16px',
                background:'rgba(0,232,122,0.05)',
                border:'1px dashed rgba(0,232,122,0.2)',
                color:'#3a6a4a', maxWidth:'72%',
              }}>{interimText}…</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* ── INPUT ZONE ───────────────────────────────────── */}
      <div style={{
        borderTop:'1px solid #111',
        background:'#030303',
        padding:'0.875rem 1.5rem 1rem',
        flexShrink:0,
      }}>
        {hasMessages && <Waveform isActive={isSpeaking} />}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginTop: hasMessages ? 10 : 0 }}>
          <MicButton
            isListening={isListening} isSpeaking={isSpeaking}
            onClick={onMicClick} onStop={onStop} error={error}
          />
          <div style={{ flex:1 }}>
            <form onSubmit={onSend} style={{ display:'flex', gap:8 }}>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isListening || isSpeaking || isLoading}
                placeholder={hasMessages ? 'Continue the conversation…' : 'Or type here to start…'}
                style={{
                  flex:1, padding:'11px 18px', borderRadius:99,
                  border:'1px solid #222', background:'#0d0d0d',
                  color:'#e0e0e0', fontSize:13,
                  fontFamily:'var(--font-body)', outline:'none',
                  transition:'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,232,122,0.4)'}
                onBlur={e  => e.target.style.borderColor = '#222'}
              />
              <button
                type="submit"
                disabled={isListening || isSpeaking || isLoading || !inputValue.trim()}
                style={{
                  padding:'11px 24px', borderRadius:99, border:'none',
                  background:'linear-gradient(135deg,#00e87a,#00c264)',
                  color:'#000', fontSize:13, fontWeight:700,
                  cursor:'pointer', fontFamily:'var(--font-display)', flexShrink:0,
                  opacity: (!inputValue.trim() || isLoading) ? 0.35 : 1,
                  transition:'opacity 0.14s',
                }}
              >Send</button>
            </form>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, padding:'0 4px' }}>
              <span style={{ fontSize:9.5, color:'#2a2a2a', fontFamily:'var(--font-mono)' }}>
                Chrome only · No audio stored · Voice processed locally
              </span>
              {isLoading && (
                <span style={{ fontSize:9.5, color:'#00e87a', fontFamily:'var(--font-mono)' }}>
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