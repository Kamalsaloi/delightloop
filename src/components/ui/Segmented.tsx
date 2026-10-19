import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

export type SegmentedOption<T extends string> = { value: T; label: ReactNode; count?: ReactNode }

type Props<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  fill?: boolean // stretch segments to full width
  className?: string
}

/** Grey track, white raised thumb on the active option. */
export function Segmented<T extends string>({ options, value, onChange, size = 'md', fill, className }: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-0.5 bg-fill p-1',
        size === 'md' ? 'rounded-[12px]' : 'rounded-[10px]',
        fill && 'w-full',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[13px] leading-4 transition-colors',
              size === 'md' ? 'rounded-[9px] px-4 py-2' : 'rounded-[8px] px-[10px] py-[6px]',
              fill && 'flex-1',
              active ? 'bg-white font-semibold text-ink shadow-seg' : 'font-medium text-grey-2 hover:text-ink',
            )}
          >
            {o.label}
            {o.count !== undefined && <span className="font-normal text-grey-3">{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
