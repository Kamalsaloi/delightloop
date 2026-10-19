import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { personBySlug, subtitle, type Person } from '@/data/people'
import { OutlineAction, PersonAvatar } from './marks'

type Props = {
  open: boolean
  onClose: () => void
  /** Called with how many addresses were saved, before closing. */
  onSave?: (count: number) => void
}

const MEERA_OPTIONS = [
  { id: 'indiranagar', title: 'Indiranagar office, Bengaluru', sub: 'Where the sales team sits, from 4 team posts' },
  { id: 'bkc', title: 'BKC head office, Mumbai', sub: 'Registered address' },
]

// The "4 more, all fully remote" behind Show.
const MORE: Pick<Person, 'name' | 'role' | 'company' | 'initials'>[] = [
  { name: 'Nina Alvarez', role: 'VP Sales', company: 'Corvid', initials: 'NA' },
  { name: 'Raj Patel', role: 'Head of Sales', company: 'Sundial', initials: 'RP' },
  { name: 'Hana Kim', role: 'CRO', company: 'Pebble', initials: 'HK' },
  { name: 'Marco Rossi', role: 'VP Sales', company: 'Tidewater', initials: 'MR' },
]

/** 03e: right sheet to resolve the 7 missing addresses. Reused by 03, B0a and 07. */
export function AddAddressesSheet({ open, onClose, onSave }: Props) {
  const [meeraChoice, setMeeraChoice] = useState<string | null>('indiranagar')
  const [tomTyping, setTomTyping] = useState(false)
  const [tomAddress, setTomAddress] = useState('')
  const [askedOwner, setAskedOwner] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [dontHold, setDontHold] = useState(true)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const meera = personBySlug('meera')!
  const ethan = personBySlug('ethan')!
  const tom = personBySlug('tom')!
  const saveCount = (meeraChoice ? 1 : 0) + (tomAddress.trim() ? 1 : 0)

  function save() {
    onSave?.(saveCount)
    onClose()
  }

  return (
    // Floating card, no scrim: the page stays usable, so only ×, Later or Esc close it.
    <div
      role="dialog"
      aria-label="Addresses to add"
      data-scroll-panel className="fixed overscroll-contain right-12 top-[88px] z-50 flex max-h-[calc(100vh-112px)] w-[384px] flex-col overflow-clip rounded-card bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_20px_48px_-24px_#1112162E] animate-[slideIn_.2s_ease-out]"
    >
        <div className="flex flex-col gap-1.5 border-b border-line-soft px-6 pb-5 pt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold leading-[26px] tracking-[-0.015em] text-ink">7 addresses to add</h2>
            <button onClick={onClose} aria-label="Close" className="-m-0.5 cursor-pointer rounded-[6px] p-0.5 hover:bg-fill">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#6E6F7C" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="text-[13.5px] leading-5 text-grey-2">
            Gifty checked LinkedIn, past deliveries and company offices. These are the ones it couldn’t pin down. Only the letter and gift need one.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <Block className="gap-[14px] bg-[#FCFCFB]">
            <PersonLine person={meera} />
            <Note>Orbital has two offices and her profile doesn’t say which. Pick one.</Note>
            <div className="flex flex-col gap-1.5">
              {MEERA_OPTIONS.map((o) => (
                <RadioOption key={o.id} title={o.title} sub={o.sub} selected={meeraChoice === o.id} onSelect={() => setMeeraChoice(o.id)} />
              ))}
            </div>
          </Block>

          <Block className="gap-3">
            <PersonLine person={ethan} sub={`${subtitle(ethan)} · joined last week`} status="Waiting on Rahul" />
            <Note>Too new for Gifty to find. You asked Rahul, his account owner, on Slack an hour ago.</Note>
          </Block>

          <Block className="gap-3">
            <PersonLine person={tom} status={askedOwner ? 'Asked his account owner' : undefined} />
            <Note>Fully remote, and no home address anywhere public.</Note>
            {tomTyping ? (
              <input
                autoFocus
                value={tomAddress}
                onChange={(e) => setTomAddress(e.target.value)}
                placeholder="Street, city, postcode"
                className="h-[34px] rounded-[8px] px-3 text-[13px] leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] outline-none placeholder:text-grey-3 focus:shadow-[inset_0_0_0_1.5px_#6559F7]"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                <OutlineAction raised={false} onClick={() => setTomTyping(true)}>
                  Type it in
                </OutlineAction>
                <OutlineAction raised={false} onClick={() => setAskedOwner(true)}>
                  Ask his account owner
                </OutlineAction>
                <button className="flex h-[30px] cursor-pointer items-center px-3 text-[12.5px] font-medium leading-4 text-grey-2 hover:text-ink">
                  Send a digital gift
                </button>
              </div>
            )}
          </Block>

          {showMore &&
            MORE.map((p) => (
              <Block key={p.name} compact className="gap-3">
                <div className="flex items-center gap-3">
                  <PersonAvatar person={p} size={36} />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[14px] font-semibold leading-[18px] text-ink">{p.name}</span>
                    <span className="text-[12.5px] leading-4 text-grey-3">
                      {p.role}, {p.company} · fully remote
                    </span>
                  </div>
                  <OutlineAction raised={false}>Type it in</OutlineAction>
                </div>
              </Block>
            ))}

          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-[13px] leading-[18px] text-grey-2">4 more, all fully remote</span>
            <button onClick={() => setShowMore((v) => !v)} className="cursor-pointer text-[13px] font-medium leading-4 text-violet-link hover:underline">
              {showMore ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line px-6 pb-7 pt-5">
          <button onClick={() => setDontHold((v) => !v)} className="flex cursor-pointer items-start gap-2.5 text-left">
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]',
                dontHold ? 'bg-violet' : 'bg-white shadow-[inset_0_0_0_1.5px_#D4D4D0]',
              )}
            >
              {dontHold && (
                <svg width="10" height="10" viewBox="0 0 16 16">
                  <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-[13px] leading-[18px] text-[#33353C]">
              Don’t hold the loop for these. They get the email and LinkedIn steps now, and the gift steps once an address comes in.
            </span>
          </button>
          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="flex h-[38px] cursor-pointer items-center rounded-[10px] px-[14px] text-[13.5px] font-medium leading-4 text-grey-1 hover:bg-fill">
              Later
            </button>
            <button
              onClick={save}
              disabled={saveCount === 0}
              className="flex h-[38px] cursor-pointer items-center rounded-[10px] bg-violet px-4 text-[13.5px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0] disabled:cursor-default disabled:opacity-50"
            >
              Save {saveCount} address{saveCount === 1 ? '' : 'es'}
            </button>
          </div>
        </div>
    </div>
  )
}

function Block({ className, compact, children }: { className?: string; compact?: boolean; children: ReactNode }) {
  return <div className={cn('flex flex-col border-b border-line-soft px-6', compact ? 'py-4' : 'py-5', className)}>{children}</div>
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-[18px] text-[#33353C]">{children}</p>
}

function PersonLine({ person, sub, status }: { person: Person; sub?: string; status?: string }) {
  return (
    <div className="flex items-center gap-3">
      <PersonAvatar person={person} size={36} />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[14px] font-semibold leading-[18px] text-ink">{person.name}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">{sub ?? subtitle(person)}</span>
      </div>
      {status && <span className="text-[12.5px] font-medium leading-4 text-amber-text">{status}</span>}
    </div>
  )
}

function RadioOption({ title, sub, selected, onSelect }: { title: string; sub: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-[10px] bg-white px-[14px] py-3 text-left transition-shadow',
        selected ? 'shadow-[inset_0_0_0_1.5px_#6559F7]' : 'shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
      )}
    >
      <span
        className={cn('h-4 w-4 shrink-0 rounded-full', selected ? 'shadow-[inset_0_0_0_4.5px_#6559F7]' : 'shadow-[inset_0_0_0_1.5px_#D4D4D0]')}
      />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-medium leading-4 text-ink">{title}</span>
        <span className="text-[12px] leading-4 text-grey-3">{sub}</span>
      </span>
    </button>
  )
}
