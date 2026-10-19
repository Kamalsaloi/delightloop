import { useEffect, useState } from 'react'
import { asset, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { PEOPLE_FACE, SWAP_OPTIONS } from './data'
import { InspectorClose } from './Inspector'

const CURRENT_PRICE = 68

/** 04a · swap one person's gift. Scrim + 600px modal; Esc / scrim / × / "Keep" close, primary commits. */
export function SwapGiftModal({ onClose, onCommit }: { onClose: () => void; onCommit: (optionId: string) => void }) {
  const [pick, setPick] = useState<string>(SWAP_OPTIONS[0].id)
  const choice = SWAP_OPTIONS.find((o) => o.id === pick) ?? SWAP_OPTIONS[0]
  const delta = CURRENT_PRICE - choice.price

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#11121652] animate-[fade_.15s_ease-out]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className="relative flex w-[600px] shrink-0 flex-col overflow-clip rounded-card bg-white shadow-[0_24px_64px_-24px_#11121673] animate-[fade_.15s_ease-out]"
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <img src={asset(PEOPLE_FACE.ananya)} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-ink">Gift for Ananya Rao</span>
              <span className="text-[12.5px] leading-4 text-grey-3">VP Sales, Kestrel Labs · Bengaluru</span>
            </div>
          </div>
          <InspectorClose onClick={onClose} />
        </div>

        <div className="flex gap-4 p-6">
          <span className="h-24 w-24 shrink-0 rounded-[14px] bg-cover bg-center" style={{ backgroundImage: `url(${asset(GIFT.g1)})` }} />
          <div className="flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold leading-5 text-ink">Brass diya set</span>
              <span className="rounded-full bg-fill px-2 py-1 text-[12px] font-medium leading-4 text-grey-1">Gifty’s pick</span>
            </div>
            <p className="m-0 text-[13.5px] leading-5 text-grey-1">
              She’s in Bengaluru and posted photos of lighting diyas with her team last Diwali. $68 with card and shipping.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6">
          <div className="flex items-baseline justify-between">
            <span className="text-[13.5px] font-semibold leading-4 text-ink">Other good fits for her</span>
            <button type="button" className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline underline-offset-2">
              Browse the gallery
            </button>
          </div>
          <div className="flex gap-3">
            {SWAP_OPTIONS.map((o) => {
              const active = o.id === pick
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setPick(o.id)}
                  className={cn(
                    'flex grow basis-0 cursor-pointer flex-col gap-3 rounded-[14px] px-2 pb-3 pt-2 text-left transition-shadow',
                    active ? 'shadow-[inset_0_0_0_1.5px_#6559F7]' : 'shadow-[inset_0_0_0_1px_#EBEBE8] hover:shadow-[inset_0_0_0_1px_#D6D6D2]',
                  )}
                >
                  <span className="h-28 w-full shrink-0 rounded-[10px] bg-cover bg-center" style={{ backgroundImage: `url(${asset(o.img)})` }} />
                  <span className="flex flex-col gap-1 px-1">
                    <span className="text-[13px] font-semibold leading-4 text-ink">{o.name}</span>
                    <span className="text-[12px] leading-4 text-grey-3">
                      ${o.price} · {o.note}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line-soft bg-fill-hover px-6 py-4">
          <span className="text-[13px] leading-4 text-grey-1">
            {delta >= 0 ? `Saves $${delta} on this loop` : `Adds $${-delta} to this loop`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-[10px] bg-white px-4 py-3 text-[13.5px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover"
            >
              Keep the diya set
            </button>
            <button
              type="button"
              onClick={() => onCommit(choice.id)}
              className="cursor-pointer rounded-[10px] bg-violet px-4 py-3 text-[13.5px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0]"
            >
              Give the {choice.short}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
