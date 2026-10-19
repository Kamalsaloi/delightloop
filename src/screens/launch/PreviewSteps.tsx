import type { ReactNode } from 'react'
import { Avatar, HubSpotMark, Icon, LinkedInMark } from '@/components/ui'
import { FACE, GIFT, asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { Hl } from './Hl'
import type { Recipient } from './data'

export type StepId = 'email' | 'linkedin' | 'postcard' | 'gift' | 'page'
export const STEP_IDS: StepId[] = ['email', 'linkedin', 'postcard', 'gift', 'page']

/* ── Left list: what the person gets ─────────────────────────── */

export function stepMeta(id: StepId, p: Recipient): { title: string; sub: string; icon: ReactNode } {
  switch (id) {
    case 'email':
      return {
        title: 'Intro from Sam',
        sub: 'Day 0 · Mon 26 Oct, 9:00',
        icon: (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[0_0_0_1px_#EBEBE8]">
            <GmailIcon />
          </span>
        ),
      }
    case 'linkedin':
      return {
        title: 'Connection request',
        sub: 'Day 2 · if the intro is opened',
        icon: (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-linkedin text-[13px] font-bold leading-[14px] text-white">
            in
          </span>
        ),
      }
    case 'postcard':
      return { title: 'Handwritten postcard', sub: 'Day 3 · lands 30–31 Oct', icon: <Thumb id={GIFT.postcard} /> }
    case 'gift':
      return { title: p.gift.name, sub: `Day 5 · ${p.gift.land}`, icon: <Thumb id={GIFT.g1} /> }
    case 'page':
      return {
        title: `${p.first}’s page`,
        sub: 'QR on the gift card opens it',
        icon: (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-fill">
            <Icon name="qr" size={16} strokeWidth={1.4} color="#55575F" />
          </span>
        ),
      }
  }
}

function Thumb({ id }: { id: string }) {
  return <img src={asset(id)} alt="" className="h-9 w-9 shrink-0 rounded-[10px] object-cover" />
}

function GmailIcon({ w = 16 }: { w?: number }) {
  return (
    <svg width={w} height={(w * 3) / 4} viewBox="0 0 24 18" aria-hidden>
      <path d="M1.6 18h3.8V8.7L0 4.6v11.8C0 17.3.7 18 1.6 18z" fill="#4285F4" />
      <path d="M18.6 18h3.8c.9 0 1.6-.7 1.6-1.6V4.6l-5.4 4.1V18z" fill="#34A853" />
      <path d="M18.6 1.6v7.1L24 4.6V2.4c0-2-2.3-3.1-3.9-1.9l-1.5 1.1z" fill="#FBBC04" />
      <path d="M5.4 8.7V1.6L12 6.5l6.6-4.9v7.1L12 13.6 5.4 8.7z" fill="#EA4335" />
      <path d="M0 2.4v2.2l5.4 4.1V1.6L3.9.5C2.3-.7 0 .4 0 2.4z" fill="#C5221F" />
    </svg>
  )
}

/* ── Centre: the rendered thing ──────────────────────────────── */

const BODY = 'text-[15px] leading-6 text-ink'

function DocHeader({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[14px] border-b border-line-soft px-8 pb-5 pt-6">
      <div className="text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink">{title}</div>
      {children}
    </div>
  )
}

function FromSam({ to, when, phone }: { to: ReactNode; when: string; phone?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar id={FACE.sam} size={36} />
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-baseline gap-1.5">
          <span className="whitespace-nowrap text-[13.5px] font-semibold leading-4 text-ink">Sam Rivera</span>
          {!phone && <span className="text-[12.5px] leading-4 text-grey-3">sam@delightloop.co</span>}
        </div>
        <span className="text-[12.5px] leading-4 text-grey-3">{to}</span>
        {phone && <span className="text-[12.5px] leading-4 text-grey-3">{when}</span>}
      </div>
      {!phone && <span className="text-[12.5px] leading-4 text-grey-3">{when}</span>}
    </div>
  )
}

export function StepDocument({ step, p, phone }: { step: StepId; p: Recipient; phone: boolean }) {
  switch (step) {
    case 'email':
      return (
        <>
          <DocHeader
            title={
              <>
                Quick idea for <Hl className="px-1">{p.short}</Hl>
              </>
            }
          >
            <FromSam to={`to ${p.email}`} when="Mon 26 Oct, 9:00 IST" phone={phone} />
          </DocHeader>
          <div className={cn('flex max-w-[640px] flex-col gap-4 px-8 py-6', BODY)}>
            <p>
              Hi <Hl>{p.first}</Hl>,
            </p>
            <p>
              Saw that <Hl>{`${p.short} ${p.news}`}</Hl> and figured outbound is on your mind for Q4. Teams growing that
              fast usually hit the same wall.
            </p>
            <p>
              We helped <Hl>{p.proof}</Hl> book their first meetings with a short loop like this one. Worth 15 minutes
              next week?
            </p>
            <p>Sam</p>
          </div>
        </>
      )

    case 'linkedin':
      return (
        <>
          <DocHeader title="Connection request">
            <div className="flex items-center gap-3">
              <LinkedInMark size={36} radius={10} className="!text-[15px]" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold leading-4 text-ink">From Sam’s LinkedIn</span>
                <span className="text-[12.5px] leading-4 text-grey-3">to {p.name}, {p.title} at {p.company}</span>
              </div>
              <span className="text-[12.5px] leading-4 text-grey-3">Wed 28 Oct, 10:00 IST</span>
            </div>
          </DocHeader>
          <div className="flex flex-col gap-5 px-8 py-6">
            <div className={cn('flex gap-4 rounded-[14px] p-5 shadow-[0_0_0_1px_#EBEBE8]', phone ? 'flex-col' : 'max-w-[560px]')}>
              <Avatar id={FACE.sam} size={56} />
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold leading-5 text-ink">Sam Rivera</span>
                  <span className="text-[12.5px] leading-4 text-grey-3">Founder, DelightLoop · Bengaluru</span>
                </div>
                <div className="rounded-[10px] rounded-bl-[2px] bg-white px-3 py-2.5 shadow-[0_0_0_1px_#EBEBE8]">
                  <p className="text-[14px] leading-[21px] text-[#33353C]">
                    Hi <Hl>{p.first}</Hl>, sent you a note on Monday about <Hl>{p.short}</Hl>. Would love to connect.
                  </p>
                </div>
              </div>
            </div>
            <p className="max-w-[560px] text-[13px] leading-5 text-grey-2">
              Only goes out if {p.first} opened the intro. If {p.pronoun} didn’t, Sam’s intro gets a two-line bump in the
              same thread instead.
            </p>
          </div>
        </>
      )

    case 'postcard':
      return (
        <>
          <DocHeader title="Handwritten postcard">
            <div className="text-[12.5px] leading-4 text-grey-3">
              Written with a pen in blue ink · posted Thu 29 Oct · lands 30–31 Oct
            </div>
          </DocHeader>
          <div className={cn('grid gap-4 px-8 py-6', phone ? 'grid-cols-1' : 'grid-cols-2')}>
            <img src={asset(GIFT.postcard)} alt="Postcard front" className="aspect-[3/2] w-full rounded-[12px] object-cover" />
            <div className="flex min-h-full w-full gap-4 rounded-[12px] bg-[#FBF9F4] p-5 shadow-[0_0_0_1px_#EBEBE8]">
              <p className="flex-1 font-serif text-[15.5px] italic leading-[23px] text-[#2B3A67]">
                Dear <Hl>{p.first}</Hl>, wishing you and the <Hl>{p.short}</Hl> team a warm and bright Diwali, filled with
                peace and joy. See you soon! <br />
                Sam
              </p>
              <div className="flex w-[34%] flex-col justify-end gap-1 border-l border-[#E8E3D6] pl-4 text-[12px] leading-4 text-grey-1">
                <span className="font-medium text-ink">{p.name}</span>
                <span>{p.company}</span>
                <span>{p.city}, India</span>
              </div>
            </div>
          </div>
        </>
      )

    case 'gift':
      return (
        <>
          <DocHeader title={p.gift.name}>
            <div className="text-[12.5px] leading-4 text-grey-3">Ships Sat 31 Oct · {p.gift.land} · with a card from Sam</div>
          </DocHeader>
          <div className={cn('flex gap-6 px-8 py-6', phone && 'flex-col')}>
            <img src={asset(GIFT.g1)} alt="" className={cn('rounded-[12px] object-cover', phone ? 'aspect-square w-full' : 'h-[280px] w-[300px]')} />
            <div className="flex max-w-[300px] flex-col justify-between gap-4 rounded-[12px] bg-[#FBF9F4] p-5 shadow-[0_0_0_1px_#EBEBE8]">
              <p className="font-serif text-[17px] italic leading-[25px] text-ink">
                Happy Diwali, <Hl>{p.first}</Hl>. A little light for the season, from all of us at DelightLoop.
                <br />— Sam
              </p>
              <div className="flex items-center gap-2.5 border-t border-[#E8E3D6] pt-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white shadow-[0_0_0_1px_#EBEBE8]">
                  <Icon name="qr" size={18} strokeWidth={1.4} color="#111216" />
                </span>
                <span className="text-[12px] leading-4 text-grey-2">Scan for a note from Sam, made for {p.first}</span>
              </div>
            </div>
          </div>
        </>
      )

    case 'page':
      return (
        <>
          <DocHeader title={`${p.first}’s page`}>
            <div className="flex items-center gap-1.5 text-[12.5px] leading-4 text-grey-3">
              <Icon name="link" size={13} color="#8B8D95" />
              delightloop.co/p/{p.id}-{p.short.toLowerCase()} · opens from the QR on the gift card
            </div>
          </DocHeader>
          <div className="flex max-w-[640px] flex-col gap-5 px-8 py-6">
            <div className="text-[22px] font-semibold leading-7 tracking-[-0.01em] text-ink">
              Happy Diwali, <Hl>{p.first}</Hl>
            </div>
            <div className="flex items-center gap-4 rounded-[14px] bg-page p-4">
              <span className="relative">
                <Avatar id={FACE.sam} size={56} />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink">
                  <Icon name="play" size={10} color="#fff" strokeWidth={1.6} />
                </span>
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium leading-5 text-ink">A 40-second note from Sam</span>
                <span className="text-[12.5px] leading-4 text-grey-3">Recorded for {p.short}’s Q4</span>
              </div>
            </div>
            <p className={BODY}>
              How <Hl>{p.proof}</Hl> booked their first meetings in two weeks, and what that could look like for{' '}
              <Hl>{p.short}</Hl>.
            </p>
            <span className="inline-flex h-10 w-fit items-center gap-2 rounded-[10px] bg-white px-4 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)]">
              <Icon name="calendar" size={13} strokeWidth={1.4} />
              Book 15 minutes with Sam
            </span>
          </div>
        </>
      )
  }
}

/* ── Right: what Gifty filled in ─────────────────────────────── */

type Source = { kind: 'hubspot' | 'linkedin' | 'text'; text: string; link?: string }
export type Filled = { label: string; value: string; source: Source }

export function filledFor(step: StepId, p: Recipient): Filled[] {
  const company: Filled = { label: 'Company', value: p.short, source: { kind: 'hubspot', text: 'HubSpot, short name' } }
  const first: Filled = { label: 'First name', value: p.first, source: { kind: 'hubspot', text: 'HubSpot contact' } }
  const proof: Filled = {
    label: 'Proof',
    value: p.proof,
    source: { kind: 'text', text: `Your case studies closest to ${p.short}’s size` },
  }
  const address: Filled = {
    label: 'Address',
    value: `${p.company}, ${p.city}`,
    source: { kind: 'hubspot', text: 'HubSpot, checked by Gifty' },
  }
  switch (step) {
    case 'email':
      return [
        company,
        {
          label: 'Opening line',
          value: p.news.charAt(0).toUpperCase() + p.news.slice(1),
          source: { kind: 'linkedin', text: p.newsSource, link: 'View' },
        },
        proof,
        { label: 'Send time', value: `9:00 in ${p.city}`, source: { kind: 'text', text: 'From the Timing tab' } },
      ]
    case 'linkedin':
      return [
        first,
        company,
        { label: 'Send time', value: `10:00 in ${p.city}`, source: { kind: 'text', text: 'Two days after the intro' } },
      ]
    case 'postcard':
      return [first, address, { label: 'Message', value: 'Diwali wishes, 24 words', source: { kind: 'text', text: 'From the postcard step' } }]
    case 'gift':
      return [
        { label: 'Gift', value: p.gift.name, source: { kind: 'text', text: `Picked for ${p.city}, under $80` } },
        address,
        { label: 'Card note', value: 'Happy Diwali, from Sam', source: { kind: 'text', text: 'From the gift step' } },
      ]
    case 'page':
      return [company, proof, { label: 'Booking link', value: 'Sam’s calendar, 15 min', source: { kind: 'text', text: 'From Sam’s settings' } }]
  }
}

export function FilledRow({ f }: { f: Filled }) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-line-soft py-3">
      <span className="text-[12px] leading-4 text-grey-3">{f.label}</span>
      <span className="text-[13px] font-medium leading-[18px] text-ink">{f.value}</span>
      <span className="flex items-center gap-1.5 text-[12px] leading-4 text-grey-2">
        {f.source.kind === 'hubspot' && <HubSpotMark size={14} />}
        {f.source.kind === 'linkedin' && (
          <span className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[3px] bg-linkedin text-[8px] font-bold leading-[10px] text-white">
            in
          </span>
        )}
        {f.source.text}
        {f.source.link && (
          <a className="cursor-pointer font-medium text-violet-link hover:underline">{f.source.link}</a>
        )}
      </span>
    </div>
  )
}
