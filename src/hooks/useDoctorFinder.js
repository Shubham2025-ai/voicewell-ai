import { useCallback } from 'react'

/**
 * useDoctorFinder — finds nearby doctors/hospitals using:
 * - Browser Geolocation API (user's real location)
 * - Overpass API (OpenStreetMap) — free, no key, no billing
 * - Nominatim for reverse geocoding city name
 *
 * Detects queries like:
 * "Find a doctor near me"
 * "Nearest hospital"
 * "Cardiologist near me"
 * "Where is the nearest clinic?"
 */

const DOCTOR_KEYWORDS = [
  'doctor', 'hospital', 'clinic', 'physician', 'specialist',
  'cardiologist', 'dermatologist', 'neurologist', 'dentist',
  'pharmacy', 'medical', 'healthcare', 'near me', 'nearest',
  'find a', 'where is', 'emergency room', 'er near',
  'डॉक्टर', 'अस्पताल', 'क्लिनिक',
]

// Specialty → OSM tags mapping
const SPECIALTY_TAGS = {
  hospital:      'amenity=hospital',
  clinic:        'amenity=clinic',
  doctor:        'amenity=doctors',
  pharmacy:      'amenity=pharmacy',
  dentist:       'amenity=dentist',
  cardiologist:  'amenity=doctors',
  dermatologist: 'amenity=doctors',
  neurologist:   'amenity=doctors',
  default:       'amenity=hospital|amenity=clinic|amenity=doctors',
}

function detectSpecialty(text) {
  const t = text.toLowerCase()
  if (t.includes('hospital') || t.includes('emergency') || t.includes('er ')) return 'hospital'
  if (t.includes('pharmacy') || t.includes('medicine shop'))  return 'pharmacy'
  if (t.includes('dentist') || t.includes('dental'))          return 'dentist'
  if (t.includes('cardiologist') || t.includes('heart'))      return 'cardiologist'
  if (t.includes('dermatologist') || t.includes('skin'))      return 'dermatologist'
  if (t.includes('neurologist') || t.includes('neuro'))       return 'neurologist'
  if (t.includes('clinic'))                                    return 'clinic'
  return 'default'
}

function buildOverpassQuery(lat, lon, radius, specialty) {
  const tag = SPECIALTY_TAGS[specialty] || SPECIALTY_TAGS.default
  const tags = tag.split('|').map(t => {
    const [k, v] = t.split('=')
    return `node["${k}"="${v}"](around:${radius},${lat},${lon});
way["${k}"="${v}"](around:${radius},${lat},${lon});`
  }).join('\n')

  return `[out:json][timeout:10];
(
${tags}
);
out center 8;`
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R    = 6371000 // metres
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a    = Math.sin(dLat/2) ** 2 +
               Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
               Math.sin(dLon/2) ** 2
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(dist)
}

function formatDistance(metres) {
  if (metres < 1000) return `${metres}m away`
  return `${(metres / 1000).toFixed(1)}km away`
}

export function useDoctorFinder() {

  const isDoctorQuery = useCallback((text) => {
    const t = text.toLowerCase()
    return DOCTOR_KEYWORDS.some(k => t.includes(k))
  }, [])

  const findNearbyDoctors = useCallback(async (transcript) => {
    // Step 1: Get user location
    const position = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('not-supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, (err) => {
        if (err.code === 1) reject(new Error('denied'))
        else if (err.code === 2) reject(new Error('unavailable'))
        else reject(new Error('timeout'))
      }, {
        timeout: 15000,
        maximumAge: 300000,
        enableHighAccuracy: false,
      })
    })

    const { latitude: lat, longitude: lon } = position.coords
    const specialty = detectSpecialty(transcript)

    // Step 2: Reverse geocode to get city name
    let cityName = 'your area'
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const geoData = await geoRes.json()
      cityName = geoData.address?.city ||
                 geoData.address?.town ||
                 geoData.address?.suburb ||
                 geoData.address?.county ||
                 'your area'
    } catch { /* use default */ }

    // Step 3: Query Overpass API
    const query  = buildOverpassQuery(lat, lon, 3000, specialty)
    const ovRes  = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (!ovRes.ok) throw new Error('Overpass API failed')
    const ovData = await ovRes.json()

    // Step 4: Process results
    const elements = ovData.elements || []
    const results  = elements
      .map(el => {
        const elLat = el.lat || el.center?.lat
        const elLon = el.lon || el.center?.lon
        if (!elLat || !elLon) return null

        const dist = calculateDistance(lat, lon, elLat, elLon)
        const tags = el.tags || {}
        const name = tags.name || tags['name:en'] || 'Medical facility'

        return {
          id:       el.id,
          name,
          type:     tags.amenity || 'healthcare',
          address:  [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
                      .filter(Boolean).join(', ') || 'Address not available',
          phone:    tags.phone || tags['contact:phone'] || null,
          website:  tags.website || tags['contact:website'] || null,
          hours:    tags.opening_hours || null,
          lat:      elLat,
          lon:      elLon,
          dist,
          distLabel: formatDistance(dist),
          mapUrl:   `https://www.openstreetmap.org/?mlat=${elLat}&mlon=${elLon}&zoom=17`,
          gmapsUrl: `https://www.google.com/maps/search/?api=1&query=${elLat},${elLon}`,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)

    return {
      results,
      specialty,
      cityName,
      userLat: lat,
      userLon: lon,
      count:   results.length,
    }

  }, [])

  const buildDoctorText = useCallback((data) => {
    if (!data) return null
    if (data.count === 0) {
      return `I couldn't find any ${data.specialty === 'default' ? 'doctors or clinics' : data.specialty + 's'} within 3km of your location. Try searching on Google Maps or Practo for more options.`
    }
    const top = data.results[0]
    return `I found ${data.count} medical facilit${data.count === 1 ? 'y' : 'ies'} near you in ${data.cityName}. The closest is ${top.name}, ${top.distLabel}. I've shown all ${data.count} on the map below.`
  }, [])

  return { isDoctorQuery, findNearbyDoctors, buildDoctorText }
}