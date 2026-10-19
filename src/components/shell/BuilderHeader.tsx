import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Chip, Icon, Logo } from '@/components/ui'
import { cn } from '@/lib/cn'

export type BuilderTab = 'Audience' | 'Build' | 'Preview' | 'Results'
export type LoopMode = 'draft' | 'blank' | 'live' | 'paused'

// Where each top-bar tab goes, per loop state.
export const TAB_ROUTES: Record<LoopMode, Record<BuilderTab, string>> = {
  draft: { Audience: '/loop/audience', Build: '/loop/build/gift', Preview: '/loop/preview', Results: '/live/results' },
  blank: { Audience: '/blank/people', Build: '/blank/build/1', Preview: '/loop/preview', Results: '/live/results' },
  live: { Audience: '/loop/audience', Build: '/live/build', Preview: '/loop/preview', Results: '/live/results' },
  paused: { Audience: '/loop/audience', Build: '/paused/build', Preview: '/loop/preview', Results: '/live/results' },
}

type Props = {
  title?: string
  status?: ReactNode // e.g. "Draft", "Live", "Paused"
  statusTone?: 'neutral' | 'green' | 'amber'
  tab?: BuilderTab | null // null hides the segmented tabs
  mode?: LoopMode
  tabs?: BuilderTab[]
  /** Small violet count after a tab label, e.g. { Results: 3 } (08/10/11). */
  tabBadges?: Partial<Record<BuilderTab, ReactNode>>
  right?: ReactNode
  className?: string
}

/** Top bar for loop screens: breadcrumb, Audience/Build/Preview/Results tabs, actions. */
export function BuilderHeader({
  title = 'Diwali · VP Sales Q4',
  status = 'Draft',
  statusTone = 'neutral',
  tab = 'Build',
  mode = 'draft',
  tabs = ['Audience', 'Build', 'Preview', 'Results'],
  tabBadges,
  right,
  className,
}: Props) {
  const navigate = useNavigate()
  return (
    <header className={cn('flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-12', className)}>
      <div className="flex items-center gap-4">
        <Link to="/home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/home" className="text-[14px] leading-5 text-grey-3 hover:text-grey-1">
            Campaigns
          </Link>
          <Icon name="chevronRight" size={14} color="#C4C5CB" strokeWidth={1.4} />
          <span className="text-[14px] font-semibold leading-5 tracking-[-0.01em] text-ink">{title}</span>
          {status && (
            <Chip tone={statusTone} className={cn('!py-[3px]', statusTone === 'neutral' && 'text-grey-1')}>
              {status}
            </Chip>
          )}
        </div>
      </div>

      {tab !== null && (
        <div className="flex items-center gap-0.5 rounded-[12px] bg-fill p-1">
          {tabs.map((t) => {
            const active = t === tab
            return (
              <button
                key={t}
                onClick={() => navigate(TAB_ROUTES[mode][t])}
                className={cn(
                  'rounded-[9px] px-4 py-2 text-[13px] leading-4 transition-colors',
                  active ? 'bg-white font-semibold text-ink shadow-seg' : 'font-medium text-grey-2 hover:text-ink',
                  tabBadges?.[t] != null && 'flex items-center gap-1.5',
                )}
              >
                {t}
                {tabBadges?.[t] != null && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-violet px-[5px] text-[11px] font-semibold leading-3 text-white">
                    {tabBadges[t]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-4">{right}</div>
    </header>
  )
}

export function SavedLabel({ children = 'Saved just now' }: { children?: ReactNode }) {
  return <span className="text-[12.5px] leading-4 text-grey-3">{children}</span>
}
