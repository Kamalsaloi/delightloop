import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Toggle } from '@/components/ui'
import { ChevronRightSmall, HubSpotDot, OutlineAction, PersonAvatar, ProfilePanel, SourceMark } from '@/components/audience'
import { FloatingPanel } from '@/components/panels/FloatingPanel'
import { SIGNAL_ACCOUNTS, SIGNAL_TITLES, SIGNALS } from '@/data/catalog'
import { personBySlug, type Person } from '@/data/people'
import { cn } from '@/lib/cn'
import { DAY, fmtDay } from '@/lib/time'
import { useStore } from '@/store/store'
import type { Loop, SignalAudience as Signal } from '@/store/types'

type Wait = 7 | 14 | 30

type Match = { slug: string; title: string; event: string; joins: string }

/** When each match happened, in days before today, and what it was. */
const EVENTS: Record<string, { ago: number; what: string }> = {
  tom: { ago: 11, what: 'Promoted from Director' },
  ethan: { ago: 7, what: 'Moved from Orbital' },
  sofia: { ago: 0, what: 'Started today' },
  meera: { ago: 16, what: 'Deal went quiet' },
  daniel: { ago: 15, what: 'Deal went quiet' },
}
const TITLES = SIGNAL_TITLES
const ACCOUNTS = SIGNAL_ACCOUNTS

/** 03a · Always-on audience: a rule, not a list. Every choice is saved on the loop. */
export function SignalAudience({ loop }: { loop: Loop }) {
  const setSignal = useStore((st) => st.setSignal)
  const clock = useStore((st) => st.clock)
  const [profile, setProfile] = useState<string | null>(null)
  const sig = loop.audience.signal!
  const set = (p: Partial<Signal>) => setSignal(loop.id, p)
  const matches: Match[] = sig.matches.map((slug) => {
    const p = personBySlug(slug)
    const e = EVENTS[slug] ?? { ago: 3, what: 'Matched the signal' }
    const at = clock - e.ago * DAY
    return { slug, title: p ? `${p.role}, ${p.company}` : '', event: `${e.what}, ${fmtDay(at)}`, joins: fmtDay(at + sig.wait * DAY) }
  })
  const profilePerson = profile ? personBySlug(profile) : undefined
  const idx = matches.findIndex((m) => m.slug === profile)

  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">{loop.audience.title}</h1>
          <p className="text-[14px] leading-5 text-grey-2">An always-on audience. People join when the signal fires, not from a fixed list.</p>
        </div>

        <div className="flex flex-col rounded-card bg-white shadow-card">
          <div className="flex flex-col gap-4 px-7 pb-6 pt-7">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-[10px]">
              <Word>Anyone who</Word>
              <RulePicker value={sig.signal} options={SIGNALS} onChange={(signal) => set({ signal })} icon={<SourceMark source="linkedin" size={18} />} />
              <Word>as</Word>
              <RulePicker value={sig.title} options={TITLES} onChange={(title) => set({ title })} />
              <Word>at your</Word>
              <RulePicker value={sig.accounts} options={ACCOUNTS} onChange={(accounts) => set({ accounts })} icon={<HubSpotDot size={18} />} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] leading-[18px] text-grey-3">Skip anyone</span>
              {sig.skipDeals && (
                <span className="flex h-7 items-center gap-1.5 rounded-[8px] bg-fill px-[10px] text-[13px] font-medium leading-4 text-ink">
                  already in an open deal
                  <button onClick={() => set({ skipDeals: false })} aria-label="Remove condition" className="cursor-pointer">
                    <svg width="10" height="10" viewBox="0 0 16 16">
                      <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#8B8D95" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              )}
              {!sig.skipDeals && (
                <button onClick={() => set({ skipDeals: true })} className="flex h-7 cursor-pointer items-center gap-1 px-2 text-[13px] font-medium leading-4 text-violet-link hover:underline">
                  <svg width="11" height="11" viewBox="0 0 16 16">
                    <path d="M8 3v10M3 8h10" fill="none" stroke="#5A3FE6" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Add condition
                </button>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2 border-t border-line-soft px-7 py-4">
            <span className="text-[13.5px] font-semibold leading-[18px] text-ink">{matches.length + 3} match right now</span>
            <span className="text-[13px] leading-[18px] text-grey-3">About 2 a week over the last 6 months</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold leading-5 text-ink">Already match</span>
            <span className="text-[13px] leading-[18px] text-grey-3">They enter after the {sig.wait}-day wait</span>
          </div>
          <div className="flex gap-4">
            {matches.map((m) => (
              <MatchCard key={m.slug} match={m} person={personBySlug(m.slug)!} selected={profile === m.slug} onProfile={() => setProfile(m.slug)} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-[360px] shrink-0 flex-col gap-4">
        <PacingCard sig={sig} onChange={set} />
      </div>

      <FloatingPanel open={!!profilePerson} onClose={() => setProfile(null)} testId="profile">
        {profilePerson && (
          <ProfilePanel
            key={profilePerson.slug}
            person={profilePerson}
            backLabel="Matches"
            position={`${idx + 1} of ${matches.length}`}
            onClose={() => setProfile(null)}
            onPrev={idx > 0 ? () => setProfile(matches[idx - 1].slug) : undefined}
            onNext={idx < matches.length - 1 ? () => setProfile(matches[idx + 1].slug) : undefined}
          />
        )}
      </FloatingPanel>
    </div>
  )
}

function Word({ children }: { children: ReactNode }) {
  return <span className="text-[20px] font-medium leading-7 tracking-[-0.01em] text-grey-3">{children}</span>
}

function Chevron({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <path d="M4 6l4 4 4-4" fill="none" stroke="#8B8D95" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Inline rule token that opens a small option menu. */
function RulePicker({ value, options, onChange, icon }: { value: string; options: string[]; onChange: (v: string) => void; icon?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[38px] cursor-pointer items-center gap-2 rounded-[10px] bg-white px-3 shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover"
      >
        {icon}
        <span className="text-[18px] font-semibold leading-6 tracking-[-0.01em] text-ink">{value}</span>
        <Chevron />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-20 flex min-w-full flex-col rounded-[12px] bg-white p-1 shadow-pop animate-[fade_.12s_ease-out]">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className={cn(
                'cursor-pointer whitespace-nowrap rounded-[8px] px-3 py-2 text-left text-[13.5px] leading-[18px] hover:bg-fill',
                o === value ? 'font-semibold text-ink' : 'text-grey-1',
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, person, selected, onProfile }: { match: Match; person: Person; selected: boolean; onProfile: () => void }) {
  return (
    <div
      className={cn(
        'group flex min-w-0 flex-1 flex-col rounded-[16px] bg-white transition-shadow',
        selected
          ? 'shadow-[0_0_0_1.5px_#6559F7]'
          : 'shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A] hover:shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D,0_10px_24px_-14px_#1112162E]',
      )}
    >
      <div className="flex flex-col gap-[14px] px-[18px] pb-4 pt-[18px]">
        <div className="flex items-center gap-3">
          <PersonAvatar person={person} size={40} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[14px] font-semibold leading-[18px] text-ink">{person.name}</span>
            <span className="text-[12.5px] leading-4 text-grey-3">{match.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <SourceMark source="linkedin" size={14} />
          <span className="text-[12.5px] leading-4 text-grey-1">{match.event}</span>
        </div>
      </div>
      <div className="border-t border-line-soft">
        <div className="flex items-center justify-between px-[18px] py-[14px] text-[12.5px] leading-4 group-hover:hidden">
          <span className="text-grey-3">Joins the loop</span>
          <span className="font-semibold text-ink">{match.joins}</span>
        </div>
        <div className="hidden items-center justify-between py-2 pl-[18px] pr-3 group-hover:flex">
          <span className="text-[12.5px] leading-4 text-grey-3">Joins {match.joins}</span>
          <OutlineAction onClick={onProfile} trailing={<ChevronRightSmall size={11} />} className="!h-7 !px-[10px]">
            Behavioural profile
          </OutlineAction>
        </div>
      </div>
    </div>
  )
}

function PacingCard({ sig, onChange }: { sig: Signal; onChange: (p: Partial<Signal>) => void }) {
  const wait = sig.wait
  const onWait = (w: Wait) => onChange({ wait: w })
  const perWeek = sig.perWeek
  const setPerWeek = (f: (n: number) => number) => onChange({ perWeek: f(sig.perWeek) })
  const budget = sig.monthlyBudget
  const setBudget = (v: string) => onChange({ monthlyBudget: v })
  const noRepeat = sig.noRepeat
  const setNoRepeat = (v: boolean) => onChange({ noRepeat: v })
  const monthly = Math.round(perWeek * 4.3 * 60)

  return (
    <div className="flex flex-col rounded-card bg-white shadow-card">
      <div className="flex flex-col gap-1 border-b border-line-soft px-6 pb-[18px] pt-[22px]">
        <span className="text-[15px] font-semibold leading-5 text-ink">Pacing</span>
        <span className="text-[13px] leading-[18px] text-grey-3">So an always-on loop never surprises you</span>
      </div>

      <div className="flex flex-col gap-[14px] border-b border-line-soft px-6 py-[18px]">
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] font-medium leading-[18px] text-ink">Wait after they start</span>
          <div className="flex gap-0.5 rounded-[8px] bg-fill p-0.5">
            {([7, 14, 30] as Wait[]).map((w) => (
              <button
                key={w}
                onClick={() => onWait(w)}
                className={cn(
                  'flex h-[26px] cursor-pointer items-center rounded-[6px] px-[9px] text-[12.5px] leading-4',
                  w === wait ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_#1112160F]' : 'font-medium text-grey-2 hover:text-ink',
                )}
              >
                {w}d
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center">
            <span className="h-2 w-2 shrink-0 rounded-full bg-ink" />
            <span className="h-0 flex-1 border-t-[1.5px] border-dashed border-grey-4" />
            <span className="h-2 w-2 shrink-0 rounded-full bg-violet" />
          </div>
          <div className="flex justify-between text-[12px] leading-4">
            <span className="text-grey-2">Starts the role</span>
            <span className="text-grey-3">{wait} days</span>
            <span className="font-medium text-ink">First step</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-6 py-[18px]">
        <Labelled title="At most per week" sub="Extra people wait their turn" />
        <div className="flex h-8 items-center rounded-[9px] shadow-[inset_0_0_0_1px_#E4E4E1]">
          <StepBtn label="Fewer" path="M3.5 8h9" onClick={() => setPerWeek((n) => Math.max(1, n - 1))} />
          <span className="w-[58px] shrink-0 text-center text-[13px] font-semibold leading-4 text-ink">{perWeek} people</span>
          <StepBtn label="More" path="M8 3.5v9M3.5 8h9" onClick={() => setPerWeek((n) => Math.min(20, n + 1))} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-line-soft px-6 py-[18px]">
        <div className="flex items-center justify-between gap-3">
          <Labelled title="Monthly gift budget" sub="Pauses gifts when it runs out" />
          <label className="flex h-8 items-center gap-1 rounded-[9px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]">
            <span className="text-[13px] leading-4 text-grey-3">$</span>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-transparent text-[13px] font-semibold leading-4 text-ink outline-none"
              style={{ width: Math.max(budget.length, 1) * 7 }}
            />
          </label>
        </div>
        <p className="text-[12.5px] leading-[18px] text-grey-2">
          At up to {Math.round(perWeek * 4.3)} a month and gifts around $60, that’s roughly ${monthly.toLocaleString('en-US')} a month.{' '}
          {monthly <= Number(budget.replace(/[^0-9]/g, '')) ? 'You have room.' : 'That’s over the budget, extra people wait.'}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 px-6 pb-[22px] pt-[18px]">
        <Labelled title="No repeat gifts" sub="Skip anyone gifted in the last 90 days" />
        <Toggle on={noRepeat} onChange={setNoRepeat} label="No repeat gifts" />
      </div>
    </div>
  )
}

function Labelled({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[13.5px] font-medium leading-[18px] text-ink">{title}</span>
      <span className="text-[12.5px] leading-4 text-grey-3">{sub}</span>
    </div>
  )
}

function StepBtn({ label, path, onClick }: { label: string; path: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex h-8 w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[9px] hover:bg-fill">
      <svg width="11" height="11" viewBox="0 0 16 16">
        <path d={path} fill="none" stroke="#55575F" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}
