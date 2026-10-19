import type { ReactNode } from 'react'
import { GmailMark } from '@/components/ui'
import { asset, FACE, GIFT } from '@/lib/assets'
import { RG } from './glyphs'

// Mock data for B8 · Loop rules and its panel states (B8a).

export type ThenChip = { label: string; face?: string }
export type Rule = {
  id: string
  when: string
  glyph: ReactNode
  then: ThenChip[]
  /** One-line summary used in the compact list (B, E). */
  summary: string
  note?: string
  /** "+ Action" chip (opens the auto-reply rule, F). */
  addAction?: boolean
  /** Warning shown in E when this rule is switched off. */
  offWarning?: string
}

export const DEFAULT_RULES: Rule[] = [
  {
    id: 'reply',
    when: 'They reply',
    glyph: RG.reply(),
    then: [{ label: 'Stop their loop' }, { label: 'Send to Sam', face: FACE.sam }],
    summary: 'Stop, send to Sam',
    note: 'Gifty sorts the reply and drafts an answer. Sam approves it.',
    addAction: true,
  },
  {
    id: 'book',
    when: 'They book a meeting',
    glyph: RG.calendar(),
    then: [{ label: 'Stop their loop' }, { label: 'Don’t ship letter or gift' }],
    summary: 'Stop, nothing ships',
    offWarning: 'People who book will still get the letter and the gift. Good for a thank-you, costly if not.',
  },
  {
    id: 'ooo',
    when: 'Out of office',
    glyph: RG.clock(),
    then: [{ label: 'Pause' }, { label: 'Resume when they’re back' }],
    summary: 'Pause, resume later',
  },
  {
    id: 'unsub',
    when: 'They unsubscribe',
    glyph: RG.ban(),
    then: [{ label: 'Stop in every loop' }],
    summary: 'Stop everywhere',
  },
]

// ── Picker rows (triggers in B, actions in C) ───────────────────────────────

/** 28px picker icons (36px for suggestions). */
export const PickIcon = {
  glyph: (g: ReactNode) => (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-white shadow-[0_0_0_1px_#EBEBE8]">{g}</span>
  ),
  linkedin: (size = 28, radius = 8) => (
    <span
      className="flex shrink-0 items-center justify-center bg-linkedin text-[12.5px] font-bold leading-[14px] text-white"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      in
    </span>
  ),
  slack: (size = 28, radius = 7, glyphSize = 13) => (
    <span className="flex shrink-0 items-center justify-center bg-[#4A154B]" style={{ width: size, height: size, borderRadius: radius }}>
      {RG.slack(glyphSize)}
    </span>
  ),
  hubspot: () => <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-hubspot">{RG.hubspot()}</span>,
  gmail: () => PickIcon.glyph(<GmailMark width={15} />),
  image: (id: string, size = 28, radius = 7) => (
    <span className="shrink-0 bg-cover bg-center" style={{ width: size, height: size, borderRadius: radius, backgroundImage: `url(${asset(id)})` }} />
  ),
}

export type PickItem = {
  id: string
  label: string
  sub: string
  icon: ReactNode
  /** Small icon for the chosen-trigger field / ordered action list. */
  small: ReactNode
  /** Sentence fragment for "In plain words". */
  phrase: string
}
export type PickSection = { title: string; items: PickItem[] }
export type PickList = { heading: string; suggested: PickItem & { media: ReactNode }; sections: PickSection[] }

const gift = GIFT.g1

export const TRIGGERS: PickList = {
  heading: 'Gifty suggests for a gifting loop',
  suggested: {
    id: 'delivered',
    label: 'Their gift is delivered',
    sub: 'Warmest moment to follow up',
    media: PickIcon.image(gift, 36, 9),
    icon: PickIcon.image(gift),
    small: PickIcon.image(gift),
    phrase: 'someone’s gift is delivered',
  },
  sections: [
    {
      title: 'Replies and meetings',
      items: [
        { id: 'forward', label: 'They forward it to a colleague', sub: 'Bring the colleague into the loop', icon: PickIcon.glyph(RG.forward()), small: PickIcon.glyph(RG.forward()), phrase: 'someone forwards it to a colleague' },
        { id: 'cancel', label: 'They cancel a meeting', sub: 'Win it back with a nudge', icon: PickIcon.glyph(RG.calendarX()), small: PickIcon.glyph(RG.calendarX()), phrase: 'someone cancels a meeting' },
      ],
    },
    {
      title: 'Mail and gifts',
      items: [
        { id: 'address', label: 'An address can’t be found', sub: 'Ask the team before it ships', icon: PickIcon.glyph(RG.pinX()), small: PickIcon.glyph(RG.pinX()), phrase: 'an address can’t be found' },
        { id: 'returned', label: 'A gift is returned', sub: 'Fix the address and resend', icon: PickIcon.glyph(RG.returned()), small: PickIcon.glyph(RG.returned()), phrase: 'a gift is returned' },
      ],
    },
    {
      title: 'Signals',
      items: [
        { id: 'jobs', label: 'They change jobs', sub: 'Follow them to the new company', icon: PickIcon.linkedin(), small: PickIcon.linkedin(28, 7), phrase: 'someone changes jobs' },
        { id: 'pricing', label: 'They visit your pricing page', sub: 'Strong intent, tell Sam now', icon: PickIcon.glyph(RG.eye()), small: PickIcon.glyph(RG.eye()), phrase: 'someone visits your pricing page' },
      ],
    },
  ],
}

export const ACTIONS: PickList = {
  heading: 'Gifty suggests after a delivery',
  suggested: {
    id: 'slack',
    label: 'Tell Sam in Slack',
    sub: 'With a note ready to send',
    media: PickIcon.slack(36, 9, 16),
    icon: PickIcon.slack(),
    small: PickIcon.slack(),
    phrase: 'Sam gets a Slack ping',
  },
  sections: [
    {
      title: 'Reach out',
      items: [
        { id: 'linkedin', label: 'LinkedIn message from Sam', sub: 'Ask how they liked it', icon: PickIcon.linkedin(), small: PickIcon.linkedin(28, 7), phrase: 'a LinkedIn message goes out from Sam' },
        { id: 'email', label: 'Email from Sam', sub: 'A short thank-you note', icon: PickIcon.gmail(), small: PickIcon.gmail(), phrase: 'an email goes out from Sam' },
      ],
    },
    {
      title: 'The loop',
      items: [
        { id: 'pause', label: 'Pause their loop', sub: 'Give it a few days', icon: PickIcon.glyph(RG.pause()), small: PickIcon.glyph(RG.pause()), phrase: 'their loop pauses' },
        { id: 'move', label: 'Move them to another loop', sub: 'e.g. a customer welcome', icon: PickIcon.glyph(RG.arrow()), small: PickIcon.glyph(RG.arrow()), phrase: 'they move to another loop' },
      ],
    },
    {
      title: 'Your tools',
      items: [{ id: 'hubspot', label: 'Create a HubSpot task', sub: 'For the account owner', icon: PickIcon.hubspot(), small: PickIcon.hubspot(), phrase: 'the account owner gets a HubSpot task' }],
    },
  ],
}

export function findPick(list: PickList, id: string | null): PickItem {
  const all: PickItem[] = [list.suggested, ...list.sections.flatMap((s) => s.items)]
  return all.find((p) => p.id === id) ?? list.suggested
}

export const TIMINGS = ['Right away', 'Next day', 'In 3 days'] as const
export type Timing = (typeof TIMINGS)[number]
export const TIMING_PHRASE: Record<Timing, string> = { 'Right away': 'right away', 'Next day': 'the next day', 'In 3 days': 'three days later' }

// ── F · Answer clear yeses ──────────────────────────────────────────────────

export const GUARDRAILS = ['They ask about price', 'They name a competitor', 'Someone else is cc’d', 'It’s their second reply']
export const EXTRA_GUARDRAIL = 'They mention legal review'
