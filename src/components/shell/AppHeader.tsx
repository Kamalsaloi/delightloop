import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Icon, Logo } from '@/components/ui'
import { FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { useStore } from '@/store/store'

const NAV = ['Campaigns', 'Audiences', 'Gift gallery', 'Reports'] as const

/** Top app bar for Home. Search filters the loops on the page. */
export function AppHeader({ query, onQuery }: { query?: string; onQuery?: (q: string) => void }) {
  const toast = useStore((s) => s.toast)
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-12">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) =>
            item === 'Campaigns' ? (
              <Link key={item} to="/" className="rounded-[8px] bg-fill px-3 py-2 text-[13.5px] font-semibold leading-4 text-ink">
                {item}
              </Link>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => toast(`${item} isn’t part of this prototype yet`)}
                className="cursor-pointer rounded-[8px] px-3 py-2 text-[13.5px] font-medium leading-4 text-grey-2 hover:text-ink"
              >
                {item}
              </button>
            ),
          )}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex h-10 w-60 shrink-0 items-center gap-2 rounded-[10px] bg-page px-3">
          <Icon name="search" size={15} color="#8B8D95" />
          <input
            value={query ?? ''}
            onChange={(e) => onQuery?.(e.target.value)}
            placeholder="Search loops"
            className="w-full bg-transparent text-[13px] leading-4 text-ink outline-none placeholder:text-grey-3"
          />
        </label>
        <AvatarMenu />
      </div>
    </header>
  )
}

const SPEEDS = [1, 4, 10]

/** Priya's avatar. The menu also holds the demo controls (speed, skip ahead, reset). */
export function AvatarMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)
  const skipDay = useStore((s) => s.skipDay)
  const resolvePending = useStore((s) => s.resolvePending)
  const reset = useStore((s) => s.reset)

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

  const item = 'flex h-9 w-full cursor-pointer items-center rounded-[8px] px-2.5 text-left text-[13px] leading-4 text-ink hover:bg-page'
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Account menu" data-testid="avatar-menu" onClick={() => setOpen((o) => !o)} className="flex cursor-pointer rounded-full">
        <Avatar id={FACE.priya} size={32} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 flex w-[248px] animate-[fade_.12s_ease-out] flex-col rounded-[14px] bg-white p-1.5 shadow-pop">
          <div className="flex items-center gap-2.5 px-2.5 pb-2.5 pt-2">
            <Avatar id={FACE.priya} size={28} />
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold leading-4 text-ink">Priya Nair</span>
              <span className="text-[12px] leading-4 text-grey-3">priya@delightloop.co</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 border-t border-line-soft px-1 pb-1 pt-2.5">
            <span className="px-1.5 pb-1 text-[12px] font-medium leading-4 text-grey-3">Demo</span>
            <div className="flex items-center justify-between px-1.5 py-1">
              <span className="text-[13px] leading-4 text-ink">Speed</span>
              <div className="flex gap-0.5 rounded-[8px] bg-fill p-0.5">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-testid={`speed-${s}`}
                    onClick={() => setSpeed(s)}
                    className={cn(
                      'h-6 cursor-pointer rounded-[6px] px-2 text-[12px] leading-4',
                      s === speed ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#E4E4E1]' : 'font-medium text-grey-2 hover:text-ink',
                    )}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className={item} data-testid="demo-skip" onClick={() => skipDay()}>
              Skip ahead a day
            </button>
            <button type="button" className={item} data-testid="demo-resolve" onClick={() => resolvePending()}>
              Answer pending approvals now
            </button>
            <button
              type="button"
              className={cn(item, 'text-[#C2410C]')}
              data-testid="demo-reset"
              onClick={() => {
                setOpen(false)
                reset()
              }}
            >
              Reset demo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
