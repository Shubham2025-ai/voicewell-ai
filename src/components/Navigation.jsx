import React from 'react'

export const PAGES = [
  { id: 'home',         icon: '🎙️', label: 'Voice'       },
  { id: 'health',       icon: '🩺', label: 'Health'      },
  { id: 'nutrition',    icon: '🍽️', label: 'Nutrition'   },
  { id: 'medications',  icon: '💊', label: 'Medications' },
  { id: 'appointments', icon: '📅', label: 'Appointments'},
  { id: 'dashboard',    icon: '📊', label: 'Dashboard'   },
]

export default function Navigation({ activePage, onNavigate, reminderCount }) {
  return (
    <nav style={{
      display: 'flex',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      flexShrink: 0,
      zIndex: 20,
    }}>
      {PAGES.map(page => {
        const isActive = activePage === page.id
        return (
          <button
            key={page.id}
            onClick={() => onNavigate(page.id)}
            style={{
              flex: 1, padding: '8px 4px 10px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              border: 'none', background: 'none', cursor: 'pointer',
              position: 'relative', transition: 'all 0.15s',
              borderTop: `2px solid ${isActive ? 'var(--green)' : 'transparent'}`,
            }}
          >
            <span style={{
              fontSize: 18,
              filter: isActive ? 'none' : 'grayscale(0.4)',
              opacity: isActive ? 1 : 0.5,
              transition: 'all 0.15s',
            }}>
              {page.icon}
            </span>
            <span style={{
              fontSize: 9, fontWeight: isActive ? 700 : 400,
              fontFamily: 'var(--font-mono)',
              color: isActive ? 'var(--green)' : 'var(--text-3)',
              transition: 'all 0.15s',
              letterSpacing: '0.03em',
            }}>
              {page.label}
            </span>
            {/* Badge for medications */}
            {page.id === 'medications' && reminderCount > 0 && (
              <div style={{
                position: 'absolute', top: 4, right: '50%',
                transform: 'translateX(8px)',
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--red)', color: '#fff',
                fontSize: 8, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--surface)',
              }}>
                {reminderCount > 9 ? '9+' : reminderCount}
              </div>
            )}
          </button>
        )
      })}
    </nav>
  )
}