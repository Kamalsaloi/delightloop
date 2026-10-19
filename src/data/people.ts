// Shared mock people for the audience screens (and anyone else who needs faces + addresses).

export type Source = 'linkedin' | 'x'

export type Person = {
  slug: string
  name: string
  role: string
  company: string
  /** Paper asset id for the face photo; falls back to initials. */
  face?: string
  initials: string
  /** Undefined when Gifty couldn't find one (noAddress). */
  address?: { line: string; note: string }
  noAddress?: boolean
  notOnLinkedIn?: boolean
  customer?: boolean
  /** "What Gifty knows" column (03c). */
  knows?: { headline: string; source: Source; detail: string }
}

export const FACES = {
  ananya: '01M57SW4WTJQ14W83NJJV5G6N1',
  daniel: '01M57SW4WTF7R83VF4JVQ4NW8B',
  kenji: '01M57SW4WVYW10HAH7493CVDWC',
  meera: '01M57WG019MX885TVVGG07M08H',
  sofia: '01M57W535F2ECEWJQH95YK4N7D',
  tom: '01M57W535GS0F94QS6P08F83BJ',
  ethan: '01M57W535BFYQMHHV8V643AQ8N',
} as const

export const PEOPLE: Person[] = [
  {
    slug: 'ananya',
    name: 'Ananya Rao',
    role: 'VP Sales',
    company: 'Kestrel Labs',
    face: FACES.ananya,
    initials: 'AR',
    address: { line: 'Home, Bengaluru', note: 'Remote 3 days a week' },
    knows: { headline: 'Hiring 6 AEs this quarter', source: 'linkedin', detail: 'Posted the team’s Diwali lunch last year' },
  },
  {
    slug: 'daniel',
    name: 'Daniel Moore',
    role: 'CRO',
    company: 'Northwind',
    face: FACES.daniel,
    initials: 'DM',
    address: { line: 'Office, London', note: 'In 4 days a week' },
    knows: { headline: 'New CRO, 4 months in', source: 'x', detail: 'Shares weekend recipes on X' },
  },
  {
    slug: 'kenji',
    name: 'Kenji Tanaka',
    role: 'Head of Sales',
    company: 'Brightpath',
    face: FACES.kenji,
    initials: 'KT',
    address: { line: 'Office, Singapore', note: 'From a past delivery' },
    knows: { headline: 'Moving the team to Salesforce', source: 'x', detail: 'Tea shows up in their posts on X' },
  },
  {
    slug: 'meera',
    name: 'Meera Shah',
    role: 'VP Sales',
    company: 'Orbital',
    face: FACES.meera,
    initials: 'MS',
    noAddress: true,
    customer: true,
    knows: { headline: 'Back from leave last week', source: 'linkedin', detail: 'Shared Orbital’s Diwali card in 2025' },
  },
  {
    slug: 'sofia',
    name: 'Sofia Marin',
    role: 'VP Sales',
    company: 'Fieldwork',
    face: FACES.sofia,
    initials: 'SM',
    address: { line: 'Home, Austin', note: 'Fully remote' },
    knows: { headline: 'Runs a fully remote team of 12', source: 'linkedin', detail: 'Posts photos of a home office full of plants' },
  },
  {
    slug: 'tom',
    name: 'Tom Becker',
    role: 'VP Sales',
    company: 'Brightline',
    face: FACES.tom,
    initials: 'TB',
    noAddress: true,
    knows: { headline: 'Promoted from Director in October', source: 'linkedin', detail: 'Fully remote, posts from Lisbon' },
  },
  {
    slug: 'ethan',
    name: 'Ethan Brooks',
    role: 'Head of Sales',
    company: 'Larkspur',
    face: FACES.ethan,
    initials: 'EB',
    noAddress: true,
    knows: { headline: 'Joined Larkspur last week', source: 'linkedin', detail: 'Moved over from Orbital' },
  },
  {
    slug: 'leo',
    name: 'Leo Park',
    role: 'VP Sales',
    company: 'Quanta',
    initials: 'LP',
    customer: true,
    address: { line: 'Office, Seoul', note: 'In 5 days a week' },
    knows: { headline: 'Renewed with you in June', source: 'linkedin', detail: 'Shared the renewal post' },
  },
  {
    slug: 'grace',
    name: 'Grace Liu',
    role: 'CRO',
    company: 'Tessellate',
    initials: 'GL',
    notOnLinkedIn: true,
    address: { line: 'Office, Toronto', note: 'In 3 days a week' },
    knows: { headline: 'Speaking at SaaStr in November', source: 'x', detail: 'Posts about pipeline reviews on X' },
  },
  {
    slug: 'omar',
    name: 'Omar Haddad',
    role: 'VP Sales',
    company: 'Fernway',
    initials: 'OH',
    notOnLinkedIn: true,
    address: { line: 'Home, Dubai', note: 'Remote 2 days a week' },
    knows: { headline: 'Opening a Riyadh office', source: 'x', detail: 'Shares football takes on X' },
  },
]

export const personBySlug = (slug: string) => PEOPLE.find((p) => p.slug === slug)
export const subtitle = (p: Person) => `${p.role}, ${p.company}`

// ── Behavioural profiles (03d / B0b). Kenji is the Paper template; everyone else follows the same shape. ──

export type Profile = {
  socials: { source: Source; followers: string }[]
  /** Facts strip: three short value/label pairs. */
  facts: { value: string; label: string }[]
  /** Featured post under "On their mind". */
  post: { handle: string; when: string; source: Source; text: string; stats: string } | null
  timeline: { date: string; text: string; source: Source }[]
  interests: { label: string; posts: number }[]
  interestNote: string
  writing: string[]
  shipsTo: { line: string; note: string } | null
}

const PROFILES: Record<string, Profile> = {
  kenji: {
    socials: [
      { source: 'linkedin', followers: '2.1k' },
      { source: 'x', followers: '640' },
    ],
    facts: [
      { value: '2 yrs', label: 'at Brightpath' },
      { value: 'Mar 2026', label: 'promoted' },
      { value: 'Singapore', label: 'office 4 days' },
    ],
    post: { handle: '@kenjit', when: '9 days ago', source: 'x', text: 'Week 3 of moving the team to Salesforce. If you see me, bring coffee.', stats: '38 likes · 6 replies' },
    timeline: [
      { date: 'Oct 1', text: 'Shared a job post, hiring 2 SDRs in Singapore', source: 'linkedin' },
      { date: 'Mar 12', text: 'Promoted from Sales Director', source: 'linkedin' },
    ],
    interests: [
      { label: 'Weekend runs', posts: 11 },
      { label: 'Japanese tea', posts: 6 },
      { label: 'Sales books', posts: 3 },
    ],
    interestNote: 'Became a dad in August, mentioned twice on LinkedIn.',
    writing: ['Short', 'Dry humour', 'Replies in comments, not DMs'],
    shipsTo: { line: 'Brightpath office, Singapore 068898', note: 'A past delivery landed here in March 2025' },
  },
  ananya: {
    socials: [{ source: 'linkedin', followers: '4.8k' }],
    facts: [
      { value: '4 yrs', label: 'at Kestrel Labs' },
      { value: '6 AEs', label: 'hiring now' },
      { value: 'Bengaluru', label: 'remote 3 days' },
    ],
    post: { handle: 'Ananya Rao', when: '2 weeks ago', source: 'linkedin', text: 'We’re hiring 6 AEs before December. If you love messy, early markets, my DMs are open.', stats: '212 likes · 34 comments' },
    timeline: [
      { date: 'Oct 24', text: 'Posted the team’s Diwali lunch', source: 'linkedin' },
      { date: 'Jun 3', text: 'Spoke at SaaSBoomi on founder-led sales', source: 'linkedin' },
    ],
    interests: [
      { label: 'Filter coffee', posts: 9 },
      { label: 'Carnatic music', posts: 5 },
      { label: 'Team offsites', posts: 4 },
    ],
    interestNote: 'Thanks her team by name in almost every post.',
    writing: ['Warm', 'Long-form', 'Replies within a day'],
    shipsTo: { line: 'Home, Indiranagar, Bengaluru 560038', note: 'From a past delivery. Remote 3 days a week' },
  },
  daniel: {
    socials: [
      { source: 'linkedin', followers: '1.3k' },
      { source: 'x', followers: '2.4k' },
    ],
    facts: [
      { value: '4 mo', label: 'at Northwind' },
      { value: 'Jun 2026', label: 'joined as CRO' },
      { value: 'London', label: 'office 4 days' },
    ],
    post: { handle: '@danmoore', when: '2 weeks ago', source: 'x', text: 'Pipeline reviews are back on Mondays. Bringing pastries to soften the blow.', stats: '54 likes · 11 replies' },
    timeline: [
      { date: 'Sep 18', text: 'Shared a post on rebuilding the forecast', source: 'linkedin' },
      { date: 'Jun 2', text: 'Joined Northwind as CRO', source: 'linkedin' },
    ],
    interests: [
      { label: 'Cooking', posts: 14 },
      { label: 'Arsenal', posts: 8 },
      { label: 'Long walks', posts: 3 },
    ],
    interestNote: 'Shares weekend recipes on X, mostly slow-cooked.',
    writing: ['Brief', 'Friendly', 'Rarely on LinkedIn'],
    shipsTo: { line: 'Northwind office, London EC2A 4NE', note: 'In the office 4 days a week' },
  },
  meera: {
    socials: [{ source: 'linkedin', followers: '3.2k' }],
    facts: [
      { value: '5 yrs', label: 'at Orbital' },
      { value: 'Customer', label: 'renewed Apr' },
      { value: 'Bengaluru', label: 'office unclear' },
    ],
    post: { handle: 'Meera Shah', when: '6 days ago', source: 'linkedin', text: 'Good to be back. Lots to catch up on, and a team that kept everything running.', stats: '146 likes · 22 comments' },
    timeline: [
      { date: 'Oct 2', text: 'Back from leave', source: 'linkedin' },
      { date: 'Nov 2025', text: 'Shared Orbital’s Diwali card', source: 'linkedin' },
    ],
    interests: [
      { label: 'Diwali hosting', posts: 7 },
      { label: 'Kathak', posts: 4 },
      { label: 'Design books', posts: 2 },
    ],
    interestNote: 'Thanked the team who made Orbital’s Diwali card last year.',
    writing: ['Warm', 'Light emoji', 'Replies to DMs'],
    shipsTo: null,
  },
  tom: {
    socials: [{ source: 'linkedin', followers: '1.9k' }],
    facts: [
      { value: '3 yrs', label: 'at Brightline' },
      { value: 'Oct 2026', label: 'promoted' },
      { value: 'Lisbon', label: 'fully remote' },
    ],
    post: { handle: 'Tom Becker', when: '2 weeks ago', source: 'linkedin', text: 'Async standups across four time zones, three months in. Here’s what stuck.', stats: '88 likes · 19 comments' },
    timeline: [
      { date: 'Oct 8', text: 'Promoted from Director', source: 'linkedin' },
      { date: 'Jul 14', text: 'Moved the team to fully remote', source: 'linkedin' },
    ],
    interests: [
      { label: 'Surfing', posts: 10 },
      { label: 'Coffee', posts: 6 },
      { label: 'Remote work', posts: 5 },
    ],
    interestNote: 'Posts from Lisbon most weeks.',
    writing: ['Casual', 'Quick', 'Comments more than posts'],
    shipsTo: null,
  },
  ethan: {
    socials: [{ source: 'linkedin', followers: '960' }],
    facts: [
      { value: '1 week', label: 'at Larkspur' },
      { value: 'Oct 2026', label: 'moved' },
      { value: 'Denver', label: 'office 3 days' },
    ],
    post: { handle: 'Ethan Brooks', when: '4 days ago', source: 'linkedin', text: 'New role, first hires. Looking for 3 AEs who like building the playbook.', stats: '61 likes · 9 comments' },
    timeline: [
      { date: 'Oct 12', text: 'Moved from Orbital to Larkspur', source: 'linkedin' },
      { date: 'Feb 3', text: 'Hit 140% of quota at Orbital', source: 'linkedin' },
    ],
    interests: [
      { label: 'Cycling', posts: 8 },
      { label: 'Podcasts', posts: 4 },
      { label: 'Board games', posts: 2 },
    ],
    interestNote: 'Rides to work most days and posts the route.',
    writing: ['Direct', 'A little formal', 'Prefers email'],
    shipsTo: null,
  },
  sofia: {
    socials: [{ source: 'linkedin', followers: '2.6k' }],
    facts: [
      { value: 'New', label: 'started Oct 19' },
      { value: '12', label: 'person team' },
      { value: 'Austin', label: 'fully remote' },
    ],
    post: { handle: 'Sofia Marin', when: 'today', source: 'linkedin', text: 'Day one. Same plants, new team. Can’t wait to meet everyone properly.', stats: '304 likes · 58 comments' },
    timeline: [
      { date: 'Oct 19', text: 'Started a new role', source: 'linkedin' },
      { date: 'May 6', text: 'Wrote about running a fully remote team', source: 'linkedin' },
    ],
    interests: [
      { label: 'House plants', posts: 12 },
      { label: 'Trail running', posts: 5 },
      { label: 'Ceramics', posts: 3 },
    ],
    interestNote: 'Posts photos of her home office, usually on Fridays.',
    writing: ['Thoughtful', 'Long posts', 'Short replies'],
    shipsTo: { line: 'Home, Austin TX 78704', note: 'A past delivery landed here in 2024' },
  },
}

/** Profile for any person: hand-written where we have one, otherwise built from what Gifty knows. */
export function getProfile(p: Person): Profile {
  if (PROFILES[p.slug]) return PROFILES[p.slug]
  const k = p.knows
  const source: Source = p.notOnLinkedIn ? 'x' : 'linkedin'
  return {
    socials: [{ source, followers: '1.2k' }],
    facts: [
      { value: p.role, label: `at ${p.company}` },
      { value: p.address ? p.address.line.split(', ').pop()! : 'Unknown', label: p.address ? p.address.note.toLowerCase() : 'no address yet' },
      { value: p.customer ? 'Customer' : 'Prospect', label: p.customer ? 'renewed this year' : 'Q4 account' },
    ],
    post: k ? { handle: p.name, when: 'this month', source: k.source, text: k.headline, stats: '24 likes · 3 replies' } : null,
    timeline: k ? [{ date: 'Oct 2', text: k.detail, source: k.source }] : [],
    interests: [],
    interestNote: 'Gifty hasn’t found much outside work yet.',
    writing: ['Not enough posts yet'],
    shipsTo: p.address ? { line: p.address.line, note: p.address.note } : null,
  }
}
