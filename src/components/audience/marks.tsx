import type { ReactNode } from 'react'
import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import type { Person, Source } from '@/data/people'

/** HubSpot sprocket in an orange circle, as drawn in the audience artboards. */
export function HubSpotDot({ size = 16 }: { size?: number }) {
  const icon = Math.round(size * 0.625)
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-hubspot" style={{ width: size, height: size }}>
      <svg width={icon} height={icon} viewBox="0 0 16 16" aria-label="HubSpot">
        <circle cx="9.5" cy="9.5" r="3.2" fill="none" stroke="#fff" strokeWidth="2" />
        <path d="M9.5 6.3V3M7.2 11.8 4 15M3.5 4.5l3.6 3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

const MARK_SIZE = {
  14: { radius: 3, li: 8, x: 8.5, line: 10 },
  16: { radius: 4, li: 9, x: 9.5, line: 10 },
  18: { radius: 4, li: 10, x: 10.5, line: 12 },
  20: { radius: 5, li: 11, x: 11, line: 12 },
} as const

/** LinkedIn "in" / X glyph tile used for sources. */
export function SourceMark({ source, size = 14 }: { source: Source; size?: keyof typeof MARK_SIZE }) {
  const s = MARK_SIZE[size]
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center font-bold text-white',
        source === 'linkedin' ? 'bg-linkedin' : 'bg-ink',
      )}
      style={{ width: size, height: size, borderRadius: s.radius, fontSize: source === 'linkedin' ? s.li : s.x, lineHeight: `${s.line}px` }}
      aria-label={source === 'linkedin' ? 'LinkedIn' : 'X'}
    >
      {source === 'linkedin' ? 'in' : '𝕏'}
    </span>
  )
}

/** Face photo, or initials on a warm grey disc when we have no photo. */
export function PersonAvatar({ person, size = 32, className }: { person: Pick<Person, 'face' | 'initials'>; size?: number; className?: string }) {
  if (person.face) {
    return (
      <img
        src={asset(person.face)}
        alt=""
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-[#ECEBE7] font-semibold text-grey-1', className)}
      style={{ width: size, height: size, fontSize: size >= 32 ? 12 : 10, lineHeight: '14px' }}
    >
      {person.initials}
    </span>
  )
}

/** Small 12px plus used inside soft "Add …" buttons. */
export function PlusSmall({ size = 12, color = '#111216' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <path d="M8 3.5v9M3.5 8h9" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Soft grey 28px action ("Add address", "Remove both"). */
export function SoftAction({ children, onClick, icon }: { children: ReactNode; onClick?: () => void; icon?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 cursor-pointer items-center gap-1.5 rounded-[8px] bg-fill px-[10px] text-[12.5px] font-medium leading-4 text-ink transition-colors hover:bg-[#ECECE9]"
    >
      {icon && <PlusSmall />}
      {children}
    </button>
  )
}

/** White outlined 30px action ("Behavioural profile", "Type it in"). */
export function OutlineAction({
  children,
  onClick,
  trailing,
  raised = true,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  trailing?: ReactNode
  raised?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-white px-3 text-[12.5px] font-medium leading-4 text-ink transition-colors hover:bg-fill-hover',
        raised ? 'shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D]' : 'shadow-[inset_0_0_0_1px_#E4E4E1]',
        className,
      )}
    >
      {children}
      {trailing}
    </button>
  )
}

export function ChevronRightSmall({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="#111216" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
