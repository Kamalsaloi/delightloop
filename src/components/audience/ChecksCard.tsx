import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Person } from '@/data/people'
import type { CheckState } from '@/store/types'
import { PersonAvatar, SoftAction, SourceMark } from './marks'

type Props = {
  title: string
  count: number
  total: number
  countLabel: string
  addressHint: string
  addressHintTone?: 'amber' | 'grey'
  missing: Person[]
  customers: Person[]
  customersState: CheckState
  onCustomers: (s: CheckState) => void
  onAddAddresses: () => void
  /** Last check row (LinkedIn handled / left the company). */
  last?: ReactNode
}

/** "Before you build" / "About these people": readiness bar plus the checks to resolve. */
export function ChecksCard({ title, count, total, countLabel, addressHint, addressHintTone = 'amber', missing, customers, customersState, onCustomers, onAddAddresses, last }: Props) {
  return (
    <div className="flex flex-col rounded-card bg-white shadow-card" data-testid="checks-card">
      <div className="flex flex-col gap-3 border-b border-line-soft p-6">
        <span className="text-[15px] font-semibold leading-5 text-ink">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-semibold leading-8 tracking-[-0.02em] text-ink" data-testid="ready-count">
            {count}
          </span>
          <span className="text-[13.5px] leading-5 text-grey-2">
            of {total} {countLabel}
          </span>
        </div>
        <div className="flex h-1.5 shrink-0 gap-[3px]">
          <div className="rounded-[3px] bg-green transition-[flex-grow] duration-300" style={{ flex: `${count} 1 0px` }} />
          {total - count > 0 && <div className="rounded-[3px] bg-[#F2C46B] transition-[flex-grow] duration-300" style={{ flex: `${total - count} 1 0px` }} />}
        </div>
      </div>

      <div className="flex flex-col px-6 py-1">
        {missing.length > 0 ? (
          <div className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3">
              <FaceStack people={missing} />
              <CheckText title={`${missing.length} ${missing.length === 1 ? 'address' : 'addresses'} Gifty couldn’t find`} sub={addressHint} subClass={addressHintTone === 'amber' ? 'text-amber-text' : 'text-grey-3'} />
            </div>
            <div className="flex gap-2 pl-[60px]">
              <SoftAction icon onClick={onAddAddresses}>
                Add addresses
              </SoftAction>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-4">
            <span className="flex h-7 w-12 shrink-0 items-center justify-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF5EF]">
                <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
                  <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="#1E8A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
            <CheckText title="Every address found" sub="Letters and gifts can go to everyone" />
            <span className="shrink-0 text-[12.5px] font-medium leading-4 text-green-text">Done</span>
          </div>
        )}

        {(customers.length > 0 || customersState === 'removed') && <CustomersCheck state={customersState} people={customers} onChange={onCustomers} />}

        {last}
      </div>
    </div>
  )
}

function CustomersCheck({ state, people, onChange }: { state: CheckState; people: Person[]; onChange: (s: CheckState) => void }) {
  const face = (
    <span className="flex h-7 w-12 shrink-0 items-center justify-center">
      {people[0] ? <PersonAvatar person={people[0]} size={28} /> : <span className="h-7 w-7 rounded-full bg-fill" />}
    </span>
  )
  const names = people.map((p) => p.company.split(' ')[0]).join(' and ')
  if (state === 'removed') {
    return (
      <SingleCheck icon={face} title="Customers removed" sub="They won’t get this loop">
        <button onClick={() => onChange('open')} className="cursor-pointer text-violet-link hover:underline">
          Undo
        </button>
      </SingleCheck>
    )
  }
  if (state === 'kept') {
    return (
      <SingleCheck icon={face} title={`${people.length} are already customers`} sub="Kept in. Gifty mentions the renewal">
        <button onClick={() => onChange('open')} className="cursor-pointer text-green-text">
          Kept
        </button>
      </SingleCheck>
    )
  }
  return (
    <div className="flex flex-col gap-3 border-t border-line-soft py-4">
      <div className="flex items-center gap-3">
        {face}
        <CheckText title={`${people.length} ${people.length === 1 ? 'is' : 'are'} already ${people.length === 1 ? 'a customer' : 'customers'}`} sub={`${names} renewed this year`} />
      </div>
      <div className="flex gap-2 pl-[60px]">
        <SoftAction onClick={() => onChange('removed')}>{people.length === 2 ? 'Remove both' : `Remove ${people.length}`}</SoftAction>
        <button onClick={() => onChange('kept')} className="flex h-7 cursor-pointer items-center rounded-[8px] px-[10px] text-[12.5px] font-medium leading-4 text-grey-1 hover:bg-fill">
          Keep them
        </button>
      </div>
    </div>
  )
}

/** One-line check: icon slot, two lines of text, a trailing action/status. */
export function SingleCheck({ icon, title, sub, children }: { icon: ReactNode; title: string; sub: string; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-t border-line-soft py-4">
      {icon}
      <CheckText title={title} sub={sub} />
      {children && <div className="shrink-0 text-[12.5px] font-medium leading-4">{children}</div>}
    </div>
  )
}

export function LinkedInSlot() {
  return (
    <span className="flex h-7 w-12 shrink-0 items-center justify-center">
      <SourceMark source="linkedin" size={20} />
    </span>
  )
}

function CheckText({ title, sub, subClass = 'text-grey-3' }: { title: string; sub: string; subClass?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <span className="text-[13.5px] font-medium leading-4 text-ink">{title}</span>
      <span className={cn('text-[12.5px] leading-4', subClass)}>{sub}</span>
    </div>
  )
}

function FaceStack({ people }: { people: Person[] }) {
  const shown = people.slice(0, 2)
  const extra = people.length - shown.length
  return (
    <div className="relative h-7 w-12 shrink-0">
      {shown.map((p, i) => (
        <span key={p.slug} className="absolute top-0.5 rounded-full shadow-[0_0_0_2px_#FFFFFF]" style={{ left: i * 12 }}>
          <PersonAvatar person={p} size={24} />
        </span>
      ))}
      {extra > 0 && (
        <span className="absolute left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-bg text-[10px] font-semibold leading-3 text-amber-text shadow-[0_0_0_2px_#FFFFFF]">+{extra}</span>
      )}
    </div>
  )
}
