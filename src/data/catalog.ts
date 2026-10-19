// Things that already exist in the account: CRM lists, teammates, the gift gallery, signals.
// People for a list are generated deterministically from the named ones in people.ts.
import { FACE, GIFT } from '@/lib/assets'
import { FACES, PEOPLE, type Person } from './people'

// ── Teammates ───────────────────────────────────────────────────────────────

export type Teammate = { id: string; name: string; first: string; role: string; face?: string; initials: string }

export const TEAMMATES: Teammate[] = [
  { id: 'sam', name: 'Sam Rivera', first: 'Sam', role: 'Founder', face: FACE.sam, initials: 'SR' },
  { id: 'priya', name: 'Priya Nair', first: 'Priya', role: 'Head of Growth', face: FACE.priya, initials: 'PN' },
  { id: 'rahul', name: 'Rahul Menon', first: 'Rahul', role: 'Account Executive', initials: 'RM' },
  { id: 'maya', name: 'Maya Chen', first: 'Maya', role: 'Customer Success', initials: 'MC' },
]
export const teammate = (id: string) => TEAMMATES.find((t) => t.id === id) ?? TEAMMATES[0]

// ── Gift gallery ────────────────────────────────────────────────────────────

export type Gift = { id: string; name: string; short: string; img: string; price: number; why: string; copy: string }

export const GIFTS: Gift[] = [
  { id: 'diya', name: 'Brass diya set', short: 'diya set', img: GIFT.g1, price: 68, why: 'Based in India', copy: 'Hand-cast brass diyas from Moradabad, with a box of wicks.' },
  { id: 'olive', name: 'Olive oil set', short: 'olive oil set', img: GIFT.g2, price: 80, why: 'Posts about food and travel', copy: 'Two cold-pressed bottles from a grove in Puglia.' },
  { id: 'chai', name: 'Single-origin chai', short: 'chai', img: GIFT.g3, price: 62, why: 'Tea shows up in their posts', copy: 'Loose-leaf from one Darjeeling estate, with a brass strainer.' },
  { id: 'plant', name: 'Desk plant', short: 'desk plant', img: GIFT.g4, price: 84, why: 'Works from home', copy: 'A small pothos in a glazed pot, easy to keep alive on a desk.' },
  { id: 'candle', name: 'Soy candle', short: 'soy candle', img: GIFT.g5, price: 54, why: 'Calm, any desk', copy: 'Hand-poured soy wax, cedar and cardamom.' },
  { id: 'choc', name: 'Dark chocolates', short: 'dark chocolates', img: GIFT.g6, price: 46, why: 'Easy to share', copy: 'Twelve single-origin squares, made in small batches.' },
]
export const giftById = (id: string) => GIFTS.find((g) => g.id === id) ?? GIFTS[0]

// ── CRM lists ───────────────────────────────────────────────────────────────

export type CrmList = {
  id: string
  name: string
  source: 'hubspot' | 'saved'
  people: number
  accounts: number
  meta: string
  /** Noun for the canvas pill, e.g. "VP Sales". */
  noun: string
  faces: string[]
  /** Words that make Gifty link this list from a description. */
  keywords: string[]
  /** Short form used in loop names, e.g. "VP Sales Q4". */
  short: string
  /** Segments Gifty spotted are linkable but not shown in the list picker. */
  spotted?: boolean
}

export const LISTS: CrmList[] = [
  {
    id: 'q4vp',
    short: 'VP Sales Q4',
    name: 'Q4 VP Sales',
    source: 'hubspot',
    people: 48,
    accounts: 36,
    meta: '48 people at 36 accounts · updated today',
    noun: 'VP Sales',
    faces: [FACES.ananya, FACES.daniel, FACES.kenji],
    keywords: ['vp sales', 'vps of sales', 'heads of sales', 'head of sales', 'sales leaders', 'vp', 'q4'],
  },
  {
    id: 'q4all',
    short: 'Q4 accounts',
    name: 'Q4 target accounts, everyone',
    source: 'hubspot',
    people: 212,
    accounts: 36,
    meta: '212 people at 36 accounts · updated today',
    noun: 'people',
    faces: [FACES.ethan, FACES.sofia, FACES.tom],
    keywords: ['target accounts', 'everyone at', 'accounts'],
  },
  {
    id: 'lost',
    short: 'Lost accounts',
    name: 'Accounts lost in 2025',
    source: 'hubspot',
    people: 88,
    accounts: 29,
    meta: '88 people at 29 accounts · last week',
    noun: 'people',
    faces: [FACES.meera, FACE.sam, FACES.daniel],
    keywords: ['lost', 'churned', 'win back', 'win-back'],
  },
  {
    id: 'renewals',
    short: 'Q4 renewals',
    name: 'Q4 renewals',
    source: 'hubspot',
    people: 54,
    accounts: 18,
    meta: '54 people at 18 accounts · 2 days ago',
    noun: 'people',
    faces: [FACES.kenji, FACES.sofia, FACES.ananya],
    keywords: ['renewal', 'renewals', 'renew'],
  },
  {
    id: 'top30',
    short: 'Top 30 customers',
    name: 'Top 30 customers',
    source: 'hubspot',
    people: 30,
    accounts: 30,
    meta: '30 people at 30 accounts · updated today',
    noun: 'customers',
    faces: [FACES.sofia, FACES.kenji, FACES.meera],
    keywords: ['customers', 'customer', 'top 30', 'thank'],
  },
  {
    id: 'webinar',
    short: 'Webinar sign-ups',
    name: 'Q4 webinar sign-ups',
    source: 'hubspot',
    people: 64,
    accounts: 51,
    meta: '64 people · signed up last week',
    noun: 'sign-ups',
    faces: [FACES.tom, FACES.ethan, FACES.ananya],
    keywords: ['webinar', 'sign-ups', 'signups'],
  },
  {
    id: 'saasboomi',
    short: 'SaaSBoomi follow-up',
    name: 'SaaSBoomi booth visitors',
    source: 'saved',
    people: 112,
    accounts: 0,
    meta: '112 people · used in 1 loop, 21 meetings',
    noun: 'visitors',
    faces: [FACE.priya, FACES.tom, FACES.ethan],
    keywords: ['saasboomi', 'booth', 'event', 'conference'],
  },
  {
    id: 'newroles',
    short: 'New roles',
    name: 'Started a new role this month',
    source: 'hubspot',
    people: 14,
    accounts: 14,
    meta: '14 people · job changes from LinkedIn',
    noun: 'new leaders',
    faces: [FACES.sofia, FACES.ethan, FACES.tom],
    keywords: ['new role', 'new roles', 'job change', 'job changes', 'started new', 'welcome'],
    spotted: true,
  },
  {
    id: 'rival',
    short: 'Rival renewals',
    name: 'Renewing a rival in Q1',
    source: 'hubspot',
    people: 19,
    accounts: 7,
    meta: '19 people at 7 accounts · from call notes',
    noun: 'people',
    faces: [FACES.meera, FACES.kenji, FACES.daniel],
    keywords: ['rival', 'competitor', 'outreach contracts', 'switch'],
    spotted: true,
  },
  {
    id: 'pricing',
    short: 'Pricing visitors',
    name: 'Checking your pricing page',
    source: 'saved',
    people: 9,
    accounts: 4,
    meta: '9 people at 4 accounts · from DelightSense',
    noun: 'people',
    faces: [FACES.ananya, FACES.daniel, FACES.kenji],
    keywords: ['pricing', 'pricing page'],
    spotted: true,
  },
]
export const listById = (id: string | undefined) => LISTS.find((l) => l.id === id)

// ── Budgets ─────────────────────────────────────────────────────────────────

export const BUDGETS = [{ id: 'q4-gifting', name: 'Q4 gifting', meta: '$7,160 left of $20,000 · approved by Arjun', left: 7160 }]

// ── People generator ────────────────────────────────────────────────────────

const FIRST = ['Nina', 'Raj', 'Hana', 'Marco', 'Aisha', 'Ben', 'Chloe', 'Dev', 'Elena', 'Farah', 'Gabe', 'Ivy', 'Jonas', 'Kavya', 'Liam', 'Mira', 'Noah', 'Olu', 'Pia', 'Quinn', 'Rhea', 'Sven', 'Tara', 'Uma', 'Vik', 'Wren', 'Yara', 'Zane', 'Arjun', 'Bea', 'Cal', 'Dana', 'Eli', 'Fern', 'Gus', 'Hugo', 'Isla', 'Jai']
const LAST = ['Alvarez', 'Patel', 'Kim', 'Rossi', 'Khan', 'Okafor', 'Dubois', 'Shah', 'Novak', 'Haddad', 'Silva', 'Chen', 'Berg', 'Reddy', 'Walsh', 'Iyer', 'Mendes', 'Adeyemi', 'Lund', 'Park', 'Kapoor', 'Moreau', 'Sato', 'Varga', 'Bose', 'Hart', 'Costa', 'Weiss', 'Mehta', 'Rao', 'Quinn', 'Fox', 'Lopez', 'Abe', 'Ng', 'Ruiz', 'Doyle', 'Das']
const COMPANIES = ['Corvid', 'Sundial', 'Pebble', 'Tidewater', 'Quillpay', 'Lumen HR', 'Arcadia', 'Pillar', 'Orbit', 'Fjord Pay', 'Halcyon', 'Mosaic', 'Kitebird', 'Marlow', 'Vantage', 'Cobalt', 'Juniper', 'Nimbus', 'Basalt', 'Driftwood', 'Ember', 'Gallop', 'Harbor', 'Ironleaf', 'Jetty', 'Keel', 'Lattice', 'Meridian', 'Northstar', 'Opal', 'Prism', 'Quarry', 'Ridge', 'Saffron']
const ROLES = ['VP Sales', 'Head of Sales', 'CRO', 'VP Sales', 'Sales Director']
const CITIES: [string, string][] = [
  ['Office, Bengaluru', 'In 4 days a week'],
  ['Home, Mumbai', 'Remote 2 days a week'],
  ['Office, London', 'In 3 days a week'],
  ['Home, Austin', 'Fully remote'],
  ['Office, Singapore', 'From a past delivery'],
  ['Office, Pune', 'In 5 days a week'],
  ['Home, Toronto', 'Remote 3 days a week'],
  ['Office, Dubai', 'In 4 days a week'],
]
const HEADLINES: [string, 'linkedin' | 'x', string][] = [
  ['Hiring 3 AEs this quarter', 'linkedin', 'Posted the job last week'],
  ['Rebuilding the forecast', 'linkedin', 'Wrote about pipeline reviews'],
  ['New to the role', 'linkedin', 'Joined in the summer'],
  ['Opening an office abroad', 'x', 'Shares travel photos on X'],
  ['Moving off spreadsheets', 'linkedin', 'Asked for CRM tips'],
]

function generated(i: number, opts: { noAddress?: boolean; notOnLinkedIn?: boolean; left?: boolean }): Person {
  const first = FIRST[i % FIRST.length]
  const last = LAST[(i * 7 + 3) % LAST.length]
  const company = COMPANIES[i % COMPANIES.length]
  const [line, note] = CITIES[i % CITIES.length]
  const [headline, source, detail] = HEADLINES[i % HEADLINES.length]
  return {
    slug: `${first}-${last}-${i}`.toLowerCase(),
    name: `${first} ${last}`,
    role: ROLES[i % ROLES.length],
    company,
    initials: `${first[0]}${last[0]}`,
    ...(opts.noAddress ? { noAddress: true, addressHint: { note: 'Fully remote, and no home address anywhere public.', remote: true } } : { address: { line, note } }),
    notOnLinkedIn: opts.notOnLinkedIn,
    left: opts.left,
    knows: { headline, source: opts.notOnLinkedIn ? 'x' : source, detail },
  }
}

/**
 * The people on a list. Q4 VP Sales is the hand-written ten plus generated ones, so the counts
 * match the account: 7 without an address, 6 not on LinkedIn, 2 customers, 3 who left (blank path only).
 */
export function peopleForList(listId: string, opts: { withLeavers?: boolean } = {}): Person[] {
  const list = listById(listId) ?? LISTS[0]
  if (list.id === 'q4vp') {
    const out: Person[] = [...PEOPLE.map((p) => ({ ...p }))]
    let i = 0
    // 4 more without an address, all fully remote (the sheet's "4 more").
    while (out.filter((p) => p.noAddress).length < 7) out.push(generated(i++, { noAddress: true }))
    while (out.filter((p) => p.notOnLinkedIn).length < 6) out.push(generated(i++, { notOnLinkedIn: true }))
    let leavers = 0
    while (out.length < list.people) {
      const left = !!opts.withLeavers && leavers < 3 && i % 5 === 2
      if (left) leavers++
      out.push(generated(i++, { left }))
    }
    return out
  }
  const out: Person[] = []
  const missing = list.id === 'top30' ? 8 : Math.round(list.people * 0.15)
  for (let i = 0; i < list.people; i++) {
    const p = generated(i + 40, { noAddress: i < missing, notOnLinkedIn: i % 9 === 4, left: !!opts.withLeavers && i % 31 === 7 })
    // Give the first few real faces so lists don't read as all initials.
    const faces = list.faces
    if (i >= missing && i - missing < faces.length) p.face = faces[i - missing]
    out.push(p)
  }
  if (list.id === 'top30') return out.map((p) => ({ ...p, customer: false }))
  return out
}

// ── Signals (always-on audiences) ───────────────────────────────────────────

export const SIGNALS = ['starts a new role', 'posts about a topic', 'visits your pricing page', 'goes quiet for 14 days']
export const SIGNAL_TITLES = ['VP or Head of Sales', 'CRO', 'Sales leader, any level']
export const SIGNAL_ACCOUNTS = ['212 target accounts', 'Q4 renewals', 'Accounts lost in 2025']

// ── Moments ─────────────────────────────────────────────────────────────────

export type Moment = { id: string; label: string; date: Date; keywords: string[] }

export const MOMENTS: Moment[] = [
  { id: 'diwali', label: 'Diwali', date: new Date(2026, 10, 8), keywords: ['diwali', 'deepavali', 'festival of lights'] },
  { id: 'yearend', label: 'Year-end', date: new Date(2026, 11, 18), keywords: ['year-end', 'year end', 'holidays', 'holiday', 'christmas', 'end of year'] },
  { id: 'thanksgiving', label: 'Thanksgiving', date: new Date(2026, 10, 26), keywords: ['thanksgiving'] },
  { id: 'newyear', label: 'New year', date: new Date(2027, 0, 1), keywords: ['new year', 'q1 kickoff', 'january'] },
]
