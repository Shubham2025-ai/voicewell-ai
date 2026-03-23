import React, { useState, useEffect, useRef } from 'react'
import ChatBubble      from './ChatBubble.jsx'
import { Waveform, TypingIndicator, ContextPill } from './VoiceComponents.jsx'
import MicButton       from './MicButton.jsx'
import SessionSummary  from './SessionSummary.jsx'

/* ─── Data ──────────────────────────────────────────────────── */
const CHIPS = [
  { icon:'🤒', label:'Headache'         },
  { icon:'😰', label:'Stress & anxiety' },
  { icon:'📊', label:'BMI calculator'   },
  { icon:'💊', label:'Drug interaction' },
  { icon:'🏥', label:'Find a doctor'    },
  { icon:'💧', label:'Log water'        },
  { icon:'🍽️', label:'Meal plan'       },
  { icon:'📅', label:'Book appointment' },
]

const CHIPS_FULL = [
  'I have a headache since morning',
  "I'm feeling very stressed and anxious",
  'My weight is 70kg and height is 5 feet 8 inches',
  'Can I take ibuprofen with aspirin?',
  'Find a doctor near me',
  'I drank a glass of water',
  'Plan my vegetarian meals for the week',
  'Book a doctor checkup for tomorrow at 10 AM',
]

const FEATURES = [
  { icon:'🎙️', name:'Voice AI',        desc:'STT · LLM · TTS',       color:'#00e87a' },
  { icon:'😰', name:'Emotion AI',       desc:'HuggingFace model',      color:'#a78bfa' },
  { icon:'🧠', name:'8-turn memory',    desc:'Multi-turn context',     color:'#60a5fa' },
  { icon:'🇮🇳', name:'Hindi support',  desc:'Auto language switch',   color:'#fbbf24' },
  { icon:'💊', name:'Med reminders',    desc:'Firebase · browser notif',color:'#00e87a' },
  { icon:'🏥', name:'Doctor finder',    desc:'GPS · OpenStreetMap',    color:'#fbbf24' },
  { icon:'📊', name:'BMI calculator',   desc:'Instant voice calc',     color:'#60a5fa' },
  { icon:'💊', name:'Drug checker',     desc:'OpenFDA API',            color:'#ff3d5a' },
  { icon:'🧘', name:'Breathing guide',  desc:'4-7-8 animated',        color:'#a78bfa' },
  { icon:'💧', name:'Water tracker',    desc:'Daily goal · reminders', color:'#38bdf8' },
  { icon:'🍽️', name:'Meal planner',    desc:'7-day AI plan',          color:'#00e87a' },
  { icon:'📅', name:'Calendar',         desc:'Google Calendar API',    color:'#60a5fa' },
]

const TICKER_ITEMS = [
  { label:'Voice pipeline',     desc:'Speech → LLM → TTS in real time' },
  { label:'Emotion detection',  desc:'HuggingFace distilroberta model'  },
  { label:'Multi-turn context', desc:'Remembers last 8 conversation turns' },
  { label:'Hindi support',      desc:'Auto-detects and switches language' },
  { label:'Doctor finder',      desc:'GPS + OpenStreetMap, no API key'   },
  { label:'Drug interactions',  desc:'OpenFDA drug label database'       },
  { label:'Google Calendar',    desc:'Books real appointments in 1 tap'  },
]

/* ─── Component ─────────────────────────────────────────────── */
export default function HomePage({
  messages, isListening, isSpeaking, isLoading,
  interimText, turnCount, summary, loadingSummary,
  inputValue, setInputValue,
  onMicClick, onStop, onSend,
  onCloseSummary, speak, language, error,
}) {
  const chatEndRef  = useRef(null)
  const inputRef    = useRef(null)
  const [tick, setTick]   = useState(0)
  const [hoverChip, setHoverChip] = useState(null)
  const hasMessages = messages.filter(m => m.role !== 'loading').length > 1

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, summary])

  useEffect(() => {
    const t = setInterval(() => setTick(i => (i + 1) % TICKER_ITEMS.length), 3000)
    return () => clearInterval(t)
  }, [])

  const handleChip = (i) => {
    setInputValue(CHIPS_FULL[i])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  /* ── CHAT MODE ───────────────────────────────────────────── */
  if (hasMessages) return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ flex:1, overflowY:'auto', padding:'1.5rem 1.25rem' }}>
        {turnCount > 0 && (
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
            <ContextPill turnCount={turnCount} />
          </div>
        )}
        {messages.map((msg, idx) =>
          msg.role === 'loading'
            ? <TypingIndicator key={idx} />
            : <ChatBubble key={idx} message={msg} />
        )}
        {loadingSummary && (
          <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--text-2)', fontSize:13 }}>
            ✨ Generating session summary…
          </div>
        )}
        {summary && (
          <SessionSummary summary={summary} onClose={onCloseSummary} onSpeak={t => speak(t, language)} />
        )}
        {interimText && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:10 }}>
            <div style={{
              padding:'9px 15px', fontSize:13, fontStyle:'italic',
              borderRadius:'16px 16px 4px 16px',
              background:'rgba(0,232,122,0.07)',
              border:'1px dashed rgba(0,232,122,0.25)',
              color:'#7ecf9e', maxWidth:'72%',
            }}>{interimText}…</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <InputBar
        inputRef={inputRef} inputValue={inputValue} setInputValue={setInputValue}
        isListening={isListening} isSpeaking={isSpeaking} isLoading={isLoading}
        onMicClick={onMicClick} onStop={onStop} onSend={onSend} error={error}
        showWave={true}
      />
    </div>
  )

  /* ── HERO MODE ───────────────────────────────────────────── */
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ flex:1, overflowY:'auto', position:'relative' }}>

        {/* Grid texture */}
        <div style={{
          position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
          backgroundImage:`
            linear-gradient(rgba(0,232,122,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,232,122,0.03) 1px, transparent 1px)`,
          backgroundSize:'48px 48px',
        }}/>

        <div style={{ position:'relative', zIndex:1 }}>

          {/* ── TOP SECTION ─────────────────────────────── */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'1fr 380px',
            minHeight:'calc(100vh - 140px)',
          }}>

            {/* LEFT column */}
            <div style={{
              padding:'3rem 3rem 2rem',
              display:'flex', flexDirection:'column', justifyContent:'center',
              borderRight:'1px solid rgba(255,255,255,0.05)',
            }}>

              {/* Live badge */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'5px 14px', borderRadius:99, width:'fit-content',
                background:'rgba(0,232,122,0.08)',
                border:'1px solid rgba(0,232,122,0.2)',
                marginBottom:28,
              }}>
                <span style={{
                  display:'inline-block', width:7, height:7,
                  borderRadius:'50%', background:'#00e87a',
                  boxShadow:'0 0 8px #00e87a, 0 0 16px rgba(0,232,122,0.4)',
                }}/>
                <span style={{ fontSize:11, fontWeight:600, color:'#00e87a', fontFamily:'var(--font-mono)', letterSpacing:'0.08em' }}>
                  AI VOICE AGENTS · HACKATHON 2026
                </span>
              </div>

              {/* Headline */}
              <div style={{ fontFamily:'var(--font-display)', marginBottom:20 }}>
                <div style={{ fontSize:38, fontWeight:500, color:'rgba(255,255,255,0.45)', lineHeight:1.15, letterSpacing:'-0.5px' }}>
                  Talk to your
                </div>
                <div style={{
                  fontSize:64, fontWeight:800, color:'#00e87a',
                  lineHeight:1.0, letterSpacing:'-2px',
                  textShadow:'0 0 80px rgba(0,232,122,0.2)',
                }}>
                  AI Doctor.
                </div>
                <div style={{ fontSize:36, fontWeight:400, color:'rgba(255,255,255,0.2)', lineHeight:1.2, letterSpacing:'-0.5px' }}>
                  Anytime.
                </div>
              </div>

              {/* Subtitle */}
              <p style={{
                fontSize:15, color:'rgba(255,255,255,0.5)',
                lineHeight:1.75, maxWidth:440,
                marginBottom:28, fontFamily:'var(--font-body)',
                fontWeight:400,
              }}>
                Voice-first health companion — detects emotion, checks symptoms,
                finds doctors nearby, manages medications, and more.
                In{' '}
                <span style={{
                  color:'rgba(255,255,255,0.8)', fontWeight:600,
                  borderBottom:'1px solid rgba(255,255,255,0.2)',
                }}>
                  English & Hindi
                </span>.
              </p>

              {/* Ticker */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:12,
                padding:'9px 16px', borderRadius:10, width:'fit-content',
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)',
                marginBottom:32, maxWidth:420,
              }}>
                <span style={{ fontSize:10, color:'#00e87a', fontFamily:'var(--font-mono)', letterSpacing:'0.06em', flexShrink:0 }}>
                  NOW
                </span>
                <div style={{ width:1, height:14, background:'rgba(255,255,255,0.1)' }}/>
                <span style={{
                  fontSize:12, color:'rgba(255,255,255,0.6)',
                  fontFamily:'var(--font-mono)', flex:1,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>
                  {TICKER_ITEMS[tick].label}
                </span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:'var(--font-mono)', flexShrink:0 }}>
                  {TICKER_ITEMS[tick].desc}
                </span>
              </div>

              {/* Stats */}
              <div style={{ display:'flex', gap:10, marginBottom:36 }}>
                {[
                  { val:'15', label:'Features',    color:'#00e87a' },
                  { val:'9',  label:'Free APIs',   color:'#60a5fa' },
                  { val:'<1s',label:'Response',    color:'#a78bfa' },
                  { val:'0',  label:'Setup needed',color:'rgba(255,255,255,0.4)' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding:'12px 18px', borderRadius:12,
                    background:'rgba(255,255,255,0.03)',
                    border:'1px solid rgba(255,255,255,0.07)',
                    textAlign:'center', flex:1,
                    transition:'border-color 0.2s, background 0.2s',
                    cursor:'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = s.color + '55'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  }}
                  >
                    <div style={{
                      fontFamily:'var(--font-display)', fontWeight:800,
                      fontSize:24, color:s.color, lineHeight:1, marginBottom:5,
                    }}>{s.val}</div>
                    <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.3)', fontFamily:'var(--font-mono)', letterSpacing:'0.03em' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick action chips */}
              <div>
                <div style={{
                  fontSize:10, color:'rgba(255,255,255,0.2)',
                  fontFamily:'var(--font-mono)', letterSpacing:'0.1em',
                  textTransform:'uppercase', marginBottom:10,
                }}>
                  Try these →
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {CHIPS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleChip(i)}
                      onMouseEnter={() => setHoverChip(i)}
                      onMouseLeave={() => setHoverChip(null)}
                      style={{
                        display:'flex', alignItems:'center', gap:6,
                        padding:'7px 13px', borderRadius:99,
                        border:'1px solid rgba(255,255,255,0.1)',
                        background: hoverChip === i ? 'rgba(0,232,122,0.08)' : 'rgba(255,255,255,0.04)',
                        cursor:'pointer', fontSize:12,
                        color: hoverChip === i ? '#00e87a' : 'rgba(255,255,255,0.5)',
                        borderColor: hoverChip === i ? 'rgba(0,232,122,0.3)' : 'rgba(255,255,255,0.1)',
                        fontFamily:'var(--font-body)',
                        transition:'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize:13 }}>{c.icon}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT column — Feature panel */}
            <div style={{
              background:'rgba(255,255,255,0.015)',
              borderLeft:'1px solid rgba(255,255,255,0.05)',
              display:'flex', flexDirection:'column',
            }}>

              {/* Panel header */}
              <div style={{
                padding:'1.25rem 1.5rem',
                borderBottom:'1px solid rgba(255,255,255,0.05)',
                display:'flex', alignItems:'center', justifyContent:'space-between',
              }}>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontFamily:'var(--font-mono)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  Capabilities
                </span>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)', fontFamily:'var(--font-mono)' }}>
                  15 features
                </span>
              </div>

              {/* Feature list */}
              <div style={{ flex:1, overflowY:'auto', padding:'0.5rem 0' }}>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 1.5rem',
                    borderBottom:'1px solid rgba(255,255,255,0.03)',
                    transition:'background 0.12s',
                    cursor:'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width:34, height:34, borderRadius:9, flexShrink:0,
                      background:`${f.color}14`,
                      border:`1px solid ${f.color}25`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:16,
                    }}>{f.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,0.75)', marginBottom:1 }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.25)', fontFamily:'var(--font-mono)' }}>
                        {f.desc}
                      </div>
                    </div>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:f.color, opacity:0.6, flexShrink:0 }}/>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={onMicClick}
                  style={{
                    width:'100%', padding:'14px',
                    borderRadius:12, border:'none',
                    background:'linear-gradient(135deg, #00e87a, #00c264)',
                    cursor:'pointer', fontSize:14, fontWeight:700,
                    color:'#000',
                    fontFamily:'var(--font-display)',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    transition:'opacity 0.15s, transform 0.15s',
                    boxShadow:'0 4px 20px rgba(0,232,122,0.25)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='1';   e.currentTarget.style.transform='none' }}
                >
                  🎙️ Start talking now
                </button>
                <div style={{ textAlign:'center', marginTop:8, fontSize:10, color:'rgba(255,255,255,0.15)', fontFamily:'var(--font-mono)' }}>
                  Chrome only · No audio stored · Voice stays local
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Input bar at bottom */}
      <InputBar
        inputRef={inputRef} inputValue={inputValue} setInputValue={setInputValue}
        isListening={isListening} isSpeaking={isSpeaking} isLoading={isLoading}
        onMicClick={onMicClick} onStop={onStop} onSend={onSend} error={error}
        showWave={false}
      />
    </div>
  )
}

/* ─── Input Bar subcomponent ─────────────────────────────────── */
function InputBar({ inputRef, inputValue, setInputValue, isListening, isSpeaking, isLoading, onMicClick, onStop, onSend, error, showWave }) {
  return (
    <div style={{
      borderTop:'1px solid rgba(255,255,255,0.06)',
      background:'rgba(0,0,0,0.6)',
      backdropFilter:'blur(12px)',
      padding:'0.875rem 1.5rem 1rem',
      flexShrink:0,
    }}>
      {showWave && <Waveform isActive={isSpeaking} />}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginTop: showWave ? 10 : 0 }}>
        <MicButton
          isListening={isListening} isSpeaking={isSpeaking}
          onClick={onMicClick} onStop={onStop} error={error}
        />
        <div style={{ flex:1 }}>
          <form onSubmit={onSend} style={{ display:'flex', gap:8 }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isListening || isSpeaking || isLoading}
              placeholder="Or type here — describe your symptoms, ask anything…"
              style={{
                flex:1, padding:'12px 20px', borderRadius:99,
                border:'1px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.05)',
                color:'rgba(255,255,255,0.85)', fontSize:13.5,
                fontFamily:'var(--font-body)', outline:'none',
                transition:'border-color 0.15s, background 0.15s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(0,232,122,0.4)'
                e.target.style.background = 'rgba(255,255,255,0.07)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                e.target.style.background = 'rgba(255,255,255,0.05)'
              }}
            />
            <button
              type="submit"
              disabled={isListening || isSpeaking || isLoading || !inputValue.trim()}
              style={{
                padding:'12px 26px', borderRadius:99, border:'none',
                background: inputValue.trim() && !isLoading
                  ? 'linear-gradient(135deg,#00e87a,#00c264)'
                  : 'rgba(255,255,255,0.07)',
                color: inputValue.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.2)',
                fontSize:13.5, fontWeight:700,
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                fontFamily:'var(--font-display)', flexShrink:0,
                transition:'all 0.2s',
                boxShadow: inputValue.trim() && !isLoading ? '0 3px 15px rgba(0,232,122,0.2)' : 'none',
              }}
            >Send</button>
          </form>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, padding:'0 4px' }}>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.15)', fontFamily:'var(--font-mono)' }}>
              Chrome only · No audio stored · Voice processed locally
            </span>
            {isLoading && (
              <span style={{ fontSize:10, color:'#00e87a', fontFamily:'var(--font-mono)' }}>
                ● thinking…
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}