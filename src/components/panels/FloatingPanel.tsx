import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Keeps children mounted while they animate out. */
export function usePresence(open: boolean, ms = 200) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(open)
  useEffect(() => {
    if (open) {
      setMounted(true)
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(r)
    }
    setShown(false)
    const t = window.setTimeout(() => setMounted(false), ms)
    return () => window.clearTimeout(t)
  }, [open, ms])
  return { mounted, shown }
}

/**
 * Right panel: a rounded card floating 48px from the right, under the header. Slides and fades
 * in/out over 200ms; × or Esc closes. Children should be a <PanelFrame> so only its body scrolls.
 */
export function FloatingPanel({ open, onClose, children, testId, width = 384 }: { open: boolean; onClose: () => void; children: ReactNode; testId?: string; width?: number }) {
  const { mounted, shown } = usePresence(open)
  const last = useRef<ReactNode>(children)
  if (open) last.current = children
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !e.defaultPrevented) close.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!mounted) return null
  return (
    <aside
      role="dialog"
      data-testid={testId}
      data-panel
      className={cn(
        'fixed right-12 top-[88px] z-40 flex max-h-[calc(100dvh-112px)] flex-col overflow-hidden rounded-card bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_20px_48px_-24px_#1112162E]',
        'transition-[opacity,transform] duration-200 ease-out',
        shown ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-4 opacity-0',
      )}
      style={{ width }}
    >
      {open ? children : last.current}
    </aside>
  )
}

/** Panel layout: header pinned, body scrolls on its own, footer pinned. */
export function PanelFrame({ header, footer, children, bodyClassName }: { header?: ReactNode; footer?: ReactNode; children: ReactNode; bodyClassName?: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {header && <div className="shrink-0">{header}</div>}
      <div data-panel-body className={cn('thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain', bodyClassName)}>
        {children}
      </div>
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  )
}
