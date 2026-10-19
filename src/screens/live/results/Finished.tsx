import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Icon, LinkedInMark } from '@/components/ui'
import { FACE, asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { WORKED } from './data'

const OUTCOMES = [
  { value: '6', label: 'meetings booked', sub: '1 in every 8 people', good: true },
  { value: '$214k', label: 'pipeline created', sub: '6 deals in HubSpot' },
  { value: '$2,880', label: 'spent on gifts and postcards', sub: '$480 per meeting' },
  { value: '$594', label: 'left in the budget', sub: '12 gifts never sent, 5 replied first' },
]

const WARM = [
  { face: FACE.f3, name: 'Ananya Rao', sub: 'On pricing 3 times this week' },
  { face: FACE.f5, name: 'Kenji Tanaka', sub: 'Forwarded his page to 2 people' },
]

/** 13 · Loop finished, what worked. Main column. */
export function FinishedMain() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">6 meetings from 48 people</h1>
        <p className="text-[14px] leading-5 text-grey-2">
          The Diwali loop ran 9 days, Mon 26 Oct to Wed 4 Nov. Everything is synced to HubSpot.
        </p>
      </div>

      <div className="flex rounded-card bg-white shadow-card">
        {OUTCOMES.map((o, i) => (
          <div key={o.label} className={cn('flex flex-1 flex-col gap-1 p-6', i < OUTCOMES.length - 1 && 'border-r border-line-soft')}>
            <span className={cn('text-[30px] font-semibold leading-9 tracking-[-0.03em]', o.good ? 'text-green-text' : 'text-ink')}>
              {o.value}
            </span>
            <span className="text-[13px] leading-[18px] text-grey-1">{o.label}</span>
            <span className={cn('text-[12.5px] leading-4', o.good ? 'text-green-text' : 'text-grey-3')}>{o.sub}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col rounded-card bg-white shadow-card">
        <div className="flex items-baseline justify-between px-6 pb-2 pt-5">
          <span className="text-[15px] font-semibold leading-5 text-ink">What worked</span>
          <span className="text-[12.5px] leading-4 text-grey-3">From Gifty, checked against the numbers</span>
        </div>
        {WORKED.map((w, i) => (
          <div key={w.id} className={cn('flex items-center gap-5 px-6 py-4', i < WORKED.length - 1 && 'border-b border-line-soft')}>
            {w.image ? (
              <img src={asset(w.image)} alt="" className="h-11 w-11 shrink-0 rounded-[10px] object-cover" />
            ) : (
              <LinkedInMark size={44} radius={10} className="!text-[18px]" />
            )}
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[14px] font-medium leading-[18px] text-ink">{w.title}</span>
              <span className="text-[13px] leading-[18px] text-grey-2">{w.sub}</span>
            </div>
            <span className="text-[20px] font-semibold leading-6 text-ink">{w.stat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinishedSide() {
  const [saved, setSaved] = useState(false)
  const [handed, setHanded] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 rounded-card bg-white p-6 shadow-card">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold leading-5 text-ink">Run it again</span>
          <span className="text-[13px] leading-[18px] text-grey-2">
            Same steps for your Q1 accounts, with chai first for India and the bump email dropped.
          </span>
        </div>
        <Link
          to="/new"
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-violet text-[13.5px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]"
        >
          Draft the Q1 loop
          <Icon name="arrowRight" size={13} strokeWidth={1.6} />
        </Link>
        <button
          onClick={() => setSaved(true)}
          className="cursor-pointer text-center text-[13px] font-medium leading-4 text-violet-link hover:underline"
        >
          {saved ? 'Saved to your recipes' : 'Save as a recipe instead'}
        </button>
      </div>

      <div className="flex flex-col rounded-card bg-white shadow-card">
        <div className="flex flex-col gap-1 px-6 pb-3 pt-5">
          <span className="text-[15px] font-semibold leading-5 text-ink">Still warm, no meeting yet</span>
          <span className="text-[13px] leading-[18px] text-grey-2">They engaged but didn’t book. Worth a personal note from Sam.</span>
        </div>
        {WARM.map((p) => (
          <div key={p.name} className="flex items-center gap-3 border-t border-line-soft px-6 py-3 hover:bg-fill-hover">
            <Avatar id={p.face} size={32} />
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[13.5px] font-medium leading-[18px] text-ink">{p.name}</span>
              <span className="text-[12.5px] leading-4 text-grey-3">{p.sub}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-line-soft px-6 pb-[18px] pt-[14px] text-[13px] leading-4">
          <span className="text-grey-2">+5 more</span>
          <button onClick={() => setHanded(true)} className="cursor-pointer font-medium text-violet-link hover:underline">
            {handed ? 'Handed to Sam' : 'Hand all 7 to Sam'}
          </button>
        </div>
      </div>
    </>
  )
}
