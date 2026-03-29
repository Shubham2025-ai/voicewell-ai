import React, { useState } from 'react'

const TYPE_ICONS = {
  hospital: '🏥', clinic: '🩺', doctors: '👨‍⚕️',
  pharmacy: '💊', dentist: '🦷', default: '🏥',
}

const TYPE_LABELS = {
  hospital: 'Hospital', clinic: 'Clinic', doctors: 'Doctor',
  pharmacy: 'Pharmacy', dentist: 'Dentist', default: 'Healthcare',
}

export default function DoctorFinderCard({ data }) {
  const [expanded, setExpanded] = useState(null)

  if (!data || data.count === 0) {
    return (
      <div style={{ padding: '12px 0' }}>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>
          No facilities found within 3km. Try these:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="https://www.practo.com" target="_blank" rel="noreferrer" style={linkBtn}>
            🔍 Practo
          </a>
          <a href={`https://www.google.com/maps/search/hospital+near+me`} target="_blank" rel="noreferrer" style={linkBtn}>
            🗺️ Google Maps
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minWidth: 240 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12, fontFamily: 'var(--font-display)',
      }}>
        <span style={{ fontSize: 18 }}>📍</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            {data.count} {data.specialty === 'default' ? 'Medical Facilit' : (TYPE_LABELS[data.specialty] || 'Medical Facilit')}{data.count === 1 ? 'y' : 'ies'} Nearby
          </div>
          <div style={{ fontSize: 10, opacity: 0.65, fontFamily: 'var(--font-mono)' }}>
            {data.cityName} · within 3km · OpenStreetMap
          </div>
        </div>
      </div>

      {/* Results list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {data.results.map((r, i) => (
          <div key={r.id}>
            <div
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                cursor: 'pointer',
                background: expanded === i ? 'rgba(0,232,122,0.12)' : 'rgba(0,232,122,0.05)',
                border: `1px solid ${expanded === i ? 'rgba(0,232,122,0.3)' : 'rgba(0,232,122,0.15)'}`,
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: expanded === i ? 'translateX(2px) scale(1.01)' : 'translateX(0) scale(1)',
                boxShadow: expanded === i ? '0 4px 12px rgba(0,232,122,0.15)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Rank */}
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: i === 0
                    ? 'linear-gradient(135deg, #00e87a, #00c264)'
                    : 'rgba(0,232,122,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: i === 0 ? '#000' : 'rgba(0,232,122,0.8)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: i === 0 ? '0 2px 8px rgba(0,232,122,0.3)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.95)',
                    truncate: true,
                  }}>
                    {TYPE_ICONS[r.type] || TYPE_ICONS.default} {r.name}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.55)',
                    marginTop: 1,
                  }}>
                    {TYPE_LABELS[r.type] || 'Healthcare'} · {r.distLabel}
                  </div>
                </div>
                <span style={{
                  fontSize: 10,
                  color: 'rgba(0,232,122,0.5)',
                  transition: 'transform 0.3s',
                  transform: expanded === i ? 'rotate(180deg)' : 'rotate(0)',
                }}>
                  ▼
                </span>
              </div>

              {/* Expanded details */}
              {expanded === i && (
                <div style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: '1px solid rgba(0,232,122,0.2)',
                  animation: 'float-up 0.3s ease-out',
                }}>
                  {r.address !== 'Address not available' && (
                    <div style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: 5,
                    }}>
                      📍 {r.address}
                    </div>
                  )}
                  {r.phone && (
                    <div style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: 5,
                    }}>
                      📞{' '}
                      <a
                        href={`tel:${r.phone}`}
                        style={{
                          color: 'var(--green)',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {r.phone}
                      </a>
                    </div>
                  )}
                  )}
                  {r.hours && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>
                      🕐 {r.hours}
                    </div>
                  )}
                  {/* Map links */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <a href={r.gmapsUrl} target="_blank" rel="noreferrer" style={{
                      padding: '4px 10px', borderRadius: 99, fontSize: 10,
                      background: 'var(--green)', color: '#000', fontWeight: 600,
                      textDecoration: 'none', fontFamily: 'var(--font-display)',
                    }}>
                      🗺️ Google Maps
                    </a>
                    <a href={r.mapUrl} target="_blank" rel="noreferrer" style={{
                      padding: '4px 10px', borderRadius: 99, fontSize: 10,
                      background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'none', fontFamily: 'var(--font-display)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                      OpenStreetMap
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View all on map button */}
      <a
        href={`https://www.google.com/maps/search/${data.specialty === 'default' ? 'hospital' : data.specialty}+near+me/@${data.userLat},${data.userLon},14z`}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '8px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
          background: 'linear-gradient(135deg, rgba(0,232,122,0.15), rgba(0,232,122,0.05))',
          border: '1px solid rgba(0,232,122,0.25)',
          color: 'rgba(0,232,122,0.9)',
          textDecoration: 'none',
          fontFamily: 'var(--font-display)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,232,122,0.25), rgba(0,232,122,0.1))'
          e.currentTarget.style.borderColor = 'rgba(0,232,122,0.4)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,232,122,0.2)'
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,232,122,0.15), rgba(0,232,122,0.05))'
          e.currentTarget.style.borderColor = 'rgba(0,232,122,0.25)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
        }}
      >
        🗺️ View all on Google Maps
      </a>

      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
        Data: OpenStreetMap contributors · Verify before visiting
      </div>
    </div>
  )
}

const linkBtn = {
  padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
  textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)',
  fontFamily: 'var(--font-display)',
}