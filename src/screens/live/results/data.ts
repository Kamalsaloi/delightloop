import { FACE, GIFT } from '@/lib/assets'

export type Reply = {
  id: string
  name: string
  first: string
  face: string
  role: string
  company: string
  time: string
  preview: string
  quote: string
  wrote: string
  inReplyTo: string
  intent: { label: string; tone: 'green' | 'violet' }
  draft: string
  chip: { icon: 'calendar' | 'link'; label: string }
  stopped: { title: string; sub: string; action: string; done: string }
}

export const REPLIES: Reply[] = [
  {
    id: 'daniel',
    name: 'Daniel Moore',
    first: 'Daniel',
    face: FACE.f4,
    role: 'CRO, Northwind · replied to the intro',
    company: 'Northwind',
    time: '8:12',
    preview: 'Timing’s good, we’re planning Q1 outbound right now…',
    quote: '“Timing’s good, we’re planning Q1 outbound right now. Free sometime next week?”',
    wrote: 'Daniel wrote, Tue 8:12',
    inReplyTo: 'In reply to Sam’s intro, Mon 9:00',
    intent: { label: 'Wants a meeting', tone: 'green' },
    draft: 'Great to hear, Daniel. Here’s my calendar for next week, grab whatever works and I’ll bring a few ideas for Q1.',
    chip: { icon: 'calendar', label: 'Meet Sam · 30 min' },
    stopped: {
      title: 'Daniel’s loop stopped at this reply',
      sub: 'No LinkedIn note, postcard or olive oil set. $80 back in the budget.',
      action: 'Send the gift anyway',
      done: 'The olive oil set ships Sat 31 Oct. $80 out of the budget.',
    },
  },
  {
    id: 'tom',
    name: 'Tom Becker',
    first: 'Tom',
    face: '01M57W535GS0F94QS6P08F83BJ',
    role: 'Head of Sales, Brightline · replied to the intro',
    company: 'Brightline',
    time: '7:40',
    preview: 'Sure, send a few times.',
    quote: '“Sure, send a few times.”',
    wrote: 'Tom wrote, Tue 7:40',
    inReplyTo: 'In reply to Sam’s intro, Mon 9:00',
    intent: { label: 'Wants a meeting', tone: 'green' },
    draft: 'Thanks, Tom. How about Tue 10:00, Wed 14:30 or Thu 11:00 next week? Or pick any slot that suits from my calendar.',
    chip: { icon: 'calendar', label: 'Meet Sam · 30 min' },
    stopped: {
      title: 'Tom’s loop stopped at this reply',
      sub: 'No LinkedIn note, postcard or olive oil set. $80 back in the budget.',
      action: 'Send the gift anyway',
      done: 'The olive oil set ships Sat 31 Oct. $80 out of the budget.',
    },
  },
  {
    id: 'kenji',
    name: 'Kenji Tanaka',
    first: 'Kenji',
    face: FACE.f5,
    role: 'Head of Sales, Brightpath · replied to the intro',
    company: 'Brightpath',
    time: 'Mon',
    preview: 'Does it work with Salesforce? We moved off HubSpot.',
    quote: '“Does it work with Salesforce? We moved off HubSpot.”',
    wrote: 'Kenji wrote, Mon 16:05',
    inReplyTo: 'In reply to Sam’s intro, Mon 9:00',
    intent: { label: 'Has a question', tone: 'violet' },
    draft: 'Good question, Kenji. Yes, it syncs both ways with Salesforce, same as HubSpot. Here’s the two-minute guide to switching over.',
    chip: { icon: 'link', label: 'Salesforce setup guide' },
    stopped: {
      title: 'Kenji’s loop is paused at this reply',
      sub: 'The postcard still goes out Thu. The gift waits until Sam answers.',
      action: 'Stop the gift',
      done: 'Gift cancelled. $80 back in the budget.',
    },
  },
]

export type Looked = {
  id: string
  name: string
  face: string
  meta: string
  what: string
  status: { kind: 'new'; initials: string[]; names: string[] } | { kind: 'text'; label: string; tone: 'green' | 'grey' }
}

// "Also looked" rows under the featured visitor. EXTRA is revealed by "See all 14".
export const ALSO_LOOKED: Looked[] = [
  {
    id: 'kenji',
    name: 'Kenji Tanaka',
    face: FACE.f5,
    meta: 'Brightpath · yesterday',
    what: 'Read the Salesforce guide on his page, then forwarded it',
    status: { kind: 'new', initials: ['LW', 'RK'], names: ['Lena Wu, RevOps lead', 'Rahul Kapoor, SDR manager'] },
  },
  {
    id: 'daniel',
    name: 'Daniel Moore',
    face: FACE.f4,
    meta: 'Northwind · Fri 30 Oct',
    what: 'Already booked. Shared his page with two people on his team',
    status: { kind: 'text', label: 'Meeting Tue', tone: 'green' },
  },
]

export const ALSO_LOOKED_EXTRA: Looked[] = [
  {
    id: 'meera',
    name: 'Meera Iyer',
    face: '01M57WG019MX885TVVGG07M08H',
    meta: 'Corvid · Thu 29 Oct',
    what: 'Opened her page once and read the case study',
    status: { kind: 'text', label: 'Out of office', tone: 'grey' },
  },
  {
    id: 'sofia',
    name: 'Sofia Lindqvist',
    face: '01M57W535F2ECEWJQH95YK4N7D',
    meta: 'Fjord Pay · Thu 29 Oct',
    what: 'Scanned the postcard, left after a few seconds',
    status: { kind: 'text', label: 'Not interested', tone: 'grey' },
  },
  {
    id: 'tom',
    name: 'Tom Becker',
    face: '01M57W535GS0F94QS6P08F83BJ',
    meta: 'Brightline · Fri 30 Oct',
    what: 'Played the first half of Sam’s video',
    status: { kind: 'text', label: '1 visit', tone: 'grey' },
  },
]

export const WORKED = [
  {
    id: 'gift',
    image: GIFT.g5,
    title: 'The gift did the heavy lifting',
    sub: '4 of the 6 meetings were booked within 3 days of a gift landing.',
    stat: '4 of 6',
  },
  {
    id: 'linkedin',
    title: 'The LinkedIn note beat the bump email',
    sub: 'People who opened and got a note replied three times as often.',
    stat: '12% vs 4%',
  },
  {
    id: 'chai',
    image: GIFT.g3,
    title: 'Chai sets got the most thank-yous',
    sub: '9 of 14 thank-you posts and replies were about the chai. Gifty will lean on it for India next time.',
    stat: '9 of 14',
  },
]
