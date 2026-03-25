import React, { useState, useEffect, useRef } from 'react'
import ChatBubble from './ChatBubble.jsx'
import { Waveform, TypingIndicator, ContextPill } from './VoiceComponents.jsx'
import MicButton from './MicButton.jsx'
import SessionSummary from './SessionSummary.jsx'
import BreathingExercise from './BreathingExercise.jsx'

/* ─── constants ─────────────────────────────────────────────── */
const CHIPS = [
  { icon:'🤒', label:'Headache',      full:'I have a headache since morning' },
  { icon:'😰', label:'Stress',        full:"I'm feeling very stressed and anxious" },
  { icon:'📊', label:'BMI',           full:'My weight is 70kg and height is 5 feet 8 inches' },
  { icon:'💊', label:'Drug check',    full:'Can I take ibuprofen with aspirin?' },
  { icon:'🏥', label:'Find doctor',   full:'Find a doctor near me' },
  { icon:'💧', label:'Log water',     full:'I drank a glass of water' },
  { icon:'🍽️', label:'Meal plan',    full:'Plan my vegetarian meals for the week' },
  { icon:'📅', label:'Appointment',   full:'Book a checkup for tomorrow at 10 AM' },
]

const TICKER = [
  'Voice STT + TTS pipeline',
  'Emotion detection via HuggingFace',
  'Multi-turn 8-turn context',
  'Hindi auto-detect + switch',
  'GPS-based doctor finder',
  'Drug interaction via OpenFDA',
  'Google Calendar booking',
]

/* ─── main component ─────────────────────────────────────────── */
export default function HomePage({
  messages, isListening, isSpeaking, isLoading,
  interimText, turnCount, summary, loadingSummary,
  inputValue, setInputValue,
  onMicClick, onStop, onSend,
  onCloseSummary, speak, language, error,
  showBreathing, onNavigate, onQuery,
  setShowBreathing,
}) {
  const chatEndRef = useRef(null)
  const inputRef   = useRef(null)
  const [tick, setTick] = useState(0)
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const hasMessages = messages.filter(m => m.role !== 'loading').length > 1

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = e => setWide(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, summary])
  useEffect(() => {
    const t = setInterval(() => setTick(i => (i+1) % TICKER.length), 2800)
    return () => clearInterval(t)
  }, [])

  /* CHAT mode */
  if (hasMessages) return (
    <div style={{
      flex:1, display:'flex',
      flexDirection: wide ? 'row' : 'column',
      gap: wide ? 16 : 0,
      overflow:'hidden'
    }}>
      {/* Conversation column */}
      <div style={{
        flex: wide ? 2 : 1, minWidth:0,
        display:'flex', flexDirection:'column',
        borderRight: wide ? '1px solid rgba(255,255,255,0.06)' : 'none'
      }}>
        <div style={{ flex:1, overflowY:'auto', padding:'1.5rem 1.25rem' }}>
          {turnCount > 0 && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <ContextPill turnCount={turnCount} />
            </div>
          )}
          {messages.map((m,i) => m.role==='loading'
            ? <TypingIndicator key={i}/>
            : <ChatBubble key={i} message={m}/>)}
          {loadingSummary && (
            <div style={{ textAlign:'center', padding:'1.5rem', color:'rgba(255,255,255,0.4)', fontSize:13 }}>
              ✨ Generating summary…
            </div>
          )}
          {summary && <SessionSummary summary={summary} onClose={onCloseSummary} onSpeak={t=>speak(t,language)}/>}
          {interimText && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:10 }}>
              <div style={{
                padding:'9px 15px', fontSize:13, fontStyle:'italic',
                borderRadius:'16px 16px 4px 16px',
                background:'rgba(0,232,122,0.07)',
                border:'1px dashed rgba(0,232,122,0.2)',
                color:'#6dcc96', maxWidth:'72%'
              }}>
                {interimText}…
              </div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>

        {/* Sticky input bar */}
        <InputBar
          ref={inputRef} inputValue={inputValue} setInputValue={setInputValue}
          isListening={isListening} isSpeaking={isSpeaking} isLoading={isLoading}
          onMicClick={onMicClick} onStop={onStop} onSend={onSend} error={error} showWave
        />
      </div>

      {/* Side panel (no stats) */}
      {wide && (
        <aside style={{
          flex:1, minWidth:280, maxWidth:420,
          display:'flex', flexDirection:'column',
          overflowY:'auto', padding:'1.25rem 1.25rem 1.1rem',
          gap:14
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
            <ContextPill turnCount={turnCount}/>
            <StatusBadge isListening={isListening} isSpeaking={isSpeaking} isLoading={isLoading}/>
          </div>

          {showBreathing && (
            <BreathingExercise
              onClose={() => setShowBreathing && setShowBreathing(false)}
              onSpeak={text => speak(text, language)}
            />
          )}

          <Card title="Quick prompts">
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8 }}>
              {CHIPS.slice(0,5).map((c, i) => (
                <button key={i}
                  onClick={() => { setInputValue(c.full); setTimeout(()=>inputRef.current?.focus(),50) }}
                  style={quickButtonStyle}
                  aria-label={`Prompt: ${c.label}`}
                >
                  <span style={{ fontSize:16, flexShrink:0 }}>{c.icon}</span>
                  <span style={{ fontSize:12.5, color:'rgba(255,255,255,0.72)', fontFamily:'var(--font-body)' }}>{c.label}</span>
                  <span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,0.28)', flexShrink:0 }}>↵</span>
                </button>
              ))}
            </div>
          </Card>
        </aside>
      )}
    </div>
  )

  /* HERO mode (stats already removed) */
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ maxWidth: 1100, margin:'0 auto', padding: '3.5rem 2rem 2rem' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'6px 16px', borderRadius:99,
              background:'rgba(0,232,122,0.08)',
              border:'1px solid rgba(0,232,122,0.2)',
            }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#00e87a', boxShadow:'0 0 10px #00e87a', display:'inline-block' }}/>
              <span style={{ fontSize:11, fontWeight:700, color:'#00e87a', fontFamily:'var(--font-mono)', letterSpacing:'0.1em' }}>
                AI VOICE AGENTS · HACKATHON 2026
              </span>
            </div>
          </div>

          <div style={{ textAlign:'center', marginBottom:20 }}>
            <h1 style={{
              fontFamily:'var(--font-display)', margin:0,
              fontSize:'clamp(42px, 6vw, 76px)',
              fontWeight:800, lineHeight:1.05,
              letterSpacing:'-2px',
            }}>
              <span style={{ color:'rgba(255,255,255,0.9)' }}>Your AI </span>
              <span style={{
                color:'#00e87a',
                textShadow:'0 0 60px rgba(0,232,122,0.35), 0 0 120px rgba(0,232,122,0.15)',
              }}>Health</span>
              <br/>
              <span style={{ color:'rgba(255,255,255,0.9)' }}>Companion</span>
            </h1>
          </div>

          <p style={{
            textAlign:'center', margin:'0 auto 32px',
            fontSize:17, color:'rgba(255,255,255,0.45)',
            lineHeight:1.7, maxWidth:560,
            fontFamily:'var(--font-body)', fontWeight:400,
          }}>
            Voice-first. Emotion-aware. Multilingual.
            Ask about symptoms, find doctors nearby, manage medications —
            all through <span style={{ color:'rgba(255,255,255,0.75)', fontWeight:500 }}>natural conversation</span>.
          </p>

          <div style={{ display:'flex', justifyContent:'center', marginBottom:36 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:12,
              padding:'8px 18px', borderRadius:10,
              background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.09)',
              minWidth:320,
            }}>
              <span style={{ fontSize:10, fontWeight:700, color:'#00e87a', fontFamily:'var(--font-mono)', letterSpacing:'0.07em', flexShrink:0 }}>
                LIVE
              </span>
              <div style={{ width:1, height:14, background:'rgba(255,255,255,0.12)', flexShrink:0 }}/>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontFamily:'var(--font-mono)', flex:1, textAlign:'center' }}>
                {TICKER[tick]}
              </span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontFamily:'var(--font-mono)', flexShrink:0 }}>
                {tick + 1}/{TICKER.length}
              </span>
            </div>
          </div>

          {/* Simplified grid: Quick start + Capabilities only */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:16,
              padding:'1.75rem',
              gridRow:'span 2',
              display:'flex', flexDirection:'column'
            }}>
              <div style={{
                fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.25)',
                fontFamily:'var(--font-mono)', letterSpacing:'0.1em', marginBottom:16, textTransform:'uppercase'
              }}>
                Quick start
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                {CHIPS.map((c, i) => (
                  <button key={i} onClick={() => { setInputValue(c.full); setTimeout(()=>inputRef.current?.focus(),50) }}
                    style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'10px 13px', borderRadius:10,
                      border:'1px solid rgba(255,255,255,0.07)',
                      background:'rgba(255,255,255,0.03)',
                      cursor:'pointer', textAlign:'left',
                      transition:'all 0.14s', width:'100%',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,232,122,0.07)'
                      e.currentTarget.style.borderColor = 'rgba(0,232,122,0.25)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                    }}
                  >
                    <span style={{ fontSize:16, flexShrink:0 }}>{c.icon}</span>
                    <span style={{ fontSize:12.5, color:'rgba(255,255,255,0.65)', fontFamily:'var(--font-body)' }}>{c.label}</span>
                    <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:16,
              padding:'1.75rem 2rem',
              gridColumn:'span 2'
            }}>
              <div style={{
                fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.25)',
                fontFamily:'var(--font-mono)', letterSpacing:'0.1em', marginBottom:16, textTransform:'uppercase'
              }}>
                All capabilities
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {[
                  { icon:'🎙️', name:'Voice pipeline',    tag:'STT · LLM · TTS',         color:'#00e87a' },
                  { icon:'😰', name:'Emotion detection',  tag:'HuggingFace AI',          color:'#a78bfa' },
                  { icon:'🧠', name:'8-turn memory',      tag:'Multi-turn context',      color:'#60a5fa' },
                  { icon:'🇮🇳', name:'Hindi support',    tag:'Auto-detect language',    color:'#fbbf24' },
                  { icon:'💊', name:'Medication alerts',  tag:'Firebase + browser notif',color:'#00e87a' },
                  { icon:'🏥', name:'Doctor finder',      tag:'GPS + OpenStreetMap',     color:'#fbbf24' },
                  { icon:'📊', name:'BMI calculator',     tag:'Instant voice calc',      color:'#60a5fa' },
                  { icon:'💊', name:'Drug interactions',  tag:'OpenFDA database',        color:'#ff6b6b' },
                  { icon:'🧘', name:'Breathing guide',    tag:'4-7-8 animated',         color:'#a78bfa' },
                  { icon:'💧', name:'Water tracker',      tag:'Daily goal + reminders',  color:'#38bdf8' },
                  { icon:'🍽️', name:'Meal planner',      tag:'7-day AI-generated',      color:'#00e87a' },
                  { icon:'📅', name:'Calendar booking',   tag:'Google Calendar API',     color:'#60a5fa' },
                ].map((c, i) => (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:9,
                    padding:'8px 10px', borderRadius:9,
                    background:'rgba(255,255,255,0.02)',
                    border:'1px solid rgba(255,255,255,0.05)',
                    transition:'all 0.12s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${c.color}0d`
                    e.currentTarget.style.borderColor = `${c.color}30`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                  }}
                  >
                    <div style={{
                      width:28, height:28, borderRadius:7, flexShrink:0,
                      background:`${c.color}18`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:13,
                    }}>{c.icon}</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:11.5, fontWeight:600, color:'rgba(255,255,255,0.7)', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.25)', fontFamily:'var(--font-mono)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            display:'flex', alignItems:'center', gap:8, justifyContent:'center',
            flexWrap:'wrap', padding:'1rem 0 2rem',
          }}>
            <span style={{ fontSize:9.5, color:'rgba(255,255,255,0.2)', fontFamily:'var(--font-mono)', marginRight:4, letterSpacing:'0.08em' }}>
              POWERED BY
            </span>
            {['React 18','Vite','Groq LLM','HuggingFace','Firebase','OpenStreetMap','OpenFDA','OpenWeatherMap','Google Calendar'].map(t => (
              <span key={t} style={{
                fontSize:10, padding:'3px 9px', borderRadius:99,
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                color:'rgba(255,255,255,0.35)',
                fontFamily:'var(--font-mono)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <InputBar
        ref={inputRef} inputValue={inputValue} setInputValue={setInputValue}
        isListening={isListening} isSpeaking={isSpeaking} isLoading={isLoading}
        onMicClick={onMicClick} onStop={onStop} onSend={onSend} error={error} showWave={false}
      />
    </div>
  )
}

/* ─── helpers & styles ─────────────────────────────────────────── */
function StatusBadge({ isListening, isSpeaking, isLoading }) {
  let label = 'Idle', color = 'rgba(255,255,255,0.35)'
  if (isListening) { label = 'Listening…'; color = '#22d3ee' }
  else if (isSpeaking) { label = 'Speaking…'; color = '#a78bfa' }
  else if (isLoading) { label = 'Thinking…'; color = '#00e87a' }
  return (
    <div role="status" aria-live="polite"
      style={{
        padding:'6px 12px', borderRadius:12,
        border:'1px solid rgba(255,255,255,0.08)',
        color, fontSize:12, fontFamily:'var(--font-mono)'
      }}>
      ● {label}
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.03)',
      border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:14,
      padding:'1rem 1.1rem'
    }}>
      <div style={{
        fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)',
        fontFamily:'var(--font-mono)', letterSpacing:'0.08em', marginBottom:10, textTransform:'uppercase'
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

const quickButtonStyle = {
  display:'flex', alignItems:'center', gap:10,
  padding:'10px 12px', borderRadius:10,
  border:'1px solid rgba(255,255,255,0.07)',
  background:'rgba(255,255,255,0.03)',
  cursor:'pointer', textAlign:'left',
  transition:'all 0.14s', width:'100%'
}

/* ─── InputBar ───────────────────────────────────────────────── */
const InputBar = React.forwardRef(function InputBar(
  { inputValue, setInputValue, isListening, isSpeaking, isLoading, onMicClick, onStop, onSend, error, showWave },
  ref
) {
  return (
    <div style={{
      position:'sticky', bottom:0, left:0, right:0, zIndex:10,
      borderTop:'1px solid rgba(255,255,255,0.07)',
      background:'rgba(8,8,8,0.95)',
      backdropFilter:'blur(16px)',
      padding:'1rem 1.5rem 1.1rem',
      flexShrink:0,
    }}>
      {showWave && <div style={{ marginBottom:10 }}><Waveform isActive={isSpeaking}/></div>}
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <MicButton isListening={isListening} isSpeaking={isSpeaking} onClick={onMicClick} onStop={onStop} error={error}/>
        <div style={{ flex:1 }}>
          <form onSubmit={onSend} style={{ display:'flex', gap:8 }}>
            <input
              ref={ref}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isListening || isSpeaking || isLoading}
              placeholder="Or type here — describe symptoms, ask anything…"
              aria-label="Message VoiceWell"
              style={{
                flex:1, padding:'12px 20px', borderRadius:99,
                border:'1px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.06)',
                color:'rgba(255,255,255,0.9)', fontSize:14,
                fontFamily:'var(--font-body)', outline:'none',
                transition:'all 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor='rgba(0,232,122,0.45)'; e.target.style.background='rgba(255,255,255,0.08)' }}
              onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='rgba(255,255,255,0.06)' }}
            />
            <button type="submit" disabled={isListening||isSpeaking||isLoading||!inputValue.trim()} style={{
              padding:'12px 28px', borderRadius:99, border:'none', flexShrink:0,
              background: inputValue.trim()&&!isLoading ? 'linear-gradient(135deg,#00e87a,#00c264)' : 'rgba(255,255,255,0.06)',
              color: inputValue.trim()&&!isLoading ? '#000' : 'rgba(255,255,255,0.2)',
              fontSize:14, fontWeight:700, cursor: inputValue.trim()?'pointer':'not-allowed',
              fontFamily:'var(--font-display)', transition:'all 0.18s',
              boxShadow: inputValue.trim()&&!isLoading ? '0 4px 18px rgba(0,232,122,0.25)' : 'none',
            }}>Send</button>
          </form>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, padding:'0 4px' }}>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.15)', fontFamily:'var(--font-mono)' }}>
              Chrome only · No audio stored · Voice stays local
            </span>
            {isLoading && <span style={{ fontSize:10, color:'#00e87a', fontFamily:'var(--font-mono)' }}>● thinking…</span>}
          </div>
        </div>
      </div>
    </div>
  )
})