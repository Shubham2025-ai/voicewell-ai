import React, { useState, useEffect, useRef } from 'react'
import ChatBubble      from './ChatBubble.jsx'
import { Waveform, TypingIndicator, ContextPill } from './VoiceComponents.jsx'
import MicButton       from './MicButton.jsx'
import SessionSummary  from './SessionSummary.jsx'

const SUGGESTIONS = [
  { icon:'🤒', text:'I have a headache since morning'   },
  { icon:'😰', text:"I'm feeling very stressed"         },
  { icon:'📊', text:'My weight is 70kg, height 170cm'   },
  { icon:'💊', text:'Can I take ibuprofen with aspirin?' },
  { icon:'🏥', text:'Find a doctor near me'             },
  { icon:'💧', text:'I drank a glass of water'          },
]

const FEATURES = [
  '🎙️ Voice AI','😰 Emotion Detection','🇮🇳 Hindi Support',
  '💊 Med Reminders','🏥 Doctor Finder','📊 BMI Calc',
  '💧 Water Tracker','🍽️ Meal Planner','📅 Calendar',
]

export default function HomePage({
  messages, isListening, isSpeaking, isLoading,
  interimText, turnCount, summary, loadingSummary,
  inputValue, setInputValue,
  onMicClick, onStop, onSend,
  onCloseSummary, speak, language, error,
}) {
  const chatEndRef  = useRef(null)
  const [featureIdx, setFeatureIdx] = useState(0)
  const hasMessages = messages.filter(m => m.role !== 'loading').length > 1

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, summary])

  useEffect(() => {
    const t = setInterval(() => setFeatureIdx(i => (i + 1) % FEATURES.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* HERO — shown before first message */}
      {!hasMessages && (
        <div style={{
          flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:'2rem 1.5rem', overflowY:'auto', position:'relative',
        }}>
          {/* Grid bg */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none',
            backgroundImage:'linear-gradient(rgba(0,232,122,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(0,232,122,0.025) 1px, transparent 1px)',
            backgroundSize:'44px 44px',
          }}/>

          {/* Two columns */}
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr',
            gap:'3rem', maxWidth:940, width:'100%', alignItems:'center',
            position:'relative', zIndex:1,
          }}>

            {/* LEFT */}
            <div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:7,
                padding:'5px 12px', borderRadius:99,
                background:'rgba(0,232,122,0.06)', border:'1px solid rgba(0,232,122,0.18)',
                fontSize:10, color:'#00e87a', fontFamily:'var(--font-mono)',
                marginBottom:20, letterSpacing:'0.07em',
              }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#00e87a', boxShadow:'0 0 6px #00e87a' }}/>
                AI VOICE AGENTS · HACKATHON 2026
              </div>

              <div style={{
                fontFamily:'var(--font-display)', fontWeight:800,
                fontSize:40, lineHeight:1.08, letterSpacing:'-1.5px',
                color:'#fff', marginBottom:16,
              }}>
                Talk to Your<br/>
                <span style={{ color:'#00e87a' }}>AI Doctor.</span><br/>
                <span style={{ color:'#2a2a2a', fontWeight:400 }}>Anytime.</span>
              </div>

              <p style={{ fontSize:13.5, color:'#3a3a3a', lineHeight:1.75, maxWidth:380, marginBottom:24, fontFamily:'var(--font-body)' }}>
                Voice-first health companion. Detects emotion, checks symptoms,
                finds doctors, manages medications — all through natural conversation
                in <strong style={{ color:'#555' }}>English & Hindi</strong>.
              </p>

              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'6px 14px', borderRadius:99,
                background:'#0d0d0d', border:'1px solid #1e1e1e',
                fontSize:11.5, color:'#444', fontFamily:'var(--font-mono)',
                marginBottom:26,
              }}>
                <span style={{ fontSize:14 }}>{FEATURES[featureIdx].split(' ')[0]}</span>
                <span>{FEATURES[featureIdx].split(' ').slice(1).join(' ')}</span>
                <span style={{ color:'#1e1e1e', fontSize:10 }}>+14 more</span>
              </div>

              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[{val:'15',label:'Features'},{val:'9',label:'Free APIs'},{val:'<1s',label:'Response'},{val:'0',label:'Code needed'}].map(s=>(
                  <div key={s.label} style={{ padding:'10px 14px', borderRadius:10, background:'#080808', border:'1px solid #141414', textAlign:'center', minWidth:62 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'#00e87a', lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:9, color:'#222', fontFamily:'var(--font-mono)', marginTop:3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Live preview card */}
            <div style={{ background:'#080808', border:'1px solid #181818', borderRadius:16, padding:'18px', boxShadow:'0 0 50px rgba(0,232,122,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, paddingBottom:12, borderBottom:'1px solid #0f0f0f' }}>
                <span style={{ fontSize:9.5, color:'#222', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Live Session Preview</span>
                <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#00e87a', boxShadow:'0 0 5px #00e87a' }}/>
                  <span style={{ fontSize:9.5, color:'#00e87a', fontFamily:'var(--font-mono)' }}>active</span>
                </div>
              </div>
              {[
                { icon:'🎙️', label:'Voice recognized',  val:'English · Hindi',    color:'#00e87a' },
                { icon:'😰', label:'Emotion detected',   val:'Neutral → Stressed', color:'#8b5cf6' },
                { icon:'🧠', label:'Context retained',   val:'8 turns',            color:'#60a5fa' },
                { icon:'💊', label:'Reminders active',   val:'Firebase synced',    color:'#00e87a' },
                { icon:'🏥', label:'Doctor finder',      val:'GPS + OpenStreetMap',color:'#f59e0b' },
                { icon:'📅', label:'Calendar booking',   val:'Google Calendar',    color:'#60a5fa' },
              ].map((r,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:i<5?'1px solid #0a0a0a':'none' }}>
                  <span style={{ fontSize:13, width:18, textAlign:'center', flexShrink:0 }}>{r.icon}</span>
                  <span style={{ fontSize:11.5, color:'#2a2a2a', flex:1 }}>{r.label}</span>
                  <span style={{ fontSize:10.5, color:r.color, fontFamily:'var(--font-mono)', fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ marginTop:12, padding:'7px 10px', borderRadius:8, background:'#040404', border:'1px solid #0f0f0f', fontSize:9, color:'#161616', fontFamily:'var(--font-mono)', wordBreak:'break-all' }}>
                SHA-256: a7f3c91e4b2d86e0f5a1c3d7e9b2f4a8c6e0d2b4f6a8c0e2d4f6a8c0e2d4f6a8
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', marginTop:28, maxWidth:800, width:'100%', position:'relative', zIndex:1 }}>
            {SUGGESTIONS.map((s,i)=>(
              <button key={i} onClick={()=>setInputValue(s.text)} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 12px', borderRadius:99,
                border:'1px solid #171717', background:'#090909',
                cursor:'pointer', fontSize:11, color:'#3a3a3a',
                fontFamily:'var(--font-body)', transition:'all 0.14s', whiteSpace:'nowrap',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,232,122,0.25)';e.currentTarget.style.color='#888'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#171717';e.currentTarget.style.color='#3a3a3a'}}
              >
                <span style={{ fontSize:12 }}>{s.icon}</span>{s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CHAT — shown after first message */}
      {hasMessages && (
        <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1rem' }}>
          {turnCount > 0 && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
              <ContextPill turnCount={turnCount} />
            </div>
          )}
          {messages.map((msg,idx) =>
            msg.role==='loading' ? <TypingIndicator key={idx}/> : <ChatBubble key={idx} message={msg}/>
          )}
          {loadingSummary && <div style={{ textAlign:'center', padding:'1rem', color:'#333', fontSize:13 }}>✨ Generating summary…</div>}
          {summary && <SessionSummary summary={summary} onClose={onCloseSummary} onSpeak={text=>speak(text,language)}/>}
          {interimText && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
              <div style={{ padding:'8px 14px', fontSize:12.5, fontStyle:'italic', borderRadius:'16px 16px 4px 16px', background:'rgba(0,232,122,0.05)', border:'1px dashed rgba(0,232,122,0.15)', color:'#2a4a38', maxWidth:'72%' }}>
                {interimText}…
              </div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>
      )}

      {/* INPUT ZONE */}
      <div style={{ borderTop:`1px solid ${hasMessages?'#0f0f0f':'transparent'}`, background:hasMessages?'#040404':'transparent', padding:'0.875rem 1.25rem 1rem', flexShrink:0, transition:'all 0.3s' }}>
        {hasMessages && <Waveform isActive={isSpeaking}/>}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:hasMessages?10:0 }}>
          <MicButton isListening={isListening} isSpeaking={isSpeaking} onClick={onMicClick} onStop={onStop} error={error}/>
          <div style={{ flex:1 }}>
            <form onSubmit={onSend} style={{ display:'flex', gap:8 }}>
              <input type="text" value={inputValue} onChange={e=>setInputValue(e.target.value)}
                disabled={isListening||isSpeaking||isLoading}
                placeholder={hasMessages?'Continue the conversation…':'Or type here to start…'}
                style={{ flex:1, padding:'10px 16px', borderRadius:99, border:'1px solid #1a1a1a', background:'#0d0d0d', color:'var(--text-1)', fontSize:13, fontFamily:'var(--font-body)', outline:'none', transition:'border-color 0.14s' }}
                onFocus={e=>e.target.style.borderColor='rgba(0,232,122,0.3)'}
                onBlur={e=>e.target.style.borderColor='#1a1a1a'}
              />
              <button type="submit" disabled={isListening||isSpeaking||isLoading||!inputValue.trim()}
                style={{ padding:'10px 22px', borderRadius:99, border:'none', background:'linear-gradient(135deg,#00e87a,#00c264)', color:'#000', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', flexShrink:0, opacity:(!inputValue.trim()||isLoading)?0.35:1, transition:'opacity 0.14s' }}>
                Send
              </button>
            </form>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, padding:'0 4px' }}>
              <span style={{ fontSize:9, color:'#181818', fontFamily:'var(--font-mono)' }}>Chrome · No audio stored · Privacy first</span>
              {isLoading && <span style={{ fontSize:9, color:'#00e87a', fontFamily:'var(--font-mono)' }}>thinking…</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}