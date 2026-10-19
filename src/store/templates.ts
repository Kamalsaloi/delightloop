// Step factories, Gifty's copy, and how a loop is drafted from a description, a suggestion or a recipe.
import { listById, peopleForList, teammate, LISTS, GIFTS, type CrmList } from '@/data/catalog'
import { FACE, GIFT } from '@/lib/assets'
import { DAY, nextMonday } from '@/lib/time'
import type { Entity } from './entities'
import { newSplit, uid } from './graph'
import type {
  Audience,
  BumpData,
  EmailData,
  FlowNode,
  GiftData,
  GiftPick,
  GoalData,
  Graph,
  LinkedInAction,
  LinkedInData,
  Loop,
  PostcardData,
  Rule,
  SplitKind,
  StepNode,
} from './types'

// ── Copy Gifty writes ───────────────────────────────────────────────────────

export type CopyCtx = { moment?: string; sender: string; purpose: Purpose }
export type Purpose = 'meetings' | 'thanks' | 'welcome' | 'winback' | 'renewal'

const first = (id: string) => teammate(id).first

export function giftyEmail(ctx: CopyCtx, variant = 0): Pick<EmailData, 'subject' | 'body'> {
  const v = variant % 2
  switch (ctx.purpose) {
    case 'thanks':
      return v
        ? { subject: 'One more thing before the year ends', body: 'Hope the gift made it to your desk. Before we all switch off, I’d love 20 minutes to hear what next year looks like for {company}.' }
        : { subject: 'Planning next year together', body: 'Hope the gift landed well. No ask here, just a thank-you for this year.\n\nWhen you’re back in January, could we find 20 minutes to plan what’s next for {company}?' }
    case 'welcome':
      return v
        ? { subject: 'Congrats on the move', body: 'Saw the news, congrats. The first 90 days go fast. If outbound is on the list, happy to share what worked for teams like {company}.' }
        : { subject: 'Welcome to {company}', body: 'Congrats on the new role. A small something should reach you this week.\n\nWhen you’re settled, I’d love to hear what you’re planning for the team.' }
    case 'winback':
      return v
        ? { subject: 'Worth another look?', body: 'A lot changed since we last spoke. Teams like {company} are booking twice the meetings with half the sends. Open to a quick look?' }
        : { subject: 'It’s been a while, {company}', body: 'We’ve shipped a lot since we last spoke, most of it from feedback like yours.\n\nWorth 15 minutes to see if it fits now?' }
    case 'renewal':
      return v
        ? { subject: 'Before you renew', body: 'Your contract comes up soon. Before it does, here’s how two teams like {company} doubled their meetings after switching.' }
        : { subject: 'A thought before Q1, {company}', body: 'Your renewal is coming up. Happy to show what a switch would look like, with no pressure either way.\n\nWorth 15 minutes next week?' }
    default:
      return v
        ? { subject: 'Q4 outbound at {company}', body: 'Most teams growing as fast as {company} hit the same wall with outbound in Q4. We helped Orbit and Fieldwork get past it with a short loop like this one.\n\nOpen to 15 minutes next week?' }
        : { subject: 'Quick idea for {company}’s Q4', body: 'Saw {company} is growing fast this year. Teams growing that quickly usually hit the same wall with outbound in Q4.\n\nWe helped Orbit and Fieldwork book their first meetings with a short loop like this one. Worth 15 minutes next week?' }
  }
}

export function giftyBump(variant = 0) {
  return variant % 2
    ? 'Floating this back up. If Q4 is already full, a two-line version might be easier to look at.'
    : 'Bumping this up in case it got buried. Happy to send a two-line version if that’s easier.'
}

export function giftyLinkedIn(ctx: CopyCtx, variant = 0) {
  if (ctx.purpose === 'welcome') return variant % 2 ? 'Congrats on the new role. Would love to stay in touch.' : 'Saw the move, congrats. Would love to connect.'
  return variant % 2 ? 'Saw the Q4 hiring push at your team. Would love to swap notes on outbound.' : `Sent you a note on Monday about outbound for Q4. Would love to connect.`
}

export function giftyPostcard(ctx: CopyCtx, variant = 0) {
  if (ctx.moment === 'diwali')
    return variant % 2
      ? '{first name}, a little light for the festival week. Hope Q4 is kind to you and the team.'
      : '{first name}, wishing you and the team a bright Diwali. Hope the new offices fill up fast. Coffee’s on me when I’m in town.'
  if (ctx.purpose === 'thanks') return '{first name}, thank you for this year. It meant a lot to work with you and the team.'
  return variant % 2 ? '{first name}, a quick hello from our side of the world. Coffee’s on me next time I’m in town.' : '{first name}, thanks for your time this year. Coffee’s on me next time I’m in town.'
}

export function giftyGiftNote(ctx: CopyCtx) {
  if (ctx.moment === 'diwali') return `Happy Diwali! A small something for the festival week, from all of us at DelightLoop. Hope Q4 is kind to you and the team.`
  if (ctx.purpose === 'thanks') return 'Thank you for a great year. A small something for the holidays, from all of us at DelightLoop.'
  if (ctx.purpose === 'welcome') return 'Congrats on the new role. A small something for the first week, from all of us at DelightLoop.'
  return 'A small something from all of us at DelightLoop. Hope the quarter is kind to you.'
}

// ── Step factories ──────────────────────────────────────────────────────────

const step = (n: Omit<StepNode, 'id' | 'kind'>): StepNode => ({ id: uid('s'), kind: 'step', ...n }) as StepNode

export function emailStep(sender: string, opts: Partial<EmailData> = {}, delay = 0): StepNode {
  return step({
    type: 'email',
    delay,
    data: { title: `Email from ${first(sender)}`, subject: '', body: '', from: sender, sendAt: 'theirs', days: 'weekdays', ...opts },
  })
}
export function bumpStep(opts: Partial<BumpData> = {}, delay = 0): StepNode {
  return step({ type: 'bump', delay, data: { title: 'Gentle bump', sendAs: 'thread', body: '', skipIfOpened: true, ...opts } })
}
const LI_TITLE: Record<LinkedInAction, string> = {
  connect: 'Connect on LinkedIn',
  message: 'LinkedIn message',
  view: 'View their profile',
  like: 'Like a recent post',
}
export function linkedinStep(action: LinkedInAction, opts: Partial<LinkedInData> = {}, delay = 0): StepNode {
  const noteMode = action === 'connect' || action === 'message' ? 'note' : 'none'
  return step({
    type: 'linkedin',
    delay,
    data: { title: LI_TITLE[action], action, noteMode, note: '', fallback: 'email', wait: 'After 3 days', ...opts },
  })
}
export function postcardStep(sender: string, kind: 'postcard' | 'letter' = 'postcard', opts: Partial<PostcardData> = {}, delay = 1): StepNode {
  return step({
    type: 'postcard',
    delay,
    data: { title: kind === 'letter' ? `Letter from ${first(sender)}` : 'A short letter', kind, design: null, note: '', ship: 'best', ...opts },
  })
}
export function giftStep(people: number, opts: Partial<GiftData> & { moment?: string } = {}, delay = 2): StepNode {
  const { moment, ...rest } = opts
  return step({
    type: 'gift',
    delay,
    data: { title: moment === 'diwali' ? 'Diwali gift' : 'A gift', kind: 'gift', picks: giftPicks(moment, people), swaps: {}, note: '', noteOn: true, ship: 'best', ...rest },
  })
}
export function waitStep(count = 3, delay = 0): StepNode {
  return step({ type: 'wait', delay, data: { count, unit: 'days' } })
}
export function taskStep(sender: string, delay = 1): StepNode {
  return step({ type: 'task', delay, data: { title: `Call task for ${first(sender)}`, note: '' } })
}
export function splitStep(kind: SplitKind, left: FlowNode[] = [], right: FlowNode[] = [], count = 2): FlowNode {
  const s = newSplit(kind, { count, unit: kind === 'delivered' ? 'days' : 'weekdays' })
  if (s.kind === 'split') {
    s.branches[0].steps = left
    s.branches[1].steps = right
  }
  return s
}
export const defaultGoal = (goal: GoalData['goal'] = 'meeting'): GoalData => ({ goal, slack: true, deal: true, end: 2 })

/** Gifty's picks: themed for the moment, split across the audience. */
export function giftPicks(moment: string | undefined, people: number): GiftPick[] {
  const mix: [string, number][] =
    moment === 'diwali'
      ? [
          ['diya', 14],
          ['olive', 12],
          ['chai', 13],
          ['plant', 9],
        ]
      : [
          ['chai', 3],
          ['plant', 3],
          ['olive', 2],
          ['choc', 2],
        ]
  const total = mix.reduce((a, [, n]) => a + n, 0)
  const out = mix.map(([giftId, n]) => ({ giftId, people: Math.round((n / total) * people) }))
  const diff = people - out.reduce((a, p) => a + p.people, 0)
  out[0].people += diff
  return out.filter((p) => p.people > 0)
}

// ── Rules ───────────────────────────────────────────────────────────────────

export function defaultRules(sender: string): Rule[] {
  const t = teammate(sender)
  return [
    {
      id: 'reply',
      when: 'They reply',
      glyph: 'reply',
      then: [{ label: 'Stop their loop' }, { label: `Send to ${t.first}`, face: t.face }],
      summary: `Stop, send to ${t.first}`,
      note: `Gifty sorts the reply and drafts an answer. ${t.first} approves it.`,
      addAction: true,
      on: true,
    },
    {
      id: 'book',
      when: 'They book a meeting',
      glyph: 'calendar',
      then: [{ label: 'Stop their loop' }, { label: 'Don’t ship letter or gift' }],
      summary: 'Stop, nothing ships',
      offWarning: 'People who book will still get the letter and the gift. Good for a thank-you, costly if not.',
      on: true,
    },
    { id: 'ooo', when: 'Out of office', glyph: 'clock', then: [{ label: 'Pause' }, { label: 'Resume when they’re back' }], summary: 'Pause, resume later', on: true },
    { id: 'unsub', when: 'They unsubscribe', glyph: 'ban', then: [{ label: 'Stop in every loop' }], summary: 'Stop everywhere', on: true },
  ]
}

// ── Audience ────────────────────────────────────────────────────────────────

export const emptyAudience = (): Audience => ({
  kind: 'none',
  title: '',
  source: '',
  noun: '',
  pillSource: '',
  pickedBy: 'you',
  people: [],
  removed: [],
  customers: 'open',
  leavers: 'none',
})

export function listAudience(list: CrmList, pickedBy: 'gifty' | 'you'): Audience {
  const people = peopleForList(list.id, { withLeavers: pickedBy === 'you' })
  const n = people.length
  const gifty = pickedBy === 'gifty'
  return {
    kind: 'list',
    listId: list.id,
    title: gifty ? `${n} ${list.noun}` : list.name,
    source: gifty
      ? list.id === 'q4vp'
        ? `Gifty picked ${n} of 212 people at your Q4 accounts`
        : `Gifty checked all ${n} people on ${list.name}`
      : `${n} people from your ${list.source === 'hubspot' ? 'HubSpot' : 'DelightLoop'} list. Gifty checked every name.`,
    noun: gifty ? list.noun : 'people',
    pillSource: gifty ? 'found by Gifty in HubSpot' : `from your list, ${list.name}`,
    pickedBy,
    people,
    removed: [],
    customers: 'open',
    leavers: people.some((p) => p.left) ? 'open' : 'none',
  }
}

// ── Drafting a loop ─────────────────────────────────────────────────────────

function purposeOf(text: string, list?: CrmList): Purpose {
  const t = text.toLowerCase()
  if (/thank|no ask|appreciat/.test(t) || list?.id === 'top30') return 'thanks'
  if (/welcome|new role|job change|congrat/.test(t) || list?.id === 'newroles') return 'welcome'
  if (/win back|win-back|lost|churn/.test(t) || list?.id === 'lost') return 'winback'
  if (/renew|rival|competitor/.test(t) || list?.id === 'rival' || list?.id === 'renewals') return 'renewal'
  return 'meetings'
}

const PURPOSE_NAME: Record<Purpose, string> = {
  meetings: 'Meetings',
  thanks: 'Thank-you',
  welcome: 'Welcome',
  winback: 'Win-back',
  renewal: 'Before renewal',
}

const LOOP_IMAGES = [GIFT.g5, GIFT.g3, GIFT.g4, GIFT.g2, GIFT.g1, GIFT.g6]

type DraftInput = { text: string; entities: Entity[]; now: number; origin?: 'gifty' }

/** Turn a description plus what Gifty linked into a full loop: audience, steps, copy, rules, budget. */
export function draftLoop({ text, entities, now }: DraftInput): Loop {
  const listE = entities.find((e) => e.kind === 'list')
  const list = listE?.kind === 'list' ? listE.list : LISTS[0]
  const senderE = entities.find((e) => e.kind === 'sender')
  const sender = senderE?.kind === 'sender' ? senderE.teammate.id : 'sam'
  const momentE = entities.find((e) => e.kind === 'moment')
  const moment = momentE?.kind === 'moment' ? momentE.moment : undefined
  const budgetE = entities.find((e) => e.kind === 'budget')
  const purpose = purposeOf(text, list)
  const ctx: CopyCtx = { moment: moment?.id, sender, purpose }
  const t = text.toLowerCase()

  const audience = listAudience(list, 'gifty')
  const n = audience.people.length
  const wantsGift = /gift|present|send something/.test(t) || !!moment || purpose === 'thanks' || purpose === 'welcome'
  const wantsLetter = /letter|postcard|card|handwritten|note in the post/.test(t) || !!moment
  const wantsLinkedIn = !/no linkedin|without linkedin/.test(t)
  const s = teammate(sender)

  const intro = emailStep(sender, { title: `Intro from ${s.first}`, ...giftyEmail(ctx) })
  const giftCopy = { note: giftyGiftNote(ctx), moment: moment?.id }
  let steps: FlowNode[]
  let goal = defaultGoal('meeting')
  if (purpose === 'thanks') {
    steps = [
      giftStep(n, giftCopy, 0),
      postcardStep(sender, 'letter', { note: giftyPostcard(ctx), design: null }, 3),
      emailStep(sender, { title: `Note from ${s.first}`, ...giftyEmail(ctx) }, 4),
    ]
    goal = defaultGoal('reply')
  } else if (purpose === 'welcome') {
    steps = [giftStep(n, giftCopy, 0), emailStep(sender, { title: `Welcome from ${s.first}`, ...giftyEmail(ctx) }, 2)]
    if (wantsLinkedIn) steps.push(linkedinStep('message', { note: giftyLinkedIn(ctx) }, 2))
  } else {
    const opened = wantsLinkedIn ? [linkedinStep('connect', { note: giftyLinkedIn(ctx) })] : [emailStep(sender, { title: 'Follow-up', ...giftyEmail(ctx, 1) })]
    steps = [intro, splitStep('opened', opened, [bumpStep({ body: giftyBump() })])]
    if (wantsLetter) steps.push(postcardStep(sender, 'postcard', { note: giftyPostcard(ctx), design: GIFT.postcard }, 1))
    if (wantsGift) steps.push(giftStep(n, giftCopy, wantsLetter ? 2 : 3))
  }

  const graph: Graph = { steps, goal }
  const name = moment ? `${moment.label} · ${list.short}` : `${PURPOSE_NAME[purpose]} · ${list.short}`
  const total = graphGiftTotal(graph)
  const limit = budgetE?.kind === 'budget' ? budgetE.amount : 2500
  return {
    id: uid('loop'),
    name,
    status: 'draft',
    kind: 'campaign',
    origin: 'gifty',
    brief: text,
    startAt: nextMonday(now),
    moment: moment ? { id: moment.id, label: moment.label, date: moment.date.getTime() } : undefined,
    senderId: sender,
    image: LOOP_IMAGES[(list.people + name.length) % LOOP_IMAGES.length],
    audience,
    graph,
    rules: defaultRules(sender),
    budget: { total, limit, approval: total > limit ? 'waiting' : 'none', approver: 'Arjun' },
    testSent: false,
    reveal: 0,
    updatedAt: now,
  }
}

export function graphGiftTotal(g: Graph): number {
  let total = 0
  const walk = (steps: FlowNode[]) => {
    for (const n of steps) {
      if (n.kind === 'split') n.branches.forEach((b) => walk(b.steps))
      else if (n.type === 'gift') total += n.data.picks.reduce((a, p) => a + p.people * (GIFTS.find((x) => x.id === p.giftId)?.price ?? 60), 0)
    }
  }
  walk(g.steps)
  return total
}

// ── Recipes (steps only, copy left for the user) ────────────────────────────

export type Recipe = { id: string; name: string; meta: string }
export const RECIPES: Recipe[] = [
  { id: 'warm', name: 'Warm intro, then a gift', meta: '5 steps · 12 days' },
  { id: 'stalled', name: 'Restart a stalled deal', meta: '3 steps · 7 days' },
  { id: 'event', name: 'After an event', meta: '4 steps · 10 days' },
]

export function recipeLoop(recipeId: string, now: number): Loop {
  const r = RECIPES.find((x) => x.id === recipeId) ?? RECIPES[0]
  const sender = 'sam'
  let steps: FlowNode[]
  if (r.id === 'stalled') steps = [linkedinStep('message', {}, 0), emailStep(sender, { title: 'Email from Sam' }, 2), giftStep(0, {}, 3)]
  else if (r.id === 'event') steps = [emailStep(sender, { title: 'Thanks for stopping by' }), postcardStep(sender, 'postcard', {}, 2), giftStep(0, {}, 3), linkedinStep('connect', {}, 3)]
  else steps = [emailStep(sender, { title: 'Intro from Sam' }), splitStep('opened', [linkedinStep('connect')], [bumpStep()]), giftStep(0, {}, 3)]
  return blankLoop(now, { name: r.name, origin: 'recipe', graph: { steps, goal: defaultGoal() } })
}

export function blankLoop(now: number, over: Partial<Loop> = {}): Loop {
  return {
    id: uid('loop'),
    name: 'Untitled loop',
    status: 'draft',
    kind: 'campaign',
    origin: 'blank',
    startAt: nextMonday(now),
    senderId: 'sam',
    image: GIFT.g6,
    audience: emptyAudience(),
    graph: { steps: [], goal: null },
    rules: defaultRules('sam'),
    budget: { total: 0, limit: 2500, approval: 'none', approver: 'Arjun' },
    testSent: false,
    reveal: null,
    updatedAt: now,
    ...over,
  }
}

/** Gift picks follow the audience size once a list is chosen. */
export function fitGiftsToAudience(g: Graph, people: number, moment?: string): Graph {
  const walk = (steps: FlowNode[]): FlowNode[] =>
    steps.map((n) => {
      if (n.kind === 'split') return { ...n, branches: n.branches.map((b) => ({ ...b, steps: walk(b.steps) })) as typeof n.branches }
      if (n.type === 'gift') return { ...n, data: { ...n.data, picks: giftPicks(moment, people) } }
      return n
    })
  return { ...g, steps: walk(g.steps) }
}

export const listForLoop = (l: Loop) => listById(l.audience.listId)
export const DAY_START = (l: Loop, day: number) => l.startAt + day * DAY
export const SAM_FACE = FACE.sam

/** What Gifty needs to write copy for this loop. */
export function copyCtx(loop: Loop): CopyCtx {
  return { moment: loop.moment?.id, sender: loop.senderId, purpose: purposeOf(`${loop.brief ?? ''} ${loop.name}`, listById(loop.audience.listId)) }
}
