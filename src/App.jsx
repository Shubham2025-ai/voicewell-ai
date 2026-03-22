import React, { useState, useRef, useEffect, useCallback } from 'react'
import Header          from './components/Header.jsx'
import ChatBubble      from './components/ChatBubble.jsx'
import TypingIndicator from './components/TypingIndicator.jsx'
import Waveform        from './components/Waveform.jsx'
import MicButton       from './components/MicButton.jsx'
import ContextPill     from './components/ContextPill.jsx'
import RemindersPanel  from './components/RemindersPanel.jsx'
import SessionSummary  from './components/SessionSummary.jsx'
import { useSpeech }   from './hooks/useSpeech.js'
import { useGroq }     from './hooks/useGroq.js'
import { useTTS }      from './hooks/useTTS.js'
import { useEmotion, EMOTION_META } from './hooks/useEmotion.js'
import { useReminders }  from './hooks/useReminders.js'
import { useNutrition }  from './hooks/useNutrition.js'
import { useWeather }    from './hooks/useWeather.js'
import { getTimeString, containsHindi } from './utils/helpers.js'

const WELCOME = {
  role:    'assistant',
  content: "Hi! I'm VoiceWell — your AI health companion. I can help with symptoms, stress, medication reminders, and nutrition. Tap the mic and tell me how you're feeling today.",
  time:    getTimeString(),
}

// Quick action suggestions
const SUGGESTIONS = [
  { icon: '🤒', text: "I have a headache since morning" },
  { icon: '😰', text: "I'm feeling stressed and anxious" },
  { icon: '💊', text: "Remind me to take vitamin D at 8 AM" },
  { icon: '🥗', text: "How many calories in paneer?" },
]

const isAskingReminders = t => {
  const l = t.toLowerCase()
  return ['medication','reminder','medicine','tablet','pill','schedule'].some(w => l.includes(w)) &&
         ['what','list','show','today','have','my'].some(w => l.includes(w))
}
const isSettingReminder = t => {
  const l = t.toLowerCase()
  return (l.includes('remind') || l.includes('reminder')) &&
         (l.includes('take') || l.includes('tablet') || l.includes('medicine') || l.includes('pill'))
}
const isAskingSummary = t => {
  const l = t.toLowerCase()
  return ['summary','summarize','recap','what did we','session','review'].some(w => l.includes(w))
}

async function generateSummary(history, apiKey) {
  if (!apiKey || history.length < 2) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', max_tokens: 300, temperature: 0.3,
        messages: [
          { role: 'system', content: `Summarize this health conversation. Return ONLY valid JSON, no markdown:\n{"overview":"2-sentence summary","topics":["t1","t2"],"tips":["tip1","tip2","tip3"]}` },
          { role: 'user', content: `Conversation:\n${history.filter(m=>m.role!=='loading').map(m=>`${m.role==='user'?'User':'VoiceWell'}: ${m.content}`).join('\n')}` }
        ]
      })
    })
    const data = await res.json()
    return JSON.parse(data.choices?.[0]?.message?.content?.trim())
  } catch { return null }
}

export default function App() {
  const [messages,       setMessages]       = useState([WELCOME])
  const [language,       setLanguage]       = useState('en-US')
  const [darkMode,       setDarkMode]       = useState(false)
  const [showReminders,  setShowReminders]  = useState(false)
  const [summary,        setSummary]        = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [isConnected,    setIsConnected]    = useState(true)
  const [inputValue,     setInputValue]     = useState('')

  const chatEndRef   = useRef(null)
  const startTimeRef = useRef(null)

  // Live refs — fixes stale closure bug
  const messagesRef        = useRef(messages)
  const languageRef        = useRef(language)
  const remindersRef       = useRef([])
  const sendMessageRef     = useRef(null)
  const detectEmotionRef   = useRef(null)
  const addReminderRef     = useRef(null)
  const parseReminderRef   = useRef(null)
  const getNutritionRef    = useRef(null)
  const buildNutritionRef  = useRef(null)
  const getWeatherRef      = useRef(null)
  const buildWeatherRef    = useRef(null)
  const speakRef           = useRef(null)

  useEffect(() => { messagesRef.current = messages  }, [messages])
  useEffect(() => { languageRef.current = language  }, [language])

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { speak, stop, isSpeaking }   = useTTS()
  const { emotion, loading: emotionLoading, detectEmotion } = useEmotion()
  const { reminders, isMockMode, notifGranted, addReminder, removeReminder, parseReminderText } = useReminders()
  const { isNutritionQuery, getNutrition, buildNutritionText } = useNutrition()
  const { isWeatherQuery, getWeather, buildWeatherText } = useWeather()

  useEffect(() => { remindersRef.current = reminders }, [reminders])
  useEffect(() => { speakRef.current = speak }, [speak])
  useEffect(() => { detectEmotionRef.current = detectEmotion }, [detectEmotion])
  useEffect(() => { addReminderRef.current = addReminder }, [addReminder])
  useEffect(() => { parseReminderRef.current = parseReminderText }, [parseReminderText])
  useEffect(() => { getNutritionRef.current = getNutrition }, [getNutrition])
  useEffect(() => { buildNutritionRef.current = buildNutritionText }, [buildNutritionText])
  useEffect(() => { getWeatherRef.current = getWeather }, [getWeather])
  useEffect(() => { buildWeatherRef.current = buildWeatherText }, [buildWeatherText])

  // ── Dark mode ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, summary])

  // ── Groq response ──────────────────────────────────────────────────────────
  const handleGroqResponse = useCallback((agentText) => {
    const latency = startTimeRef.current
      ? Math.round(performance.now() - startTimeRef.current) : null
    setMessages(prev => [
      ...prev.filter(m => m.role !== 'loading'),
      { role: 'assistant', content: agentText, time: getTimeString(), latency }
    ])
    setIsConnected(true)
    speakRef.current?.(agentText, containsHindi(agentText) ? 'hi-IN' : languageRef.current)
  }, [])

  const { sendMessage, isLoading } = useGroq({ onResponse: handleGroqResponse })
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])

  // ── Main handler ──────────────────────────────────────────────────────────
  const handleFinalTranscript = useCallback(async (transcript) => {
    if (!transcript?.trim()) return
    const lang = languageRef.current
    if (containsHindi(transcript)) setLanguage('hi-IN')
    startTimeRef.current = performance.now()
    const userMsg = { role: 'user', content: transcript, time: getTimeString() }

    // EMERGENCY DETECTION — fires before any other intent check
    const t = transcript.toLowerCase()
    const isChestEmergency = (t.includes('chest pain') || t.includes('chest hurts') || t.includes('heart attack'))
    const isBreathingEmergency = t.includes("can't breathe") || t.includes('cannot breathe') || t.includes('cant breathe') || t.includes('difficulty breathing') || t.includes('shortness of breath')
    const isMentalEmergency = t.includes('suicide') || t.includes('kill myself') || t.includes('self harm') || t.includes('end my life') || t.includes('want to die')

    if (isChestEmergency || isBreathingEmergency) {
      const reply = '⚠️ This sounds like a medical emergency. Please call 112 immediately or go to the nearest emergency room. Chest pain or difficulty breathing can be life-threatening. Do not wait — call 112 now.'
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: reply, time: getTimeString() }])
      speakRef.current?.('This sounds like a medical emergency. Please call 112 immediately.', lang)
      return
    }
    if (isMentalEmergency) {
      const reply = 'I hear you and I am really concerned about you. Please call iCall right now at 9152987821. They are available and want to help. You deserve support. Are you safe right now?'
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: reply, time: getTimeString() }])
      speakRef.current?.('Please call iCall right now at 9152987821. You deserve support.', lang)
      return
    }

    // Session summary
    if (isAskingSummary(transcript)) {
      setMessages(prev => [...prev, userMsg])
      setLoadingSummary(true)
      const s = await generateSummary(messagesRef.current, import.meta.env.VITE_GROQ_API_KEY)
      setLoadingSummary(false)
      if (s) { setSummary(s); speakRef.current?.(`${s.overview}`, lang) }
      else {
        const fb = "We need a bit more conversation before I can summarise. Keep chatting!"
        setMessages(prev => [...prev, { role: 'assistant', content: fb, time: getTimeString() }])
        speakRef.current?.(fb, lang)
      }
      return
    }

    // Reminders: list
    if (isAskingReminders(transcript)) {
      const rems  = remindersRef.current
      const reply = rems.length === 0
        ? "You have no reminders set yet. Say 'Remind me to take vitamin D at 8 AM' to add one."
        : `Your reminders: ${rems.map(r => `${r.medication} at ${r.times.join(' and ')}`).join('. ')}.`
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: reply, time: getTimeString() }])
      speakRef.current?.(reply, lang); return
    }

    // Reminders: set
    if (isSettingReminder(transcript)) {
      const { medication, times } = parseReminderRef.current(transcript)
      await addReminderRef.current(medication, times)
      const reply = `Done! Reminder set to take ${medication} at ${times.join(' and ')}. I'll notify you on time.`
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: reply, time: getTimeString() }])
      speakRef.current?.(reply, lang); return
    }

    // Nutrition
    if (isNutritionQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role: 'loading', content: '', time: '' }])
      const data = await getNutritionRef.current(transcript)
      if (data) {
        const text = buildNutritionRef.current(data)
        setMessages(prev => [...prev.filter(m => m.role !== 'loading'),
          { role: 'assistant', content: text, nutritionCard: data, time: getTimeString() }])
        speakRef.current?.(text, lang); return
      }
      setMessages(prev => prev.filter(m => m.role !== 'loading'))
    }

    // Weather
    if (isWeatherQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role: 'loading', content: '', time: '' }])
      const cityMatch = transcript.match(/(?:in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
      const city      = cityMatch ? cityMatch[1] : 'Mumbai'
      const data      = await getWeatherRef.current(city)
      if (data) {
        const text = buildWeatherRef.current(data)
        setMessages(prev => [...prev.filter(m => m.role !== 'loading'),
          { role: 'assistant', content: text, weatherCard: data, time: getTimeString() }])
        speakRef.current?.(text, lang); return
      }
      setMessages(prev => prev.filter(m => m.role !== 'loading'))
    }

    // Default: Groq
    setMessages(prev => [...prev, userMsg, { role: 'loading', content: '', time: '' }])
    const history = messagesRef.current
      .filter(m => m.role !== 'loading')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    const detectedEmotion = await detectEmotionRef.current(transcript)
    const emotionPrompt   = EMOTION_META[detectedEmotion]?.prompt || ''
    sendMessageRef.current(transcript, history, emotionPrompt)
  }, [isNutritionQuery, isWeatherQuery])

  const { isListening, interimText, startListening, stopListening, error } = useSpeech({
    onFinalTranscript: handleFinalTranscript, language,
  })

  const handleClearChat = () => {
    stop(); setSummary(null)
    setMessages([{ ...WELCOME, time: getTimeString(), content: "Chat cleared! How can I help you?" }])
  }

  const handleTextSubmit = (e) => {
    e?.preventDefault()
    if (!inputValue.trim()) return
    handleFinalTranscript(inputValue.trim())
    setInputValue('')
  }

  const turnCount = Math.max(0, messages.filter(m => m.role !== 'loading').length - 1)
  const emotionMeta = EMOTION_META[emotion]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      <Header
        language={language}           onLanguageToggle={() => setLanguage(l => l === 'en-US' ? 'hi-IN' : 'en-US')}
        darkMode={darkMode}           onDarkToggle={() => setDarkMode(d => !d)}
        onClearChat={handleClearChat} onSummary={() => handleFinalTranscript('Give me a session summary')}
        emotion={emotion}             emotionLoading={emotionLoading}
        reminderCount={reminders.length}
        onRemindersToggle={() => setShowReminders(s => !s)}
        isConnected={isConnected}
      />

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left sidebar ─────────────────────────────────────── */}
        <div style={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          gap: '1.25rem',
          overflowY: 'auto',
        }} className="hidden md:flex">

          {/* Emotion card */}
          {emotionMeta && (
            <div className="fade-up" style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: emotionMeta.bg,
              border: `1px solid ${emotionMeta.color}30`,
            }}>
              <div style={{ fontSize: 11, color: emotionMeta.color, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Detected mood
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{emotionMeta.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: emotionMeta.color }}>{emotionMeta.label}</span>
              </div>
            </div>
          )}

          {/* Memory */}
          {turnCount > 0 && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Context memory
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(turnCount/8*100,100)}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{Math.min(turnCount,8)}/8</span>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quick actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleFinalTranscript(s.text)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 12,
                    color: 'var(--text-2)',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ lineHeight: 1.4 }}>{s.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reminders count */}
          {reminders.length > 0 && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Active reminders
              </div>
              {reminders.slice(0,3).map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize' }}>
                    {r.medication} · {r.times[0]}
                  </span>
                </div>
              ))}
              {reminders.length > 3 && (
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>+{reminders.length-3} more</div>
              )}
            </div>
          )}
        </div>

        {/* ── Main chat area ────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Chat messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            display: 'flex', flexDirection: 'column',
          }} className="chat-scroll">

            {messages.map((msg, idx) =>
              msg.role === 'loading'
                ? <TypingIndicator key={idx} />
                : <ChatBubble key={idx} message={msg} />
            )}

            {loadingSummary && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-3)', fontSize: 13 }}>
                ✨ Generating session summary…
              </div>
            )}

            {summary && (
              <SessionSummary
                summary={summary}
                onClose={() => setSummary(null)}
                onSpeak={text => speak(text, language)}
              />
            )}

            {interimText && (
              <div className="bubble-right" style={{
                display: 'flex', justifyContent: 'flex-end', marginBottom: 8,
              }}>
                <div style={{
                  padding: '8px 14px',
                  borderRadius: '16px 16px 4px 16px',
                  background: 'rgba(102,126,234,0.15)',
                  border: '1px dashed rgba(102,126,234,0.4)',
                  fontSize: 13, color: 'var(--text-2)', fontStyle: 'italic',
                }}>
                  {interimText}…
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ── Bottom input zone ─────────────────────────────── */}
          <div style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '1rem 1.5rem 1.25rem',
            flexShrink: 0,
          }}>

            {/* Waveform */}
            <div style={{ marginBottom: 12 }}>
              <Waveform isActive={isSpeaking} />
            </div>

            {/* Mic + text input row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

              {/* Mic button */}
              <MicButton
                isListening={isListening}
                isSpeaking={isSpeaking}
                onClick={() => isListening ? stopListening() : startListening()}
                onStop={stop}
                error={error}
              />

              {/* Text input */}
              <div style={{ flex: 1 }}>
                <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    disabled={isListening || isSpeaking || isLoading}
                    placeholder="Or type your message…"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      color: 'var(--text-1)',
                      fontSize: 14,
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button
                    type="submit"
                    disabled={isListening || isSpeaking || isLoading || !inputValue.trim()}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-xl)',
                      border: 'none',
                      background: 'var(--accent)',
                      color: '#000',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s',
                      opacity: (!inputValue.trim() || isLoading) ? 0.4 : 1,
                    }}
                  >
                    Send
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    Chrome only · No audio stored · Privacy first
                  </span>
                  {isLoading && (
                    <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                      thinking…
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminders panel overlay */}
      {showReminders && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none' }}>
          <div
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, pointerEvents: 'all' }}
            className="panel-slide"
          >
            <RemindersPanel
              reminders={reminders} isMockMode={isMockMode}
              notifGranted={notifGranted} onRemove={removeReminder}
              onClose={() => setShowReminders(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}