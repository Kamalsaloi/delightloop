import type { SVGProps } from 'react'

// Stroke icons copied from the Paper file. Add new ones here rather than inline.
const PATHS = {
  arrowRight: <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />,
  arrowUpRight: <path d="M5 11 11 5M6 5h5v5" />,
  chevronRight: <path d="M6 3.5 10.5 8 6 12.5" />,
  chevronDown: <path d="M4 6l4 4 4-4" />,
  chevronLeft: <path d="M10 3.5 5.5 8l4.5 4.5" />,
  plus: <path d="M8 3v10M3 8h10" />,
  minus: <path d="M3 8h10" />,
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  check: <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />,
  play: <path d="M5 3.5v9l7.5-4.5Z" strokeLinejoin="round" />,
  pause: <path d="M5.5 3.5v9M10.5 3.5v9" />,
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="m10.5 10.5 3 3" />
    </>
  ),
  pencil: <path d="M10.5 3.5l2 2L6 12H4v-2l6.5-6.5Z" strokeLinejoin="round" />,
  copy: (
    <>
      <rect x="5.5" y="5.5" width="7" height="7" rx="1.5" />
      <path d="M3.5 10.5v-6a1 1 0 0 1 1-1h6" />
    </>
  ),
  trash: <path d="M3.5 4.5h9M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" strokeLinejoin="round" />,
  calendar: (
    <>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </>
  ),
  flag: <path d="M4 14V2.5M4 3h7l-1.5 3L11 9H4" strokeLinejoin="round" />,
  expand: <path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3" />,
  bars: <path d="M3 13h10M5 13V8M8 13V4M11 13V6" />,
  dots: (
    <>
      <circle cx="3.5" cy="8" r=".8" />
      <circle cx="8" cy="8" r=".8" />
      <circle cx="12.5" cy="8" r=".8" />
    </>
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3l2 1.5" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="m2.5 4.5 5.5 4 5.5-4" />
    </>
  ),
  user: (
    <>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3 13.5c.8-2.3 2.7-3.5 5-3.5s4.2 1.2 5 3.5" />
    </>
  ),
  gift: (
    <>
      <rect x="2.5" y="6" width="11" height="7.5" rx="1" />
      <path d="M2 6h12M8 6v7.5M8 6S6.5 2.5 4.8 3.5 6 6 8 6Zm0 0s1.5-3.5 3.2-2.5S10 6 8 6Z" />
    </>
  ),
  sparkle: <path d="M8 2.5l1.3 3.2L12.5 7 9.3 8.3 8 11.5 6.7 8.3 3.5 7l3.2-1.3L8 2.5Z" strokeLinejoin="round" />,
  undo: <path d="M5 4 2.5 6.5 5 9M3 6.5h6.5a3.5 3.5 0 0 1 0 7H7" />,
  link: <path d="M7 9a2.5 2.5 0 0 0 3.5 0l2-2A2.5 2.5 0 0 0 9 3.5l-.5.5M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.5-.5" />,
  info: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 7.5v3M8 5.3v.2" />
    </>
  ),
  eye: (
    <>
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
  refresh: <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5v3h-3" />,
  at: (
    <>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M10.5 8v1a1.8 1.8 0 0 0 3.5 0V8A6 6 0 1 0 11 13.2" />
    </>
  ),
  send: <path d="M14 2 7 9M14 2l-4.5 12-2.5-5-5-2.5L14 2Z" strokeLinejoin="round" />,
  qr: (
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <path d="M9.5 9.5h2v2h-2zM12.5 12.5h1.5M12.5 9.5H14" />
    </>
  ),
} as const

export type IconName = keyof typeof PATHS

type Props = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
}

export function Icon({ name, size = 14, color = 'currentColor', strokeWidth = 1.5, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block shrink-0"
      aria-hidden
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
