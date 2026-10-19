import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Lavender highlight on text Gifty filled in for this person. */
export function Hl({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('rounded-[4px] bg-[#EFECFF] px-[3px] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]', className)}>
      {children}
    </span>
  )
}
