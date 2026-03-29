import React, { useState } from 'react'

export default function Card3D({
  icon,
  name,
  tag,
  color = '#00e87a',
  animated = true,
  index = 0,
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 10px',
        borderRadius: 9,
        background: `${color}0d`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? `0 12px 24px ${color}30, inset 0 1px 2px rgba(255,255,255,0.1)`
          : `0 4px 12px ${color}15, inset 0 1px 1px rgba(255,255,255,0.05)`,
        animation: animated ? `float-scale 3s ease-in-out infinite ${index * 0.1}s` : 'none',
        perspective: '1200px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        style={{
          fontSize: 16,
          flexShrink: 0,
          transform: isHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
          {name}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
          {tag}
        </div>
      </div>
    </div>
  )
}
