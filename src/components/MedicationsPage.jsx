import React, { useState } from 'react'

export default function MedicationsPage({ reminders, isMockMode, notifGranted, onRemove, onQuery }) {
  const [input, setInput] = useState('')

  const QUICK_REMINDERS = [
    'Remind me to take vitamin D at 8 AM',
    'Remind me to take metformin at 8 AM and 8 PM',
    'Remind me to take aspirin at 9 AM every day',
    'Remind me to take omeprazole at 7 AM before breakfast',
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    onQuery(input.trim())
    setInput('')
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'1.25rem' }}>
      {/* Hero */}
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--text-1)', marginBottom:4 }}>
          Medications
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ fontSize:13, color:'var(--text-3)' }}>
            {isMockMode ? '📦 Local storage mode' : '🔥 Firebase synced'}
          </div>
          {!notifGranted && (
            <div style={{ fontSize:11, color:'var(--amber)', padding:'2px 8px', borderRadius:99, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)' }}>
              ⚠️ Enable notifications for alerts
            </div>
          )}
        </div>
      </div>

      {/* Add reminder input */}
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontFamily:'var(--font-mono)' }}>
          Add new reminder
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', gap:8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. Remind me to take aspirin at 8 AM"
            style={{
              flex:1, padding:'10px 14px', borderRadius:10,
              border:'1px solid var(--border)', background:'var(--surface-2)',
              color:'var(--text-1)', fontSize:13, fontFamily:'var(--font-body)', outline:'none',
            }}
            onFocus={e => e.target.style.borderColor='var(--green)'}
            onBlur={e  => e.target.style.borderColor='var(--border)'}
          />
          <button type="submit" style={{
            padding:'10px 16px', borderRadius:10, border:'none',
            background:'var(--green)', color:'#000',
            fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)',
          }}>Add</button>
        </form>
      </div>

      {/* Active reminders */}
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontFamily:'var(--font-mono)' }}>
          Active reminders ({reminders.length})
        </div>
        {reminders.length === 0 ? (
          <div style={{
            padding:'24px', borderRadius:12, textAlign:'center',
            background:'var(--surface-2)', border:'1px solid var(--border)',
          }}>
            <div style={{ fontSize:32, marginBottom:8 }}>💊</div>
            <div style={{ fontSize:13, color:'var(--text-3)' }}>No reminders yet</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>Add one above or use the Voice tab</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {reminders.map(r => (
              <div key={r.id} style={{
                padding:'12px 14px', borderRadius:12,
                background:'var(--surface)', border:'1px solid var(--border)',
                display:'flex', alignItems:'center', gap:10,
              }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background:'rgba(0,194,122,0.12)', border:'1px solid rgba(0,194,122,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                }}>💊</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:'var(--text-1)', textTransform:'capitalize', marginBottom:4 }}>
                    {r.medication}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {r.times.map((t, i) => (
                      <span key={i} style={{
                        fontSize:10, padding:'2px 8px', borderRadius:99,
                        background:'var(--green-dim)', color:'var(--green)',
                        fontFamily:'var(--font-mono)',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => onRemove(r.id)} style={{
                  padding:'5px 10px', borderRadius:8,
                  border:'1px solid rgba(239,68,68,0.2)',
                  background:'rgba(239,68,68,0.08)', color:'#ef4444',
                  fontSize:11, cursor:'pointer', fontFamily:'var(--font-body)',
                }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick add suggestions */}
      <div>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontFamily:'var(--font-mono)' }}>
          Quick add
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {QUICK_REMINDERS.map((q, i) => (
            <button key={i} onClick={() => onQuery(q)} style={{
              padding:'9px 12px', borderRadius:10, border:'1px solid var(--border)',
              background:'var(--surface-2)', cursor:'pointer', textAlign:'left',
              fontSize:12, color:'var(--text-2)', fontFamily:'var(--font-body)', transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.color='var(--text-1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)' }}
            >
              💊 {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}