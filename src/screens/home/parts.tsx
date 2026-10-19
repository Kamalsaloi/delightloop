import type { CSSProperties, ReactNode } from 'react'
import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'

/** HubSpot sprocket on an orange circle, sized exactly as in Paper. */
export function HubDot({ size = 14, glyph = 9, stroke = 2 }: { size?: number; glyph?: number; stroke?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-hubspot" style={{ width: size, height: size }}>
      <svg width={glyph} height={glyph} viewBox="0 0 16 16" aria-label="HubSpot">
        <circle cx="9.5" cy="9.5" r="3.2" fill="none" stroke="#fff" strokeWidth={stroke} />
        <path d="M9.5 6.3V3M7.2 11.8 4 15M3.5 4.5l3.6 3" fill="none" stroke="#fff" strokeWidth={stroke} strokeLinecap="round" />
      </svg>
    </span>
  )
}

/** Cover-cropped photo tile. */
export function Photo({ id, className, style }: { id: string; className?: string; style?: CSSProperties }) {
  return <div className={cn('shrink-0 bg-cover bg-center', className)} style={{ backgroundImage: `url(${asset(id)})`, ...style }} />
}

export function ArrowIcon({ size = 14, color = '#111216' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlusIcon({ color = '#111216' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0">
      <path d="M8 3v10M3 8h10" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function CalendarIcon({ color = '#55575F' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0">
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" fill="none" stroke={color} strokeWidth="1.4" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

// Paper's white button: inset hairline + soft drop.
export const WHITE_BTN =
  'flex items-center justify-center bg-white text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] transition-colors hover:bg-fill-hover cursor-pointer'
export const VIOLET_BTN =
  'flex items-center justify-center bg-violet text-white shadow-primary transition-colors hover:bg-[#5A4EF0] active:bg-[#5145E8] cursor-pointer'

/** Three-column stat row with hairline dividers. */
export function StatRow({ children }: { children: ReactNode }) {
  return <div className="flex [&>*+*]:border-l [&>*+*]:border-line-soft [&>*+*]:pl-5">{children}</div>
}

export function Stat({ value, label, valueClass }: { value: ReactNode; label: string; valueClass: string }) {
  return (
    <div className="flex flex-1 basis-0 flex-col gap-1">
      <div className={valueClass}>{value}</div>
      <div className="text-[12.5px] leading-4 text-grey-3">{label}</div>
    </div>
  )
}

/** 24px faces, 20px apart, white 2px halo (outside the photo, as in Paper). */
export function FaceStack({ ids, ring = '#FFFFFF' }: { ids: string[]; ring?: string }) {
  return (
    <div className="relative h-7 w-16 shrink-0">
      {ids.map((id, i) => (
        <Photo key={id + i} id={id} className="absolute top-0.5 h-6 w-6 rounded-full" style={{ left: i * 20, boxShadow: `0 0 0 2px ${ring}` }} />
      ))}
    </div>
  )
}
