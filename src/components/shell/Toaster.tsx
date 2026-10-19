import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/store'

/** Light toasts, bottom centre. Each clears itself after 3s (5s with an action). */
export function Toaster() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  const navigate = useNavigate()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          data-testid="toast"
          className="pointer-events-auto flex max-w-[560px] animate-[toastIn_.2s_ease-out] items-center gap-3 rounded-[12px] bg-white py-2.5 pl-4 pr-2.5 shadow-[0_0_0_1px_#EBEBE8,0_12px_32px_-12px_#11121633,0_2px_6px_#1112160D]"
        >
          <span className="text-[13px] leading-[18px] text-ink">{t.text}</span>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action?.run?.()
                if (t.action?.to) navigate(t.action.to)
                dismiss(t.id)
              }}
              className="shrink-0 cursor-pointer rounded-[8px] px-2 py-1 text-[13px] font-medium leading-4 text-violet-link hover:bg-violet-soft"
            >
              {t.action.label}
            </button>
          )}
          {!t.action && <span className="w-1.5" />}
        </div>
      ))}
    </div>
  )
}
