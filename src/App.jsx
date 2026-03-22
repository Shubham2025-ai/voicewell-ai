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
  content: "Hi! I'm VoiceWell, your AI health companion. I can help with symptoms, stress, medication reminders, nutrition, and more. Tap the mic and tell me how you're feeling today!",
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
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `Summarize this health conversation. Return ONLY valid JSON, no markdown, no backticks:
{"overview":"2-sentence summary","topics":["topic1","topic2"],"tips":["tip1","tip2","tip3"]}`
          },
          {
            role: 'user',
            content: `Conversation:\n${history.filter(m=>m.role!=='loading').map(m=>`${m.role==='user'?'User':'VoiceWell'}: ${m.content}`).join('\n')}`
          }
        ]
      })
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content?.trim()
    return JSON.parse(text)
  } catch { return null }
}

export default function App() {
  const [messages,       setMessages]       = useState([WELCOME])
  const [language,       setLanguage]       = useState('en-US')
  const [darkMode,       setDarkMode]       = useState(false)
  const [showReminders,  setShowReminders]  = useState(false)
  const [summary,        setSummary]        = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  const chatEndRef    = useRef(null)
  const startTimeRef  = useRef(null)

  // ── Keep live refs so useSpeech never gets a stale closure ────────────────
  const messagesRef   = useRef(messages)
  const languageRef   = useRef(language)
  const remindersRef  = useRef([])
  useEffect(() => { messagesRef.current  = messages  }, [messages])
  useEffect(() => { languageRef.current  = language  }, [language])

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { speak, stop, isSpeaking }               = useTTS()
  const { emotion, loading: emotionLoading,
          detectEmotion }                         = useEmotion()
  const { reminders, isMockMode, notifGranted,
          addReminder, removeReminder,
          parseReminderText }                     = useReminders()
  const { isNutritionQuery, getNutrition,
          buildNutritionText }                    = useNutrition()
  const { isWeatherQuery, getWeather,
          buildWeatherText }                      = useWeather()

  useEffect(() => { remindersRef.current = reminders }, [reminders])

  // ── Dark mode ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, summary])

  // ── Welcome TTS ───────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => speak(WELCOME.content, 'en-US'), 900)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  // ── Groq response handler ─────────────────────────────────────────────────
  const handleGroqResponse = useCallback((agentText) => {
    const latency = startTimeRef.current
      ? Math.round(performance.now() - startTimeRef.current) : null
    setMessages(prev => {
      const filtered = prev.filter(m => m.role !== 'loading')
      return [...filtered, { role: 'assistant', content: agentText, time: getTimeString(), latency }]
    })
    speak(agentText, containsHindi(agentText) ? 'hi-IN' : languageRef.current)
  }, [speak])

  const { sendMessage, isLoading } = useGroq({ onResponse: handleGroqResponse })

  // ── sendMessage ref — always latest ──────────────────────────────────────
  const sendMessageRef     = useRef(sendMessage)
  const detectEmotionRef   = useRef(detectEmotion)
  const addReminderRef     = useRef(addReminder)
  const parseReminderRef   = useRef(parseReminderText)
  const getNutritionRef    = useRef(getNutrition)
  const buildNutritionRef  = useRef(buildNutritionText)
  const getWeatherRef      = useRef(getWeather)
  const buildWeatherRef    = useRef(buildWeatherText)
  const speakRef           = useRef(speak)
  const setSummaryRef      = useRef(setSummary)
  const setLoadingRef      = useRef(setLoadingSummary)

  useEffect(() => { sendMessageRef.current    = sendMessage    }, [sendMessage])
  useEffect(() => { detectEmotionRef.current  = detectEmotion  }, [detectEmotion])
  useEffect(() => { addReminderRef.current    = addReminder    }, [addReminder])
  useEffect(() => { parseReminderRef.current  = parseReminderText }, [parseReminderText])
  useEffect(() => { getNutritionRef.current   = getNutrition   }, [getNutrition])
  useEffect(() => { buildNutritionRef.current = buildNutritionText }, [buildNutritionText])
  useEffect(() => { getWeatherRef.current     = getWeather     }, [getWeather])
  useEffect(() => { buildWeatherRef.current   = buildWeatherText }, [buildWeatherText])
  useEffect(() => { speakRef.current          = speak          }, [speak])

  // ── Final transcript — stable ref, reads live state via refs ──────────────
  const handleFinalTranscript = useCallback(async (transcript) => {
    if (!transcript?.trim()) return

    const lang = languageRef.current
    if (containsHindi(transcript)) setLanguage('hi-IN')
    startTimeRef.current = performance.now()

    const userMsg = { role: 'user', content: transcript, time: getTimeString() }

    // ── Session summary ────────────────────────────────────────────────────
    if (isAskingSummary(transcript)) {
      setMessages(prev => [...prev, userMsg])
      setLoadingRef.current(true)
      const s = await generateSummary(messagesRef.current, import.meta.env.VITE_GROQ_API_KEY)
      setLoadingRef.current(false)
      if (s) {
        setSummaryRef.current(s)
        speakRef.current(`Here's your session summary. ${s.overview}`, lang)
      } else {
        const fb = "We need a bit more conversation before I can summarise. Keep chatting!"
        setMessages(prev => [...prev, { role: 'assistant', content: fb, time: getTimeString() }])
        speakRef.current(fb, lang)
      }
      return
    }

    // ── Reminder: list ─────────────────────────────────────────────────────
    if (isAskingReminders(transcript)) {
      const rems  = remindersRef.current
      const reply = rems.length === 0
        ? "You have no reminders set yet. Say something like 'Remind me to take vitamin D at 8 AM'."
        : `Your reminders: ${rems.map(r => `${r.medication} at ${r.times.join(' and ')}`).join('. ')}.`
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: reply, time: getTimeString() }])
      speakRef.current(reply, lang)
      return
    }

    // ── Reminder: set ──────────────────────────────────────────────────────
    if (isSettingReminder(transcript)) {
      const { medication, times } = parseReminderRef.current(transcript)
      await addReminderRef.current(medication, times)
      const reply = `Done! Reminder set to take ${medication} at ${times.join(' and ')}. I'll notify you on time.`
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: reply, time: getTimeString() }])
      speakRef.current(reply, lang)
      return
    }

    // ── Nutrition ──────────────────────────────────────────────────────────
    if (isNutritionQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role: 'loading', content: '', time: '' }])
      const data = await getNutritionRef.current(transcript)
      if (data) {
        const text = buildNutritionRef.current(data)
        setMessages(prev => [
          ...prev.filter(m => m.role !== 'loading'),
          { role: 'assistant', content: text, nutritionCard: data, time: getTimeString() }
        ])
        speakRef.current(text, lang)
        return
      }
      setMessages(prev => prev.filter(m => m.role !== 'loading'))
    }

    // ── Weather ────────────────────────────────────────────────────────────
    if (isWeatherQuery(transcript)) {
      setMessages(prev => [...prev, userMsg, { role: 'loading', content: '', time: '' }])
      const cityMatch = transcript.match(/(?:in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
      const city      = cityMatch ? cityMatch[1] : 'Mumbai'
      const data      = await getWeatherRef.current(city)
      if (data) {
        const text = buildWeatherRef.current(data)
        setMessages(prev => [
          ...prev.filter(m => m.role !== 'loading'),
          { role: 'assistant', content: text, weatherCard: data, time: getTimeString() }
        ])
        speakRef.current(text, lang)
        return
      }
      setMessages(prev => prev.filter(m => m.role !== 'loading'))
    }

    // ── Default: Groq ──────────────────────────────────────────────────────
    setMessages(prev => [...prev, userMsg, { role: 'loading', content: '', time: '' }])

    const history = messagesRef.current
      .filter(m => m.role !== 'loading')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))

    const detectedEmotion = await detectEmotionRef.current(transcript)
    const emotionPrompt   = EMOTION_META[detectedEmotion]?.prompt || ''
    sendMessageRef.current(transcript, history, emotionPrompt)

  }, [isNutritionQuery, isWeatherQuery]) // minimal deps — everything else via refs

  // ── Speech recognition ────────────────────────────────────────────────────
  const { isListening, interimText, startListening, stopListening, error } = useSpeech({
    onFinalTranscript: handleFinalTranscript,
    language,
  })

  const turnCount = Math.max(0, messages.filter(m => m.role !== 'loading').length - 1)

  const handleClearChat = () => {
    stop(); setSummary(null)
    setMessages([{ ...WELCOME, time: getTimeString(), content: "Chat cleared! How can I help you?" }])
  }

  return (
    <div className="flex flex-col h-screen relative" style={{ background: 'var(--bg-primary)' }}>

      <Header
        language={language}           onLanguageToggle={() => setLanguage(l => l === 'en-US' ? 'hi-IN' : 'en-US')}
        darkMode={darkMode}           onDarkToggle={() => setDarkMode(d => !d)}
        onClearChat={handleClearChat} onSummary={() => handleFinalTranscript('Give me a session summary')}
        emotion={emotion}             emotionLoading={emotionLoading}
        reminderCount={reminders.length}
        onRemindersToggle={() => setShowReminders(s => !s)}
      />

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 chat-scroll" style={{ background: 'var(--bg-primary)' }}>

        {turnCount > 0 && (
          <div className="flex justify-center mb-4">
            <ContextPill turnCount={Math.min(turnCount, 8)} />
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === 'loading'
            ? <TypingIndicator key={idx} />
            : <ChatBubble key={idx} message={msg} />
        )}

        {loadingSummary && (
          <div className="flex justify-center py-4">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ✨ Generating your session summary…
            </div>
          </div>
        )}

        {summary && (
          <SessionSummary
            summary={summary}
            onClose={() => setSummary(null)}
            onSpeak={(text) => speak(text, language)}
          />
        )}

        {interimText && (
          <div className="flex justify-end mb-2">
            <div
              className="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm italic bubble-user"
              style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}
            >
              {interimText}…
            </div>
          </div>
        )}

        {emotion && !emotionLoading && (
          <div className="flex justify-center mt-1 mb-2 sm:hidden">
            <div
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: EMOTION_META[emotion]?.bg, color: EMOTION_META[emotion]?.color }}
            >
              {EMOTION_META[emotion]?.emoji} {EMOTION_META[emotion]?.label}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom bar */}
      <div className="bottom-bar px-4 pt-3 pb-5 flex-shrink-0">
        <Waveform isActive={isSpeaking} />
        <div className="flex justify-center mt-2">
          <MicButton
            isListening={isListening} isSpeaking={isSpeaking}
            onClick={() => isListening ? stopListening() : startListening()}
            onStop={stop} error={error}
          />
        </div>
        <TextFallback
          onSubmit={handleFinalTranscript}
          disabled={isListening || isSpeaking || isLoading}
        />
        <p className="text-center mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          Chrome only · No audio stored · Privacy first
        </p>
      </div>

      {showReminders && (
        <div className="panel-enter" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, pointerEvents: 'all' }}>
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

function TextFallback({ onSubmit, disabled }) {
  const [value, setValue] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    setValue('')
  }
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        type="text" value={value}
        onChange={e => setValue(e.target.value)}
        disabled={disabled}
        placeholder="Or type your message…"
        className="flex-1 px-3.5 py-2 text-sm rounded-full outline-none transition-all"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />
      <button
        type="submit" disabled={disabled || !value.trim()}
        className="px-4 py-2 text-sm rounded-full font-medium text-white transition-all disabled:opacity-40 active:scale-95"
        style={{ background: 'var(--teal)' }}
      >
        Send
      </button>
    </form>
  )
}