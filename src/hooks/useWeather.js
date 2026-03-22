import { useCallback } from 'react'

const AQI_LABELS = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']
const AQI_TIPS   = [
  '',
  'Air quality is great today — perfect for outdoor exercise!',
  'Air quality is fair. Sensitive individuals may want to limit prolonged outdoor activity.',
  'Moderate air quality. If you have asthma or allergies, keep your inhaler handy.',
  'Poor air quality. Avoid outdoor exercise, especially if you have respiratory issues.',
  'Very poor air quality. Stay indoors, wear a mask if you must go out.',
]

// Only trigger on explicit weather intent words
const WEATHER_KEYWORDS = [
  'weather', 'temperature', 'aqi', 'air quality', 'air pollution',
  'pollen', 'humidity', 'forecast', 'मौसम', 'हवा', 'प्रदूषण',
]

// Medical/emergency words that must NEVER trigger weather — ever
const MEDICAL_OVERRIDE = [
  'chest pain', 'chest hurts', 'heart attack',
  "can't breathe", 'cannot breathe', 'cant breathe',
  'difficulty breathing', 'shortness of breath', 'short of breath',
  'stroke', 'unconscious', 'suicide', 'self harm', 'overdose',
  'seizure', 'choking', 'bleeding', 'breathe',
  'pain', 'hurt', 'ache', 'fever', 'sick', 'ill',
  'vomit', 'nausea', 'dizzy', 'faint', 'swollen',
  'headache', 'migraine', 'rash', 'allerg', 'infection',
  'symptom', 'doctor', 'hospital', 'medicine', 'medication',
]

export function useWeather() {

  const isWeatherQuery = useCallback((text) => {
    const t = text.toLowerCase()
    // Medical query always takes priority — never send to weather
    if (MEDICAL_OVERRIDE.some(w => t.includes(w))) return false
    return WEATHER_KEYWORDS.some(k => t.includes(k))
  }, [])

  const getWeather = useCallback(async (city = 'Mumbai') => {
    const key = import.meta.env.VITE_OPENWEATHER_KEY
    if (!key) return getMockWeather(city)
    try {
      const wRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`
      )
      if (!wRes.ok) return getMockWeather(city)
      const w = await wRes.json()
      const { lat, lon } = w.coord
      const aRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
      )
      const a   = aRes.ok ? await aRes.json() : null
      const aqi = a?.list?.[0]?.main?.aqi || 1
      return {
        city:        w.name,
        temp:        Math.round(w.main.temp),
        feelsLike:   Math.round(w.main.feels_like),
        humidity:    w.main.humidity,
        description: w.weather[0].description,
        icon:        w.weather[0].main,
        aqi,
        aqiLabel:    AQI_LABELS[aqi] || 'Unknown',
        tip:         AQI_TIPS[aqi]   || '',
      }
    } catch { return getMockWeather(city) }
  }, [])

  const buildWeatherText = useCallback((data) => {
    if (!data) return null
    return `In ${data.city}, it's ${data.temp}°C with ${data.description}. Air quality is ${data.aqiLabel}. ${data.tip}`
  }, [])

  return { isWeatherQuery, getWeather, buildWeatherText }
}

function getMockWeather(city) {
  return {
    city:        city || 'Mumbai',
    temp:        28,
    feelsLike:   31,
    humidity:    72,
    description: 'partly cloudy',
    icon:        'Clouds',
    aqi:         2,
    aqiLabel:    'Fair',
    tip:         'Air quality is fair. Sensitive individuals may want to limit prolonged outdoor activity.',
    isMock:      true,
  }
}