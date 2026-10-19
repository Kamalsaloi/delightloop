import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { HubSpotDot, SourceMark } from '@/components/audience/marks'

type Stage = { label: string; icon?: ReactNode; value: string; note: string; current?: boolean }

const stages = (total: number): Stage[] => [
  { label: 'HubSpot', icon: <HubSpotDot />, value: '212', note: 'people at your 36 Q4 accounts' },
  { label: 'By title', value: '61', note: 'run or lead sales' },
  { label: 'Checked today', icon: <SourceMark source="linkedin" size={16} />, value: '52', note: 'still in the role, 9 moved on' },
  { label: 'In this loop', value: String(total), note: '4 in open deals left to their AE', current: true },
]

/** 03c: how Gifty narrowed 212 people down to 48. */
export function HowFunnel({ total }: { total: number }) {
  const STAGES = stages(total)
  return (
    <div className="flex flex-col gap-4 rounded-card bg-white px-6 pb-6 pt-5 shadow-card animate-[fade_.15s_ease-out]">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-semibold leading-5 text-ink">How Gifty found them</span>
      </div>
      <div className="flex gap-2">
        {STAGES.map((s, i) => (
          <div key={s.label} className="contents">
            {i > 0 && (
              <div className="flex shrink-0 items-center">
                <svg width="12" height="12" viewBox="0 0 16 16">
                  <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="#B4B5BB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <StageTile stage={s} />
          </div>
        ))}
      </div>
    </div>
  )
}

function StageTile({ stage: s }: { stage: Stage }) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-[10px] rounded-[12px] px-4 py-[14px]',
        s.current ? 'bg-white shadow-[inset_0_0_0_1.5px_#6559F7]' : 'bg-page',
      )}
    >
      <div className="flex items-center gap-1.5">
        {s.icon}
        <span className={cn('text-[12px] leading-4', s.current ? 'text-violet-edge' : 'text-grey-3')}>{s.label}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[22px] font-semibold leading-7 tracking-[-0.02em] text-ink">{s.value}</span>
        <span className="text-[12.5px] leading-4 text-grey-2">{s.note}</span>
      </div>
    </div>
  )
}
