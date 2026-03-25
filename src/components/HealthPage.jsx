import React from 'react'
import WeatherCard from './WeatherCard.jsx'
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
          <WeatherCard data={weatherCard} speak={speak} />
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