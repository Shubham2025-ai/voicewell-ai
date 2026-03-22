import React, { useState } from 'react'
import { PageShell, PageHero, SectionLabel } from './PageShell.jsx'

const QUICK_MEDS = [
  'Remind me to take vitamin D at 8 AM',
  'Remind me to take metformin at 8 AM and 8 PM',
  'Remind me to take aspirin at 9 AM every day',
  'Remind me to take omeprazole at 7 AM before breakfast',
]

export default function MedicationsPage({ reminders, isMockMode, notifGranted, onRemove, onQuery }) {
  const [input, setInput] = useState('')

  return (
    <PageShell>
      <PageHero icon="💊" title="Medications" subtitle="Reminders · Schedules · Notification alerts" />

      {/* Status bar */}
      <div style={{ display:'flex', gap:8 }}>
        <div style={{
          flex:1, padding:'10px 14px', borderRadius:10,
          background:'#0d0d0d', border:'1px solid #1a1a1a',
          display:'flex', alignItems:'center', gap:8,
        }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background: isMockMode?'#f59e0b':'#00e87a', flexShrink:0 }}/>
          <span style={{ fontSize:11, color:'#333', fontFamily:'var(--font-mono)' }}>
            {isMockMode ? 'Local storage' : 'Firebase synced'}
          </span>
        </div>
        <div style={{
          flex:1, padding:'10px 14px', borderRadius:10,
          background:'#0d0d0d', border:`1px solid ${notifGranted?'rgba(0,232,122,0.15)':'#1a1a1a'}`,
          display:'flex', alignItems:'center', gap:8,
        }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background: notifGranted?'#00e87a':'#333', flexShrink:0 }}/>
          <span style={{ fontSize:11, color:'#333', fontFamily:'var(--font-mono)' }}>
            {notifGranted ? 'Notifications on' : 'Notifications off'}
          </span>
        </div>
      </div>

      {/* Add reminder */}
      <div>
        <SectionLabel>Add new reminder</SectionLabel>
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&input.trim()){onQuery(input.trim());setInput('')}}}
            placeholder="e.g. Remind me to take aspirin at 8 AM"
            style={{
              flex:1, padding:'11px 15px', borderRadius:10,
              border:'1px solid #1e1e1e', background:'#0d0d0d',
              color:'var(--text-1)', fontSize:13,
              fontFamily:'var(--font-body)', outline:'none',
              transition:'border-color 0.14s',
            }}
            onFocus={e=>e.target.style.borderColor='rgba(0,232,122,0.3)'}
            onBlur={e=>e.target.style.borderColor='#1e1e1e'}
          />
          <button
            onClick={()=>{if(input.trim()){onQuery(input.trim());setInput('')}}}
            style={{
              padding:'11px 18px', borderRadius:10, border:'none',
              background:'linear-gradient(135deg,#00e87a,#00c264)', color:'#000',
              fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)',
              flexShrink:0,
            }}>Add</button>
        </div>
      </div>

      {/* Active reminders */}
      <div>
        <SectionLabel>Active reminders ({reminders.length})</SectionLabel>
        <div style={{ marginTop:10 }}>
          {reminders.length === 0 ? (
            <div style={{
              padding:'32px', borderRadius:14, textAlign:'center',
              background:'#080808', border:'1px solid #111',
            }}>
              <div style={{ fontSize:36, marginBottom:10 }}>💊</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#222', marginBottom:4 }}>No reminders yet</div>
              <div style={{ fontSize:11.5, color:'#1a1a1a' }}>Add one above or use the Voice tab</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {reminders.map(r => (
                <div key={r.id} style={{
                  padding:'13px 15px', borderRadius:12,
                  background:'#0d0d0d', border:'1px solid #1a1a1a',
                  display:'flex', alignItems:'center', gap:12,
                }}>
                  <div style={{
                    width:38, height:38, borderRadius:10, flexShrink:0,
                    background:'rgba(0,232,122,0.06)', border:'1px solid rgba(0,232,122,0.12)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
                  }}>💊</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'var(--text-1)', textTransform:'capitalize', marginBottom:5 }}>
                      {r.medication}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {r.times.map((t,i)=>(
                        <span key={i} style={{
                          fontSize:10, padding:'2px 8px', borderRadius:99,
                          background:'rgba(0,232,122,0.08)', color:'#00e87a',
                          border:'1px solid rgba(0,232,122,0.15)', fontFamily:'var(--font-mono)',
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={()=>onRemove(r.id)} style={{
                    padding:'5px 10px', borderRadius:8,
                    border:'1px solid rgba(255,61,90,0.15)',
                    background:'rgba(255,61,90,0.05)', color:'#ff3d5a',
                    fontSize:11, cursor:'pointer', fontFamily:'var(--font-body)',
                    flexShrink:0, transition:'all 0.14s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,61,90,0.12)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,61,90,0.05)'}
                  >Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick add */}
      <div>
        <SectionLabel>Quick add</SectionLabel>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:10 }}>
          {QUICK_MEDS.map((q,i)=>(
            <button key={i} onClick={()=>onQuery(q)} style={{
              padding:'10px 14px', borderRadius:10,
              border:'1px solid #1a1a1a', background:'#0d0d0d',
              cursor:'pointer', textAlign:'left', fontSize:12,
              color:'var(--text-3)', fontFamily:'var(--font-body)', transition:'all 0.14s',
              display:'flex', alignItems:'center', gap:10,
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,232,122,0.2)';e.currentTarget.style.color='var(--text-2)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#1a1a1a';e.currentTarget.style.color='var(--text-3)'}}
            >
              <span style={{ fontSize:14, flexShrink:0 }}>💊</span>
              {q}
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  )
}