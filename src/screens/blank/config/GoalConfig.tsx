import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Toggle } from '@/components/ui'
import { cn } from '@/lib/cn'
import { ConfigFooter, ConfigHeader, ConfigPanel, ConfigSection, SaveStepButton, SectionTitle } from './late-parts'
import type { ConfigPanelProps } from './types'

// B7a · EXP-0 · the goal: what counts, how Gifty spots it, what happens on booking, when the loop ends.

type GoalId = 'meeting' | 'reply' | 'deal'

const GOALS: { id: GoalId; label: string }[] = [
  { id: 'meeting', label: 'A meeting booked with Sam' },
  { id: 'reply', label: 'A positive reply' },
  { id: 'deal', label: 'A deal created in HubSpot' },
]

const END_DATES = [
  { label: 'Tue 3 Nov', hint: '2 days after the gift lands' },
  { label: 'Wed 4 Nov', hint: '3 days after the gift lands' },
  { label: 'Fri 6 Nov', hint: '5 days after the gift lands' },
  { label: 'Sun 8 Nov', hint: 'A week after the gift lands' },
]

export default function GoalConfig({ onClose }: ConfigPanelProps) {
  const [, setParams] = useSearchParams()
  const [goal, setGoal] = useState<GoalId>('meeting')
  const [slack, setSlack] = useState(true)
  const [deal, setDeal] = useState(true)
  const [end, setEnd] = useState(1)

  return (
    <ConfigPanel>
      <ConfigHeader media={<FlagTile />} title="The goal" subtitle="Reaching it ends that person’s loop" onClose={onClose} />

      <ConfigSection title="Counts as the goal">
        <div role="radiogroup" className="flex flex-col gap-0.5">
          {GOALS.map((g) => (
            <GoalOption key={g.id} label={g.label} selected={goal === g.id} onClick={() => setGoal(g.id)} />
          ))}
        </div>
      </ConfigSection>

      <ConfigSection title="How Gifty spots a meeting">
        <div className="flex h-10 shrink-0 items-center gap-[10px] rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
            <rect x="2" y="3" width="12" height="11" rx="2" fill="#FFFFFF" stroke="#4285F4" strokeWidth="1.4" />
            <path d="M2 6.5h12" stroke="#4285F4" strokeWidth="1.4" />
          </svg>
          <span className="grow basis-0 text-[13px] font-medium leading-4 text-ink">Sam’s Google Calendar</span>
          <span className="text-[12px] leading-4 text-green-text">Connected</span>
        </div>
        <p className="text-[12px] leading-[17px] text-grey-3">Any invite with someone from the loop counts, even if they book from Sam’s link.</p>
      </ConfigSection>

      <ConfigSection title="When someone books" gap={12}>
        <SettingRow title="Stop their loop, hold the gift" hint="Set by your “They book a meeting” rule">
          <button
            type="button"
            onClick={() => setParams({ panel: 'rules' })}
            className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link underline-offset-2 hover:underline"
          >
            Rules
          </button>
        </SettingRow>
        <SettingRow title="Tell Sam in Slack">
          <Toggle on={slack} onChange={setSlack} label="Tell Sam in Slack" />
        </SettingRow>
        <SettingRow title="Create a HubSpot deal" hint="Stage: Meeting booked">
          <Toggle on={deal} onChange={setDeal} label="Create a HubSpot deal" />
        </SettingRow>
      </ConfigSection>

      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-6 py-[18px]">
        <div className="flex flex-col gap-0.5">
          <SectionTitle>Loop ends for everyone else</SectionTitle>
          <span className="text-[12px] leading-4 text-grey-3">{END_DATES[end].hint}</span>
        </div>
        <DateSelect value={end} onChange={setEnd} />
      </div>

      <ConfigFooter end>
        <SaveStepButton onSaved={onClose}>Save goal</SaveStepButton>
      </ConfigFooter>
    </ConfigPanel>
  )
}

function FlagTile() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[inset_0_0_0_1px_#E4E4E1]">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M4 14V2.5M4 3h7.5l-1.5 2.75L11.5 8.5H4" stroke="#1E8A58" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function GoalOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'flex h-[34px] shrink-0 cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] text-left',
        selected ? 'bg-[#F6F5FE]' : 'hover:bg-fill-hover',
      )}
    >
      <span
        className={cn(
          'h-4 w-4 shrink-0 rounded-full transition-shadow',
          selected ? 'shadow-[inset_0_0_0_4.5px_#6559F7]' : 'shadow-[inset_0_0_0_1.5px_#D4D4D0]',
        )}
      />
      <span className={cn('grow basis-0 text-[13px] leading-4', selected ? 'font-medium text-ink' : 'text-[#33353C]')}>{label}</span>
    </button>
  )
}

function SettingRow({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] leading-4 text-ink">{title}</span>
        {hint && <span className="text-[12px] leading-4 text-grey-3">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

/** Small date dropdown; Esc or a click outside closes it. */
function DateSelect({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(i: number) {
    onChange(i)
    setOpen(false)
  }

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] px-[10px] shadow-[inset_0_0_0_1px_#E4E4E1]',
          open ? 'bg-fill' : 'hover:bg-fill-hover',
        )}
      >
        <span className="whitespace-nowrap text-[12.5px] font-medium leading-4 text-ink">{END_DATES[value].label}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M4 6l4 4 4-4" stroke="#8B8D95" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-20 flex w-[232px] flex-col gap-0.5 rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_#EBEBE8,0_2px_4px_#1112160A,0_16px_32px_-12px_#11121633] animate-[fade_.12s_ease-out]"
        >
          {END_DATES.map((d, i) => (
            <button
              key={d.label}
              type="button"
              role="option"
              aria-selected={i === value}
              onClick={() => pick(i)}
              className={cn('flex h-9 cursor-pointer items-center justify-between gap-2 rounded-[8px] px-[10px] text-left', i === value ? 'bg-[#F6F5FE]' : 'hover:bg-page')}
            >
              <span className={cn('text-[12.5px] leading-4 text-ink', i === value && 'font-semibold')}>{d.label}</span>
              <span className="text-[12px] leading-4 text-grey-3">{d.hint.replace(' after the gift lands', ' after')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
