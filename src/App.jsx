import React, { useState, useRef, useEffect, useCallback } from 'react'

// Layout
import Header          from './components/Header.jsx'
import HomePage        from './components/HomePage.jsx'
import ChromeWarning   from './components/ChromeWarning.jsx'

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

// Intent keywords and scoring
const intentKeywords = {
  doctor: ['doctor','dentist','clinic','hospital','nearby','near me','appointment with doctor','find doctor','physician'],
  drug: ['drug','interaction','medicine','pill','tablet','ibuprofen','paracetamol','aspirin'],
  bmi: ['bmi','body mass index','height','weight'],
  meal: ['meal plan','diet plan','diet','food plan','menu','meal','meals','vegetarian','non-vegetarian','vegan'],
  water: ['water','hydration','drink'],
  appointment: ['appointment','book','schedule visit','checkup'],
  reminder: ['remind','reminder','take at'],
  weather: ['weather','temperature','forecast'],
}
function detectIntentScore(text) {
  const t = text.toLowerCase()
  let best = { intent: null, score: 0 }
  Object.entries(intentKeywords).forEach(([intent, words]) => {
    const hits = words.reduce((c, w) => c + (t.includes(w) ? 1 : 0), 0)
    if (hits > best.score) best = { intent, score: hits }
  })
  const confidence = Math.min(1, best.score / 2) // 0, 0.5, 1 scale
  return { ...best, confidence }
}

// Symptom detector to bypass low-confidence clarification for complaints
const isSymptom = (text) => {
  const t = text.toLowerCase()
  const symptomWords = [
    'headache','migraine','fever','nausea','cough','cold','pain','dizzy','dizziness',
    'vomit','vomiting','sore throat','rash','fatigue','chills','congestion','stomachache',
    'cramp','body ache','throat pain','earache','toothache',
    // Heat / dehydration / exhaustion
    'heat exhaustion','heat stroke','heatstroke','overheat','overheated','hot','felt very hot',
    'dehydration','dehydrated','dry skin','sunburn','weak','weakness','lightheaded','light headed',
    // General unwell feelings
    "don't feel good",'dont feel good','not feeling well','not feeling good',
    'feel unwell','feel sick','feeling sick','unwell','sick','feel bad',
    // Fear / serious concern
    'scared','afraid','something is wrong','seriously wrong','worried something is wrong','panic','panicking',
    // Stress / anxiety
    'stress','stressed','anxiety','anxious','very stressed','very anxious','panic attack','overwhelmed','worried'
  ]
  return symptomWords.some(w => t.includes(w))
}

const isSettingReminder = t => {
  const l = t.toLowerCase()
  const hasIntent = /re?mi[nm]d/.test(l) || l.includes('set a reminder') || l.includes('add reminder') || l.includes('schedule')
  const hasTake = l.includes('take') || l.includes('tablet') || l.includes('medicine') || l.includes('pill') ||
                  l.includes('drug') || l.includes('vitamin') || l.includes('capsule') || l.includes('dose') ||
                  l.includes('aspirin') || l.includes('paracetamol') || l.includes('ibuprofen') || l.includes('insulin')
  const hasTime = /\d/.test(l) || ['morning','afternoon','evening','night','noon','am','pm','daily','everyday','tonight','today'].some(w => l.includes(w))
  return hasIntent && (hasTake || hasTime)
}
const isAskingReminders = t => {
  const l = t.toLowerCase()
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
  const [contextState,   setContextState]   = useState({ location:null, doctor:null, diet:null, med:null, lastIntent:null })
  const [lastEmotion,    setLastEmotion]    = useState(null)

  const chatEndRef = useRef(null)
  const startTime  = useRef(null)

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

  useEffect(() => { document.documentElement.classList.toggle('light', !darkMode) }, [darkMode])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, summary])

  const handleGroqResponse = useCallback((agentText) => {
    const latency = startTime.current ? Math.round(performance.now() - startTime.current) : null
    let finalText = agentText
    if (lastEmotion && ['stressed','sad','angry','anxious','worried'].includes(lastEmotion)) {
      finalText = `I'm here with you. ${agentText}`
    }
    setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:finalText, time:getTimeString(), latency }])
    setIsConnected(true)
    if (latency) setLatencies(prev => [...prev.slice(-9), latency])
    setApiCallCount(prev => prev + 1)
    speakRef.current?.(finalText, containsHindi(finalText) ? 'hi-IN' : languageRef.current)
  }, [lastEmotion])

  const { sendMessage, isLoading } = useGroq({ onResponse: handleGroqResponse })
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])

  const handleFinalTranscriptRef = useRef(null)
  const onQuery = useCallback((t) => { handleFinalTranscriptRef.current?.(t) }, [])

  const processingRef = useRef(new Set())

  const resetContext = () => setContextState({ location:null, doctor:null, diet:null, med:null, lastIntent:null })

  const handleFinalTranscript = useCallback(async (transcript) => {
    if (!transcript?.trim()) return
    if (processingRef.current.has(transcript)) return
    processingRef.current.add(transcript)
    const clearPending = () => processingRef.current.delete(transcript)

    const lang = languageRef.current
    if (containsHindi(transcript)) setLanguage('hi-IN')
    startTime.current = performance.now()
    const userMsg = { role:'user', content:transcript, time:getTimeString() }

    setActivePage('home')

    const t = transcript.toLowerCase()
    if (t.includes('reset context') || t.includes('clear context') || t.includes('forget context')) {
      resetContext()
      const reply = "Context cleared. I’ll treat the next request as new."
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang); clearPending(); return
    }

    const isChest  = t.includes('chest pain') || t.includes('heart attack') || t.includes('chest hurts')
    const isBreath = t.includes("can't breathe") || t.includes('cannot breathe') || t.includes('difficulty breathing') || t.includes('shortness of breath')
    const isMental = t.includes('suicide') || t.includes('kill myself') || t.includes('self harm') || t.includes('want to die')

    if (isChest || isBreath) {
      const reply = "⚠️ This sounds like a medical emergency. Please call 112 immediately or go to the nearest emergency room. Don't wait — call now."
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.('This sounds like a medical emergency. Please call 112 immediately.', lang)
      clearPending(); return
    }
    if (isMental) {
      const reply = "I hear you and I'm really concerned. Please call iCall right now at 9152987821. They want to support you. Are you safe right now?"
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.('Please call iCall at 9152987821 right now.', lang)
      clearPending(); return
    }

    if (t.includes('breathing exercise') || t.includes('4-7-8') || t.includes('breathe with me')) {
      setShowBreathing(true)
      const reply = "I’ve opened the breathing exercise. The 4-7-8 technique is great for stress — let's do it together."
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang)
      clearPending(); return
    }

    // --- Summary FIRST (before intent gate) ---
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

    // Intent confidence gate with symptom + meal-plan override
    const symptomDetected = isSymptom(transcript) || contextState.lastIntent === 'symptom'
    const mealPlanDetected = isMealPlanQuery(transcript)
    const { intent: guessedIntent, confidence } = detectIntentScore(transcript)
    const effectiveConfidence = (symptomDetected || mealPlanDetected) ? 1 : confidence

    // Doctor queries are allowed even if we were in symptom mode
    const doctorQueryAllowed =
      isDoctorQuery(transcript) &&
      /(find|near|nearby|search|locate|hospital|clinic|appointment|book|doctor)/i.test(t)

    if (!symptomDetected && !mealPlanDetected && (!guessedIntent || effectiveConfidence < 0.5) && !doctorQueryAllowed) {
      const reply = `I heard: “${transcript}”. Want me to: 
1) find a doctor, 
2) check a medicine interaction, 
3) create a meal plan, or 
4) log/check water?`
      setMessages(prev => [...prev, userMsg, {
        role:'assistant',
        content: reply,
        time: getTimeString(),
        options: ['Find a doctor','Check a medicine','Make a meal plan','Log water']
      }])
      speakRef.current?.('I want to be sure. Should I find a doctor, check a medicine, make a meal plan, or log water?', lang)
      clearPending(); return
    }

    if (isAskingReminders(transcript)) {
      const rems  = remindersRef.current
      const reply = rems.length === 0
        ? "You have no reminders yet. Say 'Remind me to take vitamin D at 8 AM' to add one."
        : `Your reminders: ${rems.map(r=>`${r.medication} at ${r.times.join(' and ')}`).join('. ')}.`
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang)
      clearPending(); return
    }

    if (isSettingReminder(transcript)) {
      const { medication, times } = parseReminderRef.current(transcript)
      await addReminderRef.current(medication, times)
      const reply = `Done! Reminder set to take ${medication} at ${times.join(' and ')}. I'll notify you on time.`
      setContextState(cs => ({ ...cs, med: medication, lastIntent:'reminder' }))
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:reply, time:getTimeString() }])
      speakRef.current?.(reply, lang)
      clearPending(); return
    }

    if (isAppointmentQuery(transcript)) {
      const data = bookAppointment(transcript)
      const text = buildAppointmentText(data)
      setContextState(cs => ({ ...cs, doctor:data.doctor || cs.doctor, location:data.location || cs.location, lastIntent:'appointment' }))
      setMessages(prev => [...prev, userMsg, { role:'assistant', content:text, appointmentCard:data, time:getTimeString() }])
      speakRef.current?.(text, lang)
      clearPending(); return
    }

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
      setContextState(cs => ({ ...cs, lastIntent:'water' }))
      clearPending(); return
    }

    if (isMealPlanQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      try {
        const plan = await generateMealPlan(transcript, import.meta.env.VITE_GROQ_API_KEY)
        const text = buildMealText(plan)
        setContextState(cs => ({ ...cs, diet: plan?.diet || cs.diet, lastIntent:'meal' }))
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, mealPlanCard:plan, time:getTimeString() }])
        speakRef.current?.(text, lang)
        setApiCallCount(prev => prev + 1)
      } catch (e) {
        const err = e.message === 'missing-key'
          ? "Meal planning needs the Groq API key. Please set VITE_GROQ_API_KEY in .env and restart."
          : "I couldn't generate a meal plan right now. Please try again."
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:err, time:getTimeString() }])
        speakRef.current?.(err, lang)
      }
      clearPending(); return
    }

    // Doctor finder (triage first, then map results with fallback)
    if (doctorQueryAllowed) {
      setMessages(prev => [...prev, userMsg]) // keep the user message

      const triage = "I'll check nearby doctors. If your headache comes with vision changes, stiff neck, fever, or weakness, please go to emergency immediately."
      setMessages(prev => [...prev, { role:'assistant', content:triage, time:getTimeString() }])
      speakRef.current?.(triage, lang)

      setMessages(prev => [...prev, { role:'loading', content:'', time:'' }])

      const cityMatch = transcript.match(/(?:in|near|at|around)\s+([A-Za-z\s]{3,25})(?:\s|$)/i)
      const mentionedCity = cityMatch ? cityMatch[1].trim() : null

      try {
        const data = await findNearbyDoctors(transcript)
        const text = buildDoctorText(data)
        setContextState(cs => ({ ...cs, location: data?.location || mentionedCity || cs.location, doctor: data?.results?.[0]?.name || cs.doctor, lastIntent:'doctor' }))
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, doctorCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang)
      } catch (err) {
        const fallbackCity = mentionedCity || 'Mumbai'
        try {
          const data = await findNearbyDoctors(transcript, fallbackCity)
          const text = `⚠️ Couldn't access your GPS, so here are doctors near ${fallbackCity}. ${buildDoctorText(data)}`
          setContextState(cs => ({ ...cs, location: fallbackCity, doctor: data?.results?.[0]?.name || cs.doctor, lastIntent:'doctor' }))
          setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, doctorCard:data, time:getTimeString() }])
          speakRef.current?.(text, lang)
          clearPending(); return
        } catch {
          const errMsg = "I couldn’t access your location. Say “hospitals in <your city>” or enable location and try again."
          setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:errMsg, time:getTimeString() }])
          speakRef.current?.(errMsg, lang)
          clearPending(); return
        }
      }
      clearPending(); return
    }

    if (isDrugQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      const data = await checkInteraction(transcript)
      if (data) {
        const text = buildInteractionText(data)
        setContextState(cs => ({ ...cs, med: data?.queryDrug || cs.med, lastIntent:'drug' }))
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, drugCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang)
        clearPending(); return
      }
      setMessages(prev => prev.filter(m=>m.role!=='loading'))
    }

    if (isBMIQuery(transcript)) {
      const data = calculateBMI(transcript)
      if (data) {
        const text = buildBMIText(data)
        setContextState(cs => ({ ...cs, lastIntent:'bmi' }))
        setMessages(prev => [...prev, userMsg, { role:'assistant', content:text, bmiCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang)
        clearPending(); return
      }
    }

    if (isNutritionQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      const data = await getNutritionRef.current(transcript)
      if (data) {
        const text = buildNutrRef.current(data)
        setContextState(cs => ({ ...cs, diet: data?.diet || cs.diet, lastIntent:'nutrition' }))
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, nutritionCard:data, time:getTimeString() }])
        setApiCallCount(prev => prev + 1)
        speakRef.current?.(text, lang)
        clearPending(); return
      }
      setMessages(prev => prev.filter(m=>m.role!=='loading'))
    }

    if (isWeatherQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
      const cityMatch = transcript.match(/(?:in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
      const city      = cityMatch ? cityMatch[1] : 'Mumbai'
      const data      = await getWeatherRef.current(city)
      if (data) {
        const text = buildWeatherRef.current(data)
        setContextState(cs => ({ ...cs, location: city || cs.location, lastIntent:'weather' }))
        setMessages(prev => [...prev.filter(m=>m.role!=='loading'), { role:'assistant', content:text, weatherCard:data, time:getTimeString() }])
        speakRef.current?.(text, lang)
        clearPending(); return
      }
      setMessages(prev => prev.filter(m=>m.role!=='loading'))
    }

    // Default: Groq (symptom follow-ups also come here)
    if (symptomDetected && contextState.lastIntent !== 'symptom') {
      setContextState(cs => ({ ...cs, lastIntent:'symptom' }))
    }

    setMessages(prev => [...prev, userMsg, { role:'loading', content:'', time:'' }])
    const history = messagesRef.current.filter(m=>m.role!=='loading').map(m=>({ role:m.role==='assistant'?'assistant':'user', content:m.content }))
    const detectedEmotion = await detectEmotionRef.current(transcript)
    if (detectedEmotion) {
      setLastEmotion(detectedEmotion)
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
      isMealPlanQuery, generateMealPlan, buildMealText, contextState.lastIntent])

  useEffect(() => { handleFinalTranscriptRef.current = handleFinalTranscript }, [handleFinalTranscript])

  const { isListening, interimText, startListening, stopListening, error } = useSpeech({
    onFinalTranscript: handleFinalTranscript, language,
  })

  const handleClearChat = () => {
    stop(); setSummary(null); setMoodHistory([]); resetContext(); setLastEmotion(null)
    setMessages([{ ...WELCOME, time:getTimeString(), content:"Chat cleared! How can I help you?" }])
  }

  const turnCount  = Math.max(0, messages.filter(m=>m.role!=='loading').length - 1)
  const avgLatency = latencies.length ? Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length) : null

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

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

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
            contextState={contextState}
            onResetContext={resetContext}
            lastEmotion={lastEmotion}
          />
        )}

        {activePage === 'health' && (
          <HealthPage onQuery={onQuery} speak={speak} />
        )}

        {activePage === 'nutrition' && (
          <NutritionPage
            onQuery={onQuery}
            waterTotal={waterTotal}
            waterPct={waterPct}
            waterLog={waterLog}
            goalMl={goalMl}
          />
        )}

        {activePage === 'medications' && (
          <MedicationsPage
            reminders={reminders}
            isMockMode={isMockMode}
            notifGranted={notifGranted}
            onRemove={removeReminder}
            onQuery={onQuery}
          />
        )}

        {activePage === 'appointments' && (
          <AppointmentsPage onQuery={onQuery} />
        )}

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