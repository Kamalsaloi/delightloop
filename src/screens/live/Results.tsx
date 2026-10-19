import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AvatarStack, ButtonLink, Icon } from '@/components/ui'
import { BuilderHeader } from '@/components/shell'
import { FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { REPLIES } from './results/data'
import { FinishedMain, FinishedSide } from './results/Finished'
import { Inbox } from './results/Inbox'
import { ComingUp, Handled, LoopSoFar } from './results/Side'
import { Visits } from './results/Visits'

type Tab = 'replies' | 'visits'

// Each tab is a different moment in the loop in Paper (09 = day 1, 09a = day 5).
const MOMENT: Record<Tab, { day: number; now: string; coming: { day: string; text: string }[] }> = {
  replies: {
    day: 1,
    now: 'Tue 27 Oct, 8:40',
    coming: [
      { day: 'Wed 28', text: '25 LinkedIn notes, 23 emails' },
      { day: 'Thu 29', text: '36 postcards go to print' },
      { day: 'Sat 31', text: '36 gifts ship' },
    ],
  },
  visits: {
    day: 5,
    now: 'Sat 31 Oct, 9:10',
    coming: [
      { day: 'Today', text: '36 gifts ship' },
      { day: 'Mon 2', text: 'Gifts start landing' },
      { day: 'Wed 4', text: 'Loop ends' },
    ],
  },
}

/**
 * 09 · Live, Results with replies.
 * ?reply=<id> opens a reply · ?tab=visits shows 09a · ?state=finished shows 13.
 */
export default function Results() {
  // ── Router ──────────────────────────────────────────────────
  const [params, setParams] = useSearchParams()

  // ── Local state ─────────────────────────────────────────────
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [shared, setShared] = useState(false)

  // ── Derived ─────────────────────────────────────────────────
  const finished = params.get('state') === 'finished'
  const tab: Tab = params.get('tab') === 'visits' ? 'visits' : 'replies'
  const moment = MOMENT[tab]
  const selected = REPLIES.find((r) => r.id === params.get('reply')) ?? REPLIES[0]
  const open = REPLIES.length - sent.size

  // ── Handlers ────────────────────────────────────────────────
  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value === null) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  function handleSend(id: string) {
    setSent((s) => new Set(s).add(id))
  }

  function handleShare() {
    setShared(true)
    window.setTimeout(() => setShared(false), 1800)
  }

  // ── Render helpers ──────────────────────────────────────────
  function renderHeader() {
    if (finished) {
      return (
        <BuilderHeader
          mode="live"
          tab="Results"
          status="Finished"
          right={
            <>
              <span className="text-[12.5px] leading-4 text-grey-3">Ended Wed 4 Nov</span>
              <AvatarStack ids={[FACE.priya, FACE.sam]} size={30} step={20} />
              <button
                onClick={handleShare}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-white px-4 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover"
              >
                {shared && <Icon name="check" size={13} strokeWidth={1.8} />}
                {shared ? 'Link copied' : 'Share results'}
              </button>
            </>
          }
        />
      )
    }
    return (
      <BuilderHeader
        mode="live"
        tab="Results"
        status={`Live · Day ${moment.day}`}
        statusTone="green"
        right={
          <>
            <span className="text-[12.5px] leading-4 text-grey-3">{moment.now}</span>
            <AvatarStack ids={[FACE.priya, FACE.sam]} size={30} step={20} />
            <ButtonLink to="/paused/build" className="h-[42px]" leading={<Icon name="pause" size={13} strokeWidth={1.6} />}>
              Pause loop
            </ButtonLink>
          </>
        }
      />
    )
  }

  function renderMain() {
    if (finished) return <FinishedMain />
    const title =
      tab === 'visits' ? (
        <TitleBlock title="14 people opened their page" sub="Every postcard has a code to a page made for that person. Here’s who looked." />
      ) : (
        <TitleBlock
          title={open === 0 ? 'Sam is all caught up' : `${open} ${open === 1 ? 'reply needs' : 'replies need'} Sam`}
          sub="Gifty drafted an answer for each. Nothing sends until Sam does."
        />
      )
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
        <div className="flex items-end justify-between">
          {title}
          <ResultsTabs value={tab} replies={REPLIES.length} visits={tab === 'visits' ? 14 : 0} onChange={(t) => setParam('tab', t === 'replies' ? null : t)} />
        </div>
        {tab === 'visits' ? (
          <Visits />
        ) : (
          <Inbox replies={REPLIES} selected={selected} onSelect={(id) => setParam('reply', id)} sent={sent} onSend={handleSend} />
        )}
      </div>
    )
  }

  function renderSide() {
    if (finished) return <FinishedSide />
    return (
      <>
        <LoopSoFar day={moment.day} />
        <ComingUp items={moment.coming} />
        <Handled />
      </>
    )
  }

  return (
    <div className="flex h-screen min-h-[900px] flex-col bg-page">
      {renderHeader()}
      <main className="min-h-0 flex-1 px-12 pb-8 pt-7">
        <div className="mx-auto flex h-full max-w-[1344px] gap-6">
          {renderMain()}
          <aside className="flex w-80 shrink-0 flex-col gap-4">{renderSide()}</aside>
        </div>
      </main>
    </div>
  )
}

function TitleBlock({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">{title}</h1>
      <p className="text-[14px] leading-5 text-grey-2">{sub}</p>
    </div>
  )
}

// Visits are 0 on day 1 (09) and 14 by day 5 (09a), as in Paper.
function ResultsTabs({ value, replies, visits, onChange }: { value: Tab; replies: number; visits: number; onChange: (t: Tab) => void }) {
  const items: { id: Tab; label: string; count: number }[] = [
    { id: 'replies', label: 'Replies', count: replies },
    { id: 'visits', label: 'Page visits', count: visits },
  ]
  return (
    <div role="tablist" className="flex gap-1 rounded-[10px] bg-[#EDEDEA] p-[3px]">
      {items.map((it) => {
        const active = it.id === value
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.id)}
            className={cn(
              'flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-[14px] text-[13px] leading-4',
              active ? 'bg-white shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.06)]' : 'hover:text-ink',
            )}
          >
            <span className={active ? 'font-semibold text-ink' : 'font-medium text-grey-2'}>{it.label}</span>
            <span className="text-grey-3">{it.count}</span>
          </button>
        )
      })}
    </div>
  )
}

