import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { G } from './glyphs'

/** Right-rail panel: 384 wide, radius 20, panel shadow, 24px padding, 16px gap. `fill` = full rail height. */
export function Inspector({ children, fill, gap = 16, className }: { children: ReactNode; fill?: boolean; gap?: number; className?: string }) {
  return (
    <aside
      className={cn('flex w-[384px] flex-col overflow-clip rounded-card bg-white p-6 shadow-panel animate-[fade_.15s_ease-out]', fill && 'flex-1', className)}
      style={{ gap }}
    >
      {children}
    </aside>
  )
}

/** 32px soft square close button. */
export function InspectorClose({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-page hover:bg-fill"
    >
      {G.close()}
    </button>
  )
}

/** Media + title + subtitle, close on the right. */
export function InspectorHeader({ media, title, subtitle, onClose }: { media?: ReactNode; title: ReactNode; subtitle?: ReactNode; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {media}
        <div className="flex flex-col gap-0.5">
          <span className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-ink">{title}</span>
          {subtitle && <span className="text-[12.5px] leading-4 text-grey-3">{subtitle}</span>}
        </div>
      </div>
      {onClose && <InspectorClose onClick={onClose} />}
    </div>
  )
}

/** "‹ Back label" row with close, for drilled-in panel states. */
export function InspectorBack({ label, onBack, onClose }: { label: ReactNode; onBack?: () => void; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <button type="button" onClick={onBack} className="-ml-1 flex cursor-pointer items-center gap-1.5 rounded-[8px] py-1 pl-1 pr-2 hover:bg-fill">
        {G.back()}
        <span className="text-[13px] font-medium leading-4 text-grey-1">{label}</span>
      </button>
      {onClose && <InspectorClose onClick={onClose} />}
    </div>
  )
}

/** Underlined text tabs on a hairline. */
export function InspectorTabs<T extends string>({
  tabs,
  value,
  onChange,
  compact,
}: {
  tabs: { value: T; label: ReactNode }[]
  value: T
  onChange?: (v: T) => void
  /** 04's tighter tabs: 8px under 18px lines (default 12px under 16px). */
  compact?: boolean
}) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-line-soft">
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange?.(t.value)}
            className={cn(
              'cursor-pointer text-[13px]',
              compact ? 'pb-2 leading-[18px]' : 'pb-3 leading-4',
              active ? 'border-b-2 border-ink font-semibold text-ink' : 'font-medium text-grey-3 hover:text-grey-1',
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/** Section title row: bold title, optional grey meta, optional right action. */
export function PanelSection({
  title,
  meta,
  action,
  size = 'md',
  children,
  className,
}: {
  title: ReactNode
  meta?: ReactNode
  action?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  children?: ReactNode
  className?: string
}) {
  const titleCls = { sm: 'text-[12.5px] leading-4', md: 'text-[13.5px] leading-[18px]', lg: 'text-[14px] leading-5' }[size]
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className={cn('font-semibold text-ink', titleCls)}>{title}</span>
          {meta && <span className="text-[12px] leading-4 text-grey-3">{meta}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

/** Violet text action (12.5 medium). */
export function PanelLink({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn('cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline underline-offset-2', className)}>
      {children}
    </button>
  )
}

export type PanelSegment<T extends string> = { value: T; label: ReactNode; count?: ReactNode; countTone?: 'grey' | 'amber'; grow?: number }

/** Compact segmented control used inside panels (30px items, 3px track padding). */
export function PanelSegmented<T extends string>({ options, value, onChange }: { options: PanelSegment<T>[]; value: T; onChange?: (v: T) => void }) {
  return (
    <div role="tablist" className="flex gap-0.5 rounded-[10px] bg-fill p-[3px]">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange?.(o.value)}
            className={cn(
              'flex h-[30px] basis-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] px-[10px] text-[12.5px] leading-4 transition-colors',
              active ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160F]' : 'font-medium text-grey-2 hover:text-ink',
            )}
            style={{ flexGrow: o.grow ?? 1 }}
          >
            {o.label}
            {o.count != null && (
              <span className={cn(o.countTone === 'amber' ? 'font-medium text-amber-text' : 'font-normal text-grey-3')}>{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Found / missing bar (green + amber segments). */
export function ProgressSplit({ found, missing, gap = 3 }: { found: number; missing: number; gap?: number }) {
  return (
    <div className="flex h-1.5 shrink-0" style={{ gap }}>
      <div className="rounded-[3px] bg-green transition-[flex-grow] duration-300" style={{ flexGrow: found, flexBasis: 0 }} />
      {missing > 0 && <div className="rounded-[3px] bg-[#F2B544] transition-[flex-grow] duration-300" style={{ flexGrow: missing, flexBasis: 0 }} />}
    </div>
  )
}

/** Footer block: hairline, 16px top padding, 8px gap. */
export function InspectorFooter({ children, row }: { children: ReactNode; row?: boolean }) {
  return <div className={cn('flex gap-2 border-t border-line-soft pt-4', row ? 'flex-row' : 'flex-col')}>{children}</div>
}

/** Full-width 44px primary with a check (e.g. "Save gift step"). */
export function SaveButton({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-11 grow cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-violet text-[14px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0] active:bg-[#5145E8]',
        className,
      )}
    >
      {G.check()}
      {children}
    </button>
  )
}

/** White 44px secondary with inset hairline (e.g. "Send me a test"). */
export function PanelSecondaryButton({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-white px-4 text-[13.5px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Small white button with inset hairline (Replace, Replace for all 12…). */
export function MiniButton({ children, leading, onClick, className }: { children: ReactNode; leading?: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        'flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-white px-[10px] py-1.5 text-[12.5px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
        className,
      )}
    >
      {leading}
      {children}
    </button>
  )
}

/** Floating row action (white frame, grey inner pill), e.g. "⇄ Change gift" on hovered rows. */
export function RowAction({ children, icon = G.swap(), onClick }: { children: ReactNode; icon?: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="flex cursor-pointer items-center gap-0.5 rounded-[10px] bg-white p-0.5 shadow-[0_0_0_1px_#E4E4E1,0_4px_8px_-4px_#1112161F]"
    >
      <span className="flex h-7 items-center gap-1.5 rounded-[8px] bg-fill px-[10px] hover:bg-[#ECECE9]">
        {icon}
        <span className="whitespace-nowrap text-[12.5px] font-medium leading-4 text-ink">{children}</span>
      </span>
    </button>
  )
}
