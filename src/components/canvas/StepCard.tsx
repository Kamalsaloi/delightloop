import type { ReactNode } from 'react'
import { GmailTile } from '@/components/ui'
import { asset, CREAM, designUrl, FACE, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { G } from './glyphs'

// ── Icon slots ──────────────────────────────────────────────────────────────

export { GmailTile }

/** LinkedIn step icon: 40px blue tile, radius 12. */
export function LinkedInTile({ size = 40 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-[12px] bg-linkedin" style={{ width: size, height: size }}>
      {G.linkedin(Math.round(size * 0.45))}
    </span>
  )
}

/** Postcard thumbnail, 56×40. `design`: asset id or data URL; null = plain cream card. */
export function PostcardThumb({ design = GIFT.postcard }: { design?: string | null }) {
  const src = designUrl(design)
  return (
    <span
      className="h-10 w-14 shrink-0 rounded-[8px] bg-cover bg-center shadow-[0_0_0_1px_#EBEBE8]"
      style={src ? { backgroundImage: `url(${src})` } : { backgroundColor: CREAM }}
    />
  )
}

/** Overlapping gift tiles (first id on top), 40px each, 21px apart. */
export function GiftStack({ ids = [GIFT.g1, GIFT.g2, GIFT.g3, GIFT.g4], size = 40, step = 21.34 }: { ids?: string[]; size?: number; step?: number }) {
  return (
    <span className="relative shrink-0" style={{ width: Math.round(size + step * (ids.length - 1)), height: size }}>
      {ids
        .map((id, i) => (
          <span
            key={id + i}
            className="absolute top-0 rounded-[10px] border-2 border-white bg-cover bg-center"
            style={{ left: Math.round(i * step), width: size, height: size, backgroundImage: `url(${asset(id)})` }}
          />
        ))
        .reverse()}
    </span>
  )
}

/** Small square marker after a title: the step has a loop rule. `active` = rule annotation showing. */
export function RuleMarker({ active, onClick }: { active?: boolean; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      title="Has a loop rule"
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px]',
        active ? 'bg-[#ECECF1] shadow-[inset_0_0_0_1px_#DCDCE3]' : 'bg-fill',
        onClick && 'cursor-pointer',
      )}
    >
      {G.rule(active ? '#55575F' : '#6E6F7C')}
    </span>
  )
}

// ── Footer pieces ───────────────────────────────────────────────────────────

export type StepChipTone = 'neutral' | 'muted' | 'green' | 'amber' | 'violet' | 'red'
const CHIP: Record<StepChipTone, string> = {
  neutral: 'bg-fill text-ink',
  muted: 'bg-fill text-grey-1',
  green: 'bg-[#EAF5EF] text-green-text',
  amber: 'bg-amber-bg text-amber-text',
  violet: 'bg-violet-soft text-violet-link',
  red: 'bg-[#FDECEC] text-[#C2362F]',
}

/** Footer chip: 12px medium, 4/8 padding, full radius. */
export function StepChip({ tone = 'neutral', children, onClick, className }: { tone?: StepChipTone; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-medium leading-4',
        CHIP[tone],
        onClick && 'cursor-pointer hover:brightness-[.97]',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Sender chip with a 16px face. */
export function SenderChip({ face = FACE.sam, name = 'Sam Rivera' }: { face?: string; name?: ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-fill py-1 pl-1 pr-2">
      <img src={asset(face)} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />
      <span className="whitespace-nowrap text-[12px] font-medium leading-4 text-ink">{name}</span>
    </span>
  )
}

/** Plain footer text. `amber` = medium-weight warning text. */
export function FooterNote({ tone = 'grey', children }: { tone?: 'grey' | 'amber'; children: ReactNode }) {
  return (
    <span className={cn('whitespace-nowrap text-[12px] leading-4', tone === 'amber' ? 'font-medium text-amber-text' : 'text-grey-3')}>
      {children}
    </span>
  )
}

// ── Card ────────────────────────────────────────────────────────────────────

export type StepCardProps = {
  icon: ReactNode
  title: ReactNode
  /** Rendered after the title (e.g. <RuleMarker/>). */
  titleAdornment?: ReactNode
  subtitle?: ReactNode
  subtitleIcon?: ReactNode
  day?: ReactNode
  date?: ReactNode
  footerLeft?: ReactNode
  footerRight?: ReactNode
  selected?: boolean
  /** Selected ring with Paper's soft violet glow (Path B config states). */
  selectedGlow?: boolean
  onClick?: () => void
  width?: number
  /** Annotation pinned 16px right of the card, level with the title (e.g. <HintCard/>). */
  hint?: ReactNode
  className?: string
}

const SHADOW_IDLE = 'shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_8px_24px_-16px_#11121624]'
const SHADOW_HOVER = 'hover:shadow-[0_0_0_1px_#DADAD5,0_1px_2px_#1112160A,0_10px_24px_-14px_#11121630]'
const SHADOW_SELECTED = 'shadow-[0_0_0_1.5px_#6559F7,0_1px_2px_#1112160A]'
const SHADOW_SELECTED_GLOW = 'shadow-[0_0_0_1.5px_#6559F7,0_4px_12px_-4px_#6559F740]'

/** White step node: icon, title/subtitle, day + date, chip footer. */
export function StepCard({
  icon,
  title,
  titleAdornment,
  subtitle,
  subtitleIcon,
  day,
  date,
  footerLeft,
  footerRight,
  selected,
  selectedGlow,
  onClick,
  width = 320,
  hint,
  className,
}: StepCardProps) {
  const hasFooter = footerLeft != null || footerRight != null
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex shrink-0 flex-col rounded-[16px] bg-white text-left transition-shadow',
        selected ? (selectedGlow ? SHADOW_SELECTED_GLOW : SHADOW_SELECTED) : cn(SHADOW_IDLE, onClick && SHADOW_HOVER),
        onClick && 'cursor-pointer',
        className,
      )}
      style={{ width }}
    >
      <div className="flex items-center gap-3 p-4">
        {icon}
        <div className="flex min-w-0 grow flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="whitespace-nowrap text-[15px] font-semibold leading-5 tracking-[-0.01em] text-ink">{title}</span>
            {titleAdornment}
          </div>
          {subtitle != null && (
            <div className="flex items-center gap-[5px]">
              {subtitleIcon}
              <span className="truncate text-[12.5px] leading-4 text-grey-3">{subtitle}</span>
            </div>
          )}
        </div>
        {(day != null || date != null) && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="whitespace-nowrap text-[12px] font-semibold leading-4 text-grey-1">{day}</span>
            <span className="whitespace-nowrap text-[12px] leading-4 text-grey-3">{date}</span>
          </div>
        )}
      </div>
      {hasFooter && (
        <div className="flex min-h-[50px] items-center justify-between gap-2 border-t border-line-soft px-4 py-3">
          <div className="flex items-center gap-2">{footerLeft}</div>
          {footerRight}
        </div>
      )}
      {hint && <div className="absolute left-[calc(100%+16px)] top-[2px] z-10">{hint}</div>}
    </div>
  )
}
