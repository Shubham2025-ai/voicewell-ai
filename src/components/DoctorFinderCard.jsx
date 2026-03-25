import React from 'react'

function Spinner() {
  return <div style={{
    width:16, height:16, borderRadius:'50%',
    border:'2px solid rgba(255,255,255,0.18)', borderTopColor:'#60a5fa',
    animation:'spin 1s linear infinite'
  }}/>
}

export default function DoctorFinderCard({ data, onRetry, loading }) {
  if (loading) {
    return (
      <div style={card}>
        <div style={row}>
          <Spinner/><span style={muted}>Searching nearby doctors…</span>
          <button onClick={onRetry} style={retryBtn}>Retry</button>
        </div>
      </div>
    )
  }

  if (!data?.results?.length) {
    return (
      <div style={card}>
        <div style={row}>
          <span style={muted}>No nearby facilities found.</span>
          <button onClick={onRetry} style={retryBtn}>Search again</button>
        </div>
      </div>
    )
  }

  return (
    <div style={card}>
      <div style={{ ...row, marginBottom:8 }}>
        <div style={{fontWeight:700,color:'#fff'}}>Nearby facilities</div>
        <button onClick={onRetry} style={retryBtn}>Refresh</button>
      </div>
      <div style={{ display:'grid', gap:10 }}>
        {data.results.slice(0,5).map((d,i)=>(
          <div key={i} style={{
            padding:'10px 12px',
            borderRadius:10,
            background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{fontWeight:700,color:'#fff',marginBottom:4}}>{d.name}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>{d.address}</div>
            <div style={{fontSize:11,color:'#60a5fa',marginTop:4}}>{Math.round(d.distance_km*10)/10} km away</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

const card = {
  padding:'12px 12px 14px',
  borderRadius:12,
  background:'rgba(255,255,255,0.03)',
  border:'1px solid rgba(255,255,255,0.07)'
}
const row = { display:'flex', alignItems:'center', gap:10 }
const muted = { color:'rgba(255,255,255,0.6)', fontSize:13 }
const retryBtn = {
  marginLeft:'auto',
  padding:'6px 10px',
  fontSize:12, fontWeight:700,
  background:'rgba(96,165,250,0.16)',
  color:'#60a5fa',
  border:'1px solid rgba(96,165,250,0.35)',
  borderRadius:8, cursor:'pointer'
}