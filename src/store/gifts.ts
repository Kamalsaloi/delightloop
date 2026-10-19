import { giftById, GIFTS } from '@/data/catalog'
import { activePeople } from './sim'
import type { GiftData, Loop } from './types'

/** Who gets which gift: picks fill the audience in order, the user's swaps win. */
export function giftAssignments(loop: Loop, data: GiftData): Record<string, string> {
  const out: Record<string, string> = {}
  const people = activePeople(loop)
  let i = 0
  for (const pick of data.picks) {
    for (let k = 0; k < pick.people && i < people.length; k++, i++) out[people[i].slug] = pick.giftId
  }
  for (; i < people.length; i++) out[people[i].slug] = data.picks[0]?.giftId ?? 'chai'
  for (const [slug, giftId] of Object.entries(data.swaps)) if (out[slug]) out[slug] = giftId
  return out
}

/** Why Gifty matched a gift to someone, in a few words. */
export function giftReason(giftId: string) {
  return giftById(giftId).why
}

/** Gallery gifts that aren't already picked, cheapest first. */
export function alternatives(exclude: string[]) {
  return GIFTS.filter((g) => !exclude.includes(g.id)).sort((a, b) => a.price - b.price)
}
