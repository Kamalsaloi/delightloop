import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import {
  ConfigFooter,
  ConfigHeader,
  ConfigPanel,
  ConfigPrimary,
  ConfigSection,
  ConfigSegmented,
  ConfigSelect,
  HeaderTile,
  RadioList,
  type Option,
} from './early-parts'
import type { ConfigPanelProps } from './types'

// B2a · wait, then check (DRH-0).

type Unit = 'hours' | 'days' | 'weekdays'
type Split = 'opened' | 'twice' | 'clicked' | 'linkedin'

const UNITS: Option<Unit>[] = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weekdays', label: 'Weekdays', grow: 1.3 },
]

const SPLITS: Option<Split>[] = [
  { value: 'opened', label: 'Opened the email' },
  { value: 'twice', label: 'Opened it twice or more' },
  { value: 'clicked', label: 'Clicked a link' },
  { value: 'linkedin', label: 'Has a LinkedIn profile' },
]

const PATHS: Record<Split, [string, string]> = {
  opened: ['Opened', 'Not opened'],
  twice: ['Opened twice', 'Opened once or not'],
  clicked: ['Clicked', 'Didn’t click'],
  linkedin: ['Has LinkedIn', 'No LinkedIn'],
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const WINDOWS = ['9:00 to 17:00, their time', '8:00 to 12:00, their time', 'Any time, their time', '9:00 to 17:00, IST for all']

// The intro goes out Mon 26 Oct, 9:00.
const SENT = new Date(2026, 9, 26, 9)
const MAX: Record<Unit, number> = { hours: 72, days: 14, weekdays: 10 }

function fmtDay(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')
}

function checkedAt(n: number, unit: Unit) {
  const d = new Date(SENT)
  if (unit === 'hours') d.setHours(d.getHours() + n)
  else if (unit === 'days') d.setDate(d.getDate() + n)
  else {
    let left = n
    while (left > 0) {
      d.setDate(d.getDate() + 1)
      if (d.getDay() !== 0 && d.getDay() !== 6) left -= 1
    }
  }
  return d
}

function waitSummary(n: number, unit: Unit) {
  const at = checkedAt(n, unit)
  if (unit !== 'hours') return `Sent ${fmtDay(SENT)}, checked ${fmtDay(at)}`
  const time = `${at.getHours()}:00`
  const sameDay = at.getDate() === SENT.getDate()
  return `Sent ${fmtDay(SENT)} 9:00, checked ${sameDay ? time : `${fmtDay(at)} ${time}`}`
}

const checkGlyph = (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5 11 11 5M6 5h5v5" stroke="#111216" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const calendarGlyph = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="#6E6F7C" strokeWidth="1.4" />
    <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="#6E6F7C" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

function StepperButton({ label, d, disabled, onClick }: { label: string; d: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] hover:bg-fill-hover disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d={d} stroke="#55575F" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function NumberStepper({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex h-9 items-center rounded-[10px] shadow-[inset_0_0_0_1px_#E4E4E1]">
      <StepperButton label="Less" d="M3.5 8h9" disabled={value <= 1} onClick={() => onChange(value - 1)} />
      <span className="w-6 shrink-0 text-center text-[14px] font-semibold leading-[18px] text-ink tabular-nums">{value}</span>
      <StepperButton label="More" d="M8 3.5v9M3.5 8h9" disabled={value >= max} onClick={() => onChange(value + 1)} />
    </div>
  )
}

function DayChip({ day, on, onClick }: { day: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'flex h-8 grow basis-0 cursor-pointer items-center justify-center rounded-[8px] text-[12.5px] leading-4',
        on ? 'font-semibold text-[#4B3FD9] shadow-[inset_0_0_0_1.5px_#6559F7]' : 'font-medium text-grey-3 shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
      )}
    >
      {day}
    </button>
  )
}

function PathRow({ label, tone }: { label: string; tone: 'green' | 'red' }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          'flex h-[22px] items-center rounded-[11px] px-2 text-[12px] font-semibold leading-[14px] text-white',
          tone === 'green' ? 'bg-green' : 'bg-[#E5484D]',
        )}
      >
        {label}
      </span>
      <span className="text-[12.5px] leading-4 text-grey-3">No step yet</span>
    </div>
  )
}

export default function CheckConfig({ onClose }: ConfigPanelProps) {
  const navigate = useNavigate()
  const [count, setCount] = useState(2)
  const [unit, setUnit] = useState<Unit>('weekdays')
  const [days, setDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const [sendWindow, setSendWindow] = useState(WINDOWS[0])
  const [split, setSplit] = useState<Split>('opened')

  function changeUnit(u: Unit) {
    setUnit(u)
    setCount((c) => Math.min(c, MAX[u]))
  }

  function toggleDay(d: string) {
    // Keep at least one send day.
    setDays((cur) => (cur.includes(d) ? (cur.length > 1 ? cur.filter((x) => x !== d) : cur) : [...cur, d]))
  }

  const [yes, no] = PATHS[split]

  return (
    <ConfigPanel>
      <ConfigHeader media={<HeaderTile>{checkGlyph}</HeaderTile>} title="Wait, then check" subtitle="After Intro from Sam · 48 people" onClose={onClose} />

      <ConfigSection title="Wait" gap={12}>
        <div className="flex items-center gap-2">
          <NumberStepper value={count} max={MAX[unit]} onChange={setCount} />
          <ConfigSegmented options={UNITS} value={unit} onChange={changeUnit} className="grow basis-0" />
        </div>
        <div className="flex items-center gap-2 rounded-[10px] bg-[#F7F7F5] px-3 py-[10px]">
          {calendarGlyph}
          <span className="text-[12.5px] leading-4 text-[#33353C]">{waitSummary(count, unit)}</span>
        </div>
      </ConfigSection>

      <ConfigSection title="Next step goes out" gap={10}>
        <div className="flex gap-1.5">
          {DAYS.map((d) => (
            <DayChip key={d} day={d} on={days.includes(d)} onClick={() => toggleDay(d)} />
          ))}
        </div>
        <ConfigSelect options={WINDOWS} value={sendWindow} onChange={setSendWindow} />
      </ConfigSection>

      <ConfigSection title="Then split by" gap={10}>
        <RadioList options={SPLITS} value={split} onChange={setSplit} />
        <span className="text-[12px] leading-[17px] text-grey-3">Replies don’t need a path here. Your reply rule already stops their loop.</span>
      </ConfigSection>

      <ConfigSection title="Paths" gap={8}>
        <PathRow label={yes} tone="green" />
        <PathRow label={no} tone="red" />
      </ConfigSection>

      <ConfigFooter removeLabel="Remove check" onRemove={() => navigate('/blank/build/2')}>
        <ConfigPrimary onClick={onClose}>Save check</ConfigPrimary>
      </ConfigFooter>
    </ConfigPanel>
  )
}
