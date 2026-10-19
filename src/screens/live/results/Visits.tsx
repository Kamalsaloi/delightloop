import { useState, type ReactNode } from 'react'
import { Avatar, Icon } from '@/components/ui'
import { FACE, GIFT, asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { ALSO_LOOKED, ALSO_LOOKED_EXTRA, type Looked } from './data'

const ONCE_FACES = ['01M57WG019MX885TVVGG07M08H', '01M57W535F2ECEWJQH95YK4N7D', '01M57W535GS0F94QS6P08F83BJ']

/** 09a · who opened the page behind their postcard's QR. */
export function Visits() {
  return (
    <div className="flex flex-col gap-4">
      <FeaturedVisit />
      <AlsoLooked />
    </div>
  )
}

/* ── Featured: Ananya ────────────────────────────────────────── */

function FeaturedVisit() {
  const [drafted, setDrafted] = useState(false)

  return (
    <div className="flex gap-6 rounded-card bg-white p-5 shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.04),0_16px_40px_-24px_rgba(17,18,22,.16)]">
      <PagePreview />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
        <div className="flex items-center gap-3">
          <Avatar id={FACE.f3} size={40} />
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-semibold leading-5 text-ink">Ananya Rao</span>
            <span className="text-[12.5px] leading-4 text-grey-3">VP Sales, Kestrel Labs · 3 visits</span>
          </div>
          <span className="text-[12.5px] font-medium leading-4 text-green-text">Most engaged</span>
        </div>

        <div className="flex flex-col">
          <JourneyRow time="8:31" icon={<img src={asset(GIFT.postcard)} alt="" className="h-[22px] w-7 rounded-[4px] object-cover" />}>
            Scanned the postcard
          </JourneyRow>
          <JourneyRow
            time="8:32"
            icon={
              <span className="flex h-[22px] w-7 items-center justify-center rounded-[4px] bg-ink">
                <PlayGlyph />
              </span>
            }
            trailing={<span className="h-1 w-[72px] shrink-0 rounded-[2px] bg-green" />}
          >
            Watched Sam’s video to the end
          </JourneyRow>
          <JourneyRow
            time="8:38"
            icon={
              <span className="flex h-[22px] w-7 items-center justify-center rounded-[4px] text-[11px] font-semibold leading-3 text-grey-1 shadow-[inset_0_0_0_1px_#E4E4E1]">
                $
              </span>
            }
            trailing={<span className="text-[12px] leading-4 text-grey-3">Team plan</span>}
          >
            Spent 4 minutes on your pricing page
          </JourneyRow>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrafted(true)}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] bg-violet px-[14px] text-[13px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]"
          >
            {drafted && <Icon name="check" size={13} strokeWidth={1.8} color="#fff" />}
            {drafted ? 'Drafted, it’s in Replies' : 'Draft a note from Sam'}
          </button>
          <a className="flex h-9 cursor-pointer items-center rounded-[10px] bg-white px-[14px] text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover">
            Open in HubSpot
          </a>
        </div>
      </div>
    </div>
  )
}

/** Her personalised page, as she saw it. */
function PagePreview() {
  return (
    <div className="flex w-[300px] shrink-0 flex-col overflow-hidden rounded-[14px] bg-[#FBF8F2] shadow-[0_0_0_1px_#EDE7DD]">
      <div className="flex h-7 shrink-0 items-center justify-center border-b border-[#EDE7DD] bg-[#F3EFE7] text-[11px] leading-[14px] text-grey-3">
        delightloop.page/kestrel/ananya
      </div>
      <div className="flex flex-col gap-3 p-4">
        <p className="font-serif text-[19px] italic leading-6 text-[#2A2B36]">Ananya, a little Diwali light for the Kestrel team</p>
        <div className="flex gap-[10px]">
          <div className="relative h-24 flex-1 overflow-hidden rounded-[10px]">
            <img src={asset(FACE.sam)} alt="" className="h-24 w-full object-cover" />
            <span className="absolute bottom-2 left-2 flex h-[22px] items-center gap-[5px] rounded-[11px] bg-[rgba(17,18,22,.72)] px-2 text-[10.5px] font-medium leading-3 text-white">
              <PlayGlyph />
              Sam · 1:12
            </span>
          </div>
          <img src={asset(GIFT.g1)} alt="" className="h-24 w-24 shrink-0 rounded-[10px] object-cover" />
        </div>
        <div className="flex items-center justify-between text-[11.5px] leading-[14px] text-grey-2">
          <span>Book 15 minutes with Sam</span>
          <span>See pricing</span>
        </div>
      </div>
    </div>
  )
}

function JourneyRow({ time, icon, trailing, children }: { time: string; icon: ReactNode; trailing?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-[9px] [&+&]:border-t [&+&]:border-[#F4F4F2]">
      <span className="w-11 shrink-0 text-[12px] leading-4 text-grey-3">{time}</span>
      {icon}
      <span className="flex-1 text-[13px] leading-[18px] text-ink">{children}</span>
      {trailing}
    </div>
  )
}

function PlayGlyph() {
  return (
    <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden>
      <path d="M2 1v8l7-4z" fill="#fff" />
    </svg>
  )
}

/* ── Also looked ─────────────────────────────────────────────── */

function AlsoLooked() {
  const [all, setAll] = useState(false)
  const rows = all ? [...ALSO_LOOKED, ...ALSO_LOOKED_EXTRA] : ALSO_LOOKED
  const rest = 14 - 1 - rows.length

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-white shadow-card">
      {rows.map((r) => (
        <LookedRow key={r.id} r={r} />
      ))}
      <div className="flex h-[52px] shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-[10px]">
          <div className="flex">
            {ONCE_FACES.map((id) => (
              <span key={id} className="rounded-full shadow-[0_0_0_2px_#fff]">
                <Avatar id={id} size={24} />
              </span>
            ))}
          </div>
          <span className="text-[13px] leading-4 text-grey-2">{rest} more opened their page once</span>
        </div>
        <button onClick={() => setAll((a) => !a)} className="cursor-pointer text-[13px] font-medium leading-4 text-violet-link hover:underline">
          {all ? 'Show fewer' : 'See all 14'}
        </button>
      </div>
    </div>
  )
}

function LookedRow({ r }: { r: Looked }) {
  const [open, setOpen] = useState(false)

  function renderStatus() {
    if (r.status.kind === 'text') {
      const tone = r.status.tone === 'green' ? 'font-medium text-green-text' : 'text-grey-3'
      return <span className={cn('text-[12.5px] leading-4', tone)}>{r.status.label}</span>
    }
    return (
      <button onClick={() => setOpen((o) => !o)} className="group flex cursor-pointer items-center gap-2">
        <span className="flex gap-1">
          {r.status.initials.map((ini, i) => (
            <span
              key={ini}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[9.5px] font-semibold leading-[10px] text-grey-1 shadow-[0_0_0_2px_#fff]',
                i === 0 ? 'bg-[#ECEBE7]' : 'bg-[#E4E2DC]',
              )}
            >
              {ini}
            </span>
          ))}
        </span>
        <span className="text-[12.5px] font-medium leading-4 text-violet-link group-hover:underline">
          {open ? 'Hide' : `${r.status.initials.length} new`}
        </span>
      </button>
    )
  }

  return (
    <div className="border-b border-line-soft transition-colors hover:bg-fill-hover">
      <div className="flex items-center gap-[14px] px-5 py-4">
        <Avatar id={r.face} size={36} />
        <div className="flex w-[200px] shrink-0 flex-col gap-0.5">
          <span className="text-[13.5px] font-semibold leading-[18px] text-ink">{r.name}</span>
          <span className="text-[12px] leading-4 text-grey-3">{r.meta}</span>
        </div>
        <span className="flex-1 text-[13px] leading-[18px] text-[#33353C]">{r.what}</span>
        {renderStatus()}
      </div>
      {open && r.status.kind === 'new' && (
        <div className="-mt-1 flex gap-4 pb-4 pl-[284px] pr-5 text-[12.5px] leading-4 text-grey-1">
          {r.status.names.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      )}
    </div>
  )
}
