import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonAvatar } from '@/components/audience/marks'
import { BuilderHeader, Page } from '@/components/shell'
import { Icon } from '@/components/ui'
import { giftById, teammate } from '@/data/catalog'
import { asset, CREAM, designUrl } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { DAY, fmtDay, fmtDayTime, money, nextMonday } from '@/lib/time'
import { allSteps, flatten, nodeDays, nodeTitle } from '@/store/graph'
import { giftAssignments } from '@/store/gifts'
import { audienceCounts, giftTotal, launchChecks } from '@/store/selectors'
import { activePeople } from '@/store/sim'
import { useStore } from '@/store/store'
import type { Loop, StepNode } from '@/store/types'

/** 07 · Review & launch: one person's storyboard, live checks, rules, start time, Launch. */
export default function LaunchPage({ loop }: { loop: Loop }) {
  // ── Router / store ───────────────────────────────────────────────
  const navigate = useNavigate()
  const clock = useStore((s) => s.clock)
  const integrations = useStore((s) => s.integrations)
  const pending = useStore((s) => s.pending)
  const nudgeBudget = useStore((s) => s.nudgeBudget)
  const askLinkedIn = useStore((s) => s.askLinkedIn)
  const setRuleOn = useStore((s) => s.setRuleOn)
  const sendTest = useStore((s) => s.sendTest)
  const launch = useStore((s) => s.launch)
  const toast = useStore((s) => s.toast)

  // ── Local state ──────────────────────────────────────────────────
  const options = [{ label: `Now, ${fmtDayTime(clock)}`, at: clock }, ...[0, 1].map((k) => ({ label: `${fmtDay(nextMonday(clock) + k * 7 * DAY)}, 9:00`, at: nextMonday(clock) + k * 7 * DAY }))]
  const [start, setStart] = useState(1)
  const [index, setIndex] = useState(0)
  const [launching, setLaunching] = useState(false)

  // ── Derived ──────────────────────────────────────────────────────
  const checks = launchChecks(loop, integrations)
  const blocking = checks.filter((c) => c.blocking)
  const locked = blocking.length > 0
  const counts = audienceCounts(loop)
  const total = giftTotal(loop)
  const people = activePeople(loop)
  const person = people[Math.min(index, people.length - 1)]
  const budgetAsked = pending.some((p) => p.kind === 'budget' && p.loopId === loop.id) || loop.budget.approval === 'asked'

  // ── Handlers ─────────────────────────────────────────────────────
  function doLaunch() {
    if (locked || launching) return
    setLaunching(true)
    window.setTimeout(() => {
      launch(loop.id, options[start].at)
      toast(`${loop.name} is live`)
      navigate(`/loops/${loop.id}/results`)
    }, 900)
  }

  // ── Render helpers ───────────────────────────────────────────────
  function renderCheck(id: string) {
    const c = checks.find((x) => x.id === id)!
    switch (id) {
      case 'audience':
        return <Row key={id} block lead={<Lead tone="amber">?</Lead>} title={c.title} sub={<Amber>Blocks launch. {c.sub}.</Amber>} action={<SmallButton onClick={() => navigate(`/loops/${loop.id}/audience`)}>Pick a list</SmallButton>} />
      case 'steps':
        return <Row key={id} block lead={<Lead tone="amber">+</Lead>} title={c.title} sub={<Amber>Blocks launch. {c.sub}.</Amber>} action={<SmallButton onClick={() => navigate(`/loops/${loop.id}/build`)}>Open the canvas</SmallButton>} />
      case 'copy':
        return (
          <Row
            key={id}
            block
            testId="check-copy"
            lead={<Lead tone="amber">Aa</Lead>}
            title={c.title}
            sub={<Amber>Blocks launch. {c.sub}</Amber>}
            action={<SmallButton onClick={() => navigate(`/loops/${loop.id}/build`, { state: { select: allSteps(loop.graph).find((n) => c.sub.startsWith(nodeTitle(n)))?.id } })}>Write it</SmallButton>}
          />
        )
      case 'budget':
        return c.done ? (
          <Row key={id} lead={<Initials text="AM" violet />} title={`Budget approved by ${loop.budget.approver}`} sub={`${money(total)} · Finance, ${fmtDayTime(clock)}`} action={<Done>Approved</Done>} />
        ) : (
          <Row
            key={id}
            block
            testId="check-budget"
            lead={<Initials text="AM" />}
            title={`Budget needs ${loop.budget.approver}’s OK`}
            sub={<Amber>Blocks launch. {money(total)} is over your {money(loop.budget.limit)} limit.</Amber>}
            action={
              <button
                onClick={() => nudgeBudget(loop.id)}
                disabled={budgetAsked}
                data-testid="nudge-budget"
                className="cursor-pointer text-[13px] leading-4 text-grey-3 underline-offset-2 hover:text-grey-1 hover:underline disabled:cursor-default disabled:no-underline"
              >
                {budgetAsked ? <span className="shimmer-text">Nudged, waiting for {loop.budget.approver}…</span> : `Nudge ${loop.budget.approver} in Slack`}
              </button>
            }
          />
        )
      case 'linkedin':
        return c.done ? (
          <Row key={id} lead={<LinkedInLead />} title="Sam’s LinkedIn is connected" sub="The LinkedIn steps send from his account" action={<Done>Connected</Done>} />
        ) : (
          <Row
            key={id}
            block
            testId="check-linkedin"
            lead={<LinkedInLead />}
            title="Sam’s LinkedIn isn’t connected"
            sub={<Amber>{integrations.linkedin === 'asked' ? 'Blocks launch. Asked Sam in Slack, waiting for him to connect…' : 'Blocks launch. The LinkedIn steps need it.'}</Amber>}
            action={
              <SmallButton onClick={askLinkedIn} disabled={integrations.linkedin === 'asked'} testId="ask-sam">
                {integrations.linkedin === 'asked' ? 'Asked' : 'Ask Sam to connect'}
              </SmallButton>
            }
          />
        )
      case 'test':
        return (
          <Row
            key={id}
            lead={<Thumb step={allSteps(loop.graph)[0]} />}
            title={c.done ? 'Test sent to you' : 'No test sent yet'}
            sub={c.done ? `Email and postcard proof, as ${person?.name.split(' ')[0] ?? 'they'} would see them` : 'Optional. Send yourself the first step to check it'}
            action={
              c.done ? (
                <button onClick={() => navigate(`/loops/${loop.id}/preview`)} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
                  Open
                </button>
              ) : (
                <SmallButton onClick={() => sendTest(loop.id)}>Send a test</SmallButton>
              )
            }
          />
        )
      case 'addresses':
        return c.done ? (
          <Row key={id} lead={<Lead tone="green">✓</Lead>} title="Every address found" sub={`Letters and gifts go to all ${counts.everyone}`} action={<Done>Done</Done>} />
        ) : (
          <Row
            key={id}
            lead={<MissingFaces people={people.filter((p) => !p.address)} />}
            title={`${counts.noAddress} ${counts.noAddress === 1 ? 'address' : 'addresses'} Gifty couldn’t find`}
            sub="Won’t block launch. They get the emails, and the letter and gift once you add one."
            action={<SmallButton onClick={() => navigate(`/loops/${loop.id}/audience`)}>Add addresses</SmallButton>}
          />
        )
    }
  }

  return (
    <Page
      header={
        <BuilderHeader
          loop={loop}
          tab={null}
          right={
            <button onClick={() => navigate(`/loops/${loop.id}/build`)} className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover">
              <Icon name="chevronLeft" size={14} strokeWidth={1.6} />
              Back to build
            </button>
          }
        />
      }
    >
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-12 py-10" data-scroll="content">
        <div className="mx-auto flex max-w-[1344px] items-start gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.02em] text-ink">{locked ? `${blocking.length} ${blocking.length === 1 ? 'thing' : 'things'} before launch` : 'Ready to launch'}</h1>
              <p className="text-[14px] leading-5 text-grey-2">Walk through one person’s loop, then clear the last few checks.</p>
            </div>
            {person && <Storyboard loop={loop} index={index} onIndex={setIndex} />}
            <div className="flex flex-col rounded-card bg-white px-6 py-2 shadow-card [&>*:first-child]:border-t-0" data-testid="checks">
              {checks.map((c) => renderCheck(c.id))}
            </div>
          </div>

          <aside className="sticky top-0 flex w-[384px] shrink-0 flex-col overflow-hidden rounded-card bg-white shadow-panel">
            <div className="flex flex-col gap-6 p-6">
              <div className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-ink">Launch</div>
              <div className="flex flex-col gap-2">
                <span className="text-[12.5px] font-medium leading-4 text-grey-1">Starts</span>
                <StartPicker options={options.map((o) => o.label)} value={start} onChange={setStart} />
                {start > 0 && <span className="text-[12px] leading-4 text-grey-3">The demo clock skips ahead to the start when you launch</span>}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between pb-2">
                  <span className="text-[13px] font-medium leading-4 text-grey-1">Loop rules</span>
                  <button onClick={() => navigate(`/loops/${loop.id}/build`, { state: { panel: 'rules' } })} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
                    Edit
                  </button>
                </div>
                {loop.rules.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-center gap-3 border-t border-line-soft py-[10px]">
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[13px] font-medium leading-4 text-ink">{r.when}</span>
                      <span className="text-[12px] leading-4 text-grey-3">{r.on ? r.summary : 'Off'}</span>
                    </span>
                    <RuleToggle on={r.on} onChange={() => setRuleOn(loop.id, r.id, !r.on)} label={r.when} />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-line-soft px-6 pb-6 pt-4">
              <button
                onClick={doLaunch}
                disabled={locked || launching}
                data-testid="launch"
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-[12px] text-[14.5px] font-semibold leading-4',
                  locked ? 'cursor-not-allowed bg-[#EDEDEA] text-[#9C9DA5]' : 'cursor-pointer bg-violet text-white shadow-primary hover:bg-[#5A4EF0]',
                  launching && 'cursor-wait opacity-80',
                )}
              >
                {launching ? 'Launching…' : 'Launch loop'}
                {!launching && <Icon name="arrowRight" size={15} strokeWidth={1.7} color={locked ? '#9C9DA5' : '#FFFFFF'} />}
              </button>
              <p className="text-center text-[12.5px] leading-4 text-grey-3" data-testid="launch-note">
                {locked ? `Unlocks when ${blocking.map((b) => (b.id === 'budget' ? `${loop.budget.approver} approves the budget` : b.id === 'linkedin' ? 'Sam connects LinkedIn' : b.id === 'copy' ? 'every step has copy' : b.id === 'audience' ? 'you pick who it’s for' : 'there’s a step')).join(' and ')}.` : `${counts.everyone} people · ${money(total)} in gifts. Pause any time before the gifts ship.`}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </Page>
  )
}

/* ── Storyboard ──────────────────────────────────────────────────────────── */

function Storyboard({ loop, index, onIndex }: { loop: Loop; index: number; onIndex: (i: number) => void }) {
  const navigate = useNavigate()
  const people = activePeople(loop)
  const p = people[Math.min(index, people.length - 1)]
  const first = p.name.split(' ')[0]
  const days = nodeDays(loop.graph, loop.startAt)
  const frames = flatten(loop.graph.steps).filter((n): n is StepNode => n.kind === 'step' && n.type !== 'wait' && n.type !== 'task').slice(0, 4)
  const gift = frames.find((n) => n.type === 'gift')
  const giftId = gift && gift.type === 'gift' ? giftAssignments(loop, gift.data)[p.slug] : undefined
  const fill = (t: string) => t.replace(/\{company\}/g, p.company.split(' ')[0]).replace(/\{first name\}/g, first)
  const nav = 'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-white shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover disabled:cursor-default disabled:opacity-40'

  function body(n: StepNode): ReactNode {
    switch (n.type) {
      case 'email':
      case 'bump': {
        const text = n.type === 'email' ? n.data.body : n.data.body
        return (
          <div className="flex h-[132px] flex-col gap-2 overflow-hidden rounded-[12px] bg-page p-3">
            <span className="text-[11.5px] leading-[14px] text-grey-3">From {teammate(loop.senderId).first}</span>
            {n.type === 'email' && <span className="text-[12.5px] font-semibold leading-4 text-ink">{n.data.subject ? fill(n.data.subject) : 'No subject yet'}</span>}
            <span className="text-[12px] leading-[17px] text-grey-2">{text ? `Hi ${first}, ${fill(text).slice(0, 80)}…` : 'No copy yet'}</span>
          </div>
        )
      }
      case 'linkedin':
        return (
          <div className="flex h-[132px] flex-col gap-2 rounded-[12px] bg-page p-3">
            <span className="flex items-center gap-1.5 text-[11.5px] leading-[14px] text-grey-3">
              <span className="flex h-[14px] w-[14px] items-center justify-center rounded-[3px] bg-linkedin text-[8.5px] font-bold leading-[10px] text-white">in</span>
              {n.data.title}
            </span>
            <div className="rounded-[10px] rounded-bl-[2px] bg-white px-[10px] py-2 shadow-[0_0_0_1px_#EBEBE8]">
              <span className="text-[12px] leading-[17px] text-[#33353C]">{n.data.note ? `Hi ${first}, ${fill(n.data.note).slice(0, 70)}` : n.data.noteMode === 'none' ? 'A plain request' : 'No note yet'}</span>
            </div>
          </div>
        )
      case 'postcard': {
        const src = designUrl(n.data.design)
        return <span className="block h-[132px] w-full rounded-[12px] bg-cover bg-center" style={src ? { backgroundImage: `url(${src})` } : { backgroundColor: CREAM }} />
      }
      case 'gift':
        return <img src={asset(giftById(giftId ?? 'chai').img)} alt="" className="h-[132px] w-full rounded-[12px] object-cover" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-card bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold leading-5 text-ink">Preview one person’s loop</span>
          <span className="text-[12.5px] leading-4 text-grey-3">
            All {people.length} get their own version. This one is {first}’s.
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className={nav} disabled={index === 0} onClick={() => onIndex(index - 1)} aria-label="Previous person">
            <Icon name="chevronLeft" size={12} strokeWidth={1.6} />
          </button>
          <span className="flex h-8 items-center gap-2 rounded-[8px] bg-white pl-1 pr-[10px] shadow-[inset_0_0_0_1px_#E4E4E1]">
            <PersonAvatar person={p} size={24} />
            <span className="text-[12.5px] font-semibold leading-4 text-ink">{p.name}</span>
            <span className="text-[12.5px] leading-4 text-grey-3">
              {index + 1} of {people.length}
            </span>
          </span>
          <button className={nav} disabled={index >= people.length - 1} onClick={() => onIndex(index + 1)} aria-label="Next person">
            <Icon name="chevronRight" size={12} strokeWidth={1.6} />
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        {frames.map((n) => (
          <button key={n.id} onClick={() => navigate(`/loops/${loop.id}/preview`)} className="group flex min-w-0 flex-1 cursor-pointer flex-col gap-[10px] text-left">
            <span className="flex items-baseline gap-1.5">
              <span className="text-[12.5px] font-semibold leading-4 text-ink">Day {Math.round(days[n.id] ?? 0)}</span>
              <span className="text-[12px] leading-4 text-grey-3">{fmtDay(loop.startAt + (days[n.id] ?? 0) * DAY)}</span>
            </span>
            <span className="block rounded-[12px] transition-shadow group-hover:shadow-[0_0_0_1px_#DCD8FD,0_6px_16px_-8px_rgba(17,18,22,.18)]">{body(n)}</span>
            <span className="truncate text-[12.5px] font-medium leading-4 text-ink">{n.type === 'gift' ? giftById(giftId ?? 'chai').name : nodeTitle(n)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Checklist ───────────────────────────────────────────────────────────── */

function Row({ lead, title, sub, action, block, testId }: { lead: ReactNode; title: string; sub: ReactNode; action: ReactNode; block?: boolean; testId?: string }) {
  return (
    <div data-testid={testId} className={cn('flex items-center gap-[14px] border-t border-line-soft', block ? 'py-5' : 'py-4')}>
      <span className="flex h-9 w-12 shrink-0 items-center justify-center">{lead}</span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className={cn('font-medium text-ink', block ? 'text-[14px] leading-[18px]' : 'text-[13.5px] leading-4')}>{title}</span>
        <span className={cn('text-grey-3', block ? 'text-[13px] leading-[18px]' : 'text-[12.5px] leading-4')}>{sub}</span>
      </span>
      {action}
    </div>
  )
}

const Amber = ({ children }: { children: ReactNode }) => <span className="text-amber-text">{children}</span>
const Done = ({ children }: { children: ReactNode }) => <span className="text-[12.5px] font-medium leading-4 text-green-text">{children}</span>

function Lead({ tone, children }: { tone: 'amber' | 'green'; children: ReactNode }) {
  return <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold leading-[14px]', tone === 'amber' ? 'bg-amber-bg text-amber-text' : 'bg-[#EAF5EF] text-green-text')}>{children}</span>
}
function Initials({ text, violet }: { text: string; violet?: boolean }) {
  return <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[11.5px] font-semibold leading-[14px]', violet ? 'bg-[#ECEAFE] text-violet-edge' : 'bg-[#ECEBE7] text-grey-1')}>{text}</span>
}
function LinkedInLead() {
  return <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-linkedin text-[14px] font-bold leading-4 text-white">in</span>
}
function Thumb({ step }: { step?: StepNode }) {
  const src = step?.type === 'postcard' ? designUrl(step.data.design) : null
  return src ? <img src={src} alt="" className="h-[34px] w-12 rounded-[6px] object-cover" /> : <Icon name="mail" size={18} color="#55575F" />
}
function SmallButton({ children, onClick, disabled, testId }: { children: ReactNode; onClick: () => void; disabled?: boolean; testId?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="flex h-8 shrink-0 cursor-pointer items-center rounded-[9px] bg-white px-3 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover disabled:cursor-default disabled:text-grey-3"
    >
      {children}
    </button>
  )
}
function MissingFaces({ people }: { people: { slug: string; face?: string; initials: string }[] }) {
  const shown = people.slice(0, 2)
  const extra = people.length - shown.length
  return (
    <span className="relative h-9 w-12">
      {shown.map((p, i) => (
        <span key={p.slug} className="absolute top-1.5 rounded-full shadow-[0_0_0_2px_#fff]" style={{ left: i * 12 }}>
          <PersonAvatar person={p} size={24} />
        </span>
      ))}
      {extra > 0 && <span className="absolute left-6 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-bg text-[10px] font-semibold leading-3 text-amber-text shadow-[0_0_0_2px_#fff]">+{extra}</span>}
    </span>
  )
}

/* ── Launch card bits ────────────────────────────────────────────────────── */

function StartPicker({ options, value, onChange }: { options: string[]; value: number; onChange: (i: number) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 text-left shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover">
        <Icon name="calendar" size={16} strokeWidth={1.4} color="#55575F" />
        <span className="flex-1 text-[13.5px] font-medium leading-4 text-ink">{options[value]}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">their time</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-[12px] bg-white p-1.5 shadow-pop">
          {options.map((o, i) => (
            <button
              key={o}
              onClick={() => {
                onChange(i)
                setOpen(false)
              }}
              className={cn('flex w-full cursor-pointer items-center justify-between rounded-[8px] px-2.5 py-2 text-[13px] leading-4 text-ink', i === value ? 'bg-fill font-medium' : 'hover:bg-fill-hover')}
            >
              {o}
              {i === value && <Icon name="check" size={14} color="#6559F7" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RuleToggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault()
        onChange()
      }}
      className={cn('flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-[9px] p-0.5 transition-colors', on ? 'justify-end bg-violet' : 'justify-start bg-line-strong')}
    >
      <span className="h-[14px] w-[14px] rounded-[7px] bg-white shadow-[0_1px_2px_rgba(17,18,22,.2)]" />
    </button>
  )
}
