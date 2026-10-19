import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'

type AvatarProps = { id: string; size?: number; ring?: boolean; className?: string; alt?: string }

/** Round face photo. `id` is a Paper asset id. */
export function Avatar({ id, size = 32, ring, className, alt = '' }: AvatarProps) {
  return (
    <img
      src={asset(id)}
      alt={alt}
      width={size}
      height={size}
      className={cn('shrink-0 rounded-full object-cover', ring && 'border-2 border-white', className)}
      style={{ width: size, height: size }}
    />
  )
}

/** Overlapping faces; `step` is the horizontal offset between faces. */
export function AvatarStack({ ids, size = 24, step, extra }: { ids: string[]; size?: number; step?: number; extra?: string }) {
  const s = step ?? Math.round(size * 0.66)
  const count = ids.length + (extra ? 1 : 0)
  return (
    <div className="relative shrink-0" style={{ width: size + s * (count - 1), height: size }}>
      {ids.map((id, i) => (
        <span key={id + i} className="absolute top-0" style={{ left: i * s }}>
          <Avatar id={id} size={size} ring />
        </span>
      ))}
      {extra && (
        <span
          className="absolute top-0 flex items-center justify-center rounded-full border-2 border-white bg-amber-bg text-[10px] font-medium text-amber-text"
          style={{ left: ids.length * s, width: size, height: size }}
        >
          {extra}
        </span>
      )}
    </div>
  )
}
