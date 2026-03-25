import React from 'react'
import SkeletonLoader from './SkeletonLoader.jsx'

function RetryInline({ onRetry }) {
  return (
    <button onClick={onRetry} style={{
      marginLeft:'auto', padding:'6px 10px', borderRadius:8,
      background:'rgba(96,165,250,0.16)', color:'#60a5fa',
      border:'1px solid rgba(96,165,250,0.35)', fontSize:12, fontWeight:700, cursor:'pointer'
    }}>Retry</button>
  )
}

// Local WeatherCard (copied from ChatBubble, now reusable here)
function WeatherCard({ data }) {
  if (!data) return null
  return (
    <div>
      <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:12,marginBottom:6}}>🌤️ {data.city}</div>
      <div style={{fontSize:28,fontWeight:300,fontFamily:'var(--font-display)',marginBottom:3}}>{data.temp}°C</div>
      <div style={{fontSize:12,opacity:0.7,marginBottom:8,textTransform:'capitalize'}}>{data.description}</div>
      {data.aqi && (
        <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.07)',padding:'3px 10px',borderRadius:99,fontSize:11}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:['','#00e87a','#f59e0b','#f59e0b','#ef4444','#9b2335'][data.aqi]||'#888'}}/>
          AQI {data.aqi} · {data.aqiLabel}
        </div>
      )}
      {data.tip && <div style={{fontSize:11,marginTop:8,opacity:0.75,fontStyle:'italic'}}>{data.tip}</div>}
    </div>
  )
}

export default function HealthPage({ onQuery, speak, loadingWeather, weatherCard, onRetryWeather }) {
  return (
    <div style={{ padding:'1.25rem', display:'grid', gap:14, gridTemplateColumns:'1.4fr 1fr' }}>
      <div style={{
        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:12, padding:'12px 14px'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div style={{fontWeight:800,color:'#fff'}}>Weather & Air</div>
          {loadingWeather && <SkeletonLoader height={14} width={60}/>}
          <RetryInline onRetry={onRetryWeather}/>
        </div>

        {loadingWeather && (
          <div style={{ display:'flex', alignItems:'center', gap:10, color:'rgba(255,255,255,0.7)', fontSize:13 }}>
            <div className="spinner" style={{
              width:16,height:16,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.2)',borderTopColor:'#60a5fa',
              animation:'spin 1s linear infinite'
            }}/>
            Fetching latest weather…
          </div>
        )}

        {!loadingWeather && weatherCard && (
          <WeatherCard data={weatherCard} />
        )}

        {!loadingWeather && !weatherCard && (
          <div style={{ color:'rgba(255,255,255,0.55)', fontSize:13 }}>
            Ask “Weather in New York today” or “AQI in Mumbai now”.
          </div>
        )}
      </div>

      <div />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}