import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Full-viewport shell: the header sits at the top in normal flow, the body below fills the rest.
 * Nothing scrolls the document; each page scrolls its own containers.
 */
export function Page({ header, children, className }: { header: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      {header}
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>{children}</div>
    </div>
  )
}

/** A page's own scroll container (content capped at 1344 with 48px side padding). */
export function ScrollArea({ children, className, inner }: { children: ReactNode; className?: string; inner?: string }) {
  return (
    <main data-scroll="content" className={cn('thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain', className)}>
      <div className={cn('mx-auto max-w-[1440px] px-12', inner)}>{children}</div>
    </main>
  )
}
