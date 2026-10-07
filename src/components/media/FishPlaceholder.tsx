import { useId } from 'react'
import type { Variety } from '../../types/auction'

/**
 * Ilustração SVG local de um guppy, colorida por variedade.
 * Placeholder de foto nesta etapa — futuro: <img src={media.url}> vindo do storage.
 */
interface Palette {
  water: [string, string]
  body: [string, string]
  tail: [string, string]
  eye: string
  pattern?: 'dots' | 'snake' | 'scales' | 'bands'
  bigFins?: boolean
}

const DEFAULT_PALETTE: Palette = { water: ['#1f2937', '#0a0908'], body: ['#fde68a', '#b45309'], tail: ['#f59e0b', '#78350f'], eye: '#111827' }

export const VARIETY_PALETTE: Record<string, Palette> = {
  'Full Red': { water: ['#164e63', '#062530'], body: ['#fecaca', '#ef4444'], tail: ['#f87171', '#b91c1c'], eye: '#111827' },
  'Albino Full Red': { water: ['#155e75', '#083344'], body: ['#fff1f2', '#fda4af'], tail: ['#fb7185', '#e11d48'], eye: '#dc2626' },
  'Moscow Blue': { water: ['#0f3d5c', '#04121f'], body: ['#93c5fd', '#1e3a8a'], tail: ['#3b82f6', '#172554'], eye: '#020617' },
  'Blue Grass': { water: ['#115e59', '#042f2e'], body: ['#d1d5db', '#64748b'], tail: ['#60a5fa', '#1d4ed8'], eye: '#0f172a', pattern: 'dots' },
  'Japan Blue': { water: ['#0e4f66', '#031d2b'], body: ['#a5f3fc', '#0891b2'], tail: ['#fdba74', '#ea580c'], eye: '#0f172a' },
  'Red Dragon': { water: ['#3f1d2b', '#12060c'], body: ['#fca5a5', '#991b1b'], tail: ['#ef4444', '#7f1d1d'], eye: '#111827', pattern: 'scales' },
  'Dumbo Ear': { water: ['#1e3a5f', '#0b1626'], body: ['#e2e8f0', '#94a3b8'], tail: ['#c4b5fd', '#6d28d9'], eye: '#111827', bigFins: true },
  Platinum: { water: ['#1f3b4d', '#0a1820'], body: ['#ffffff', '#e2e8f0'], tail: ['#f8fafc', '#cbd5e1'], eye: '#111827' },
  Snakeskin: { water: ['#14532d', '#052e16'], body: ['#fde68a', '#a16207'], tail: ['#facc15', '#854d0e'], eye: '#111827', pattern: 'snake' },
  Leopard: { water: ['#1f2937', '#0a0908'], body: ['#fde68a', '#c2410c'], tail: ['#fb923c', '#9a3412'], eye: '#111827', pattern: 'dots' },
}

interface Props {
  variety: Variety
  /** Varia pose/enquadramento para que cada "foto" pareça diferente. */
  variant?: number
  className?: string
  showWater?: boolean
}

export function FishPlaceholder({ variety, variant = 0, className = '', showWater = true }: Props) {
  const p = VARIETY_PALETTE[variety] ?? DEFAULT_PALETTE
  const uid = useId().replace(/:/g, '')
  const flip = variant % 2 === 1
  const female = variant % 3 === 1
  const scale = [1, 0.85, 1.12, 0.95, 1.05][variant % 5]
  const tilt = [-4, 6, -9, 3, 0][variant % 5]
  const tailScale = female ? 0.55 : 1

  return (
    <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Guppy ${variety}`}>
      <defs>
        <radialGradient id={`w${uid}`} cx="50%" cy="25%" r="85%">
          <stop offset="0%" stopColor={p.water[0]} />
          <stop offset="100%" stopColor={p.water[1]} />
        </radialGradient>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.body[0]} />
          <stop offset="100%" stopColor={p.body[1]} />
        </linearGradient>
        <linearGradient id={`t${uid}`} x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0%" stopColor={p.tail[0]} stopOpacity="0.95" />
          <stop offset="100%" stopColor={p.tail[1]} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`l${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {showWater && (
        <>
          <rect width="400" height="300" fill={`url(#w${uid})`} />
          {/* feixes de luz */}
          <path d="M60 0 L110 0 L40 300 L0 300 Z" fill={`url(#l${uid})`} />
          <path d="M220 0 L250 0 L200 300 L160 300 Z" fill={`url(#l${uid})`} />
          {/* plantas */}
          <g fill={p.water[0]} opacity="0.9">
            <path d="M20 300 C10 240 40 210 30 160 C50 210 45 250 50 300 Z" />
            <path d="M350 300 C345 250 370 220 360 170 C385 220 380 260 385 300 Z" />
            <path d="M380 300 C378 260 395 240 392 210 C405 250 400 280 400 300 Z" />
          </g>
          {/* bolhas */}
          <g fill="#fff" opacity="0.25">
            <circle cx="300" cy="60" r="4" />
            <circle cx="312" cy="38" r="2.5" />
            <circle cx="294" cy="22" r="1.8" />
            <circle cx="90" cy="90" r="2.2" />
          </g>
          <rect y="270" width="400" height="30" fill="#000" opacity="0.18" />
        </>
      )}

      <g transform={`translate(200 150) rotate(${tilt}) scale(${flip ? -scale : scale} ${scale}) translate(-200 -150)`}>
        {/* cauda */}
        <g transform={`translate(195 150) scale(${tailScale}) translate(-195 -150)`}>
          <path d="M196 150 C170 118 110 48 58 66 C34 116 34 184 58 234 C110 252 170 182 196 150Z" fill={`url(#t${uid})`} />
          <path d="M196 150 C150 130 100 100 70 92 M196 150 C140 150 100 150 60 150 M196 150 C150 170 100 200 70 208" stroke="#fff" strokeOpacity="0.18" strokeWidth="2" fill="none" />
          {p.pattern === 'dots' && (
            <g fill="#0f172a" opacity="0.55">
              {[[90, 100], [110, 130], [80, 150], [120, 170], [95, 200], [140, 140], [70, 120], [70, 185], [130, 110], [115, 205]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3.2" />
              ))}
            </g>
          )}
        </g>
        {/* dorsal */}
        <path d={p.bigFins ? 'M220 130 C230 80 290 78 305 124 Z' : 'M228 130 C238 98 278 94 298 122 Z'} fill={`url(#t${uid})`} opacity="0.9" />
        {/* peitoral (Dumbo Ear = orelhas grandes) */}
        {p.bigFins && <path d="M292 158 C288 190 262 210 246 200 C256 185 270 168 292 158Z" fill={p.tail[0]} opacity="0.85" />}
        {/* corpo */}
        <path d="M188 150 C220 118 292 112 332 138 C348 147 348 156 332 163 C292 188 220 182 188 150Z" fill={`url(#b${uid})`} />
        {p.pattern === 'snake' && (
          <path d="M210 140 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 M210 156 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0" stroke="#422006" strokeOpacity="0.55" strokeWidth="2.4" fill="none" />
        )}
        {p.pattern === 'bands' && (
          <g fill="#fff" stroke="#111827" strokeWidth="2">
            <path d="M300 126 C306 140 306 156 300 170 L288 168 C292 154 292 142 288 128 Z" />
            <path d="M250 120 C258 140 258 160 250 178 L236 176 C243 158 243 140 236 122 Z" />
            <path d="M206 136 C210 146 210 156 206 164 L196 158 C198 152 198 146 196 142 Z" />
          </g>
        )}
        {p.pattern === 'scales' && (
          <g fill="none" stroke="#fde68a" strokeOpacity="0.6" strokeWidth="1.6">
            {[220, 240, 260, 280, 300].map((x) => (
              <path key={x} d={`M${x} 138 a8 8 0 0 1 16 0 M${x - 8} 152 a8 8 0 0 1 16 0`} />
            ))}
          </g>
        )}
        <path d="M200 146 C240 130 300 128 330 142" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" />
        {/* olho */}
        <circle cx="318" cy="145" r="6.5" fill="#fff" />
        <circle cx="319" cy="145" r="4" fill={p.eye} />
        <circle cx="320.5" cy="143.5" r="1.3" fill="#fff" />
      </g>
    </svg>
  )
}
