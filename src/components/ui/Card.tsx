import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** White surface, radius 20, hairline ring. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card bg-white shadow-card', className)} {...rest} />
}
