import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePresence } from '@/components/panels/FloatingPanel'
import { BUDGETS, LISTS, TEAMMATES } from '@/data/catalog'
import { GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { budgetEntity, extractEntities, listEntity, senderEntity, type Entity } from '@/store/entities'
import { useStore } from '@/store/store'
import { RECIPES } from '@/store/templates'
import { CalendarIcon, HubDot, Photo, VIOLET_BTN, WHITE_BTN } from './parts'

const PLACEHOLDER = 'Describe who you want to reach and how, e.g. book meetings with VP Sales at our Q4 accounts before Diwali'
const MIN_CHARS = 15

type Mention = { start: number; query: string }

/** The "@word" the caret is in, if any. */
function findMention(text: string, caret: number): Mention | null {
  let i = caret - 1
  while (i >= 0 && !/\s/.test(text[i]) && text[i] !== '@') i--
  if (i < 0 || text[i] !== '@') return null
  if (i > 0 && !/\s/.test(text[i - 1])) return null
  return { start: i, query: text.slice(i + 1, caret) }
}

type PickerItem = { id: string; name: string; meta: string; kind: 'hubspot' | 'saved' | 'person' | 'budget'; entity: Entity; face?: string }

const PICKER: { label: string; items: PickerItem[] }[] = [
  {
    label: 'HubSpot lists',
    items: LISTS.filter((l) => l.source === 'hubspot' && !l.spotted).map((l) => ({ id: l.id, name: l.name, meta: l.meta, kind: 'hubspot' as const, entity: listEntity(l) })),
  },
  {
    label: 'Saved in DelightLoop',
    items: LISTS.filter((l) => l.source === 'saved' && !l.spotted).map((l) => ({ id: l.id, name: l.name, meta: l.meta, kind: 'saved' as const, entity: listEntity(l) })),
  },
  {
    label: 'People',
    items: TEAMMATES.map((t) => ({ id: t.id, name: t.name, meta: `${t.role} · sends from their inbox`, kind: 'person' as const, entity: senderEntity(t), face: t.face })),
  },
  { label: 'Budgets', items: BUDGETS.map((b) => ({ id: b.id, name: b.name, meta: b.meta, kind: 'budget' as const, entity: budgetEntity(b.left) })) },
]

/** 02 · Start a new loop. Empty until the user writes; Gifty links what it recognises as they type. */
export function NewLoopModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mounted, shown } = usePresence(open, 150)
  if (!mounted) return null
  return <Modal shown={shown} onClose={onClose} />
}

function Modal({ shown, onClose }: { shown: boolean; onClose: () => void }) {
  // ── Router / store / refs ────────────────────────────────────────
  const navigate = useNavigate()
  const draftFromBrief = useStore((s) => s.draftFromBrief)
  const createFromRecipe = useStore((s) => s.createFromRecipe)
  const createBlank = useStore((s) => s.createBlank)
  const modalRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const markRef = useRef<HTMLSpanElement>(null)
  const pendingCaret = useRef<number | null>(null)
  const linkedRef = useRef<Entity[]>([])

  // ── Local state ──────────────────────────────────────────────────
  const [text, setText] = useState('')
  const [caret, setCaret] = useState(0)
  const [tokens, setTokens] = useState<string[]>([])
  const [pinned, setPinned] = useState<Entity[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [linked, setLinked] = useState<Entity[]>([])
  const [visible, setVisible] = useState(0)
  const [reading, setReading] = useState(false)
  const [dismissedAt, setDismissedAt] = useState<number | null>(null)
  const [highlight, setHighlight] = useState(0)
  const [pickerPos, setPickerPos] = useState({ left: 0, top: 0 })

  // ── Derived ──────────────────────────────────────────────────────
  const mention = findMention(text, caret)
  const live = mention && mention.start !== dismissedAt ? mention : null
  const pickerOpen = live !== null
  const query = live?.query.toLowerCase() ?? ''
  const groups = useMemo(
    () => PICKER.map((g) => ({ ...g, items: g.items.filter((it) => it.name.toLowerCase().includes(query)) })).filter((g) => g.items.length > 0),
    [query],
  )
  const flat = groups.flatMap((g) => g.items)
  linkedRef.current = linked
  const chips = linked.slice(0, visible)
  const hasAudience = linked.some((e) => e.kind === 'list')
  const longEnough = text.trim().length >= MIN_CHARS
  const canDraft = longEnough && hasAudience && !reading
  const hint = !text.trim() ? 'Type @ to add a list, a person or a budget' : !hasAudience ? 'Tell Gifty who it’s for, e.g. a list or “VP Sales at Q4 accounts”' : !longEnough ? 'Say a little more about what should happen' : 'Gifty drafts the steps, copy and gifts from this'

  // ── Handlers ─────────────────────────────────────────────────────
  function syncCaret() {
    const el = areaRef.current
    if (el) setCaret(el.selectionStart)
  }

  function choose(item: PickerItem) {
    if (!live) return
    const token = `@${item.name}`
    const next = text.slice(0, live.start) + token + ' ' + text.slice(caret)
    const pos = live.start + token.length + 1
    setTokens((t) => (t.includes(token) ? t : [...t, token]))
    setPinned((p) => [...p.filter((e) => e.kind !== item.entity.kind || item.entity.kind === 'sender'), item.entity])
    setDismissed((d) => d.filter((x) => x !== item.entity.id))
    setText(next)
    setCaret(pos)
    pendingCaret.current = pos
  }

  function removeChip(e: Entity) {
    setDismissed((d) => [...d, e.id])
    setPinned((p) => p.filter((x) => x.id !== e.id))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (pickerOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const step = e.key === 'ArrowDown' ? 1 : -1
        setHighlight((h) => (h + step + flat.length) % Math.max(flat.length, 1))
        return
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && flat[highlight]) {
        e.preventDefault()
        choose(flat[highlight])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setDismissedAt(live?.start ?? null)
        return
      }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canDraft) {
      e.preventDefault()
      draft()
    }
  }

  function draft() {
    if (!canDraft) return
    const id = draftFromBrief(text.trim(), linked)
    onClose()
    navigate(`/loops/${id}/build`)
  }

  function fromRecipe(rid: string) {
    const id = createFromRecipe(rid)
    onClose()
    navigate(`/loops/${id}/audience`)
  }

  function blank() {
    const id = createBlank()
    onClose()
    navigate(`/loops/${id}/audience`)
  }

  // ── Effects ──────────────────────────────────────────────────────
  // Gifty reads the description ~300ms after typing stops, then links what it found, one chip at a time.
  useEffect(() => {
    if (!text.trim()) {
      setLinked([])
      setVisible(0)
      setReading(false)
      return
    }
    setReading(true)
    const t = window.setTimeout(() => {
      const found = extractEntities(text).filter((e) => !dismissed.includes(e.id))
      const merged = [...pinned.filter((p) => !found.some((f) => f.kind === p.kind && f.kind !== 'sender')), ...found].filter(
        (e, i, all) => all.findIndex((x) => x.id === e.id) === i,
      )
      // A pinned @list wins over a list Gifty guessed.
      const pinnedList = pinned.find((p) => p.kind === 'list')
      const final = pinnedList ? [pinnedList, ...merged.filter((e) => e.kind !== 'list')] : merged
      const kept = linkedRef.current.filter((c) => final.some((f) => f.id === c.id)).length
      setLinked(final)
      setVisible(Math.min(kept, final.length))
      setReading(false)
    }, 300)
    return () => window.clearTimeout(t)
  }, [text, pinned, dismissed])

  // Reveal chips one by one.
  useEffect(() => {
    if (visible >= linked.length) return
    const t = window.setTimeout(() => setVisible((v) => v + 1), 140)
    return () => window.clearTimeout(t)
  }, [visible, linked.length])

  useEffect(() => setHighlight(0), [query])

  // Esc closes the modal (the picker handles its own Esc first).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    areaRef.current?.focus()
  }, [])

  useLayoutEffect(() => {
    const el = areaRef.current
    if (el && pendingCaret.current !== null) {
      el.setSelectionRange(pendingCaret.current, pendingCaret.current)
      pendingCaret.current = null
    }
  }, [text])

  // Anchor the picker under the "@word".
  useLayoutEffect(() => {
    if (!pickerOpen || !markRef.current || !modalRef.current) return
    const m = markRef.current.getBoundingClientRect()
    const box = modalRef.current.getBoundingClientRect()
    setPickerPos({ left: Math.min(m.left - box.left - 16, box.width - 416), top: m.top - box.top + m.height / 2 + 20 })
  }, [pickerOpen, text, caret])

  return (
    <div
      className={cn('fixed inset-0 z-50 flex items-center justify-center bg-[#11121652] transition-opacity duration-150', shown ? 'opacity-100' : 'opacity-0')}
      onMouseDown={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal
        aria-label="Start a new loop"
        data-testid="new-loop"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn('relative flex w-[640px] shrink-0 flex-col rounded-[20px] bg-white shadow-[0_24px_64px_-24px_#11121673] transition-transform duration-150', shown ? 'scale-100' : 'scale-[.98]')}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-[18px] font-semibold leading-6 tracking-[-0.01em] text-ink">Start a new loop</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-page hover:bg-fill">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#55575F" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 px-6 pt-6">
          <label htmlFor="loop-brief" className="text-[13px] font-medium leading-4 text-grey-1">
            What should this loop do?
          </label>
          <div className="flex flex-col gap-4 rounded-[14px] p-4 shadow-[inset_0_0_0_1.5px_#6559F7]">
            <div className="relative isolate min-h-[72px] text-[15px] leading-6">
              <Backdrop text={text} tokens={tokens} active={pickerOpen ? { start: live!.start, end: caret } : null} markRef={markRef} />
              <textarea
                id="loop-brief"
                data-testid="brief"
                ref={areaRef}
                value={text}
                spellCheck={false}
                onChange={(e) => {
                  setText(e.target.value)
                  setCaret(e.target.selectionStart)
                  setDismissedAt(null)
                }}
                onSelect={syncCaret}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 resize-none overflow-hidden whitespace-pre-wrap break-words bg-transparent p-0 font-sans text-[15px] leading-6 text-transparent caret-violet outline-none selection:bg-violet/20"
              />
            </div>
            <div className="flex flex-col gap-4">
              {(reading || chips.length > 0) && !pickerOpen && <LinkedChips chips={chips} reading={reading && chips.length === 0} onRemove={removeChip} />}
              <div className="flex items-center justify-between gap-4">
                <span className={cn('text-[12px] leading-4', text.trim() && !hasAudience ? 'text-amber-text' : 'text-grey-3')} data-testid="draft-hint">
                  {hint}
                </span>
                <button
                  data-testid="draft-with-gifty"
                  onClick={draft}
                  disabled={!canDraft}
                  className={cn(VIOLET_BTN, 'h-9 shrink-0 gap-2 rounded-[10px] px-3.5 text-[13px] font-semibold leading-4 disabled:cursor-not-allowed disabled:opacity-40')}
                >
                  Draft with Gifty
                  <svg width="14" height="14" viewBox="0 0 16 16">
                    <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <Recipes onPick={fromRecipe} />

        <div className="flex items-center justify-between gap-4 rounded-b-[20px] border-t border-line-soft bg-[#FAFAF9] px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13.5px] font-medium leading-4 text-ink">Rather build it yourself?</span>
            <span className="text-[12.5px] leading-4 text-grey-3">Add each step on the canvas. Gifty still suggests as you go.</span>
          </div>
          <button data-testid="start-blank" onClick={blank} className={cn(WHITE_BTN, 'h-10 shrink-0 gap-2 rounded-[10px] px-3.5 text-[13px] font-medium leading-4')}>
            <svg width="14" height="14" viewBox="0 0 16 16">
              <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" fill="none" stroke="#111216" strokeWidth="1.4" strokeDasharray="2.5 2" />
              <path d="M8 5.5v5M5.5 8h5" fill="none" stroke="#111216" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Start blank
          </button>
        </div>

        {pickerOpen && <MentionPicker groups={groups} flat={flat} highlight={highlight} onHover={setHighlight} onChoose={choose} query={live?.query ?? ''} style={pickerPos} />}
      </div>
    </div>
  )
}

// ── Composer backdrop: draws the text so tokens can be styled under a transparent textarea ──

const TOKEN_CLASS =
  "relative font-medium text-[#5547E6] before:absolute before:-inset-x-1 before:-inset-y-[3px] before:-z-10 before:rounded-[5px] before:bg-[#ECEAFE] before:content-['']"

function Backdrop({ text, tokens, active, markRef }: { text: string; tokens: string[]; active: { start: number; end: number } | null; markRef: RefObject<HTMLSpanElement> }) {
  const ranges: { start: number; end: number; active?: boolean }[] = []
  if (active) ranges.push({ ...active, active: true })
  for (const t of tokens) {
    let i = text.indexOf(t)
    while (i !== -1) {
      if (!ranges.some((r) => i < r.end && i + t.length > r.start)) ranges.push({ start: i, end: i + t.length })
      i = text.indexOf(t, i + t.length)
    }
  }
  ranges.sort((a, b) => a.start - b.start)

  const parts: ReactNode[] = []
  let at = 0
  ranges.forEach((r, k) => {
    if (r.start > at) parts.push(text.slice(at, r.start))
    parts.push(
      <span key={k} ref={r.active ? markRef : undefined} className={TOKEN_CLASS}>
        {text.slice(r.start, r.end)}
      </span>,
    )
    at = r.end
  })
  parts.push(text.slice(at))

  return (
    <div aria-hidden className="min-h-6 whitespace-pre-wrap break-words text-ink">
      {text ? parts : <span className="text-grey-3">{PLACEHOLDER}</span>}
      {'​'}
    </div>
  )
}

// ── Linked chips ──

function ChipIcon({ e }: { e: Entity }) {
  if (e.kind === 'list') return e.list.source === 'hubspot' ? <HubDot size={16} glyph={10} /> : <SavedIcon size={16} />
  if (e.kind === 'sender') return e.teammate.face ? <Photo id={e.teammate.face} className="h-4 w-4 rounded-full" /> : <Initials text={e.teammate.initials} />
  if (e.kind === 'moment') return <CalendarIcon />
  return <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-[#EAF5EF] text-[10px] font-semibold leading-3 text-green-text">$</span>
}

function Initials({ text, size = 16 }: { text: string; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-[#ECEBE7] font-semibold text-grey-1" style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {text}
    </span>
  )
}

function LinkedChips({ chips, reading, onRemove }: { chips: Entity[]; reading: boolean; onRemove: (e: Entity) => void }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line-soft pt-3.5" data-testid="linked">
      <span className={cn('text-[12px] leading-4', reading ? 'shimmer-text' : 'text-grey-3')}>{reading ? 'Gifty is reading…' : 'Gifty linked these from your words'}</span>
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((e) => (
            <div key={e.id} data-testid={`chip-${e.kind}`} className="flex h-7 animate-[chipIn_.18s_ease-out] items-center gap-1.5 rounded-[8px] bg-fill pl-1.5 pr-1">
              <ChipIcon e={e} />
              <span className="text-[12.5px] font-medium leading-4 text-ink">{e.label}</span>
              <span className="text-[12.5px] leading-4 text-grey-3">{e.meta}</span>
              <button type="button" aria-label={`Remove ${e.label}`} onClick={() => onRemove(e)} className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-[5px] hover:bg-[#E6E6E3]">
                <svg width="9" height="9" viewBox="0 0 16 16">
                  <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#8B8D95" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Recipes ──

function GmailSmall() {
  return (
    <svg width="16" height="12" viewBox="0 0 24 18" aria-label="Email">
      <path d="M1.6 18h3.8V8.7L0 4.6v11.8C0 17.3.7 18 1.6 18z" fill="#4285F4" />
      <path d="M18.6 18h3.8c.9 0 1.6-.7 1.6-1.6V4.6l-5.4 4.1V18z" fill="#34A853" />
      <path d="M18.6 1.6v7.1L24 4.6V2.4c0-2-2.3-3.1-3.9-1.9l-1.5 1.1z" fill="#FBBC04" />
      <path d="M5.4 8.7V1.6L12 6.5l6.6-4.9v7.1L12 13.6 5.4 8.7z" fill="#EA4335" />
      <path d="M0 2.4v2.2l5.4 4.1V1.6L3.9.5C2.3-.7 0 .4 0 2.4z" fill="#C5221F" />
    </svg>
  )
}

const TILE = 'absolute top-0 h-8 w-8 rounded-[9px]'
const TILE_FRONT = 'left-6 border-2 border-white bg-origin-border'

const RECIPE_ART: Record<string, { back: ReactNode; front: ReactNode }> = {
  warm: {
    back: (
      <span className={cn(TILE, 'left-0 flex items-center justify-center bg-white shadow-[0_0_0_1px_#EBEBE8]')}>
        <GmailSmall />
      </span>
    ),
    front: <Photo id={GIFT.g2} className={cn(TILE, TILE_FRONT)} />,
  },
  stalled: {
    back: <Photo id={GIFT.g3} className={cn(TILE, 'left-0')} />,
    front: <span className={cn(TILE, TILE_FRONT, 'flex items-center justify-center bg-linkedin text-[14px] font-bold leading-4 text-white')}>in</span>,
  },
  event: { back: <Photo id={GIFT.postcard} className={cn(TILE, 'left-0')} />, front: <Photo id={GIFT.g4} className={cn(TILE, TILE_FRONT)} /> },
}

function Recipes({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2 p-6">
      <span className="text-[13px] font-medium leading-4 text-grey-1">Or start from a recipe</span>
      <div className="flex gap-2">
        {RECIPES.map((r) => (
          <button
            key={r.id}
            data-testid={`recipe-${r.id}`}
            onClick={() => onPick(r.id)}
            className="flex flex-1 basis-0 cursor-pointer flex-col gap-3 rounded-[14px] p-4 text-left shadow-[inset_0_0_0_1px_#EBEBE8] transition-colors hover:bg-fill-hover hover:shadow-[inset_0_0_0_1px_#E4E4E1]"
          >
            <div className="relative h-8 w-[72px] shrink-0">
              {RECIPE_ART[r.id].back}
              {RECIPE_ART[r.id].front}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13.5px] font-semibold leading-4 text-ink">{r.name}</span>
              <span className="text-[12px] leading-4 text-grey-3">{r.meta}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── @ picker ──

function SavedIcon({ size = 24 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-[6px] bg-fill" style={{ width: size, height: size }}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 16 16">
        <circle cx="6" cy="5.5" r="2.5" fill="none" stroke="#55575F" strokeWidth="1.4" />
        <path d="M1.5 13.5c.6-2.3 2.3-3.5 4.5-3.5s3.9 1.2 4.5 3.5M11 3.5a2.5 2.5 0 0 1 0 4.5M12.5 10.3c1.1.5 1.8 1.6 2 3.2" fill="none" stroke="#55575F" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function PickerIcon({ item }: { item: PickerItem }) {
  if (item.kind === 'hubspot') return <HubDot size={24} glyph={13} stroke={1.8} />
  if (item.kind === 'saved') return <SavedIcon />
  if (item.kind === 'person') return item.face ? <Photo id={item.face} className="h-6 w-6 rounded-full" /> : <Initials text={item.name.split(' ').map((w) => w[0]).join('')} size={24} />
  return <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#EAF5EF] text-[12px] font-semibold leading-[14px] text-green-text">$</span>
}

function MentionPicker({
  groups,
  flat,
  highlight,
  onHover,
  onChoose,
  query,
  style,
}: {
  groups: { label: string; items: PickerItem[] }[]
  flat: PickerItem[]
  highlight: number
  onHover: (i: number) => void
  onChoose: (item: PickerItem) => void
  query: string
  style: { left: number; top: number }
}) {
  return (
    <div
      data-testid="mention-picker"
      className="thin-scroll absolute z-10 flex max-h-[360px] w-[400px] flex-col overflow-y-auto overscroll-contain rounded-[14px] bg-white shadow-[0_0_0_1px_#E4E4E1,0_16px_40px_-12px_#11121647]"
      style={style}
      onMouseDown={(e) => e.preventDefault()}
    >
      {groups.length === 0 && <div className="px-4 py-4 text-[12.5px] leading-4 text-grey-3">Nothing called “{query}” in HubSpot or DelightLoop</div>}
      {groups.map((g, gi) => (
        <div key={g.label} className={cn('flex flex-col p-1.5', gi > 0 && 'border-t border-line-soft')}>
          <div className="px-2.5 pb-1.5 pt-2 text-[12px] font-semibold leading-4 text-grey-3">{g.label}</div>
          {g.items.map((item) => {
            const i = flat.indexOf(item)
            const on = i === highlight
            return (
              <div
                key={item.kind + item.id}
                onMouseEnter={() => onHover(i)}
                onClick={() => onChoose(item)}
                className={cn('flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-2', on && 'bg-[#F3F2FE]')}
              >
                <PickerIcon item={item} />
                <div className="flex flex-1 basis-0 flex-col gap-px">
                  <span className="text-[13px] font-medium leading-4 text-ink">{item.name}</span>
                  <span className="text-[12px] leading-4 text-grey-3">{item.meta}</span>
                </div>
                {on && <span className="text-[11.5px] leading-[14px] text-grey-3">Enter</span>}
              </div>
            )
          })}
        </div>
      ))}
      <div className="sticky bottom-0 flex items-center justify-between border-t border-line-soft bg-[#FBFBFA] px-4 py-2.5">
        <span className="text-[12px] leading-4 text-grey-3">Searching HubSpot and DelightLoop</span>
      </div>
    </div>
  )
}

