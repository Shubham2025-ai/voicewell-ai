import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * useTTS — improved Text-to-Speech with:
 * - Smart voice selection (prefers natural/neural voices)
 * - Less robotic: tuned pitch, rate, volume
 * - Chunked speaking for long responses (avoids Chrome TTS cutoff bug)
 * - stop() and isSpeaking state
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking]   = useState(false)
  const [voices, setVoices]           = useState([])
  const stopRequestedRef              = useRef(false)

  // Load available voices (they load async in Chrome)
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || [])
    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
  }, [])

  /**
   * Pick the best available voice for the given language.
   * Priority: neural/natural English voices > any local voice > fallback
   */
  const pickVoice = useCallback((lang = 'en-US') => {
    const langPrefix = lang.split('-')[0]   // 'en' or 'hi'

    // Preferred natural-sounding voice names (Chrome on Windows/Mac/Linux)
    const preferred = [
      'Google UK English Female',
      'Google US English',
      'Microsoft Zira',
      'Microsoft David',
      'Samantha',
      'Karen',
      'Moira',
    ]

    if (lang.startsWith('hi')) {
      const hiVoice = voices.find(v => v.lang.startsWith('hi'))
      if (hiVoice) return hiVoice
    }

    // Try preferred list first
    for (const name of preferred) {
      const v = voices.find(v => v.name.includes(name))
      if (v) return v
    }

    // Fallback: any local voice matching language
    return (
      voices.find(v => v.lang.startsWith(langPrefix) && v.localService) ||
      voices.find(v => v.lang.startsWith(langPrefix)) ||
      voices[0] ||
      null
    )
  }, [voices])

  /**
   * speak(text, lang)
   * Splits long text into sentence chunks to avoid Chrome's ~200-char TTS cutoff bug.
   */
  const speak = useCallback((text, lang = 'en-US') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    stopRequestedRef.current = false

    // Split on sentence boundaries
    const chunks = text.match(/[^.!?]+[.!?]*/g) || [text]
    let idx = 0

    const speakChunk = () => {
      if (idx >= chunks.length || stopRequestedRef.current) {
        setIsSpeaking(false)
        return
      }

      const chunk = chunks[idx].trim()
      if (!chunk) { idx++; speakChunk(); return }

      const utterance    = new SpeechSynthesisUtterance(chunk)
      utterance.lang     = lang
      utterance.pitch    = lang.startsWith('hi') ? 1.1 : 1.05
      utterance.rate     = lang.startsWith('hi') ? 0.88 : 0.91   // slightly slower = less robotic
      utterance.volume   = 1.0

      const voice = pickVoice(lang)
      if (voice) utterance.voice = voice

      if (idx === 0) {
        utterance.onstart = () => setIsSpeaking(true)
      }
      utterance.onend = () => {
        idx++
        speakChunk()
      }
      utterance.onerror = () => {
        idx++
        speakChunk()
      }

      window.speechSynthesis.speak(utterance)
    }

    speakChunk()
  }, [pickVoice])

  const stop = useCallback(() => {
    stopRequestedRef.current = true
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  return { speak, stop, isSpeaking }
}