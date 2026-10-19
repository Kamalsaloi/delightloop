import { useState } from 'react'
import { AppHeader, Page, ScrollArea } from '@/components/shell'
import { cn } from '@/lib/cn'
import { greeting } from '@/lib/time'
import { useStore } from '@/store/store'
import type { Loop } from '@/store/types'
import { NewLoopModal } from './NewLoopModal'
import { PlusIcon, VIOLET_BTN } from './parts'
import { DraftCard, GiftySpotted, LiveCard, QuarterAndDone, RunningCards, visibleSuggestions } from './sections'

/** 01 Home: what Gifty spotted, your loops by state, the quarter. Everything comes from the store. */
export default function Home() {
  // ── Store ────────────────────────────────────────────────────────
  const loops = useStore((s) => s.loops)
  const clock = useStore((s) => s.clock)
  const suggestions = useStore((s) => s.suggestions)
  const newLoopOpen = useStore((s) => s.newLoopOpen)
  const setNewLoopOpen = useStore((s) => s.setNewLoopOpen)

  // ── Local state ──────────────────────────────────────────────────
  const [query, setQuery] = useState('')

  // ── Derived ──────────────────────────────────────────────────────
  const q = query.trim().toLowerCase()
  const match = (l: Loop) => !q || l.name.toLowerCase().includes(q)
  const drafts = loops.filter((l) => l.status === 'draft' && match(l))
  const active = loops.filter((l) => l.kind === 'campaign' && (l.status === 'live' || l.status === 'paused') && match(l))
  const running = loops.filter((l) => l.kind === 'always-on' && l.status !== 'finished' && match(l))
  const finished = loops.filter((l) => l.status === 'finished' && match(l))
  const shown = visibleSuggestions(suggestions, loops)
  const runningCount = loops.filter((l) => l.status === 'live' || l.status === 'paused').length
  const counts = [`${loops.filter((l) => l.status === 'draft').length} draft`, `${runningCount} running`, `${loops.filter((l) => l.status === 'finished').length} finished`].join(' · ')
  const subtitle = shown.length ? 'Here’s what needs you this week.' : `${running.length} loops are running on their own, ${drafts.length} ${drafts.length === 1 ? 'draft is' : 'drafts are'} waiting.`

  return (
    <Page header={<AppHeader query={query} onQuery={setQuery} />}>
      <ScrollArea inner="flex flex-col gap-8 pb-16 pt-10">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.02em] text-ink">{greeting(clock)}, Priya</h1>
            <p className="text-[14px] leading-5 text-grey-2">{subtitle}</p>
          </div>
          {!shown.length && (
            <button type="button" onClick={() => setNewLoopOpen(true)} className={cn(VIOLET_BTN, 'h-10 gap-2 rounded-[10px] px-4 text-[13.5px] font-semibold leading-4')}>
              <PlusIcon color="#FFFFFF" />
              New loop
            </button>
          )}
        </div>

        {shown.length > 0 && <GiftySpotted suggestions={shown} onStartOwn={() => setNewLoopOpen(true)} />}

        <section className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-[18px] font-semibold leading-6 tracking-[-0.01em] text-ink">Your loops</h2>
              <span className="text-[13px] leading-4 text-grey-3">{counts}</span>
            </div>
            {q && <span className="text-[13px] leading-4 text-grey-3">Showing loops matching “{query}”</span>}
          </div>
          {(active.length > 0 || drafts.length > 0) && (
            <div className="flex flex-col gap-3">
              <SubHeading title={active.length ? 'Needs you' : 'Waiting on you'} />
              {active.map((l) => (
                <LiveCard key={l.id} loop={l} />
              ))}
              {drafts.map((l) => (
                <DraftCard key={l.id} loop={l} />
              ))}
            </div>
          )}
          {running.length > 0 && (
            <div className="flex flex-col gap-3">
              <SubHeading title="Running" note={`${running.length} loops, always on`} />
              <RunningCards loops={running} />
            </div>
          )}
          {q && !active.length && !drafts.length && !running.length && !finished.length && (
            <p className="rounded-card bg-white px-6 py-8 text-center text-[13.5px] leading-5 text-grey-2 shadow-card">No loops match “{query}”.</p>
          )}
        </section>

        <QuarterAndDone loops={loops} finished={finished} />
      </ScrollArea>
      <NewLoopModal open={newLoopOpen} onClose={() => setNewLoopOpen(false)} />
    </Page>
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
