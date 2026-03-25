import React from 'react'
import WaterCard from './WaterCard.jsx'
import SkeletonLoader from './SkeletonLoader.jsx'

function RetryInline({ onRetry, label='Retry' }) {
  return (
    <button onClick={onRetry} style={{
      marginLeft:'auto', padding:'6px 10px', borderRadius:8,
      background:'rgba(96,165,250,0.16)', color:'#60a5fa',
      border:'1px solid rgba(96,165,250,0.35)', fontSize:12, fontWeight:700, cursor:'pointer'
    }}>{label}</button>
  )
}

export default function NutritionPage({ onQuery, waterTotal, waterPct, waterLog, goalMl, loadingNutrition, nutritionCard, onRetryNutrition }) {
  return (
    <div style={{ padding:'1.25rem', display:'grid', gap:14, gridTemplateColumns:'2fr 1fr' }}>
      <div style={{
        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:12, padding:'12px 14px'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div style={{fontWeight:800,color:'#fff'}}>Nutrition insights</div>
          {loadingNutrition && <SkeletonLoader height={14} width={80}/>}
          <RetryInline onRetry={onRetryNutrition}/>
        </div>

        {loadingNutrition && (
          <div style={{ display:'flex', alignItems:'center', gap:10, color:'rgba(255,255,255,0.7)', fontSize:13 }}>
            <div className="spinner" style={{
              width:16,height:16,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.2)',borderTopColor:'#00e87a',
              animation:'spin 1s linear infinite'
            }}/>
            Fetching nutrition facts…
          </div>
        )}

        {!loadingNutrition && nutritionCard && (
          <div style={{ fontSize:13.5, color:'rgba(255,255,255,0.8)', lineHeight:1.6 }}>
            {nutritionCard}
          </div>
        )}

        {!loadingNutrition && !nutritionCard && (
          <div style={{ color:'rgba(255,255,255,0.55)', fontSize:13 }}>
            Ask “How much protein in 2 eggs and 1 banana?” or “Nutrition facts for grilled chicken 200g”.
          </div>
        )}
      </div>

      <WaterCard
        total={waterTotal} pct={waterPct} log={waterLog} goalMl={goalMl}
        onQuery={onQuery}
      />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}