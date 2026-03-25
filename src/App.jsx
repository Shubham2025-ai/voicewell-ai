import React, { useState, useRef, useEffect, useCallback } from 'react'

// Layout
import Header          from './components/Header.jsx'
import HomePage        from './components/HomePage.jsx'
import ChromeWarning   from './components/ChromeWarning.jsx'

// Voice page components

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

const isSettingReminder = t => {
  const l = t.toLowerCase()
  // Allow common typos: remaind, remined, remimd
  const hasIntent = /re?mi[nm]d/.test(l) || l.includes('set a reminder') || l.includes('add reminder') || l.includes('schedule')
  // Must mention taking something OR a medicine name
  const hasTake = l.includes('take') || l.includes('tablet') || l.includes('medicine') || l.includes('pill') ||
                  l.includes('drug') || l.includes('vitamin') || l.includes('capsule') || l.includes('dose') ||
                  l.includes('aspirin') || l.includes('paracetamol') || l.includes('ibuprofen') || l.includes('insulin')
  // Must have a time reference
  const hasTime = /\d/.test(l) || ['morning','afternoon','evening','night','noon','am','pm','daily','everyday','tonight','today'].some(w => l.includes(w))
  return hasIntent && (hasTake || hasTime)
}
const isAskingReminders = t => {
  const l = t.toLowerCase()
  // Only asking — must have question/list words, must NOT be setting
  if (isSettingReminder(t)) return false
  return ['medication','reminder','medicine','tablet','pill','schedule'].some(w => l.includes(w)) &&
         ['what','list','show','have','my','all'].some(w => l.includes(w))
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

  useEffect(() => {
    // Default is dark — toggle 'light' class for light mode
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])
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

  // Stable ref-based wrapper — same function identity forever, no stale closure issues
  const handleFinalTranscriptRef = useRef(null)
  const onQuery = useCallback((t) => { handleFinalTranscriptRef.current?.(t) }, [])

  // Module-level dedup set — survives re-renders completely
  const processingRef = useRef(new Set())

  // Main transcript handler
  const handleFinalTranscript = useCallback(async (transcript) => {
    if (!transcript?.trim()) return
    if (processingRef.current.has(transcript)) return
    processingRef.current.add(transcript)
    const clearPending = () => processingRef.current.delete(transcript)

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
      speakRef.current?.('This sounds like a medical emergency. Please call 112 immediately.', lang)
      clearPending(); return
    }
    if (isMental) {
      const reply = "I hear you and I'm really concerned. Please call iCall right now at 9152987821. They want to support you. You deserve care. Are you safe right now?"
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.('Please call iCall at 9152987821 right now.', lang)
      clearPending(); return
    }

    // Breathing
    if (t.includes('breathing exercise') || t.includes('4-7-8') || t.includes('breathe with me')) {
      setShowBreathing(true)
      const reply = "I've opened the breathing exercise. The 4-7-8 technique is great for stress — let's do it together."
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang)
      clearPending(); return
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
      clearPending(); return
    }

    // Reminders: list
    if (isAskingReminders(transcript)) {
      const rems  = remindersRef.current
      const reply = rems.length === 0
        ? "You have no reminders yet. Say 'Remind me to take vitamin D at 8 AM' to add one."
        : `Your reminders: ${rems.map(r=>`${r.medication} at ${r.times.join(' and ')}`).join('. ')}.`
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang)
      clearPending(); return
    }

    // Reminders: set
    if (isSettingReminder(transcript)) {
      const { medication, times } = parseReminderRef.current(transcript)
      await addReminderRef.current(medication, times)
      const reply = `Done! Reminder set to take ${medication} at ${times.join(' and ')}. I'll notify you on time.`
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang)
      clearPending(); return
    }

    // Appointment
    if (isAppointmentQuery(transcript)) {
      const data = bookAppointment(transcript)
      const text = buildAppointmentText(data)
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:text, appointmentCard:data, time:getTimeString() }])
      speakRef.current?.(text, lang)
      clearPending(); return
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
      clearPending(); return
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
      clearPending(); return
    }

    // Doctor finder
    if (isDoctorQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])

      // Try to extract a city name from the query (e.g. "hospitals in Pune")
      const cityMatch = transcript.match(/(?:in|near|at|around)\s+([A-Za-z\s]{3,25})(?:\s|$)/i)
      const mentionedCity = cityMatch ? cityMatch[1].trim() : null

      try {
        const data = await findNearbyDoctors(transcript)
        const text = buildDoctorText(data)
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, doctorCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang)
      } catch (err) {
        let errMsg
        if (err.message === 'denied') {
          errMsg = "📍 Location access is blocked. To fix: tap the lock icon in your browser's address bar → Site settings → Location → Allow. Then try again."
        } else if (err.message === 'not-supported') {
          errMsg = "Your browser doesn't support location access. Try opening VoiceWell in Chrome for the best experience."
        } else if (err.message === 'timeout' || err.message === 'unavailable') {
          const fallbackCity = mentionedCity || 'Mumbai'
          try {
            const data = await findNearbyDoctors(transcript, fallbackCity)
            const text = `⚠️ Couldn't get your GPS location, so showing results near ${fallbackCity} instead. ${buildDoctorText(data)}`
            setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, doctorCard:data, time:getTimeString() }])
            speakRef.current?.(text, lang)
            clearPending(); return
          } catch {
            errMsg = `📡 Location signal is weak and I couldn't find "${fallbackCity}" either. Please check your internet connection and try again, or say "hospitals in Mumbai" to search by city name.`
          }
        } else {
          errMsg = "Something went wrong while searching for nearby facilities. Please try again in a moment."
        }
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:errMsg, time:getTimeString() }])
        speakRef.current?.(errMsg, lang)
      }
      clearPending(); return
    }

    // Drug interaction
    if (isDrugQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      const data = await checkInteraction(transcript)
      if (data) {
        const text = buildInteractionText(data)
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, drugCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang)
        clearPending(); return
      }
      setMessages(prev => prev.filter(m=>m.role!=='loading'))
    }

    // BMI
    if (isBMIQuery(transcript)) {
      const data = calculateBMI(transcript)
      if (data) {
        const text = buildBMIText(data)
        setMessages(prev => [...prev, userMsg, { role:'assistant', content:text, bmiCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang)
        clearPending(); return
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
        speakRef.current?.(text, lang)
        clearPending(); return
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
        speakRef.current?.(text, lang)
        clearPending(); return
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
    clearPending()

  }, [isNutritionQuery, isWeatherQuery, isDrugQuery, isBMIQuery, calculateBMI, buildBMIText,
      checkInteraction, buildInteractionText, showBreathing, isDoctorQuery, findNearbyDoctors,
      buildDoctorText, isAppointmentQuery, bookAppointment, buildAppointmentText,
      isWaterQuery, isLoggingWater, logWater, getStatus, buildWaterText,
      isMealPlanQuery, generateMealPlan, buildMealText])

  // Keep ref in sync so onQuery always calls the latest version
  useEffect(() => { handleFinalTranscriptRef.current = handleFinalTranscript }, [handleFinalTranscript])

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
        onClearChat={handleClearChat} onSummary={() => onQuery('Give me a session summary')}
        emotion={emotion}             emotionLoading={emoLoad}
        reminderCount={reminders.length}
        onRemindersToggle={() => setActivePage('medications')}
        isConnected={isConnected}
        activePage={activePage}       onNavigate={setActivePage}
      />

      {/* Page content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* ── HOME PAGE ────────────────────────────────────────────────── */}
        {activePage === 'home' && (
          <HomePage
            messages={messages}
            isListening={isListening} isSpeaking={isSpeaking} isLoading={isLoading}
            interimText={interimText} turnCount={turnCount}
            summary={summary} loadingSummary={loadingSummary}
            showBreathing={showBreathing} setShowBreathing={setShowBreathing} emotion={emotion}
            inputValue={inputValue} setInputValue={setInputValue}
            onMicClick={() => isListening ? stopListening() : startListening()}
            onStop={stop}
            onSend={e => { e.preventDefault(); if (!inputValue.trim()) return; onQuery(inputValue.trim()); setInputValue('') }}
            onCloseSummary={() => setSummary(null)}
            onSpeak={speak} speak={speak} language={language}
            onNavigate={setActivePage} error={error}
            onQuery={onQuery}
          />
        )}

        {/* ── HEALTH PAGE ──────────────────────────────────────────────── */}
        {activePage === 'health' && (
          <HealthPage
            onQuery={onQuery}
            speak={speak}
          />
        )}

        {/* ── NUTRITION PAGE ───────────────────────────────────────────── */}
        {activePage === 'nutrition' && (
          <NutritionPage
            onQuery={onQuery}
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
            onQuery={onQuery}
          />
        )}

        {/* ── APPOINTMENTS PAGE ────────────────────────────────────────── */}
        {activePage === 'appointments' && (
          <AppointmentsPage onQuery={onQuery} />
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