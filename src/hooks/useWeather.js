import { useCallback } from 'react'

/**
 * useWeather — fetches weather + AQI from OpenWeatherMap.
 * Provides health-relevant context: allergy risk, air quality, UV tips.
 *
 * Get free key: openweathermap.org/api → free tier (1000 calls/day)
 * Add to .env: VITE_OPENWEATHER_KEY=your_key_here
 *
 * Without key: returns mock data so demo still works.
 */

const AQI_LABELS = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']
const AQI_TIPS   = [
  '',
  'Air quality is great today — perfect for outdoor exercise!',
  'Air quality is fair. Sensitive individuals may want to limit prolonged outdoor activity.',
  'Moderate air quality. If you have asthma or allergies, keep your inhaler handy.',
  'Poor air quality. Avoid outdoor exercise, especially if you have respiratory issues.',
  'Very poor air quality. Stay indoors, wear a mask if you must go out.',
]

// Weather keywords that trigger a weather query
const WEATHER_KEYWORDS = [
  'weather', 'temperature', 'aqi', 'air quality', 'pollution', 'allerg',
  'pollen', 'humidity', 'forecast', 'outside', 'outdoor', 'breathe',
  'मौसम', 'हवा', 'प्रदूषण',
]

export function useWeather() {

  const isWeatherQuery = useCallback((text) => {
    const t = text.toLowerCase()
    return WEATHER_KEYWORDS.some(k => t.includes(k))
  }, [])

  const getWeather = useCallback(async (city = 'Mumbai') => {
    const key = import.meta.env.VITE_OPENWEATHER_KEY

    // Mock data if no API key — demo still works perfectly
    if (!key) {
      return getMockWeather(city)
    }

    try {
      // Step 1: Current weather
      const wRes  = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`
      )
      if (!wRes.ok) return getMockWeather(city)
      const w = await wRes.json()

      // Step 2: Air quality (using coordinates from weather response)
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
    } catch {
      return getMockWeather(city)
    }
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