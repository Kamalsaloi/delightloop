import { useEffect, type ReactNode } from 'react'
import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'

/** How the failed delivery was resolved from the "Needs you" actions. */
export type Fix = 'office' | 'digital' | 'cancel'

const FACES = {
  meera: '01M57WG019MX885TVVGG07M08H',
  kenji: '01M57SW4WVYW10HAH7493CVDWC',
  ananya: '01M57SW4WTJQ14W83NJJV5G6N1',
}

const FIXED: Record<Fix, { title: string; body: string }> = {
  office: {
    title: 'Meera Shah, sending to the new office',
    body: 'The candle goes back out Monday to Orbital in Whitefield, Bengaluru.',
  },
  digital: {
    title: 'Meera Shah, sent digitally',
    body: 'Gifty emailed her a gift card from Sam, same value. The candle stays at the warehouse.',
  },
  cancel: {
    title: 'Meera Shah, gift cancelled',
    body: '$72 is back in the wallet. She stays in the loop for the follow-ups.',
  },
}

type Props = {
  fix: Fix | null
  onFix: (fix: Fix | null) => void
  swapUndone: boolean
  onToggleSwap: () => void
  onClose: () => void
}

/** 08a · gift delivery panel: shipping progress, the failed delivery that needs Sam, what Gifty handled. */
export function DeliveryPanel({ fix, onFix, swapUndone, onToggleSwap, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <aside className="fixed right-12 top-[88px] z-30 flex max-h-[calc(100vh-112px)] w-[384px] flex-col overflow-y-auto overflow-x-clip rounded-[20px] bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_20px_48px_-24px_#1112162E]">
      <ProgressHeader onClose={onClose} />
      {fix ? (
        <Section title="You handled" gap={16} divided>
          <HandledRow face={FACES.meera} title={FIXED[fix].title} action={<LinkButton onClick={() => onFix(null)}>Undo</LinkButton>}>
            {FIXED[fix].body}
          </HandledRow>
        </Section>
      ) : (
        <NeedsYou onFix={onFix} />
      )}
      <Section title="Gifty handled" gap={16}>
        <HandledRow face={FACES.kenji} title="Kenji Tanaka, retry on Monday">
          The courier couldn’t get into the building. Gifty booked a second try with a call to reception first.
        </HandledRow>
        <HandledRow
          face={FACES.ananya}
          title={swapUndone ? 'Ananya Rao, waiting on the candle' : 'Ananya Rao, gift swapped'}
          action={<LinkButton onClick={onToggleSwap}>{swapUndone ? 'Redo' : 'Undo'}</LinkButton>}
        >
          {swapUndone
            ? 'Swap undone. Her soy candle ships when Bengaluru restocks, about two days late.'
            : 'The soy candle ran out in Bengaluru. Gifty sent the brass diya instead, same price, and it still fits her Diwali lunch post.'}
        </HandledRow>
      </Section>
    </aside>
  )
}

function ProgressHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line-soft px-6 pb-5 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[17px] font-semibold leading-[22px] text-ink">Diwali gift</span>
          <span className="text-[13px] leading-[18px] text-grey-3">Shipped Sat 31 Oct to 36 people</span>
        </div>
        <button onClick={onClose} aria-label="Close" className="-m-1.5 cursor-pointer rounded-[8px] p-1.5 hover:bg-fill">
          <svg width="16" height="16" viewBox="0 0 16 16" className="block" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#6E6F7C" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="flex h-1.5 shrink-0 gap-[3px]">
        <span className="basis-0 rounded-[3px] bg-green" style={{ flexGrow: 31 }} />
        <span className="basis-0 rounded-[3px] bg-[#C9CAD0]" style={{ flexGrow: 2 }} />
        <span className="basis-0 rounded-[3px] bg-[#F2C46B]" style={{ flexGrow: 3 }} />
      </div>
      <div className="flex gap-4 text-[12.5px] leading-4">
        <span className="text-grey-1">31 delivered</span>
        <span className="text-grey-1">2 on the way</span>
        <span className="text-amber-text">3 hit a snag</span>
      </div>
    </div>
  )
}

function NeedsYou({ onFix }: { onFix: (fix: Fix) => void }) {
  return (
    <Section title="Needs you" gap={14} divided>
      <div className="flex gap-3">
        <img src={asset(FACES.meera)} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-semibold leading-[18px] text-ink">Meera Shah’s gift came back</span>
            <span className="text-[13px] leading-[18px] text-grey-1">
              Orbital left the Indiranagar office in September. The candle is back at the Bengaluru warehouse.
            </span>
          </div>
          <span className="text-[12px] leading-4 text-grey-3">Gifty found the new one on their careers page: Whitefield, Bengaluru</span>
          <div className="flex flex-wrap gap-1.5">
            <ActionButton tone="primary" onClick={() => onFix('office')}>
              Use Orbital’s new office
            </ActionButton>
            <ActionButton tone="outline" onClick={() => onFix('digital')}>
              Send it digitally
            </ActionButton>
            <ActionButton tone="plain" onClick={() => onFix('cancel')}>
              Cancel, $72 back
            </ActionButton>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Section({ title, gap, divided, children }: { title: string; gap: number; divided?: boolean; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col px-6 py-5', divided && 'border-b border-line-soft')} style={{ gap }}>
      <span className="text-[12.5px] font-semibold leading-4 text-grey-1">{title}</span>
      {children}
    </div>
  )
}

function HandledRow({ face, title, action, children }: { face: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <img src={asset(face)} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13.5px] font-medium leading-[18px] text-ink">{title}</span>
          {action}
        </div>
        <span className="text-[12.5px] leading-[17px] text-grey-2">{children}</span>
      </div>
    </div>
  )
}

function LinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="shrink-0 cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
      {children}
    </button>
  )
}

const ACTION_TONE = {
  primary: 'bg-violet px-3 font-semibold text-white shadow-primary hover:bg-[#5A4EF0]',
  outline: 'px-3 font-medium text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
  plain: 'px-2.5 font-medium text-grey-2 hover:text-ink',
}

function ActionButton({ tone, onClick, children }: { tone: keyof typeof ACTION_TONE; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn('flex h-[30px] cursor-pointer items-center rounded-[8px] text-[12.5px] leading-4 transition-colors', ACTION_TONE[tone])}
    >
      {children}
    </button>
  )
}
