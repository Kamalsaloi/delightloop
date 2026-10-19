import { FACE, GIFT } from '@/lib/assets'

// Mock data for the Diwali loop's gift step (04 / 04a / 04b).

export type Gift = { id: string; name: string; img: string; price: number; why: string; people: number }

export const GIFTS: Gift[] = [
  { id: 'diya', name: 'Brass diya set', img: GIFT.g1, price: 68, why: 'Based in India', people: 14 },
  { id: 'olive', name: 'Olive oil set', img: GIFT.g2, price: 80, why: 'Posts about food and travel', people: 12 },
  { id: 'chai', name: 'Single-origin chai', img: GIFT.g3, price: 62, why: 'Tea shows up in their posts', people: 13 },
  { id: 'plant', name: 'Desk plant', img: GIFT.g4, price: 84, why: 'Works from home', people: 9 },
]

export const SWAP_OPTIONS = [
  { id: 'candle', name: 'Soy candle', short: 'soy candle', img: GIFT.g5, price: 54, note: 'calm, any desk' },
  { id: 'choc', name: 'Dark chocolates', short: 'dark chocolates', img: GIFT.g6, price: 46, note: 'easy to share' },
  { id: 'chai', name: 'Single-origin chai', short: 'single-origin chai', img: GIFT.g3, price: 62, note: 'from Darjeeling' },
] as const

export const PEOPLE_FACE = {
  ananya: FACE.f3,
  daniel: FACE.f4,
  kenji: FACE.f5,
  ethan: '01M57W535BFYQMHHV8V643AQ8N',
  sofia: '01M57W535F2ECEWJQH95YK4N7D',
  tom: '01M57W535GS0F94QS6P08F83BJ',
  meera: '01M57WG019MX885TVVGG07M08H',
} as const

export const OFFICE_MAP = '01M57WG012P1ZE92J69P7Y3XAE'

export type Network = 'linkedin' | 'x'
export type MatchedPerson = { name: string; company: string; face: string; network: Network; post: string; warning?: string }

// B · who the olive oil set was picked for
export const OLIVE_MATCHES: MatchedPerson[] = [
  { name: 'Daniel Moore', company: 'Northwind', face: PEOPLE_FACE.daniel, network: 'linkedin', post: 'Posted “Back from Puglia, miss the olive oil”' },
  {
    name: 'Ethan Brooks',
    company: 'Larkspur',
    face: PEOPLE_FACE.ethan,
    network: 'x',
    post: 'Posted “Fresh pasta from scratch this weekend”',
    warning: 'Gifty couldn’t find an address',
  },
  { name: 'Sofia Marin', company: 'Quill', face: PEOPLE_FACE.sofia, network: 'linkedin', post: 'Posted “Best meal of the year was in Lucca”' },
  { name: 'Tom Becker', company: 'Brightline', face: PEOPLE_FACE.tom, network: 'x', post: 'Posted “Friday cook-off with the team, I lost”' },
]

export type Recipient = { name: string; company: string; face: string; status: string; gift: string; changed?: boolean; needs?: boolean }

// C · everyone, needs-you first
export const RECIPIENTS: Recipient[] = [
  { name: 'Ethan Brooks', company: 'Larkspur', face: PEOPLE_FACE.ethan, status: 'No home address, office found', gift: GIFT.g2, needs: true },
  { name: 'Sofia Marin', company: 'Quill', face: PEOPLE_FACE.sofia, status: 'Office moved, no new one', gift: GIFT.g2, needs: true },
  { name: 'Ananya Rao', company: 'Kestrel', face: PEOPLE_FACE.ananya, status: 'Soy candle', gift: GIFT.g5, changed: true },
  { name: 'Kenji Tanaka', company: 'Brightpath', face: PEOPLE_FACE.kenji, status: 'Single-origin chai', gift: GIFT.g3 },
  { name: 'Daniel Moore', company: 'Northwind', face: PEOPLE_FACE.daniel, status: 'Olive oil set', gift: GIFT.g2 },
  { name: 'Tom Becker', company: 'Brightline', face: PEOPLE_FACE.tom, status: 'Olive oil set', gift: GIFT.g2 },
]

// D · addresses Gifty couldn't find
export const MISSING_ADDRESSES = [
  {
    id: 'ethan',
    name: 'Ethan Brooks',
    company: 'Larkspur',
    face: PEOPLE_FACE.ethan,
    status: 'No home address, office found',
    suggestion: { line: '410 Townsend St, SF', note: 'Larkspur office, in 4 days/wk' },
  },
  { id: 'sofia', name: 'Sofia Marin', company: 'Quill', face: PEOPLE_FACE.sofia, status: 'Office moved, no new one' },
  { id: 'meera', name: 'Meera Shah', company: 'Orbital', face: PEOPLE_FACE.meera, status: 'Only a city on file, Pune' },
]
