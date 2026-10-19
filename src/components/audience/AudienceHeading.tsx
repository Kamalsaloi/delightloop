import { cn } from '@/lib/cn'
import { HubSpotDot } from './marks'

type Props = {
  title: string
  source: string
  linkLabel: string
  /** Chevron points up when the linked section is open. */
  linkOpen?: boolean
  onLink: () => void
  onAddPeople?: () => void
}

/** Page title, HubSpot source line with a toggle link, and "Add people". */
export function AudienceHeading({ title, source, linkLabel, linkOpen, onLink, onAddPeople }: Props) {
  return (
    <div className="flex items-end justify-between">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">{title}</h1>
        <div className="flex items-center gap-2">
          <HubSpotDot />
          <span className="text-[14px] leading-5 text-grey-2">{source}</span>
          <button onClick={onLink} className="flex cursor-pointer items-center gap-1 text-[14px] font-medium leading-5 text-violet-link">
            {linkLabel}
            <svg width="10" height="10" viewBox="0 0 16 16" className={cn('transition-transform', linkOpen && 'rotate-180')}>
              <path d="M4 6l4 4 4-4" fill="none" stroke="#5A3FE6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <button
        onClick={onAddPeople}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-[10px] bg-white px-3 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover"
      >
        <svg width="14" height="14" viewBox="0 0 16 16">
          <path d="M8 3v10M3 8h10" fill="none" stroke="#111216" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Add people
      </button>
    </div>
  )
}

/** Top-bar primary for audience pages. `secondary` drops it to white while a panel owns the primary. */
export function HeaderPrimary({ onClick, label, disabled, secondary, hint }: { onClick?: () => void; label: string; disabled?: boolean; secondary?: boolean; hint?: string }) {
  const white = secondary || disabled
  return (
    <button
      type="button"
      data-testid="audience-primary"
      title={disabled ? hint : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-10 items-center gap-2 rounded-[10px] px-4 text-[13px] font-semibold leading-4 transition-colors',
        disabled && 'cursor-not-allowed bg-[#EDEDEA] text-[#9C9DA5]',
        !disabled && secondary && 'cursor-pointer bg-white text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover',
        !disabled && !secondary && 'cursor-pointer bg-violet text-white shadow-primary hover:bg-[#5A4EF0]',
      )}
    >
      {label}
      <svg width="13" height="13" viewBox="0 0 16 16" className="shrink-0">
        <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" fill="none" stroke={white ? (disabled ? '#9C9DA5' : '#111216') : '#fff'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
