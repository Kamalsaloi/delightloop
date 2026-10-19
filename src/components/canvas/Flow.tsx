import type { CSSProperties, ReactNode } from 'react'
import { AvatarStack, HubSpotMark } from '@/components/ui'
import { FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { G } from './glyphs'

const LINE = '#CFCFD6'

/** Vertical connector between flow nodes. */
export function FlowLine({ h = 16, className }: { h?: number; className?: string }) {
  return <div className={cn('w-[1.5px] shrink-0', className)} style={{ height: h, background: LINE }} />
}

/** Top-of-flow audience pill: HubSpot mark, count, source, faces. */
export function AudiencePill({
  count = '48 VP Sales',
  source = 'found by Gifty in HubSpot',
  faces = [FACE.f3, FACE.f4, FACE.f5],
  icon = <HubSpotMark size={24} />,
  onClick,
}: {
  count?: ReactNode
  source?: ReactNode
  faces?: string[]
  icon?: ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-2 shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A]',
        onClick && 'cursor-pointer hover:shadow-[0_0_0_1px_#DCDCD8,0_1px_2px_#1112160A]',
      )}
    >
      {icon}
      <span className="text-[13.5px] font-semibold leading-4 text-ink">{count}</span>
      <span className="text-[13px] leading-4 text-grey-3">{source}</span>
      {faces.length > 0 && <AvatarStack ids={faces} size={24} step={16} />}
    </div>
  )
}

/** "After 2 weekdays · Opened the email?" wait/check pill. */
export function ConditionPill({
  lead = 'After 2 weekdays',
  question = 'Opened the email?',
  icon = G.arrowUpRight(),
  selected,
  onClick,
}: {
  lead?: ReactNode
  question?: ReactNode
  icon?: ReactNode
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex h-8 shrink-0 items-center gap-2 rounded-full px-4',
        // Selected (B2a): white with a violet ring and glow.
        selected ? 'bg-white shadow-[0_0_0_1.5px_#6559F7,0_4px_12px_-4px_#6559F740]' : 'bg-[#ECECF1]',
        onClick && !selected && 'cursor-pointer hover:bg-[#E5E5EB]',
        onClick && selected && 'cursor-pointer',
      )}
    >
      {icon}
      <span className="text-[13px] leading-4 text-grey-2">{lead}</span>
      <span className="text-[13px] font-semibold leading-4 text-[#2A2B36]">{question}</span>
    </div>
  )
}

export type BranchTone = 'green' | 'red' | 'neutral'
const BRANCH_BG: Record<BranchTone, string> = { green: 'bg-green', red: 'bg-[#E5484D]', neutral: 'bg-grey-3' }

/** Solid green/red pill that heads a branch column. */
export function BranchLabel({ tone = 'green', children }: { tone?: BranchTone; children: ReactNode }) {
  return (
    <span className={cn('inline-block rounded-full px-3 py-1 text-[12px] font-semibold leading-4 text-white', BRANCH_BG[tone])}>
      {children}
    </span>
  )
}

export type Branch = { label: ReactNode; tone?: BranchTone; node: ReactNode }

/** Two-way split: rounded connector, labelled columns, optional merge back into one line. */
export function Branches({
  left,
  right,
  merge = true,
  width = 592,
  column = 280,
  gap = 32,
}: {
  left: Branch
  right: Branch
  merge?: boolean
  width?: number
  column?: number
  gap?: number
}) {
  const inset = column / 2 // connectors land on column centres
  const border = `1.5px solid ${LINE}`
  return (
    <div className="flex shrink-0 flex-col" style={{ width }}>
      <div className="flex justify-center" style={{ paddingInline: inset }}>
        <div className="h-6 grow rounded-t-[16px]" style={{ borderTop: border, borderLeft: border, borderRight: border }} />
      </div>
      <div className="flex" style={{ gap }}>
        {[left, right].map((b, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center" style={{ width: column }}>
            <BranchLabel tone={b.tone ?? (i === 0 ? 'green' : 'red')}>{b.label}</BranchLabel>
            <FlowLine h={8} />
            {b.node}
          </div>
        ))}
      </div>
      {merge && (
        <div className="flex" style={{ paddingInline: inset }}>
          <div className="h-6 grow rounded-b-[16px]" style={{ borderBottom: border, borderLeft: border, borderRight: border }} />
        </div>
      )}
    </div>
  )
}

/** Green end-of-flow goal pill. `selected` = white gap + violet ring (B7a). */
export function GoalPill({ children = 'Goal · a meeting booked', onClick, selected }: { children?: ReactNode; onClick?: () => void; selected?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex h-8 shrink-0 items-center gap-2 rounded-full bg-[#1F9D61] px-4',
        selected ? 'shadow-[0_0_0_2px_#FFFFFF,0_0_0_3.5px_#6559F7]' : 'shadow-[inset_0_0_0_1px_#198A54]',
        onClick && 'cursor-pointer hover:bg-[#1C935A]',
      )}
    >
      {G.flag()}
      <span className="text-[13px] font-semibold leading-4 text-white">{children}</span>
    </div>
  )
}

/** 688-wide row: 184px side slots (toolbar left, cursor/annotation right) around a centred node. */
export function StepRow({ left, right, children }: { left?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex w-[688px] shrink-0 items-center">
      <div className="flex w-[184px] shrink-0 justify-end pr-4">{left}</div>
      {children}
      <div className="flex w-[184px] shrink-0 pl-4">{right}</div>
    </div>
  )
}

/** White pill with violet ring: "+ Add step". */
export function AddStepButton({ children = 'Add step', onClick, className }: { children?: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 shadow-[0_0_0_1.5px_#6559F7] hover:bg-violet-soft',
        className,
      )}
    >
      {G.addStep()}
      <span className="text-[12.5px] font-semibold leading-4 text-violet-link">{children}</span>
    </button>
  )
}

/** Dashed violet placeholder where the next step will go (320×56). Usually holds an AddStepButton. */
export function EmptySlot({ children, width = 320, className, style }: { children?: ReactNode; width?: number; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn('relative flex h-14 shrink-0 items-center justify-center rounded-[16px] border-[1.5px] border-dashed border-violet bg-white/60', className)}
      style={{ width, ...style }}
    >
      {children}
    </div>
  )
}

/** Floating white menu shell used by the canvas step picker (368 wide, 8px padding). */
export function CanvasMenu({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn(
        'flex w-[368px] flex-col gap-1 rounded-[16px] bg-white p-2 shadow-[0_0_0_1px_#EBEBE8,0_2px_4px_#1112160A,0_24px_48px_-16px_#11121638]',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}
