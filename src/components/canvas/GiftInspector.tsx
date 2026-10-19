import { useState, type ReactNode } from 'react'
import { asset, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { GIFTS, MISSING_ADDRESSES, OFFICE_MAP, OLIVE_MATCHES, RECIPIENTS, type Gift, type MatchedPerson, type Recipient } from './data'
import { G } from './glyphs'
import {
  Inspector,
  InspectorBack,
  InspectorFooter,
  InspectorHeader,
  InspectorTabs,
  MiniButton,
  PanelLink,
  PanelSection,
  PanelSegmented,
  ProgressSplit,
  RowAction,
  SaveButton,
} from './Inspector'

/** Gift inspector states. gifts = 04 default, hover = 04b·A (after a swap), gift = 04b·B, everyone = 04b·C, addresses = 04b·D, note = Card note tab. */
export type GiftPanel = 'gifts' | 'hover' | 'gift' | 'everyone' | 'addresses' | 'note'
export const GIFT_PANELS: GiftPanel[] = ['gifts', 'hover', 'gift', 'everyone', 'addresses', 'note']

type Props = {
  panel?: GiftPanel
  onPanel?: (p: GiftPanel, giftId?: string) => void
  /** Gift shown in the `gift` state. */
  giftId?: string
  onClose?: () => void
  /** Open the swap-one-person modal (04a). */
  onSwap?: () => void
  /** Stretch to the full rail height. */
  fill?: boolean
}

// Fades the row's trailing thumbnail under a floating row action.
const FADE = { background: 'linear-gradient(90deg, rgba(246,246,244,0) 0, #F6F6F4 32px)' }

const bg = (id: string) => ({ backgroundImage: `url(${asset(id)})` })

export function GiftInspector({ panel = 'gifts', onPanel, giftId = 'olive', onClose, onSwap, fill }: Props) {
  const go = (p: GiftPanel, id?: string) => onPanel?.(p, id)
  const gap = panel === 'gift' ? 20 : 16
  return (
    <Inspector fill={fill} gap={gap} key={panel}>
      {panel === 'gifts' && <GiftsTab onGo={go} onClose={onClose} />}
      {panel === 'hover' && <PicksAfterSwap onGo={go} onClose={onClose} />}
      {panel === 'note' && <CardNoteTab onGo={go} onClose={onClose} />}
      {panel === 'gift' && <GiftDetail giftId={giftId} onGo={go} onClose={onClose} onSwap={onSwap} />}
      {panel === 'everyone' && <Everyone onGo={go} onClose={onClose} onSwap={onSwap} />}
      {panel === 'addresses' && <Addresses onGo={go} onClose={onClose} />}
    </Inspector>
  )
}

type PanelProps = { onGo: (p: GiftPanel, id?: string) => void; onClose?: () => void; onSwap?: () => void }

// ── Shared header + tabs ────────────────────────────────────────────────────

function GiftGrid() {
  return (
    <span className="flex h-[42px] w-[42px] shrink-0 flex-wrap gap-0.5 overflow-clip rounded-[10px]">
      {[GIFT.g1, GIFT.g2, GIFT.g3, GIFT.g4].map((id) => (
        <span key={id} className="h-5 w-5 shrink-0 bg-cover bg-center" style={bg(id)} />
      ))}
    </span>
  )
}

type Tab = 'gifts' | 'addresses' | 'note'
function GiftHeader({ tab, onGo, onClose, compact = true }: { tab: Tab; onGo: PanelProps['onGo']; onClose?: () => void; compact?: boolean }) {
  return (
    <>
      <InspectorHeader media={<GiftGrid />} title="Diwali gift" subtitle="Lands by Wed 4 Nov · 48 people" onClose={onClose} />
      <InspectorTabs<Tab>
        compact={compact}
        value={tab}
        onChange={(t) => onGo(t)}
        tabs={[
          { value: 'gifts', label: 'Gifts' },
          { value: 'addresses', label: 'Addresses' },
          { value: 'note', label: 'Card note' },
        ]}
      />
    </>
  )
}

function TotalFooter({ label = 'Save gift step' }: { label?: string }) {
  const [saved, setSaved] = useState(false)
  function save() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1600)
  }
  return (
    <InspectorFooter>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] leading-4 text-grey-2">48 gifts, shipping included</span>
        <span className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-ink">$3,474</span>
      </div>
      <SaveButton onClick={save}>{saved ? 'Gift step saved' : label}</SaveButton>
    </InspectorFooter>
  )
}

// ── Gifty's picks rows ──────────────────────────────────────────────────────

type Pick = Gift & { note?: string; changed?: boolean }

/** One pick. `dense` = 04 spacing (2px rows, 18px lines); otherwise 04b·A spacing. Hover swaps price for Replace ›. */
function PickRow({ g, hovered, dense, onHover, onOpen }: { g: Pick; hovered: boolean; dense?: boolean; onHover: () => void; onOpen: () => void }) {
  const line = dense ? 'leading-[18px]' : 'leading-4'
  const people = `${g.people} ${g.people === 1 ? 'person' : 'people'}`
  return (
    <div
      onMouseEnter={onHover}
      onClick={onOpen}
      className={cn('relative flex cursor-pointer items-center gap-3', dense ? 'py-0.5' : '-mx-2 rounded-[12px] p-2', !dense && hovered && 'bg-page')}
    >
      {dense && hovered && <span className="absolute -inset-x-2 -inset-y-[3px] rounded-[12px] bg-page" />}
      <span className="relative h-11 w-11 shrink-0 rounded-[11px] bg-cover bg-center" style={bg(g.img)} />
      <div className="relative flex grow flex-col gap-0.5">
        <span className={cn('text-[13.5px] font-medium text-ink', line)}>{g.name}</span>
        <span className="text-[12px] leading-4 text-grey-3">{hovered && !g.changed ? `${people} · $${g.price}` : (g.note ?? g.why)}</span>
      </div>
      {hovered ? (
        <div className="relative flex items-center gap-1">
          <MiniButton onClick={onOpen}>Replace</MiniButton>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center">{G.chevronRight()}</span>
        </div>
      ) : (
        <div className="relative flex flex-col items-end gap-0.5">
          <span className={cn('text-[13.5px] font-medium text-ink', line)}>${g.price}</span>
          <span className="text-[12px] leading-4 text-grey-3">{people}</span>
        </div>
      )}
    </div>
  )
}

function usePickHover(initial: number | null = null) {
  return useState<number | null>(initial)
}

// ── 04 · Gifts tab ──────────────────────────────────────────────────────────

const SHIP_NOTES = {
  best: 'Office if they’re in 3+ days a week, home otherwise',
  home: 'Home for everyone, office only if there’s no home address',
  office: 'Office for everyone, home if they’re fully remote',
} as const
type Ship = keyof typeof SHIP_NOTES

function GiftsTab({ onGo, onClose }: PanelProps) {
  const [hovered, setHovered] = usePickHover()
  const [ship, setShip] = useState<Ship>('best')
  return (
    <>
      <GiftHeader tab="gifts" onGo={onGo} onClose={onClose} />
      <div className="flex grow flex-col gap-6">
        <PanelSection title="Gifty’s picks" meta="4 gifts, 48 people" action={<PanelLink onClick={() => onGo('everyone')}>See everyone</PanelLink>}>
          <div className="flex flex-col gap-2" onMouseLeave={() => setHovered(null)}>
            {GIFTS.map((g, i) => (
              <PickRow key={g.id} g={g} dense hovered={hovered === i} onHover={() => setHovered(i)} onOpen={() => onGo('gift', g.id)} />
            ))}
          </div>
        </PanelSection>

        <button type="button" onClick={() => onGo('addresses')} className="group flex cursor-pointer flex-col gap-2 text-left">
          <div className="flex w-full items-baseline justify-between">
            <span className="text-[13.5px] font-semibold leading-[18px] text-ink">Addresses</span>
            <span className="flex gap-1 text-[12.5px] leading-4">
              <span className="font-semibold text-ink">41</span>
              <span className="text-grey-3 group-hover:text-grey-1">of 48 found</span>
            </span>
          </div>
          <div className="w-full">
            <ProgressSplit found={41} missing={7} />
          </div>
        </button>

        <PanelSection title="Ship to" size="lg" action={<span className="text-[12px] leading-4 text-grey-3">Diwali week, many work from home</span>}>
          <PanelSegmented<Ship>
            value={ship}
            onChange={setShip}
            options={[
              { value: 'best', label: 'Best per person', grow: 1.2 },
              { value: 'home', label: 'Home first' },
              { value: 'office', label: 'Office first' },
            ]}
          />
          <span className="text-[12px] leading-4 text-grey-3">{SHIP_NOTES[ship]}</span>
        </PanelSection>
      </div>
      <TotalFooter />
    </>
  )
}

// ── 04b·A · Picks after a swap, hover reveals the action ────────────────────

const PICKS_AFTER_SWAP: Pick[] = [
  { ...GIFTS[0], people: 13 },
  GIFTS[1],
  GIFTS[2],
  GIFTS[3],
  { id: 'candle', name: 'Soy candle', img: GIFT.g5, price: 54, why: '', note: 'Changed by you', people: 1, changed: true },
]

function PicksAfterSwap({ onGo, onClose }: PanelProps) {
  const [hovered, setHovered] = usePickHover(1)
  return (
    <>
      <GiftHeader tab="gifts" onGo={onGo} onClose={onClose} compact={false} />
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[13.5px] font-semibold leading-4 text-ink">Gifty’s picks</span>
          <PanelLink onClick={() => onGo('everyone')}>See everyone</PanelLink>
        </div>
        <div className="flex flex-col gap-1" onMouseLeave={() => setHovered(null)}>
          {PICKS_AFTER_SWAP.map((g, i) => (
            <PickRow key={g.id} g={g} hovered={hovered === i} onHover={() => setHovered(i)} onOpen={() => onGo('gift', g.changed ? 'olive' : g.id)} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => onGo('addresses')}
          className="-mx-2 flex cursor-pointer flex-col gap-2 rounded-[12px] bg-page px-2 py-3 text-left hover:bg-fill"
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-[13.5px] font-semibold leading-4 text-ink">Addresses</span>
            <span className="flex items-center gap-1">
              <span className="text-[12.5px] font-medium leading-4 text-ink">Review 7</span>
              {G.chevronRight()}
            </span>
          </div>
          <div className="w-full">
            <ProgressSplit found={41} missing={7} />
          </div>
          <span className="text-[12px] leading-4 text-grey-3">41 found · Gifty couldn’t find 7</span>
        </button>
      </div>
    </>
  )
}

// ── Card note tab ───────────────────────────────────────────────────────────

function CardNoteTab({ onGo, onClose }: PanelProps) {
  const [note, setNote] = useState(
    'Happy Diwali! A small something for the festival week, from all of us at Fieldwork. Hope Q4 is kind to you and the team.',
  )
  return (
    <>
      <GiftHeader tab="note" onGo={onGo} onClose={onClose} />
      <div className="flex grow flex-col gap-6">
        <PanelSection title="Card note" meta="Printed inside every box">
          <div className="flex flex-col gap-3 rounded-[12px] p-4 shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]">
            <div className="flex items-center gap-0.5 text-[13.5px] leading-5 text-ink">
              Dear
              <span className="mx-0.5 rounded-[6px] bg-[#F1EEFF] px-1.5 py-0.5 text-[12.5px] font-medium leading-4 text-[#4B33D6]">first name</span>,
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none bg-transparent text-[13.5px] leading-5 text-ink outline-none"
            />
            <span className="text-[13.5px] leading-5 text-ink">Sam</span>
          </div>
          <span className="text-[12px] leading-4 text-grey-3">{note.length} of 280 characters, handwritten font</span>
        </PanelSection>
      </div>
      <TotalFooter />
    </>
  )
}

// ── 04b·B · A gift opened ───────────────────────────────────────────────────

const GIFT_COPY: Record<string, string> = {
  diya: 'Hand-cast brass diyas from Moradabad, with a box of wicks. Wrapped, with Sam’s card inside.',
  olive: 'Two cold-pressed bottles from a grove in Puglia. Wrapped, with Sam’s card inside.',
  chai: 'Loose-leaf from one Darjeeling estate, with a brass strainer. Wrapped, with Sam’s card inside.',
  plant: 'A small pothos in a glazed pot, easy to keep alive on a desk. Wrapped, with Sam’s card inside.',
}

function NetworkBadge({ network }: { network: MatchedPerson['network'] }) {
  if (network === 'linkedin')
    return (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] bg-linkedin text-[8.5px] font-bold leading-[10px] text-white">
        in
      </span>
    )
  return <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] bg-ink">{G.x()}</span>
}

function Face({ id, size = 36 }: { id: string; size?: number }) {
  return <span className="shrink-0 rounded-full bg-cover bg-center" style={{ width: size, height: size, ...bg(id) }} />
}

function NameLine({ name, company }: { name: ReactNode; company: ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="whitespace-nowrap text-[13.5px] font-medium leading-4 text-ink">{name}</span>
      <span className="truncate text-[12.5px] leading-4 text-grey-3">{company}</span>
    </div>
  )
}

function GiftDetail({ giftId, onGo, onClose, onSwap }: PanelProps & { giftId: string }) {
  const gift = GIFTS.find((g) => g.id === giftId) ?? GIFTS[1]
  const [hovered, setHovered] = useState<number | null>(1)
  return (
    <>
      <InspectorBack label="All gifts" onBack={() => onGo('gifts')} onClose={onClose} />
      <div className="relative h-[176px] w-[336px] shrink-0 overflow-clip rounded-[14px] bg-cover bg-center" style={bg(gift.img)}>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/[.92] px-[10px] py-1.5 text-[12px] leading-4">
          <span className="font-medium text-ink">140 in stock</span>
          <span className="text-grey-3">Bengaluru warehouse</span>
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-[18px] font-semibold leading-6 tracking-[-0.015em] text-ink">
          <span>{gift.name}</span>
          <span>${gift.price}</span>
        </div>
        <p className="m-0 text-[13px] leading-5 text-grey-2">{GIFT_COPY[gift.id]}</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-line-soft pt-5">
        <div className="flex items-baseline gap-2 pb-1">
          <span className="text-[14px] font-semibold leading-5 text-ink">Picked for {gift.people}</span>
          <span className="text-[12.5px] leading-4 text-grey-3">based on their profile and activity</span>
        </div>
        <div className="flex flex-col gap-2" onMouseLeave={() => setHovered(null)}>
          {OLIVE_MATCHES.map((p, i) => (
            <div
              key={p.name}
              onMouseEnter={() => setHovered(i)}
              className={cn('relative -mx-2 flex items-start gap-3 rounded-[12px] p-2', hovered === i && 'bg-page')}
            >
              <Face id={p.face} />
              <div className="flex min-w-0 grow basis-0 flex-col gap-1">
                <NameLine name={p.name} company={p.company} />
                <div className="flex items-start gap-1.5">
                  <NetworkBadge network={p.network} />
                  <span className="text-[12.5px] leading-4 text-grey-1">{p.post}</span>
                </div>
                {p.warning && <span className="pt-0.5 text-[12px] font-medium leading-4 text-amber-text">{p.warning}</span>}
              </div>
              {hovered === i && (
                <div className="absolute right-2 top-[-14px] z-10">
                  <RowAction onClick={onSwap}>Change gift</RowAction>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            {[RECIPIENTS[2].face, RECIPIENTS[3].face, '01M57SW4WTMA8VVWD8DEZMES2A'].map((id, i) => (
              <span key={id} className="relative h-6 w-6 shrink-0 rounded-full bg-cover bg-center shadow-[0_0_0_2px_#FFFFFF]" style={{ left: -6 * i, ...bg(id) }} />
            ))}
            <span className="relative -left-1 text-[13px] font-medium leading-4 text-ink">{gift.people - 4} more</span>
          </div>
          <MiniButton leading={G.swap()} className="h-8 rounded-[10px] px-3">
            Replace for all {gift.people}
          </MiniButton>
        </div>
      </div>
    </>
  )
}

// ── 04b·C · Everyone ────────────────────────────────────────────────────────

type Filter = 'all' | 'needs' | 'changed'

function RecipientRow({ r, hovered, onHover, action }: { r: Recipient; hovered: boolean; onHover: () => void; action: ReactNode }) {
  return (
    <div onMouseEnter={onHover} className={cn('relative -mx-2 flex items-center gap-3 rounded-[12px] p-2', hovered && 'bg-page')}>
      <Face id={r.face} />
      <div className="flex min-w-0 grow basis-0 flex-col gap-1">
        <NameLine name={r.name} company={r.company} />
        {r.needs ? (
          <span className="text-[12px] leading-4 text-amber-text">{r.status}</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] leading-4 text-grey-2">{r.status}</span>
            {r.changed && <span className="rounded-[6px] bg-fill px-1.5 py-px text-[11.5px] font-medium leading-4 text-grey-1">Changed by you</span>}
          </div>
        )}
      </div>
      <span className="h-8 w-8 shrink-0 rounded-[8px] bg-cover bg-center" style={bg(r.gift)} />
      {hovered && (
        <div className="absolute right-2 top-[10px] flex pl-8" style={FADE}>{action}</div>
      )}
    </div>
  )
}

function Everyone({ onGo, onClose, onSwap }: PanelProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [hovered, setHovered] = useState<string | null>('Kenji Tanaka')
  const q = query.trim().toLowerCase()
  const match = (r: Recipient) => !q || `${r.name} ${r.company} ${r.status}`.toLowerCase().includes(q)
  const needs = RECIPIENTS.filter((r) => r.needs && match(r) && filter !== 'changed')
  const ready = RECIPIENTS.filter((r) => !r.needs && match(r) && filter !== 'needs' && (filter !== 'changed' || r.changed))

  function row(r: Recipient) {
    const action = r.needs ? (
      <RowAction icon={G.plus(13, '#111216', 1.6)} onClick={() => onGo('addresses')}>
        Add address
      </RowAction>
    ) : (
      <RowAction onClick={onSwap}>Change gift</RowAction>
    )
    return <RecipientRow key={r.name} r={r} hovered={hovered === r.name} onHover={() => setHovered(r.name)} action={action} />
  }

  return (
    <>
      <InspectorBack label="Diwali gift" onBack={() => onGo('gifts')} onClose={onClose} />
      <div className="flex items-baseline gap-2 text-[18px] font-semibold leading-6 tracking-[-0.015em]">
        <span className="text-ink">Everyone</span>
        <span className="font-medium text-grey-3">48</span>
      </div>
      <label className="flex h-10 shrink-0 cursor-text items-center gap-2 rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]">
        {G.search()}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people or gifts"
          className="min-w-0 grow bg-transparent text-[13.5px] leading-4 text-ink outline-none placeholder:text-grey-3"
        />
      </label>
      <PanelSegmented<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All', count: 48 },
          { value: 'needs', label: 'Needs you', count: 7, countTone: 'amber' },
          { value: 'changed', label: 'Changed', count: 1 },
        ]}
      />
      <div onMouseLeave={() => setHovered(null)} className="flex flex-col gap-4">
        {needs.length > 0 && (
          <div className="flex flex-col gap-1 pt-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[12.5px] font-semibold leading-4 text-ink">Needs you · 7</span>
              <PanelLink onClick={() => onGo('addresses')}>Add addresses</PanelLink>
            </div>
            {needs.map(row)}
          </div>
        )}
        {ready.length > 0 && (
          <div className={cn('flex flex-col gap-1', needs.length > 0 ? 'border-t border-line-soft pt-3' : 'pt-2')}>
            <div className="flex items-center justify-between pb-1">
              <span className="text-[12.5px] font-semibold leading-4 text-ink">{filter === 'changed' ? 'Changed · 1' : 'Ready to ship · 41'}</span>
              <span className="text-[12.5px] leading-4 text-grey-3">Sorted by gift</span>
            </div>
            {ready.map(row)}
          </div>
        )}
        {needs.length === 0 && ready.length === 0 && <span className="pt-2 text-[12.5px] leading-4 text-grey-3">No one matches “{query}”</span>}
      </div>
    </>
  )
}

// ── 04b·D · Addresses ───────────────────────────────────────────────────────

function Addresses({ onGo, onClose }: PanelProps) {
  const [resolved, setResolved] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string>('ethan')
  const [hovered, setHovered] = useState<string | null>('sofia')
  const [typed, setTyped] = useState('')
  const missing = 7 - resolved.length
  const open = MISSING_ADDRESSES.filter((p) => !resolved.includes(p.id))

  function resolve(id: string) {
    const rest = open.filter((p) => p.id !== id)
    setResolved((r) => [...r, id])
    setTyped('')
    setExpanded(rest[0]?.id ?? '')
  }

  return (
    <>
      <InspectorBack label="Diwali gift" onBack={() => onGo('gifts')} onClose={onClose} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[18px] font-semibold leading-6 tracking-[-0.015em] text-ink">Addresses</span>
          <span className="text-[13px] leading-5 text-grey-2">
            Gifty found {41 + resolved.length} of 48. Add the other {missing}, or they skip the postcard and gift.
          </span>
        </div>
        <ProgressSplit found={41 + resolved.length} missing={missing} gap={4} />
      </div>
      <div className="flex flex-col gap-1 pt-2" onMouseLeave={() => setHovered(null)}>
        <div className="flex items-center justify-between pb-1">
          <span className="text-[12.5px] font-semibold leading-4 text-ink">Couldn’t find · {missing}</span>
        </div>
        {open.map((p) =>
          p.id === expanded ? (
            <div key={p.id} className="flex flex-col gap-3 rounded-[14px] p-4 shadow-[inset_0_0_0_1.5px_#6559F7]">
              <div className="flex items-center gap-3">
                <Face id={p.face} />
                <div className="flex min-w-0 grow basis-0 flex-col gap-1">
                  <NameLine name={p.name} company={p.company} />
                  <span className="text-[12px] leading-4 text-amber-text">{p.status}</span>
                </div>
              </div>
              {p.suggestion && (
                <div className="flex items-center gap-3 rounded-[10px] bg-page p-3">
                  <span className="h-10 w-10 shrink-0 rounded-[8px] bg-cover bg-center" style={bg(OFFICE_MAP)} />
                  <div className="flex min-w-0 grow basis-0 flex-col gap-0.5">
                    <span className="text-[13px] font-medium leading-4 text-ink">{p.suggestion.line}</span>
                    <span className="text-[12px] leading-4 text-grey-2">{p.suggestion.note}</span>
                  </div>
                  <button type="button" onClick={() => resolve(p.id)} className="cursor-pointer whitespace-nowrap text-[12.5px] font-semibold leading-4 text-violet-link hover:underline">
                    Use this
                  </button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (typed.trim()) resolve(p.id)
                }}
                className="flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]"
              >
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Or type a home address"
                  className="min-w-0 grow basis-0 bg-transparent text-[13.5px] leading-4 text-ink outline-none placeholder:text-grey-3"
                />
                <span className="text-[12px] leading-4 text-grey-3">⏎</span>
              </form>
            </div>
          ) : (
            <div
              key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onClick={() => setExpanded(p.id)}
              className={cn('relative -mx-2 flex cursor-pointer items-center gap-3 rounded-[12px] p-2', hovered === p.id && 'bg-page')}
            >
              <Face id={p.face} />
              <div className="flex min-w-0 grow basis-0 flex-col gap-1">
                <NameLine name={p.name} company={p.company} />
                <span className="text-[12px] leading-4 text-amber-text">{p.status}</span>
              </div>
              {hovered === p.id && (
                <div className="absolute right-2 top-[10px] flex pl-8" style={FADE}>
                  <RowAction icon={G.plus(13, '#111216', 1.6)} onClick={() => setExpanded(p.id)}>
                    Add address
                  </RowAction>
                </div>
              )}
            </div>
          ),
        )}
        {missing > open.length && (
          <button type="button" className="flex cursor-pointer items-center gap-1.5 py-2 text-[13px] font-medium leading-4 text-ink hover:text-grey-1">
            Show {missing - open.length} more
            {G.chevronDown('#55575F')}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-line-soft pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium leading-4 text-ink">Found · {41 + resolved.length}</span>
          <span className="text-[12px] leading-4 text-grey-3">Rechecked the day before shipping</span>
        </div>
        <button type="button" onClick={() => onGo('everyone')} className="flex cursor-pointer items-center gap-1 text-[12.5px] font-medium leading-4 text-grey-1 hover:text-ink">
          View
          {G.chevronRight(1.5)}
        </button>
      </div>
    </>
  )
}
