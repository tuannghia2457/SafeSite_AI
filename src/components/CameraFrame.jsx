import { useId } from 'react'
import { VIOLATIONS, violationsOf } from '../data/mockData'

// Renders a stylised CCTV frame with YOLO-style detection boxes.
// Pure SVG in a 320 x 180 coordinate space, so it doubles as an "evidence snapshot".

const scaleAt = (y) => 0.72 + ((y - 110) / 60) * 0.5

function Backdrop({ scene }) {
  const stroke = 'rgb(120 140 170 / 0.35)'
  if (scene === 'construction') {
    return (
      <g stroke={stroke} strokeWidth="1" fill="none">
        {/* building skeleton */}
        {[150, 180, 210, 240, 270, 300].map((x) => (
          <line key={x} x1={x} y1="22" x2={x} y2="104" />
        ))}
        {[22, 42, 62, 82].map((y) => (
          <line key={y} x1="150" y1={y} x2="300" y2={y} />
        ))}
        <rect x="150" y="62" width="150" height="42" fill="rgb(63 73 89 / 0.25)" stroke="none" />
        {/* tower crane */}
        <path d="M58 104 V12 M66 104 V12 M58 30 L66 40 M66 50 L58 60 M58 70 L66 80 M66 90 L58 100" />
        <path d="M30 12 H250 M62 12 L90 4 L250 12" />
        <line x1="200" y1="12" x2="200" y2="58" strokeDasharray="2 2" />
        <rect x="194" y="58" width="12" height="7" fill="rgb(186 215 247 / 0.12)" />
        {/* rebar stack */}
        <path d="M10 104 L44 98 M12 104 L46 100" />
      </g>
    )
  }
  if (scene === 'factory') {
    return (
      <g stroke={stroke} strokeWidth="1" fill="none">
        <rect x="0" y="18" width="320" height="86" fill="rgb(40 48 62 / 0.45)" stroke="none" />
        {[20, 70, 120, 170, 220, 270].map((x) => (
          <rect key={x} x={x} y="26" width="34" height="12" fill="rgb(186 215 247 / 0.06)" />
        ))}
        <path d="M0 48 H320 M0 54 H320" />
        {/* machines */}
        <rect x="26" y="70" width="70" height="34" fill="rgb(63 73 89 / 0.6)" />
        <rect x="40" y="62" width="40" height="8" fill="rgb(63 73 89 / 0.6)" />
        <rect x="190" y="76" width="54" height="28" fill="rgb(63 73 89 / 0.6)" />
        <circle cx="217" cy="90" r="8" />
        <rect x="260" y="64" width="44" height="40" fill="rgb(63 73 89 / 0.45)" />
        {/* sparks */}
        <circle cx="282" cy="96" r="1.5" fill="#e0a43a" stroke="none" opacity="0.8" />
      </g>
    )
  }
  return (
    <g stroke={stroke} strokeWidth="1" fill="none">
      {/* racking */}
      {[10, 80, 150].map((x) => (
        <g key={x}>
          <path d={`M${x} 104 V20 M${x + 60} 104 V20`} />
          {[38, 62, 86].map((y) => (
            <line key={y} x1={x} y1={y} x2={x + 60} y2={y} />
          ))}
          {[24, 48, 72, 90].map((y, i) => (
            <rect key={y} x={x + 6 + (i % 2) * 22} y={y} width="24" height={i === 3 ? 14 : 13} fill="rgb(150 130 100 / 0.25)" />
          ))}
        </g>
      ))}
      {/* dock door */}
      <rect x="236" y="34" width="70" height="70" fill="rgb(40 48 62 / 0.6)" />
      {[46, 58, 70, 82, 94].map((y) => (
        <line key={y} x1="236" y1={y} x2="306" y2={y} />
      ))}
    </g>
  )
}

function Worker({ w }) {
  const body = w.vest ? '#c8e64a' : '#55627a'
  return (
    <g>
      <ellipse cx="0" cy="0" rx="7" ry="1.8" fill="rgb(0 0 0 / 0.45)" />
      <path d="M-2.5 0 L-1.8 -13 M2.5 0 L1.8 -13" stroke="#3a4253" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M-5 -25 L-7.5 -15 M5 -25 L7.5 -15" stroke={body} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="-5" y="-27" width="10" height="15" rx="2.5" fill={body} />
      {w.vest && <path d="M-5 -19 H5 M-5 -16 H5" stroke="#eef4fb" strokeWidth="0.9" opacity="0.85" />}
      <circle cy="-31.5" r="4" fill="#c9a07c" />
      {w.helmet ? (
        <>
          <path d="M-4.8 -32 A4.8 4.8 0 0 1 4.8 -32 Z" fill="#f2c230" />
          <rect x="-5.8" y="-32.6" width="11.6" height="1.5" rx="0.7" fill="#f2c230" />
        </>
      ) : (
        <path d="M-4 -32.4 A4 4 0 0 1 4 -32.4 Z" fill="#2a2522" />
      )}
    </g>
  )
}

function DetectionBox({ w, zone, highlight }) {
  const v = violationsOf(w, zone)
  const bad = v.length > 0
  const color = bad ? '#e46d4c' : '#3fb59f'
  const conf = (0.86 + ((w.id * 37) % 12) / 100).toFixed(2)
  const label = bad ? `${VIOLATIONS[v[0]].tag} ${conf}` : `PERSON ${conf}`
  const width = label.length * 3.1 + 6
  return (
    <g className={highlight ? 'animate-pulse-ring' : undefined}>
      <rect x="-9.5" y="-39" width="19" height="40" fill="none" stroke={color} strokeWidth={highlight ? 1.5 : 0.9} rx="1" />
      <rect x="-9.5" y="-46" width={width} height="7" fill={color} rx="1" />
      <text x="-7" y="-41" fontSize="5" fontFamily="JetBrains Mono, monospace" fontWeight="600" fill="#05060f">
        {label}
      </text>
    </g>
  )
}

export default function CameraFrame({ scene, workers, zone, highlightId = null, showBoxes = true, animate = false, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const sorted = [...workers].sort((a, b) => a.y - b.y)
  const transition = animate ? 'transform 1s linear' : undefined

  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className={`block h-full w-full ${className}`} role="img" aria-label="Camera frame">
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1322" />
          <stop offset="1" stopColor="#1a2335" />
        </linearGradient>
        <linearGradient id={`floor${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2331" />
          <stop offset="1" stopColor="#2a3142" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#sky${uid})`} />
      <Backdrop scene={scene} />
      <rect y="104" width="320" height="76" fill={`url(#floor${uid})`} />
      <g stroke="rgb(186 215 247 / 0.07)" strokeWidth="0.8">
        {Array.from({ length: 13 }, (_, i) => i - 6).map((i) => (
          <line key={i} x1={160 + i * 14} y1="104" x2={160 + i * 64} y2="180" />
        ))}
        {[116, 134, 156].map((y) => (
          <line key={y} x1="0" y1={y} x2="320" y2={y} />
        ))}
      </g>

      {zone && (
        <g>
          <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} fill="rgb(228 109 76 / 0.1)" stroke="#e46d4c" strokeWidth="0.9" strokeDasharray="4 3" />
          <text x={zone.x + 4} y={zone.y + zone.h - 4} fontSize="5.5" fontFamily="JetBrains Mono, monospace" fill="#e46d4c" letterSpacing="0.5">
            RESTRICTED · KHU VỰC CẤM
          </text>
        </g>
      )}

      {sorted.map((w) => {
        const s = scaleAt(w.y)
        return (
          <g key={w.id} style={{ transform: `translate(${w.x}px, ${w.y}px) scale(${s})`, transition }}>
            <Worker w={w} />
            {showBoxes && <DetectionBox w={w} zone={zone} highlight={w.id === highlightId} />}
          </g>
        )
      })}
    </svg>
  )
}
