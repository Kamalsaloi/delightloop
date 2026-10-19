import { FACE } from '@/lib/assets'

// A few of the 48 recipients, enough to make the person switcher feel real.
export type Recipient = {
  id: string
  name: string
  first: string
  face: string
  title: string
  company: string // full name, e.g. "Kestrel Labs"
  short: string // what Gifty uses in copy, e.g. "Kestrel"
  city: string
  email: string
  news: string // opening line, lower-case start so it reads mid-sentence
  newsSource: string
  proof: string
  pronoun: 'she' | 'he'
  gift: { name: string; land: string }
}

export const RECIPIENTS: Recipient[] = [
  {
    id: 'ananya',
    name: 'Ananya Rao',
    first: 'Ananya',
    face: FACE.f3,
    title: 'VP Sales',
    company: 'Kestrel Labs',
    short: 'Kestrel',
    city: 'Bengaluru',
    email: 'ananya@kestrel.io',
    news: 'opened two new offices this year',
    newsSource: 'Kestrel’s post, 12 Sep',
    proof: 'Orbit and Fieldwork',
    pronoun: 'she',
    gift: { name: 'Brass diya set', land: 'lands by Wed 4 Nov' },
  },
  {
    id: 'daniel',
    name: 'Daniel Moore',
    first: 'Daniel',
    face: FACE.f4,
    title: 'CRO',
    company: 'Northwind Health',
    short: 'Northwind',
    city: 'Mumbai',
    email: 'daniel@northwind.health',
    news: 'raised a Series B in August',
    newsSource: 'Northwind’s post, 28 Aug',
    proof: 'Pillar and Orbit',
    pronoun: 'he',
    gift: { name: 'Brass diya set', land: 'lands by Wed 4 Nov' },
  },
  {
    id: 'kenji',
    name: 'Kenji Tanaka',
    first: 'Kenji',
    face: FACE.f5,
    title: 'VP Revenue',
    company: 'Lumen Freight',
    short: 'Lumen',
    city: 'Pune',
    email: 'kenji@lumenfreight.com',
    news: 'hired four new SDRs last month',
    newsSource: 'Kenji’s post, 3 Oct',
    proof: 'Fieldwork and Arcadia',
    pronoun: 'he',
    gift: { name: 'Brass diya set', land: 'lands by Thu 5 Nov' },
  },
  {
    id: 'tom',
    name: 'Tom Becker',
    first: 'Tom',
    face: '01M57W535GS0F94QS6P08F83BJ',
    title: 'Head of Sales',
    company: 'Brightline Labs',
    short: 'Brightline',
    city: 'Hyderabad',
    email: 'tom@brightline.dev',
    news: 'launched in Singapore in September',
    newsSource: 'Brightline’s post, 19 Sep',
    proof: 'Orbit and Pillar',
    pronoun: 'he',
    gift: { name: 'Brass diya set', land: 'lands by Wed 4 Nov' },
  },
  {
    id: 'meera',
    name: 'Meera Iyer',
    first: 'Meera',
    face: '01M57WG019MX885TVVGG07M08H',
    title: 'VP Sales',
    company: 'Corvid Analytics',
    short: 'Corvid',
    city: 'Chennai',
    email: 'meera@corvid.ai',
    news: 'doubled the sales team this year',
    newsSource: 'Meera’s post, 2 Oct',
    proof: 'Arcadia and Fieldwork',
    pronoun: 'she',
    gift: { name: 'Brass diya set', land: 'lands by Thu 5 Nov' },
  },
]

export const AUDIENCE_SIZE = 48

export function recipientIndex(id: string | null) {
  const i = RECIPIENTS.findIndex((r) => r.id === id)
  return i < 0 ? 0 : i
}
