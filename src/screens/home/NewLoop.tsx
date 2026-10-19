import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FACE, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import Home from './Home'
import { PICKER_GROUPS, type PickerItem } from './data'
import { CalendarIcon, HubDot, Photo, VIOLET_BTN, WHITE_BTN } from './parts'

const DEFAULT_TEXT =
  'Book meetings with VP Sales at our Q4 accounts before Diwali. A warm intro from Sam, then a gift that feels personal to each of them.'
const MENTION_TEXT = 'Book meetings with VP Sales at @q4'

type Mention = { start: number; query: string }

/** The "@word" the caret is in, if any. */
function findMention(text: string, caret: number): Mention | null {
  let i = caret - 1
  while (i >= 0 && !/\s/.test(text[i]) && text[i] !== '@') i--
  if (i < 0 || text[i] !== '@') return null
  if (i > 0 && !/\s/.test(text[i - 1])) return null
  return { start: i, query: text.slice(i + 1, caret) }
}

/**
 * 02 Start a new loop: modal over Home. `?mention=1` (02c) = the @ list picker,
 * also opened by typing "@" in the composer.
 */
export default function NewLoop() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const mentionParam = params.get('mention') === '1'

  const [text, setText] = useState(() => (mentionParam ? MENTION_TEXT : DEFAULT_TEXT))
  const [caret, setCaret] = useState(text.length)
  const [tokens, setTokens] = useState<string[]>([])
  const [dismissedAt, setDismissedAt] = useState<number | null>(null)
  const [highlight, setHighlight] = useState(0)
  const [pickerPos, setPickerPos] = useState({ left: 0, top: 0 })

  const modalRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const markRef = useRef<HTMLSpanElement>(null)
  const pendingCaret = useRef<number | null>(null)

  const mention = findMention(text, caret)
  const live = mention && mention.start !== dismissedAt ? mention : null
  const pickerOpen = mentionParam && live !== null
  const query = live?.query.toLowerCase() ?? ''

  const groups = useMemo(
    () =>
      PICKER_GROUPS.map((g) => ({ ...g, items: g.items.filter((it) => it.name.toLowerCase().includes(query)) })).filter(
        (g) => g.items.length > 0,
      ),
    [query],
  )
  const flat = groups.flatMap((g) => g.items)

  function setMentionParam(on: boolean) {
    setParams(on ? { mention: '1' } : {}, { replace: true })
  }

  function close() {
    navigate('/home')
  }

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
    setText(next)
    setCaret(pos)
    pendingCaret.current = pos
    setMentionParam(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!pickerOpen) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setHighlight((h) => (h + step + flat.length) % Math.max(flat.length, 1))
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (flat[highlight]) {
        e.preventDefault()
        choose(flat[highlight])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setDismissedAt(live?.start ?? null)
      setMentionParam(false)
    }
  }

  // Typing "@" opens the picker (and writes ?mention=1); leaving the word closes it.
  useEffect(() => {
    if (live && !mentionParam) setMentionParam(true)
    if (!live && mentionParam) setMentionParam(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live?.start, mentionParam])

  useEffect(() => setHighlight(0), [query])

  // Esc closes the modal (the picker handles its own Esc first).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) navigate('/home')
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [navigate])

  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  useLayoutEffect(() => {
    const el = areaRef.current
    if (el && pendingCaret.current !== null) {
      el.setSelectionRange(pendingCaret.current, pendingCaret.current)
      pendingCaret.current = null
    }
  }, [text])

  // Anchor the picker under the "@word", aligned to its text (as in Paper).
  useLayoutEffect(() => {
    if (!pickerOpen || !markRef.current || !modalRef.current) return
    const m = markRef.current.getBoundingClientRect()
    const box = modalRef.current.getBoundingClientRect()
    setPickerPos({ left: m.left - box.left - 16, top: m.top - box.top + m.height / 2 + 12 + 8 })
  }, [pickerOpen, text, caret])

  const linked = [
    /q4/i.test(text) && 'q4',
    /sam/i.test(text) && 'sam',
    /diwali/i.test(text) && 'diwali',
  ].filter(Boolean) as string[]

  return (
    <>
      <Home />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11121652] animate-[fade_.15s_ease-out]" onMouseDown={close}>
        <div
          ref={modalRef}
          role="dialog"
          aria-modal
          aria-label="Start a new loop"
          onMouseDown={(e) => e.stopPropagation()}
          className="relative flex w-[640px] shrink-0 flex-col rounded-[20px] bg-white shadow-[0_24px_64px_-24px_#11121673]"
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <h2 className="text-[18px] font-semibold leading-6 tracking-[-0.01em] text-ink">Start a new loop</h2>
            <button
              onClick={close}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-page hover:bg-fill"
            >
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
              <div className="relative isolate text-[15px] leading-6">
                <Backdrop text={text} tokens={tokens} active={pickerOpen ? { start: live!.start, end: caret } : null} markRef={markRef} />
                <textarea
                  id="loop-brief"
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
                {!pickerOpen && linked.length > 0 && <LinkedChips linked={linked} />}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] leading-4 text-grey-3">Type @ to add a list, a person or a budget</span>
                  <button
                    onClick={() => navigate('/loop/audience')}
                    className={cn(VIOLET_BTN, 'h-9 gap-2 rounded-[10px] px-3.5 text-[13px] font-semibold leading-4')}
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

          <Recipes onPick={() => navigate('/loop/audience')} />

          <div className="flex items-center justify-between gap-4 rounded-b-[20px] border-t border-line-soft bg-[#FAFAF9] px-6 py-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13.5px] font-medium leading-4 text-ink">Rather build it yourself?</span>
              <span className="text-[12.5px] leading-4 text-grey-3">Add each step on the canvas. Gifty still suggests as you go.</span>
            </div>
            <button
              onClick={() => navigate('/blank/list')}
              className={cn(WHITE_BTN, 'h-10 shrink-0 gap-2 rounded-[10px] px-3.5 text-[13px] font-medium leading-4')}
            >
              <svg width="14" height="14" viewBox="0 0 16 16">
                <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" fill="none" stroke="#111216" strokeWidth="1.4" strokeDasharray="2.5 2" />
                <path d="M8 5.5v5M5.5 8h5" fill="none" stroke="#111216" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Start blank
            </button>
          </div>

          {pickerOpen && (
            <MentionPicker
              groups={groups}
              flat={flat}
              highlight={highlight}
              onHover={setHighlight}
              onChoose={choose}
              query={live?.query ?? ''}
              style={pickerPos}
            />
          )}
        </div>
      </div>
    </>
  )
}

// ── Composer backdrop: draws the text so tokens can be styled under a transparent textarea ──

const TOKEN_CLASS =
  "relative font-medium text-[#5547E6] before:absolute before:-inset-x-1 before:-inset-y-[3px] before:-z-10 before:rounded-[5px] before:bg-[#ECEAFE] before:content-['']"

function Backdrop({
  text,
  tokens,
  active,
  markRef,
}: {
  text: string
  tokens: string[]
  active: { start: number; end: number } | null
  markRef: RefObject<HTMLSpanElement>
}) {
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
      {text ? parts : <span className="text-grey-3">Describe who it’s for and what should happen</span>}
      {'​'}
    </div>
  )
}

// ── Linked chips ──

function Chip({ icon, name, meta }: { icon: ReactNode; name: string; meta: string }) {
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-[8px] bg-fill pl-1.5 pr-2.5">
      {icon}
      <span className="text-[12.5px] font-medium leading-4 text-ink">{name}</span>
      <span className="text-[12.5px] leading-4 text-grey-3">{meta}</span>
    </div>
  )
}

function LinkedChips({ linked }: { linked: string[] }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line-soft pt-3.5">
      <span className="text-[12px] leading-4 text-grey-3">Gifty linked these from your words</span>
      <div className="flex items-center gap-2">
        {linked.includes('q4') && <Chip icon={<HubDot size={16} glyph={10} />} name="Q4 accounts" meta="36 accounts" />}
        {linked.includes('sam') && <Chip icon={<Photo id={FACE.sam} className="h-4 w-4 rounded-full" />} name="Sam Rivera" meta="sender" />}
        {linked.includes('diwali') && <Chip icon={<CalendarIcon />} name="Diwali" meta="Sun 8 Nov" />}
      </div>
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

const RECIPES: { name: string; meta: string; back: ReactNode; front: ReactNode }[] = [
  {
    name: 'Warm intro, then a gift',
    meta: '5 steps · 12 days',
    back: (
      <span className={cn(TILE, 'left-0 flex items-center justify-center bg-white shadow-[0_0_0_1px_#EBEBE8]')}>
        <GmailSmall />
      </span>
    ),
    front: <Photo id={GIFT.g2} className={cn(TILE, TILE_FRONT)} />,
  },
  {
    name: 'Restart a stalled deal',
    meta: '3 steps · 7 days',
    back: <Photo id={GIFT.g3} className={cn(TILE, 'left-0')} />,
    front: (
      <span className={cn(TILE, TILE_FRONT, 'flex items-center justify-center bg-linkedin')}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-label="LinkedIn">
          <path
            d="M3.6 6.2h2.1V13H3.6zM4.65 2.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM7.1 6.2h2v.95c.3-.55 1-1.1 2.1-1.1 2.2 0 2.6 1.45 2.6 3.3V13h-2.1V9.7c0-.8 0-1.8-1.1-1.8s-1.3.85-1.3 1.75V13H7.1z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    ),
  },
  {
    name: 'After an event',
    meta: '4 steps · 10 days',
    back: <Photo id={GIFT.postcard} className={cn(TILE, 'left-0')} />,
    front: <Photo id={GIFT.g4} className={cn(TILE, TILE_FRONT)} />,
  },
]

function Recipes({ onPick }: { onPick: () => void }) {
  return (
    <div className="flex flex-col gap-2 p-6">
      <span className="text-[13px] font-medium leading-4 text-grey-1">Or start from a recipe</span>
      <div className="flex gap-2">
        {RECIPES.map((r) => (
          <button
            key={r.name}
            onClick={onPick}
            className="flex flex-1 basis-0 cursor-pointer flex-col gap-3 rounded-[14px] p-4 text-left shadow-[inset_0_0_0_1px_#EBEBE8] transition-colors hover:bg-fill-hover hover:shadow-[inset_0_0_0_1px_#E4E4E1]"
          >
            <div className="relative h-8 w-[72px] shrink-0">
              {r.back}
              {r.front}
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

function PickerIcon({ kind }: { kind: PickerItem['kind'] }) {
  if (kind === 'hubspot') return <HubDot size={24} glyph={13} stroke={1.8} />
  if (kind === 'saved')
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-fill">
        <svg width="13" height="13" viewBox="0 0 16 16">
          <circle cx="6" cy="5.5" r="2.5" fill="none" stroke="#55575F" strokeWidth="1.4" />
          <path
            d="M1.5 13.5c.6-2.3 2.3-3.5 4.5-3.5s3.9 1.2 4.5 3.5M11 3.5a2.5 2.5 0 0 1 0 4.5M12.5 10.3c1.1.5 1.8 1.6 2 3.2"
            fill="none"
            stroke="#55575F"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
    )
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#EAF5EF] text-[12px] font-semibold leading-[14px] text-green-text">
      $
    </span>
  )
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
      className="absolute z-10 flex w-[400px] flex-col overflow-clip rounded-[14px] bg-white shadow-[0_0_0_1px_#E4E4E1,0_16px_40px_-12px_#11121647]"
      style={style}
      // Keep focus in the textarea while clicking options.
      onMouseDown={(e) => e.preventDefault()}
    >
      {groups.length === 0 && (
        <div className="px-4 py-4 text-[12.5px] leading-4 text-grey-3">Nothing called “{query}” in HubSpot or DelightLoop</div>
      )}
      {groups.map((g, gi) => (
        <div key={g.label} className={cn('flex flex-col p-1.5', gi > 0 && 'border-t border-line-soft')}>
          <div className="px-2.5 pb-1.5 pt-2 text-[12px] font-semibold leading-4 text-grey-3">{g.label}</div>
          {g.items.map((item) => {
            const i = flat.indexOf(item)
            const on = i === highlight
            return (
              <div
                key={item.id}
                onMouseEnter={() => onHover(i)}
                onClick={() => onChoose(item)}
                className={cn('flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-2', on && 'bg-[#F3F2FE]')}
              >
                <PickerIcon kind={item.kind} />
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
      <div className="flex items-center justify-between border-t border-line-soft bg-[#FBFBFA] px-4 py-2.5">
        <span className="text-[12px] leading-4 text-grey-3">Searching HubSpot and DelightLoop</span>
        <button className="cursor-pointer text-[12px] font-medium leading-4 text-violet-link hover:underline">Connect Salesforce</button>
      </div>
    </div>
  )
}
