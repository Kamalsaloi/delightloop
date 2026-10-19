import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonAvatar } from '@/components/audience/marks'
import { BuilderHeader, NowLabel, Page } from '@/components/shell'
import { HubSpotMark, Icon, LinkedInMark } from '@/components/ui'
import { giftById } from '@/data/catalog'
import { asset, designUrl, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { DAY, fmtDay, fmtDayTime, fmtShort, fmtWhen, money } from '@/lib/time'
import { flatten, nodeDays, nodeTitle, stepsOfType } from '@/store/graph'
import { activePeople } from '@/store/sim'
import { useStore } from '@/store/store'
import type { Loop, Reply, Visit } from '@/store/types'

type Tab = 'replies' | 'visits'
const CARD = 'flex flex-col rounded-card bg-white shadow-card'

/** 09 · Results: replies that need Sam, page visits, the loop so far. 13 · finished: what worked. */
export default function ResultsPage({ loop }: { loop: Loop }) {
  // ── Router / store ───────────────────────────────────────────────
  const navigate = useNavigate()
  const clock = useStore((s) => s.clock)
  const pause = useStore((s) => s.pause)
  const markSeen = useStore((s) => s.markRepliesSeen)
  const toast = useStore((s) => s.toast)

  // ── Local state ──────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('replies')
  const [selected, setSelected] = useState<string | null>(null)

  // ── Derived ──────────────────────────────────────────────────────
  const live = loop.live
  const finished = loop.status === 'finished'
  const open = (live?.replies ?? []).filter((r) => r.status === 'open')
  const current = open.find((r) => r.id === selected) ?? open[0] ?? null
  const freshCount = open.filter((r) => r.fresh).length

  // ── Effects ──────────────────────────────────────────────────────
  // New replies glow for a moment, then count as seen.
  useEffect(() => {
    if (!freshCount) return
    const t = window.setTimeout(() => markSeen(loop.id), 2500)
    return () => window.clearTimeout(t)
  }, [freshCount, loop.id, markSeen])

  // ── Render helpers ───────────────────────────────────────────────
  function renderRight() {
    if (finished)
      return (
        <>
          <NowLabel>Ended {fmtDay(loop.startAt + (live?.endDay ?? 0) * DAY)}</NowLabel>
          <button
            onClick={() => {
              try {
                void navigator.clipboard?.writeText(window.location.href)
              } catch {
                /* clipboard blocked */
              }
              toast('Link to the results copied')
            }}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-white px-4 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover"
          >
            Share results
          </button>
        </>
      )
    if (loop.status === 'paused')
      return (
        <>
          <NowLabel>Paused {loop.pausedAt ? fmtDayTime(loop.pausedAt) : ''}</NowLabel>
          <button onClick={() => navigate(`/loops/${loop.id}/build`)} className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-4 text-[13px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]">
            Review &amp; resume
            <Icon name="arrowRight" size={13} color="#FFFFFF" />
          </button>
        </>
      )
    return (
      <>
        <NowLabel>{fmtDayTime(clock)}</NowLabel>
        <button
          data-testid="pause"
          onClick={() => {
            pause(loop.id)
            navigate(`/loops/${loop.id}/build`)
          }}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-white px-4 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover"
        >
          <Icon name="pause" size={13} strokeWidth={1.6} />
          Pause loop
        </button>
      </>
    )
  }

  function renderMain() {
    if (finished && live?.summary) return <FinishedMain loop={loop} />
    const title =
      tab === 'visits' ? (
        <TitleBlock title={live?.visits.length ? `${live.visits.length} ${live.visits.length === 1 ? 'person' : 'people'} opened their page` : 'No page visits yet'} sub="Every postcard and gift card has a code to a page made for that person. Here’s who looked." />
      ) : (
        <TitleBlock title={open.length === 0 ? 'Sam is all caught up' : `${open.length} ${open.length === 1 ? 'reply needs' : 'replies need'} Sam`} sub={open.length ? 'Gifty drafted an answer for each. Nothing sends until Sam does.' : 'New replies show up here as they arrive.'} />
      )
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
        <div className="flex items-end justify-between">
          {title}
          <div role="tablist" className="flex gap-1 rounded-[10px] bg-[#EDEDEA] p-[3px]">
            {(
              [
                ['replies', 'Replies', open.length],
                ['visits', 'Page visits', live?.visits.length ?? 0],
              ] as const
            ).map(([id, label, n]) => (
              <button
                key={id}
                role="tab"
                data-testid={`results-tab-${id}`}
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn('flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-[14px] text-[13px] leading-4', tab === id ? 'bg-white shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.06)]' : 'hover:text-ink')}
              >
                <span className={tab === id ? 'font-semibold text-ink' : 'font-medium text-grey-2'}>{label}</span>
                <span className="text-grey-3">{n}</span>
              </button>
            ))}
          </div>
        </div>
        {tab === 'visits' ? <Visits loop={loop} /> : <Inbox loop={loop} replies={open} current={current} onSelect={setSelected} />}
      </div>
    )
  }

  return (
    <Page header={<BuilderHeader loop={loop} tab="results" right={renderRight()} />}>
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-12 pb-8 pt-7" data-scroll="content">
        <div className="mx-auto flex min-h-full max-w-[1344px] gap-6">
          {renderMain()}
          <aside className="flex w-80 shrink-0 flex-col gap-4">{finished && live?.summary ? <FinishedSide loop={loop} /> : <Side loop={loop} />}</aside>
        </div>
      </main>
    </Page>
  )
}

function TitleBlock({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink" data-testid="results-title">
        {title}
      </h1>
      <p className="text-[14px] leading-5 text-grey-2">{sub}</p>
    </div>
  )
}

// ── Inbox ───────────────────────────────────────────────────────────────────

function Inbox({ loop, replies, current, onSelect }: { loop: Loop; replies: Reply[]; current: Reply | null; onSelect: (id: string) => void }) {
  const clock = useStore((s) => s.clock)
  if (!current)
    return (
      <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-2 rounded-card bg-white text-center shadow-card">
        <span className="text-[15px] font-semibold leading-5 text-ink">Nothing waiting on Sam</span>
        <span className="max-w-[360px] text-[13px] leading-5 text-grey-2">{loop.kind === 'always-on' ? 'This loop runs on its own. Replies land here when someone answers.' : 'Replies land here as people answer. Gifty drafts each answer for Sam.'}</span>
      </div>
    )
  return (
    <div className="flex min-h-[520px] flex-1 overflow-hidden rounded-card bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.04),0_12px_32px_-16px_rgba(17,18,22,.08)]" data-testid="inbox">
      <div className="thin-scroll flex w-80 shrink-0 flex-col gap-0.5 overflow-y-auto overscroll-contain border-r border-line-soft bg-[#FBFBFA] p-2">
        {replies.map((r) => {
          const active = r.id === current.id
          return (
            <button
              key={r.id}
              data-testid="reply-row"
              onClick={() => onSelect(r.id)}
              className={cn(
                'flex cursor-pointer gap-3 rounded-[12px] px-3 py-[14px] text-left transition-colors duration-700',
                active ? 'bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.05)]' : r.fresh ? 'bg-[#F3F2FE]' : 'hover:bg-[#F4F4F2]',
              )}
            >
              <PersonAvatar person={r} size={36} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-baseline justify-between">
                  <span className="text-[13.5px] font-semibold leading-4 text-ink">{r.name}</span>
                  <span className="text-[12px] leading-4 text-grey-3">{fmtWhen(r.at, clock)}</span>
                </span>
                <span className="line-clamp-2 text-[12.5px] leading-[17px] text-grey-1">{r.preview}</span>
                <span className={cn('text-[12px] font-medium leading-4', r.intent.tone === 'green' ? 'text-green-text' : 'text-violet-edge')}>{r.intent.label}</span>
              </span>
            </button>
          )
        })}
      </div>
      <Conversation key={current.id} loop={loop} r={current} />
    </div>
  )
}

function Conversation({ loop, r }: { loop: Loop; r: Reply }) {
  const sendReply = useStore((s) => s.sendReply)
  const toggleOverride = useStore((s) => s.toggleOverride)
  const toast = useStore((s) => s.toast)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(r.draft)
  const [thread, setThread] = useState(false)
  const [sending, setSending] = useState(false)
  const intro = stepsOfType(loop.graph, 'email')[0]
  const gift = stepsOfType(loop.graph, 'gift')[0]
  const giftImg = gift ? giftById(gift.data.picks[0]?.giftId ?? 'olive').img : GIFT.g2

  function send() {
    setSending(true)
    window.setTimeout(() => sendReply(loop.id, r.id, draft), 600)
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-line-soft px-6 py-[18px]">
        <PersonAvatar person={r} size={40} />
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[15px] font-semibold leading-5 text-ink">{r.name}</span>
          <span className="text-[12.5px] leading-4 text-grey-3">{r.role}</span>
        </div>
        <button onClick={() => toast('Opens the contact in HubSpot')} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] bg-fill px-[10px] text-[12.5px] font-medium leading-4 text-ink hover:bg-[#ECECE9]">
          <HubSpotMark size={14} />
          Open in HubSpot
        </button>
      </div>
      <div className="thin-scroll flex flex-1 flex-col gap-5 overflow-auto overscroll-contain p-6">
        <div className="flex flex-col gap-2">
          <span className="text-[12px] leading-4 text-grey-3">
            {r.first} wrote, {fmtDayTime(r.at)}
          </span>
          <p className="text-[17px] leading-[26px] text-ink">{r.quote}</p>
          <span className="text-[12.5px] leading-4 text-grey-3">
            In reply to Sam’s intro ·{' '}
            <button onClick={() => setThread((t) => !t)} className="cursor-pointer hover:text-ink hover:underline">
              {thread ? 'Hide thread' : 'Show thread'}
            </button>
          </span>
          {thread && intro && (
            <div className="mt-1 rounded-[12px] bg-page px-4 py-3 text-[13px] leading-5 text-grey-1">
              <span className="font-medium text-ink">Sam, {fmtShort(loop.startAt)} 9:00 · </span>
              {(intro.data.body || '').replace(/\{company\}/g, r.company).replace(/\{first name\}/g, r.first).slice(0, 140)}…
            </div>
          )}
        </div>
        <div className="flex flex-col rounded-[16px] bg-white shadow-[0_0_0_1.5px_#6559F7,0_8px_24px_-12px_rgba(101,89,247,.35)]">
          <div className="flex flex-col gap-[14px] px-5 py-[18px]">
            <span className="text-[12.5px] font-medium leading-4 text-violet-edge">Gifty’s draft, from Sam</span>
            {editing ? (
              <textarea
                autoFocus
                data-testid="reply-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="-mx-2 resize-none rounded-[8px] bg-fill-hover px-2 py-1 text-[15px] leading-[23px] text-ink outline-none ring-1 ring-line-strong focus:ring-violet/40"
              />
            ) : (
              <p className="text-[15px] leading-[23px] text-ink">{draft}</p>
            )}
            <span className="flex h-8 items-center gap-2 self-start rounded-[8px] bg-fill px-3 text-[12.5px] font-medium leading-4 text-ink">
              <Icon name={r.chip.icon} size={13} strokeWidth={1.4} />
              {r.chip.label}
            </span>
          </div>
          <div className="flex items-center gap-2 border-t border-line-soft px-5 py-[14px]">
            <span className="flex-1 text-[12.5px] leading-4 text-grey-3">Sends from Sam’s inbox</span>
            <button
              onClick={() => setEditing((e) => !e)}
              className="flex h-9 cursor-pointer items-center rounded-[10px] bg-white px-[14px] text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover"
            >
              {editing ? 'Done' : 'Edit'}
            </button>
            <button
              data-testid="send-as-sam"
              disabled={sending || !draft.trim()}
              onClick={send}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-4 text-[13px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0] disabled:cursor-wait disabled:opacity-70"
            >
              <Icon name="send" size={13} color="#fff" />
              {sending ? 'Sending…' : 'Send as Sam'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[12px] bg-page px-4 py-3">
          <img src={asset(giftImg)} alt="" className="h-8 w-8 rounded-[8px] object-cover" />
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[13px] font-medium leading-4 text-ink">{r.stopped.title}</span>
            <span className="text-[12.5px] leading-4 text-grey-3">{r.overridden ? r.stopped.done : r.stopped.sub}</span>
          </div>
          <button onClick={() => toggleOverride(loop.id, r.id)} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
            {r.overridden ? 'Undo' : r.stopped.action}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Visits ──────────────────────────────────────────────────────────────────

function Visits({ loop }: { loop: Loop }) {
  const draftVisitNote = useStore((s) => s.draftVisitNote)
  const toast = useStore((s) => s.toast)
  const [all, setAll] = useState(false)
  const visits = loop.live?.visits ?? []
  const post = stepsOfType(loop.graph, 'postcard')[0]
  const replied = new Set(loop.live?.replies.map((r) => r.slug))
  if (!visits.length)
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-card bg-white text-center shadow-card">
        <span className="text-[15px] font-semibold leading-5 text-ink">No visits yet</span>
        <span className="max-w-[380px] text-[13px] leading-5 text-grey-2">Pages open from the QR on the postcard and the gift card. Visits show up here once they land.</span>
      </div>
    )
  const [top, ...rest] = visits
  const shown = all ? rest : rest.slice(0, 2)
  const hasNote = replied.has(top.slug)
  return (
    <div className="flex flex-col gap-4" data-testid="visits">
      <div className="flex gap-6 rounded-card bg-white p-5 shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.04),0_16px_40px_-24px_rgba(17,18,22,.16)]">
        <div className="flex w-[300px] shrink-0 flex-col overflow-hidden rounded-[14px] bg-[#FBF8F2] shadow-[0_0_0_1px_#EDE7DD]">
          <div className="flex h-7 shrink-0 items-center justify-center border-b border-[#EDE7DD] bg-[#F3EFE7] text-[11px] leading-[14px] text-grey-3">
            delightloop.page/{top.meta.split(' · ')[0].split(' ')[0].toLowerCase()}/{top.name.split(' ')[0].toLowerCase()}
          </div>
          <div className="flex flex-col gap-3 p-4">
            <p className="font-serif text-[19px] italic leading-6 text-[#2A2B36]">
              {top.name.split(' ')[0]}, a little {loop.moment?.label === 'Diwali' ? 'Diwali light' : 'something'} for the team
            </p>
            {post && designUrl(post.data.design) && <img src={designUrl(post.data.design)!} alt="" className="h-24 w-full rounded-[10px] object-cover" />}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
          <div className="flex items-center gap-3">
            <PersonAvatar person={top} size={40} />
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-semibold leading-5 text-ink">{top.name}</span>
              <span className="text-[12.5px] leading-4 text-grey-3">{top.meta}</span>
            </div>
            <span className="text-[12.5px] font-medium leading-4 text-green-text">Most engaged</span>
          </div>
          <p className="text-[13px] leading-[19px] text-ink">{top.what}</p>
          <div className="flex items-center gap-2">
            <button
              data-testid="draft-note"
              disabled={hasNote}
              onClick={() => draftVisitNote(loop.id, top.id)}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-[14px] text-[13px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0] disabled:cursor-default disabled:opacity-60"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10.5 3 13 5.5 6 12.5 3 13l.5-3z" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              {hasNote ? 'Drafted, it’s in Replies' : 'Draft a note from Sam'}
            </button>
            <button onClick={() => toast('Opens the contact in HubSpot')} className="flex h-9 cursor-pointer items-center rounded-[10px] bg-white px-[14px] text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover">
              Open in HubSpot
            </button>
          </div>
        </div>
      </div>
      {rest.length > 0 && (
        <div className="flex flex-col overflow-hidden rounded-card bg-white shadow-card">
          {shown.map((v) => (
            <LookedRow key={v.id} v={v} />
          ))}
          {rest.length > 2 && (
            <div className="flex h-[52px] items-center justify-end px-5">
              <button onClick={() => setAll((a) => !a)} className="cursor-pointer text-[13px] font-medium leading-4 text-violet-link hover:underline">
                {all ? 'Show fewer' : `See all ${visits.length}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LookedRow({ v }: { v: Visit }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-line-soft transition-colors last:border-b-0 hover:bg-fill-hover">
      <div className="flex items-center gap-[14px] px-5 py-4">
        <PersonAvatar person={v} size={36} />
        <div className="flex w-[200px] shrink-0 flex-col gap-0.5">
          <span className="text-[13.5px] font-semibold leading-[18px] text-ink">{v.name}</span>
          <span className="text-[12px] leading-4 text-grey-3">{v.meta}</span>
        </div>
        <span className="flex-1 text-[13px] leading-[18px] text-[#33353C]">{v.what}</span>
        {v.status.kind === 'text' ? (
          <span className={cn('text-[12.5px] leading-4', v.status.tone === 'green' ? 'font-medium text-green-text' : 'text-grey-3')}>{v.status.label}</span>
        ) : (
          <button onClick={() => setOpen((o) => !o)} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
            {open ? 'Hide' : `${v.status.initials.length} new`}
          </button>
        )}
      </div>
      {open && v.status.kind === 'new' && (
        <div className="-mt-1 flex gap-4 pb-4 pl-[284px] pr-5 text-[12.5px] leading-4 text-grey-1">
          {v.status.names.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Side ────────────────────────────────────────────────────────────────────

function Side({ loop }: { loop: Loop }) {
  const navigate = useNavigate()
  const live = loop.live
  const c = live?.counts
  const day = live?.day ?? 0
  const N = activePeople(loop).length || c?.sent || 0
  const days = nodeDays(loop.graph, loop.startAt)
  const always = loop.kind === 'always-on'
  const funnel = c
    ? [
        { label: 'Got the intro', value: c.sent, color: '#C9C6FC' },
        { label: 'Opened it', value: c.opened, color: '#8F86F9' },
        { label: 'Replied', value: c.replied, color: '#6559F7' },
        { label: 'Booked a meeting', value: c.booked, color: '#22B573', good: true },
      ]
    : []
  const base = Math.max(1, always ? c?.sent ?? 1 : N)
  const coming = flatten(loop.graph.steps)
    .filter((n) => (days[n.id] ?? 0) > day && !(n.kind === 'step' && n.type === 'wait'))
    .slice(0, 3)
    .map((n) => ({ when: fmtShort(loop.startAt + (days[n.id] ?? 0) * DAY), text: nodeTitle(n) }))
  if (!always && live && live.endDay > day) coming.push({ when: fmtShort(loop.startAt + live.endDay * DAY), text: 'Loop ends' })
  const handled = live?.handled ?? []

  return (
    <>
      <div className={cn(CARD, 'gap-4 px-6 pb-6 pt-5')} data-testid="loop-so-far">
        <div className="flex items-baseline justify-between">
          <span className="text-[14px] font-semibold leading-5 text-ink">Loop so far</span>
          <span className="text-[12.5px] leading-4 text-grey-3">{always ? 'Always on' : `Day ${Math.max(1, Math.ceil(day))} of ${Math.round(live?.endDay ?? 0)}`}</span>
        </div>
        <div className="flex flex-col gap-3">
          {funnel.map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[12.5px] leading-4">
                <span className={f.good ? 'font-medium text-green-text' : 'text-grey-1'}>{f.label}</span>
                <span className={cn('font-semibold tabular-nums', f.good ? 'text-green-text' : 'text-ink')} data-testid={`count-${f.label.split(' ')[0].toLowerCase()}`}>
                  {f.value}
                </span>
              </div>
              <div className="flex h-1.5 rounded-[3px] bg-line-soft">
                <div className="rounded-[3px] transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, (f.value / base) * 100)}%`, backgroundColor: f.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-baseline justify-between border-t border-line-soft pt-[14px] text-[12.5px] leading-4">
          <span className="text-grey-1">Gifts held back</span>
          <span className="font-semibold text-ink">
            {c?.held ?? 0} · {money(c?.saved ?? 0)} saved
          </span>
        </div>
      </div>
      {coming.length > 0 && (
        <div className={cn(CARD, 'gap-3 px-6 py-5')}>
          <span className="text-[14px] font-semibold leading-5 text-ink">Coming up</span>
          <div className="flex flex-col">
            {coming.map((it, i) => (
              <div key={it.when + it.text} className={cn('flex gap-3 py-2 text-[12.5px] leading-4', i > 0 && 'border-t border-line-soft')}>
                <span className="w-14 shrink-0 font-medium text-ink">{it.when}</span>
                <span className="text-grey-2">{it.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={cn(CARD, 'gap-3 px-6 py-5')}>
        <div className="flex items-baseline justify-between">
          <span className="text-[14px] font-semibold leading-5 text-ink">Gifty handled {handled.length}</span>
          {stepsOfType(loop.graph, 'gift').length > 0 && (
            <button onClick={() => navigate(`/loops/${loop.id}/build`)} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
              Review
            </button>
          )}
        </div>
        {handled.length ? (
          <div className="flex flex-col gap-[10px]">
            {handled.map((h) => (
              <div key={h.text} className="flex items-center gap-[10px]">
                <PersonAvatar person={{ face: h.face, initials: h.initials }} size={24} />
                <span className="text-[12.5px] leading-4 text-grey-1">{h.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[12.5px] leading-4 text-grey-3">Out-of-office replies, bounced emails and delivery snags show up here.</span>
        )}
      </div>
    </>
  )
}

// ── Finished ────────────────────────────────────────────────────────────────

function FinishedMain({ loop }: { loop: Loop }) {
  const s = loop.live!.summary!
  const outcomes: { value: string; label: string; sub: string; good?: boolean }[] = [
    { value: String(s.meetings), label: 'meetings booked', sub: s.meetings ? `1 in every ${Math.max(1, Math.round(s.reached / s.meetings))} people` : 'None this time', good: true },
    { value: s.pipeline >= 1000 ? `$${Math.round(s.pipeline / 1000)}k` : money(s.pipeline), label: 'pipeline created', sub: `${s.meetings} deals in HubSpot` },
    { value: money(s.spent), label: 'spent on gifts and postcards', sub: s.meetings ? `${money(s.spent / s.meetings)} per meeting` : 'No meetings yet' },
    { value: money(s.left), label: 'left in the budget', sub: `${s.held} gifts never sent, they replied first` },
  ]
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6" data-testid="finished">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">
          {s.meetings} {s.meetings === 1 ? 'meeting' : 'meetings'} from {s.reached} people
        </h1>
        <p className="text-[14px] leading-5 text-grey-2">
          {loop.name} ran {s.days} days, {s.range}. Everything is synced to HubSpot.
        </p>
      </div>
      <div className="flex rounded-card bg-white shadow-card">
        {outcomes.map((o, i) => (
          <div key={o.label} className={cn('flex flex-1 flex-col gap-1 p-6', i < outcomes.length - 1 && 'border-r border-line-soft')}>
            <span className={cn('text-[30px] font-semibold leading-9 tracking-[-0.03em]', o.good ? 'text-green-text' : 'text-ink')}>{o.value}</span>
            <span className="text-[13px] leading-[18px] text-grey-1">{o.label}</span>
            <span className={cn('text-[12.5px] leading-4', o.good ? 'text-green-text' : 'text-grey-3')}>{o.sub}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col rounded-card bg-white shadow-card">
        <div className="flex items-baseline justify-between px-6 pb-2 pt-5">
          <span className="text-[15px] font-semibold leading-5 text-ink">What worked</span>
          <span className="text-[12.5px] leading-4 text-grey-3">From Gifty, checked against the numbers</span>
        </div>
        {s.worked.map((w, i) => (
          <div key={w.id} className={cn('flex items-center gap-5 px-6 py-4', i < s.worked.length - 1 && 'border-b border-line-soft')}>
            {w.image ? <img src={asset(w.image)} alt="" className="h-11 w-11 shrink-0 rounded-[10px] object-cover" /> : <LinkedInMark size={44} radius={10} className="!text-[18px]" />}
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[14px] font-medium leading-[18px] text-ink">{w.title}</span>
              <span className="text-[13px] leading-[18px] text-grey-2">{w.sub}</span>
            </div>
            <span className="text-[20px] font-semibold leading-6 text-ink">{w.stat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FinishedSide({ loop }: { loop: Loop }) {
  const setNewLoopOpen = useStore((s) => s.setNewLoopOpen)
  const toast = useStore((s) => s.toast)
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [handed, setHanded] = useState(false)
  const s = loop.live!.summary!
  return (
    <>
      <div className={cn(CARD, 'gap-4 p-6')}>
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold leading-5 text-ink">Run it again</span>
          <span className="text-[13px] leading-[18px] text-grey-2">Same steps for your next list, with what worked kept and the weakest step dropped.</span>
        </div>
        <button
          onClick={() => {
            setNewLoopOpen(true)
            navigate('/')
          }}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-violet text-[13.5px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]"
        >
          Draft the next loop
          <Icon name="arrowRight" size={13} strokeWidth={1.6} color="#FFFFFF" />
        </button>
        <button
          onClick={() => {
            setSaved(true)
            toast('Saved to your recipes')
          }}
          className="cursor-pointer text-center text-[13px] font-medium leading-4 text-violet-link hover:underline"
        >
          {saved ? 'Saved to your recipes' : 'Save as a recipe instead'}
        </button>
      </div>
      <div className={CARD}>
        <div className="flex flex-col gap-1 px-6 pb-3 pt-5">
          <span className="text-[15px] font-semibold leading-5 text-ink">Still warm, no meeting yet</span>
          <span className="text-[13px] leading-[18px] text-grey-2">They engaged but didn’t book. Worth a personal note from Sam.</span>
        </div>
        {s.warm.map((p) => (
          <div key={p.name} className="flex items-center gap-3 border-t border-line-soft px-6 py-3 hover:bg-fill-hover">
            <PersonAvatar person={p} size={32} />
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[13.5px] font-medium leading-[18px] text-ink">{p.name}</span>
              <span className="text-[12.5px] leading-4 text-grey-3">{p.sub}</span>
            </div>
          </div>
        ))}
        {s.warm.length === 0 && <span className="border-t border-line-soft px-6 py-4 text-[12.5px] leading-4 text-grey-3">Nobody left warm. Everyone who engaged booked.</span>}
        <div className="flex items-center justify-end border-t border-line-soft px-6 pb-[18px] pt-[14px] text-[13px] leading-4">
          <button
            onClick={() => {
              setHanded(true)
              toast('Handed to Sam in Slack')
            }}
            className="cursor-pointer font-medium text-violet-link hover:underline"
          >
            {handed ? 'Handed to Sam' : 'Hand them to Sam'}
          </button>
        </div>
      </div>
    </>
  )
}

