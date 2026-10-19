import { asset, GIFT } from '@/lib/assets'

/** 10's "Loop paused" card, pinned top-left of the canvas (CanvasLayout railTop). */
export function PausedCard({ discarded, onDiscard, onUndo }: { discarded: boolean; onDiscard: () => void; onUndo: () => void }) {
  return (
    <div className="flex w-[304px] flex-col rounded-[16px] bg-white shadow-[0_0_0_1px_#EBEBE8,0_12px_32px_-16px_#1112162E]">
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

      {!discarded && (
        <div className="flex flex-col gap-2.5 border-t border-line-soft px-4 py-3.5">
          <span className="text-[12px] font-semibold leading-4 text-grey-1">Your changes</span>
          <div className="flex items-center gap-2.5">
            <img src={asset(GIFT.g3)} alt="" className="h-7 w-7 shrink-0 rounded-[7px] object-cover" />
            <div className="flex flex-1 flex-col gap-px">
              <span className="text-[12.5px] font-medium leading-4 text-ink">Diwali gift</span>
              <span className="text-[12px] leading-4 text-grey-3">14 swapped from diya to chai</span>
            </div>
          </div>
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
        ) : (
          <>
            <button onClick={onDiscard} className="cursor-pointer text-[12.5px] font-medium leading-4 text-grey-1 hover:text-ink">
              Discard changes
            </button>
            <span className="text-[12px] leading-4 text-grey-3">by Priya, 10:05</span>
          </>
        )}
      </div>
    </div>
  )
}
