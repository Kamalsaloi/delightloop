// Date formatting in the product's voice ("Mon 26 Oct", "Tue 27 Oct, 8:40").
export const DAY = 86_400_000

export function fmtDay(t: number | Date) {
  const d = new Date(t)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')
}
export function fmtShort(t: number | Date) {
  const d = new Date(t)
  return `${d.toLocaleDateString('en-GB', { weekday: 'short' })} ${d.getDate()}`
}
export function fmtTime(t: number | Date) {
  const d = new Date(t)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
export function fmtDayTime(t: number | Date) {
  return `${fmtDay(t)}, ${fmtTime(t)}`
}
/** "8:12" today, "Mon" earlier this week, "26 Oct" otherwise. */
export function fmtWhen(t: number, now: number) {
  const d = new Date(t)
  const n = new Date(now)
  if (d.toDateString() === n.toDateString()) return fmtTime(t)
  if (now - t < 6 * DAY) return d.toLocaleDateString('en-GB', { weekday: 'short' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
/** "2h ago", "today", "yesterday", "3 days ago". */
export function fmtAgo(t: number, now: number) {
  const mins = Math.max(0, Math.round((now - t) / 60000))
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 12) return `${hours}h ago`
  if (new Date(t).toDateString() === new Date(now).toDateString()) return 'today'
  const days = Math.round((now - t) / DAY)
  return days <= 1 ? 'yesterday' : `${days} days ago`
}
/** Next Monday 9:00 strictly after `now` (or today if it's Monday before 9). */
export function nextMonday(now: number) {
  const d = new Date(now)
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9)
  if (d.getDay() === 1 && d.getHours() < 9) return start.getTime()
  const add = (8 - d.getDay()) % 7 || 7
  return start.getTime() + add * DAY
}
export function money(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`
}
export function greeting(now: number) {
  const h = new Date(now).getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
