import type { Branch, CheckData, FlowNode, Graph, Slot, SplitKind, StepNode, WaitData } from './types'

let seq = 0
/** Short unique id. */
export function uid(prefix = 'n') {
  seq += 1
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`
}

// ── Lookup ──────────────────────────────────────────────────────────────────

/** The node list for a sequence id ('root' or a branch id). */
export function findSeq(steps: FlowNode[], seqId: string): FlowNode[] | null {
  if (seqId === 'root') return steps
  for (const n of steps) {
    if (n.kind !== 'split') continue
    for (const b of n.branches) {
      if (b.id === seqId) return b.steps
      const inner = findSeq(b.steps, seqId)
      if (inner) return inner
    }
  }
  return null
}

export type Located = { node: FlowNode; seqId: string; index: number; parentSplit: string | null }

export function locate(steps: FlowNode[], id: string, seqId = 'root', parentSplit: string | null = null): Located | null {
  for (let i = 0; i < steps.length; i++) {
    const n = steps[i]
    if (n.id === id) return { node: n, seqId, index: i, parentSplit }
    if (n.kind === 'split') {
      for (const b of n.branches) {
        const hit = locate(b.steps, id, b.id, n.id)
        if (hit) return hit
      }
    }
  }
  return null
}

/** Depth-first, in reading order (a split before its branches, left branch first). */
export function flatten(steps: FlowNode[]): FlowNode[] {
  const out: FlowNode[] = []
  for (const n of steps) {
    out.push(n)
    if (n.kind === 'split') for (const b of n.branches) out.push(...flatten(b.steps))
  }
  return out
}

export const allSteps = (g: Graph) => flatten(g.steps).filter((n): n is StepNode => n.kind === 'step')
export const stepsOfType = <T extends StepNode['type']>(g: Graph, type: T) =>
  allSteps(g).filter((n): n is Extract<StepNode, { type: T }> => n.type === type)
export const nodeCount = (g: Graph) => flatten(g.steps).length + (g.goal ? 1 : 0)

// ── Immutable edits ─────────────────────────────────────────────────────────

function mapSeq(steps: FlowNode[], seqId: string, fn: (s: FlowNode[]) => FlowNode[]): FlowNode[] {
  if (seqId === 'root') return fn(steps)
  return steps.map((n) => {
    if (n.kind !== 'split') return n
    return {
      ...n,
      branches: n.branches.map((b) => (b.id === seqId ? { ...b, steps: fn(b.steps) } : { ...b, steps: mapSeq(b.steps, seqId, fn) })) as [Branch, Branch],
    }
  })
}

export function insertAt(g: Graph, slot: Slot, node: FlowNode): Graph {
  return { ...g, steps: mapSeq(g.steps, slot.seqId, (s) => [...s.slice(0, slot.index), node, ...s.slice(slot.index)]) }
}

export function removeNode(g: Graph, id: string): Graph {
  const at = locate(g.steps, id)
  if (!at) return g
  return { ...g, steps: mapSeq(g.steps, at.seqId, (s) => s.filter((n) => n.id !== id)) }
}

export function updateNode(g: Graph, id: string, fn: (n: FlowNode) => FlowNode): Graph {
  const walk = (steps: FlowNode[]): FlowNode[] =>
    steps.map((n) => {
      if (n.id === id) return fn(n)
      if (n.kind === 'split') return { ...n, branches: n.branches.map((b) => ({ ...b, steps: walk(b.steps) })) as [Branch, Branch] }
      return n
    })
  return { ...g, steps: walk(g.steps) }
}

/** Deep copy with fresh ids. */
export function cloneNode(n: FlowNode): FlowNode {
  if (n.kind === 'step') return { ...n, id: uid('s'), data: structuredClone(n.data) } as FlowNode
  return {
    ...n,
    id: uid('c'),
    data: { ...n.data, days: [...n.data.days] },
    branches: n.branches.map((b) => ({ id: uid('b'), steps: b.steps.map(cloneNode) })) as [Branch, Branch],
  }
}

export function duplicateNode(g: Graph, id: string): { graph: Graph; newId: string | null } {
  const at = locate(g.steps, id)
  if (!at) return { graph: g, newId: null }
  const copy = cloneNode(at.node)
  return { graph: insertAt(g, { seqId: at.seqId, index: at.index + 1 }, copy), newId: copy.id }
}

// ── Partial reveal (drafting animation) ─────────────────────────────────────

/** The first `n` nodes in reading order, keeping structure. The goal counts as the last node. */
export function partialGraph(g: Graph, n: number): Graph {
  let left = n
  const take = (steps: FlowNode[]): FlowNode[] => {
    const out: FlowNode[] = []
    for (const node of steps) {
      if (left <= 0) break
      left -= 1
      if (node.kind === 'split') out.push({ ...node, branches: node.branches.map((b) => ({ ...b, steps: take(b.steps) })) as [Branch, Branch] })
      else out.push(node)
    }
    return out
  }
  const steps = take(g.steps)
  return { steps, goal: left > 0 ? g.goal : null }
}

// ── Days ────────────────────────────────────────────────────────────────────

export const DAY_MS = 86_400_000
/** Days between a gift shipping and landing. */
export const GIFT_TRANSIT = 2

export function waitDays(w: WaitData, from: number): number {
  if (w.unit === 'hours') return w.count / 24
  if (w.unit === 'days') return w.count
  // Weekdays: count forward from the start date, skipping weekends.
  let d = new Date(from)
  let left = w.count
  let days = 0
  while (left > 0) {
    d = new Date(d.getTime() + DAY_MS)
    days += 1
    if (d.getDay() !== 0 && d.getDay() !== 6) left -= 1
  }
  return days
}

/** Loop day of every node (and 'goal' / 'end'). Splits are the day of their check. */
export function nodeDays(g: Graph, startAt: number): Record<string, number> {
  const out: Record<string, number> = {}
  const walk = (steps: FlowNode[], from: number): number => {
    let day = from
    for (const n of steps) {
      day += n.delay
      if (n.kind === 'split') {
        day += waitDays(n.data, startAt + day * DAY_MS)
        out[n.id] = day
        const ends = n.branches.map((b) => walk(b.steps, day))
        day = Math.max(day, ...ends)
      } else {
        if (n.type === 'wait') day += waitDays(n.data, startAt + day * DAY_MS)
        out[n.id] = day
      }
    }
    return day
  }
  const last = walk(g.steps, 0)
  out.goal = last
  // Gifts land two days after they ship; everyone else finishes `goal.end` days after that.
  const after = g.goal?.end ?? 2
  const giftDays = stepsOfType(g, 'gift').map((s) => out[s.id] + GIFT_TRANSIT + after)
  out.end = Math.max(last + after + 2, ...giftDays, 3)
  return out
}

// ── Split labels ────────────────────────────────────────────────────────────

export const SPLIT_PATHS: Record<SplitKind, [string, string]> = {
  opened: ['Opened', 'Not opened'],
  twice: ['Opened twice', 'Opened once or not'],
  clicked: ['Clicked', 'Didn’t click'],
  linkedin: ['Has LinkedIn', 'No LinkedIn'],
  delivered: ['Delivered', 'Not yet'],
}

export const SPLIT_QUESTION: Record<SplitKind, string> = {
  opened: 'Opened the email?',
  twice: 'Opened it twice?',
  clicked: 'Clicked a link?',
  linkedin: 'Has LinkedIn?',
  delivered: 'Gift delivered?',
}

export function waitLabel(w: WaitData) {
  const unit = w.unit === 'weekdays' ? 'weekday' : w.unit === 'days' ? 'day' : 'hour'
  return `After ${w.count} ${unit}${w.count === 1 ? '' : 's'}`
}

export function newSplit(split: SplitKind, wait: Partial<CheckData> = {}): FlowNode {
  return {
    id: uid('c'),
    kind: 'split',
    delay: 0,
    data: { count: 2, unit: 'weekdays', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], window: '9:00 to 17:00, their time', split, ...wait },
    branches: [
      { id: uid('b'), steps: [] },
      { id: uid('b'), steps: [] },
    ],
  }
}

// ── Diff (paused → review) ──────────────────────────────────────────────────

export type Change = { kind: 'added' | 'removed' | 'edited'; id: string; title: string }

export function nodeTitle(n: FlowNode): string {
  if (n.kind === 'split') return `Check: ${SPLIT_QUESTION[n.data.split]}`
  if (n.type === 'wait') return `Wait ${n.data.count} ${n.data.unit}`
  return n.data.title || 'Untitled step'
}

export function diffGraphs(before: Graph, after: Graph): Change[] {
  const a = new Map(flatten(before.steps).map((n) => [n.id, n]))
  const b = new Map(flatten(after.steps).map((n) => [n.id, n]))
  const out: Change[] = []
  for (const [id, n] of b) {
    const old = a.get(id)
    if (!old) out.push({ kind: 'added', id, title: nodeTitle(n) })
    else if (JSON.stringify(old.data) !== JSON.stringify(n.data) || old.delay !== n.delay) out.push({ kind: 'edited', id, title: nodeTitle(n) })
  }
  for (const [id, n] of a) if (!b.has(id)) out.push({ kind: 'removed', id, title: nodeTitle(n) })
  if (JSON.stringify(before.goal) !== JSON.stringify(after.goal)) out.push({ kind: after.goal ? (before.goal ? 'edited' : 'added') : 'removed', id: 'goal', title: 'The goal' })
  return out
}
