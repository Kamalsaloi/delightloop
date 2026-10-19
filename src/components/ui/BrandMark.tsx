import { cn } from '@/lib/cn'

type Size = { size?: number; className?: string }

/** HubSpot: orange circle + white sprocket. Never a letter. */
export function HubSpotMark({ size = 24, className }: Size) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-hubspot', className)} style={{ width: size, height: size }}>
      <svg width={size / 2} height={size / 2} viewBox="0 0 16 16" aria-label="HubSpot">
        <circle cx="9.5" cy="9.5" r="3.2" fill="none" stroke="#fff" strokeWidth="1.8" />
        <path d="M9.5 6.3V3M7.2 11.8 4 15M3.5 4.5l3.6 3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/** LinkedIn: blue rounded square with "in". */
export function LinkedInMark({ size = 16, className, radius }: Size & { radius?: number }) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center bg-linkedin font-bold text-white', className)}
      style={{ width: size, height: size, borderRadius: radius ?? Math.round(size * 0.22), fontSize: Math.round(size * 0.55), lineHeight: 1 }}
      aria-label="LinkedIn"
    >
      in
    </span>
  )
}

/** X (Twitter): black rounded square with the X glyph. */
export function XMark({ size = 16, className }: Size) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-[4px] bg-ink', className)} style={{ width: size, height: size }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" aria-label="X">
        <path fill="#fff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </span>
  )
}

/** Gmail M (multicolour). */
export function GmailMark({ width = 20, className }: { width?: number; className?: string }) {
  return (
    <svg width={width} height={(width * 18) / 24} viewBox="0 0 24 18" className={cn('shrink-0', className)} aria-label="Email">
      <path d="M1.6 18h3.8V8.7L0 4.6v11.8C0 17.3.7 18 1.6 18z" fill="#4285F4" />
      <path d="M18.6 18h3.8c.9 0 1.6-.7 1.6-1.6V4.6l-5.4 4.1V18z" fill="#34A853" />
      <path d="M18.6 1.6v7.1L24 4.6V2.4c0-2-2.3-3.1-3.9-1.9l-1.5 1.1z" fill="#FBBC04" />
      <path d="M5.4 8.7V1.6L12 6.5l6.6-4.9v7.1L12 13.6 5.4 8.7z" fill="#EA4335" />
      <path d="M0 2.4v2.2l5.4 4.1V1.6L3.9.5C2.3-.7 0 .4 0 2.4z" fill="#C5221F" />
    </svg>
  )
}

/** Gmail M inside a 40px white tile with hairline ring (step-card icon slot). */
export function GmailTile({ size = 40 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-[12px] bg-white shadow-[0_0_0_1px_#EBEBE8]" style={{ width: size, height: size }}>
      <GmailMark width={size / 2} />
    </span>
  )
}
