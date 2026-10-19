/**
 * Path B (blank loop, /blank/build/:step) pieces shared by Step1–Step7.
 *
 * Top bar
 *   PathBActions { ready?, finishTo?, before? }   right slot (before = Rules toggle): Saved · faces · "Let Gifty finish" · Review & launch
 *                                         (dimmed until `ready`; then links to /loop/preview).
 *   PathBHeader { ready?, finishTo?, before? }    <BuilderHeader mode="blank" tab="Build" right={<PathBActions/>}/>
 *
 * Flow
 *   PathBFlow { intro?, introSelected?, onIntroClick?, checkSelected?, onCheckClick?, split?, children? }
 *     Audience pill → [Intro card] → [check pill → Opened / Not opened branches] → children.
 *   PANEL_FLOW_STYLE                                flow offset while a right panel is open (Paper: flow centred in 797px).
 *     split = { left, right, merge? } (branch column nodes, 280 wide).
 *   PathBAudience · IntroCard · ConnectCard · BumpCard   (the nodes PathBFlow and later steps use)
 *   SlotAdd { onAdd?, children?, width?, height? }  dashed violet slot + "Add step"; relative, so a
 *                                                     StepMenu can be absolutely positioned inside it.
 *   UpNextSlot { width?, height? }                  grey dashed "Up next" placeholder.
 *   PlainAddStep { onClick?, raised? } · GreySlot { onAdd? }   grey "+ Add step" pill / grey dashed slot (config states).
 *   AddWithMenu { open, onOpen, menu }              "Add step" pill with the menu 8px under it (B1/B2).
 *
 * Step picker
 *   StepMenu { content: {reach, timing}, defaultTab?, onPick(id), onClose?, className?, style? }
 *     Search (filters; "/" focuses, Enter takes the suggestion), Reach out / Timing & logic tabs,
 *     "Gifty suggests" card with choice rows, "Or pick a step" groups. First row starts highlighted;
 *     hover moves it. Esc / click outside calls onClose. Suggestion id is 'suggest'.
 *   Types: MenuContent { suggestLabel?, suggest?, groups } · Suggestion { icon, title, subtitle, rows } ·
 *     SuggestRow { label, choices?: Choice[], value?, custom? } · Choice { label, face?, icon? } ·
 *     MenuGroup { title, items: MenuItem[] } · MenuItem { id, label, hint, icon, disabled? }
 *   Icons: ItemIcon.{gmail, linkedin, image(id), glyph(node)} (24px) · SuggestIcon.{gmail, linkedin, check} (36px)
 *     MENU_GLYPH.{clock, calendar, link, hubspot, reply, phone, pen} · PathsRow (Opened and Not opened)
 *   useDismiss(ref, onClose)                         Esc / outside mousedown.
 */
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { BuilderHeader } from '@/components/shell'
import { GmailMark, HubSpotMark } from '@/components/ui'
import {
  AddStepButton,
  AudiencePill,
  Branches,
  CanvasMenu,
  ConditionPill,
  DraftActions,
  EmptySlot,
  FlowLine,
  GmailTile,
  LinkedInTile,
  SenderChip,
  StepCard,
  StepChip,
  FooterNote,
} from '@/components/canvas'
import { asset, FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'

// ── Top bar ─────────────────────────────────────────────────────────────────

const glyphFinish = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
    <path d="M3 4l4 4-4 4M8.5 4l4 4-4 4" stroke="#111216" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const glyphArrow = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
    <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BTN = 'flex items-center gap-[7px] rounded-[10px] px-4 py-3 text-[13px] font-medium leading-4'

export function PathBActions({
  ready = false,
  finishTo = '/blank/rules',
  before,
}: {
  ready?: boolean
  finishTo?: string
  /** Slot before "Let Gifty finish" (the Rules toggle). */
  before?: ReactNode
}) {
  const primaryClass = cn(
    BTN,
    'bg-violet text-white shadow-[inset_0_0_0_1px_#5547E6,inset_0_1px_0_#FFFFFF2E]',
    ready ? 'cursor-pointer hover:bg-[#5A4EF0]' : 'pointer-events-none opacity-40',
  )
  return (
    <DraftActions
      before={before}
      secondary={
        <Link
          to={finishTo}
          className={cn(BTN, 'border border-line-strong bg-white text-ink shadow-[0_1px_2px_#1112160D] hover:bg-fill-hover')}
        >
          {glyphFinish}
          Let Gifty finish
        </Link>
      }
      primary={
        ready ? (
          <Link to="/loop/preview" className={primaryClass}>
            Review &amp; launch
            {glyphArrow}
          </Link>
        ) : (
          <span aria-disabled className={primaryClass}>
            Review &amp; launch
            {glyphArrow}
          </span>
        )
      }
    />
  )
}

export function PathBHeader(props: { ready?: boolean; finishTo?: string; before?: ReactNode }) {
  return <BuilderHeader tab="Build" mode="blank" right={<PathBActions {...props} />} />
}

// ── Flow nodes ──────────────────────────────────────────────────────────────

export function PathBAudience({ onClick }: { onClick?: () => void }) {
  return (
    <AudiencePill
      count="48 people"
      source="from your list, Q4 VP Sales"
      faces={[FACE.f3, FACE.f4, FACE.f5]}
      icon={<HubSpotMark size={24} />}
      onClick={onClick}
    />
  )
}

type NodeProps = { selected?: boolean; onClick?: () => void; width?: number }

export function IntroCard({ selected, onClick, width = 320 }: NodeProps) {
  return (
    <StepCard
      icon={<GmailTile />}
      title="Intro from Sam"
      subtitle="Quick idea for {company}"
      day="Day 0"
      date="Mon 26 Oct"
      footerLeft={<SenderChip />}
      footerRight={<StepChip tone="green">Ready</StepChip>}
      selected={selected}
      selectedGlow
      onClick={onClick}
      width={width}
    />
  )
}

const penGlyph = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
    <path d="M10.5 2.5 13.5 5.5 6 13H3v-3Z" stroke="#8B8D95" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

export function ConnectCard({ selected, onClick, width = 280 }: NodeProps) {
  return (
    <StepCard
      icon={<LinkedInTile />}
      title="Connect on LinkedIn"
      subtitle="With a short note"
      subtitleIcon={penGlyph}
      day="Day 2"
      date="Wed 28 Oct"
      footerLeft={
        <>
          <StepChip tone="amber">6 have no profile</StepChip>
          <FooterNote>They get an email</FooterNote>
        </>
      }
      selected={selected}
      selectedGlow
      onClick={onClick}
      width={width}
    />
  )
}

export function BumpCard({ selected, onClick, width = 280 }: NodeProps) {
  return (
    <StepCard
      icon={<GmailTile />}
      title="Gentle bump"
      subtitle="“Bumping this up”"
      day="Day 2"
      date="Wed 28 Oct"
      footerLeft={<FooterNote>Replies in the intro’s thread</FooterNote>}
      footerRight={<StepChip tone="green">Ready</StepChip>}
      selected={selected}
      selectedGlow
      onClick={onClick}
      width={width}
    />
  )
}

/** Dashed violet slot with "Add step"; children (e.g. an open StepMenu) are positioned against it. */
export function SlotAdd({
  onAdd,
  children,
  width = 280,
  height = 122,
}: {
  onAdd?: () => void
  children?: ReactNode
  width?: number
  height?: number
}) {
  return (
    <EmptySlot width={width} style={{ height }}>
      <AddStepButton onClick={onAdd} />
      {children}
    </EmptySlot>
  )
}

export function UpNextSlot({ width = 280, height = 122 }: { width?: number; height?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[16px] border-[1.5px] border-dashed border-[#CFCFD6]"
      style={{ width, height }}
    >
      <span className="text-[13px] font-medium leading-4 text-grey-3">Up next</span>
    </div>
  )
}

const plusGlyph = (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M8 3v10M3 8h10" stroke="#55575F" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

/** Grey "+ Add step" pill shown while a step is selected (no menu). `raised` = B1a's 14px padding + drop. */
export function PlainAddStep({ onClick, raised }: { onClick?: () => void; raised?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[16px] bg-white hover:bg-fill-hover',
        raised ? 'px-[14px] shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D]' : 'px-3 shadow-[inset_0_0_0_1px_#E4E4E1]',
      )}
    >
      {plusGlyph}
      <span className="text-[13px] font-medium leading-4 text-grey-1">Add step</span>
    </button>
  )
}

/** Grey dashed branch slot with a plain "Add step" (B2a). */
export function GreySlot({ onAdd, width = 280, height = 122 }: { onAdd?: () => void; width?: number; height?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[16px] border-[1.5px] border-dashed border-[#D4D4CF] bg-white/50"
      style={{ width, height }}
    >
      <PlainAddStep onClick={onAdd} />
    </div>
  )
}

/** Right panel open: Paper's flow column runs 36px under the panel, so the flow sits centred in 797px. */
export const PANEL_FLOW_STYLE: CSSProperties = { marginRight: -36 }

/** "Add step" pill with the step menu 8px below it (first-level adds, B1/B2). */
export function AddWithMenu({ open, onOpen, menu }: { open: boolean; onOpen: () => void; menu: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <AddStepButton onClick={onOpen} />
      {open && menu}
    </div>
  )
}

/** Partial Path B flow: audience → intro → check + split → children. */
export function PathBFlow({
  intro,
  introSelected,
  onIntroClick,
  checkSelected,
  onCheckClick,
  split,
  children,
}: {
  intro?: boolean
  introSelected?: boolean
  onIntroClick?: () => void
  checkSelected?: boolean
  onCheckClick?: () => void
  split?: { left: ReactNode; right: ReactNode; merge?: boolean }
  children?: ReactNode
}) {
  return (
    <>
      <PathBAudience />
      <FlowLine />
      {intro && (
        <>
          <IntroCard selected={introSelected} onClick={onIntroClick} />
          <FlowLine />
        </>
      )}
      {split && (
        <>
          <ConditionPill selected={checkSelected} onClick={onCheckClick} />
          <FlowLine />
          <Branches
            left={{ label: 'Opened', tone: 'green', node: split.left }}
            right={{ label: 'Not opened', tone: 'red', node: split.right }}
            merge={split.merge ?? false}
          />
        </>
      )}
      {children}
    </>
  )
}

// ── Step picker: icons ──────────────────────────────────────────────────────

function GlyphSvg({ children }: { children: ReactNode }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
      {children}
    </svg>
  )
}

const S = { stroke: '#33353C', strokeWidth: 1.5 } as const

export const MENU_GLYPH = {
  clock: (
    <GlyphSvg>
      <circle cx="8" cy="8" r="5.5" {...S} />
      <path d="M8 5v3l2 1.5" {...S} strokeLinecap="round" />
    </GlyphSvg>
  ),
  calendar: (
    <GlyphSvg>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" {...S} />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" {...S} strokeLinecap="round" />
    </GlyphSvg>
  ),
  link: (
    <GlyphSvg>
      <path d="M6.5 9.5 9.5 6.5M7 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M9 11.5l-1 1A2.5 2.5 0 0 1 4.5 9l1-1" {...S} strokeLinecap="round" />
    </GlyphSvg>
  ),
  hubspot: (
    <GlyphSvg>
      <circle cx="10" cy="9.5" r="2.5" stroke="#FFFFFF" strokeWidth="1.8" />
      <path d="M10 7V3.5M5 5l3.2 3M3.5 13l4.5-2" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </GlyphSvg>
  ),
  reply: (
    <GlyphSvg>
      <path d="M6 4 2.5 7.5 6 11M3 7.5h6.5a4 4 0 0 1 4 4V13" {...S} strokeLinecap="round" strokeLinejoin="round" />
    </GlyphSvg>
  ),
  phone: (
    <GlyphSvg>
      <path
        d="M5.2 2.5h-1.7A1 1 0 0 0 2.5 3.6c.3 5.3 4.6 9.6 9.9 9.9a1 1 0 0 0 1.1-1v-1.7l-2.6-1-1.4 1.3a7 7 0 0 1-3.6-3.6L7.2 6 6.2 3.4Z"
        {...S}
        strokeLinejoin="round"
      />
    </GlyphSvg>
  ),
  pen: (
    <GlyphSvg>
      <path d="M10.5 2.5 13.5 5.5 6 13H3v-3Z" {...S} strokeLinejoin="round" />
    </GlyphSvg>
  ),
}

const TILE24 = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px]'

/** 24px list-row icons. */
export const ItemIcon = {
  gmail: () => (
    <span className={cn(TILE24, 'bg-white shadow-[0_0_0_1px_#EBEBE8]')}>
      <GmailMark width={13} />
    </span>
  ),
  linkedin: () => (
    <span className={cn(TILE24, 'bg-linkedin text-[11px] font-bold leading-3 text-white')}>in</span>
  ),
  hubspot: () => <span className={cn(TILE24, 'bg-hubspot')}>{MENU_GLYPH.hubspot}</span>,
  image: (id: string) => <span className="h-6 w-6 shrink-0 rounded-[6px] bg-cover bg-center" style={{ backgroundImage: `url(${asset(id)})` }} />,
  glyph: (g: ReactNode) => <span className={cn(TILE24, 'bg-white shadow-[0_0_0_1px_#EBEBE8]')}>{g}</span>,
}

const TILE36 = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]'

/** 36px suggestion-card icons. */
export const SuggestIcon = {
  gmail: () => (
    <span className={cn(TILE36, 'bg-white shadow-[0_0_0_1px_#EBEBE8]')}>
      <GmailMark width={18} />
    </span>
  ),
  linkedin: () => <span className={cn(TILE36, 'bg-linkedin text-[15px] font-bold leading-4 text-white')}>in</span>,
  check: () => (
    <span className={cn(TILE36, 'bg-white shadow-[0_0_0_1px_#EBEBE8]')}>
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path d="M2.75 7.25 9 3l6.25 4.25v6.5a1 1 0 0 1-1 1H3.75a1 1 0 0 1-1-1Z" stroke="#33353C" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="m2.75 7.25 6.25 4.25 6.25-4.25" stroke="#33353C" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="14" cy="4" r="3" fill="#22B573" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    </span>
  ),
}

/** "Opened and Not opened" solid pills for a check suggestion's Paths row. */
export function PathsRow() {
  return (
    <div className="flex h-[23px] items-center gap-1.5">
      <span className="rounded-full bg-green px-[9px] py-[3px] text-[11.5px] font-semibold leading-4 text-white">Opened</span>
      <span className="text-[12px] leading-4 text-[#B4B5BB]">and</span>
      <span className="rounded-full bg-[#E5484D] px-[9px] py-[3px] text-[11.5px] font-semibold leading-4 text-white">Not opened</span>
    </div>
  )
}

// ── Step picker: data types ─────────────────────────────────────────────────

export type Choice = { label: string; face?: string; icon?: ReactNode }
export type SuggestRow = { label: string; choices?: Choice[]; value?: number; custom?: ReactNode }
export type Suggestion = { icon: ReactNode; title: string; subtitle: string; rows: SuggestRow[] }
export type MenuItem = { id: string; label: string; hint: string; icon: ReactNode; disabled?: boolean }
export type MenuGroup = { title: string; items: MenuItem[] }
export type MenuContent = { suggestLabel?: string; suggest?: Suggestion; groups: MenuGroup[] }
export type MenuTab = 'reach' | 'timing'

const TABS: { value: MenuTab; label: string }[] = [
  { value: 'reach', label: 'Reach out' },
  { value: 'timing', label: 'Timing & logic' },
]

// ── Step picker: pieces ─────────────────────────────────────────────────────

/** Esc or a mousedown outside `ref` calls onClose. */
export function useDismiss(ref: RefObject<HTMLElement | null>, onClose?: () => void) {
  useEffect(() => {
    if (!onClose) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.()
    }
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [ref, onClose])
}

function ChoicePill({ choice, active, tall, onClick }: { choice: Choice; active: boolean; tall: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex cursor-pointer items-center rounded-[7px] text-[12px] leading-4',
        choice.face ? 'h-[22px] gap-1.5 pl-1 pr-2' : cn('gap-[5px] px-2', tall ? 'h-[25px]' : 'h-6'),
        active
          ? 'bg-white font-semibold text-[#4B33D6] shadow-[inset_0_0_0_1.5px_#6559F7]'
          : 'font-medium text-grey-1 shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
      )}
    >
      {choice.face && <img src={asset(choice.face)} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />}
      {choice.icon}
      {choice.label}
    </button>
  )
}

function SuggestOptionRow({ row }: { row: SuggestRow }) {
  const [value, setValue] = useState(row.value ?? 0)
  // Paper rows with a face chip are 24 tall, text-only rows 25.
  const tall = !row.choices?.some((c) => c.face)
  return (
    <div className="flex items-center gap-2">
      <span className="w-[52px] shrink-0 text-[12px] leading-4 text-grey-3">{row.label}</span>
      {row.custom ?? (
        <div className="flex gap-1">
          {row.choices?.map((c, i) => (
            <ChoicePill key={c.label} choice={c} active={i === value} tall={tall} onClick={() => setValue(i)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SuggestionCard({ s, onPick }: { s: Suggestion; onPick: () => void }) {
  return (
    <div
      onClick={onPick}
      className="flex cursor-pointer flex-col gap-3 rounded-[12px] p-3 shadow-[inset_0_0_0_1.5px_#6559F7] transition-colors hover:bg-[#FBFAFF]"
    >
      <div className="flex items-center gap-3">
        {s.icon}
        <div className="flex min-w-0 grow basis-0 flex-col gap-0.5">
          <span className="text-[13.5px] font-semibold leading-4 text-ink">{s.title}</span>
          <span className="text-[12.5px] leading-4 text-grey-2">{s.subtitle}</span>
        </div>
        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-fill text-[12px] leading-3 text-grey-1">↵</span>
      </div>
      {s.rows.length > 0 && (
        <div className="flex flex-col gap-[10px] border-t border-line-soft pt-[11px]">
          {s.rows.map((r) => (
            <SuggestOptionRow key={r.label} row={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 pb-[5px] pt-3 text-[12px] font-medium leading-4 text-grey-3">{children}</div>
}

function ItemRow({ item, active, onHover, onPick }: { item: MenuItem; active: boolean; onHover: () => void; onPick: () => void }) {
  return (
    <div
      onMouseEnter={item.disabled ? undefined : onHover}
      onClick={item.disabled ? undefined : onPick}
      className={cn(
        'flex h-[38px] shrink-0 items-center gap-[10px] rounded-[8px] px-2',
        item.disabled ? 'opacity-50' : 'cursor-pointer',
        active && !item.disabled && 'bg-page',
      )}
    >
      {item.icon}
      <span className="grow basis-0 text-[13px] font-medium leading-4 text-ink">{item.label}</span>
      <span className="text-[12px] leading-4 text-grey-3">{item.hint}</span>
    </div>
  )
}

const searchGlyph = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <circle cx="7" cy="7" r="4.5" stroke="#8B8D95" strokeWidth="1.5" />
    <path d="m10.5 10.5 3 3" stroke="#8B8D95" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// ── Step picker ─────────────────────────────────────────────────────────────

export function StepMenu({
  content,
  defaultTab = 'reach',
  onPick,
  onClose,
  className,
  style,
}: {
  content: Record<MenuTab, MenuContent>
  defaultTab?: MenuTab
  /** Item id, or 'suggest' for Gifty's suggestion. */
  onPick: (id: string) => void
  onClose?: () => void
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<MenuTab>(defaultTab)
  const [query, setQuery] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  useDismiss(ref, onClose)

  const current = content[tab]
  const q = query.trim().toLowerCase()
  const groups = current.groups
    .map((g) => ({ ...g, items: g.items.filter((it) => !q || it.label.toLowerCase().includes(q) || it.hint.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0)
  const firstEnabled = groups.flatMap((g) => g.items).find((it) => !it.disabled)?.id ?? null
  const activeId = hovered ?? firstEnabled
  const showSuggest = current.suggest && !q

  function handleTab(t: MenuTab) {
    setTab(t)
    setHovered(null)
  }

  function handleKey(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    if (showSuggest) onPick('suggest')
    else if (activeId) onPick(activeId)
  }

  // "/" focuses search while the menu is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div ref={ref} className={cn('z-30', className)} style={style} onMouseDown={(e) => e.stopPropagation()}>
      <CanvasMenu>
        <label className="flex h-10 shrink-0 cursor-text items-center gap-[10px] rounded-[10px] bg-page px-3">
          {searchGlyph}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search steps"
            className="min-w-0 grow basis-0 bg-transparent text-[13.5px] leading-4 text-ink outline-none placeholder:text-grey-3"
          />
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-white text-[11px] font-medium leading-3 text-grey-2 shadow-[0_0_0_1px_#E4E4E1]">
            /
          </span>
        </label>

        <div className="flex gap-0.5 rounded-[10px] bg-fill p-[3px]">
          {TABS.map((t) => {
            const on = t.value === tab
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTab(t.value)}
                className={cn(
                  'flex h-[30px] grow basis-0 cursor-pointer items-center justify-center rounded-[8px] text-[12.5px] leading-4',
                  on ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160F]' : 'font-medium text-grey-2 hover:text-ink',
                )}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {showSuggest && current.suggest && (
          <>
            <SectionLabel>{current.suggestLabel ?? 'Gifty suggests'}</SectionLabel>
            <SuggestionCard s={current.suggest} onPick={() => onPick('suggest')} />
          </>
        )}

        <SectionLabel>{q ? 'Matching steps' : 'Or pick a step'}</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {groups.map((g, gi) => (
            <div key={g.title} className="flex flex-col gap-0.5">
              <div className={cn('px-2 pb-[3px] text-[11.5px] font-medium leading-4 text-grey-3', gi === 0 ? 'pt-1.5' : 'pt-[10px]')}>{g.title}</div>
              {g.items.map((it) => (
                <ItemRow key={it.id} item={it} active={it.id === activeId} onHover={() => setHovered(it.id)} onPick={() => onPick(it.id)} />
              ))}
            </div>
          ))}
          {groups.length === 0 && <div className="px-2 py-3 text-[12.5px] leading-4 text-grey-3">No steps match “{query}”</div>}
        </div>
      </CanvasMenu>
    </div>
  )
}

// ── Shared menu content ─────────────────────────────────────────────────────

/** Timing & logic list used after an email (B2). */
export const TIMING_AFTER_EMAIL: MenuGroup[] = [
  {
    title: 'Wait',
    items: [
      { id: 'wait', label: 'Wait, then continue', hint: 'No split', icon: ItemIcon.glyph(MENU_GLYPH.clock) },
      { id: 'wait-date', label: 'Wait until a date', hint: 'e.g. after a holiday', icon: ItemIcon.glyph(MENU_GLYPH.calendar) },
    ],
  },
  {
    title: 'Split',
    items: [
      { id: 'clicked', label: 'Clicked a link', hint: 'Rare in a first email', icon: ItemIcon.glyph(MENU_GLYPH.link) },
      { id: 'has-linkedin', label: 'Has a LinkedIn profile', hint: '42 of 48', icon: ItemIcon.linkedin() },
      { id: 'hubspot-list', label: 'Is in a HubSpot list', hint: 'Pick a list', icon: ItemIcon.hubspot() },
      { id: 'replied', label: 'Replied', hint: 'Handled by a rule', icon: ItemIcon.glyph(MENU_GLYPH.reply), disabled: true },
    ],
  },
]
