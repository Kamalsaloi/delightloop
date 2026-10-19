import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/cn'

const FUNNEL = [
  { label: 'Got the intro', value: 48, width: '100%', color: '#C9C6FC' },
  { label: 'Opened it', value: 31, width: '65%', color: '#8F86F9' },
  { label: 'Replied', value: 5, width: '10%', color: '#6559F7' },
  { label: 'Booked a meeting', value: 2, width: '4%', color: '#22B573', good: true },
]

const HANDLED = [
  { face: '01M57WG019MX885TVVGG07M08H', text: 'Meera, out of office · paused to 3 Nov' },
  { face: '01M57W535F2ECEWJQH95YK4N7D', text: 'Sofia, not interested · stopped' },
]

const CARD = 'flex flex-col rounded-card bg-white shadow-card'

export function LoopSoFar({ day }: { day: number }) {
  return (
    <div className={cn(CARD, 'gap-4 px-6 pb-6 pt-5')}>
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-semibold leading-5 text-ink">Loop so far</span>
        <span className="text-[12.5px] leading-4 text-grey-3">Day {day} of 9</span>
      </div>
      <div className="flex flex-col gap-3">
        {FUNNEL.map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[12.5px] leading-4">
              <span className={f.good ? 'font-medium text-green-text' : 'text-grey-1'}>{f.label}</span>
              <span className={cn('font-semibold', f.good ? 'text-green-text' : 'text-ink')}>{f.value}</span>
            </div>
            <div className="flex h-1.5 rounded-[3px] bg-line-soft">
              <div className="rounded-[3px]" style={{ width: f.width, backgroundColor: f.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-baseline justify-between border-t border-line-soft pt-[14px] text-[12.5px] leading-4">
        <span className="text-grey-1">Gifts held back</span>
        <span className="font-semibold text-ink">5 · $362 saved</span>
      </div>
    </div>
  )
}

export function ComingUp({ items }: { items: { day: string; text: string }[] }) {
  return (
    <div className={cn(CARD, 'gap-3 px-6 py-5')}>
      <span className="text-[14px] font-semibold leading-5 text-ink">Coming up</span>
      <div className="flex flex-col">
        {items.map((it, i) => (
          <div key={it.day} className={cn('flex gap-3 py-2 text-[12.5px] leading-4', i > 0 && 'border-t border-line-soft')}>
            <span className="w-14 shrink-0 font-medium text-ink">{it.day}</span>
            <span className="text-grey-2">{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Handled() {
  return (
    <div className={cn(CARD, 'gap-3 px-6 py-5')}>
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-semibold leading-5 text-ink">Gifty handled 2</span>
        <Link to="/live/build" className="text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
          Review
        </Link>
      </div>
      <div className="flex flex-col gap-[10px]">
        {HANDLED.map((h) => (
          <div key={h.text} className="flex items-center gap-[10px]">
            <Avatar id={h.face} size={24} />
            <span className="text-[12.5px] leading-4 text-grey-1">{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
