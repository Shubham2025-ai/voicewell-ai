/**
 * Returns the current time as a formatted string e.g. "10:42 AM"
 */
export function getTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Detects if text contains Hindi (Devanagari) characters.
 * Unicode range U+0900–U+097F
 */
export function containsHindi(text) {
  return /[\u0900-\u097F]/.test(text)
}

/**
 * Returns the appropriate SpeechRecognition language code
 * based on current language setting.
 */
export function getLangCode(language) {
  return language === 'hi-IN' ? 'hi-IN' : 'en-US'
}
