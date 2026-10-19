import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { subtitle, type Person } from '@/data/people'
import { PanelFrame } from '@/components/panels/FloatingPanel'
import { OutlineAction, PersonAvatar } from './marks'

type Props = {
  missing: Person[]
  onClose: () => void
  /** slug → address line. */
  onSave: (lines: Record<string, string>) => void
  onAsk: (person: Person) => void
}

const SHOWN = 3

/** 03e: resolve the addresses Gifty couldn't find. Choose an office, type one, or send something digital. */
export function AddAddressesSheet({ missing, onClose, onSave, onAsk }: Props) {
  const [lines, setLines] = useState<Record<string, string>>({})
  const [typing, setTyping] = useState<Record<string, boolean>>({})
  const [asked, setAsked] = useState<Record<string, boolean>>({})
  const [showMore, setShowMore] = useState(false)
  const [dontHold, setDontHold] = useState(true)
  const resolved = Object.entries(lines).filter(([, v]) => v.trim())
  const count = resolved.length
  const shown = showMore ? missing : missing.slice(0, SHOWN)
  const rest = missing.length - SHOWN

  function set(slug: string, v: string) {
    setLines((l) => ({ ...l, [slug]: v }))
  }

  function block(p: Person) {
    const hint = p.addressHint
    const value = lines[p.slug] ?? ''
    return (
      <Block key={p.slug} className={cn('gap-3', hint?.options && 'bg-[#FCFCFB]')}>
        <PersonLine person={p} status={asked[p.slug] ? 'Asked the account owner' : hint?.waitingOn ? `Waiting on ${hint.waitingOn}` : value && !typing[p.slug] ? 'Ready to save' : undefined} />
        <Note>{hint?.note ?? 'No home or office address anywhere public.'}</Note>
        {hint?.options ? (
          <div className="flex flex-col gap-1.5">
            {hint.options.map((o) => (
              <RadioOption key={o.id} title={o.title} sub={o.sub} selected={value === o.title} onSelect={() => set(p.slug, value === o.title ? '' : o.title)} />
            ))}
          </div>
        ) : typing[p.slug] ? (
          <input
            autoFocus
            data-testid={`address-input-${p.slug}`}
            value={value}
            onChange={(e) => set(p.slug, e.target.value)}
            placeholder="Street, city, postcode"
            className="h-[34px] rounded-[8px] px-3 text-[13px] leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] outline-none placeholder:text-grey-3 focus:shadow-[inset_0_0_0_1.5px_#6559F7]"
          />
        ) : value ? (
          <div className="flex items-center justify-between rounded-[8px] bg-page px-3 py-2">
            <span className="text-[13px] leading-4 text-ink">{value}</span>
            <button onClick={() => set(p.slug, '')} className="cursor-pointer text-[12.5px] font-medium leading-4 text-grey-2 hover:text-ink">
              Undo
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <OutlineAction raised={false} onClick={() => setTyping((t) => ({ ...t, [p.slug]: true }))}>
              Type it in
            </OutlineAction>
            {!hint?.waitingOn && (
              <OutlineAction
                raised={false}
                onClick={() => {
                  setAsked((a) => ({ ...a, [p.slug]: true }))
                  onAsk(p)
                }}
              >
                {asked[p.slug] ? 'Asked' : 'Ask the account owner'}
              </OutlineAction>
            )}
            <button onClick={() => set(p.slug, 'Digital gift, no address needed')} className="flex h-[30px] cursor-pointer items-center px-3 text-[12.5px] font-medium leading-4 text-grey-2 hover:text-ink">
              Send a digital gift
            </button>
          </div>
        )}
      </Block>
    )
  }

  return (
    <PanelFrame
      header={
        <div className="flex flex-col gap-1.5 border-b border-line-soft px-6 pb-5 pt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold leading-[26px] tracking-[-0.015em] text-ink">
              {missing.length ? `${missing.length} ${missing.length === 1 ? 'address' : 'addresses'} to add` : 'Every address found'}
            </h2>
            <button onClick={onClose} aria-label="Close" data-testid="panel-close" className="-m-0.5 cursor-pointer rounded-[6px] p-0.5 hover:bg-fill">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#6E6F7C" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="text-[13.5px] leading-5 text-grey-2">Gifty checked LinkedIn, past deliveries and company offices. These are the ones it couldn’t pin down. Only the letter and gift need one.</p>
        </div>
      }
      footer={
        <div className="flex flex-col gap-4 border-t border-line px-6 pb-7 pt-5">
          <button onClick={() => setDontHold((v) => !v)} className="flex cursor-pointer items-start gap-2.5 text-left">
            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]', dontHold ? 'bg-violet' : 'bg-white shadow-[inset_0_0_0_1.5px_#D4D4D0]')}>
              {dontHold && (
                <svg width="10" height="10" viewBox="0 0 16 16">
                  <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-[13px] leading-[18px] text-[#33353C]">Don’t hold the loop for these. They get the email and LinkedIn steps now, and the gift steps once an address comes in.</span>
          </button>
          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="flex h-[38px] cursor-pointer items-center rounded-[10px] px-[14px] text-[13.5px] font-medium leading-4 text-grey-1 hover:bg-fill">
              Later
            </button>
            <button
              data-testid="save-addresses"
              onClick={() => onSave(Object.fromEntries(resolved))}
              disabled={count === 0}
              className="flex h-[38px] cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-4 text-[13.5px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Save {count} address{count === 1 ? '' : 'es'}
            </button>
          </div>
        </div>
      }
    >
      {shown.map(block)}
      {rest > 0 && (
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-[13px] leading-[18px] text-grey-2">{showMore ? `All ${missing.length} shown` : `${rest} more, all fully remote`}</span>
          <button onClick={() => setShowMore((v) => !v)} className="cursor-pointer text-[13px] font-medium leading-4 text-violet-link hover:underline">
            {showMore ? 'Hide' : 'Show'}
          </button>
        </div>
      )}
      {missing.length === 0 && <p className="px-6 py-6 text-[13.5px] leading-5 text-grey-2">Nothing to add. Every letter and gift has somewhere to go.</p>}
    </PanelFrame>
  )
}

function Block({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-col border-b border-line-soft px-6 py-5', className)}>{children}</div>
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-[18px] text-[#33353C]">{children}</p>
}

function PersonLine({ person, status }: { person: Person; status?: string }) {
  return (
    <div className="flex items-center gap-3">
      <PersonAvatar person={person} size={36} />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[14px] font-semibold leading-[18px] text-ink">{person.name}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">{subtitle(person)}</span>
      </div>
      {status && <span className={cn('text-[12.5px] font-medium leading-4', status === 'Ready to save' ? 'text-green-text' : 'text-amber-text')}>{status}</span>}
    </div>
  )
}

function RadioOption({ title, sub, selected, onSelect }: { title: string; sub: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn('flex cursor-pointer items-center gap-3 rounded-[10px] bg-white px-[14px] py-3 text-left transition-shadow', selected ? 'shadow-[inset_0_0_0_1.5px_#6559F7]' : 'shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover')}
    >
      <span className={cn('h-4 w-4 shrink-0 rounded-full', selected ? 'shadow-[inset_0_0_0_4.5px_#6559F7]' : 'shadow-[inset_0_0_0_1.5px_#D4D4D0]')} />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-medium leading-4 text-ink">{title}</span>
        <span className="text-[12px] leading-4 text-grey-3">{sub}</span>
      </span>
    </button>
  )
}
