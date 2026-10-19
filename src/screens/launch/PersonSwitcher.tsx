import { useEffect, useRef, useState } from 'react'
import { Avatar, Icon } from '@/components/ui'
import { cn } from '@/lib/cn'
import { AUDIENCE_SIZE, RECIPIENTS } from './data'

type Props = {
  index: number
  onChange: (index: number) => void
  size?: 'md' | 'sm' // md = Preview (36px), sm = Review & launch card (32px)
  stretch?: boolean
}

const RING = 'bg-white shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)]'

/** ‹ [face Name  n of 48 ⌄] › — steps through recipients, or pick from the list. */
export function PersonSwitcher({ index, onChange, size = 'md', stretch }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const person = RECIPIENTS[index]
  const md = size === 'md'
  const atStart = index === 0
  const atEnd = index === RECIPIENTS.length - 1

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const square = cn(
    'flex shrink-0 cursor-pointer items-center justify-center hover:bg-fill-hover disabled:cursor-default disabled:hover:bg-white',
    RING,
    md ? 'h-9 w-9 rounded-[10px]' : 'h-8 w-8 rounded-[8px]',
  )

  return (
    <div ref={ref} className={cn('relative flex items-center gap-1', stretch && 'w-full')}>
      <button className={square} disabled={atStart} onClick={() => onChange(index - 1)} aria-label="Previous person">
        <Icon name="chevronLeft" size={12} strokeWidth={1.6} color={atStart ? '#B4B5BB' : '#111216'} />
      </button>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex cursor-pointer items-center pl-1 text-left hover:bg-fill-hover',
          RING,
          md ? 'h-9 flex-1 gap-[10px] rounded-[10px] pr-3' : 'h-8 gap-2 rounded-[8px] pr-[10px]',
        )}
      >
        <Avatar id={person.face} size={md ? 28 : 24} />
        <span className={cn('font-semibold leading-4 text-ink', md ? 'flex-1 text-[13px]' : 'text-[12.5px]')}>{person.name}</span>
        <span className={cn('leading-4 text-grey-3', md ? 'text-[12px]' : 'text-[12.5px]')}>
          {index + 1} of {AUDIENCE_SIZE}
        </span>
        <Icon name="chevronDown" size={10} strokeWidth={1.8} color="#6E6F7C" />
      </button>
      <button className={square} disabled={atEnd} onClick={() => onChange(index + 1)} aria-label="Next person">
        <Icon name="chevronRight" size={12} strokeWidth={1.6} color={atEnd ? '#B4B5BB' : '#111216'} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full z-30 mt-2 w-[280px] rounded-[14px] bg-white p-1.5 shadow-pop',
            md ? 'left-10' : 'right-9',
          )}
        >
          {RECIPIENTS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => {
                onChange(i)
                setOpen(false)
              }}
              className={cn(
                'flex w-full cursor-pointer items-center gap-[10px] rounded-[10px] px-2 py-2 text-left',
                i === index ? 'bg-fill' : 'hover:bg-fill-hover',
              )}
            >
              <Avatar id={r.face} size={28} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[13px] font-semibold leading-4 text-ink">{r.name}</span>
                <span className="truncate text-[12px] leading-4 text-grey-3">
                  {r.title}, {r.company}
                </span>
              </span>
              {i === index && <Icon name="check" size={14} color="#6559F7" />}
            </button>
          ))}
          <div className="mt-1 border-t border-line-soft px-2 pb-1 pt-2 text-[12px] leading-4 text-grey-3">
            And {AUDIENCE_SIZE - RECIPIENTS.length} more in this loop
          </div>
        </div>
      )}
    </div>
  )
}
