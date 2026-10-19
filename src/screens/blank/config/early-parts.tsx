/**
 * Sectioned config panel pieces for B2a–B4a (check, LinkedIn, bump).
 * Paper: 384 wide, radius 20, hairline + soft drop, full-width hairline between sections.
 */
import { useRef, useState, type ReactNode } from 'react'
import { useDismiss } from '@/screens/blank/build/shared'
import { cn } from '@/lib/cn'

// ── Shell ───────────────────────────────────────────────────────────────────

/** Natural height (shrink-0 so a tall panel runs past the rail like Paper, not squashed). */
export function ConfigPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="flex w-[384px] shrink-0 flex-col rounded-card bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_20px_48px_-24px_#1112162E] animate-[fade_.15s_ease-out]">
      {children}
    </aside>
  )
}

const closeGlyph = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4 4l8 8M12 4l-8 8" stroke="#55575F" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export function ConfigHeader({ media, title, subtitle, onClose }: { media: ReactNode; title: string; subtitle: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-line-soft px-6 pb-[18px] pt-[22px]">
      {media}
      <div className="flex grow basis-0 flex-col gap-0.5">
        <span className="text-[16px] font-semibold leading-5 text-ink">{title}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">{subtitle}</span>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-fill hover:bg-[#ECECE9]"
      >
        {closeGlyph}
      </button>
    </div>
  )
}

/** 40px header tile, radius 10. `tone="linkedin"` = blue "in". */
export function HeaderTile({ children, tone = 'white' }: { children: ReactNode; tone?: 'white' | 'linkedin' }) {
  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]',
        tone === 'linkedin' ? 'bg-linkedin text-[17px] font-bold leading-[18px] text-white' : 'bg-white shadow-[inset_0_0_0_1px_#E4E4E1]',
      )}
    >
      {children}
    </span>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-semibold leading-4 text-ink">{children}</span>
}

export function SectionNote({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('text-[12px] leading-4 text-grey-3', className)}>{children}</span>
}

/** Padded section with a hairline under it. `title` renders the 13px heading. */
export function ConfigSection({ title, gap = 8, children, className }: { title?: ReactNode; gap?: number; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col border-b border-line-soft px-6 py-[18px]', className)} style={{ gap }}>
      {title != null && <SectionTitle>{title}</SectionTitle>}
      {children}
    </div>
  )
}

/** Title + note on the left, a control on the right. */
export function ConfigRow({ title, note, control }: { title: ReactNode; note: ReactNode; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft px-6 py-[18px]">
      <div className="flex flex-col gap-0.5">
        <SectionTitle>{title}</SectionTitle>
        <SectionNote>{note}</SectionNote>
      </div>
      {control}
    </div>
  )
}

// ── Footer ──────────────────────────────────────────────────────────────────

export function ConfigFooter({ removeLabel, onRemove, children }: { removeLabel: string; onRemove?: () => void; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 pb-5 pt-4">
      <button type="button" onClick={onRemove} className="cursor-pointer text-[13px] font-medium leading-4 text-[#C2410C] hover:underline underline-offset-2">
        {removeLabel}
      </button>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

export function ConfigPrimary({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-[18px] text-[13.5px] font-semibold leading-4 text-white shadow-[inset_0_0_0_1px_#5547E6,inset_0_1px_0_#FFFFFF2E] hover:bg-[#5A4EF0] active:bg-[#5145E8]"
    >
      {children}
    </button>
  )
}

export function ConfigSecondary({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 cursor-pointer items-center rounded-[10px] bg-white px-[14px] text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover"
    >
      {children}
    </button>
  )
}

/** Briefly flips a label after a click ("Test sent"). */
export function useFlash(ms = 1600) {
  const [on, setOn] = useState(false)
  function flash() {
    setOn(true)
    window.setTimeout(() => setOn(false), ms)
  }
  return [on, flash] as const
}

// ── Controls ────────────────────────────────────────────────────────────────

export type Option<T extends string> = { value: T; label: ReactNode; grow?: number }

/** Grey track segmented control. `size="md"` = 32px items (wait units, send-as); `sm` = 26px (note on/off). */
export function ConfigSegmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  className?: string
}) {
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
              md ? 'h-8 basis-0 rounded-[8px] text-[12.5px]' : 'h-[26px] rounded-[6px] px-[10px] text-[12px]',
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

/** Radio rows: selected = soft violet fill + thick violet ring dot. */
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
            className={cn(
              'flex h-[34px] shrink-0 cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] text-left',
              on ? 'bg-[#F6F5FE]' : 'hover:bg-fill-hover',
            )}
          >
            <span
              className={cn(
                'h-4 w-4 shrink-0 rounded-full transition-shadow',
                on ? 'shadow-[inset_0_0_0_4.5px_#6559F7]' : 'shadow-[inset_0_0_0_1.5px_#D4D4D0]',
              )}
            />
            <span className={cn('grow basis-0 text-[13px] leading-4', on ? 'font-medium text-ink' : 'text-[#33353C]')}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function ConfigToggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
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

/**
 * Select with a small popover list. `variant="field"` = full-width 36px input (send window);
 * `variant="pill"` = compact 32px button (after 3 days).
 */
export function ConfigSelect({
  options,
  value,
  onChange,
  variant = 'field',
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  variant?: 'field' | 'pill'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  useDismiss(ref, open ? () => setOpen(false) : undefined)
  const field = variant === 'field'

  function pick(v: string) {
    onChange(v)
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn('relative', field ? 'w-full' : 'shrink-0')}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full cursor-pointer items-center bg-white text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
          field ? 'h-9 justify-between rounded-[10px] px-3 text-[13px] leading-4' : 'h-8 gap-1.5 rounded-[9px] px-[10px] text-[12.5px] font-medium leading-4',
          open && 'shadow-[inset_0_0_0_1.5px_#6559F7]',
        )}
      >
        {value}
        {chevron(field ? 11 : 10)}
      </button>
      {open && (
        <div
          className={cn(
            'absolute top-[calc(100%+4px)] z-20 flex flex-col gap-0.5 rounded-[10px] bg-white p-1 shadow-[0_0_0_1px_#EBEBE8,0_8px_24px_-8px_#11121630]',
            field ? 'inset-x-0' : 'right-0 min-w-[140px]',
          )}
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => pick(o)}
              className={cn(
                'flex h-8 cursor-pointer items-center whitespace-nowrap rounded-[7px] px-2.5 text-left text-[12.5px] leading-4 hover:bg-page',
                o === value ? 'font-semibold text-ink' : 'text-grey-1',
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** "first name" merge token in the note / bump editors (22px tall, radius 5). */
export function NoteToken({ children }: { children: ReactNode }) {
  return (
    <span contentEditable={false} className="inline-flex h-[22px] items-center rounded-[5px] bg-[#EFECFF] px-1.5 align-middle text-[12.5px] font-medium leading-4 text-[#4B3FD9]">
      {children}
    </span>
  )
}

/** Small grey "Ask Gifty to rewrite" pill (26px). */
export function RewriteButton({ onClick, busy }: { onClick?: () => void; busy?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[26px] cursor-pointer items-center rounded-[7px] bg-fill px-[9px] text-[12px] font-medium leading-4 text-ink hover:bg-[#ECECE9]"
    >
      {busy ? 'Rewriting…' : 'Ask Gifty to rewrite'}
    </button>
  )
}

/** Violet-ringed editor box: "Hi {first name}," then editable body paragraphs, then a footer row. */
export function NoteEditor({
  paragraphs,
  onChange,
  gap,
  footer,
}: {
  paragraphs: string[]
  /** Called with the plain text of the editable body. */
  onChange?: (text: string) => void
  gap: number
  footer: ReactNode
}) {
  return (
    <div className="flex flex-col rounded-[12px] p-[14px] shadow-[inset_0_0_0_1.5px_#6559F7]" style={{ gap }}>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[13.5px] leading-[22px] text-ink">Hi</span>
        <NoteToken>first name</NoteToken>
        <span className="text-[13.5px] leading-[22px] text-ink">,</span>
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange?.(e.currentTarget.innerText)}
        className="flex flex-col text-[13.5px] leading-[21px] text-ink outline-none"
        style={{ gap }}
      >
        {paragraphs.map((p) => (
          <div key={p}>{p}</div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-line-soft pt-[10px]">{footer}</div>
    </div>
  )
}
