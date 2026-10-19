import { useEffect, type ReactNode } from 'react'
import { asset, GIFT } from '@/lib/assets'
import { PlayGlyph } from './shared'

const STAYS: { icon: 'check' | 'lock'; text: string }[] = [
  { icon: 'check', text: 'Already sent: 48 intros, 25 LinkedIn notes, 23 emails' },
  { icon: 'lock', text: '36 postcards are printed and go out as planned' },
  { icon: 'check', text: 'The other 22 gifts are unchanged' },
]

/** 11 · "Resume with 1 change?" centred modal over the paused canvas. */
export function ResumeModal({ onKeepPaused, onResume }: { onKeepPaused: () => void; onResume: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onKeepPaused()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKeepPaused])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 animate-[fade_.15s_ease-out] bg-[#11121652]" onClick={onKeepPaused} />
      <div
        role="dialog"
        aria-modal
        className="relative flex w-[560px] animate-[fade_.15s_ease-out] flex-col overflow-clip rounded-[20px] bg-white shadow-[0_24px_64px_-24px_#11121673]"
      >
        <div className="flex flex-col gap-1.5 px-6 pb-5 pt-6">
          <span className="text-[20px] font-semibold leading-[26px] tracking-[-0.01em] text-ink">Resume with 1 change?</span>
          <span className="text-[13.5px] leading-5 text-grey-2">Paused for 2 hours. Everyone picks up from where they were, on the new version.</span>
        </div>

        <Section title="What changes">
          <div className="flex items-center gap-3.5 rounded-[14px] bg-white p-3.5 shadow-[0_0_0_1.5px_#6559F7]">
            <div className="relative h-11 w-16 shrink-0">
              <img src={asset(GIFT.g1)} alt="" className="absolute left-0 top-1 h-9 w-9 rounded-[9px] object-cover opacity-50" />
              <img src={asset(GIFT.g3)} alt="" className="absolute left-6 top-0.5 h-10 w-10 rounded-[10px] object-cover shadow-[0_0_0_2px_#FFFFFF]" />
            </div>
            <div className="flex flex-1 flex-col gap-[3px]">
              <span className="text-[14px] font-medium leading-[18px] text-ink">14 people get chai instead of the diya set</span>
              <span className="text-[12.5px] leading-4 text-grey-3">Gifts pack Fri 30 Oct, so the swap costs nothing</span>
            </div>
            <span className="text-[13px] font-semibold leading-4 text-green-text">−$84</span>
          </div>
        </Section>

        <Section title="Stays as it is">
          <div className="flex flex-col gap-2.5">
            {STAYS.map((s) => (
              <div key={s.text} className="flex items-center gap-3">
                <span className="flex w-6 shrink-0 justify-center">{s.icon === 'check' ? <CheckGlyph /> : <LockGlyph />}</span>
                <span className="text-[13px] leading-[18px] text-[#33353C]">{s.text}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className="flex items-center gap-3 border-t border-line-soft bg-[#F2F9F5] px-6 py-3.5">
          <svg width="15" height="15" viewBox="0 0 16 16" className="shrink-0" aria-hidden>
            <circle cx="8" cy="8" r="6" fill="none" stroke="#1E8A58" strokeWidth="1.5" />
            <path d="M8 4.8V8l2.2 1.4" fill="none" stroke="#1E8A58" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] leading-[18px] text-[#1E6B45]">Gifts still land by Wed 4 Nov, before Diwali on Sun 8 Nov</span>
        </div>

        <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">
          <button
            onClick={onKeepPaused}
            className="flex h-10 cursor-pointer items-center rounded-[10px] bg-white px-4 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover"
          >
            Keep paused
          </button>
          <button
            onClick={onResume}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-violet px-4 text-[13px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]"
          >
            <PlayGlyph size={12} />
            Resume with changes
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

function CheckGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="#1E8A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" fill="none" stroke="#9A5B00" strokeWidth="1.5" />
      <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="#9A5B00" strokeWidth="1.5" />
    </svg>
  )
}
