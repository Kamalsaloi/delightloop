import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LinkedInMark } from '@/components/ui'
import { giftById, listById, MOMENTS, peopleForList } from '@/data/catalog'
import { asset, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { DAY, fmtAgo, fmtDay, money, nextMonday } from '@/lib/time'
import { flatten, nodeDays } from '@/store/graph'
import { SUGGESTION_LIST } from '@/store/seed'
import { audienceCounts, giftTotal, needsBudgetApproval, openReplies } from '@/store/selectors'
import { activePeople } from '@/store/sim'
import { useStore } from '@/store/store'
import type { FlowNode, Loop, Suggestion } from '@/store/types'
import { ArrowIcon, CalendarIcon, FaceStack, HubDot, Photo, PlusIcon, Stat, StatRow, WHITE_BTN } from './parts'

const DRAFT_SHADOW = 'shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_8px_24px_#1112160A]'

// ── Gifty spotted ───────────────────────────────────────────────────────────

export function visibleSuggestions(all: Suggestion[], loops: Loop[]) {
  return all.filter((s) => !s.after && !(s.usedBy && loops.some((l) => l.id === s.usedBy))).slice(0, 3)
}

/** Gifty-box mark in front of "Gifty spotted" (Paper HEB-0). */
function GiftMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0" aria-hidden>
      <rect x="3.2" y="8.6" width="13.6" height="8.4" rx="1.6" fill="none" stroke="#6559F7" strokeWidth="1.6" />
      <rect x="2.2" y="5.6" width="15.6" height="3" rx="1" fill="#EFECFF" stroke="#6559F7" strokeWidth="1.6" />
      <path d="M10 5.6V17" fill="none" stroke="#6559F7" strokeWidth="1.6" />
      <path
        d="M10 5.6C9.6 4.2 8.4 2.6 6.9 2.9 5.4 3.2 5.7 5.6 7.6 5.6H10ZM10 5.6C10.4 4.2 11.6 2.6 13.1 2.9 14.6 3.2 14.3 5.6 12.4 5.6H10Z"
        fill="none"
        stroke="#6559F7"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GiftySpotted({ suggestions, onStartOwn }: { suggestions: Suggestion[]; onStartOwn: () => void }) {
  const toast = useStore((s) => s.toast)
  return (
    <section className="flex flex-col gap-5 rounded-[24px] bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-2.5">
            <GiftMark />
            <h2 className="text-[16px] font-semibold leading-5 text-ink">Gifty spotted</h2>
          </span>
          <span className="text-[13px] leading-4 text-grey-3">
            {suggestions.length} {suggestions.length === 1 ? 'loop' : 'loops'} worth starting, from your CRM, LinkedIn and call notes
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => toast('Gifty looks for moments, job changes and buying signals across HubSpot, LinkedIn and your call notes')}
            className="cursor-pointer text-[13px] font-medium leading-4 text-grey-1 hover:text-ink"
          >
            How Gifty picks these
          </button>
          <button type="button" data-testid="start-own" onClick={onStartOwn} className={cn(WHITE_BTN, 'h-9 gap-2 rounded-[10px] px-4 text-[13.5px] font-medium leading-4')}>
            <PlusIcon />
            Start your own
          </button>
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

function SourceMark({ source, onViolet }: { source: Suggestion['source']; onViolet?: boolean }) {
  if (source === 'linkedin') return <LinkedInMark size={14} radius={3} />
  if (source === 'hubspot') return <HubDot />
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0">
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" fill="none" stroke={onViolet ? '#FFFFFFC7' : '#55575F'} strokeWidth="1.4" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" fill="none" stroke={onViolet ? '#FFFFFFC7' : '#55575F'} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Title/when/reach come from the clock and the list, not fixed copy. */
function useSuggestionText(s: Suggestion) {
  const clock = useStore((st) => st.clock)
  const list = listById(SUGGESTION_LIST[s.id])
  const people = list ? peopleForList(list.id) : []
  const withAddr = people.filter((p) => p.address).length
  const reach = list ? (list.accounts && list.accounts < list.people / 2 ? `${list.people} people at ${list.accounts} accounts` : `${list.people} people · ${withAddr} addresses found`) : s.reach
  if (s.id !== 'diwali') return { title: s.title, when: s.when, reach }
  const diwali = MOMENTS[0].date.getTime()
  const days = Math.round((diwali - clock) / DAY)
  const weeks = Math.round(days / 7)
  const title = days <= 0 ? 'Diwali is here' : days < 7 ? `Diwali is ${days} days out` : `Diwali is ${weeks} ${weeks === 1 ? 'week' : 'weeks'} out`
  return { title, when: `Start by ${fmtDay(nextMonday(clock))}`, reach }
}

function SuggestionCard({ s, top }: { s: Suggestion; top: boolean }) {
  const navigate = useNavigate()
  const draft = useStore((st) => st.draftFromSuggestion)
  const [hover, setHover] = useState(false)
  const text = useSuggestionText(s)

  function open() {
    const id = draft(s.id)
    if (id) navigate(`/loops/${id}/audience`)
  }

  if (top) {
    return (
      <div
        role="button"
        tabIndex={0}
        data-testid={`suggestion-${s.id}`}
        onClick={open}
        onKeyDown={(e) => e.key === 'Enter' && open()}
        className="flex min-w-0 flex-1 basis-0 cursor-pointer flex-col rounded-[20px] bg-violet shadow-[inset_0_0_0_1px_#5547E6,inset_0_1px_0_rgba(255,255,255,.18),0_16px_36px_-16px_rgba(101,89,247,.55)] transition-transform duration-150 hover:-translate-y-px"
      >
        <div className="flex flex-col gap-3.5 px-5 pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SourceMark source={s.source} onViolet />
              <span className="text-[12.5px] leading-4 text-white/[.78]">{s.sourceLabel}</span>
            </div>
            <span className="text-[12.5px] font-semibold leading-4 text-white">{text.when}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[17px] font-semibold leading-[22px] tracking-[-0.01em] text-white">{text.title}</h3>
            <p className="text-[13px] leading-[19px] text-white/80">{s.body}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-16 shrink-0">
              {s.faces.map((id, i) => (
                <Photo key={id + i} id={id} className="absolute top-0.5 h-6 w-6 rounded-full shadow-[0_0_0_2px_#6559F7]" style={{ left: i * 20 }} />
              ))}
            </div>
            <span className="text-[12.5px] leading-4 text-white/[.78]">{text.reach}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-b-[20px] border-t border-white/[.16] bg-white/[.08] px-5 py-3">
          <span className="flex-1 basis-0 text-[12px] leading-4 text-white/70">{s.steps}</span>
          <span className="flex h-8 items-center gap-1.5 rounded-[9px] bg-white px-3 text-[12.5px] font-semibold leading-4 text-[#4B3FD9] shadow-[0_1px_2px_#11121626]">
            View the loop
            <ArrowIcon size={12} color="#4B3FD9" />
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`suggestion-${s.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      className={cn(
        'flex min-w-0 flex-1 basis-0 cursor-pointer flex-col rounded-[20px] transition-[background-color,box-shadow] duration-150',
        hover ? 'bg-white shadow-[0_0_0_1px_#E4E4E1,0_8px_24px_-12px_#11121624]' : 'bg-[#F7F7F5]',
      )}
    >
      <div className="flex flex-col gap-3.5 px-5 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <SourceMark source={s.source} />
            <span className="text-[12.5px] leading-4 text-grey-1">{s.sourceLabel}</span>
          </div>
          <span className={cn('text-[12.5px] leading-4', s.source === 'moment' ? 'font-medium text-amber-text' : 'text-grey-3')}>{text.when}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[17px] font-semibold leading-[22px] tracking-[-0.01em] text-ink">{text.title}</h3>
          <p className="text-[13px] leading-[19px] text-grey-2">{s.body}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <FaceStack ids={s.faces} />
          <span className="text-[12.5px] leading-4 text-grey-1">{text.reach}</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[20px] border-t border-line px-5 py-3">
        <span className="flex-1 basis-0 text-[12px] leading-4 text-grey-3">{s.steps}</span>
        <span className={cn(WHITE_BTN, 'h-8 rounded-[9px] px-3 text-[12.5px] font-medium leading-4')}>View the loop</span>
      </div>
    </div>
  )
}

// ── Loop cards ──────────────────────────────────────────────────────────────

function SummaryRow({ label, value, weight = 'font-semibold' }: { label: string; value: ReactNode; weight?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] leading-4 text-grey-1">{label}</span>
      <span className={cn('text-right text-[13px] leading-4 text-ink', weight)}>{value}</span>
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

/** 40px tile for a step in the Home timelines. */
function StepTile({ n }: { n: FlowNode }) {
  if (n.kind === 'split')
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#ECECF1]">
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
          <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="#5C5D6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  switch (n.type) {
    case 'email':
    case 'bump':
      return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160F]">
          <GmailGlyph />
        </span>
      )
    case 'linkedin':
      return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-linkedin text-[16px] font-bold leading-[18px] text-white">in</span>
    case 'postcard':
      return n.data.design ? <Photo id={n.data.design} className="h-10 w-10 rounded-[12px]" /> : <span className="h-10 w-10 shrink-0 rounded-[12px] bg-[#EDE7DD]" />
    case 'gift':
      return <Photo id={giftById(n.data.picks[0]?.giftId ?? 'chai').img} className="h-10 w-10 rounded-[12px]" />
    default:
      return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white shadow-[0_0_0_1px_#EBEBE8]">
          <CalendarIcon />
        </span>
      )
  }
}

function Connector({ live }: { live?: boolean }) {
  return <div className={cn('h-px w-6 shrink-0 bg-line-strong', live ? 'mt-5' : 'relative top-5')} />
}

/** Steps worth showing on a card: no waits or splits, at most four. */
function headline(l: Loop) {
  return flatten(l.graph.steps)
    .filter((n) => n.kind === 'step' && n.type !== 'wait' && n.type !== 'task')
    .slice(0, 4)
}

/** "Waiting on you": a draft. */
export function DraftCard({ loop }: { loop: Loop }) {
  const navigate = useNavigate()
  const clock = useStore((s) => s.clock)
  const days = nodeDays(loop.graph, loop.startAt)
  const c = audienceCounts(loop)
  const steps = headline(loop)
  const total = giftTotal(loop)
  const needsOk = needsBudgetApproval(loop)
  const budget = !total ? 'No gifts yet' : needsOk ? `${money(total)}, ${loop.budget.approval === 'approved' ? 'approved' : `waiting on ${loop.budget.approver}`}` : `${money(total)}, within your limit`
  const lead = loop.moment ? `Launch by ${fmtDay(loop.startAt)} so gifts land before ${loop.moment.label === 'Year-end' ? 'the holidays' : loop.moment.label}` : `Starts ${fmtDay(loop.startAt)} once you launch`
  const desc = loop.brief ?? (steps.length ? `${steps.length} steps so far, built by you.` : 'An empty canvas, waiting for its first step.')
  const to = loop.audience.kind === 'none' ? 'audience' : 'build'

  return (
    <div data-testid={`draft-${loop.id}`} className={cn('flex gap-8 rounded-[20px] bg-white p-6', DRAFT_SHADOW)}>
      <Photo id={loop.image} className="h-[232px] w-[280px] rounded-[14px]" />
      <div className="flex min-w-0 flex-1 basis-0 flex-col justify-between py-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold leading-4 text-amber-text">Draft</span>
            <span className="text-[13px] leading-4 text-grey-2">{lead}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">{loop.name}</h3>
            <p className="line-clamp-2 text-[14px] leading-5 text-grey-2">{desc}</p>
          </div>
        </div>
        {steps.length > 0 && (
          <div className="flex items-start">
            {steps.map((n, i) => (
              <div key={n.id} className="flex items-start">
                {i > 0 && <Connector />}
                <div className="flex w-16 shrink-0 flex-col items-center gap-2">
                  <StepTile n={n} />
                  <span className="text-[11.5px] leading-[14px] text-grey-3">Day {Math.round(days[n.id] ?? 0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex w-[288px] shrink-0 flex-col justify-between rounded-[14px] bg-page p-5">
        <div className="flex flex-col gap-4">
          {loop.audience.kind === 'list' ? (
            <div className="flex flex-col gap-2">
              <SummaryRow label="Addresses found" value={`${c.withAddress} of ${c.everyone}`} />
              <div className="flex h-1.5 shrink-0 gap-[3px]">
                <div className="basis-0 rounded-[3px] bg-green" style={{ flexGrow: c.withAddress }} />
                {c.noAddress > 0 && <div className="basis-0 rounded-[3px] bg-[#F2C46B]" style={{ flexGrow: c.noAddress }} />}
              </div>
            </div>
          ) : (
            <SummaryRow label="Audience" value={loop.audience.kind === 'signal' ? 'Always on' : 'Not picked yet'} />
          )}
          <SummaryRow label="Budget" value={budget} />
          <SummaryRow label="Last edited" value={fmtAgo(loop.updatedAt, clock)} weight="font-medium" />
        </div>
        <button
          type="button"
          data-testid={`continue-${loop.id}`}
          onClick={() => navigate(`/loops/${loop.id}/${to}`)}
          className={cn(WHITE_BTN, 'h-10 shrink-0 gap-2 rounded-[10px] text-[13.5px] font-medium leading-4')}
        >
          Continue building
          <ArrowIcon />
        </button>
      </div>
    </div>
  )
}

/** "Needs you": a launched loop that's live or paused. */
export function LiveCard({ loop }: { loop: Loop }) {
  const navigate = useNavigate()
  const live = loop.live!
  const c = live.counts
  const open = openReplies(loop)
  const issue = live.delivery.issue === 'open'
  const day = Math.max(1, Math.ceil(live.day))
  const end = loop.startAt + live.endDay * DAY
  const booked = live.replies.filter((r) => r.status === 'booked').map((r) => r.first)
  const paused = loop.status === 'paused'
  const asks = [open ? `${open} ${open === 1 ? 'reply needs' : 'replies need'} Sam` : null, issue ? 'one gift came back' : null].filter(Boolean)
  const line = asks.length ? `${asks.join(', and ')}. Gifty handled the rest.` : paused ? 'Paused. Nothing new goes out until you resume.' : 'Nothing needs you right now. Gifty is handling the loop.'
  const tiles = headline(loop)

  function label(n: FlowNode): string {
    if (n.kind !== 'step') return ''
    if (n.type === 'email') return c.sent ? `${c.opened} opened` : 'Sending'
    if (n.type === 'bump') return c.bumpSent ? `${c.bumpSent} bumped` : 'Waiting'
    if (n.type === 'linkedin') return c.linkedinSent ? `${c.connected} connected` : 'Waiting'
    if (n.type === 'postcard') return c.postcardsLanded ? `${live.visits.length} visited` : c.postcards ? 'Printing' : 'Waiting'
    if (n.type === 'gift') return issue ? '1 needs you' : c.delivered ? `${c.delivered} delivered` : c.giftsShipped ? 'Shipping' : 'Waiting'
    return ''
  }
  const cta = open ? `Answer ${open} ${open === 1 ? 'reply' : 'replies'}` : issue ? 'Sort the delivery' : paused ? 'Review & resume' : 'See results'
  const to = open ? 'results' : issue || paused ? 'build' : 'results'

  return (
    <div data-testid={`live-${loop.id}`} className="flex gap-8 rounded-[20px] bg-white p-6 shadow-card">
      <Photo id={loop.image} className="h-[232px] w-[280px] rounded-[14px]" />
      <div className="flex min-w-0 flex-1 basis-0 flex-col justify-between py-2">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className={cn('text-[13px] font-semibold leading-4', paused ? 'text-amber-text' : 'text-green-text')}>
              {paused ? 'Paused' : 'Live'} · Day {day} of {Math.round(live.endDay)}
            </span>
            <span className="text-[13px] leading-4 text-grey-2">Ends {fmtDay(end)}</span>
          </div>
          <h3 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">{loop.name}</h3>
          <p className="text-[14.5px] leading-[22px] text-grey-1">{line}</p>
        </div>
        <div className="flex items-start gap-3">
          {tiles.map((n, i) => (
            <div key={n.id} className="flex items-start gap-3">
              {i > 0 && <Connector live />}
              <div className="flex w-[88px] shrink-0 flex-col items-center gap-2">
                <StepTile n={n} />
                <span className={cn('text-[12px] leading-4', label(n) === '1 needs you' ? 'font-medium text-amber-text' : 'text-grey-1')}>{label(n)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-[288px] shrink-0 flex-col justify-between rounded-[14px] bg-page p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[26px] font-semibold leading-[30px] tracking-[-0.02em] text-green-text">
              {c.booked} {c.booked === 1 ? 'meeting' : 'meetings'}
            </span>
            <span className="text-[12.5px] leading-4 text-grey-2">{booked.length ? `booked by ${booked.slice(0, 2).join(' and ')}${booked.length > 2 ? ` and ${booked.length - 2} more` : ''}` : 'none booked yet'}</span>
          </div>
          <SummaryRow label="Pipeline created" value={money(c.pipeline)} />
          <SummaryRow label="Spent so far" value={`${money(c.spent)} of ${money(Math.max(loop.budget.limit, giftTotal(loop)))}`} />
        </div>
        <button type="button" data-testid={`open-${loop.id}`} onClick={() => navigate(`/loops/${loop.id}/${to}`)} className={cn(WHITE_BTN, 'h-10 shrink-0 gap-2 rounded-[10px] text-[13.5px] font-semibold leading-4')}>
          {cta}
          <ArrowIcon size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Running ─────────────────────────────────────────────────────────────────

export function RunningCards({ loops }: { loops: Loop[] }) {
  return (
    <div className="flex gap-6">
      {loops.map((l) => (
        <RunningCard key={l.id} loop={l} />
      ))}
    </div>
  )
}

function RunningCard({ loop }: { loop: Loop }) {
  const clock = useStore((s) => s.clock)
  const card = loop.card
  const stat = 'text-[24px] font-semibold leading-7 tracking-[-0.02em]'
  if (!card) return null
  return (
    <Link
      to={`/loops/${loop.id}/results`}
      data-testid={`running-${loop.id}`}
      className="flex min-w-0 flex-1 basis-0 cursor-pointer flex-col rounded-[20px] bg-white shadow-card transition-shadow hover:shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_#1112160A,0_8px_24px_#1112160A]"
    >
      <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
        <div className="flex items-center gap-3.5">
          <Photo id={loop.image} className="h-12 w-12 rounded-[12px]" />
          <div className="flex min-w-0 flex-1 basis-0 flex-col gap-1">
            <span className="text-[15px] font-semibold leading-5 text-ink">{loop.name}</span>
            <div className="flex items-center gap-1.5">
              {card.source === 'hubspot' ? <HubDot size={16} glyph={10} /> : <LinkedInMark size={16} radius={4} />}
              <span className="text-[13px] leading-4 text-grey-2">{card.trigger}</span>
            </div>
          </div>
          <span className={cn('text-[13px] font-medium leading-4', loop.status === 'paused' ? 'text-amber-text' : 'text-green-text')}>{loop.status === 'paused' ? 'Paused' : 'Live'}</span>
        </div>
        <StatRow>
          <Stat value={card.people} label="people in the loop now" valueClass={cn(stat, 'text-ink')} />
          <Stat value={card.meetings} label="meetings booked" valueClass={cn(stat, 'text-green-text')} />
          <Stat value={money(card.spent)} label="spent on gifts so far" valueClass={cn(stat, 'text-ink')} />
        </StatRow>
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[20px] border-t border-line-soft bg-[#FBFBFA] px-6 py-3.5">
        <Photo id={card.activity.face} className="h-6 w-6 rounded-full" />
        <span key={card.activity.text} className="flex-1 basis-0 animate-[fade_.4s_ease-out] text-[13px] leading-4 text-[#33353C]">
          {card.activity.text}
        </span>
        <span className="text-[12.5px] leading-4 text-grey-3">{fmtAgo(card.activity.at, clock)}</span>
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

const BUDGET = 20_000

export function QuarterAndDone({ loops, finished }: { loops: Loop[]; finished: Loop[] }) {
  const navigate = useNavigate()
  const spent = loops.reduce((a, l) => a + (l.card?.spent ?? (l.status !== 'draft' ? (l.live?.counts.spent ?? 0) : 0)), 0)
  const meetings = loops.reduce((a, l) => a + (l.card?.meetings ?? l.live?.counts.booked ?? 0), 0)
  const drafts = loops.filter((l) => l.status === 'draft')
  const committed = drafts.reduce((a, l) => a + giftTotal(l), 0)
  const left = Math.max(0, BUDGET - spent - committed)
  const saved = loops.reduce((a, l) => a + (l.live?.counts.saved ?? 0), 0)
  const held = loops.reduce((a, l) => a + (l.live?.counts.held ?? 0), 0)
  const stat = 'text-[18px] font-semibold leading-6 text-ink'
  const latest = finished[0]
  const sum = latest?.live?.summary

  return (
    <div className="flex gap-6">
      <section className="flex min-w-0 flex-[2] basis-0 flex-col justify-between gap-5 rounded-[20px] bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-semibold leading-5 text-ink">This quarter</h2>
          <span className="text-[13px] leading-4 text-grey-3">Oct – Dec</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold leading-8 tracking-[-0.02em] text-ink" data-testid="quarter-spent">
              {money(spent)}
            </span>
            <span className="text-[14px] leading-5 text-grey-2">of {money(BUDGET)} gift budget</span>
          </div>
          <div className="flex h-2 shrink-0 gap-[3px]">
            <div className="basis-0 rounded-[4px] bg-violet transition-[flex-grow] duration-500" style={{ flexGrow: spent }} />
            {committed > 0 && <div className="basis-0 rounded-[4px] bg-[#C9C4FC]" style={{ flexGrow: committed }} />}
            <div className="basis-0 rounded-[4px] bg-[#EFEFEC]" style={{ flexGrow: left }} />
          </div>
          <div className="flex items-center gap-4">
            <Legend color="#6559F7" label="Spent" />
            {committed > 0 && <Legend color="#C9C4FC" label={drafts.length === 1 ? `${drafts[0].name.split(' ·')[0]} draft, if launched` : `${drafts.length} drafts, if launched`} />}
            <Legend color="#E4E4E1" label="Left" />
          </div>
        </div>
        <div className="border-t border-line-soft pt-5">
          <StatRow>
            <Stat value={<span className={stat}>{meetings}</span>} label="meetings booked" valueClass="" />
            <Stat value={meetings ? money(spent / meetings) : '–'} label="gift cost per meeting" valueClass={stat} />
            <Stat value={`${money(saved)} saved`} label={`${held} gifts held, they booked first`} valueClass={stat} />
          </StatRow>
        </div>
      </section>
      <section className="flex min-w-0 flex-1 basis-0 flex-col gap-4 rounded-[20px] bg-white p-6 shadow-card" data-testid="finished-card">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-semibold leading-5 text-ink">Finished</h2>
          <span className="text-[13px] leading-4 text-grey-3">
            {finished.length} {finished.length === 1 ? 'loop' : 'loops'}
          </span>
        </div>
        {latest && sum ? (
          <>
            <img src={asset(latest.image ?? GIFT.postcard)} alt="" className="h-24 w-full rounded-[12px] object-cover" />
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold leading-5 text-ink">{latest.name}</span>
              <span className="text-[12.5px] leading-4 text-grey-2">
                {sum.reached} reached · {sum.meetings} meetings · {money(sum.spent)}
              </span>
            </div>
            {finished.length > 1 && (
              <div className="flex flex-col gap-1.5 border-t border-line-soft pt-3">
                {finished.slice(1).map((l) => (
                  <button key={l.id} type="button" onClick={() => navigate(`/loops/${l.id}/results`)} className="flex cursor-pointer items-baseline justify-between text-left">
                    <span className="text-[13px] font-medium leading-4 text-ink hover:underline">{l.name}</span>
                    <span className="text-[12.5px] leading-4 text-grey-3">{l.live?.summary?.meetings ?? 0} meetings</span>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              data-testid={`worked-${latest.id}`}
              onClick={() => navigate(`/loops/${latest.id}/results`)}
              className={cn(WHITE_BTN, 'mt-auto h-9 shrink-0 gap-1.5 rounded-[10px] text-[13px] font-medium leading-4')}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" className="shrink-0">
                <path d="M2.5 13.5h11M4.5 11V7.5M8 11V4.5M11.5 11V6" fill="none" stroke="#111216" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              See what worked
            </button>
          </>
        ) : (
          <p className="text-[13px] leading-5 text-grey-3">Nothing finished yet this quarter.</p>
        )}
      </section>
    </div>
  )
}

export { activePeople }
