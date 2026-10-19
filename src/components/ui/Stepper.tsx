import { Icon } from './Icon'

/** − value + number control. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  suffix,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  suffix?: string
}) {
  return (
    <div className="inline-flex h-9 items-center rounded-[10px] bg-white shadow-[0_0_0_1px_#E4E4E1]">
      <button className="flex h-9 w-9 items-center justify-center text-grey-2 hover:text-ink" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease">
        <Icon name="minus" size={13} />
      </button>
      <span className="min-w-[48px] text-center text-[13px] font-medium tabular-nums text-ink">
        {value}
        {suffix && <span className="font-normal text-grey-2"> {suffix}</span>}
      </span>
      <button className="flex h-9 w-9 items-center justify-center text-grey-2 hover:text-ink" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase">
        <Icon name="plus" size={13} />
      </button>
    </div>
  )
}
