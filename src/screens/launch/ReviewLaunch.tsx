import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Avatar, Icon } from '@/components/ui'
import { BuilderHeader } from '@/components/shell'
import { AddAddressesSheet } from '@/components/audience'
import { GIFT, asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { PersonSwitcher } from './PersonSwitcher'
import { RECIPIENTS, recipientIndex, type Recipient } from './data'

type Rule = { id: string; title: string; sub: string; on: boolean }

const RULES: Rule[] = [
  { id: 'reply', title: 'They reply', sub: 'Stop their loop, send to Sam', on: true },
  { id: 'meeting', title: 'They book a meeting', sub: 'Stop, don’t ship letter or gift', on: true },
  { id: 'ooo', title: 'Out of office', sub: 'Pause, resume when they’re back', on: true },
  { id: 'unsub', title: 'They unsubscribe', sub: 'Stop in every loop', on: true },
  { id: 'yes', title: 'They reply with a clear yes', sub: 'Off. Sam answers each one', on: false },
]

const START_OPTIONS = ['Mon 26 Oct, 9:00', 'Tue 27 Oct, 9:00', 'Mon 2 Nov, 9:00']

const MISSING_FACES = ['01M57W535GS0F94QS6P08F83BJ', '01M57WG019MX885TVVGG07M08H']

/** 07 · Review & launch. ?blocked=1 shows 07a: budget (Arjun) and Sam's LinkedIn both block launch. */
export default function ReviewLaunch() {
  // ── Router ──────────────────────────────────────────────────
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  // ── Local state ─────────────────────────────────────────────
  const [rules, setRules] = useState(RULES)
  const [start, setStart] = useState(START_OPTIONS[0])
  const [linkedin, setLinkedin] = useState<'missing' | 'asked' | 'connected'>('missing')
  const [budget, setBudget] = useState<'waiting' | 'nudged' | 'approved'>('waiting')
  const [missing, setMissing] = useState(7)

  // ── Derived ─────────────────────────────────────────────────
  const blocked = params.get('blocked') === '1'
  const index = recipientIndex(params.get('person'))
  const person = RECIPIENTS[index]
  const sheetOpen = params.get('sheet') === 'addresses'
  // Budget and LinkedIn block launch; missing addresses never do.
  const budgetBlocks = blocked && budget !== 'approved'
  const linkedinBlocks = blocked && linkedin !== 'connected'
  const locked = budgetBlocks || linkedinBlocks

  // ── Handlers ────────────────────────────────────────────────
  function setPerson(i: number) {
    const next = new URLSearchParams(params)
    next.set('person', RECIPIENTS[i].id)
    setParams(next, { replace: true })
  }

  function setSheet(open: boolean) {
    const next = new URLSearchParams(params)
    if (open) next.set('sheet', 'addresses')
    else next.delete('sheet')
    setParams(next, { replace: true })
  }

  function handleAddressesSaved(count: number) {
    setMissing((m) => Math.max(0, m - count))
  }

  function toggleRule(id: string) {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, on: !r.on } : r)))
  }

  function askSam() {
    setLinkedin('asked')
    window.setTimeout(() => setLinkedin('connected'), 1400)
  }

  function nudgeArjun() {
    setBudget('nudged')
    window.setTimeout(() => setBudget('approved'), 1400)
  }

  // ── Effects ─────────────────────────────────────────────────
  // Re-entering the blocked state starts the checks over.
  useEffect(() => {
    if (!blocked) return
    setLinkedin('missing')
    setBudget('waiting')
  }, [blocked])

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <BuilderHeader
        tab={null}
        right={
          <Link
            to="/loop/build/gift"
            className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover"
          >
            <Icon name="chevronLeft" size={14} strokeWidth={1.6} />
            Back to build
          </Link>
        }
      />

      <main className="px-12 py-10">
        <div className="mx-auto flex max-w-[1344px] gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.02em] text-ink">Ready to launch</h1>
              <p className="text-[14px] leading-5 text-grey-2">Walk through one person’s loop, then clear the last few checks.</p>
            </div>

            <Storyboard person={person} index={index} onPerson={setPerson} />

            <div className="flex flex-col rounded-card bg-white px-6 py-2 shadow-card">
              {budgetBlocks ? (
                <BudgetWaiting state={budget} onNudge={nudgeArjun} />
              ) : (
                <CheckRow
                  first
                  lead={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECEAFE] text-[11.5px] font-semibold leading-[14px] text-violet-edge">
                      AM
                    </span>
                  }
                  title="Budget approved by Arjun"
                  sub={blocked ? '$3,474 of $4,000 · Finance, just now' : '$3,474 of $4,000 · Finance, today 4:12 pm'}
                  action={<span className="text-[12.5px] font-medium leading-4 text-green-text">Approved</span>}
                />
              )}
              {linkedinBlocks && <LinkedInCheck state={linkedin} onAsk={askSam} />}
              <CheckRow
                lead={<img src={asset(GIFT.postcard)} alt="" className="h-[34px] w-12 rounded-[6px] object-cover" />}
                title="Test sent to you"
                sub={`Email and postcard proof, as ${person.first} would see them`}
                action={
                  <Link to={`/loop/preview?person=${person.id}`} className="text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
                    Open
                  </Link>
                }
              />
              {missing > 0 ? (
                <CheckRow
                  lead={<MissingFaces extra={missing - 2} />}
                  title={`${missing} ${missing === 1 ? 'address' : 'addresses'} Gifty couldn’t find`}
                  sub={
                    blocked ? (
                      'Won’t block launch. They get the emails, and the letter and gift once you add one.'
                    ) : (
                      <span className="text-amber-text">They’ll get the emails, but no letter or gift until you add one</span>
                    )
                  }
                  action={
                    <button
                      onClick={() => setSheet(true)}
                      className="flex h-7 cursor-pointer items-center gap-1.5 rounded-[8px] bg-fill px-[10px] text-[12.5px] font-medium leading-4 text-ink hover:bg-[#ECECE9]"
                    >
                      <Icon name="plus" size={13} strokeWidth={1.6} />
                      Add addresses
                    </button>
                  }
                />
              ) : (
                <CheckRow
                  lead={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF5EF]">
                      <Icon name="check" size={14} strokeWidth={1.8} color="#1E8A58" />
                    </span>
                  }
                  title="Every address found"
                  sub="Letters and gifts go to all 48"
                  action={<span className="text-[12.5px] font-medium leading-4 text-green-text">Done</span>}
                />
              )}
            </div>
          </div>

          {/* Launch card */}
          <aside className="sticky top-[88px] self-start max-h-[calc(100vh-112px)] overflow-y-auto overscroll-contain [scrollbar-width:thin] flex w-[384px] shrink-0 flex-col rounded-card bg-white shadow-panel">
            <div className="flex flex-col gap-6 p-6">
              <div className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-ink">Launch</div>
              <div className="flex flex-col gap-2">
                <span className="text-[12.5px] font-medium leading-4 text-grey-1">Starts</span>
                <StartPicker value={start} onChange={setStart} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between pb-2">
                  <span className="text-[13px] font-medium leading-4 text-grey-1">Loop rules</span>
                  <Link to="/blank/rules" className="text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
                    Edit
                  </Link>
                </div>
                {rules.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-center gap-3 border-t border-line-soft py-[10px]">
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[13px] font-medium leading-4 text-ink">{r.title}</span>
                      <span className="text-[12px] leading-4 text-grey-3">{r.sub}</span>
                    </span>
                    <RuleToggle on={r.on} onChange={() => toggleRule(r.id)} label={r.title} />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-line-soft px-6 pb-6 pt-4">
              <button
                onClick={() => navigate('/live/results')}
                disabled={locked}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-[12px] text-[14.5px] font-semibold leading-4',
                  launchStyle(locked, sheetOpen),
                )}
              >
                Launch loop
                <Icon name="arrowRight" size={15} strokeWidth={1.7} />
              </button>
              <p className="text-center text-[12.5px] leading-4 text-grey-3">
                {unlockNote(budgetBlocks, linkedinBlocks)}
              </p>
            </div>
          </aside>
        </div>
      </main>

      <AddAddressesSheet open={sheetOpen} onClose={() => setSheet(false)} onSave={handleAddressesSaved} />
    </div>
  )
}

/* ── Storyboard: one person's loop ───────────────────────────── */

function Storyboard({ person, index, onPerson }: { person: Recipient; index: number; onPerson: (i: number) => void }) {
  const preview = (step: string) => `/loop/preview?person=${person.id}&step=${step}`
  return (
    <div className="flex flex-col gap-5 rounded-card bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold leading-5 text-ink">Preview one person’s loop</span>
          <span className="text-[12.5px] leading-4 text-grey-3">All 48 get their own version. This one is {person.first}’s.</span>
        </div>
        <PersonSwitcher index={index} onChange={onPerson} size="sm" />
      </div>
      <div className="flex gap-3">
        <Frame day="Day 0" date="Mon 26 Oct" caption="Intro email" to={preview('email')}>
          <div className="flex h-[132px] flex-col gap-2 rounded-[12px] bg-page p-3">
            <span className="flex items-center gap-1.5 text-[11.5px] leading-[14px] text-grey-3">
              <GmailSmall />
              From Sam
            </span>
            <span className="text-[12.5px] font-semibold leading-4 text-ink">Quick idea for {person.short}</span>
            <span className="text-[12px] leading-[17px] text-grey-2">
              Hi {person.first}, saw {person.short} {person.news}…
            </span>
          </div>
        </Frame>
        <Frame day="Day 2" date="Wed 28 Oct" caption="LinkedIn, or a bump" to={preview('linkedin')}>
          <div className="flex h-[132px] flex-col gap-2 rounded-[12px] bg-page p-3">
            <span className="flex items-center gap-1.5 text-[11.5px] leading-[14px] text-grey-3">
              <span className="flex h-[14px] w-[14px] items-center justify-center rounded-[3px] bg-linkedin text-[8.5px] font-bold leading-[10px] text-white">
                in
              </span>
              If {person.pronoun} opened
            </span>
            <div className="rounded-[10px] rounded-bl-[2px] bg-white px-[10px] py-2 shadow-[0_0_0_1px_#EBEBE8]">
              <span className="text-[12px] leading-[17px] text-[#33353C]">
                Hi {person.first}, sent you a note on Monday. Would love to connect.
              </span>
            </div>
          </div>
        </Frame>
        <Frame day="Day 3" date="Thu 29 Oct" caption="Postcard, lands 30–31" to={preview('postcard')}>
          <img src={asset(GIFT.postcard)} alt="" className="h-[132px] w-full rounded-[12px] object-cover" />
        </Frame>
        <Frame day="Day 5" date="Sat 31 Oct" caption="Soy candle, by Wed 4 Nov" to={preview('gift')}>
          <img src={asset(GIFT.g5)} alt="" className="h-[132px] w-full rounded-[12px] object-cover" />
        </Frame>
      </div>
    </div>
  )
}

function Frame({ day, date, caption, to, children }: { day: string; date: string; caption: string; to: string; children: ReactNode }) {
  return (
    <Link to={to} className="group flex min-w-0 flex-1 flex-col gap-[10px]">
      <span className="flex items-baseline gap-1.5">
        <span className="text-[12.5px] font-semibold leading-4 text-ink">{day}</span>
        <span className="text-[12px] leading-4 text-grey-3">{date}</span>
      </span>
      <span className="block rounded-[12px] transition-shadow group-hover:shadow-[0_0_0_1px_#DCD8FD,0_6px_16px_-8px_rgba(17,18,22,.18)]">
        {children}
      </span>
      <span className="text-[12.5px] font-medium leading-4 text-ink">{caption}</span>
    </Link>
  )
}

function GmailSmall() {
  return (
    <svg width="14" height="11" viewBox="0 0 24 18" aria-hidden>
      <path d="M1.6 18h3.8V8.7L0 4.6v11.8C0 17.3.7 18 1.6 18z" fill="#4285F4" />
      <path d="M18.6 18h3.8c.9 0 1.6-.7 1.6-1.6V4.6l-5.4 4.1V18z" fill="#34A853" />
      <path d="M18.6 1.6v7.1L24 4.6V2.4c0-2-2.3-3.1-3.9-1.9l-1.5 1.1z" fill="#FBBC04" />
      <path d="M5.4 8.7V1.6L12 6.5l6.6-4.9v7.1L12 13.6 5.4 8.7z" fill="#EA4335" />
      <path d="M0 2.4v2.2l5.4 4.1V1.6L3.9.5C2.3-.7 0 .4 0 2.4z" fill="#C5221F" />
    </svg>
  )
}

/* ── Checklist ───────────────────────────────────────────────── */

function CheckRow({ lead, title, sub, action, first }: { lead: ReactNode; title: string; sub: ReactNode; action: ReactNode; first?: boolean }) {
  return (
    <div className={cn('flex items-center gap-[14px] py-4', !first && 'border-t border-line-soft')}>
      <span className="flex h-9 w-12 shrink-0 items-center justify-center">{lead}</span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[13.5px] font-medium leading-4 text-ink">{title}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">{sub}</span>
      </span>
      {action}
    </div>
  )
}

/** 07a blocker rows: a touch larger than the resolved rows. */
function BlockRow({ lead, title, sub, action, first }: { lead: ReactNode; title: string; sub: ReactNode; action: ReactNode; first?: boolean }) {
  return (
    <div className={cn('flex items-center gap-[14px] py-5', !first && 'border-t border-line-soft')}>
      <span className="flex w-12 shrink-0 items-center justify-center">{lead}</span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[14px] font-medium leading-[18px] text-ink">{title}</span>
        <span className="text-[13px] leading-[18px]">{sub}</span>
      </span>
      {action}
    </div>
  )
}

function LinkedInCheck({ state, onAsk }: { state: 'missing' | 'asked' | 'connected'; onAsk: () => void }) {
  return (
    <BlockRow
      lead={
        <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-linkedin text-[14px] font-bold leading-4 text-white">in</span>
      }
      title="Sam’s LinkedIn isn’t connected"
      sub={
        <span className="text-amber-text">
          {state === 'asked' ? 'Blocks launch. Asked Sam in Slack, waiting for him to connect…' : 'Blocks launch. The day 2 LinkedIn note needs it.'}
        </span>
      }
      action={
        <button
          onClick={onAsk}
          disabled={state !== 'missing'}
          className="flex h-8 cursor-pointer items-center rounded-[9px] bg-white px-3 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover disabled:cursor-default disabled:text-grey-3"
        >
          {state === 'missing' ? 'Ask Sam to connect' : 'Asked'}
        </button>
      }
    />
  )
}

function BudgetWaiting({ state, onNudge }: { state: 'waiting' | 'nudged' | 'approved'; onNudge: () => void }) {
  return (
    <BlockRow
      first
      lead={
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECEBE7] text-[12px] font-semibold leading-[14px] text-grey-1">
          AM
        </span>
      }
      title="Budget needs Arjun’s OK"
      sub={<span className="text-amber-text">Blocks launch. $3,474 is over your $2,500 limit.</span>}
      action={
        <button
          onClick={onNudge}
          disabled={state !== 'waiting'}
          title="Nudge Arjun in Slack"
          className="cursor-pointer text-[13px] leading-4 text-grey-3 underline-offset-2 hover:text-grey-1 hover:underline disabled:cursor-default disabled:no-underline"
        >
          {state === 'waiting' ? 'Asked in Slack, 20 min ago' : 'Nudged Arjun just now'}
        </button>
      }
    />
  )
}

// While the addresses sheet is open its save is the only primary, so Launch drops to secondary.
function launchStyle(locked: boolean, sheetOpen: boolean) {
  if (locked) return 'cursor-not-allowed bg-[#EDEDEA] text-[#9C9DA5]'
  if (sheetOpen) return 'cursor-pointer bg-white text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover'
  return 'cursor-pointer bg-violet text-white shadow-primary hover:bg-[#5A4EF0]'
}

function unlockNote(budget: boolean, linkedin: boolean) {
  if (budget && linkedin) return 'Unlocks when Arjun approves the budget and Sam connects LinkedIn.'
  if (budget) return 'Unlocks when Arjun approves the budget.'
  if (linkedin) return 'Unlocks when Sam connects LinkedIn.'
  return 'Pause any time before Sat 31 Oct and pay nothing for gifts.'
}

function MissingFaces({ extra }: { extra: number }) {
  return (
    <span className="relative h-9 w-12">
      {MISSING_FACES.map((id, i) => (
        <span key={id} className="absolute top-1.5 rounded-full shadow-[0_0_0_2px_#fff]" style={{ left: i * 12 }}>
          <Avatar id={id} size={24} />
        </span>
      ))}
      {extra > 0 && (
        <span className="absolute left-6 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-bg text-[10px] font-semibold leading-3 text-amber-text shadow-[0_0_0_2px_#fff]">
          +{extra}
        </span>
      )}
    </span>
  )
}

/* ── Launch card bits ────────────────────────────────────────── */

function StartPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 text-left shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover"
      >
        <Icon name="calendar" size={16} strokeWidth={1.4} color="#55575F" />
        <span className="flex-1 text-[13.5px] font-medium leading-4 text-ink">{value}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">their time</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-[12px] bg-white p-1.5 shadow-pop">
          {START_OPTIONS.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between rounded-[8px] px-2.5 py-2 text-[13px] leading-4 text-ink',
                o === value ? 'bg-fill font-medium' : 'hover:bg-fill-hover',
              )}
            >
              {o}
              {o === value && <Icon name="check" size={14} color="#6559F7" />}
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
      className={cn(
        'flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-[9px] p-0.5 transition-colors',
        on ? 'justify-end bg-violet' : 'justify-start bg-line-strong',
      )}
    >
      <span className="h-[14px] w-[14px] rounded-[7px] bg-white shadow-[0_1px_2px_rgba(17,18,22,.2)]" />
    </button>
  )
}
