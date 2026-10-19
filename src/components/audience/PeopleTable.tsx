import { cn } from '@/lib/cn'
import { subtitle, type Person } from '@/data/people'
import { ChevronRightSmall, OutlineAction, PersonAvatar, SoftAction, SourceMark } from './marks'

export type PeopleFilter = 'everyone' | 'noAddress' | 'notOnLinkedIn' | 'customers'

export const FILTER_LABEL: Record<PeopleFilter, string> = {
  everyone: 'Everyone',
  noAddress: 'No address',
  notOnLinkedIn: 'Not on LinkedIn',
  customers: 'Customers',
}

const FILTERS: PeopleFilter[] = ['everyone', 'noAddress', 'notOnLinkedIn', 'customers']

export function matchesFilter(p: Person, f: PeopleFilter) {
  if (f === 'noAddress') return !!p.noAddress
  if (f === 'notOnLinkedIn') return !!p.notOnLinkedIn
  if (f === 'customers') return !!p.customer
  return true
}

type Props = {
  people: Person[]
  counts: Record<PeopleFilter, number>
  filter: PeopleFilter
  onFilter: (f: PeopleFilter) => void
  selected?: string | null
  onOpenProfile: (slug: string) => void
  onAddAddress: (slug: string) => void
  /** 03c layout: narrower Person/Address columns plus "What Gifty knows". */
  showKnows?: boolean
  pageSize?: number
  onSeeAll?: () => void
}

/** Audience table: filter segmented, person rows with hover "Behavioural profile", footer. */
export function PeopleTable({ people, counts, filter, onFilter, selected, onOpenProfile, onAddAddress, showKnows, pageSize = 5, onSeeAll }: Props) {
  const rows = people.filter((p) => matchesFilter(p, filter)).slice(0, pageSize)

  return (
    <div className="flex flex-col overflow-clip rounded-card bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
        <FilterSegmented value={filter} counts={counts} onChange={onFilter} />
        <span className="text-[12.5px] leading-4 text-grey-3">Sorted by account</span>
      </div>

      <div className="flex h-9 shrink-0 items-center gap-4 border-b border-line-soft bg-[#FBFBFA] px-6 text-[12px] font-medium leading-4 text-grey-3">
        <span className={cn('shrink-0', showKnows ? 'w-[208px]' : 'w-[260px]')}>Person</span>
        <span className={showKnows ? 'w-[168px] shrink-0' : 'flex-1'}>Address</span>
        {showKnows && <span className="flex-1">What Gifty knows</span>}
      </div>

      {rows.map((p) => (
        <PersonRow
          key={p.slug}
          person={p}
          selected={selected === p.slug}
          showKnows={showKnows}
          onOpenProfile={() => onOpenProfile(p.slug)}
          onAddAddress={() => onAddAddress(p.slug)}
        />
      ))}
      {rows.length === 0 && (
        <div className="flex h-16 items-center border-b border-line-soft px-6 text-[13px] leading-4 text-grey-3">Nobody here any more.</div>
      )}

      <div className="flex h-[52px] shrink-0 items-center justify-between px-6 text-[13px] leading-4">
        <span className="text-grey-3">
          Showing {rows.length} of {counts[filter]}
        </span>
        {onSeeAll && (
          <button onClick={onSeeAll} data-testid="see-everyone" className="cursor-pointer font-medium text-violet-link hover:underline">
            {rows.length < counts[filter] ? 'See everyone' : 'Show fewer'}
          </button>
        )}
      </div>
    </div>
  )
}

function FilterSegmented({ value, counts, onChange }: { value: PeopleFilter; counts: Record<PeopleFilter, number>; onChange: (f: PeopleFilter) => void }) {
  return (
    <div role="tablist" className="flex items-center gap-1 rounded-[10px] bg-fill p-[3px]">
      {FILTERS.map((f) => {
        const active = f === value
        return (
          <button
            key={f}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f)}
            className={cn(
              'flex h-7 cursor-pointer items-center gap-1.5 rounded-[8px] px-[10px] text-[12.5px] leading-4 transition-colors',
              active
                ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160F]'
                : 'font-medium text-grey-2 hover:text-ink',
            )}
          >
            {FILTER_LABEL[f]}
            <span className={cn('font-normal', f === 'noAddress' && counts[f] > 0 ? 'text-amber-text' : 'text-grey-3')}>{counts[f]}</span>
          </button>
        )
      })}
    </div>
  )
}

type RowProps = {
  person: Person
  selected: boolean
  showKnows?: boolean
  onOpenProfile: () => void
  onAddAddress: () => void
}

export function PersonRow({ person: p, selected, showKnows, onOpenProfile, onAddAddress }: RowProps) {
  return (
    <div
      className={cn(
        'group flex h-16 shrink-0 items-center gap-4 border-b border-line-soft px-6 transition-colors',
        selected ? 'bg-[#F6F5FE]' : 'hover:bg-[#FAFAF8]',
      )}
    >
      <div className={cn('flex shrink-0 items-center gap-3', showKnows ? 'w-[208px]' : 'w-[260px]')}>
        <PersonAvatar person={p} size={32} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <button onClick={onOpenProfile} className="cursor-pointer text-left text-[13.5px] font-semibold leading-4 text-ink">
            {p.name}
          </button>
          <span className="text-[12.5px] leading-4 text-grey-3">{subtitle(p)}</span>
        </div>
      </div>

      <div className={cn('flex', showKnows ? 'w-[168px] shrink-0' : 'flex-1')}>
        {p.address ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] leading-4 text-ink">{p.address.line}</span>
            <span className="text-[12px] leading-4 text-grey-3">{p.address.note}</span>
          </div>
        ) : (
          <SoftAction icon onClick={onAddAddress}>
            Add address
          </SoftAction>
        )}
      </div>

      {showKnows && p.knows && (
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-medium leading-4 text-ink">{p.knows.headline}</span>
          <span className="flex items-center gap-1.5">
            <SourceMark source={p.knows.source} size={14} />
            <span className="text-[12px] leading-4 text-grey-2">{p.knows.detail}</span>
          </span>
        </div>
      )}

      {!selected && (
        <OutlineAction
          onClick={onOpenProfile}
          trailing={<ChevronRightSmall />}
          className="invisible opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 focus-visible:visible focus-visible:opacity-100"
        >
          Behavioural profile
        </OutlineAction>
      )}
    </div>
  )
}
