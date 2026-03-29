import React, { useState, useEffect, useRef } from 'react'
import ChatBubble from './ChatBubble.jsx'
import { Waveform, TypingIndicator, ContextPill } from './VoiceComponents.jsx'
import MicButton from './MicButton.jsx'
import SessionSummary from './SessionSummary.jsx'
import BreathingExercise from './BreathingExercise.jsx'
import HeroSection from './HeroSection.jsx'

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

export default function HomePage({
  messages, isListening, isSpeaking, isLoading,
  interimText, turnCount, summary, loadingSummary,
  inputValue, setInputValue,
  onMicClick, onStop, onSend,
  onCloseSummary, speak, language, error,
  showBreathing, onNavigate, onQuery,
  setShowBreathing,
  contextState,
  onResetContext,
  lastEmotion,
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

  const contextText = (() => {
    const parts = []
    if (contextState?.lastIntent) parts.push(`last=${contextState.lastIntent}`)
    if (contextState?.location)   parts.push(`loc=${contextState.location}`)
    if (contextState?.doctor)     parts.push(`doc=${contextState.doctor}`)
    if (contextState?.diet)       parts.push(`diet=${contextState.diet}`)
    if (contextState?.med)        parts.push(`med=${contextState.med}`)
    return parts.join(' · ')
  })()

  const emotionLabel = (() => {
    if (!lastEmotion) return null
    const map = {
      stressed: { text:'Stressed', color:'#f97316' },
      sad:      { text:'Sad',      color:'#60a5fa' },
      angry:    { text:'Tense',    color:'#f43f5e' },
      anxious:  { text:'Anxious',  color:'#c084fc' },
      worried:  { text:'Worried',  color:'#f59e0b' },
      happy:    { text:'Upbeat',   color:'#22c55e' },
      neutral:  { text:'Calm',     color:'#a3a3a3' },
    }
    return map[lastEmotion] || { text:lastEmotion, color:'#a3a3a3' }
  })()

  /* CHAT mode */
  if (hasMessages) return (
    <div style={{
      flex:1, display:'flex',
      flexDirection: wide ? 'row' : 'column',
      gap: wide ? 16 : 0,
      overflow:'hidden'
    }}>
      <div style={{
        flex: wide ? 2 : 1, minWidth:0,
        display:'flex', flexDirection:'column',
        borderRight: wide ? '1px solid rgba(255,255,255,0.06)' : 'none'
      }}>
        <div style={{ flex:1, overflowY:'auto', padding:'1.5rem 1.25rem' }}>
          {(turnCount > 0 || emotionLabel) && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:10, gap:8, flexWrap:'wrap' }}>
              <ContextPill turnCount={turnCount} />
              {contextText && <ContextStatePill text={contextText} />}
              {emotionLabel && (
                <EmotionPill
                  text={emotionLabel.text}
                  color={emotionLabel.color}
                  onBreathe={() => setShowBreathing(true)}
                />
              )}
            </div>
          )}
          {messages.map((m,i) =>
            m.role==='loading'
              ? <TypingIndicator key={i}/>
              : <ChatBubble
                  key={i}
                  message={m}
                  onSpeak={(text) => speak(text, language)}
                  onQuery={onQuery}
                />
          )}
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

        <InputBar
          ref={inputRef} inputValue={inputValue} setInputValue={setInputValue}
          isListening={isListening} isSpeaking={isSpeaking} isLoading={isLoading}
          onMicClick={onMicClick} onStop={onStop} onSend={onSend} error={error} showWave
        />
      </div>

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

          {contextText && (
            <Card title="Context">
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', fontSize:12, color:'rgba(255,255,255,0.75)' }}>
                {contextText}
              </div>
              <button onClick={onResetContext} style={{
                marginTop:8, fontSize:11, padding:'6px 10px', borderRadius:8,
                border:'1px solid rgba(255,255,255,0.12)',
                background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.8)',
                cursor:'pointer'
              }}>Reset context</button>
            </Card>
          )}

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

  /* HERO mode */
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ flex:1, overflowY:'auto' }}>
        <HeroSection
          onSetInputValue={setInputValue}
          onFocusInput={() => inputRef.current?.focus()}
        />

        <div style={{
          display:'flex', alignItems:'center', gap:8, justifyContent:'center',
          flexWrap:'wrap', padding:'1rem 0 2rem',
        }}>
          <span style={{ fontSize:9.5, color:'rgba(255,255,255,0.2)', fontFamily:'var(--font-mono)', marginRight:4, letterSpacing:'0.08em' }}>
            POWERED BY
          </span>
          {['React 18','Vite','Groq LLM','HuggingFace','Firebase','OpenStreetMap','OpenFDA','Google Calendar'].map(t => (
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

      <InputBar
        ref={inputRef} inputValue={inputValue} setInputValue={setInputValue}
        isListening={isListening} isSpeaking={isSpeaking} isLoading={isLoading}
        onMicClick={onMicClick} onStop={onStop} onSend={onSend} error={error} showWave={false}
      />
    </div>
  )
}

/* ─── helpers & styles ─────────────────────────────────────────── */
function EmotionPill({ text, color, onBreathe }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'6px 10px', borderRadius:12,
      background:'rgba(255,255,255,0.05)',
      border:`1px solid ${color}33`,
      color: color, fontSize:11, fontFamily:'var(--font-mono)'
    }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 10px ${color}55` }} />
      {text}
      <button
        onClick={onBreathe}
        style={{
          marginLeft:6, padding:'4px 8px', borderRadius:10,
          border:`1px solid ${color}33`,
          background:'rgba(255,255,255,0.04)',
          color:'rgba(255,255,255,0.85)',
          fontSize:11, cursor:'pointer'
        }}
      >Breathing</button>
    </div>
  )
}

function ContextStatePill({ text }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'6px 12px', borderRadius:12,
      background:'rgba(255,255,255,0.05)',
      border:'1px solid rgba(255,255,255,0.1)',
      color:'rgba(255,255,255,0.75)',
      fontSize:11, fontFamily:'var(--font-mono)'
    }}>
      🧭 Context · {text}
    </div>
  )
}

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
            <button type="submit" aria-label="Send message" disabled={isListening||isSpeaking||isLoading||!inputValue.trim()} style={{
              padding:'12px 28px', borderRadius:99, border:'none', flexShrink:0,
              background: inputValue.trim()&&!isLoading ? 'linear-gradient(135deg,#00e87a,#00c264)' : 'rgba(255,255,255,0.06)',
              color: inputValue.trim()&&!isLoading ? '#000' : 'rgba(255,255,255,0.2)',
              fontSize:14, fontWeight:700, cursor: inputValue.trim()?'pointer':'not-allowed',
              fontFamily:'var(--font-display)', transition:'all 0.18s',
              boxShadow: inputValue.trim()&&!isLoading ? '0 4px 18px rgba(0,232,122,0.25)' : 'none',
            }}>Send</button>
          </form>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, padding:'0 4px' }} aria-live="polite">
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.15)', fontFamily:'var(--font-mono)' }}>
              Chrome only · No audio stored · Voice stays local
            </span>
            {isLoading && <span style={{ fontSize:10, color:'#00e87a', fontFamily:'var(--font-mono)' }} role="status" aria-live="polite">● thinking…</span>}
          </div>
        </div>
      </div>
    </div>
  )
})