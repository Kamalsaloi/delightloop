import { useId } from 'react'

/** DelightLoop gradient mark (Paper node 91W-0). */
export function Logo({ size = 30 }: { size?: number }) {
  const id = useId()
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 24 24" aria-label="DelightLoop">
        <defs>
          <linearGradient id={id} x1="21.506" x2="2.984" y1="16.417" y2="9.716" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6941C6" />
            <stop offset=".48" stopColor="#D2CEFE" />
            <stop offset="1" stopColor="#6941C6" />
          </linearGradient>
        </defs>
        <path
          d="M2.531 8.623c1.957-2.06 5.137-2.163 7.21-.239 2.123 1.97 4.041 4.44 6.162 6.442 1.657 1.442 4.246.482 4.643-1.737.488-2.735-2.416-4.668-4.544-2.994-.21.165-.456.499-.639.63-.036.024-.062.052-.11.033L13.645 9.04c.785-.915 1.807-1.66 2.971-1.917 2.716-.597 5.355 1.024 6.153 3.81 1.285 4.49-3.023 8.436-7.092 6.611-1.483-.664-3.29-2.945-4.486-4.182-.948-.982-2.026-2.245-3.013-3.13-1.557-1.395-4.038-.766-4.656 1.32-.87 2.93 2.385 5.201 4.654 3.191.104-.092.39-.471.496-.442l1.607 1.718c-.781.928-1.897 1.688-3.08 1.884-5.108.845-8.237-5.527-4.668-9.284z"
          fill={`url(#${id})`}
        />
      </svg>
    </span>
  )
}
