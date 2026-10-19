// The gift step: Gifty's picks, addresses, the card note, a gift's detail, everyone, and swapping one person.
import { useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { InspectorBack, InspectorClose, InspectorTabs, MiniButton, PanelLink, PanelSection, PanelSegmented, ProgressSplit, RowAction } from '@/components/canvas'
import { G } from '@/components/canvas/glyphs'
import { PersonAvatar } from '@/components/audience/marks'
import { PanelFrame } from '@/components/panels/FloatingPanel'
import { useGiftyTyping } from '@/canvas/copy'
import { giftById, GIFTS, teammate, type Gift } from '@/data/catalog'
import type { Person } from '@/data/people'
import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { DAY, fmtDay, money } from '@/lib/time'
import { GIFT_TRANSIT, nodeDays } from '@/store/graph'
import { alternatives, giftAssignments } from '@/store/gifts'
import { activePeople } from '@/store/sim'
import { useStore } from '@/store/store'
import { copyCtx, giftyGiftNote } from '@/store/templates'
import type { Loop, Ship, StepNode } from '@/store/types'
import { Footer, GiftyWriteButton, SaveButton, Toggle } from './kit'

type GiftNode = Extract<StepNode, { type: 'gift' }>
type View = { tab: 'gifts' } | { tab: 'addresses' } | { tab: 'note' } | { tab: 'gift'; giftId: string } | { tab: 'everyone' }

const bg = (id: string) => ({ backgroundImage: `url(${asset(id)})` })
const FADE = { background: 'linear-gradient(90deg, rgba(246,246,244,0) 0, #F6F6F4 32px)' }

const SHIP_NOTES: Record<Ship, string> = {
  best: 'Office if they’re in 3+ days a week, home otherwise',
  home: 'Home for everyone, office only if there’s no home address',
  office: 'Office for everyone, home if they’re fully remote',
}

export function GiftPanel({ loop, node, onClose }: { loop: Loop; node: GiftNode; onClose: () => void }) {
  // ── Store ────────────────────────────────────────────────────────
  const updateStep = useStore((s) => s.updateStep)
  const removeNode = useStore((s) => s.removeNode)
  const resolveAddresses = useStore((s) => s.resolveAddresses)
  const toast = useStore((s) => s.toast)

  // ── Local state ──────────────────────────────────────────────────
  const [view, setView] = useState<View>({ tab: 'gifts' })
  const [swapFor, setSwapFor] = useState<Person | null>(null)
  const typing = useGiftyTyping(120)

  // ── Derived ──────────────────────────────────────────────────────
  const d = node.data
  const update = (p: Partial<GiftNode['data']>) => updateStep(loop.id, node.id, p as never)
  const people = activePeople(loop)
  const assigned = useMemo(() => giftAssignments(loop, d), [loop, d])
  const found = people.filter((p) => p.address).length
  const missing = people.length - found
  const day = nodeDays(loop.graph, loop.startAt)[node.id] ?? 0
  const lands = fmtDay(loop.startAt + (day + GIFT_TRANSIT) * DAY)
  const total = Object.values(assigned).reduce((a, id) => a + giftById(id).price, 0)
  const counts = Object.values(assigned).reduce<Record<string, number>>((a, id) => ({ ...a, [id]: (a[id] ?? 0) + 1 }), {})
  const giftIds = Object.keys(counts)

  // ── Handlers ─────────────────────────────────────────────────────
  function close() {
    onClose()
  }
  function replaceAll(from: string, to: string) {
    update({ picks: d.picks.map((p) => (p.giftId === from ? { ...p, giftId: to } : p)), swaps: Object.fromEntries(Object.entries(d.swaps).filter(([, g]) => g !== from)) })
    toast(`${giftById(to).name} for all ${counts[from]}`)
    setView({ tab: 'gift', giftId: to })
  }
  function swapOne(slug: string, giftId: string) {
    update({ swaps: { ...d.swaps, [slug]: giftId } })
    setSwapFor(null)
    toast('Gift changed for one person')
  }

  // ── Render ───────────────────────────────────────────────────────
  const header =
    view.tab === 'gift' || view.tab === 'everyone' ? (
      <div className="px-6 pt-6">
        <InspectorBack label={d.title} onBack={() => setView({ tab: 'gifts' })} onClose={close} />
      </div>
    ) : (
      <div className="flex flex-col gap-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-[42px] w-[42px] shrink-0 flex-wrap gap-0.5 overflow-clip rounded-[10px]">
              {giftIds.slice(0, 4).map((id) => (
                <span key={id} className={cn('shrink-0 bg-cover bg-center', giftIds.length === 1 ? 'h-[42px] w-[42px]' : 'h-5 w-5')} style={bg(giftById(id).img)} />
              ))}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-ink">{d.title}</span>
              <span className="text-[12.5px] leading-4 text-grey-3">
                Lands by {lands} · {people.length} people
              </span>
            </div>
          </div>
          <InspectorClose onClick={close} />
        </div>
        <InspectorTabs<'gifts' | 'addresses' | 'note'>
          compact
          value={view.tab}
          onChange={(tab) => setView({ tab })}
          tabs={[
            { value: 'gifts', label: 'Gifts' },
            { value: 'addresses', label: missing ? `Addresses · ${missing}` : 'Addresses' },
            { value: 'note', label: 'Card note' },
          ]}
        />
      </div>
    )

  const footer =
    view.tab === 'gifts' || view.tab === 'note' || view.tab === 'addresses' ? (
      <div className="flex flex-col gap-2 border-t border-line-soft px-6 pb-5 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] leading-4 text-grey-2">{people.length} gifts, shipping included</span>
          <span className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-ink" data-testid="gift-total">
            {money(total)}
          </span>
        </div>
        <Footer
          onRemove={() => {
            onClose()
            removeNode(loop.id, node.id)
          }}
        >
          <SaveButton
            onSaved={() => {
              onClose()
              toast('Gift step saved')
            }}
          >
            Save gift step
          </SaveButton>
        </Footer>
      </div>
    ) : undefined

  return (
    <>
      <PanelFrame header={header} footer={footer} bodyClassName="px-6 pb-5 pt-4">
        {view.tab === 'gifts' && (
          <GiftsTab d={d} counts={counts} found={found} total={people.length} onOpen={(giftId) => setView({ tab: 'gift', giftId })} onEveryone={() => setView({ tab: 'everyone' })} onAddresses={() => setView({ tab: 'addresses' })} onShip={(ship) => update({ ship })} />
        )}
        {view.tab === 'addresses' && <AddressesTab people={people} onResolve={(slug, line) => resolveAddresses(loop.id, { [slug]: line })} onEveryone={() => setView({ tab: 'everyone' })} />}
        {view.tab === 'note' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold leading-[18px] text-ink">Card in the box</span>
                <span className="text-[12px] leading-4 text-grey-3">{d.noteOn ? 'Printed inside every box' : 'No card, just the gift'}</span>
              </div>
              <Toggle on={d.noteOn} onChange={(noteOn) => update({ noteOn })} label="Card in the box" />
            </div>
            {d.noteOn && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-3 rounded-[12px] p-4 shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]">
                  <div className="flex items-center gap-0.5 text-[13.5px] leading-5 text-ink">
                    Dear
                    <span className="mx-0.5 rounded-[6px] bg-[#F1EEFF] px-1.5 py-0.5 text-[12.5px] font-medium leading-4 text-[#4B33D6]">first name</span>,
                  </div>
                  <textarea
                    data-testid="gift-note"
                    value={d.note}
                    onChange={(e) => update({ note: e.target.value.slice(0, 280) })}
                    rows={4}
                    placeholder="A few warm lines. No ask needed."
                    className="resize-none bg-transparent text-[13.5px] leading-5 text-ink outline-none placeholder:text-grey-3"
                  />
                  <div className="flex items-center justify-between border-t border-line-soft pt-2.5">
                    <span className="text-[13.5px] leading-5 text-ink">{teammate(loop.senderId).first}</span>
                    <GiftyWriteButton empty={!d.note.trim()} busy={typing.busy} onClick={() => typing.start(giftyGiftNote(copyCtx(loop)), (note) => update({ note }))} />
                  </div>
                </div>
                <span className="text-[12px] leading-4 text-grey-3">{d.note.length} of 280 characters, handwritten font</span>
              </div>
            )}
          </div>
        )}
        {view.tab === 'gift' && <GiftDetail gift={giftById(view.giftId)} people={people.filter((p) => assigned[p.slug] === view.giftId)} picked={giftIds} onReplaceAll={(to) => replaceAll(view.giftId, to)} onSwap={setSwapFor} />}
        {view.tab === 'everyone' && <Everyone people={people} assigned={assigned} swaps={d.swaps} onSwap={setSwapFor} onAddresses={() => setView({ tab: 'addresses' })} />}
      </PanelFrame>
      {swapFor && createPortal(<SwapGiftModal person={swapFor} current={assigned[swapFor.slug]} onClose={() => setSwapFor(null)} onCommit={(g) => swapOne(swapFor.slug, g)} />, document.body)}
    </>
  )
}

// ── Gifts tab ───────────────────────────────────────────────────────────────

function GiftsTab({
  d,
  counts,
  found,
  total,
  onOpen,
  onEveryone,
  onAddresses,
  onShip,
}: {
  d: GiftNode['data']
  counts: Record<string, number>
  found: number
  total: number
  onOpen: (id: string) => void
  onEveryone: () => void
  onAddresses: () => void
  onShip: (s: Ship) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const changed = Object.keys(d.swaps).length
  return (
    <div className="flex flex-col gap-6">
      <PanelSection title="Gifty’s picks" meta={`${Object.keys(counts).length} gifts, ${total} people${changed ? `, ${changed} changed by you` : ''}`} action={<PanelLink onClick={onEveryone}>See everyone</PanelLink>}>
        <div className="flex flex-col gap-2" onMouseLeave={() => setHovered(null)}>
          {Object.entries(counts).map(([id, n]) => {
            const g = giftById(id)
            const on = hovered === id
            return (
              <div key={id} data-testid={`pick-${id}`} onMouseEnter={() => setHovered(id)} onClick={() => onOpen(id)} className="relative flex cursor-pointer items-center gap-3 py-0.5">
                {on && <span className="absolute -inset-x-2 -inset-y-[3px] rounded-[12px] bg-page" />}
                <span className="relative h-11 w-11 shrink-0 rounded-[11px] bg-cover bg-center" style={bg(g.img)} />
                <div className="relative flex grow flex-col gap-0.5">
                  <span className="text-[13.5px] font-medium leading-[18px] text-ink">{g.name}</span>
                  <span className="text-[12px] leading-4 text-grey-3">{on ? `${n} ${n === 1 ? 'person' : 'people'} · $${g.price}` : g.why}</span>
                </div>
                {on ? (
                  <div className="relative flex items-center gap-1">
                    <MiniButton onClick={() => onOpen(id)}>Replace</MiniButton>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center">{G.chevronRight()}</span>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-end gap-0.5">
                    <span className="text-[13.5px] font-medium leading-[18px] text-ink">${g.price}</span>
                    <span className="text-[12px] leading-4 text-grey-3">
                      {n} {n === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </PanelSection>

      {d.kind === 'gift' && (
        <button type="button" onClick={onAddresses} className="group flex cursor-pointer flex-col gap-2 text-left">
          <div className="flex w-full items-baseline justify-between">
            <span className="text-[13.5px] font-semibold leading-[18px] text-ink">Addresses</span>
            <span className="flex gap-1 text-[12.5px] leading-4">
              <span className="font-semibold text-ink">{found}</span>
              <span className="text-grey-3 group-hover:text-grey-1">of {total} found</span>
            </span>
          </div>
          <div className="w-full">
            <ProgressSplit found={found} missing={total - found} />
          </div>
        </button>
      )}

      {d.kind === 'gift' && (
        <PanelSection title="Ship to" size="lg">
          <PanelSegmented<Ship>
            value={d.ship}
            onChange={onShip}
            options={[
              { value: 'best', label: 'Best per person', grow: 1.2 },
              { value: 'home', label: 'Home first' },
              { value: 'office', label: 'Office first' },
            ]}
          />
          <span className="text-[12px] leading-4 text-grey-3">{SHIP_NOTES[d.ship]}</span>
        </PanelSection>
      )}
    </div>
  )
}

// ── Addresses ───────────────────────────────────────────────────────────────

function NameLine({ name, company }: { name: ReactNode; company: ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="whitespace-nowrap text-[13.5px] font-medium leading-4 text-ink">{name}</span>
      <span className="truncate text-[12.5px] leading-4 text-grey-3">{company}</span>
    </div>
  )
}

function AddressesTab({ people, onResolve, onEveryone }: { people: Person[]; onResolve: (slug: string, line: string) => void; onEveryone: () => void }) {
  const open = people.filter((p) => !p.address)
  const found = people.length - open.length
  const [expanded, setExpanded] = useState<string>(open[0]?.slug ?? '')
  const [typed, setTyped] = useState('')

  function resolve(slug: string, line: string) {
    onResolve(slug, line)
    setTyped('')
    setExpanded(open.find((p) => p.slug !== slug)?.slug ?? '')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <span className="text-[13px] leading-5 text-grey-2">{open.length ? `Gifty found ${found} of ${people.length}. Add the other ${open.length}, or they skip the postcard and gift.` : `Every address found. Rechecked the day before shipping.`}</span>
        <ProgressSplit found={found} missing={open.length} gap={4} />
      </div>
      <div className="flex flex-col gap-1">
        {open.length > 0 && <span className="pb-1 text-[12.5px] font-semibold leading-4 text-ink">Couldn’t find · {open.length}</span>}
        {open.map((p) =>
          p.slug === expanded ? (
            <div key={p.slug} className="flex flex-col gap-3 rounded-[14px] p-4 shadow-[inset_0_0_0_1.5px_#6559F7]">
              <div className="flex items-center gap-3">
                <PersonAvatar person={p} size={36} />
                <div className="flex min-w-0 grow basis-0 flex-col gap-1">
                  <NameLine name={p.name} company={p.company} />
                  <span className="text-[12px] leading-4 text-amber-text">{p.addressHint?.waitingOn ? `Waiting on ${p.addressHint.waitingOn}` : 'No address found'}</span>
                </div>
              </div>
              {p.addressHint?.options?.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-[10px] bg-page p-3">
                  <div className="flex min-w-0 grow basis-0 flex-col gap-0.5">
                    <span className="text-[13px] font-medium leading-4 text-ink">{o.title}</span>
                    <span className="text-[12px] leading-4 text-grey-2">{o.sub}</span>
                  </div>
                  <button type="button" onClick={() => resolve(p.slug, o.title)} className="cursor-pointer whitespace-nowrap text-[12.5px] font-semibold leading-4 text-violet-link hover:underline">
                    Use this
                  </button>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (typed.trim()) resolve(p.slug, typed.trim())
                }}
                className="flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]"
              >
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Type an address and press Enter"
                  className="min-w-0 grow basis-0 bg-transparent text-[13.5px] leading-4 text-ink outline-none placeholder:text-grey-3"
                />
                <span className="text-[12px] leading-4 text-grey-3">⏎</span>
              </form>
            </div>
          ) : (
            <div key={p.slug} onClick={() => setExpanded(p.slug)} className="group relative -mx-2 flex cursor-pointer items-center gap-3 rounded-[12px] p-2 hover:bg-page">
              <PersonAvatar person={p} size={36} />
              <div className="flex min-w-0 grow basis-0 flex-col gap-1">
                <NameLine name={p.name} company={p.company} />
                <span className="text-[12px] leading-4 text-amber-text">{p.addressHint?.note.split('.')[0] ?? 'No address found'}</span>
              </div>
              <div className="absolute right-2 top-[10px] hidden pl-8 group-hover:flex" style={FADE}>
                <RowAction icon={G.plus(13, '#111216', 1.6)} onClick={() => setExpanded(p.slug)}>
                  Add address
                </RowAction>
              </div>
            </div>
          ),
        )}
      </div>
      <div className="flex items-center justify-between border-t border-line-soft pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium leading-4 text-ink">Found · {found}</span>
          <span className="text-[12px] leading-4 text-grey-3">Rechecked the day before shipping</span>
        </div>
        <button type="button" onClick={onEveryone} className="flex cursor-pointer items-center gap-1 text-[12.5px] font-medium leading-4 text-grey-1 hover:text-ink">
          View
          {G.chevronRight(1.5)}
        </button>
      </div>
    </div>
  )
}

// ── One gift ────────────────────────────────────────────────────────────────

function GiftDetail({ gift, people, picked, onReplaceAll, onSwap }: { gift: Gift; people: Person[]; picked: string[]; onReplaceAll: (to: string) => void; onSwap: (p: Person) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [choosing, setChoosing] = useState(false)
  const shown = people.slice(0, 4)
  return (
    <div className="flex flex-col gap-5">
      <div className="relative h-[176px] w-full shrink-0 overflow-clip rounded-[14px] bg-cover bg-center" style={bg(gift.img)}>
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
        <p className="m-0 text-[13px] leading-5 text-grey-2">{gift.copy} Wrapped, with Sam’s card inside.</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-line-soft pt-5">
        <div className="flex items-baseline gap-2 pb-1">
          <span className="text-[14px] font-semibold leading-5 text-ink">Picked for {people.length}</span>
          <span className="text-[12.5px] leading-4 text-grey-3">based on their profile and activity</span>
        </div>
        <div className="flex flex-col gap-2" onMouseLeave={() => setHovered(null)}>
          {shown.map((p) => (
            <div key={p.slug} onMouseEnter={() => setHovered(p.slug)} className={cn('relative -mx-2 flex items-start gap-3 rounded-[12px] p-2', hovered === p.slug && 'bg-page')}>
              <PersonAvatar person={p} size={36} />
              <div className="flex min-w-0 grow basis-0 flex-col gap-1">
                <NameLine name={p.name} company={p.company} />
                <span className="text-[12.5px] leading-4 text-grey-1">{p.knows ? `${p.knows.detail}` : gift.why}</span>
                {!p.address && <span className="pt-0.5 text-[12px] font-medium leading-4 text-amber-text">Gifty couldn’t find an address</span>}
              </div>
              {hovered === p.slug && (
                <div className="absolute right-2 top-[-14px] z-10">
                  <RowAction onClick={() => onSwap(p)}>Change gift</RowAction>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[13px] font-medium leading-4 text-ink">{people.length > 4 ? `${people.length - 4} more` : ''}</span>
          <MiniButton leading={G.swap()} className="h-8 rounded-[10px] px-3" onClick={() => setChoosing((c) => !c)}>
            Replace for all {people.length}
          </MiniButton>
        </div>
        {choosing && (
          <div className="mt-2 flex flex-col gap-1 rounded-[12px] p-1.5 shadow-[inset_0_0_0_1px_#EBEBE8]">
            {alternatives([gift.id, ...picked]).map((g) => (
              <button key={g.id} type="button" onClick={() => onReplaceAll(g.id)} className="flex cursor-pointer items-center gap-3 rounded-[9px] p-2 text-left hover:bg-page">
                <span className="h-8 w-8 shrink-0 rounded-[8px] bg-cover bg-center" style={bg(g.img)} />
                <span className="grow text-[13px] font-medium leading-4 text-ink">{g.name}</span>
                <span className="text-[12.5px] leading-4 text-grey-3">${g.price}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Everyone ────────────────────────────────────────────────────────────────

function Everyone({ people, assigned, swaps, onSwap, onAddresses }: { people: Person[]; assigned: Record<string, string>; swaps: Record<string, string>; onSwap: (p: Person) => void; onAddresses: () => void }) {
  const [filter, setFilter] = useState<'all' | 'needs' | 'changed'>('all')
  const [query, setQuery] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const q = query.trim().toLowerCase()
  const match = (p: Person) => !q || `${p.name} ${p.company} ${giftById(assigned[p.slug]).name}`.toLowerCase().includes(q)
  const needs = people.filter((p) => !p.address && match(p) && filter !== 'changed')
  const ready = people.filter((p) => p.address && match(p) && filter !== 'needs' && (filter !== 'changed' || swaps[p.slug]))
  const changed = Object.keys(swaps).length

  function row(p: Person) {
    const g = giftById(assigned[p.slug])
    return (
      <div key={p.slug} onMouseEnter={() => setHovered(p.slug)} className={cn('relative -mx-2 flex items-center gap-3 rounded-[12px] p-2', hovered === p.slug && 'bg-page')}>
        <PersonAvatar person={p} size={36} />
        <div className="flex min-w-0 grow basis-0 flex-col gap-1">
          <NameLine name={p.name} company={p.company} />
          {!p.address ? (
            <span className="text-[12px] leading-4 text-amber-text">No address yet</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] leading-4 text-grey-2">{g.name}</span>
              {swaps[p.slug] && <span className="rounded-[6px] bg-fill px-1.5 py-px text-[11.5px] font-medium leading-4 text-grey-1">Changed by you</span>}
            </div>
          )}
        </div>
        <span className="h-8 w-8 shrink-0 rounded-[8px] bg-cover bg-center" style={bg(g.img)} />
        {hovered === p.slug && (
          <div className="absolute right-2 top-[10px] flex pl-8" style={FADE}>
            {!p.address ? (
              <RowAction icon={G.plus(13, '#111216', 1.6)} onClick={onAddresses}>
                Add address
              </RowAction>
            ) : (
              <RowAction onClick={() => onSwap(p)}>Change gift</RowAction>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2 text-[18px] font-semibold leading-6 tracking-[-0.015em]">
        <span className="text-ink">Everyone</span>
        <span className="font-medium text-grey-3">{people.length}</span>
      </div>
      <label className="flex h-10 shrink-0 cursor-text items-center gap-2 rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]">
        {G.search()}
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people or gifts" className="min-w-0 grow bg-transparent text-[13.5px] leading-4 text-ink outline-none placeholder:text-grey-3" />
      </label>
      <PanelSegmented<'all' | 'needs' | 'changed'>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All', count: people.length },
          { value: 'needs', label: 'Needs you', count: people.filter((p) => !p.address).length, countTone: 'amber' },
          { value: 'changed', label: 'Changed', count: changed },
        ]}
      />
      <div onMouseLeave={() => setHovered(null)} className="flex flex-col gap-4">
        {needs.length > 0 && (
          <div className="flex flex-col gap-1 pt-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[12.5px] font-semibold leading-4 text-ink">Needs you · {needs.length}</span>
              <PanelLink onClick={onAddresses}>Add addresses</PanelLink>
            </div>
            {needs.map(row)}
          </div>
        )}
        {ready.length > 0 && (
          <div className={cn('flex flex-col gap-1', needs.length > 0 ? 'border-t border-line-soft pt-3' : 'pt-2')}>
            <div className="flex items-center justify-between pb-1">
              <span className="text-[12.5px] font-semibold leading-4 text-ink">{filter === 'changed' ? `Changed · ${ready.length}` : `Ready to ship · ${ready.length}`}</span>
              <span className="text-[12.5px] leading-4 text-grey-3">Sorted by gift</span>
            </div>
            {ready.map(row)}
          </div>
        )}
        {needs.length === 0 && ready.length === 0 && <span className="pt-2 text-[12.5px] leading-4 text-grey-3">No one matches{query ? ` “${query}”` : ''}</span>}
      </div>
    </div>
  )
}

// ── Swap one person's gift ──────────────────────────────────────────────────

export function SwapGiftModal({ person, current, onClose, onCommit }: { person: Person; current: string; onClose: () => void; onCommit: (giftId: string) => void }) {
  const options = GIFTS.filter((g) => g.id !== current).slice(0, 3)
  const [pick, setPick] = useState(options[0].id)
  const now = giftById(current)
  const choice = giftById(pick)
  const delta = now.price - choice.price
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 animate-[fade_.15s_ease-out] bg-[#11121652]" onClick={onClose} />
      <div role="dialog" aria-modal className="relative flex w-[600px] shrink-0 animate-[fade_.15s_ease-out] flex-col overflow-clip rounded-card bg-white shadow-[0_24px_64px_-24px_#11121673]">
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <PersonAvatar person={person} size={40} />
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-ink">Gift for {person.name}</span>
              <span className="text-[12.5px] leading-4 text-grey-3">
                {person.role}, {person.company}
                {person.address ? ` · ${person.address.line.split(', ').pop()}` : ''}
              </span>
            </div>
          </div>
          <InspectorClose onClick={onClose} />
        </div>
        <div className="flex gap-4 p-6">
          <span className="h-24 w-24 shrink-0 rounded-[14px] bg-cover bg-center" style={bg(now.img)} />
          <div className="flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold leading-5 text-ink">{now.name}</span>
              <span className="rounded-full bg-fill px-2 py-1 text-[12px] font-medium leading-4 text-grey-1">Gifty’s pick</span>
            </div>
            <p className="m-0 text-[13.5px] leading-5 text-grey-1">{person.knows ? `${person.knows.detail}. ` : ''}${now.price} with card and shipping.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 px-6 pb-6">
          <span className="text-[13.5px] font-semibold leading-4 text-ink">Other good fits</span>
          <div className="flex gap-3">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setPick(o.id)}
                className={cn('flex grow basis-0 cursor-pointer flex-col gap-3 rounded-[14px] px-2 pb-3 pt-2 text-left transition-shadow', o.id === pick ? 'shadow-[inset_0_0_0_1.5px_#6559F7]' : 'shadow-[inset_0_0_0_1px_#EBEBE8] hover:shadow-[inset_0_0_0_1px_#D6D6D2]')}
              >
                <span className="h-28 w-full shrink-0 rounded-[10px] bg-cover bg-center" style={bg(o.img)} />
                <span className="flex flex-col gap-1 px-1">
                  <span className="text-[13px] font-semibold leading-4 text-ink">{o.name}</span>
                  <span className="text-[12px] leading-4 text-grey-3">
                    ${o.price} · {o.why.toLowerCase()}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-line-soft bg-fill-hover px-6 py-4">
          <span className="text-[13px] leading-4 text-grey-1">{delta >= 0 ? `Saves $${delta} on this loop` : `Adds $${-delta} to this loop`}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="cursor-pointer rounded-[10px] bg-white px-4 py-3 text-[13.5px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover">
              Keep the {now.short}
            </button>
            <button type="button" onClick={() => onCommit(choice.id)} className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-4 py-3 text-[13.5px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Give the {choice.short}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
