// What "+ Add step" can insert, Gifty's suggestion for the slot, and the factory for each pick.
import type { ReactNode } from 'react'
import { GmailMark } from '@/components/ui'
import { asset, FACE, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { findSeq, flatten, locate } from '@/store/graph'
import { bumpStep, defaultGoal, emailStep, giftStep, linkedinStep, postcardStep, splitStep, taskStep, waitStep } from '@/store/templates'
import type { FlowNode, Graph, Loop, Slot, SplitKind } from '@/store/types'

// ── Icons ───────────────────────────────────────────────────────────────────

function GlyphSvg({ children }: { children: ReactNode }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0" aria-hidden>
      {children}
    </svg>
  )
}
const S = { stroke: '#33353C', strokeWidth: 1.5 } as const
export const MENU_GLYPH = {
  clock: (
    <GlyphSvg>
      <circle cx="8" cy="8" r="5.5" {...S} />
      <path d="M8 5v3l2 1.5" {...S} strokeLinecap="round" />
    </GlyphSvg>
  ),
  calendar: (
    <GlyphSvg>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" {...S} />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" {...S} strokeLinecap="round" />
    </GlyphSvg>
  ),
  link: (
    <GlyphSvg>
      <path d="M6.5 9.5 9.5 6.5M7 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M9 11.5l-1 1A2.5 2.5 0 0 1 4.5 9l1-1" {...S} strokeLinecap="round" />
    </GlyphSvg>
  ),
  mail: (
    <GlyphSvg>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" {...S} />
      <path d="m2.5 4.5 5.5 4 5.5-4" {...S} strokeLinejoin="round" />
    </GlyphSvg>
  ),
  phone: (
    <GlyphSvg>
      <path
        d="M5.2 2.5h-1.7A1 1 0 0 0 2.5 3.6c.3 5.3 4.6 9.6 9.9 9.9a1 1 0 0 0 1.1-1v-1.7l-2.6-1-1.4 1.3a7 7 0 0 1-3.6-3.6L7.2 6 6.2 3.4Z"
        {...S}
        strokeLinejoin="round"
      />
    </GlyphSvg>
  ),
  pen: (
    <GlyphSvg>
      <path d="M10.5 2.5 13.5 5.5 6 13H3v-3Z" {...S} strokeLinejoin="round" />
    </GlyphSvg>
  ),
  flag: (
    <GlyphSvg>
      <path d="M4 14V2.5M4 3h7.5l-1.5 2.5L11.5 8H4" stroke="#1E8A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </GlyphSvg>
  ),
}

const TILE24 = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px]'
export const ItemIcon = {
  gmail: () => (
    <span className={cn(TILE24, 'bg-white shadow-[0_0_0_1px_#EBEBE8]')}>
      <GmailMark width={13} />
    </span>
  ),
  linkedin: () => <span className={cn(TILE24, 'bg-linkedin text-[11px] font-bold leading-3 text-white')}>in</span>,
  image: (id: string) => <span className="h-6 w-6 shrink-0 rounded-[6px] bg-cover bg-center" style={{ backgroundImage: `url(${asset(id)})` }} />,
  glyph: (g: ReactNode) => <span className={cn(TILE24, 'bg-white shadow-[0_0_0_1px_#EBEBE8]')}>{g}</span>,
}

const TILE36 = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]'
export const SuggestIcon = {
  gmail: () => (
    <span className={cn(TILE36, 'bg-white shadow-[0_0_0_1px_#EBEBE8]')}>
      <GmailMark width={18} />
    </span>
  ),
  linkedin: () => <span className={cn(TILE36, 'bg-linkedin text-[15px] font-bold leading-4 text-white')}>in</span>,
  check: () => (
    <span className={cn(TILE36, 'bg-white shadow-[0_0_0_1px_#EBEBE8]')}>
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path d="M2.75 7.25 9 3l6.25 4.25v6.5a1 1 0 0 1-1 1H3.75a1 1 0 0 1-1-1Z" stroke="#33353C" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="m2.75 7.25 6.25 4.25 6.25-4.25" stroke="#33353C" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="14" cy="4" r="3" fill="#22B573" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    </span>
  ),
  image: (id: string) => <span className="h-9 w-11 shrink-0 rounded-[8px] bg-cover bg-center" style={{ backgroundImage: `url(${asset(id)})` }} />,
  gifts: () => (
    <span className="relative h-9 w-[52px] shrink-0">
      {[GIFT.g1, GIFT.g3, GIFT.g4].map((id, i) => (
        <span key={id} className="absolute top-0 h-9 w-9 rounded-[9px] bg-cover bg-center shadow-[0_0_0_2px_#FFFFFF]" style={{ left: i * 8, backgroundImage: `url(${asset(id)})` }} />
      ))}
    </span>
  ),
  goal: () => (
    <span className={cn(TILE36, 'bg-[#1F9D61] shadow-[inset_0_0_0_1px_#198A54]')}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M4 14V2.5M4 3h7.5l-1.5 2.5L11.5 8H4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ),
}

// ── Menu model ──────────────────────────────────────────────────────────────

export type MenuTab = 'reach' | 'timing'
export type Choice = { label: string; face?: string }
export type SuggestRow = { key: string; label: string; choices: Choice[]; value: number }
export type Suggestion = { id: string; icon: ReactNode; title: string; subtitle: string; label: string; tab: MenuTab; rows: SuggestRow[] }
export type MenuItem = { id: string; label: string; hint: string; icon: ReactNode; disabled?: boolean }
export type MenuGroup = { title: string; items: MenuItem[] }
export type MenuContent = Record<MenuTab, MenuGroup[]>

/** What sits before a slot: the node right above it, and whether it's the top of a split branch. */
export type SlotContext = { prev: FlowNode | null; branch: { split: Extract<FlowNode, { kind: 'split' }>; index: 0 | 1 } | null; hasEmailBefore: boolean; hasGiftBefore: boolean; hasGoal: boolean; people: number; withProfile: number }

export function slotContext(loop: Loop, slot: Slot): SlotContext {
  const g = loop.graph
  const steps = findSeq(g.steps, slot.seqId) ?? []
  let prev: FlowNode | null = steps[slot.index - 1] ?? null
  let branch: SlotContext['branch'] = null
  if (!prev && slot.seqId !== 'root') {
    const split = flatten(g.steps).find((n) => n.kind === 'split' && n.branches.some((b) => b.id === slot.seqId))
    if (split?.kind === 'split') {
      branch = { split, index: split.branches[0].id === slot.seqId ? 0 : 1 }
      prev = split
    }
  }
  // Everything that runs before this slot, in reading order.
  const all = flatten(g.steps)
  const cut = prev ? all.findIndex((n) => n.id === prev!.id) : -1
  const before = all.slice(0, cut + 1)
  const people = loop.audience.people.filter((p) => !loop.audience.removed.includes(p.slug))
  return {
    prev,
    branch,
    hasEmailBefore: before.some((n) => n.kind === 'step' && (n.type === 'email' || n.type === 'bump')),
    hasGiftBefore: before.some((n) => n.kind === 'step' && n.type === 'gift'),
    hasGoal: !!g.goal,
    people: people.length,
    withProfile: people.filter((p) => !p.notOnLinkedIn).length,
  }
}

export function menuContent(ctx: SlotContext): MenuContent {
  const profile = ctx.people ? `${ctx.withProfile} have a profile` : 'Needs their profile'
  return {
    reach: [
      {
        title: 'Email',
        items: [
          { id: 'email', label: 'Send an email', hint: 'Write your own', icon: ItemIcon.gmail() },
          { id: 'bump', label: 'Reply in thread', hint: ctx.hasEmailBefore ? 'Lands on the last email' : 'Needs an email first', icon: ItemIcon.gmail(), disabled: !ctx.hasEmailBefore },
        ],
      },
      {
        title: 'LinkedIn',
        items: [
          { id: 'connect', label: 'Connection request', hint: profile, icon: ItemIcon.linkedin() },
          { id: 'message', label: 'LinkedIn message', hint: 'If they’re connected', icon: ItemIcon.linkedin() },
          { id: 'view', label: 'View their profile', hint: 'They see Sam looked', icon: ItemIcon.linkedin() },
          { id: 'like', label: 'Like a recent post', hint: 'A soft first touch', icon: ItemIcon.linkedin() },
        ],
      },
      {
        title: 'Mail and gifts',
        items: [
          { id: 'postcard', label: 'Postcard', hint: 'Lands in 1–2 days', icon: ItemIcon.image(GIFT.postcard) },
          { id: 'letter', label: 'Handwritten letter', hint: '$9, a day slower', icon: ItemIcon.glyph(MENU_GLYPH.pen) },
          { id: 'gift', label: 'Send a gift', hint: 'One per person', icon: ItemIcon.image(GIFT.g1) },
          { id: 'giftcard', label: 'Gift card', hint: 'No address needed', icon: ItemIcon.image(GIFT.g6) },
        ],
      },
      { title: 'Tasks', items: [{ id: 'call', label: 'Call task for Sam', hint: 'A HubSpot task', icon: ItemIcon.glyph(MENU_GLYPH.phone) }] },
    ],
    timing: [
      {
        title: 'Wait',
        items: [
          { id: 'wait', label: 'Wait, then continue', hint: 'No split', icon: ItemIcon.glyph(MENU_GLYPH.clock) },
          { id: 'wait-week', label: 'Wait a week', hint: 'e.g. after a holiday', icon: ItemIcon.glyph(MENU_GLYPH.calendar) },
        ],
      },
      {
        title: 'Split',
        items: [
          { id: 'split-opened', label: 'Opened the email?', hint: ctx.hasEmailBefore ? 'Opened and Not opened' : 'Needs an email first', icon: ItemIcon.glyph(MENU_GLYPH.mail), disabled: !ctx.hasEmailBefore },
          { id: 'split-clicked', label: 'Clicked a link', hint: 'Rare in a first email', icon: ItemIcon.glyph(MENU_GLYPH.link), disabled: !ctx.hasEmailBefore },
          { id: 'split-linkedin', label: 'Has a LinkedIn profile', hint: ctx.people ? `${ctx.withProfile} of ${ctx.people}` : 'Two paths', icon: ItemIcon.linkedin() },
          { id: 'split-delivered', label: 'Gift delivered?', hint: ctx.hasGiftBefore ? 'Follow up only then' : 'Needs a gift first', icon: ItemIcon.image(GIFT.g1), disabled: !ctx.hasGiftBefore },
        ],
      },
      { title: 'End', items: [{ id: 'goal', label: 'Set the goal', hint: ctx.hasGoal ? 'Already set' : 'Ends the loop for that person', icon: ItemIcon.glyph(MENU_GLYPH.flag), disabled: ctx.hasGoal }] },
    ],
  }
}

/** Gifty's pick for this slot, based on what comes before it. */
export function suggestionFor(ctx: SlotContext): Suggestion {
  const prev = ctx.prev
  const prevType = prev?.kind === 'step' ? prev.type : prev?.kind === 'split' && !ctx.branch ? 'merge' : null
  if (ctx.branch) {
    const opened = ctx.branch.index === 0
    if (opened)
      return {
        id: 'connect',
        icon: SuggestIcon.linkedin(),
        title: 'Connect on LinkedIn',
        subtitle: 'A new channel beats a second email',
        label: 'Gifty suggests for this path',
        tab: 'reach',
        rows: [
          { key: 'note', label: 'Note', choices: [{ label: 'Short note' }, { label: 'No note' }], value: 0 },
          { key: 'fallback', label: 'If none', choices: [{ label: 'Send an email' }, { label: 'Skip this step' }], value: 0 },
        ],
      }
    return {
      id: ctx.hasEmailBefore ? 'bump' : 'email',
      icon: SuggestIcon.gmail(),
      title: ctx.hasEmailBefore ? 'Bump the same thread' : 'Send an email',
      subtitle: ctx.hasEmailBefore ? 'Lands on top of the first email' : 'Try the inbox instead',
      label: 'Gifty suggests for this path',
      tab: 'reach',
      rows: [{ key: 'delay', label: 'Sends', choices: [{ label: 'Same day' }, { label: 'Next day' }, { label: 'Day after' }], value: 0 }],
    }
  }
  if (!prev)
    return {
      id: 'intro',
      icon: SuggestIcon.gmail(),
      title: 'Intro email from Sam',
      subtitle: 'Sam already knows 12 of them',
      label: 'Gifty suggests',
      tab: 'reach',
      rows: [
        { key: 'from', label: 'From', choices: [{ label: 'Sam', face: FACE.sam }, { label: 'Rotate across 3 AEs' }], value: 0 },
        { key: 'sendAt', label: 'Sends', choices: [{ label: '9:00 their time' }, { label: '9:00 IST for all' }], value: 0 },
      ],
    }
  if (prevType === 'email')
    return {
      id: 'split-opened',
      icon: SuggestIcon.check(),
      title: 'Check if they opened',
      subtitle: 'Splits who saw it from who didn’t',
      label: 'Gifty suggests',
      tab: 'timing',
      rows: [
        { key: 'wait', label: 'Wait', choices: [{ label: '1 day' }, { label: '2 weekdays' }, { label: '3 days' }], value: 1 },
        { key: 'check', label: 'Check', choices: [{ label: 'Opened' }, { label: 'Opened twice' }, { label: 'Clicked' }], value: 0 },
      ],
    }
  if (prevType === 'gift' && !ctx.hasGoal)
    return {
      id: 'goal',
      icon: SuggestIcon.goal(),
      title: 'Goal: a meeting booked',
      subtitle: 'Ends the loop for that person',
      label: 'Gifty suggests',
      tab: 'timing',
      rows: [{ key: 'goal', label: 'Counts', choices: [{ label: 'Meeting booked' }, { label: 'Good reply' }, { label: 'Deal created' }], value: 0 }],
    }
  if (prevType === 'postcard') return giftSuggestion(ctx)
  if (prevType === 'gift')
    return {
      id: 'message',
      icon: SuggestIcon.linkedin(),
      title: 'LinkedIn message when it lands',
      subtitle: 'Ask how they liked it, no hard sell',
      label: 'Gifty suggests',
      tab: 'reach',
      rows: [],
    }
  if (prevType === 'merge' || prevType === 'linkedin' || prevType === 'bump' || prevType === 'wait')
    return {
      id: 'postcard',
      icon: SuggestIcon.image(GIFT.postcard),
      title: 'Postcard from Sam',
      subtitle: 'Paper gets noticed when inboxes are full',
      label: 'Gifty suggests',
      tab: 'reach',
      rows: [{ key: 'design', label: 'Design', choices: [{ label: 'Plain card' }, { label: 'Ask Gifty' }], value: 0 }],
    }
  return giftSuggestion(ctx)
}

function giftSuggestion(ctx: SlotContext): Suggestion {
  const subtitle = ctx.people ? `Matched to each of the ${ctx.people}` : 'Matched to who each person is'
  const price = [50, 75, 100]
  return {
    id: 'gift',
    icon: SuggestIcon.gifts(),
    title: 'A gift for each person',
    subtitle,
    label: 'Gifty suggests',
    tab: 'reach',
    rows: [
      { key: 'picks', label: 'Picks', choices: [{ label: 'Gifty' }, { label: 'Same for all' }], value: 0 },
      { key: 'price', label: 'Per gift', choices: price.map((p) => ({ label: `$${p}` })), value: 1 },
    ],
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export type Picked = { kind: 'node'; node: FlowNode } | { kind: 'goal'; goal: ReturnType<typeof defaultGoal> }

/** Build what the user picked. Copy always starts empty; Gifty writes it only when asked. */
export function buildPick(id: string, values: Record<string, number>, loop: Loop, ctx: SlotContext): Picked {
  const sender = loop.senderId
  const people = ctx.people || 48
  const delay = ctx.branch ? 0 : ctx.prev ? 1 : 0
  const split = (kind: SplitKind, count = 2) => ({ kind: 'node' as const, node: splitStep(kind, [], [], count) })
  switch (id) {
    case 'intro':
      return { kind: 'node', node: emailStep(sender, { title: 'Intro from Sam', sendAt: values.sendAt === 1 ? 'ist' : 'theirs' }, delay) }
    case 'email':
      return { kind: 'node', node: emailStep(sender, {}, delay) }
    case 'bump':
      return { kind: 'node', node: bumpStep({}, ctx.branch ? (values.delay ?? 0) : 1) }
    case 'connect':
      return { kind: 'node', node: linkedinStep('connect', { noteMode: values.note === 1 ? 'none' : 'note', fallback: values.fallback === 1 ? 'skip' : 'email' }, delay) }
    case 'message':
    case 'view':
    case 'like':
      return { kind: 'node', node: linkedinStep(id, {}, delay) }
    case 'postcard':
      return { kind: 'node', node: postcardStep(sender, 'postcard', values.design === 1 ? { design: GIFT.postcard } : {}, 1) }
    case 'letter':
      return { kind: 'node', node: postcardStep(sender, 'letter', {}, 1) }
    case 'gift':
      return { kind: 'node', node: giftStep(people, { moment: loop.moment?.id }, 2) }
    case 'giftcard':
      return { kind: 'node', node: giftStep(people, { kind: 'giftcard', title: 'Gift card', picks: [{ giftId: 'choc', people }], moment: loop.moment?.id }, 1) }
    case 'call':
      return { kind: 'node', node: taskStep(sender) }
    case 'wait':
      return { kind: 'node', node: waitStep(3) }
    case 'wait-week':
      return { kind: 'node', node: waitStep(7) }
    case 'split-opened': {
      const check: SplitKind = values.check === 1 ? 'twice' : values.check === 2 ? 'clicked' : 'opened'
      return split(check, [1, 2, 3][values.wait ?? 1])
    }
    case 'split-clicked':
      return split('clicked')
    case 'split-linkedin':
      return split('linkedin', 0)
    case 'split-delivered':
      return split('delivered', 1)
    case 'goal':
      return { kind: 'goal', goal: defaultGoal((['meeting', 'reply', 'deal'] as const)[values.goal ?? 0]) }
    default:
      return { kind: 'node', node: emailStep(sender, {}, delay) }
  }
}

/** True if a node is the last thing in its sequence (used to place the end-of-flow menu). */
export function isLast(g: Graph, id: string) {
  const at = locate(g.steps, id)
  const s = at ? findSeq(g.steps, at.seqId) : null
  return !!s && at!.index === s.length - 1
}
