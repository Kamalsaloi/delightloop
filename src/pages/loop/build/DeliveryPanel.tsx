// 08a · gift delivery: shipping progress, the one that needs you, what Gifty handled.
import type { ReactNode } from 'react'
import { PanelFrame } from '@/components/panels/FloatingPanel'
import { PersonAvatar } from '@/components/audience/marks'
import { giftById } from '@/data/catalog'
import { cn } from '@/lib/cn'
import { DAY, fmtDay } from '@/lib/time'
import { nodeDays, stepsOfType } from '@/store/graph'
import { activePeople } from '@/store/sim'
import { useStore } from '@/store/store'
import type { Fix, Loop } from '@/store/types'
import { CHECK_ICON, CloseButton } from './kit'

export function DeliveryPanel({ loop, onClose }: { loop: Loop; onClose: () => void }) {
  const fixDelivery = useStore((s) => s.fixDelivery)
  const toggleSwap = useStore((s) => s.toggleSwap)
  const live = loop.live!
  const c = live.counts
  const gift = stepsOfType(loop.graph, 'gift')[0]
  const giftName = gift ? giftById(gift.data.picks[0]?.giftId ?? 'candle').short : 'gift'
  const shipDay = gift ? nodeDays(loop.graph, loop.startAt)[gift.id] : 0
  const shipped = c.giftsShipped > 0
  // The one that came back: a customer or anyone without a reliable office.
  const people = activePeople(loop)
  const who = people.find((p) => p.slug === 'meera') ?? people.find((p) => p.address) ?? people[0]
  const whoFirst = who?.name.split(' ')[0] ?? 'They'
  const issue = live.delivery.issue
  const FIXED: Record<Fix, { title: string; body: string }> = {
    office: { title: `${who?.name}, sending to the new office`, body: `The ${giftName} goes back out Monday to ${who?.company}’s new office.` },
    digital: { title: `${who?.name}, sent digitally`, body: `Gifty emailed ${whoFirst} a gift card from Sam, same value. The ${giftName} stays at the warehouse.` },
    cancel: { title: `${who?.name}, gift cancelled`, body: `$${gift ? giftById(gift.data.picks[0]?.giftId ?? 'candle').price : 70} is back in the budget. ${whoFirst} stays in the loop for the follow-ups.` },
  }

  return (
    <PanelFrame
      header={
        <div className="flex flex-col gap-4 border-b border-line-soft px-6 pb-5 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[17px] font-semibold leading-[22px] text-ink">{gift?.data.title ?? 'The gift'}</span>
              <span className="text-[13px] leading-[18px] text-grey-3">{shipped ? `Shipped ${fmtDay(loop.startAt + shipDay * DAY)} to ${c.giftsShipped} people` : `Ships ${fmtDay(loop.startAt + shipDay * DAY)}`}</span>
            </div>
            <CloseButton onClick={onClose} />
          </div>
          {shipped && (
            <>
              <div className="flex h-1.5 shrink-0 gap-[3px]">
                <span className="basis-0 rounded-[3px] bg-green transition-[flex-grow] duration-500" style={{ flexGrow: c.delivered }} />
                {c.onTheWay > 0 && <span className="basis-0 rounded-[3px] bg-[#C9CAD0]" style={{ flexGrow: c.onTheWay }} />}
                {c.snags > 0 && <span className="basis-0 rounded-[3px] bg-[#F2C46B]" style={{ flexGrow: c.snags }} />}
              </div>
              <div className="flex gap-4 text-[12.5px] leading-4">
                <span className="text-grey-1">{c.delivered} delivered</span>
                <span className="text-grey-1">{c.onTheWay} on the way</span>
                {c.snags > 0 && <span className="text-amber-text">{c.snags} hit a snag</span>}
              </div>
            </>
          )}
        </div>
      }
    >
      {issue === 'none' && <Section title="Nothing needs you">Gifty will tell you if a delivery hits a snag.</Section>}
      {issue === 'open' && who && (
        <Section title="Needs you" divided>
          <div className="flex gap-3" data-testid="delivery-issue">
            <PersonAvatar person={who} size={36} />
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold leading-[18px] text-ink">{whoFirst}’s gift came back</span>
                <span className="text-[13px] leading-[18px] text-grey-1">{who.company} moved offices. The {giftName} is back at the warehouse.</span>
              </div>
              <span className="text-[12px] leading-4 text-grey-3">Gifty found the new office on their careers page</span>
              <div className="flex flex-wrap gap-1.5">
                <ActionButton tone="primary" onClick={() => fixDelivery(loop.id, 'office')} testId="fix-office">
                  {CHECK_ICON}
                  Use {who.company.split(' ')[0]}’s new office
                </ActionButton>
                <ActionButton tone="outline" onClick={() => fixDelivery(loop.id, 'digital')}>
                  Send it digitally
                </ActionButton>
                <ActionButton tone="plain" onClick={() => fixDelivery(loop.id, 'cancel')}>
                  Cancel, money back
                </ActionButton>
              </div>
            </div>
          </div>
        </Section>
      )}
      {issue !== 'open' && issue !== 'none' && who && (
        <Section title="You handled" divided>
          <HandledRow face={<PersonAvatar person={who} size={32} />} title={FIXED[issue].title} action={<LinkButton onClick={() => fixDelivery(loop.id, null)}>Undo</LinkButton>}>
            {FIXED[issue].body}
          </HandledRow>
        </Section>
      )}
      {live.handled.length > 0 && (
        <Section title={`Gifty handled ${live.handled.length}`}>
          {live.handled.map((h, i) => (
            <HandledRow
              key={h.text}
              face={<PersonAvatar person={{ face: h.face, initials: h.initials }} size={32} />}
              title={h.text.split(',')[0] + (i === 1 && live.delivery.swapUndone ? ', waiting on restock' : `, ${h.text.split(', ').slice(1).join(', ')}`)}
              action={i === 1 ? <LinkButton onClick={() => toggleSwap(loop.id)}>{live.delivery.swapUndone ? 'Redo' : 'Undo'}</LinkButton> : undefined}
            >
              {i === 0 ? 'The courier couldn’t get into the building. Gifty booked a second try with a call to reception first.' : live.delivery.swapUndone ? 'Swap undone. The original gift ships when the warehouse restocks, about two days late.' : 'The first pick ran out locally. Gifty sent a close match instead, same price.'}
            </HandledRow>
          ))}
        </Section>
      )}
    </PanelFrame>
  )
}

function Section({ title, divided, children }: { title: string; divided?: boolean; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-4 px-6 py-5', divided && 'border-b border-line-soft')}>
      <span className="text-[12.5px] font-semibold leading-4 text-grey-1">{title}</span>
      {typeof children === 'string' ? <span className="text-[13px] leading-[18px] text-grey-2">{children}</span> : children}
    </div>
  )
}

function HandledRow({ face, title, action, children }: { face: ReactNode; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      {face}
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
  primary: 'gap-[7px] bg-violet px-3 font-semibold text-white shadow-primary hover:bg-[#5A4EF0]',
  outline: 'px-3 font-medium text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
  plain: 'px-2.5 font-medium text-grey-2 hover:text-ink',
}

function ActionButton({ tone, onClick, children, testId }: { tone: keyof typeof ACTION_TONE; onClick: () => void; children: ReactNode; testId?: string }) {
  return (
    <button data-testid={testId} onClick={onClick} className={cn('flex h-[30px] cursor-pointer items-center rounded-[8px] text-[12.5px] leading-4 transition-colors', ACTION_TONE[tone])}>
      {children}
    </button>
  )
}
