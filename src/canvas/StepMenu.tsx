// The "+ Add step" picker: search, Reach out / Timing & logic tabs, Gifty's suggestion, grouped steps.
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react'
import { CanvasMenu } from '@/components/canvas'
import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import type { Choice, MenuContent, MenuItem, MenuTab, Suggestion, SuggestRow } from './catalog'

/** Esc or a mousedown outside `ref` calls onClose. */
export function useDismiss(ref: RefObject<HTMLElement | null>, onClose?: () => void) {
  useEffect(() => {
    if (!onClose) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
      }
    }
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose?.()
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('mousedown', onDown)
    }
  }, [ref, onClose])
}

const TABS: { value: MenuTab; label: string }[] = [
  { value: 'reach', label: 'Reach out' },
  { value: 'timing', label: 'Timing & logic' },
]

function ChoicePill({ choice, active, onClick }: { choice: Choice; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex cursor-pointer items-center whitespace-nowrap rounded-[7px] text-[12px] leading-4',
        choice.face ? 'h-[22px] gap-1.5 pl-1 pr-2' : 'h-[25px] gap-[5px] px-2',
        active ? 'bg-white font-semibold text-[#4B33D6] shadow-[inset_0_0_0_1.5px_#6559F7]' : 'font-medium text-grey-1 shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
      )}
    >
      {choice.face && <img src={asset(choice.face)} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />}
      {choice.label}
    </button>
  )
}

function SuggestionCard({ s, values, onValue, onPick }: { s: Suggestion; values: Record<string, number>; onValue: (k: string, v: number) => void; onPick: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-[12px] p-3 shadow-[inset_0_0_0_1.5px_#6559F7]">
      <button type="button" data-testid="menu-suggest" onClick={onPick} className="group flex cursor-pointer items-center gap-3 text-left">
        {s.icon}
        <span className="flex min-w-0 grow basis-0 flex-col gap-0.5">
          <span className="text-[13.5px] font-semibold leading-4 text-ink">{s.title}</span>
          <span className="text-[12.5px] leading-4 text-grey-2">{s.subtitle}</span>
        </span>
        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-fill text-[12px] leading-3 text-grey-1 group-hover:bg-[#E9E9E6]">↵</span>
      </button>
      {s.rows.length > 0 && (
        <div className="flex flex-col gap-[10px] border-t border-line-soft pt-[11px]">
          {s.rows.map((r: SuggestRow) => (
            <div key={r.key} className="flex items-center gap-2">
              <span className="w-[52px] shrink-0 text-[12px] leading-4 text-grey-3">{r.label}</span>
              <div className="flex flex-wrap gap-1">
                {r.choices.map((c, i) => (
                  <ChoicePill key={c.label} choice={c} active={(values[r.key] ?? r.value) === i} onClick={() => onValue(r.key, i)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return <div className="px-2 pb-[5px] pt-3 text-[12px] font-medium leading-4 text-grey-3">{children}</div>
}

function ItemRow({ item, active, onHover, onPick }: { item: MenuItem; active: boolean; onHover: () => void; onPick: () => void }) {
  return (
    <button
      type="button"
      data-testid={`menu-item-${item.id}`}
      disabled={item.disabled}
      onMouseEnter={item.disabled ? undefined : onHover}
      onClick={onPick}
      className={cn(
        'flex h-[38px] w-full shrink-0 items-center gap-[10px] rounded-[8px] px-2 text-left',
        item.disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
        active && !item.disabled && 'bg-page',
      )}
    >
      {item.icon}
      <span className="grow basis-0 text-[13px] font-medium leading-4 text-ink">{item.label}</span>
      <span className="text-[12px] leading-4 text-grey-3">{item.hint}</span>
    </button>
  )
}

export function StepMenu({
  content,
  suggestion,
  onPick,
  onClose,
  style,
}: {
  content: MenuContent
  suggestion: Suggestion
  onPick: (id: string, values: Record<string, number>) => void
  onClose: () => void
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<MenuTab>(suggestion.tab)
  const [query, setQuery] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(suggestion.rows.map((r) => [r.key, r.value])))
  useDismiss(ref, onClose)

  const q = query.trim().toLowerCase()
  const source = q ? [...content.reach, ...content.timing] : content[tab]
  const groups = source
    .map((g) => ({ ...g, items: g.items.filter((it) => !q || `${it.label} ${it.hint}`.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0)
  const firstEnabled = groups.flatMap((g) => g.items).find((it) => !it.disabled)?.id ?? null
  const activeId = hovered ?? firstEnabled
  const showSuggest = !q && suggestion.tab === tab

  function pickSuggestion() {
    onPick(suggestion.id, values)
  }

  function handleKey(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (showSuggest) pickSuggestion()
    else if (activeId) onPick(activeId, {})
  }

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div ref={ref} data-ui className="absolute z-30 animate-[menuIn_.16s_ease-out]" style={style} onPointerDown={(e) => e.stopPropagation()}>
      <CanvasMenu>
        <label className="flex h-10 shrink-0 cursor-text items-center gap-[10px] rounded-[10px] bg-page px-3">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
            <circle cx="7" cy="7" r="4.5" stroke="#8B8D95" strokeWidth="1.5" />
            <path d="m10.5 10.5 3 3" stroke="#8B8D95" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search steps"
            className="min-w-0 grow basis-0 bg-transparent text-[13.5px] leading-4 text-ink outline-none placeholder:text-grey-3"
          />
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-white text-[11px] font-medium leading-3 text-grey-2 shadow-[0_0_0_1px_#E4E4E1]">↵</span>
        </label>

        {!q && (
          <div className="flex gap-0.5 rounded-[10px] bg-fill p-[3px]">
            {TABS.map((t) => {
              const on = t.value === tab
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTab(t.value)
                    setHovered(null)
                  }}
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
        )}

        {showSuggest && (
          <>
            <SectionLabel>{suggestion.label}</SectionLabel>
            <SuggestionCard s={suggestion} values={values} onValue={(k, v) => setValues((x) => ({ ...x, [k]: v }))} onPick={pickSuggestion} />
          </>
        )}

        <SectionLabel>{q ? 'Matching steps' : 'Or pick a step'}</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {groups.map((g, gi) => (
            <div key={g.title} className="flex flex-col gap-0.5">
              <div className={cn('px-2 pb-[3px] text-[11.5px] font-medium leading-4 text-grey-3', gi === 0 ? 'pt-1.5' : 'pt-[10px]')}>{g.title}</div>
              {g.items.map((it) => (
                <ItemRow key={it.id} item={it} active={it.id === activeId} onHover={() => setHovered(it.id)} onPick={() => onPick(it.id, {})} />
              ))}
            </div>
          ))}
          {groups.length === 0 && <div className="px-2 py-3 text-[12.5px] leading-4 text-grey-3">No steps match “{query}”</div>}
        </div>
      </CanvasMenu>
    </div>
  )
}
