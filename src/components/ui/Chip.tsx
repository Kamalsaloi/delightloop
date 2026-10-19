import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type ChipTone = 'neutral' | 'green' | 'amber' | 'red' | 'violet' | 'outline'

const TONE: Record<ChipTone, string> = {
  neutral: 'bg-fill text-ink',
  green: 'bg-[#EAF5EF] text-green-text',
  amber: 'bg-amber-bg text-amber-text',
  red: 'bg-[#FDECEC] text-[#C2362F]',
  violet: 'bg-violet-soft text-violet-link',
  outline: 'bg-white text-ink shadow-[0_0_0_1px_#EBEBE8]',
}

/** Small rounded label. Text only: no dots, no pulses. */
export function Chip({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: ChipTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-medium leading-4',
        TONE[tone],
        className,
      )}
      {...rest}
    />
  )
}
