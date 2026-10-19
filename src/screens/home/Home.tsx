import { Link, useSearchParams } from 'react-router-dom'
import { AppHeader } from '@/components/shell'
import { cn } from '@/lib/cn'
import { SUGGESTIONS, SUGGESTIONS_LIVE } from './data'
import { PlusIcon, VIOLET_BTN } from './parts'
import { DraftCard, GiftySpotted, LiveDiwaliCard, QuarterAndDone, RunningCards } from './sections'

/**
 * 01 Home. States from the query string:
 *  ?suggestions=none → 01a (no Gifty card, "New loop" in the header)
 *  ?state=live       → 12 (Diwali loop running after launch)
 */
export default function Home() {
  const [params] = useSearchParams()
  const bare = params.get('suggestions') === 'none'
  const live = params.get('state') === 'live'

  return (
    <div className="min-h-screen bg-page">
      <AppHeader />
      <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-12 pb-16 pt-10">
        <Greeting bare={bare} />
        {bare ? <BareLoops /> : <FullLoops live={live} />}
        <QuarterAndDone />
      </main>
    </div>
  )
}

function Greeting({ bare }: { bare: boolean }) {
  const subtitle = bare
    ? 'Diwali is on Sun 8 Nov. Two loops are running on their own, one draft is waiting.'
    : 'Here’s what needs you this week.'
  return (
    <div className="flex items-end justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.02em] text-ink">Good evening, Priya</h1>
        <p className="text-[14px] leading-5 text-grey-2">{subtitle}</p>
      </div>
      {bare && (
        <Link to="/new" className={cn(VIOLET_BTN, 'h-10 gap-2 rounded-[10px] px-4 text-[13.5px] font-semibold leading-4')}>
          <PlusIcon color="#FFFFFF" />
          New loop
        </Link>
      )}
    </div>
  )
}

function SubHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[13px] font-semibold leading-4 text-grey-1">{title}</span>
      {note && <span className="text-[13px] leading-4 text-grey-3">{note}</span>}
    </div>
  )
}

function AllLoops() {
  return <button className="cursor-pointer text-[13px] font-medium leading-4 text-grey-1 hover:text-ink">All loops</button>
}

function FullLoops({ live }: { live: boolean }) {
  return (
    <>
      <GiftySpotted suggestions={live ? SUGGESTIONS_LIVE : SUGGESTIONS} />
      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-[18px] font-semibold leading-6 tracking-[-0.01em] text-ink">Your loops</h2>
            <span className="text-[13px] leading-4 text-grey-3">
              {live ? '1 draft · 3 running · 1 finished' : '1 draft · 2 running · 1 finished'}
            </span>
          </div>
          <AllLoops />
        </div>
        <div className="flex flex-col gap-3">
          <SubHeading title={live ? 'Needs you' : 'Waiting on you'} />
          {live ? <LiveDiwaliCard /> : <DraftCard />}
        </div>
        <div className="flex flex-col gap-3">
          <SubHeading title="Running" note="2 loops, always on" />
          <RunningCards />
        </div>
      </section>
    </>
  )
}

/** 01a: no suggestions, the draft leads. */
function BareLoops() {
  return (
    <>
      <DraftCard />
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[16px] font-semibold leading-5 text-ink">Running now</h2>
            <span className="text-[13px] leading-4 text-grey-3">2 loops, always on</span>
          </div>
          <AllLoops />
        </div>
        <RunningCards />
      </section>
    </>
  )
}
