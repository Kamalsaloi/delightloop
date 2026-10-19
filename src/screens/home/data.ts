import { FACE, GIFT } from '@/lib/assets'

export type Source = 'moment' | 'linkedin' | 'hubspot'

export type Suggestion = {
  id: string
  source: Source
  sourceLabel: string
  when: string
  title: string
  body: string
  faces: string[]
  reach: string
  steps: string
}

const F = {
  w1: '01M57W535F2ECEWJQH95YK4N7D',
  w2: '01M57W535BFYQMHHV8V643AQ8N',
  w3: '01M57W535GS0F94QS6P08F83BJ',
  w4: '01M57WG019MX885TVVGG07M08H',
}

const NEW_ROLES: Suggestion = {
  id: 'roles',
  source: 'linkedin',
  sourceLabel: 'Job changes',
  when: 'This month',
  title: '14 contacts started new roles',
  body: 'All at companies on your target list. New leaders set their stack in the first 90 days.',
  faces: [F.w1, F.w2, F.w3],
  reach: '14 people · 12 addresses found',
  steps: 'A welcome gift, then a note',
}

const RENEWALS: Suggestion = {
  id: 'renewals',
  source: 'hubspot',
  sourceLabel: 'From call notes',
  when: 'Q1 window',
  title: '7 accounts renew a rival in Q1',
  body: 'Their Outreach contracts end Jan to Mar, going by your last call notes.',
  faces: [F.w4, FACE.f5, FACE.f4],
  reach: '19 people at 7 accounts',
  steps: 'Email, letter, then a gift',
}

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 'diwali',
    source: 'moment',
    sourceLabel: 'Moment',
    when: 'Start by Mon 26 Oct',
    title: 'Diwali is 3 weeks out',
    body: '48 VP Sales at your Q4 accounts. 31 have teams in India, and 9 posted about Diwali last year.',
    faces: [FACE.f3, FACE.f4, FACE.f5],
    reach: '48 people · 41 addresses found',
    steps: 'Intro, LinkedIn, letter, then a gift',
  },
  NEW_ROLES,
  RENEWALS,
]

// After the Diwali loop launched (state=live), Gifty spots something new.
export const SUGGESTIONS_LIVE: Suggestion[] = [
  {
    id: 'pricing',
    source: 'moment',
    sourceLabel: 'On your website',
    when: 'This week',
    title: '4 accounts keep checking pricing',
    body: 'Kestrel, Brightpath and 2 more came back 3+ times since the Diwali postcards landed. 9 people there you haven’t reached.',
    faces: [FACE.f3, FACE.f4, FACE.f5],
    reach: '9 people · 8 addresses found',
    steps: 'A short note, then a gift',
  },
  NEW_ROLES,
  RENEWALS,
]

export type RunningLoop = {
  id: string
  name: string
  image: string
  source: 'hubspot' | 'linkedin'
  trigger: string
  people: string
  meetings: string
  spent: string
  activityFace: string
  activity: string
  activityWhen: string
}

export const RUNNING: RunningLoop[] = [
  {
    id: 'stalled',
    name: 'Stalled deals, nudge',
    image: GIFT.g5,
    source: 'hubspot',
    trigger: 'Starts when a deal goes quiet for 14 days',
    people: '23',
    meetings: '11',
    spent: '$4,210',
    activityFace: F.w2,
    activity: 'Ethan Brooks booked a call, two days after the candle landed',
    activityWhen: '2h ago',
  },
  {
    id: 'vp-welcome',
    name: 'New VP Sales, welcome',
    image: GIFT.g4,
    source: 'linkedin',
    trigger: 'Starts when a contact changes jobs',
    people: '9',
    meetings: '6',
    spent: '$1,960',
    activityFace: F.w1,
    activity: 'Sofia Marin joined Northwind as VP Sales, gift going out Thu',
    activityWhen: 'today',
  },
]

export type PickerItem = { id: string; name: string; meta: string; kind: 'hubspot' | 'saved' | 'budget' }

export const PICKER_GROUPS: { label: string; items: PickerItem[] }[] = [
  {
    label: 'HubSpot lists',
    items: [
      { id: 'q4-target', name: 'Q4 target accounts', meta: '36 accounts · 212 people · synced 4 min ago', kind: 'hubspot' },
      { id: 'q4-renewals', name: 'Q4 renewals', meta: '18 accounts · 54 people', kind: 'hubspot' },
      { id: 'q4-webinar', name: 'Q4 webinar sign-ups', meta: '64 people', kind: 'hubspot' },
    ],
  },
  {
    label: 'Saved in DelightLoop',
    items: [{ id: 'q4-expansion', name: 'Q4 expansion, VP Sales', meta: '48 people · already checked by Gifty', kind: 'saved' }],
  },
  {
    label: 'Budgets',
    items: [{ id: 'q4-gifting', name: 'Q4 gifting', meta: '$7,160 left of $20,000 · approved by Arjun', kind: 'budget' }],
  },
]
