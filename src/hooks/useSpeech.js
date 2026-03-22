import { useState, useRef, useCallback } from 'react'

/**
 * useSpeech — wraps the Web Speech API (SpeechRecognition)
 *
 * Returns:
 *   isListening      — bool: mic is active
 *   interimText      — string: live partial transcript (shown in real-time)
 *   startListening   — fn: begin capture
 *   stopListening    — fn: stop capture
 *   error            — string | null: e.g. "mic-denied"
 *
 * NOTE: Only works in Chrome / Chromium-based browsers.
 */
export function useSpeech({ onFinalTranscript, language = 'en-US' }) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText]   = useState('')
  const [error, setError]               = useState(null)
  const recognitionRef = useRef(null)

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('not-supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous      = false   // single utterance per press
    recognition.interimResults  = true    // show partial results live
    recognition.lang            = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setInterimText('')
      setError(null)
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final   = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }
      setInterimText(interim)
      if (final.trim()) {
        setInterimText('')
        onFinalTranscript(final.trim())
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') setError('mic-denied')
      else if (event.error === 'no-speech') setError('no-speech')
      else setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText('')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [language, onFinalTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }, [])

  return { isListening, interimText, startListening, stopListening, error }
}
