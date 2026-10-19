/**
 * Pieces shared by Path B steps 5–7 (B5 · mail, B6 · gift, B7 · goal) and B8.
 *
 *   ListAudience                        "48 people from your list, Q4 VP Sales" pill (coral list mark)
 *   FlowTop { selected?, onSelect? }    audience → intro → "Opened the email?" → LinkedIn | bump
 *   ShortLetterCard / DiwaliGiftCard { selected?, onClick? }   the steps added in B5 / B6
 *   SELECTED_RING                       className for a selected step in the config states
 *   MenuSlot { label, open, onToggle, menu, menuTop }   dashed slot + its floating step menu (336px right)
 *   StepMenu { tabs, defaultTab, suggestion, onPick }   search · Reach out / Timing & logic · Gifty suggests · rows
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { GmailMark, GmailTile } from '@/components/ui'
import {
  AddStepButton,
  AudiencePill,
  Branches,
  CanvasMenu,
  ConditionPill,
  EmptySlot,
  FlowLine,
  FooterNote,
  GiftStack,
  LinkedInTile,
  PanelSegmented,
  PostcardThumb,
  SenderChip,
  StepCard,
  StepChip,
} from '@/components/canvas'
import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import type { ConfigStepId } from '@/screens/blank/config/types'

// ── Glyphs ──────────────────────────────────────────────────────────────────

const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Svg({ size = 12, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
      {children}
    </svg>
  )
}

export const glyph = {
  pen: (color = '#8B8D95') => (
    <Svg>
      <path d="M10.5 2.5 13.5 5.5 6 13H3v-3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  clock: (size = 12, width = 1.5) => (
    <Svg size={size}>
      <circle cx="8" cy="8" r="5.5" stroke="#33353C" strokeWidth={width} />
      <path d="M8 5v3l2 1.5" stroke="#33353C" strokeWidth={width} strokeLinecap="round" />
    </Svg>
  ),
  calendar: (size = 12, width = 1.5) => (
    <Svg size={size}>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="#33353C" strokeWidth={width} />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="#33353C" strokeWidth={width} strokeLinecap="round" />
    </Svg>
  ),
  reply: (size = 12, color = '#33353C') => (
    <Svg size={size}>
      <path d="M6 4 2.5 7.5 6 11M3 7.5h6.5a4 4 0 0 1 4 4V13" stroke={color} strokeWidth="1.5" {...round} />
    </Svg>
  ),
  phone: () => (
    <Svg>
      <path
        d="M5.2 2.5h-1.7A1 1 0 0 0 2.5 3.6c.3 5.3 4.6 9.6 9.9 9.9a1 1 0 0 0 1.1-1v-1.7l-2.6-1-1.4 1.3a7 7 0 0 1-3.6-3.6L7.2 6 6.2 3.4Z"
        stroke="#33353C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  flag: () => (
    <Svg size={16}>
      <path d="M4 14V2.5M4 3h7.5l-1.5 2.5L11.5 8H4" stroke="#FFFFFF" strokeWidth="1.6" {...round} />
    </Svg>
  ),
  search: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="#8B8D95" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="#8B8D95" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  list: () => (
    <Svg>
      <circle cx="9.5" cy="9.5" r="3.2" stroke="#FFFFFF" strokeWidth="1.8" />
      <path d="M9.5 6.3V3M7.2 11.8 4 15M3.5 4.5l3.6 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  ),
}

// ── Flow ────────────────────────────────────────────────────────────────────

/** Path B audience: coral list mark, "48 people", source, three faces. */
export function ListAudience() {
  return (
    <AudiencePill
      count="48 people"
      source="from your list, Q4 VP Sales"
      icon={<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hubspot">{glyph.list()}</span>}
    />
  )
}

/** Selected ring for placed Path B steps in the config states (B1a–B7a): violet hairline + soft violet drop. */
export const SELECTED_RING = '!shadow-[0_0_0_1.5px_#6559F7,0_4px_12px_-4px_#6559F740]'

/** With a right-rail panel open, Paper's flow column sits 18px right of the space between zoom rail and panel (B4a–B6a). */
export const FLOW_SHIFT = 18

type Selectable = { selected?: boolean; onClick?: () => void }

/** Card props for a selectable step: kit hover/cursor from onClick, Paper's ring when selected. */
function pickable({ selected, onClick }: Selectable) {
  return { onClick, selected, className: selected ? SELECTED_RING : undefined }
}

/** The part of the loop built in B1–B4: audience → intro → check → LinkedIn | bump. Nodes select via `onSelect`. */
export function FlowTop({ selected = null, onSelect }: { selected?: ConfigStepId | null; onSelect?: (id: ConfigStepId) => void } = {}) {
  const node = (id: ConfigStepId) => pickable({ selected: selected === id, onClick: onSelect && (() => onSelect(id)) })
  return (
    <>
      <ListAudience />
      <FlowLine />
      <StepCard
        {...node('intro')}
        icon={<GmailTile />}
        title="Intro from Sam"
        subtitle="Quick idea for {company}"
        day="Day 0"
        date="Mon 26 Oct"
        footerLeft={<SenderChip />}
        footerRight={<StepChip tone="green">Ready</StepChip>}
      />
      <FlowLine />
      <ConditionPill selected={selected === 'check'} onClick={onSelect && (() => onSelect('check'))} />
      <FlowLine />
      <Branches
        left={{
          label: 'Opened',
          node: (
            <StepCard
              {...node('linkedin')}
              width={280}
              icon={<LinkedInTile />}
              title="Connect on LinkedIn"
              subtitle="With a short note"
              subtitleIcon={glyph.pen()}
              day="Day 2"
              date="Wed 28 Oct"
              footerLeft={
                <>
                  <StepChip tone="amber">6 have no profile</StepChip>
                  <FooterNote>They get an email</FooterNote>
                </>
              }
            />
          ),
        }}
        right={{
          label: 'Not opened',
          node: (
            <StepCard
              {...node('bump')}
              width={280}
              icon={<GmailTile />}
              title="Gentle bump"
              subtitle="“Bumping this up”"
              day="Day 2"
              date="Wed 28 Oct"
              footerLeft={<FooterNote>Replies in the intro’s thread</FooterNote>}
              footerRight={<StepChip tone="green">Ready</StepChip>}
            />
          ),
        }}
      />
    </>
  )
}

export function ShortLetterCard(props: Selectable = {}) {
  return (
    <StepCard
      {...pickable(props)}
      icon={<PostcardThumb />}
      title="A short letter"
      subtitle="Postcard, signed by Sam"
      day="Day 3"
      date="Thu 29 Oct"
      footerLeft={<StepChip>Lands 30–31 Oct</StepChip>}
      footerRight={<StepChip tone="amber">7 addresses missing</StepChip>}
    />
  )
}

/** B7's gift card has a plain two-layer shadow (no drop) until it's selected. */
export function DiwaliGiftCard({ selected, onClick }: Selectable = {}) {
  return (
    <StepCard
      onClick={onClick}
      selected={selected}
      icon={<GiftStack />}
      title="Diwali gift"
      subtitle="One per person"
      day="Day 5"
      date="Sat 31 Oct"
      className={selected ? SELECTED_RING : '!shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A]'}
      footerLeft={
        <>
          <StepChip>$58 to $90</StepChip>
          <StepChip>4 gifts</StepChip>
          <StepChip tone="amber">7 addresses missing</StepChip>
        </>
      }
    />
  )
}

/** Dashed slot at the end of the flow; the step menu floats 16px to its right. */
export function MenuSlot({
  label,
  open,
  onToggle,
  menu,
  menuTop = 0,
}: {
  label: string
  open: boolean
  onToggle: () => void
  menu: ReactNode
  menuTop?: number
}) {
  return (
    // Clicks inside don't reach the canvas (which closes the menu).
    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
      <EmptySlot>
        <AddStepButton onClick={onToggle}>{label}</AddStepButton>
        {open && (
          <div className="absolute left-[336px] z-20 animate-[fade_.15s_ease-out]" style={{ top: menuTop }}>
            {menu}
          </div>
        )}
      </EmptySlot>
    </div>
  )
}

// ── Step menu ───────────────────────────────────────────────────────────────

/** 24px row icons. */
export const RowIcon = {
  glyph: (g: ReactNode) => (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-white shadow-[0_0_0_1px_#EBEBE8]">{g}</span>
  ),
  image: (id: string) => <span className="h-6 w-6 shrink-0 rounded-[6px] bg-cover bg-center" style={{ backgroundImage: `url(${asset(id)})` }} />,
  linkedin: () => (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-linkedin text-[11px] font-bold leading-3 text-white">in</span>
  ),
  gmail: () => RowIcon.glyph(<GmailMark width={13} />),
}

export type MenuRow = { icon: ReactNode; label: string; hint: string; disabled?: boolean }
export type MenuSection = { title: string; rows: MenuRow[] }
export type MenuTab = 'reach' | 'timing'

export type OptionChoice = { label: string; face?: string; kind?: 'choice' | 'tag' }
export type SuggestionOption = {
  label: string
  choices: OptionChoice[]
  selected: number
  /** Plain grey text after the chips; gets the selected label of this row. */
  note?: (selected: string) => string
  wrap?: boolean
}
export type Suggestion = { media: ReactNode; title: string; subtitle: string; options: SuggestionOption[] }

const TABS = [
  { value: 'reach' as const, label: 'Reach out' },
  { value: 'timing' as const, label: 'Timing & logic' },
]

/** The canvas step picker (B5–B7): search, tabs, Gifty's suggestion with options, then grouped rows. */
export function StepMenu({
  defaultTab = 'reach',
  sections,
  suggestion,
  onPick,
}: {
  defaultTab?: MenuTab
  sections: Record<MenuTab, MenuSection[]>
  suggestion: Suggestion
  onPick: () => void
}) {
  const [tab, setTab] = useState<MenuTab>(defaultTab)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sections[tab]
      .map((s) => ({ ...s, rows: s.rows.filter((r) => !q || `${r.label} ${r.hint}`.toLowerCase().includes(q)) }))
      .filter((s) => s.rows.length > 0)
  }, [sections, tab, query])

  // Enter accepts Gifty's suggestion, like the ↵ hint says.
  useEffect(() => {
    // Ignore the keypress that navigated here from the previous step's menu.
    const mountedAt = performance.now()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && e.timeStamp > mountedAt) onPick()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPick])

  let index = -1
  return (
    <CanvasMenu>
      <label className="flex h-10 shrink-0 cursor-text items-center gap-[10px] rounded-[10px] bg-page px-3">
        {glyph.search()}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search steps"
          className="min-w-0 grow bg-transparent text-[13.5px] leading-4 text-ink outline-none placeholder:text-grey-3"
        />
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-white text-[11px] font-medium leading-3 text-grey-2 shadow-[0_0_0_1px_#E4E4E1]">
          /
        </span>
      </label>
      <PanelSegmented options={TABS} value={tab} onChange={setTab} />
      <MenuLabel>Gifty suggests</MenuLabel>
      <SuggestionCard suggestion={suggestion} onPick={onPick} />
      <MenuLabel>Or pick a step</MenuLabel>
      <div className="flex flex-col gap-0.5">
        {visible.map((section, si) => (
          <div key={section.title} className="contents">
            <div className={cn('px-2 pb-0.5 text-[11.5px] font-medium leading-4 text-grey-3', si === 0 ? 'pt-1.5' : 'pt-[10px]')}>
              {section.title}
            </div>
            {section.rows.map((row) => {
              index += 1
              const i = index
              return (
                <button
                  key={row.label}
                  type="button"
                  disabled={row.disabled}
                  onMouseEnter={() => !row.disabled && setActive(i)}
                  onClick={onPick}
                  className={cn(
                    'flex h-[38px] shrink-0 items-center gap-[10px] rounded-[8px] px-2 text-left',
                    row.disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
                    active === i && !row.disabled && 'bg-page',
                  )}
                >
                  {row.icon}
                  <span className="grow text-[13px] font-medium leading-4 text-ink">{row.label}</span>
                  <span className="text-[12px] leading-4 text-grey-3">{row.hint}</span>
                </button>
              )
            })}
          </div>
        ))}
        {visible.length === 0 && <div className="px-2 py-3 text-[12.5px] leading-4 text-grey-3">No steps match “{query}”</div>}
      </div>
    </CanvasMenu>
  )
}

function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 pb-1 pt-3 text-[12px] font-medium leading-4 text-grey-3">{children}</div>
}

function SuggestionCard({ suggestion, onPick }: { suggestion: Suggestion; onPick: () => void }) {
  const [picked, setPicked] = useState(() => suggestion.options.map((o) => o.selected))
  return (
    <div className="flex flex-col gap-3 rounded-[12px] p-3 shadow-[inset_0_0_0_1.5px_#6559F7]">
      <div onClick={onPick} className="group flex cursor-pointer items-center gap-3">
        {suggestion.media}
        <div className="flex min-w-0 grow basis-0 flex-col gap-0.5">
          <span className="text-[13.5px] font-semibold leading-4 text-ink">{suggestion.title}</span>
          <span className="text-[12.5px] leading-4 text-grey-2">{suggestion.subtitle}</span>
        </div>
        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-fill text-[12px] leading-3 text-grey-1 group-hover:bg-[#E9E9E6]">
          ↵
        </span>
      </div>
      <div className="flex flex-col gap-[10px] border-t border-line-soft pt-3">
        {suggestion.options.map((opt, oi) => (
          <div key={opt.label} className="flex items-center gap-2">
            <span className="w-[52px] shrink-0 text-[12px] leading-4 text-grey-3">{opt.label}</span>
            <div className={cn('flex gap-1', opt.wrap && 'flex-wrap')}>
              {opt.choices.map((c, ci) => (
                <OptionChip
                  key={c.label}
                  choice={c}
                  selected={picked[oi] === ci}
                  onClick={() => setPicked((p) => p.map((v, k) => (k === oi ? ci : v)))}
                />
              ))}
              {opt.note && <span className="p-1 text-[12px] leading-4 text-grey-3">{opt.note(opt.choices[picked[oi]].label)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OptionChip({ choice, selected, onClick }: { choice: OptionChoice; selected: boolean; onClick: () => void }) {
  if (choice.kind === 'tag') {
    return <span className="flex h-[25px] items-center rounded-[7px] bg-fill px-2 text-[12px] font-medium leading-4 text-grey-1">{choice.label}</span>
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] text-[12px] leading-4',
        choice.face ? 'py-[3px] pl-1 pr-2' : 'h-[25px] px-2',
        selected
          ? 'bg-white font-semibold text-[#4B33D6] shadow-[inset_0_0_0_1.5px_#6559F7]'
          : 'font-medium text-grey-1 shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
      )}
    >
      {choice.face && <img src={asset(choice.face)} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />}
      {choice.label}
    </button>
  )
}

// ── Shared menu rows ────────────────────────────────────────────────────────

export const TIMING_SECTIONS: MenuSection[] = [
  {
    title: 'Wait',
    rows: [
      { icon: RowIcon.glyph(glyph.clock()), label: 'Wait 3 days', hint: 'Let the gift sink in' },
      { icon: RowIcon.glyph(glyph.calendar()), label: 'Wait until a date', hint: 'e.g. after Diwali' },
    ],
  },
  {
    title: 'Split',
    rows: [
      { icon: RowIcon.image('01M57SW4WP6JAPT9TYN46DBY5N'), label: 'Gift delivered?', hint: 'Follow up only then' },
      { icon: RowIcon.glyph(glyph.reply()), label: 'Replied?', hint: 'Handled by a rule', disabled: true },
    ],
  },
]

