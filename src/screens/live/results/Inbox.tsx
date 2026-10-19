import { useEffect, useState } from 'react'
import { Avatar, HubSpotMark, Icon } from '@/components/ui'
import { GIFT, asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import type { Reply } from './data'

type Props = {
  replies: Reply[]
  selected: Reply
  onSelect: (id: string) => void
  sent: Set<string>
  onSend: (id: string) => void
}

/** Reply list on the left, the open conversation + Gifty's draft on the right. */
export function Inbox({ replies, selected, onSelect, sent, onSend }: Props) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-card bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.04),0_12px_32px_-16px_rgba(17,18,22,.08)]">
      <div className="flex w-80 shrink-0 flex-col gap-0.5 border-r border-line-soft bg-[#FBFBFA] p-2">
        {replies.map((r) => (
          <ReplyRow key={r.id} r={r} active={r.id === selected.id} answered={sent.has(r.id)} onClick={() => onSelect(r.id)} />
        ))}
      </div>
      <Conversation key={selected.id} r={selected} answered={sent.has(selected.id)} onSend={() => onSend(selected.id)} />
    </div>
  )
}

function ReplyRow({ r, active, answered, onClick }: { r: Reply; active: boolean; answered: boolean; onClick: () => void }) {
  const intentColor = r.intent.tone === 'green' ? 'text-green-text' : 'text-violet-edge'
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex cursor-pointer gap-3 rounded-[12px] px-3 py-[14px] text-left transition-colors',
        active ? 'bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.05)]' : 'hover:bg-[#F4F4F2]',
      )}
    >
      <Avatar id={r.face} size={36} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline justify-between">
          <span className="text-[13.5px] font-semibold leading-4 text-ink">{r.name}</span>
          <span className="text-[12px] leading-4 text-grey-3">{r.time}</span>
        </span>
        <span className="text-[12.5px] leading-[17px] text-grey-1">{r.preview}</span>
        <span className={cn('text-[12px] font-medium leading-4', answered ? 'text-grey-3' : intentColor)}>
          {answered ? 'Sam answered' : r.intent.label}
        </span>
      </span>
    </button>
  )
}

function Conversation({ r, answered, onSend }: { r: Reply; answered: boolean; onSend: () => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(r.draft)
  const [overridden, setOverridden] = useState(false)
  const [thread, setThread] = useState(false)

  useEffect(() => setEditing(false), [answered])

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-line-soft px-6 py-[18px]">
        <Avatar id={r.face} size={40} />
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[15px] font-semibold leading-5 text-ink">{r.name}</span>
          <span className="text-[12.5px] leading-4 text-grey-3">{r.role}</span>
        </div>
        <a className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] bg-fill px-[10px] text-[12.5px] font-medium leading-4 text-ink hover:bg-[#ECECE9]">
          <HubSpotMark size={14} />
          Open in HubSpot
        </a>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        <div className="flex flex-col gap-2">
          <span className="text-[12px] leading-4 text-grey-3">{r.wrote}</span>
          <p className="text-[17px] leading-[26px] text-ink">{r.quote}</p>
          <span className="text-[12.5px] leading-4 text-grey-3">
            {r.inReplyTo} ·{' '}
            <button onClick={() => setThread((t) => !t)} className="cursor-pointer hover:text-ink hover:underline">
              {thread ? 'Hide thread' : 'Show thread'}
            </button>
          </span>
          {thread && (
            <div className="mt-1 rounded-[12px] bg-page px-4 py-3 text-[13px] leading-5 text-grey-1">
              <span className="font-medium text-ink">Sam, Mon 9:00 · </span>
              Quick idea for {r.company}. Saw the team is growing fast and figured outbound is on your
              mind for Q4…
            </div>
          )}
        </div>

        {answered ? (
          <div className="flex items-center gap-2.5 rounded-[12px] bg-[#EAF5EF] px-4 py-3 text-[13px] leading-4 text-green-text">
            <Icon name="check" size={14} strokeWidth={1.8} />
            <span className="font-medium">Sent from Sam’s inbox, just now.</span>
            <span className="text-[#3E9C70]">{r.first}’s reply will land here.</span>
          </div>
        ) : (
          <div className="flex flex-col rounded-[16px] bg-white shadow-[0_0_0_1.5px_#6559F7,0_8px_24px_-12px_rgba(101,89,247,.35)]">
            <div className="flex flex-col gap-[14px] px-5 py-[18px]">
              <span className="text-[12.5px] font-medium leading-4 text-violet-edge">Gifty’s draft, from Sam</span>
              {editing ? (
                <textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  className="-mx-2 resize-none rounded-[8px] bg-fill-hover px-2 py-1 text-[15px] leading-[23px] text-ink outline-none ring-1 ring-line-strong focus:ring-violet/40"
                />
              ) : (
                <p className="text-[15px] leading-[23px] text-ink">{draft}</p>
              )}
              <span className="flex h-8 items-center gap-2 self-start rounded-[8px] bg-fill px-3 text-[12.5px] font-medium leading-4 text-ink">
                <Icon name={r.chip.icon} size={13} strokeWidth={1.4} />
                {r.chip.label}
              </span>
            </div>
            <div className="flex items-center gap-2 border-t border-line-soft px-5 py-[14px]">
              <span className="flex-1 text-[12.5px] leading-4 text-grey-3">Sends from Sam’s inbox</span>
              <button
                onClick={() => setEditing((e) => !e)}
                className="flex h-9 cursor-pointer items-center rounded-[10px] bg-white px-[14px] text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover"
              >
                {editing ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={onSend}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-4 text-[13px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]"
              >
                <Icon name="send" size={13} color="#fff" />
                Send as Sam
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-[12px] bg-page px-4 py-3">
          <img src={asset(GIFT.g2)} alt="" className="h-8 w-8 rounded-[8px] object-cover" />
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[13px] font-medium leading-4 text-ink">{r.stopped.title}</span>
            <span className="text-[12.5px] leading-4 text-grey-3">{overridden ? r.stopped.done : r.stopped.sub}</span>
          </div>
          <button
            onClick={() => setOverridden((o) => !o)}
            className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline"
          >
            {overridden ? 'Undo' : r.stopped.action}
          </button>
        </div>
      </div>
    </div>
  )
}
