import { cn } from '@/lib/cn'

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        'relative h-5 w-[34px] shrink-0 rounded-full transition-colors',
        on ? 'bg-violet shadow-primary' : 'bg-[#DCDCD8]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(17,18,22,.2)] transition-[left]',
          on ? 'left-4' : 'left-0.5',
        )}
      />
    </button>
  )
}
