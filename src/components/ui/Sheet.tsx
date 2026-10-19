import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  side?: 'right' | 'center'
  width?: number
  scrim?: boolean
  className?: string
}

/** Right-side drawer or centred modal. Escape and scrim click close it. */
export function Sheet({ open, onClose, children, side = 'right', width = 440, scrim = true, className }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      {scrim && <div className="absolute inset-0 bg-[rgba(17,18,22,.24)] animate-[fade_.15s_ease-out]" onClick={onClose} />}
      <div
        role="dialog"
        aria-modal
        className={cn(
          'absolute bg-white',
          side === 'right'
            ? 'bottom-3 right-3 top-3 overflow-auto rounded-card shadow-pop animate-[slideIn_.2s_ease-out]'
            : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[24px] shadow-pop animate-[fade_.15s_ease-out]',
          className,
        )}
        style={{ width }}
      >
        {children}
      </div>
    </div>
  )
}
