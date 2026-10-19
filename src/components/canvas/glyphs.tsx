import type { ReactNode } from 'react'

// Exact glyphs from the Paper canvas artboards (16-grid unless noted).
function Svg({ size, box = 16, children }: { size: number; box?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${box} ${box}`} fill="none" className="inline-block shrink-0" aria-hidden>
      {children}
    </svg>
  )
}

const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const G = {
  linkedin: (size = 18, color = '#FFFFFF') => (
    <Svg size={size}>
      <path
        d="M3.6 6.2h2.1V13H3.6zM4.65 2.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM7.1 6.2h2v.95c.3-.55 1-1.1 2.1-1.1 2.2 0 2.6 1.45 2.6 3.3V13h-2.1V9.7c0-.8 0-1.8-1.1-1.8s-1.3.85-1.3 1.75V13H7.1z"
        fill={color}
      />
    </Svg>
  ),
  x: (size = 8) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block shrink-0" aria-hidden>
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  pen: (size = 12, color = '#8B8D95') => (
    <Svg size={size}>
      <path d="M10.5 2.5 13.5 5.5 6 13H3v-3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  rule: (color: string) => (
    <Svg size={10}>
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.6" />
      <rect x="5.6" y="5.6" width="4.8" height="4.8" rx="0.8" fill={color} />
    </Svg>
  ),
  arrowUpRight: (size = 14, color = '#5C5D6B') => (
    <Svg size={size}>
      <path d="M5 11 11 5M6 5h5v5" stroke={color} strokeWidth="1.6" {...round} />
    </Svg>
  ),
  flag: (size = 13, color = '#FFFFFF') => (
    <Svg size={size}>
      <path d="M3.5 14V2.5M3.5 3h8l-1.6 2.7L11.5 8.5h-8" stroke={color} strokeWidth="1.6" {...round} />
    </Svg>
  ),
  editTool: (color = '#111216') => (
    <Svg size={15}>
      <path d="M10.8 2.6 13.4 5.2 6 12.6l-3.3.7.7-3.3Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </Svg>
  ),
  copyTool: (color = '#55575F') => (
    <Svg size={15}>
      <rect x="5" y="5" width="8.5" height="8.5" rx="2" stroke={color} strokeWidth="1.4" />
      <path d="M11 5V4a1.5 1.5 0 0 0-1.5-1.5h-5A1.5 1.5 0 0 0 3 4v5A1.5 1.5 0 0 0 4.5 10.5H5" stroke={color} strokeWidth="1.4" />
    </Svg>
  ),
  deleteTool: (color = '#C2453A') => (
    <Svg size={15}>
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" stroke={color} strokeWidth="1.4" {...round} />
    </Svg>
  ),
  cursor: () => (
    <Svg size={16} box={22}>
      <path d="M4 2.5l13.5 7.2-6.1 1.5-3 5.6z" fill="#6559F7" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  ),
  minus: () => (
    <Svg size={14}>
      <path d="M3.5 8h9" stroke="#55575F" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  plus: (size = 14, color = '#55575F', width = 1.5) => (
    <Svg size={size}>
      <path d="M3.5 8h9M8 3.5v9" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </Svg>
  ),
  addStep: () => (
    <Svg size={12}>
      <path d="M8 3v10M3 8h10" stroke="#5A3FE6" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  ),
  fit: () => (
    <Svg size={14}>
      <path d="M2.5 5.5v-3h3M10.5 2.5h3v3M13.5 10.5v3h-3M5.5 13.5h-3v-3" stroke="#55575F" strokeWidth="1.5" {...round} />
    </Svg>
  ),
  close: () => (
    <Svg size={14}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="#55575F" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  back: () => (
    <Svg size={16}>
      <path d="M10 3.5 5.5 8l4.5 4.5" stroke="#55575F" strokeWidth="1.6" {...round} />
    </Svg>
  ),
  chevronRight: (width = 1.6) => (
    <Svg size={14}>
      <path d="M6 3.5 10.5 8 6 12.5" stroke="#55575F" strokeWidth={width} {...round} />
    </Svg>
  ),
  chevronDown: (color = '#8B8D95') => (
    <Svg size={14}>
      <path d="M4.5 6.5 8 10l3.5-3.5" stroke={color} strokeWidth="1.5" {...round} />
    </Svg>
  ),
  check: (size = 16) => (
    <Svg size={size}>
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="#FFFFFF" strokeWidth="1.8" {...round} />
    </Svg>
  ),
  swap: () => (
    <Svg size={13}>
      <path d="M3 5.5h9.5L10 3M13 10.5H3.5L6 13" stroke="#111216" strokeWidth="1.5" {...round} />
    </Svg>
  ),
  search: () => (
    <Svg size={15}>
      <circle cx="7" cy="7" r="4.5" stroke="#8B8D95" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="#8B8D95" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  link: () => (
    <Svg size={14}>
      <path
        d="M6.5 9.5 9.5 6.5M7 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M9 11.5l-1 1A2.5 2.5 0 0 1 4.5 9l1-1"
        stroke="#55575F"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </Svg>
  ),
  play: () => (
    <Svg size={13}>
      <path d="M5 3.5v9l7.5-4.5Z" stroke="#111216" strokeWidth="1.4" strokeLinejoin="round" />
    </Svg>
  ),
  arrowRight: () => (
    <Svg size={13}>
      <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" stroke="#FFFFFF" strokeWidth="1.5" {...round} />
    </Svg>
  ),
}
