/**
 * Panel pieces for the B5a–B7a config panels (postcard, goal): a 384 card split into hairline sections.
 *
 *   ConfigPanel { children }                      white card, radius 20
 *   ConfigHeader { media, title, subtitle, onClose }
 *   ConfigSection { title?, meta?, gap=8, row?, children }   18/24 padding, hairline under
 *   ConfigFooter { children, end? }               16/20 padding, no hairline
 *   SaveStepButton { onSaved, children }          40px primary; confirms "Saved", then calls onSaved
 *   TrackSegmented { options, value, onChange }   2px grey track, 32px items
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

const PANEL_SHADOW = 'shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_20px_48px_-24px_#1112162E]'

export function ConfigPanel({ children }: { children: ReactNode }) {
  return <aside className={cn('flex w-[384px] flex-col rounded-[20px] bg-white animate-[fade_.15s_ease-out]', PANEL_SHADOW)}>{children}</aside>
}

export function ConfigClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-fill hover:bg-[#ECECE9]"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" stroke="#55575F" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}

export function ConfigHeader({ media, title, subtitle, onClose }: { media: ReactNode; title: ReactNode; subtitle: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-line-soft px-6 pb-[18px] pt-[22px]">
      {media}
      <div className="flex grow basis-0 flex-col gap-0.5">
        <span className="text-[16px] font-semibold leading-5 text-ink">{title}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">{subtitle}</span>
      </div>
      <ConfigClose onClick={onClose} />
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-semibold leading-4 text-ink">{children}</span>
}

export function ConfigSection({
  title,
  meta,
  gap = 8,
  className,
  children,
}: {
  title?: ReactNode
  meta?: ReactNode
  gap?: number
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex flex-col border-b border-line-soft px-6 py-[18px]', className)} style={{ gap }}>
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

export function ConfigFooter({ children, end }: { children: ReactNode; end?: boolean }) {
  return <div className={cn('flex items-center px-6 pb-5 pt-4', end ? 'justify-end' : 'justify-between')}>{children}</div>
}

/** "Save step" primary: shows a short "Saved" confirmation, then hands back (closes the panel). */
export function SaveStepButton({ children, onSaved }: { children: ReactNode; onSaved: () => void }) {
  const [saved, setSaved] = useState(false)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function save() {
    if (saved) return
    setSaved(true)
    timer.current = window.setTimeout(onSaved, 650)
  }

  return (
    <button
      type="button"
      onClick={save}
      className="flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] bg-violet px-[18px] text-[13.5px] font-semibold leading-4 text-white shadow-[inset_0_0_0_1px_#5547E6,inset_0_1px_0_#FFFFFF2E] hover:bg-[#5A4EF0] active:bg-[#5145E8]"
    >
      {saved && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {saved ? 'Saved' : children}
    </button>
  )
}

export function TrackSegmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="tablist" className="flex gap-0.5 rounded-[10px] bg-fill p-0.5">
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
              'flex h-8 grow basis-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-[8px] text-[12.5px] leading-4 transition-colors',
              active ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_#1112160F]' : 'font-medium text-grey-2 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
