import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { FACES } from '@/data/people'
import { asset } from '@/lib/assets'
import { SoftAction, SourceMark } from './marks'

export type CustomersState = 'open' | 'removed' | 'kept'

type Props = {
  title: string
  count: number
  total: number
  countLabel: string // "can get every step"
  addressHint: string
  addressHintTone?: 'amber' | 'grey'
  customers: CustomersState
  onCustomers: (s: CustomersState) => void
  onAddAddresses: () => void
  /** Last check row (LinkedIn handled / left the company). */
  last: ReactNode
}

/** "Before you build" / "About these people" card: readiness bar plus the checks to resolve. */
export function ChecksCard({ title, count, total, countLabel, addressHint, addressHintTone = 'amber', customers, onCustomers, onAddAddresses, last }: Props) {
  return (
    <div className="flex flex-col rounded-card bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-line-soft p-6">
        <span className="text-[15px] font-semibold leading-5 text-ink">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-semibold leading-8 tracking-[-0.02em] text-ink">{count}</span>
          <span className="text-[13.5px] leading-5 text-grey-2">
            of {total} {countLabel}
          </span>
        </div>
        <div className="flex h-1.5 shrink-0 gap-[3px]">
          <div className="rounded-[3px] bg-green" style={{ flex: `${count} 1 0px` }} />
          <div className="rounded-[3px] bg-[#F2C46B]" style={{ flex: `${total - count} 1 0px` }} />
        </div>
      </div>

      <div className="flex flex-col px-6 py-1">
        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-3">
            <FaceStack />
            <CheckText title="7 addresses Gifty couldn’t find" sub={addressHint} subClass={addressHintTone === 'amber' ? 'text-amber-text' : 'text-grey-3'} />
          </div>
          <div className="flex gap-2 pl-[60px]">
            <SoftAction icon onClick={onAddAddresses}>
              Add addresses
            </SoftAction>
          </div>
        </div>

        <CustomersCheck state={customers} onChange={onCustomers} />

        {last}
      </div>
    </div>
  )
}

function CustomersCheck({ state, onChange }: { state: CustomersState; onChange: (s: CustomersState) => void }) {
  const face = (
    <span className="flex h-7 w-12 shrink-0 items-center justify-center">
      <img src={asset(FACES.meera)} alt="" className="h-7 w-7 rounded-full object-cover" />
    </span>
  )

  if (state === 'removed') {
    return (
      <SingleCheck icon={face} title="2 customers removed" sub="Orbital and Quanta won’t get this loop">
        <button onClick={() => onChange('open')} className="cursor-pointer text-violet-link hover:underline">
          Undo
        </button>
      </SingleCheck>
    )
  }
  if (state === 'kept') {
    return (
      <SingleCheck icon={face} title="2 are already customers" sub="Kept in. Gifty mentions the renewal">
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
        <CheckText title="2 are already customers" sub="Orbital and Quanta renewed this year" />
      </div>
      <div className="flex gap-2 pl-[60px]">
        <SoftAction onClick={() => onChange('removed')}>Remove both</SoftAction>
        <button
          onClick={() => onChange('kept')}
          className="flex h-7 cursor-pointer items-center rounded-[8px] px-[10px] text-[12.5px] font-medium leading-4 text-grey-1 hover:bg-fill"
        >
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

/** LinkedIn tile in the 48px icon slot. */
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

function FaceStack() {
  const ring = 'absolute top-0.5 h-6 w-6 rounded-full shadow-[0_0_0_2px_#FFFFFF]'
  return (
    <div className="relative h-7 w-12 shrink-0">
      <img src={asset(FACES.meera)} alt="" className={cn(ring, 'left-0 object-cover')} />
      <img src={asset(FACES.tom)} alt="" className={cn(ring, 'left-3 object-cover')} />
      <span className={cn(ring, 'left-6 flex items-center justify-center bg-amber-bg text-[10px] font-semibold leading-3 text-amber-text')}>+5</span>
    </div>
  )
}
