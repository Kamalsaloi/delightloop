// How each graph node looks on the canvas, derived from the loop's data (draft, live or paused).
import type { ReactNode } from 'react'
import { AudiencePill, BranchLabel, ConditionPill, GiftStack, GoalPill, LinkedInTile, PostcardThumb, RuleMarker, SenderChip, StepChip, FooterNote, type StepCardProps } from '@/components/canvas'
import { GmailTile, HubSpotMark, LinkedInMark } from '@/components/ui'
import { giftById, teammate } from '@/data/catalog'
import { cn } from '@/lib/cn'
import { DAY, fmtDay, fmtShort } from '@/lib/time'
import { GIFT_TRANSIT, SPLIT_PATHS, SPLIT_QUESTION, waitLabel } from '@/store/graph'
import { activePeople } from '@/store/sim'
import type { FlowNode, GoalData, Loop, SplitNode, StepNode } from '@/store/types'
import { needsCopy } from './copy'

export type NodeMode = 'edit' | 'live' | 'paused'

export type NodeCtx = {
  loop: Loop
  mode: NodeMode
  days: Record<string, number>
  /** Paused: steps that already went out (can't change). */
  locked: Set<string>
  /** Paused: steps edited since pausing. */
  changed: Set<string>
  openResults: () => void
}

export const EDITED_RING = '!shadow-[0_0_0_1.5px_#6559F7,0_8px_24px_-12px_#6559F74D]'

const glyph = {
  pen: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
      <path d="M10.5 2.5 13.5 5.5 6 13H3v-3Z" stroke="#8B8D95" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="#5C5D6B" strokeWidth="1.5" />
      <path d="M8 5v3l2 1.5" stroke="#5C5D6B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5.2 2.5h-1.7A1 1 0 0 0 2.5 3.6c.3 5.3 4.6 9.6 9.9 9.9a1 1 0 0 0 1.1-1v-1.7l-2.6-1-1.4 1.3a7 7 0 0 1-3.6-3.6L7.2 6 6.2 3.4Z"
        stroke="#33353C"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

const dateOf = (loop: Loop, day: number) => fmtDay(loop.startAt + day * DAY)

function missingAddresses(loop: Loop) {
  return activePeople(loop).filter((p) => !p.address).length
}

/** Live: has this step's day come yet? */
const reached = (ctx: NodeCtx, id: string) => (ctx.loop.live?.day ?? -1) >= ctx.days[id]

function copyChip(n: StepNode) {
  return needsCopy(n) ? <StepChip tone="amber">Needs copy</StepChip> : <StepChip tone="green">Ready</StepChip>
}

function editedChip(ctx: NodeCtx, n: FlowNode) {
  return ctx.mode === 'paused' && ctx.changed.has(n.id) ? <StepChip className="!bg-[#ECEAFE] !text-[#5547E6]">Edited · not live yet</StepChip> : null
}

/** Title, icon, dates and footer for a step card. */
export function stepCard(n: StepNode, ctx: NodeCtx): Omit<StepCardProps, 'selected' | 'onClick'> {
  const { loop } = ctx
  const day = ctx.days[n.id] ?? 0
  const base = { day: `Day ${Math.round(day)}`, date: dateOf(loop, day) }
  const c = loop.live?.counts
  const running = ctx.mode !== 'edit' && !!c
  const people = activePeople(loop)
  const missing = missingAddresses(loop)
  const rule = loop.rules.find((r) => r.id === 'book' && r.on)

  switch (n.type) {
    case 'email': {
      const t = teammate(n.data.from)
      const isIntro = c && c.sent > 0 && reached(ctx, n.id)
      return {
        ...base,
        icon: <GmailTile />,
        title: n.data.title,
        subtitle: n.data.subject || <span className="text-grey-3">No subject yet</span>,
        footerLeft: (
          <>
            <SenderChip face={t.face} name={t.name} />
            {editedChip(ctx, n)}
          </>
        ),
        footerRight: running ? (
          isIntro ? (
            <StepChip tone="green" onClick={ctx.openResults}>
              {c.replied} replied →
            </StepChip>
          ) : (
            <FooterNote>Sends {fmtShort(loop.startAt + day * DAY)}</FooterNote>
          )
        ) : (
          copyChip(n)
        ),
      }
    }
    case 'bump': {
      const sent = running && reached(ctx, n.id)
      return {
        ...base,
        icon: <GmailTile />,
        title: n.data.title,
        subtitle: n.data.body ? `“${n.data.body.split(' ').slice(0, 4).join(' ')}”` : <span className="text-grey-3">No message yet</span>,
        footerLeft: running ? <FooterNote>{c.bumpSent || people.length - Math.round(people.length * 0.65)} people</FooterNote> : <FooterNote>{n.data.sendAs === 'thread' ? 'Replies in the intro’s thread' : 'A new thread'}</FooterNote>,
        footerRight: running ? <StepChip tone="green">{sent ? 'Sent' : 'Sends'} {fmtShort(loop.startAt + day * DAY).split(' ')[0]}</StepChip> : copyChip(n),
      }
    }
    case 'linkedin': {
      const off = people.filter((p) => p.notOnLinkedIn).length
      const subtitle =
        n.data.action === 'connect' ? (n.data.noteMode === 'note' ? 'With a short note' : 'No note') : n.data.action === 'message' ? 'A short message' : n.data.action === 'view' ? 'They see Sam looked' : 'Likes a recent post'
      const sent = running && reached(ctx, n.id)
      return {
        ...base,
        icon: <LinkedInTile />,
        title: n.data.title,
        subtitle,
        subtitleIcon: n.data.noteMode === 'note' ? glyph.pen : undefined,
        footerLeft: sent ? (
          <>
            <StepChip tone="green">
              {c.linkedinSent} sent {fmtShort(loop.startAt + day * DAY).split(' ')[0]}
            </StepChip>
            <FooterNote>{c.connected} accepted</FooterNote>
          </>
        ) : (
          <>
            {off > 0 && <StepChip tone="amber">{off} have no profile</StepChip>}
            {!(needsCopy(n) && !running) && !ctx.changed.has(n.id) && <FooterNote>{n.data.fallback === 'email' ? 'They get an email' : 'Skipped for them'}</FooterNote>}
            {editedChip(ctx, n)}
          </>
        ),
        footerRight: !running && needsCopy(n) ? <StepChip tone="amber">Needs copy</StepChip> : undefined,
      }
    }
    case 'postcard': {
      const lands = `${fmtShort(loop.startAt + (day + 1) * DAY)}–${new Date(loop.startAt + (day + 2) * DAY).getDate()} ${new Date(loop.startAt + (day + 2) * DAY).toLocaleDateString('en-GB', { month: 'short' })}`
      const printed = running && reached(ctx, n.id)
      let right: ReactNode
      if (running) right = printed ? <FooterNote tone={ctx.mode === 'paused' ? 'amber' : 'grey'}>{c.postcardsLanded ? `${c.postcardsLanded} landed` : `${c.postcards} printed${ctx.mode === 'paused' ? ', can’t change' : ''}`}</FooterNote> : <FooterNote>{people.length - missing} people</FooterNote>
      else if (needsCopy(n)) right = <StepChip tone="amber">Needs copy</StepChip>
      else right = missing > 0 ? <StepChip tone="amber">{missing} addresses missing</StepChip> : <StepChip tone="green">Every address found</StepChip>
      return {
        ...base,
        icon: <PostcardThumb design={n.data.design} />,
        title: n.data.title,
        titleAdornment: rule && !rule.emailsOnly ? <RuleMarker /> : undefined,
        subtitle: `${n.data.kind === 'letter' ? 'Letter' : 'Postcard'}, signed by ${teammate(loop.senderId).first}`,
        footerLeft: (
          <>
            <StepChip>Lands {lands}</StepChip>
            {editedChip(ctx, n)}
          </>
        ),
        footerRight: right,
      }
    }
    case 'gift': {
      const prices = n.data.picks.map((p) => giftById(p.giftId).price)
      const range = prices.length ? (Math.min(...prices) === Math.max(...prices) ? `$${prices[0]}` : `$${Math.min(...prices)} to $${Math.max(...prices)}`) : '$0'
      const issue = loop.live?.delivery.issue
      let status: ReactNode
      if (running) {
        if (issue === 'open') status = <StepChip tone="amber">1 needs you</StepChip>
        else if (issue && issue !== 'none') status = <StepChip tone="green">All handled</StepChip>
        else if (reached(ctx, n.id)) status = <StepChip tone="green">{c.delivered ? `${c.delivered} delivered` : `${c.giftsShipped} shipped`}</StepChip>
        else status = <StepChip tone="amber">Goes out {fmtShort(loop.startAt + day * DAY)} · {loop.live?.replies.length ?? 0} held</StepChip>
      } else if (n.data.noteOn && !n.data.note.trim()) status = <StepChip tone="amber">Needs copy</StepChip>
      else if (n.data.kind === 'gift' && missing > 0) status = <StepChip tone="amber">{missing} addresses missing</StepChip>
      return {
        ...base,
        icon: <GiftStack ids={n.data.picks.map((p) => giftById(p.giftId).img)} />,
        title: n.data.title,
        titleAdornment: rule && n.data.kind === 'gift' && !rule.emailsOnly ? <RuleMarker /> : undefined,
        subtitle: n.data.kind === 'giftcard' ? 'No address needed' : 'One per person',
        footerLeft: (
          <>
            <StepChip>{range}</StepChip>
            <StepChip>
              {n.data.picks.length} gift{n.data.picks.length === 1 ? '' : 's'}
            </StepChip>
            {editedChip(ctx, n) ?? status}
          </>
        ),
      }
    }
    case 'task':
      return {
        ...base,
        icon: <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white shadow-[0_0_0_1px_#EBEBE8]">{glyph.phone}</span>,
        title: n.data.title,
        subtitle: n.data.note || 'A HubSpot task for the owner',
        footerLeft: <FooterNote>Created in HubSpot</FooterNote>,
      }
    case 'wait':
      return { ...base, icon: null, title: '' }
  }
}

export function giftLandDay(ctx: NodeCtx, id: string) {
  return ctx.days[id] + GIFT_TRANSIT
}

// ── Pills ───────────────────────────────────────────────────────────────────

export function AudienceNode({ loop, onClick, drafting }: { loop: Loop; onClick?: () => void; drafting?: boolean }) {
  const people = activePeople(loop)
  const a = loop.audience
  if (a.kind === 'none') {
    return (
      <AudiencePill
        count="No audience yet"
        source="pick who it’s for"
        faces={[]}
        icon={<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fill text-[13px] leading-4 text-grey-2">?</span>}
        onClick={onClick}
      />
    )
  }
  const faces = people.filter((p) => p.face).slice(0, 3).map((p) => p.face!)
  const icon = a.kind === 'signal' ? <LinkedInMark size={24} radius={12} /> : <HubSpotMark size={24} />
  const count = a.kind === 'signal' ? 'Always on' : `${people.length} ${a.noun}`
  return <AudiencePill count={count} source={a.pillSource} faces={drafting ? faces.slice(0, 3) : faces} icon={icon} onClick={onClick} />
}

export function SplitPill({ n, selected, onClick }: { n: SplitNode; selected: boolean; onClick?: () => void }) {
  return <ConditionPill lead={waitLabel(n.data)} question={SPLIT_QUESTION[n.data.split]} selected={selected} onClick={onClick} />
}

export function WaitPill({ n, selected, onClick }: { n: Extract<StepNode, { type: 'wait' }>; selected: boolean; onClick?: () => void }) {
  const unit = n.data.unit === 'weekdays' ? 'weekday' : n.data.unit === 'days' ? 'day' : 'hour'
  return <ConditionPill icon={glyph.clock} lead="Wait" question={`${n.data.count} ${unit}${n.data.count === 1 ? '' : 's'}`} selected={selected} onClick={onClick} />
}

export function BranchPill({ split, index, ctx }: { split: SplitNode; index: 0 | 1; ctx: NodeCtx }) {
  const label = SPLIT_PATHS[split.data.split][index]
  const c = ctx.loop.live?.counts
  const live = ctx.mode !== 'edit' && c && c.opened > 0 && split.data.split === 'opened' && (ctx.loop.live?.day ?? 0) >= ctx.days[split.id]
  const n = live ? (index === 0 ? c.opened : Math.max(0, c.sent - c.opened)) : null
  return <BranchLabel tone={index === 0 ? 'green' : 'red'}>{n != null ? `${label} · ${n}` : label}</BranchLabel>
}

const GOAL_LABEL: Record<GoalData['goal'], string> = { meeting: 'Goal · a meeting booked', reply: 'Goal · a good reply', deal: 'Goal · a deal created' }

export function GoalNode({ goal, selected, onClick, booked }: { goal: GoalData; selected: boolean; onClick?: () => void; booked?: number }) {
  return (
    <GoalPill selected={selected} onClick={onClick}>
      {GOAL_LABEL[goal.goal]}
      {booked ? <span className={cn('font-medium text-white/80')}> · {booked}</span> : null}
    </GoalPill>
  )
}
