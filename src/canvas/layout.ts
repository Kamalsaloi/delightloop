// Lays the step graph out top-to-bottom around x = 0 and draws connectors from node positions.
// Heights come from measured DOM sizes (ResizeObserver) with sensible defaults before first measure.
import type { FlowNode, Graph, Slot, SplitNode } from '@/store/types'

export const GAP = 16 // connector between nodes
export const BRACKET = 24 // split fan-out / merge height
export const LABEL_GAP = 8 // branch label → first node
export const COL_GAP = 32
export const ROOT_W = 320
export const BRANCH_W = 280
const R = 16 // corner radius of the bracket curves

export type BoxKind = 'audience' | 'step' | 'split' | 'wait' | 'goal' | 'label' | 'branchSlot' | 'endSlot'

export type Box = {
  id: string
  kind: BoxKind
  /** Centre x and top y, in layer coordinates. */
  x: number
  y: number
  w: number
  h: number
  node?: FlowNode
  /** For labels and branch slots: which split / branch. */
  split?: SplitNode
  branch?: 0 | 1
  seqId: string
  index: number
  inBranch: boolean
}

export type Insert = { key: string; slot: Slot; x: number; y: number }
export type Layout = { boxes: Box[]; paths: string[]; inserts: Insert[]; bounds: { x: number; y: number; w: number; h: number } }
export type Sizes = Record<string, { w: number; h: number }>

const DEFAULT_H: Record<BoxKind, number> = { audience: 40, step: 123, split: 32, wait: 32, goal: 32, label: 24, branchSlot: 122, endSlot: 56 }
const DEFAULT_W: Record<BoxKind, number> = { audience: 360, step: ROOT_W, split: 300, wait: 180, goal: 210, label: 90, branchSlot: BRANCH_W, endSlot: ROOT_W }

function seqWidth(steps: FlowNode[], inBranch: boolean): number {
  const base = inBranch ? BRANCH_W : ROOT_W
  return Math.max(base, ...steps.map((n) => (n.kind === 'split' ? splitWidth(n) : base)))
}
const colWidth = (steps: FlowNode[]) => Math.max(BRANCH_W, seqWidth(steps, true))
export const splitWidth = (n: SplitNode) => colWidth(n.branches[0].steps) + COL_GAP + colWidth(n.branches[1].steps)

type Opts = { editable: boolean; sizes: Sizes; endSlot: boolean }

export function layoutGraph(graph: Graph, opts: Opts): Layout {
  const boxes: Box[] = []
  const paths: string[] = []
  const inserts: Insert[] = []
  const { sizes, editable } = opts

  const h = (id: string, kind: BoxKind) => sizes[id]?.h ?? DEFAULT_H[kind]
  const w = (id: string, kind: BoxKind) => sizes[id]?.w ?? DEFAULT_W[kind]
  const line = (x: number, y1: number, y2: number) => y2 > y1 && paths.push(`M${x} ${y1}V${y2}`)

  type Point = { x: number; bottom: number }

  /** Lays a sequence below `entry`; returns the point the next thing connects from. */
  function seq(steps: FlowNode[], seqId: string, x: number, entry: Point, top: number, inBranch: boolean): Point {
    let prev = entry
    let cursor = top
    steps.forEach((n, i) => {
      line(x, prev.bottom, cursor)
      if (editable) inserts.push({ key: `${seqId}:${i}`, slot: { seqId, index: i }, x, y: (prev.bottom + cursor) / 2 })
      if (n.kind === 'step') {
        const kind: BoxKind = n.type === 'wait' ? 'wait' : 'step'
        const bh = h(n.id, kind)
        boxes.push({ id: n.id, kind, x, y: cursor, w: kind === 'step' ? (inBranch ? BRANCH_W : ROOT_W) : w(n.id, kind), h: bh, node: n, seqId, index: i, inBranch })
        prev = { x, bottom: cursor + bh }
        cursor = prev.bottom + GAP
        return
      }
      // Split: check pill, fan out to two columns, lay each branch, merge back.
      const ph = h(n.id, 'split')
      boxes.push({ id: n.id, kind: 'split', x, y: cursor, w: w(n.id, 'split'), h: ph, node: n, seqId, index: i, inBranch })
      const pillBottom = cursor + ph
      const yh = pillBottom + GAP
      const colsTop = yh + BRACKET
      const wl = colWidth(n.branches[0].steps)
      const wr = colWidth(n.branches[1].steps)
      const total = wl + COL_GAP + wr
      const centers = [x - total / 2 + wl / 2, x + total / 2 - wr / 2]
      paths.push(`M${x} ${pillBottom}V${yh}`)
      const ends: Point[] = []
      n.branches.forEach((b, bi) => {
        const cx = centers[bi]
        const dir = Math.sign(cx - x) || 1
        paths.push(`M${x} ${yh}H${cx - dir * R}Q${cx} ${yh} ${cx} ${yh + R}V${colsTop}`)
        const labelId = `${b.id}:label`
        const lh = h(labelId, 'label')
        boxes.push({ id: labelId, kind: 'label', x: cx, y: colsTop, w: w(labelId, 'label'), h: lh, split: n, branch: bi as 0 | 1, seqId: b.id, index: -1, inBranch: true })
        const labelBottom = colsTop + lh
        const firstTop = labelBottom + LABEL_GAP
        if (b.steps.length === 0 && editable) {
          const sid = `${b.id}:slot`
          const sh = h(sid, 'branchSlot')
          line(cx, labelBottom, firstTop)
          boxes.push({ id: sid, kind: 'branchSlot', x: cx, y: firstTop, w: BRANCH_W, h: sh, split: n, branch: bi as 0 | 1, seqId: b.id, index: 0, inBranch: true })
          ends.push({ x: cx, bottom: firstTop + sh })
        } else {
          const end = seq(b.steps, b.id, cx, { x: cx, bottom: labelBottom }, firstTop, true)
          if (editable && b.steps.length) inserts.push({ key: `${b.id}:${b.steps.length}`, slot: { seqId: b.id, index: b.steps.length }, x: cx, y: end.bottom + GAP / 2 })
          ends.push(end)
        }
      })
      const mergeTop = Math.max(...ends.map((e) => e.bottom)) + GAP
      const yl = mergeTop + BRACKET
      ends.forEach((e) => {
        const dir = Math.sign(e.x - x) || 1
        paths.push(`M${e.x} ${e.bottom}V${yl - R}Q${e.x} ${yl} ${e.x - dir * R} ${yl}H${x}`)
      })
      prev = { x, bottom: yl }
      cursor = yl + GAP
    })
    return prev
  }

  const audH = h('audience', 'audience')
  boxes.push({ id: 'audience', kind: 'audience', x: 0, y: 0, w: w('audience', 'audience'), h: audH, seqId: 'root', index: -1, inBranch: false })
  const end = seq(graph.steps, 'root', 0, { x: 0, bottom: audH }, audH + GAP, false)
  let cursor = end.bottom + GAP
  let prev = end

  if (opts.endSlot) {
    const eh = h('endSlot', 'endSlot')
    line(0, prev.bottom, cursor)
    boxes.push({ id: 'endSlot', kind: 'endSlot', x: 0, y: cursor, w: ROOT_W, h: eh, seqId: 'root', index: graph.steps.length, inBranch: false })
    prev = { x: 0, bottom: cursor + eh }
    cursor = prev.bottom + GAP
  } else if (editable && graph.steps.length) {
    inserts.push({ key: `root:${graph.steps.length}`, slot: { seqId: 'root', index: graph.steps.length }, x: 0, y: prev.bottom + GAP / 2 })
  }
  if (graph.goal) {
    line(0, prev.bottom, cursor)
    boxes.push({ id: 'goal', kind: 'goal', x: 0, y: cursor, w: w('goal', 'goal'), h: h('goal', 'goal'), seqId: 'root', index: graph.steps.length, inBranch: false })
  }

  let minX = Infinity
  let maxX = -Infinity
  let maxY = 0
  for (const b of boxes) {
    minX = Math.min(minX, b.x - b.w / 2)
    maxX = Math.max(maxX, b.x + b.w / 2)
    maxY = Math.max(maxY, b.y + b.h)
  }
  return { boxes, paths, inserts, bounds: { x: minX, y: 0, w: maxX - minX, h: maxY } }
}
