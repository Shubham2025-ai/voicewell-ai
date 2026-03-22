import React, { useState, useRef, useEffect, useCallback } from 'react'

// Layout
import Header          from './components/Header.jsx'
import ChromeWarning   from './components/ChromeWarning.jsx'

// Voice page components
import ChatBubble      from './components/ChatBubble.jsx'
import { Waveform, TypingIndicator, ContextPill } from './components/VoiceComponents.jsx'
import MicButton       from './components/MicButton.jsx'
import SessionSummary  from './components/SessionSummary.jsx'

// Feature pages
import HealthPage      from './components/HealthPage.jsx'
import NutritionPage   from './components/NutritionPage.jsx'
import MedicationsPage from './components/MedicationsPage.jsx'
import AppointmentsPage from './components/AppointmentsPage.jsx'
import DashboardPage   from './components/DashboardPage.jsx'

// Hooks
import { useSpeech }        from './hooks/useSpeech.js'
import { useGroq }          from './hooks/useGroq.js'
import { useTTS }           from './hooks/useTTS.js'
import { useEmotion, EMOTION_META } from './hooks/useEmotion.js'
import { useReminders }     from './hooks/useReminders.js'
import { useNutrition }     from './hooks/useNutrition.js'
import { useWeather }       from './hooks/useWeather.js'
import { useDrugInteraction } from './hooks/useDrugInteraction.js'
import { useBMI }           from './hooks/useBMI.js'
import { useDoctorFinder }  from './hooks/useDoctorFinder.js'
import { useAppointment }   from './hooks/useAppointment.js'
import { useWaterIntake }   from './hooks/useWaterIntake.js'
import { useMealPlanner }   from './hooks/useMealPlanner.js'
import { getTimeString, containsHindi } from './utils/helpers.js'

const WELCOME = {
  role:    'assistant',
  content: "Hi! I'm VoiceWell — your AI health companion. Tap the mic and tell me how you're feeling. I can help with symptoms, stress, medications, nutrition, and more.",
  time:    getTimeString(),
}

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
          { role:'system', content:'Summarize this health conversation. Return ONLY valid JSON:\n{"overview":"2-sentence summary","topics":["t1","t2"],"tips":["tip1","tip2","tip3"]}' },
          { role:'user',   content:`Conversation:\n${history.filter(m=>m.role!=='loading').map(m=>`${m.role==='user'?'User':'VoiceWell'}: ${m.content}`).join('\n')}` }
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
  const [darkMode,       setDarkMode]       = useState(true)
  const [activePage,     setActivePage]     = useState('home')
  const [summary,        setSummary]        = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [isConnected,    setIsConnected]    = useState(true)
  const [inputValue,     setInputValue]     = useState('')
  const [moodHistory,    setMoodHistory]    = useState([])
  const [latencies,      setLatencies]      = useState([])
  const [apiCallCount,   setApiCallCount]   = useState(0)
  const [showBreathing,  setShowBreathing]  = useState(false)

  const chatEndRef = useRef(null)
  const startTime  = useRef(null)

  // Live refs — stale closure fix
  const messagesRef       = useRef(messages)
  const languageRef       = useRef(language)
  const remindersRef      = useRef([])
  const sendMessageRef    = useRef(null)
  const detectEmotionRef  = useRef(null)
  const addReminderRef    = useRef(null)
  const parseReminderRef  = useRef(null)
  const speakRef          = useRef(null)
  const getNutritionRef   = useRef(null)
  const buildNutrRef      = useRef(null)
  const getWeatherRef     = useRef(null)
  const buildWeatherRef   = useRef(null)

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { languageRef.current = language }, [language])

  // Hooks
  const { speak, stop, isSpeaking }   = useTTS()
  const { emotion, loading: emoLoad, detectEmotion } = useEmotion()
  const { reminders, isMockMode, notifGranted, addReminder, removeReminder, parseReminderText } = useReminders()
  const { isNutritionQuery, getNutrition, buildNutritionText } = useNutrition()
  const { isWeatherQuery, getWeather, buildWeatherText } = useWeather()
  const { isDrugQuery, checkInteraction, buildInteractionText } = useDrugInteraction()
  const { isBMIQuery, calculateBMI, buildBMIText } = useBMI()
  const { isDoctorQuery, findNearbyDoctors, buildDoctorText } = useDoctorFinder()
  const { isAppointmentQuery, bookAppointment, buildAppointmentText } = useAppointment()
  const { isWaterQuery, isLoggingWater, logWater, getStatus, buildWaterText, total: waterTotal, pct: waterPct, log: waterLog, goalMl } = useWaterIntake()
  const { isMealPlanQuery, generateMealPlan, buildMealText } = useMealPlanner()

  useEffect(() => { remindersRef.current   = reminders     }, [reminders])
  useEffect(() => { speakRef.current       = speak         }, [speak])
  useEffect(() => { detectEmotionRef.current = detectEmotion }, [detectEmotion])
  useEffect(() => { addReminderRef.current = addReminder   }, [addReminder])
  useEffect(() => { parseReminderRef.current = parseReminderText }, [parseReminderText])
  useEffect(() => { getNutritionRef.current  = getNutrition   }, [getNutrition])
  useEffect(() => { buildNutrRef.current     = buildNutritionText }, [buildNutritionText])
  useEffect(() => { getWeatherRef.current    = getWeather     }, [getWeather])
  useEffect(() => { buildWeatherRef.current  = buildWeatherText  }, [buildWeatherText])

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [darkMode])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, summary])

  // Groq response
  const handleGroqResponse = useCallback((agentText) => {
    const latency = startTime.current ? Math.round(performance.now() - startTime.current) : null
    setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:agentText, time:getTimeString(), latency }])
    setIsConnected(true)
    if (latency) setLatencies(prev => [...prev.slice(-9), latency])
    setApiCallCount(prev => prev + 1)
    speakRef.current?.(agentText, containsHindi(agentText) ? 'hi-IN' : languageRef.current)
  }, [])

  const { sendMessage, isLoading } = useGroq({ onResponse: handleGroqResponse })
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])

  // Main transcript handler
  const handleFinalTranscript = useCallback(async (transcript) => {
    if (!transcript?.trim()) return
    const lang = languageRef.current
    if (containsHindi(transcript)) setLanguage('hi-IN')
    startTime.current = performance.now()
    const userMsg = { role:'user', content:transcript, time:getTimeString() }

    // Switch to home page to show the conversation
    setActivePage('home')

    // Emergency detection
    const t = transcript.toLowerCase()
    const isChest  = t.includes('chest pain') || t.includes('heart attack') || t.includes('chest hurts')
    const isBreath = t.includes("can't breathe") || t.includes('cannot breathe') || t.includes('difficulty breathing') || t.includes('shortness of breath')
    const isMental = t.includes('suicide') || t.includes('kill myself') || t.includes('self harm') || t.includes('want to die')

    if (isChest || isBreath) {
      const reply = "⚠️ This sounds like a medical emergency. Please call 112 immediately or go to the nearest emergency room. Chest pain or difficulty breathing can be life-threatening. Don't wait — call 112 now."
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.('This sounds like a medical emergency. Please call 112 immediately.', lang); return
    }
    if (isMental) {
      const reply = "I hear you and I'm really concerned. Please call iCall right now at 9152987821. They want to support you. You deserve care. Are you safe right now?"
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.('Please call iCall at 9152987821 right now.', lang); return
    }

    // Breathing
    if (t.includes('breathing exercise') || t.includes('4-7-8') || t.includes('breathe with me')) {
      setShowBreathing(true)
      const reply = "I've opened the breathing exercise. The 4-7-8 technique is great for stress — let's do it together."
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang); return
    }

    // Summary
    if (isAskingSummary(transcript)) {
      setMessages(prev => [...prev, userMsg])
      setLoadingSummary(true)
      const s = await generateSummary(messagesRef.current, import.meta.env.VITE_GROQ_API_KEY)
      setLoadingSummary(false)
      if (s) { setSummary(s); speakRef.current?.(`${s.overview}`, lang) }
      else {
        const fb = "We need a bit more conversation before I can summarise. Keep chatting!"
        setMessages(prev => [...prev, { role:'assistant', content:fb, time:getTimeString() }])
        speakRef.current?.(fb, lang)
      }
      return
    }

    // Reminders: list
    if (isAskingReminders(transcript)) {
      const rems  = remindersRef.current
      const reply = rems.length === 0
        ? "You have no reminders yet. Say 'Remind me to take vitamin D at 8 AM' to add one."
        : `Your reminders: ${rems.map(r=>`${r.medication} at ${r.times.join(' and ')}`).join('. ')}.`
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang); return
    }

    // Reminders: set
    if (isSettingReminder(transcript)) {
      const { medication, times } = parseReminderRef.current(transcript)
      await addReminderRef.current(medication, times)
      const reply = `Done! Reminder set to take ${medication} at ${times.join(' and ')}. I'll notify you on time.`
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang); return
    }

    // Appointment
    if (isAppointmentQuery(transcript)) {
      const data = bookAppointment(transcript)
      const text = buildAppointmentText(data)
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:text, appointmentCard:data, time:getTimeString() }])
      speakRef.current?.(text, lang); return
    }

    // Water
    if (isWaterQuery(transcript)) {
      if (isLoggingWater(transcript)) {
        const data = logWater(transcript)
        const text = buildWaterText(data, 'log')
        setMessages(prev => [...prev, userMsg, { role:'assistant', content:text, waterCard:{...data, log:[]}, waterType:'log', time:getTimeString() }])
        speakRef.current?.(text, lang)
      } else {
        const data = getStatus()
        const text = buildWaterText(data, 'status')
        setMessages(prev => [...prev, userMsg, { role:'assistant', content:text, waterCard:data, waterType:'status', time:getTimeString() }])
        speakRef.current?.(text, lang)
      }
      return
    }

    // Meal plan
    if (isMealPlanQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      try {
        const plan = await generateMealPlan(transcript, import.meta.env.VITE_GROQ_API_KEY)
        const text = buildMealText(plan)
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, mealPlanCard:plan, time:getTimeString() }])
        speakRef.current?.(text, lang)
        setApiCallCount(prev => prev + 1)
      } catch {
        const err = "I couldn't generate a meal plan right now. Please try again."
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:err, time:getTimeString() }])
        speakRef.current?.(err, lang)
      }
      return
    }

    // Doctor finder
    if (isDoctorQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      try {
        const data = await findNearbyDoctors(transcript)
        const text = buildDoctorText(data)
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, doctorCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang)
      } catch (err) {
        const errMsg = err.message==='denied'
          ? "Location access was blocked. Click the lock icon in Chrome → Site settings → Location → Allow, then try again."
          : "I couldn't access your location. Please enable location and try again."
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:errMsg, time:getTimeString() }])
        speakRef.current?.(errMsg, lang)
      }
      return
    }

    // Drug interaction
    if (isDrugQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      const data = await checkInteraction(transcript)
      if (data) {
        const text = buildInteractionText(data)
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, drugCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang); return
      }
      setMessages(prev => prev.filter(m=>m.role!=='loading'))
    }

    // BMI
    if (isBMIQuery(transcript)) {
      const data = calculateBMI(transcript)
      if (data) {
        const text = buildBMIText(data)
        setMessages(prev => [...prev, userMsg, { role:'assistant', content:text, bmiCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang); return
      }
    }

    // Nutrition
    if (isNutritionQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      const data = await getNutritionRef.current(transcript)
      if (data) {
        const text = buildNutrRef.current(data)
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, nutritionCard:data, time:getTimeString() }])
        setApiCallCount(prev => prev + 1)
        speakRef.current?.(text, lang); return
      }
      setMessages(prev => prev.filter(m=>m.role!=='loading'))
    }

    // Weather
    if (isWeatherQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      const cityMatch = transcript.match(/(?:in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
      const city      = cityMatch ? cityMatch[1] : 'Mumbai'
      const data      = await getWeatherRef.current(city)
      if (data) {
        const text = buildWeatherRef.current(data)
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, weatherCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang); return
      }
      setMessages(prev => prev.filter(m=>m.role!=='loading'))
    }

    // Default: Groq
    setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
    const history = messagesRef.current.filter(m=>m.role!=='loading').map(m=>({ role:m.role==='assistant'?'assistant':'user', content:m.content }))
    const detectedEmotion = await detectEmotionRef.current(transcript)
    if (detectedEmotion) {
      setMoodHistory(prev => [...prev.slice(-19), detectedEmotion])
      if (detectedEmotion === 'stressed' && !showBreathing) setShowBreathing(true)
    }
    const emotionPrompt = EMOTION_META[detectedEmotion]?.prompt || ''
    sendMessageRef.current(transcript, history, emotionPrompt)

  }, [isNutritionQuery, isWeatherQuery, isDrugQuery, isBMIQuery, calculateBMI, buildBMIText,
      checkInteraction, buildInteractionText, showBreathing, isDoctorQuery, findNearbyDoctors,
      buildDoctorText, isAppointmentQuery, bookAppointment, buildAppointmentText,
      isWaterQuery, isLoggingWater, logWater, getStatus, buildWaterText,
      isMealPlanQuery, generateMealPlan, buildMealText])

  const { isListening, interimText, startListening, stopListening, error } = useSpeech({
    onFinalTranscript: handleFinalTranscript, language,
  })

  const handleClearChat = () => {
    stop(); setSummary(null); setMoodHistory([])
    setMessages([{ ...WELCOME, time:getTimeString(), content:"Chat cleared! How can I help you?" }])
  }

  const turnCount  = Math.max(0, messages.filter(m=>m.role!=='loading').length - 1)
  const avgLatency = latencies.length ? Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length) : null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg)' }}>

      <ChromeWarning />

      <Header
        language={language}           onLanguageToggle={() => setLanguage(l=>l==='en-US'?'hi-IN':'en-US')}
        darkMode={darkMode}           onDarkToggle={() => setDarkMode(d=>!d)}
        onClearChat={handleClearChat} onSummary={() => handleFinalTranscript('Give me a session summary')}
        emotion={emotion}             emotionLoading={emoLoad}
        reminderCount={reminders.length}
        onRemindersToggle={() => setActivePage('medications')}
        isConnected={isConnected}
        activePage={activePage}       onNavigate={setActivePage}
      />

      {/* Page content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* ── HOME: Voice Chat ─────────────────────────────────────────── */}
        {activePage === 'home' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Chat messages */}
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
                <div style={{ textAlign:'center', padding:'1rem', color:'var(--text-3)', fontSize:13 }}>
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
                <div className="pop-right" style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
                  <div style={{
                    padding:'8px 14px', fontSize:13, fontStyle:'italic',
                    borderRadius:'16px 16px 4px 16px',
                    background:'var(--green-dim)', border:'1px dashed var(--green-2)',
                    color:'var(--text-2)',
                  }}>{interimText}…</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Voice input zone */}
            <div style={{ borderTop:'1px solid var(--border)', background:'var(--surface)', padding:'0.875rem 1rem 1rem', flexShrink:0 }}>
              <Waveform isActive={isSpeaking} />
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:10 }}>
                <MicButton
                  isListening={isListening} isSpeaking={isSpeaking}
                  onClick={() => isListening ? stopListening() : startListening()}
                  onStop={stop} error={error}
                />
                <div style={{ flex:1 }}>
                  <form onSubmit={e => { e.preventDefault(); if (!inputValue.trim()) return; handleFinalTranscript(inputValue.trim()); setInputValue('') }}
                    style={{ display:'flex', gap:8 }}>
                    <input
                      type="text" value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      disabled={isListening || isSpeaking || isLoading}
                      placeholder="Or type your message…"
                      style={{
                        flex:1, padding:'9px 14px', borderRadius:99,
                        border:'1px solid var(--border)', background:'var(--surface-2)',
                        color:'var(--text-1)', fontSize:13, fontFamily:'var(--font-body)', outline:'none',
                      }}
                      onFocus={e => e.target.style.borderColor='var(--green)'}
                      onBlur={e  => e.target.style.borderColor='var(--border)'}
                    />
                    <button type="submit" disabled={isListening||isSpeaking||isLoading||!inputValue.trim()}
                      style={{ padding:'9px 18px', borderRadius:99, border:'none', background:'var(--green)', color:'#000', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', opacity:(!inputValue.trim()||isLoading)?0.4:1 }}>
                      Send
                    </button>
                  </form>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, padding:'0 4px' }}>
                    <span style={{ fontSize:9, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
                      Chrome only · No audio stored · Privacy first
                    </span>
                    {isLoading && <span style={{ fontSize:9, color:'var(--green)', fontFamily:'var(--font-mono)' }}>thinking…</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HEALTH PAGE ──────────────────────────────────────────────── */}
        {activePage === 'health' && (
          <HealthPage
            onQuery={handleFinalTranscript}
            speak={speak}
          />
        )}

        {/* ── NUTRITION PAGE ───────────────────────────────────────────── */}
        {activePage === 'nutrition' && (
          <NutritionPage
            onQuery={handleFinalTranscript}
            waterTotal={waterTotal}
            waterPct={waterPct}
            waterLog={waterLog}
            goalMl={goalMl}
          />
        )}

        {/* ── MEDICATIONS PAGE ─────────────────────────────────────────── */}
        {activePage === 'medications' && (
          <MedicationsPage
            reminders={reminders}
            isMockMode={isMockMode}
            notifGranted={notifGranted}
            onRemove={removeReminder}
            onQuery={handleFinalTranscript}
          />
        )}

        {/* ── APPOINTMENTS PAGE ────────────────────────────────────────── */}
        {activePage === 'appointments' && (
          <AppointmentsPage onQuery={handleFinalTranscript} />
        )}

        {/* ── DASHBOARD PAGE ───────────────────────────────────────────── */}
        {activePage === 'dashboard' && (
          <DashboardPage
            turnCount={turnCount}
            avgLatency={avgLatency}
            apiCallCount={apiCallCount}
            emotionCount={moodHistory.length}
            moodHistory={moodHistory}
            messages={messages}
          />
        )}
      </div>

    </div>
  )
}