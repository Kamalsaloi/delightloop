// What's already in Priya's account when the demo starts.
import { FACES } from '@/data/people'
import { listById } from '@/data/catalog'
import { FACE, GIFT } from '@/lib/assets'
import { DAY } from '@/lib/time'
import { emptyCounts } from './sim'
import {
  defaultGoal,
  defaultRules,
  emailStep,
  emptyAudience,
  giftStep,
  giftyEmail,
  giftyGiftNote,
  giftyLinkedIn,
  giftyPostcard,
  linkedinStep,
  listAudience,
  postcardStep,
  waitStep,
} from './templates'
import type { Audience, LiveState, Loop, SignalAudience, Suggestion } from './types'

/** The demo starts Monday 19 Oct 2026, 18:40. */
export const START_CLOCK = new Date(2026, 9, 19, 18, 40).getTime()

function signalAudience(signal: Partial<SignalAudience>, title: string, source: string): Audience {
  return {
    ...emptyAudience(),
    kind: 'signal',
    title,
    source,
    noun: 'people',
    pillSource: source,
    signal: {
      signal: 'starts a new role',
      title: 'VP or Head of Sales',
      accounts: '212 target accounts',
      skipDeals: true,
      wait: 14,
      perWeek: 5,
      monthlyBudget: '1,500',
      noRepeat: true,
      matches: ['tom', 'ethan', 'sofia'],
      ...signal,
    },
  }
}

function runningLive(day: number, over: Partial<LiveState['counts']>): LiveState {
  return {
    day,
    endDay: 99999,
    counts: { ...emptyCounts(), ...over },
    replies: [],
    visits: [],
    handled: [],
    delivery: { issue: 'none', swapUndone: false },
    fired: [],
  }
}

export function seedLoops(now: number): Loop[] {
  const sam = 'sam'
  const stalled: Loop = {
    id: 'stalled',
    name: 'Stalled deals, nudge',
    status: 'live',
    kind: 'always-on',
    origin: 'seed',
    startAt: now - 41 * DAY,
    senderId: sam,
    image: GIFT.g5,
    audience: signalAudience({ signal: 'goes quiet for 14 days', title: 'Any open deal', accounts: 'Q4 pipeline in HubSpot', matches: ['meera', 'daniel', 'tom'] }, 'Deals that go quiet', 'Starts when a deal goes quiet for 14 days'),
    graph: {
      steps: [
        emailStep(sam, { title: 'Checking in from Sam', subject: 'Still on your list, {company}?', body: 'It’s been a couple of weeks, so I wanted to check where things landed. Happy to send a shorter version if timing changed.' }),
        waitStep(3, 0),
        giftStep(23, { title: 'A small nudge', picks: [{ giftId: 'candle', people: 23 }], note: 'Thought this might make the week a little calmer. No reply needed.' }, 0),
        linkedinStep('message', { note: 'Hope the candle arrived. Happy to pick things up whenever suits.' }, 2),
      ],
      goal: defaultGoal('meeting'),
    },
    rules: defaultRules(sam),
    budget: { total: 4210, limit: 5000, approval: 'approved', approver: 'Arjun' },
    testSent: true,
    reveal: null,
    live: runningLive(41, { sent: 64, opened: 41, replied: 19, booked: 11, giftsShipped: 52, delivered: 50, spent: 4210, pipeline: 386_000 }),
    card: {
      source: 'hubspot',
      trigger: 'Starts when a deal goes quiet for 14 days',
      people: 23,
      meetings: 11,
      spent: 4210,
      activity: { face: '01M57W535BFYQMHHV8V643AQ8N', text: 'Ethan Brooks booked a call, two days after the candle landed', at: now - 2 * 3_600_000 },
      acc: 0,
      next: 0,
    },
    updatedAt: now - 2 * DAY,
  }

  const welcome: Loop = {
    id: 'vpwelcome',
    name: 'New VP Sales, welcome',
    status: 'live',
    kind: 'always-on',
    origin: 'seed',
    startAt: now - 63 * DAY,
    senderId: sam,
    image: GIFT.g4,
    audience: signalAudience({}, 'New VP Sales at target accounts', 'Starts when a contact changes jobs'),
    graph: {
      steps: [
        giftStep(9, { title: 'Welcome gift', picks: [{ giftId: 'plant', people: 9 }], note: giftyGiftNote({ sender: sam, purpose: 'welcome' }) }, 0),
        emailStep(sam, { title: 'Welcome from Sam', ...giftyEmail({ sender: sam, purpose: 'welcome' }) }, 2),
        linkedinStep('message', { note: giftyLinkedIn({ sender: sam, purpose: 'welcome' }) }, 2),
      ],
      goal: defaultGoal('meeting'),
    },
    rules: defaultRules(sam),
    budget: { total: 1960, limit: 2500, approval: 'approved', approver: 'Arjun' },
    testSent: true,
    reveal: null,
    live: runningLive(63, { sent: 21, opened: 17, replied: 9, booked: 6, giftsShipped: 24, delivered: 23, spent: 1960, pipeline: 212_000 }),
    card: {
      source: 'linkedin',
      trigger: 'Starts when a contact changes jobs',
      people: 9,
      meetings: 6,
      spent: 1960,
      activity: { face: FACES.sofia, text: 'Sofia Marin joined Northwind as VP Sales, gift going out Thu', at: now - 3 * 3_600_000 },
      acc: 0.6,
      next: 0,
    },
    updatedAt: now - 5 * DAY,
  }

  const saasStart = new Date(2026, 8, 7, 9).getTime()
  const saasList = listById('saasboomi')!
  const saasboomi: Loop = {
    id: 'saasboomi',
    name: 'SaaSBoomi follow-up',
    status: 'finished',
    kind: 'campaign',
    origin: 'seed',
    startAt: saasStart,
    senderId: sam,
    image: GIFT.postcard,
    audience: listAudience(saasList, 'you'),
    graph: {
      steps: [
        emailStep(sam, { title: 'Thanks for stopping by', subject: 'Good to meet you at SaaSBoomi', body: 'Thanks for stopping by the booth. Here’s the two-minute version of what we showed, and my calendar if you’d like the longer one.' }),
        postcardStep(sam, 'postcard', { note: giftyPostcard({ sender: sam, purpose: 'meetings' }), design: GIFT.postcard }, 2),
        giftStep(112, { picks: [{ giftId: 'chai', people: 60 }, { giftId: 'choc', people: 52 }], note: 'Good to meet you at SaaSBoomi. A small something from all of us.' }, 3),
      ],
      goal: defaultGoal('meeting'),
    },
    rules: defaultRules(sam),
    budget: { total: 6670, limit: 7000, approval: 'approved', approver: 'Arjun' },
    testSent: true,
    reveal: null,
    live: {
      ...runningLive(12, { sent: 112, opened: 81, replied: 34, booked: 21, postcards: 98, postcardsLanded: 98, giftsShipped: 91, delivered: 89, spent: 6670, pipeline: 640_000, held: 14, saved: 812 }),
      endDay: 12,
      summary: {
        meetings: 21,
        reached: 112,
        pipeline: 640_000,
        spent: 6670,
        left: 330,
        held: 14,
        days: 12,
        range: 'Mon 7 Sep to Sat 19 Sep',
        worked: [
          { id: 'postcard', image: GIFT.postcard, title: 'The postcard did the heavy lifting', sub: '13 of the 21 meetings came within 3 days of a postcard landing.', stat: '13 of 21' },
          { id: 'chai', image: GIFT.g3, title: 'Chai got the most thank-yous', sub: '17 of 26 thank-you posts and replies were about the chai.', stat: '17 of 26' },
        ],
        warm: [
          { face: FACES.ananya, initials: 'AR', name: 'Ananya Rao', sub: 'On pricing 3 times since' },
          { face: FACES.kenji, initials: 'KT', name: 'Kenji Tanaka', sub: 'Forwarded his page to 2 people' },
        ],
      },
    },
    updatedAt: new Date(2026, 8, 19).getTime(),
  }

  const yearStart = new Date(2026, 11, 7, 9).getTime()
  const top30 = listById('top30')!
  const yctx = { sender: 'maya', purpose: 'thanks' as const }
  const yearend: Loop = {
    id: 'yearend',
    name: 'Year-end thanks · Top 30 customers',
    status: 'draft',
    kind: 'campaign',
    origin: 'gifty',
    brief: 'Thank our top 30 customers before the holidays. Gift first, no ask. A handwritten letter from their CSM, then a note about planning next year together.',
    startAt: yearStart,
    moment: { id: 'yearend', label: 'Year-end', date: new Date(2026, 11, 18).getTime() },
    senderId: 'maya',
    image: GIFT.g6,
    audience: listAudience(top30, 'gifty'),
    graph: {
      steps: [
        giftStep(30, { title: 'Year-end gift', picks: [{ giftId: 'choc', people: 12 }, { giftId: 'chai', people: 10 }, { giftId: 'candle', people: 8 }], note: giftyGiftNote(yctx) }, 0),
        postcardStep('maya', 'letter', { note: giftyPostcard(yctx) }, 3),
        emailStep('maya', { title: 'Note from Maya', ...giftyEmail(yctx) }, 4),
      ],
      goal: { ...defaultGoal('deal') },
    },
    rules: defaultRules('maya'),
    budget: { total: 1950, limit: 1500, approval: 'waiting', approver: 'Arjun' },
    testSent: false,
    reveal: null,
    updatedAt: now - DAY,
  }

  return [yearend, stalled, welcome, saasboomi]
}

export function seedSuggestions(): Suggestion[] {
  return [
    {
      id: 'diwali',
      source: 'moment',
      sourceLabel: 'Moment',
      when: '',
      title: '',
      body: '48 VP Sales at your Q4 accounts. 31 have teams in India, and 9 posted about Diwali last year.',
      faces: [FACE.f3, FACE.f4, FACE.f5],
      reach: '',
      steps: 'Intro, LinkedIn, letter, then a gift',
      brief: 'Book meetings with VP Sales at our Q4 accounts before Diwali. A warm intro from Sam, a handwritten letter, then a gift that feels personal to each of them.',
    },
    {
      id: 'roles',
      source: 'linkedin',
      sourceLabel: 'Job changes',
      when: 'This month',
      title: '14 contacts started new roles',
      body: 'All at companies on your target list. New leaders set their stack in the first 90 days.',
      faces: ['01M57W535F2ECEWJQH95YK4N7D', '01M57W535BFYQMHHV8V643AQ8N', '01M57W535GS0F94QS6P08F83BJ'],
      reach: '',
      steps: 'A welcome gift, then a note',
      brief: 'Welcome the contacts who started a new role this month with a gift, then a note from Sam on LinkedIn.',
    },
    {
      id: 'renewals',
      source: 'hubspot',
      sourceLabel: 'From call notes',
      when: 'Q1 window',
      title: '7 accounts renew a rival in Q1',
      body: 'Their Outreach contracts end Jan to Mar, going by your last call notes.',
      faces: ['01M57WG019MX885TVVGG07M08H', FACE.f5, FACE.f4],
      reach: '',
      steps: 'Email, letter, then a gift',
      brief: 'Reach the accounts renewing a rival in Q1 before they renew. An email from Sam, a letter, then a gift.',
    },
    {
      id: 'pricing',
      source: 'moment',
      sourceLabel: 'On your website',
      when: 'This week',
      title: '4 accounts keep checking pricing',
      body: 'Kestrel, Brightpath and 2 more came back 3+ times since the Diwali postcards landed. 9 people there you haven’t reached.',
      faces: [FACE.f3, FACE.f4, FACE.f5],
      reach: '',
      steps: 'A short note, then a gift',
      brief: 'Reach the people checking our pricing page with a short note from Sam, then a gift.',
      after: 'diwali',
    },
  ]
}

export const SUGGESTION_LIST: Record<string, string> = { diwali: 'q4vp', roles: 'newroles', renewals: 'rival', pricing: 'pricing' }
