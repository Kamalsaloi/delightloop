// The goal (Paper HFT-0): what counts, an example of it, what happens the moment they book, when everyone else finishes.
import type { ReactNode } from 'react'
import { PanelFrame } from '@/components/panels/FloatingPanel'
import { HubSpotMark } from '@/components/ui'
import { giftById, teammate } from '@/data/catalog'
import { asset, FACE, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { DAY, fmtDay } from '@/lib/time'
import { GIFT_TRANSIT, nodeDays, stepsOfType } from '@/store/graph'
import { activePeople } from '@/store/sim'
import { useStore } from '@/store/store'
import type { GoalData, Loop } from '@/store/types'
import { CloseButton, SaveButton, Segmented, Select, Toggle } from './kit'

const AFTER = [2, 3, 5, 7]

function SlackMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-label="Slack">
      <path d="M5.04 15.16a2.5 2.5 0 1 1-2.5-2.5h2.5v2.5Zm1.26 0a2.5 2.5 0 0 1 5 0v6.3a2.5 2.5 0 1 1-5 0v-6.3Z" fill="#E01E5A" />
      <path d="M8.8 5.04a2.5 2.5 0 1 1 2.5-2.5v2.5H8.8Zm0 1.26a2.5 2.5 0 0 1 0 5H2.5a2.5 2.5 0 0 1 0-5h6.3Z" fill="#36C5F0" />
      <path d="M18.96 8.8a2.5 2.5 0 1 1 2.5 2.5h-2.5V8.8Zm-1.26 0a2.5 2.5 0 0 1-5 0V2.5a2.5 2.5 0 1 1 5 0v6.3Z" fill="#2EB67D" />
      <path d="M15.2 18.96a2.5 2.5 0 1 1-2.5 2.5v-2.5h2.5Zm0-1.26a2.5 2.5 0 0 1 0-5h6.3a2.5 2.5 0 0 1 0 5h-6.3Z" fill="#ECB22E" />
    </svg>
  )
}

const TILE = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white shadow-[inset_0_0_0_1px_#E4E4E1]'

function MomentRow({ media, title, sub, right, last }: { media: ReactNode; title: string; sub: string; right: ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 py-3', !last && 'border-b border-[#F4F4F2]')}>
      {media}
      <div className="flex min-w-0 grow basis-0 flex-col gap-px">
        <span className="text-[13px] font-medium leading-[17px] text-ink">{title}</span>
        <span className="truncate text-[12px] leading-4 text-grey-3">{sub}</span>
      </div>
      {right}
    </div>
  )
}

export function GoalPanel({ loop, onClose }: { loop: Loop; onClose: () => void }) {
  const updateGoal = useStore((s) => s.updateGoal)
  const setGoal = useStore((s) => s.setGoal)
  const toast = useStore((s) => s.toast)
  const goal = loop.graph.goal
  if (!goal) return null
  const update = (p: Partial<GoalData>) => updateGoal(loop.id, p)

  const sender = teammate(loop.senderId)
  const person = activePeople(loop).find((p) => p.face) ?? loop.audience.people[0]
  const first = person?.name.split(' ')[0] ?? 'Ananya'
  const company = person?.company.split(' ')[0] ?? 'Kestrel'
  const days = nodeDays(loop.graph, loop.startAt)
  const gift = stepsOfType(loop.graph, 'gift')[0]
  const giftImg = gift ? giftById(gift.data.picks[0]?.giftId ?? 'diya').img : GIFT.g1
  const avg = gift ? Math.round(gift.data.picks.reduce((a, p) => a + giftById(p.giftId).price, 0) / Math.max(1, gift.data.picks.length)) : 0
  const landDay = gift ? days[gift.id] + GIFT_TRANSIT : days.goal
  const meetingDay = fmtDay(loop.startAt + (landDay + 1) * DAY)
  const endLabel = (n: number) => `${fmtDay(loop.startAt + (landDay + n) * DAY)}`
  const bookVerb = goal.goal === 'meeting' ? 'book' : goal.goal === 'reply' ? 'reply' : 'get a deal'

  function renderExample() {
    if (goal!.goal === 'reply')
      return (
        <div className="flex flex-col gap-2 px-[14px] py-3">
          <span className="text-[12px] leading-4 text-grey-3">
            {first} replied to {sender.first}, {meetingDay}
          </span>
          <p className="text-[13.5px] leading-[19px] text-ink">“This is timely, we’re planning Q1 right now. Can you send over a few times?”</p>
          <span className="w-fit rounded-full bg-[#EAF5EF] px-2 py-0.5 text-[12px] font-medium leading-4 text-green-text">Gifty reads it as a yes</span>
        </div>
      )
    if (goal!.goal === 'deal')
      return (
        <div className="flex items-center gap-3 px-[14px] py-3">
          <HubSpotMark size={28} />
          <div className="flex grow flex-col gap-0.5">
            <span className="text-[13.5px] font-semibold leading-[18px] text-ink">
              {company} · New business
            </span>
            <span className="text-[12px] leading-4 text-grey-2">Stage: Meeting booked · owner {sender.first}</span>
          </div>
          <span className="text-[13px] font-semibold leading-4 text-ink">$43,000</span>
        </div>
      )
    return (
      <div className="flex flex-col gap-[10px] px-[14px] py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13.5px] font-semibold leading-[18px] text-ink">{company} × DelightLoop</span>
          <span className="text-[12px] leading-4 text-grey-2">{meetingDay} · 4:00 to 4:30 pm · Google Meet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[sender.face ?? FACE.sam, person?.face ?? FACE.f3].map((id, i) => (
              <span key={id + i} className="h-[22px] w-[22px] shrink-0 rounded-full bg-cover bg-center shadow-[0_0_0_2px_#FFFFFF]" style={{ backgroundImage: `url(${asset(id)})` }} />
            ))}
          </div>
          <span className="text-[12px] leading-4 text-grey-1">
            {sender.name} and {person?.name ?? 'Ananya Rao'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <PanelFrame
      header={
        <div className="flex flex-col">
          <div className="flex items-center gap-3 px-6 pb-4 pt-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 14V2.5M4 3h7.5l-1.5 2.75L11.5 8.5H4" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="flex grow basis-0 flex-col gap-0.5">
              <span className="text-[16px] font-semibold leading-5 text-ink">The goal</span>
              <span className="text-[12.5px] leading-4 text-grey-3">Reaching it ends that person’s loop</span>
            </div>
            <CloseButton onClick={onClose} />
          </div>
          <div className="px-6 pb-[18px]">
            <Segmented<GoalData['goal']>
              value={goal.goal}
              onChange={(g) => update({ goal: g })}
              options={[
                { value: 'meeting', label: 'Meeting booked' },
                { value: 'reply', label: 'Good reply' },
                { value: 'deal', label: 'Deal created' },
              ]}
            />
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between border-t border-line-soft px-6 pb-5 pt-[14px]">
          <button
            type="button"
            onClick={() => {
              onClose()
              setGoal(loop.id, null)
            }}
            className="cursor-pointer text-[13px] font-medium leading-4 text-[#C2410C] underline-offset-2 hover:underline"
          >
            Remove goal
          </button>
          <SaveButton
            testId="save-goal"
            onSaved={() => {
              onClose()
              toast('Goal saved')
            }}
          >
            Save goal
          </SaveButton>
        </div>
      }
    >
      <div className="flex flex-col gap-[10px] border-y border-[#EFEFEC] bg-[#F7F7F5] px-6 py-[18px]">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold leading-4 text-grey-1">This would count</span>
          <span className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
              <rect x="2" y="3" width="12" height="11" rx="2" fill="#FFFFFF" stroke="#4285F4" strokeWidth="1.4" />
              <path d="M2 6.5h12" fill="none" stroke="#4285F4" strokeWidth="1.4" />
            </svg>
            <span className="text-[12px] leading-4 text-grey-2">{goal.goal === 'deal' ? 'HubSpot, connected' : `${sender.first}’s ${goal.goal === 'reply' ? 'inbox' : 'calendar'}, connected`}</span>
          </span>
        </div>
        <div key={goal.goal} data-testid="goal-example" className="flex animate-[fade_.2s_ease-out] flex-col overflow-clip rounded-[12px] bg-white shadow-[0_0_0_1px_#EBEBE8,0_2px_6px_-2px_#1112160F]">
          {renderExample()}
        </div>
        <span className="text-[12px] leading-[17px] text-grey-3">
          {goal.goal === 'meeting'
            ? `Any invite with someone from this loop counts, even if they book through ${sender.first}’s link or a teammate adds them.`
            : goal.goal === 'reply'
              ? 'Gifty reads every reply. A clear yes or a request for times counts, an out of office doesn’t.'
              : 'Any new deal in HubSpot at one of their companies counts, whoever creates it.'}
        </span>
      </div>

      <div className="flex flex-col px-6 pb-1.5 pt-4">
        <span className="text-[12.5px] font-semibold leading-4 text-grey-1">The moment they {bookVerb}</span>
        <MomentRow
          media={<span className="h-8 w-8 shrink-0 rounded-[8px] bg-cover bg-center" style={{ backgroundImage: `url(${asset(giftImg)})` }} />}
          title="Their loop stops, the gift stays home"
          sub={avg ? `About $${avg} goes back to the budget` : 'Nothing else goes out to them'}
          right={<span className="text-[12px] leading-4 text-grey-3">Always</span>}
        />
        <MomentRow
          media={
            <span className={TILE}>
              <SlackMark />
            </span>
          }
          title={`Ping ${sender.first} in #q4-pipeline`}
          sub={`“${first} from ${company} booked for ${meetingDay.split(' ')[0]}”`}
          right={<Toggle on={goal.slack} onChange={(slack) => update({ slack })} label="Ping in Slack" />}
        />
        <MomentRow
          last
          media={
            <span className={TILE}>
              <HubSpotMark size={18} />
            </span>
          }
          title="Create a HubSpot deal"
          sub={`Stage: Meeting booked, owner ${sender.first}`}
          right={<Toggle on={goal.deal} onChange={(deal) => update({ deal })} label="Create a HubSpot deal" />}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line-soft px-6 py-[14px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium leading-4 text-ink">Everyone else finishes</span>
          <span className="text-[12px] leading-4 text-grey-3">
            {goal.end} days after their {gift ? 'gift lands' : 'last step'}
          </span>
        </div>
        <Select<string>
          variant="pill"
          options={AFTER.map(String)}
          value={String(goal.end)}
          onChange={(v) => update({ end: Number(v) })}
          render={(v) => (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="#6E6F7C" strokeWidth="1.4" />
                <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="#6E6F7C" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {endLabel(Number(v))}
            </>
          )}
        />
      </div>
    </PanelFrame>
  )
}
