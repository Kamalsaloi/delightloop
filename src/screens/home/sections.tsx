import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LinkedInMark } from '@/components/ui'
import { GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { RUNNING, type RunningLoop, type Suggestion } from './data'
import {
  ArrowIcon,
  CalendarIcon,
  FaceStack,
  HubDot,
  Photo,
  PlusIcon,
  Stat,
  StatRow,
  WHITE_BTN,
} from './parts'

const DRAFT_SHADOW = 'shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_8px_24px_#1112160A]'

// ── Gifty spotted ───────────────────────────────────────────────────────────

export function GiftySpotted({ suggestions }: { suggestions: Suggestion[] }) {
  return (
    <section className="flex flex-col gap-5 rounded-[24px] bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GiftyMark />
          <h2 className="text-[16px] font-semibold leading-5 text-ink">Gifty spotted</h2>
          <span className="text-[13px] leading-4 text-grey-3">3 loops worth starting, from your CRM, LinkedIn and call notes</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="cursor-pointer text-[13px] font-medium leading-4 text-grey-1 hover:text-ink">How Gifty picks these</button>
          <Link to="/new" className={cn(WHITE_BTN, 'h-9 gap-2 rounded-[10px] px-4 text-[13.5px] font-medium leading-4')}>
            <PlusIcon />
            Start your own
          </Link>
        </div>
      </div>
      <div className="flex gap-6">
        {suggestions.map((s, i) => (
          <SuggestionCard key={s.id} s={s} top={i === 0} />
        ))}
      </div>
    </section>
  )
}

function GiftyMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
      <rect x="3.2" y="8.6" width="13.6" height="8.4" rx="1.6" stroke="#6559F7" strokeWidth="1.6" />
      <rect x="2.2" y="5.6" width="15.6" height="3" rx="1" fill="#EFECFF" stroke="#6559F7" strokeWidth="1.6" />
      <path d="M10 5.6V17" stroke="#6559F7" strokeWidth="1.6" />
      <path d="M10 5.6C9.6 4.2 8.4 2.6 6.9 2.9 5.4 3.2 5.7 5.6 7.6 5.6H10ZM10 5.6C10.4 4.2 11.6 2.6 13.1 2.9 14.6 3.2 14.3 5.6 12.4 5.6H10Z" stroke="#6559F7" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function SourceMark({ source, onViolet }: { source: Suggestion['source']; onViolet?: boolean }) {
  if (source === 'linkedin') return <LinkedInMark size={14} radius={3} />
  if (source === 'hubspot') return <HubDot />
  return <CalendarIcon color={onViolet ? 'rgba(255,255,255,0.78)' : undefined} />
}

function SuggestionCard({ s, top }: { s: Suggestion; top: boolean }) {
  const navigate = useNavigate()
  let whenClass = 'text-grey-3'
  if (top) whenClass = 'font-semibold text-white'
  else if (s.source === 'moment') whenClass = 'font-medium text-amber-text'

  return (
    <div
      onClick={() => navigate('/loop/audience')}
      className={cn(
        'group flex min-w-0 flex-1 basis-0 cursor-pointer flex-col rounded-[20px] transition-[background-color,box-shadow,transform] duration-150',
        top
          ? 'bg-violet shadow-[inset_0_0_0_1px_#5547E6,inset_0_1px_0_rgba(255,255,255,0.18),0_16px_36px_-16px_rgba(101,89,247,0.55)] hover:-translate-y-0.5'
          : 'bg-[#F7F7F5] hover:bg-white hover:shadow-[0_0_0_1px_#EBEBE8,0_12px_32px_-16px_#11121633]',
      )}
    >
      <div className="flex flex-col gap-3.5 px-5 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <SourceMark source={s.source} onViolet={top} />
            <span className={cn('text-[12.5px] leading-4', top ? 'text-white/80' : 'text-grey-1')}>{s.sourceLabel}</span>
          </div>
          <span className={cn('text-[12.5px] leading-4', whenClass)}>{s.when}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className={cn('text-[17px] font-semibold leading-[22px] tracking-[-0.01em]', top ? 'text-white' : 'text-ink')}>{s.title}</h3>
          <p className={cn('text-[13px] leading-[19px]', top ? 'text-white/80' : 'text-grey-2')}>{s.body}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <FaceStack ids={s.faces} ring={top ? '#6559F7' : '#FFFFFF'} />
          <span className={cn('text-[12.5px] leading-4', top ? 'text-white/80' : 'text-grey-1')}>{s.reach}</span>
        </div>
      </div>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-b-[20px] border-t px-5 py-3',
          top ? 'border-white/15 bg-white/[0.08]' : 'border-line',
        )}
      >
        <span className={cn('flex-1 basis-0 text-[12px] leading-4', top ? 'text-white/70' : 'text-grey-3')}>{s.steps}</span>
        {top ? (
          <span className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] bg-white px-3 text-[12.5px] font-semibold leading-4 text-[#4B3FD9] shadow-[0_1px_2px_rgba(17,18,22,0.15)] transition-colors hover:bg-[#F6F5FE]">
            View the loop
            <ArrowIcon size={12} color="#4B3FD9" />
          </span>
        ) : (
          <span className={cn(WHITE_BTN, 'h-8 rounded-[9px] px-3 text-[12.5px] font-medium leading-4')}>View the loop</span>
        )}
      </div>
    </div>
  )
}

// ── Loop cards ──────────────────────────────────────────────────────────────

function SummaryRow({ label, value, weight = 'font-semibold' }: { label: string; value: string; weight?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[13px] leading-4 text-grey-1">{label}</span>
      <span className={cn('text-[13px] leading-4 text-ink', weight)}>{value}</span>
    </div>
  )
}

function Connector({ live }: { live?: boolean }) {
  return <div className={cn('h-px w-6 shrink-0 bg-line-strong', live ? 'mt-5' : 'relative top-5')} />
}

function TimelineStep({ tile, label }: { tile: ReactNode; label: string }) {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-2">
      {tile}
      <span className="text-[11.5px] leading-[14px] text-grey-3">{label}</span>
    </div>
  )
}

function GmailGlyph() {
  return (
    <svg width="18" height="14" viewBox="0 0 24 18" className="shrink-0" aria-label="Email">
      <path d="M1.6 18h3.8V8.7L0 4.6v11.8C0 17.3.7 18 1.6 18z" fill="#4285F4" />
      <path d="M18.6 18h3.8c.9 0 1.6-.7 1.6-1.6V4.6l-5.4 4.1V18z" fill="#34A853" />
      <path d="M18.6 1.6v7.1L24 4.6V2.4c0-2-2.3-3.1-3.9-1.9l-1.5 1.1z" fill="#FBBC04" />
      <path d="M5.4 8.7V1.6L12 6.5l6.6-4.9v7.1L12 13.6 5.4 8.7z" fill="#EA4335" />
      <path d="M0 2.4v2.2l5.4 4.1V1.6L3.9.5C2.3-.7 0 .4 0 2.4z" fill="#C5221F" />
    </svg>
  )
}

/** "Waiting on you": the year-end draft. */
export function DraftCard() {
  return (
    <div className={cn('flex gap-8 rounded-[20px] bg-white p-6', DRAFT_SHADOW)}>
      <Photo id={GIFT.g6} className="h-[232px] w-[280px] rounded-[14px]" />
      <div className="flex min-w-0 flex-1 basis-0 flex-col justify-between py-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold leading-4 text-amber-text">Draft</span>
            <span className="text-[13px] leading-4 text-grey-2">Launch by Fri 11 Dec so gifts land before the holidays</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">Year-end thanks · Top 30 customers</h3>
            <p className="text-[14px] leading-5 text-grey-2">
              Gift first, no ask. A handwritten letter from their CSM, then a note about planning next year together.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <TimelineStep tile={<Photo id={GIFT.g6} className="h-10 w-10 rounded-[12px]" />} label="Day 0" />
          <Connector />
          <TimelineStep tile={<Photo id={GIFT.postcard} className="h-10 w-10 rounded-[12px]" />} label="Day 3" />
          <Connector />
          <TimelineStep
            tile={
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160F]">
                <GmailGlyph />
              </span>
            }
            label="Day 7"
          />
          <Connector />
          <TimelineStep
            tile={
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF5EF]">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M3.5 14V2.5M3.5 2.5h8l-1.6 3 1.6 3h-8" fill="none" stroke="#1E8A58" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            }
            label="Renewal"
          />
        </div>
      </div>
      <div className="flex w-[288px] shrink-0 flex-col justify-between rounded-[14px] bg-page p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <SummaryRow label="Addresses found" value="22 of 30" />
            <div className="flex h-1.5 shrink-0 gap-[3px]">
              <div className="flex-[22] basis-0 rounded-[3px] bg-green" />
              <div className="flex-[8] basis-0 rounded-[3px] bg-[#F2C46B]" />
            </div>
          </div>
          <SummaryRow label="Budget" value="$1,950, waiting on Arjun" />
          <SummaryRow label="Last edited" value="Yesterday" weight="font-medium" />
        </div>
        <Link to="/loop/build/gift" className={cn(WHITE_BTN, 'h-10 shrink-0 gap-2 rounded-[10px] text-[13.5px] font-medium leading-4')}>
          Continue building
          <ArrowIcon />
        </Link>
      </div>
    </div>
  )
}

function LiveStep({ tile, label, strong }: { tile: ReactNode; label: string; strong?: boolean }) {
  return (
    <div className="flex w-[88px] shrink-0 flex-col items-center gap-2">
      {tile}
      <span className={cn('text-[12px] leading-4', strong ? 'font-medium text-ink' : 'text-grey-1')}>{label}</span>
    </div>
  )
}

/** "Needs you": the Diwali loop after launch (state=live). */
export function LiveDiwaliCard() {
  return (
    <div className="flex gap-8 rounded-[20px] bg-white p-6 shadow-card">
      <Photo id={GIFT.g5} className="h-[232px] w-[280px] rounded-[14px]" />
      <div className="flex min-w-0 flex-1 basis-0 flex-col justify-between py-2">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold leading-4 text-green-text">Live · Day 5 of 9</span>
            <span className="text-[13px] leading-4 text-grey-2">Ends Wed 4 Nov</span>
          </div>
          <h3 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">Diwali · VP Sales Q4</h3>
          <p className="text-[14.5px] leading-[22px] text-grey-1">3 replies need Sam, and one gift came back. Gifty handled the rest.</p>
        </div>
        <div className="flex items-start gap-3">
          <LiveStep
            tile={
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[inset_0_0_0_1px_#E4E4E1]">
                <GmailGlyph />
              </span>
            }
            label="31 opened"
          />
          <Connector live />
          <LiveStep
            tile={
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-linkedin text-[16px] font-bold leading-[18px] text-white">
                in
              </span>
            }
            label="19 connected"
          />
          <Connector live />
          <LiveStep tile={<Photo id={GIFT.postcard} className="h-10 w-10 rounded-[10px]" />} label="14 visited" />
          <Connector live />
          <LiveStep tile={<Photo id={GIFT.g5} className="h-10 w-10 rounded-[10px]" />} label="Shipping" strong />
        </div>
      </div>
      <div className="flex w-[288px] shrink-0 flex-col justify-between rounded-[14px] bg-page p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[26px] font-semibold leading-[30px] tracking-[-0.02em] text-green-text">2 meetings</span>
            <span className="text-[12.5px] leading-4 text-grey-2">booked by Daniel and Tom</span>
          </div>
          <SummaryRow label="Pipeline created" value="$86,000" />
          <SummaryRow label="Spent on gifts" value="$2,592 of $3,474" />
        </div>
        <Link to="/live/results" className={cn(WHITE_BTN, 'h-10 shrink-0 gap-2 rounded-[10px] text-[13.5px] font-semibold leading-4')}>
          Answer 3 replies
          <ArrowIcon size={13} />
        </Link>
      </div>
    </div>
  )
}

// ── Running ─────────────────────────────────────────────────────────────────

export function RunningCards() {
  return (
    <div className="flex gap-6">
      {RUNNING.map((loop) => (
        <RunningCard key={loop.id} loop={loop} />
      ))}
    </div>
  )
}

function RunningCard({ loop }: { loop: RunningLoop }) {
  const stat = 'text-[24px] font-semibold leading-7 tracking-[-0.02em]'
  return (
    <Link
      to="/live/results"
      className="flex min-w-0 flex-1 basis-0 cursor-pointer flex-col rounded-[20px] bg-white shadow-card transition-shadow hover:shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_#1112160A,0_8px_24px_#1112160A]"
    >
      <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
        <div className="flex items-center gap-3.5">
          <Photo id={loop.image} className="h-12 w-12 rounded-[12px]" />
          <div className="flex min-w-0 flex-1 basis-0 flex-col gap-1">
            <span className="text-[15px] font-semibold leading-5 text-ink">{loop.name}</span>
            <div className="flex items-center gap-1.5">
              {loop.source === 'hubspot' ? <HubDot size={16} glyph={10} /> : <LinkedInMark size={16} radius={4} />}
              <span className="text-[13px] leading-4 text-grey-2">{loop.trigger}</span>
            </div>
          </div>
          <span className="text-[13px] font-medium leading-4 text-green-text">Live</span>
        </div>
        <StatRow>
          <Stat value={loop.people} label="people in the loop now" valueClass={cn(stat, 'text-ink')} />
          <Stat value={loop.meetings} label="meetings booked" valueClass={cn(stat, 'text-green-text')} />
          <Stat value={loop.spent} label="spent on gifts so far" valueClass={cn(stat, 'text-ink')} />
        </StatRow>
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[20px] border-t border-line-soft bg-[#FBFBFA] px-6 py-3.5">
        <Photo id={loop.activityFace} className="h-6 w-6 rounded-full" />
        <span className="flex-1 basis-0 text-[13px] leading-4 text-[#33353C]">{loop.activity}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">{loop.activityWhen}</span>
      </div>
    </Link>
  )
}

// ── Quarter + finished ──────────────────────────────────────────────────────

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
      <span className="text-[12.5px] leading-4 text-grey-2">{label}</span>
    </div>
  )
}

export function QuarterAndDone() {
  const stat = 'text-[18px] font-semibold leading-6 text-ink'
  return (
    <div className="flex gap-6">
      <section className="flex min-w-0 flex-[2] basis-0 flex-col justify-between gap-5 rounded-[20px] bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-semibold leading-5 text-ink">This quarter</h2>
          <span className="text-[13px] leading-4 text-grey-3">Oct – Dec</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold leading-8 tracking-[-0.02em] text-ink">$12,840</span>
            <span className="text-[14px] leading-5 text-grey-2">of $20,000 gift budget</span>
          </div>
          <div className="flex h-2 shrink-0 gap-[3px]">
            <div className="flex-[12840] basis-0 rounded-[4px] bg-violet" />
            <div className="flex-[1950] basis-0 rounded-[4px] bg-[#C9C4FC]" />
            <div className="flex-[5210] basis-0 rounded-[4px] bg-[#EFEFEC]" />
          </div>
          <div className="flex items-center gap-4">
            <Legend color="#6559F7" label="Spent" />
            <Legend color="#C9C4FC" label="Year-end draft, if launched" />
            <Legend color="#E4E4E1" label="Left" />
          </div>
        </div>
        <div className="border-t border-line-soft pt-5">
          <StatRow>
            <Stat
              value={
                <span className="flex items-baseline gap-1.5">
                  <span className={stat}>38</span>
                  <span className="text-[12.5px] font-medium leading-4 text-green-text">+12 on last quarter</span>
                </span>
              }
              label="meetings booked"
              valueClass=""
            />
            <Stat value="$338" label="gift cost per meeting" valueClass={stat} />
            <Stat value="$684 saved" label="9 gifts held, they booked first" valueClass={stat} />
          </StatRow>
        </div>
      </section>
      <section className="flex min-w-0 flex-1 basis-0 flex-col gap-4 rounded-[20px] bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-semibold leading-5 text-ink">Finished</h2>
          <span className="text-[13px] leading-4 text-grey-3">1 loop</span>
        </div>
        <Photo id={GIFT.postcard} className="h-24 w-full rounded-[12px]" />
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold leading-5 text-ink">SaaSBoomi follow-up</span>
          <span className="text-[12.5px] leading-4 text-grey-2">112 reached · 21 meetings · $6,670</span>
        </div>
        <Link to="/live/results?state=finished" className={cn(WHITE_BTN, 'h-9 shrink-0 gap-1.5 rounded-[10px] text-[13px] font-medium leading-4')}>
          <svg width="13" height="13" viewBox="0 0 16 16" className="shrink-0">
            <path d="M2.5 13.5h11M4.5 11V7.5M8 11V4.5M11.5 11V6" fill="none" stroke="#111216" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          See what worked
        </Link>
      </section>
    </div>
  )
}
