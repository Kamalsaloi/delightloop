// Gifty "reads" a loop description: plain keyword matching against what's in the account.
import { BUDGETS, LISTS, MOMENTS, TEAMMATES, type CrmList, type Moment, type Teammate } from '@/data/catalog'

export type Entity =
  | { kind: 'list'; id: string; label: string; meta: string; list: CrmList }
  | { kind: 'sender'; id: string; label: string; meta: string; teammate: Teammate }
  | { kind: 'moment'; id: string; label: string; meta: string; moment: Moment }
  | { kind: 'budget'; id: string; label: string; meta: string; amount: number }

const fmtDay = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')

export function listEntity(list: CrmList): Entity {
  return { kind: 'list', id: `list:${list.id}`, label: list.name, meta: list.accounts ? `${list.people} people` : `${list.people} people`, list }
}
export function senderEntity(t: Teammate): Entity {
  return { kind: 'sender', id: `sender:${t.id}`, label: t.name, meta: 'sender', teammate: t }
}
export function momentEntity(m: Moment): Entity {
  return { kind: 'moment', id: `moment:${m.id}`, label: m.label, meta: fmtDay(m.date), moment: m }
}
export function budgetEntity(amount: number): Entity {
  return { kind: 'budget', id: `budget:${amount}`, label: `$${amount.toLocaleString('en-US')} budget`, meta: BUDGETS[0].name, amount }
}

function has(text: string, word: string) {
  const w = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${w}([^a-z0-9]|$)`, 'i').test(text)
}

/** Lists score by how many of their keywords appear; ties go to the more specific (smaller) list. */
function matchList(text: string): CrmList | null {
  let best: { list: CrmList; score: number } | null = null
  for (const list of LISTS) {
    let score = 0
    if (has(text, list.name)) score += 10
    for (const k of list.keywords) if (has(text, k)) score += k.includes(' ') ? 3 : 1
    if (score === 0) continue
    if (!best || score > best.score || (score === best.score && list.people < best.list.people)) best = { list, score }
  }
  // "Q4 accounts" alone is the account list; with a role it's the VP Sales list.
  if (best?.list.id === 'q4vp' && best.score === 1 && has(text, 'accounts') && !/vp|head|sales lead/i.test(text)) return LISTS[1]
  return best?.list ?? null
}

function matchBudget(text: string): number | null {
  const m = text.match(/\$\s?(\d[\d,]*(?:\.\d+)?)\s?(k)?/i)
  if (!m) return null
  const n = Number(m[1].replace(/,/g, '')) * (m[2] ? 1000 : 1)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

/** Everything Gifty can link from the words so far, in the order they appear. */
export function extractEntities(text: string): Entity[] {
  const out: { at: number; e: Entity }[] = []
  const pos = (needle: string) => {
    const i = text.toLowerCase().indexOf(needle.toLowerCase())
    return i < 0 ? 9999 : i
  }

  const list = matchList(text)
  if (list) out.push({ at: Math.min(...list.keywords.map(pos), pos(list.name)), e: listEntity(list) })

  for (const t of TEAMMATES) {
    if (has(text, t.first) || has(text, t.name)) out.push({ at: pos(t.first), e: senderEntity(t) })
  }

  for (const m of MOMENTS) {
    const k = m.keywords.find((kw) => has(text, kw))
    if (k) {
      out.push({ at: pos(k), e: momentEntity(m) })
      break
    }
  }

  const amount = matchBudget(text)
  if (amount) out.push({ at: pos('$'), e: budgetEntity(amount) })

  return out.sort((a, b) => a.at - b.at).map((x) => x.e)
}
