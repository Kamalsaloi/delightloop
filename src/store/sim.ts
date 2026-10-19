// The live simulation: a loop's day advances with the demo clock, and its graph turns into events
// (sends, opens, replies, postcards landing, gifts shipping, a delivery snag, the end of the loop).
import { giftById, GIFTS } from '@/data/catalog'
import type { Person } from '@/data/people'
import { FACE, GIFT } from '@/lib/assets'
import { DAY, fmtDay } from '@/lib/time'
import { flatten, GIFT_TRANSIT, locate, nodeDays, stepsOfType } from './graph'
import { graphGiftTotal } from './templates'
import type { Counts, FinishedSummary, LiveState, Loop, Note, Reply, Visit } from './types'

export const emptyCounts = (): Counts => ({
  sent: 0,
  opened: 0,
  replied: 0,
  booked: 0,
  linkedinSent: 0,
  linkedinFallback: 0,
  connected: 0,
  bumpSent: 0,
  postcards: 0,
  postcardsLanded: 0,
  giftsShipped: 0,
  delivered: 0,
  onTheWay: 0,
  snags: 0,
  visits: 0,
  held: 0,
  saved: 0,
  spent: 0,
  pipeline: 0,
})

export function startLive(loop: Loop): LiveState {
  return {
    day: 0,
    endDay: nodeDays(loop.graph, loop.startAt).end,
    counts: emptyCounts(),
    replies: [],
    visits: [],
    handled: [],
    delivery: { issue: 'none', swapUndone: false },
    fired: [],
  }
}

export const activePeople = (l: Loop) => l.audience.people.filter((p) => !l.audience.removed.includes(p.slug))
const avgGift = (l: Loop) => {
  const g = stepsOfType(l.graph, 'gift')[0]
  if (!g) return 60
  const n = g.data.picks.reduce((a, p) => a + p.people, 0) || 1
  return g.data.picks.reduce((a, p) => a + p.people * giftById(p.giftId).price, 0) / n
}

// ── Reply pool ──────────────────────────────────────────────────────────────

type ReplySeed = Pick<Reply, 'preview' | 'quote' | 'intent' | 'draft' | 'chip'> & { booksAfter?: number; gift?: string }

const MEETING = { label: 'Wants a meeting', tone: 'green' } as const
const QUESTION = { label: 'Has a question', tone: 'violet' } as const

const REPLY_SEEDS: Record<string, ReplySeed> = {
  kenji: {
    preview: 'Does it work with Salesforce? We moved off HubSpot.',
    quote: '“Does it work with Salesforce? We moved off HubSpot.”',
    intent: QUESTION,
    draft: 'Good question, Kenji. Yes, it syncs both ways with Salesforce, same as HubSpot. Here’s the two-minute guide to switching over.',
    chip: { icon: 'link', label: 'Salesforce setup guide' },
    booksAfter: 1.4,
  },
  tom: {
    preview: 'Sure, send a few times.',
    quote: '“Sure, send a few times.”',
    intent: MEETING,
    draft: 'Thanks, Tom. How about Tue 10:00, Wed 14:30 or Thu 11:00 next week? Or pick any slot that suits from my calendar.',
    chip: { icon: 'calendar', label: 'Meet Sam · 30 min' },
    booksAfter: 0.4,
  },
  daniel: {
    preview: 'Timing’s good, we’re planning Q1 outbound right now…',
    quote: '“Timing’s good, we’re planning Q1 outbound right now. Free sometime next week?”',
    intent: MEETING,
    draft: 'Great to hear, Daniel. Here’s my calendar for next week, grab whatever works and I’ll bring a few ideas for Q1.',
    chip: { icon: 'calendar', label: 'Meet Sam · 30 min' },
    booksAfter: 0.5,
  },
  ananya: {
    preview: 'Loved the postcard. Can we talk after Diwali?',
    quote: '“Loved the postcard, the team pinned it up. Can we talk the week after Diwali?”',
    intent: MEETING,
    draft: 'So glad it landed, Ananya. The week after Diwali works. Here’s my calendar, pick any 30 minutes.',
    chip: { icon: 'calendar', label: 'Meet Sam · 30 min' },
    booksAfter: 0.8,
  },
  leo: {
    preview: 'Thanks for the gift! Who should I loop in?',
    quote: '“Thanks for the gift! Our RevOps lead owns this, who should I loop in from your side?”',
    intent: QUESTION,
    draft: 'Glad it arrived, Leo. Loop me in with your RevOps lead and I’ll send over a short walkthrough for them.',
    chip: { icon: 'link', label: 'Two-minute walkthrough' },
  },
}

const GENERIC: ReplySeed[] = [
  {
    preview: 'Interesting. What would this look like for us?',
    quote: '“Interesting. What would this look like for a team our size?”',
    intent: QUESTION,
    draft: 'Happy to show you. Here’s a two-minute walkthrough for a team your size, and my calendar if a call is easier.',
    chip: { icon: 'link', label: 'Two-minute walkthrough' },
    booksAfter: 1.2,
  },
  {
    preview: 'Sure, let’s find a time next week.',
    quote: '“Sure, let’s find a time next week.”',
    intent: MEETING,
    draft: 'Great. Here’s my calendar for next week, grab whatever works.',
    chip: { icon: 'calendar', label: 'Meet Sam · 30 min' },
    booksAfter: 0.4,
  },
]

function replyFor(loop: Loop, p: Person, seed: ReplySeed, at: number, id: string): Reply {
  const first = p.name.split(' ')[0]
  const pick = stepsOfType(loop.graph, 'gift')[0]?.data.picks[0]
  const gift = giftById(seed.gift ?? pick?.giftId ?? 'olive')
  const price = Math.round(gift.price)
  return {
    id,
    slug: p.slug,
    name: p.name,
    first,
    face: p.face,
    initials: p.initials,
    role: `${p.role}, ${p.company} · replied to the intro`,
    company: p.company,
    at,
    ...seed,
    draft: seed.draft.replace(/\bTom\b|\bDaniel\b|\bKenji\b|\bAnanya\b|\bLeo\b/, first),
    stopped:
      seed.intent.tone === 'green'
        ? {
            title: `${first}’s loop stopped at this reply`,
            sub: `No more steps, and the ${gift.short} stays home. $${price} back in the budget.`,
            action: 'Send the gift anyway',
            done: `The ${gift.short} ships with the others. $${price} out of the budget.`,
          }
        : {
            title: `${first}’s loop is paused at this reply`,
            sub: 'The postcard still goes out. The gift waits until Sam answers.',
            action: 'Stop the gift',
            done: `Gift cancelled. $${price} back in the budget.`,
          },
    overridden: false,
    status: 'open',
    fresh: true,
  }
}

// ── Visit pool ──────────────────────────────────────────────────────────────

const VISIT_WHAT = [
  'Scanned the postcard, watched Sam’s video to the end, then spent 4 minutes on pricing',
  'Read the case study on the page, then forwarded it',
  'Shared the page with two people on the team',
  'Opened the page once and read the case study',
  'Scanned the postcard, left after a few seconds',
  'Played the first half of Sam’s video',
]

// ── Events ──────────────────────────────────────────────────────────────────

type Ctx = { loop: Loop; live: LiveState; notes: Note[]; now: number }
type Event = { id: string; day: number; run: (c: Ctx) => void }

function results(l: Loop) {
  return `/loops/${l.id}/results`
}

function schedule(loop: Loop): Event[] {
  const days = nodeDays(loop.graph, loop.startAt)
  const people = activePeople(loop)
  const N = people.length
  const shippable = people.filter((p) => p.address).length
  const openTotal = Math.round(N * 0.65)
  const offLinkedIn = people.filter((p) => p.notOnLinkedIn).length / Math.max(N, 1)
  const flat = flatten(loop.graph.steps)
  const firstEmail = flat.find((n) => n.kind === 'step' && n.type === 'email')
  const d0 = firstEmail ? days[firstEmail.id] : 0
  const ev: Event[] = []
  const add = (id: string, day: number, run: Event['run']) => ev.push({ id, day, run })

  for (const n of flat) {
    if (n.kind !== 'step') continue
    const d = days[n.id]
    const inOpened = (() => {
      const at = locate(loop.graph.steps, n.id)
      if (!at?.parentSplit) return null
      const split = flat.find((x) => x.id === at.parentSplit)
      return split?.kind === 'split' ? split.branches[0].id === at.seqId : null
    })()
    const branchSize = inOpened === null ? N : inOpened ? openTotal : N - openTotal

    if (n.type === 'email' && n === firstEmail) {
      add(`${n.id}:sent`, d, (c) => {
        c.live.counts.sent = N
        c.notes.push({ text: `“${n.data.title}” went out to ${N} people` })
      })
      ;[0.08, 0.25, 0.5, 0.9].forEach((f, i) =>
        add(`${n.id}:open${i}`, d + f, (c) => {
          c.live.counts.opened = Math.max(c.live.counts.opened, Math.round(openTotal * [0.4, 0.65, 0.85, 1][i]))
        }),
      )
    }
    if (n.type === 'bump') {
      add(`${n.id}:sent`, d, (c) => {
        c.live.counts.bumpSent = branchSize
        c.notes.push({ text: `Gentle bump went to ${branchSize} who didn’t open` })
      })
    }
    if (n.type === 'linkedin') {
      const fallback = Math.round(branchSize * offLinkedIn)
      const sent = branchSize - fallback
      add(`${n.id}:sent`, d, (c) => {
        c.live.counts.linkedinSent = sent
        c.live.counts.linkedinFallback = fallback
        c.notes.push({ text: `${sent} LinkedIn notes sent from Sam` })
      })
      ;[0.5, 1.5, 3].forEach((f, i) =>
        add(`${n.id}:conn${i}`, d + f, (c) => {
          c.live.counts.connected = Math.round(sent * [0.35, 0.6, 0.75][i])
        }),
      )
    }
    if (n.type === 'postcard') {
      add(`${n.id}:print`, d, (c) => {
        const held = c.live.replies.filter((r) => r.status !== 'open' || r.intent.tone === 'green').length
        c.live.counts.postcards = Math.max(0, shippable - held)
        c.live.counts.spent += c.live.counts.postcards * 6
        c.notes.push({ text: `${c.live.counts.postcards} postcards went to print` })
      })
      add(`${n.id}:land`, d + 1.5, (c) => {
        c.live.counts.postcardsLanded = c.live.counts.postcards
        c.notes.push({ text: 'Postcards are landing. Page visits will show in Results', to: results(c.loop), label: 'See visits' })
      })
      const visitors = people.filter((p) => p.address).slice(0, 6)
      ;[1.6, 2.1, 2.6, 3.2, 3.8, 4.4].forEach((f, i) => {
        const p = visitors[i]
        if (!p) return
        add(`${n.id}:visit${i}`, d + f, (c) => {
          const v: Visit = {
            id: `${n.id}-v${i}`,
            slug: p.slug,
            name: p.name,
            face: p.face,
            initials: p.initials,
            meta: `${p.company} · ${fmtDay(c.now)}`,
            what: VISIT_WHAT[i % VISIT_WHAT.length],
            status:
              i === 1
                ? { kind: 'new', initials: ['LW', 'RK'], names: ['Lena Wu, RevOps lead', 'Rahul Kapoor, SDR manager'] }
                : { kind: 'text', label: i === 0 ? 'Most engaged' : `${1 + (i % 2)} visit${i % 2 ? 's' : ''}`, tone: i === 0 ? 'green' : 'grey' },
            at: c.now,
          }
          c.live.visits = [...c.live.visits, v]
          c.live.counts.visits = c.live.visits.length * 2 + 2
          if (i === 0) c.notes.push({ text: `${p.name.split(' ')[0]} scanned the postcard and opened her page`, to: results(c.loop), label: 'Open' })
        })
      })
    }
    if (n.type === 'gift') {
      add(`${n.id}:ship`, d, (c) => {
        const held = c.live.replies.filter((r) => r.intent.tone === 'green' && !r.overridden).length
        const shipped = Math.max(0, shippable - held)
        c.live.counts.giftsShipped = shipped
        c.live.counts.held = held
        c.live.counts.saved = Math.round(held * avgGift(c.loop))
        c.live.counts.spent += Math.round(shipped * avgGift(c.loop))
        c.live.counts.onTheWay = shipped
        c.notes.push({ text: `${shipped} gifts shipped${held ? `, ${held} held for people who replied` : ''}` })
      })
      add(`${n.id}:land`, d + GIFT_TRANSIT, (c) => {
        const shipped = c.live.counts.giftsShipped
        c.live.counts.delivered = Math.max(0, shipped - 5)
        c.live.counts.onTheWay = Math.min(2, shipped)
        c.live.counts.snags = Math.min(3, shipped)
        if (shipped > 3) {
          c.live.delivery = { ...c.live.delivery, issue: 'open' }
          c.live.handled = [
            { face: FACE.f5, initials: 'KT', text: 'Kenji, courier retry booked for Monday' },
            { face: FACE.f3, initials: 'AR', text: 'Ananya, gift swapped, same price' },
            ...c.live.handled,
          ]
          c.notes.push({ text: 'One gift came back. The gift step needs you', to: `/loops/${c.loop.id}/build`, label: 'Open' })
        }
      })
      add(`${n.id}:land2`, d + GIFT_TRANSIT + 1, (c) => {
        c.live.counts.delivered += c.live.counts.onTheWay
        c.live.counts.onTheWay = 0
      })
    }
  }

  // Replies: the named people first, then whoever is on the list.
  const postcard = stepsOfType(loop.graph, 'postcard')[0]
  const gift = stepsOfType(loop.graph, 'gift')[0]
  const plan: { slug: string; day: number }[] = [
    { slug: 'kenji', day: d0 + 0.29 },
    { slug: 'tom', day: d0 + 0.94 },
    { slug: 'daniel', day: d0 + 0.97 },
    { slug: 'ananya', day: postcard ? days[postcard.id] + 1.8 : d0 + 3.6 },
    { slug: 'leo', day: gift ? days[gift.id] + GIFT_TRANSIT + 0.6 : d0 + 5 },
  ]
  const used = new Set<string>()
  plan.forEach((pl, i) => {
    let p = people.find((x) => x.slug === pl.slug && !used.has(x.slug))
    let seed = REPLY_SEEDS[pl.slug]
    if (!p) {
      p = people.find((x) => !used.has(x.slug) && x.address)
      seed = GENERIC[i % GENERIC.length]
    }
    if (!p || !firstEmail) return
    used.add(p.slug)
    const person = p
    add(`reply:${person.slug}`, pl.day, (c) => {
      const r = replyFor(c.loop, person, seed, c.now, `${c.loop.id}-${person.slug}`)
      c.live.replies = [r, ...c.live.replies]
      c.live.counts.replied += 1
      c.notes.push({ text: `${r.first} replied: ${r.quote}`, to: results(c.loop), label: 'Answer' })
    })
  })

  add('end', days.end, (c) => {
    c.loop = { ...c.loop, status: 'finished' }
    c.live.summary = summarize(c.loop, c.live)
    c.notes.push({ text: `${c.loop.name} finished with ${c.live.counts.booked} meetings`, to: results(c.loop), label: 'See what worked' })
  })
  return ev
}

/** Move a live loop forward by `dt` loop-days, applying every event that falls due. */
export function advance(loop: Loop, dt: number, now: number): { loop: Loop; notes: Note[] } {
  if (loop.status !== 'live' || !loop.live) return { loop, notes: [] }
  if (loop.kind === 'always-on') return advanceRunning(loop, dt, now)
  const live: LiveState = structuredClone(loop.live)
  live.day += dt
  const c: Ctx = { loop, live, notes: [], now }
  const due = schedule(loop)
    .filter((e) => e.day <= live.day && !live.fired.includes(e.id))
    .sort((a, b) => a.day - b.day)
  for (const e of due) {
    live.fired.push(e.id)
    e.run(c)
    if (c.loop.status === 'finished') break
  }
  // Answered replies turn into meetings.
  for (const r of live.replies) {
    if (r.status === 'sent' && r.booksAfter != null && r.sentDay != null && live.day >= r.sentDay + r.booksAfter) {
      r.status = 'booked'
      live.counts.booked += 1
      live.counts.pipeline += 43_000
      c.notes.push({ text: `${r.first} booked a meeting with Sam`, to: results(loop), label: 'See' })
    }
  }
  live.endDay = nodeDays(loop.graph, loop.startAt).end
  return { loop: { ...c.loop, live }, notes: c.notes }
}

// ── Always-on loops: a steady trickle of activity on the Home card ──────────

const RUNNING_LINES: Record<string, { face: string; text: string; meeting?: boolean }[]> = {
  stalled: [
    { face: '01M57W535GS0F94QS6P08F83BJ', text: 'Tom Becker’s deal went quiet, a candle is on its way' },
    { face: '01M57SW4WTF7R83VF4JVQ4NW8B', text: 'Daniel Moore replied to the nudge, meeting on Thu', meeting: true },
    { face: '01M57WG019MX885TVVGG07M08H', text: 'Meera Shah’s deal joined the loop after 14 quiet days' },
    { face: '01M57W535BFYQMHHV8V643AQ8N', text: 'Ethan Brooks booked a call, two days after the candle landed', meeting: true },
  ],
  vpwelcome: [
    { face: '01M57SW4WVYW10HAH7493CVDWC', text: 'Kenji Tanaka started as Head of Sales, welcome gift going out' },
    { face: '01M57W535F2ECEWJQH95YK4N7D', text: 'Sofia Marin thanked Sam for the plant, call booked', meeting: true },
    { face: '01M57SW4WTJQ14W83NJJV5G6N1', text: 'Ananya Rao joined Kestrel as VP Sales, gift going out Thu' },
  ],
}

function advanceRunning(loop: Loop, dt: number, now: number): { loop: Loop; notes: Note[] } {
  if (!loop.card || !loop.live) return { loop, notes: [] }
  const card = { ...loop.card, acc: loop.card.acc + dt }
  const live = { ...loop.live, day: loop.live.day + dt }
  const lines = RUNNING_LINES[loop.id]
  if (card.acc >= 1.3 && lines) {
    const line = lines[card.next % lines.length]
    card.acc = 0
    card.next += 1
    card.people += line.meeting ? -1 : 1
    if (line.meeting) card.meetings += 1
    else card.spent += 64
    card.activity = { face: line.face, text: line.text, at: now }
  }
  return { loop: { ...loop, card, live }, notes: [] }
}

// ── Finished ────────────────────────────────────────────────────────────────

export function summarize(loop: Loop, live: LiveState): FinishedSummary {
  const c = live.counts
  const N = activePeople(loop).length
  const start = loop.startAt
  const end = start + live.endDay * DAY
  const gift = stepsOfType(loop.graph, 'gift')[0]
  const top = gift ? giftById([...gift.data.picks].sort((a, b) => b.people - a.people)[0]?.giftId ?? 'chai') : GIFTS[2]
  const meetings = c.booked
  const worked: FinishedSummary['worked'] = []
  if (gift) worked.push({ id: 'gift', image: GIFT.g5, title: 'The gift did the heavy lifting', sub: `${Math.max(1, Math.ceil(meetings * 0.6))} of the ${meetings} meetings were booked within 3 days of a gift landing.`, stat: `${Math.max(1, Math.ceil(meetings * 0.6))} of ${meetings}` })
  if (c.linkedinSent > 0) worked.push({ id: 'linkedin', title: 'The LinkedIn note beat the bump email', sub: 'People who opened and got a note replied three times as often.', stat: '12% vs 4%' })
  worked.push({ id: 'top', image: top.img, title: `${top.name} got the most thank-yous`, sub: `${Math.max(2, live.visits.length)} people mentioned it in replies and posts. Gifty will lean on it next time.`, stat: `${Math.max(2, live.visits.length)} of ${Math.max(3, live.visits.length + 3)}` })
  const booked = new Set(live.replies.filter((r) => r.status === 'booked').map((r) => r.slug))
  const warm = live.visits
    .filter((v) => !booked.has(v.slug))
    .slice(0, 2)
    .map((v) => ({ face: v.face, initials: v.initials, name: v.name, sub: v.what.split(',')[0] }))
  return {
    meetings,
    reached: N,
    pipeline: c.pipeline,
    spent: c.spent,
    left: Math.max(0, Math.max(loop.budget.limit, graphGiftTotal(loop.graph)) - c.spent),
    held: c.held,
    days: Math.round(live.endDay),
    range: `${fmtDay(start)} to ${fmtDay(end)}`,
    worked,
    warm,
  }
}
