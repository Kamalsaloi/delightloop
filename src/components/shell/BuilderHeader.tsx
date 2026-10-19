import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Chip, Icon, Logo } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useStore } from '@/store/store'
import type { Loop } from '@/store/types'
import { loopTabs, statusLabel, type LoopTab } from '@/store/selectors'

type Props = {
  loop: Loop
  /** Active tab; null hides the tabs (Review & launch). */
  tab: LoopTab | null
  right?: ReactNode
}

/** Top bar for loop pages: breadcrumb with an editable name, status, Audience/Build/Preview/Results tabs, actions. */
export function BuilderHeader({ loop, tab, right }: Props) {
  const navigate = useNavigate()
  const rename = useStore((s) => s.renameLoop)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(loop.name)
  const status = statusLabel(loop)
  const tabs = loopTabs(loop)

  function commit() {
    rename(loop.id, name)
    setEditing(false)
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-12">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link to="/" aria-label="Home">
          <Logo />
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <Link to="/" className="text-[14px] leading-5 text-grey-3 hover:text-grey-1">
            Campaigns
          </Link>
          <Icon name="chevronRight" size={14} color="#C4C5CB" strokeWidth={1.4} />
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') {
                  setName(loop.name)
                  setEditing(false)
                }
              }}
              className="h-7 w-[260px] rounded-[7px] px-1.5 text-[14px] font-semibold leading-5 tracking-[-0.01em] text-ink shadow-[inset_0_0_0_1.5px_#6559F7] outline-none"
            />
          ) : (
            <button
              type="button"
              title="Rename"
              data-testid="loop-name"
              onClick={() => {
                setName(loop.name)
                setEditing(true)
              }}
              className="max-w-[300px] cursor-text truncate rounded-[7px] px-1.5 py-1 text-[14px] font-semibold leading-5 tracking-[-0.01em] text-ink hover:bg-fill"
            >
              {loop.name}
            </button>
          )}
          <Chip tone={status.tone} className={cn('!py-[3px]', status.tone === 'neutral' && 'text-grey-1')} data-testid="loop-status">
            {status.label}
          </Chip>
        </div>
      </div>

      {tab !== null && (
        <div className="flex shrink-0 items-center gap-0.5 rounded-[12px] bg-fill p-1" role="tablist">
          {tabs.map((t) => {
            const active = t.id === tab
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                disabled={t.disabled}
                title={t.disabled ? t.why : undefined}
                data-testid={`tab-${t.id}`}
                onClick={() => navigate(`/loops/${loop.id}/${t.id}`)}
                className={cn(
                  'flex items-center gap-1.5 rounded-[9px] px-4 py-2 text-[13px] leading-4 transition-colors',
                  active ? 'bg-white font-semibold text-ink shadow-seg' : 'font-medium text-grey-2 enabled:cursor-pointer enabled:hover:text-ink',
                  t.disabled && 'cursor-not-allowed text-[#B4B5BB]',
                )}
              >
                {t.label}
                {t.badge ? (
                  <span data-testid="results-badge" className="flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-violet px-[5px] text-[11px] font-semibold leading-3 text-white">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-3">{right}</div>
    </header>
  )
}

/** Simulated date/time on live screens. */
export function NowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[12.5px] tabular-nums leading-4 text-grey-3" data-testid="now-label">
      {children}
    </span>
  )
}
