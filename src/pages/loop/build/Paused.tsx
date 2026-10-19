// 10 · "Loop paused" card on the canvas, and 11 · the review of changes before resuming.
import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { fmtTime } from '@/lib/time'
import type { Change } from '@/store/graph'
import type { Loop } from '@/store/types'

const KIND: Record<Change['kind'], string> = { added: 'Added', removed: 'Removed', edited: 'Edited' }

export function PausedCard({ loop, changes, discarded, onDiscard, onUndo }: { loop: Loop; changes: Change[]; discarded: boolean; onDiscard: () => void; onUndo: () => void }) {
  return (
    <div data-ui data-testid="paused-card" className="flex w-[304px] flex-col rounded-[16px] bg-white shadow-[0_0_0_1px_#EBEBE8,0_12px_32px_-16px_#1112162E]">
      <div className="flex items-start gap-3 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-amber-bg">
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden>
            <path d="M5.5 3.5v9M10.5 3.5v9" fill="none" stroke="#9A5B00" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[14px] font-semibold leading-[18px] text-ink">Loop paused</span>
          <span className="text-[12.5px] leading-[17px] text-grey-2">Nothing new goes out. What already went out stays as it is.</span>
        </div>
      </div>
      {changes.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-line-soft px-4 py-3.5">
          <span className="text-[12px] font-semibold leading-4 text-grey-1">Your changes</span>
          {changes.slice(0, 4).map((c) => (
            <div key={c.id + c.kind} className="flex items-center gap-2.5">
              <span className="flex-1 truncate text-[12.5px] font-medium leading-4 text-ink">{c.title}</span>
              <span className="text-[12px] leading-4 text-grey-3">{KIND[c.kind]}</span>
            </div>
          ))}
          {changes.length > 4 && <span className="text-[12px] leading-4 text-grey-3">and {changes.length - 4} more</span>}
        </div>
      )}
      <div className="flex items-center justify-between rounded-b-[16px] border-t border-line-soft bg-[#FBFBFA] px-4 py-3">
        {discarded ? (
          <>
            <span className="text-[12.5px] leading-4 text-grey-3">Changes discarded</span>
            <button onClick={onUndo} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline">
              Undo
            </button>
          </>
        ) : changes.length ? (
          <>
            <button onClick={onDiscard} data-testid="discard-changes" className="cursor-pointer text-[12.5px] font-medium leading-4 text-grey-1 hover:text-ink">
              Discard changes
            </button>
            <span className="text-[12px] leading-4 text-grey-3">by Priya, {fmtTime(loop.updatedAt)}</span>
          </>
        ) : (
          <span className="text-[12.5px] leading-4 text-grey-3">Click a step that hasn’t gone out yet to change it</span>
        )}
      </div>
    </div>
  )
}

export function ResumeModal({ changes, pausedFor, stays, onKeepPaused, onResume }: { changes: Change[]; pausedFor: string; stays: string[]; onKeepPaused: () => void; onResume: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onKeepPaused()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKeepPaused])
  const n = changes.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 animate-[fade_.15s_ease-out] bg-[#11121652]" onClick={onKeepPaused} />
      <div role="dialog" aria-modal data-testid="resume-modal" className="relative flex w-[560px] animate-[fade_.15s_ease-out] flex-col overflow-clip rounded-[20px] bg-white shadow-[0_24px_64px_-24px_#11121673]">
        <div className="flex flex-col gap-1.5 px-6 pb-5 pt-6">
          <span className="text-[20px] font-semibold leading-[26px] tracking-[-0.01em] text-ink">{n ? `Resume with ${n} ${n === 1 ? 'change' : 'changes'}?` : 'Resume the loop?'}</span>
          <span className="text-[13.5px] leading-5 text-grey-2">Paused for {pausedFor}. Everyone picks up from where they were{n ? ', on the new version' : ''}.</span>
        </div>
        <Section title="What changes">
          {n ? (
            <div className="flex flex-col gap-2">
              {changes.map((c) => (
                <div key={c.id + c.kind} className="flex items-center gap-3.5 rounded-[14px] bg-white p-3.5 shadow-[0_0_0_1.5px_#6559F7]">
                  <div className="flex flex-1 flex-col gap-[3px]">
                    <span className="text-[14px] font-medium leading-[18px] text-ink">{c.title}</span>
                    <span className="text-[12.5px] leading-4 text-grey-3">{c.kind === 'removed' ? 'Nobody gets this step from now on' : c.kind === 'added' ? 'Everyone who hasn’t passed this point gets it' : 'Goes out on the new version from now on'}</span>
                  </div>
                  <span className={cn('text-[13px] font-semibold leading-4', c.kind === 'removed' ? 'text-[#C2410C]' : 'text-violet-link')}>{KIND[c.kind]}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[13px] leading-[18px] text-grey-2">Nothing. The loop carries on exactly as it was.</span>
          )}
        </Section>
        <Section title="Stays as it is">
          <div className="flex flex-col gap-2.5">
            {stays.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="flex w-6 shrink-0 justify-center">
                  <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
                    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="#1E8A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[13px] leading-[18px] text-[#33353C]">{s}</span>
              </div>
            ))}
          </div>
        </Section>
        <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">
          <button onClick={onKeepPaused} className="flex h-10 cursor-pointer items-center rounded-[10px] bg-white px-4 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover">
            Keep paused
          </button>
          <button data-testid="resume" onClick={onResume} className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-4 text-[13px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]">
            <PlayGlyph size={12} />
            {n ? 'Resume with changes' : 'Resume loop'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-line-soft px-6 py-5">
      <span className="text-[12.5px] font-semibold leading-4 text-grey-1">{title}</span>
      {children}
    </div>
  )
}

/** Filled play triangle. */
export function PlayGlyph({ size = 13, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="inline-block shrink-0" aria-hidden>
      <path d="M5 3.5v9l7.5-4.5L5 3.5Z" fill={color} />
    </svg>
  )
}
