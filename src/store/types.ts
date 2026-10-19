import type { Person } from '@/data/people'

export type { Person }

// ── Loops ───────────────────────────────────────────────────────────────────

export type LoopStatus = 'draft' | 'live' | 'paused' | 'finished'
/** How the loop was started: Gifty drafted it, a recipe, blank canvas, or seed data. */
export type Origin = 'gifty' | 'recipe' | 'blank' | 'seed'
/** Campaign loops run once over a list; always-on loops pick people up from a signal. */
export type LoopKind = 'campaign' | 'always-on'

export type Loop = {
  id: string
  name: string
  status: LoopStatus
  kind: LoopKind
  origin: Origin
  /** Description the user typed (Gifty-drafted loops). */
  brief?: string
  /** Day 0, ms since epoch (local time). */
  startAt: number
  /** Moment the loop is built around, e.g. Diwali. */
  moment?: { id: string; label: string; date: number }
  senderId: string
  image: string
  audience: Audience
  graph: Graph
  rules: Rule[]
  budget: Budget
  testSent: boolean
  /** Drafting animation: how many graph nodes are revealed so far (null = all). */
  reveal: number | null
  /** Snapshot of the graph when the loop was paused (for the review of changes). */
  pausedGraph?: Graph
  pausedAt?: number
  live?: LiveState
  /** Always-on loops: the Home card stats. */
  card?: RunningCard
  updatedAt: number
}

export type Budget = { total: number; limit: number; approval: 'none' | 'waiting' | 'asked' | 'approved'; approver: string }

export type RunningCard = {
  source: 'hubspot' | 'linkedin'
  trigger: string
  people: number
  meetings: number
  spent: number
  activity: { face: string; text: string; at: number }
  /** Loop-days since the last activity line, and which line is next. */
  acc: number
  next: number
}

// ── Audience ────────────────────────────────────────────────────────────────

export type CheckState = 'open' | 'removed' | 'kept'

export type Audience = {
  kind: 'none' | 'list' | 'signal'
  listId?: string
  /** Page title, e.g. "48 VP Sales". */
  title: string
  /** Line under the title. */
  source: string
  /** Canvas pill: "48 VP Sales" + "found by Gifty in HubSpot". */
  noun: string
  pillSource: string
  pickedBy: 'gifty' | 'you'
  people: Person[]
  removed: string[]
  customers: CheckState
  leavers: CheckState | 'none'
  signal?: SignalAudience
}

export type SignalAudience = {
  signal: string
  title: string
  accounts: string
  skipDeals: boolean
  wait: 7 | 14 | 30
  perWeek: number
  monthlyBudget: string
  noRepeat: boolean
  matches: string[]
}

// ── Graph ───────────────────────────────────────────────────────────────────

export type StepType = 'email' | 'bump' | 'linkedin' | 'postcard' | 'gift' | 'wait' | 'task'

export type EmailData = {
  title: string
  subject: string
  body: string
  from: string
  sendAt: 'theirs' | 'ist'
  days: 'weekdays' | 'any'
}
export type BumpData = { title: string; sendAs: 'thread' | 'new'; body: string; skipIfOpened: boolean }
export type LinkedInAction = 'connect' | 'message' | 'view' | 'like'
export type LinkedInData = {
  title: string
  action: LinkedInAction
  noteMode: 'note' | 'none'
  note: string
  fallback: 'email' | 'skip'
  wait: string
}
/** `design`: a Paper asset id or an uploaded data URL; null = plain cream card. */
export type PostcardData = { title: string; kind: 'postcard' | 'letter'; design: string | null; note: string; ship: Ship }
export type Ship = 'best' | 'home' | 'office'
export type GiftPick = { giftId: string; people: number }
export type GiftData = {
  title: string
  kind: 'gift' | 'giftcard'
  picks: GiftPick[]
  /** Per-person overrides: slug → gift id. */
  swaps: Record<string, string>
  note: string
  noteOn: boolean
  ship: Ship
}
export type WaitUnit = 'hours' | 'days' | 'weekdays'
export type WaitData = { count: number; unit: WaitUnit }
export type TaskData = { title: string; note: string }
export type SplitKind = 'opened' | 'twice' | 'clicked' | 'linkedin' | 'delivered'
export type CheckData = WaitData & { days: string[]; window: string; split: SplitKind }
export type GoalData = { goal: 'meeting' | 'reply' | 'deal'; slack: boolean; deal: boolean; end: number }

type StepBase = { id: string; kind: 'step'; delay: number }
export type StepNode = StepBase &
  (
    | { type: 'email'; data: EmailData }
    | { type: 'bump'; data: BumpData }
    | { type: 'linkedin'; data: LinkedInData }
    | { type: 'postcard'; data: PostcardData }
    | { type: 'gift'; data: GiftData }
    | { type: 'wait'; data: WaitData }
    | { type: 'task'; data: TaskData }
  )

export type Branch = { id: string; steps: FlowNode[] }
export type SplitNode = { id: string; kind: 'split'; delay: number; data: CheckData; branches: [Branch, Branch] }
export type FlowNode = StepNode | SplitNode
export type Graph = { steps: FlowNode[]; goal: GoalData | null }

/** Where a new step goes: sequence id ('root' or a branch id) and index in it. */
export type Slot = { seqId: string; index: number }

// ── Rules ───────────────────────────────────────────────────────────────────

export type RuleGlyph = 'reply' | 'calendar' | 'clock' | 'ban' | 'custom'
export type Rule = {
  id: string
  when: string
  glyph: RuleGlyph
  then: { label: string; face?: string }[]
  summary: string
  note?: string
  addAction?: boolean
  offWarning?: string
  on: boolean
  /** "Only stop the emails" on the meeting rule. */
  emailsOnly?: boolean
}

// ── Live simulation ─────────────────────────────────────────────────────────

export type ReplyStatus = 'open' | 'sent' | 'booked'
export type Reply = {
  id: string
  slug: string
  name: string
  first: string
  face?: string
  initials: string
  role: string
  company: string
  at: number
  preview: string
  quote: string
  intent: { label: string; tone: 'green' | 'violet' }
  draft: string
  chip: { icon: 'calendar' | 'link'; label: string }
  stopped: { title: string; sub: string; action: string; done: string }
  overridden: boolean
  status: ReplyStatus
  /** Arrived since the user last looked at Results. */
  fresh: boolean
  /** Will turn into a booked meeting this many loop-days after Sam answers. */
  booksAfter?: number
  /** Loop day Sam answered. */
  sentDay?: number
}

export type Visit = {
  id: string
  slug: string
  name: string
  face?: string
  initials: string
  meta: string
  what: string
  status: { kind: 'new'; initials: string[]; names: string[] } | { kind: 'text'; label: string; tone: 'green' | 'grey' }
  at: number
}

export type Fix = 'office' | 'digital' | 'cancel'

export type Counts = {
  sent: number
  opened: number
  replied: number
  booked: number
  linkedinSent: number
  linkedinFallback: number
  connected: number
  bumpSent: number
  postcards: number
  postcardsLanded: number
  giftsShipped: number
  delivered: number
  onTheWay: number
  snags: number
  visits: number
  held: number
  saved: number
  spent: number
  pipeline: number
}

export type LiveState = {
  /** Fractional loop days since Day 0. */
  day: number
  endDay: number
  counts: Counts
  replies: Reply[]
  visits: Visit[]
  handled: { face?: string; initials: string; text: string }[]
  delivery: { issue: 'none' | 'open' | Fix; swapUndone: boolean }
  /** Event ids already applied. */
  fired: string[]
  summary?: FinishedSummary
}

export type FinishedSummary = {
  meetings: number
  reached: number
  pipeline: number
  spent: number
  left: number
  held: number
  days: number
  range: string
  worked: { id: string; image?: string; title: string; sub: string; stat: string }[]
  warm: { face?: string; initials: string; name: string; sub: string }[]
}

// ── App ─────────────────────────────────────────────────────────────────────

export type Suggestion = {
  id: string
  source: 'moment' | 'linkedin' | 'hubspot'
  sourceLabel: string
  when: string
  title: string
  body: string
  faces: string[]
  reach: string
  steps: string
  /** Description Gifty drafts the loop from. */
  brief: string
  usedBy?: string
  /** Only shown once this loop is live. */
  after?: string
}

export type Toast = { id: number; text: string; action?: { label: string; run?: () => void; to?: string } }
/** Something worth telling the user, produced by the simulation. */
export type Note = { text: string; to?: string; label?: string }

export type Integrations = { linkedin: 'missing' | 'asked' | 'connected' }
