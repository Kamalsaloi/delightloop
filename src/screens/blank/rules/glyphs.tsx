import type { ReactNode } from 'react'

// Exact glyphs from Paper B8 / B8a (16-grid).
function Svg({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
      {children}
    </svg>
  )
}

const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const INK = '#33353C'

export const RG = {
  reply: (size = 13, color = INK) => (
    <Svg size={size}>
      <path d="M6 4 2.5 7.5 6 11M3 7.5h6.5a4 4 0 0 1 4 4V13" stroke={color} strokeWidth="1.5" {...round} />
    </Svg>
  ),
  calendar: (size = 13) => (
    <Svg size={size}>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke={INK} strokeWidth="1.4" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  ),
  clock: (size = 13) => (
    <Svg size={size}>
      <circle cx="8" cy="8" r="5.5" stroke={INK} strokeWidth="1.4" />
      <path d="M8 5v3l2 1.5" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  ),
  ban: (size = 13) => (
    <Svg size={size}>
      <circle cx="8" cy="8" r="5.5" stroke={INK} strokeWidth="1.4" />
      <path d="M4.2 11.8l7.6-7.6" stroke={INK} strokeWidth="1.4" />
    </Svg>
  ),
  forward: () => (
    <Svg size={14}>
      <path d="M10 4l3.5 3.5L10 11M13.5 7.5H7a4 4 0 0 0-4 4V13" stroke={INK} strokeWidth="1.5" {...round} />
    </Svg>
  ),
  calendarX: () => (
    <Svg size={14}>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke={INK} strokeWidth="1.4" />
      <path d="M2.5 6.5h11M6.5 9l3 3M9.5 9l-3 3" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  ),
  pinX: () => (
    <Svg size={14}>
      <path d="M8 14s4.5-4 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 10 8 14 8 14Z" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.5 5l3 3M9.5 5l-3 3" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  ),
  returned: () => (
    <Svg size={14}>
      <path d="M2.5 5.5 8 2.5l5.5 3v6L8 14.5l-5.5-3Z" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.5 8.5 4 7l1.5-1.5M4 7h4.5a2 2 0 0 1 0 4H7" stroke={INK} strokeWidth="1.3" {...round} />
    </Svg>
  ),
  eye: () => (
    <Svg size={14}>
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" stroke={INK} strokeWidth="1.4" />
    </Svg>
  ),
  pause: () => (
    <Svg size={14}>
      <path d="M5.5 3.5v9M10.5 3.5v9" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  ),
  arrow: () => (
    <Svg size={14}>
      <path d="M2.5 8h9M8.5 4.5 12 8l-3.5 3.5" stroke={INK} strokeWidth="1.5" {...round} />
    </Svg>
  ),
  slack: (size = 16) => (
    <Svg size={size}>
      <path d="M6 2.5v5M10 8.5v5M2.5 10h5M8.5 6h5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  ),
  hash: () => (
    <Svg size={14}>
      <path d="M5.5 2v12M10.5 2v12M2 5.5h12M2 10.5h12" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  ),
  hubspot: () => (
    <Svg size={14}>
      <circle cx="10" cy="9.5" r="2.5" stroke="#FFFFFF" strokeWidth="1.8" />
      <path d="M10 7V3.5M5 5l3.2 3M3.5 13l4.5-2" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  ),
  rules: () => (
    <Svg size={14}>
      <path d="M3 4.5h10M3 8h10M3 11.5h6" stroke="#111216" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  plus: (size = 12, color = '#55575F') => (
    <Svg size={size}>
      <path d="M8 3v10M3 8h10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  ),
  close: (size = 14, color = '#55575F', width = 1.5) => (
    <Svg size={size}>
      <path d="M4 4l8 8M12 4l-8 8" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </Svg>
  ),
  back: (size = 14, color = '#55575F', width = 1.5) => (
    <Svg size={size}>
      <path d="M10 3.5 5.5 8l4.5 4.5" stroke={color} strokeWidth={width} {...round} />
    </Svg>
  ),
  check: (size = 13, width = 1.9) => (
    <Svg size={size}>
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="#FFFFFF" strokeWidth={width} {...round} />
    </Svg>
  ),
  chevronUp: () => (
    <Svg size={13}>
      <path d="M4.5 10 8 6.5l3.5 3.5" stroke="#55575F" strokeWidth="1.6" {...round} />
    </Svg>
  ),
  search: () => (
    <Svg size={15}>
      <circle cx="7" cy="7" r="4.5" stroke="#8B8D95" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="#8B8D95" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  undo: () => (
    <Svg size={12}>
      <path d="M5.5 4 2.5 7l3 3M3 7h6.5a4 4 0 0 1 0 8H7" stroke="#7A4A00" strokeWidth="1.6" {...round} />
    </Svg>
  ),
  mail: () => (
    <Svg size={12}>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="#7A4A00" strokeWidth="1.5" />
      <path d="m3 4.5 5 4 5-4" stroke="#7A4A00" strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  replyGreen: () => (
    <Svg size={14}>
      <path d="M6.5 4 3 7.5 6.5 11M3 7.5h6.5a3.5 3.5 0 0 1 3.5 3.5v1" stroke="#1E8A58" strokeWidth="1.6" {...round} />
    </Svg>
  ),
}
