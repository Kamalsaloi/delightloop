import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { G } from './glyphs'

type ToolAction = 'edit' | 'copy' | 'delete'

/** Floating vertical toolbar beside the selected step: edit / duplicate / delete. */
export function StepToolbar({
  active = 'edit',
  onEdit,
  onCopy,
  onDelete,
  className,
}: {
  active?: ToolAction | null
  onEdit?: () => void
  onCopy?: () => void
  onDelete?: () => void
  className?: string
}) {
  const tools: { id: ToolAction; label: string; glyph: ReactNode; on?: () => void }[] = [
    { id: 'edit', label: 'Edit step', glyph: G.editTool(active === 'edit' ? '#111216' : '#55575F'), on: onEdit },
    { id: 'copy', label: 'Duplicate step', glyph: G.copyTool(), on: onCopy },
    { id: 'delete', label: 'Delete step', glyph: G.deleteTool(), on: onDelete },
  ]
  return (
    <div className={cn('flex flex-col gap-1 rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A]', className)}>
      {tools.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.label}
          aria-label={t.label}
          onClick={(e) => {
            e.stopPropagation()
            t.on?.()
          }}
          className={cn(
            'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-colors',
            active === t.id ? 'bg-fill' : t.id === 'delete' ? 'hover:bg-[#FDF0EE]' : 'hover:bg-fill',
          )}
        >
          {t.glyph}
        </button>
      ))}
    </div>
  )
}

/** Gifty's presence cursor: violet arrow + name tag. */
export function GiftyCursor({ label = 'Gifty', className, style }: { label?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn('pointer-events-none flex flex-col items-start', className)} style={style}>
      {G.cursor()}
      <span className="inline-block rounded-[8px] rounded-tl-[4px] bg-violet px-2 py-1 text-[12px] font-medium leading-4 text-white">{label}</span>
    </div>
  )
}

/** Small white annotation card ("Skipped by a loop rule…"). Position it with className/style or StepCard's `hint`. */
export function HintCard({
  title,
  children,
  width = 212,
  onClick,
  className,
  style,
}: {
  title: ReactNode
  children?: ReactNode
  width?: number
  onClick?: () => void
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      onClick={(e) => {
        if (!onClick) return
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex flex-col gap-0.5 rounded-[10px] bg-white px-3 py-[10px] shadow-[0_0_0_1px_#EBEBE8,0_4px_12px_#11121614,0_1px_2px_#1112160A]',
        onClick && 'cursor-pointer hover:shadow-[0_0_0_1px_#DADAD5,0_4px_12px_#1112161A,0_1px_2px_#1112160A]',
        className,
      )}
      style={{ width, ...style }}
    >
      <span className="text-[12.5px] font-semibold leading-4 text-ink">{title}</span>
      {children && <span className="text-[12px] leading-4 text-grey-2">{children}</span>}
    </div>
  )
}

export const ZOOM_STEPS = [50, 75, 90, 100, 110, 125, 150]

/** Bottom-left zoom control: − 100% + | fit. Controlled; `value` is a percentage. */
export function ZoomControl({ value = 100, onChange, className }: { value?: number; onChange?: (v: number) => void; className?: string }) {
  const i = ZOOM_STEPS.indexOf(value)
  const step = (d: number) => {
    const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, (i < 0 ? 3 : i) + d))]
    onChange?.(next)
  }
  const btn = 'flex h-7 w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] hover:bg-fill disabled:cursor-default disabled:opacity-40'
  return (
    <div
      className={cn(
        'relative flex items-center gap-0.5 self-start rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_#EBEBE8,0_8px_20px_-14px_#11121640]',
        className,
      )}
    >
      <button type="button" aria-label="Zoom out" className={btn} onClick={() => step(-1)} disabled={i === 0}>
        {G.minus()}
      </button>
      <span className="w-11 px-1.5 text-center text-[12.5px] font-medium leading-4 text-ink">{value}%</span>
      <button type="button" aria-label="Zoom in" className={btn} onClick={() => step(1)} disabled={i === ZOOM_STEPS.length - 1}>
        {G.plus()}
      </button>
      <span className="h-4 w-px shrink-0 bg-line" />
      <button type="button" aria-label="Fit to screen" className={btn} onClick={() => onChange?.(100)}>
        {G.fit()}
      </button>
    </div>
  )
}
