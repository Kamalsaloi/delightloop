/**
 * Inspector building blocks (config-panel look from Paper B2a–B7a), laid out for PanelFrame:
 * header pinned, sections scroll, footer pinned.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useDismiss } from '@/canvas/StepMenu'
import { cn } from '@/lib/cn'

export const CHECK_ICON = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const PEN_ICON = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M10.5 3 13 5.5 6 12.5 3 13l.5-3z" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

const closeGlyph = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4 4l8 8M12 4l-8 8" stroke="#55575F" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" aria-label="Close" data-testid="panel-close" onClick={onClick} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-fill hover:bg-[#ECECE9]">
      {closeGlyph}
    </button>
  )
}

export function KitHeader({ media, title, subtitle, onClose, border = true }: { media: ReactNode; title: ReactNode; subtitle: ReactNode; onClose: () => void; border?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 px-6 pb-[18px] pt-[22px]', border && 'border-b border-line-soft')}>
      {media}
      <div className="flex min-w-0 grow basis-0 flex-col gap-0.5">
        <span className="truncate text-[16px] font-semibold leading-5 text-ink">{title}</span>
        <span className="truncate text-[12.5px] leading-4 text-grey-3">{subtitle}</span>
      </div>
      <CloseButton onClick={onClose} />
    </div>
  )
}

/** 40px header tile, radius 10. */
export function HeaderTile({ children, tone = 'white' }: { children: ReactNode; tone?: 'white' | 'linkedin' | 'green' }) {
  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center',
        tone === 'linkedin' && 'rounded-[10px] bg-linkedin text-[17px] font-bold leading-[18px] text-white',
        tone === 'white' && 'rounded-[10px] bg-white shadow-[inset_0_0_0_1px_#E4E4E1]',
        tone === 'green' && 'rounded-full bg-green',
      )}
    >
      {children}
    </span>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-semibold leading-4 text-ink">{children}</span>
}
export function Note({ children, tone = 'grey', className }: { children: ReactNode; tone?: 'grey' | 'amber'; className?: string }) {
  return <span className={cn('text-[12px] leading-4', tone === 'amber' ? 'text-amber-text' : 'text-grey-3', className)}>{children}</span>
}

export function Section({ title, meta, gap = 8, children, className, last }: { title?: ReactNode; meta?: ReactNode; gap?: number; children: ReactNode; className?: string; last?: boolean }) {
  return (
    <div className={cn('flex flex-col px-6 py-[18px]', !last && 'border-b border-line-soft', className)} style={{ gap }}>
      {title != null &&
        (meta != null ? (
          <div className="flex items-center justify-between">
            <SectionTitle>{title}</SectionTitle>
            <span className="text-[12px] leading-4 text-grey-3">{meta}</span>
          </div>
        ) : (
          <SectionTitle>{title}</SectionTitle>
        ))}
      {children}
    </div>
  )
}

export function Row({ title, note, control, last }: { title: ReactNode; note?: ReactNode; control: ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 px-6 py-[18px]', !last && 'border-b border-line-soft')}>
      <div className="flex flex-col gap-0.5">
        <SectionTitle>{title}</SectionTitle>
        {note && <Note>{note}</Note>}
      </div>
      {control}
    </div>
  )
}

export function Footer({ onRemove, removeLabel = 'Remove step', left, children }: { onRemove?: () => void; removeLabel?: string; left?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-line-soft px-6 pb-5 pt-4">
      {left ??
        (onRemove ? (
          <button type="button" data-testid="remove-step" onClick={onRemove} className="cursor-pointer whitespace-nowrap text-[13px] font-medium leading-4 text-[#C2410C] underline-offset-2 hover:underline">
            {removeLabel}
          </button>
        ) : (
          <span />
        ))}
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

/** Violet save button with a leading check; flashes "Saved" then calls onSaved. */
export function SaveButton({ children, onSaved, disabled, testId = 'save-step' }: { children: ReactNode; onSaved: () => void; disabled?: boolean; testId?: string }) {
  const [saved, setSaved] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={() => {
        if (saved) return
        setSaved(true)
        timer.current = window.setTimeout(onSaved, 450)
      }}
      className="flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[10px] bg-violet px-[18px] text-[13.5px] font-semibold leading-4 text-white shadow-[inset_0_0_0_1px_#5547E6,inset_0_1px_0_#FFFFFF2E] hover:bg-[#5A4EF0] active:bg-[#5145E8] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {CHECK_ICON}
      {saved ? 'Saved' : children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, testId }: { children: ReactNode; onClick?: () => void; testId?: string }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className="flex h-10 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[10px] bg-white px-[14px] text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover"
    >
      {children}
    </button>
  )
}

// ── Controls ────────────────────────────────────────────────────────────────

export type Option<T extends string> = { value: T; label: ReactNode; grow?: number }

export function Segmented<T extends string>({ options, value, onChange, size = 'md', className }: { options: Option<T>[]; value: T; onChange: (v: T) => void; size?: 'sm' | 'md'; className?: string }) {
  const md = size === 'md'
  return (
    <div role="tablist" className={cn('flex gap-0.5 bg-fill p-0.5', md ? 'rounded-[10px]' : 'rounded-[8px]', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex cursor-pointer items-center justify-center whitespace-nowrap leading-4 transition-colors',
              md ? 'h-8 basis-0 rounded-[8px] px-2 text-[12.5px]' : 'h-[26px] rounded-[6px] px-[10px] text-[12px]',
              active ? 'bg-white font-semibold text-ink' : 'font-medium text-grey-2 hover:text-ink',
              active && (md ? 'shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_#1112160F]' : 'shadow-[0_0_0_1px_#E4E4E1]'),
            )}
            style={md ? { flexGrow: o.grow ?? 1 } : undefined}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function RadioList<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" className="flex flex-col gap-0.5">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            type="button"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn('flex h-[34px] shrink-0 cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] text-left', on ? 'bg-[#F6F5FE]' : 'hover:bg-fill-hover')}
          >
            <span className={cn('h-4 w-4 shrink-0 rounded-full transition-shadow', on ? 'shadow-[inset_0_0_0_4.5px_#6559F7]' : 'shadow-[inset_0_0_0_1.5px_#D4D4D0]')} />
            <span className={cn('grow basis-0 text-[13px] leading-4', on ? 'font-medium text-ink' : 'text-[#33353C]')}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn('flex h-5 w-[34px] shrink-0 cursor-pointer items-center rounded-[10px] p-0.5 transition-colors', on ? 'justify-end bg-violet' : 'justify-start bg-[#DCDCD8]')}
    >
      <span className="h-4 w-4 shrink-0 rounded-full bg-white shadow-[0_1px_2px_#11121633]" />
    </button>
  )
}

const chevron = (size: number) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M4 6l4 4 4-4" stroke="#8B8D95" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Select with a small popover list. `field` = full width 36px; `pill` = compact 32px. */
export function Select<T extends string>({ options, value, onChange, variant = 'field', render }: { options: T[]; value: T; onChange: (v: T) => void; variant?: 'field' | 'pill'; render?: (v: T) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  useDismiss(ref, open ? () => setOpen(false) : undefined)
  const field = variant === 'field'
  return (
    <div ref={ref} className={cn('relative', field ? 'w-full' : 'shrink-0')}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2 bg-white text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
          field ? 'h-9 justify-between rounded-[10px] px-3 text-[13px] leading-4' : 'h-8 gap-1.5 rounded-[9px] px-[10px] text-[12.5px] font-medium leading-4',
          open && 'shadow-[inset_0_0_0_1.5px_#6559F7]',
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">{render ? render(value) : value}</span>
        {chevron(field ? 11 : 10)}
      </button>
      {open && (
        <div className={cn('absolute top-[calc(100%+4px)] z-20 flex flex-col gap-0.5 rounded-[10px] bg-white p-1 shadow-[0_0_0_1px_#EBEBE8,0_8px_24px_-8px_#11121630]', field ? 'inset-x-0' : 'right-0 min-w-[160px]')}>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className={cn('flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[7px] px-2.5 text-left text-[12.5px] leading-4 hover:bg-page', o === value ? 'font-semibold text-ink' : 'text-grey-1')}
            >
              {render ? render(o) : o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** "first name" merge token. */
export function Token({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-[22px] items-center rounded-[5px] bg-[#EFECFF] px-1.5 align-middle text-[12.5px] font-medium leading-4 text-[#4B3FD9]">{children}</span>
}

/** Small grey Gifty pill: "Ask Gifty to write it" when empty, "Ask Gifty to rewrite" otherwise. */
export function GiftyWriteButton({ empty, busy, onClick, white }: { empty: boolean; busy: boolean; onClick: () => void; white?: boolean }) {
  return (
    <button
      type="button"
      data-testid="gifty-write"
      disabled={busy}
      onClick={onClick}
      className={cn(
        'flex h-[26px] shrink-0 cursor-pointer items-center rounded-[7px] px-[9px] text-[12px] font-medium leading-4 text-ink disabled:cursor-default',
        white ? 'bg-white shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover' : 'bg-fill hover:bg-[#ECECE9]',
        busy && 'shimmer-text',
      )}
    >
      {busy ? 'Gifty is writing…' : empty ? 'Ask Gifty to write it' : 'Ask Gifty to rewrite'}
    </button>
  )
}

/** Textarea that grows with its text. */
export function AutoText({ value, onChange, placeholder, className, maxLength, testId }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; maxLength?: number; testId?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      data-testid={testId}
      value={value}
      maxLength={maxLength}
      rows={1}
      spellCheck={false}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn('block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-grey-3', className)}
    />
  )
}

/** Violet-ringed editor: "Hi {first name}," then the message, then a toolbar row. */
export function MessageBox({ value, onChange, placeholder, footer, signoff, testId }: { value: string; onChange: (v: string) => void; placeholder: string; footer: ReactNode; signoff?: string; testId?: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-[12px] p-[14px] shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[13.5px] leading-[22px] text-ink">Hi</span>
        <Token>first name</Token>
        <span className="text-[13.5px] leading-[22px] text-ink">,</span>
      </div>
      <AutoText testId={testId} value={value} onChange={onChange} placeholder={placeholder} className="min-h-[42px] text-[13.5px] leading-[21px] text-ink" />
      {signoff && <span className="text-[13.5px] leading-[21px] text-ink">{signoff}</span>}
      <div className="flex items-center justify-between border-t border-line-soft pt-[10px]">{footer}</div>
    </div>
  )
}
