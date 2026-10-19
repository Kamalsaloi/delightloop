// The builder canvas: infinite dotted surface, one transformed layer holding the laid-out graph,
// SVG connectors, hover toolbars, insert points and the step menu.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AddStepButton, EmptySlot, GiftyCursor, HintCard, StepCard, StepToolbar } from '@/components/canvas'
import { cn } from '@/lib/cn'
import { nodeDays } from '@/store/graph'
import { useStore } from '@/store/store'
import type { Graph, Loop, Slot } from '@/store/types'
import { buildPick, menuContent, slotContext, suggestionFor } from './catalog'
import { layoutGraph, type Box, type Insert, type Sizes } from './layout'
import { AudienceNode, BranchPill, EDITED_RING, GoalNode, SplitPill, stepCard, WaitPill, type NodeCtx, type NodeMode } from './nodes'
import { StepMenu } from './StepMenu'
import { useViewport, useZoom, type Viewport } from './viewport'
import { ZoomControl } from './ZoomControl'

export const PANEL_INSET = 384 + 48 + 24

type Props = {
  loop: Loop
  /** What to draw (the drafting animation passes a partial graph). */
  graph: Graph
  mode: NodeMode
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** A right panel is open: keep the selection clear of it. */
  panelOpen: boolean
  drafting?: boolean
  locked?: Set<string>
  changed?: Set<string>
  onAudience?: () => void
  onRules?: () => void
  onResults?: () => void
  /** Blocked selection (live): explain why. */
  onBlocked?: (id: string) => void
  topLeft?: ReactNode
}

export function Canvas({ loop, graph, mode, selectedId, onSelect, panelOpen, drafting, locked, changed, onAudience, onRules, onResults, onBlocked, topLeft }: Props) {
  // ── Refs and viewport ─────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const [menu, setMenu] = useState<{ slot: Slot; x: number; y: number } | null>(null)
  const vp = useViewport(containerRef, layerRef, () => {
    setMenu(null)
    onSelect(null)
  })

  // ── Local state ──────────────────────────────────────────────────
  const [sizes, setSizes] = useState<Sizes>({})
  const [hintFor, setHintFor] = useState<string | null>(null)
  const insertNode = useStore((s) => s.insertNode)
  const removeNode = useStore((s) => s.removeNode)
  const duplicate = useStore((s) => s.duplicateNode)
  const setGoal = useStore((s) => s.setGoal)
  const editable = mode !== 'live' && !drafting

  // ── Layout ───────────────────────────────────────────────────────
  const layout = useMemo(
    () => layoutGraph(graph, { editable, sizes, endSlot: editable && !graph.goal }),
    [graph, editable, sizes],
  )
  const days = useMemo(() => nodeDays(loop.graph, loop.startAt), [loop.graph, loop.startAt])
  const ctx: NodeCtx = { loop, mode, days, locked: locked ?? new Set(), changed: changed ?? new Set(), openResults: () => onResults?.() }

  // ── Measuring ────────────────────────────────────────────────────
  const observer = useRef<ResizeObserver | null>(null)
  const pending = useRef<Sizes>({})
  const raf = useRef(0)
  if (!observer.current && typeof ResizeObserver !== 'undefined') {
    observer.current = new ResizeObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        const id = el.dataset.measure
        if (id) pending.current[id] = { w: el.offsetWidth, h: el.offsetHeight }
      }
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        const next = pending.current
        pending.current = {}
        setSizes((cur) => {
          let changedAny = false
          for (const [id, s] of Object.entries(next)) {
            const c = cur[id]
            if (!c || Math.abs(c.h - s.h) > 0.5 || Math.abs(c.w - s.w) > 0.5) changedAny = true
          }
          return changedAny ? { ...cur, ...next } : cur
        })
      })
    })
  }
  const measure = useCallback((el: HTMLElement | null) => {
    if (el) observer.current?.observe(el)
  }, [])
  useEffect(() => () => observer.current?.disconnect(), [])

  // ── Viewport placement ───────────────────────────────────────────
  const placed = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (placed.current === loop.id) return
    placed.current = loop.id
    vp.home(layout.bounds, panelOpen ? PANEL_INSET : 0)
  }, [loop.id, layout.bounds, panelOpen, vp])

  // Keep the selected node clear of the panel.
  const selectedBox = layout.boxes.find((b) => b.id === selectedId)
  useEffect(() => {
    if (!selectedBox || !panelOpen) return
    const t = window.setTimeout(() => vp.ensureVisible({ x: selectedBox.x - selectedBox.w / 2 - 64, y: selectedBox.y, w: selectedBox.w + 64, h: selectedBox.h }, PANEL_INSET), 30)
    return () => window.clearTimeout(t)
    // Only when the selection or panel changes, not on every re-measure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, panelOpen])

  // Follow the drafting animation.
  const last = layout.boxes[layout.boxes.length - 1]
  useEffect(() => {
    if (drafting && last) vp.ensureVisible({ x: last.x - last.w / 2, y: last.y, w: last.w + 120, h: last.h + 40 }, 0, 80)
  }, [drafting, last?.id, last, vp])

  // Esc deselects.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      if (menu) setMenu(null)
      else if (selectedId) onSelect(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu, selectedId, onSelect])

  // ── Handlers ─────────────────────────────────────────────────────
  function openMenu(slot: Slot, x: number, y: number) {
    onSelect(null)
    setMenu({ slot, x, y })
    const left = x >= 0 ? x + 176 : x - 176 - 368
    if (vp.view.s < 0.9) {
      const { w, h } = vp.size()
      vp.set({ s: 1, x: w / 2 - (left + 184), y: h / 2 - y }, true)
    } else vp.ensureVisible({ x: left, y: y - 60, w: 368, h: 460 }, 0, 24)
  }

  function pick(id: string, values: Record<string, number>) {
    if (!menu) return
    const sctx = slotContext(loop, menu.slot)
    const picked = buildPick(id, values, loop, sctx)
    setMenu(null)
    if (picked.kind === 'goal') {
      setGoal(loop.id, picked.goal)
      onSelect('goal')
      return
    }
    insertNode(loop.id, menu.slot, picked.node)
    onSelect(picked.node.id)
  }

  function select(id: string) {
    setMenu(null)
    if (mode === 'paused' && locked?.has(id)) {
      onBlocked?.(id)
      return
    }
    if (mode === 'live' && !['goal'].includes(id)) {
      const b = layout.boxes.find((x) => x.id === id)
      if (!(b?.node?.kind === 'step' && b.node.type === 'gift')) {
        onBlocked?.(id)
        return
      }
    }
    onSelect(selectedId === id && !panelOpen ? null : id)
  }

  function remove(id: string) {
    if (locked?.has(id)) {
      onBlocked?.(id)
      return
    }
    if (selectedId === id) onSelect(null)
    if (id === 'goal') setGoal(loop.id, null)
    else removeNode(loop.id, id)
  }

  function dup(id: string) {
    const newId = duplicate(loop.id, id)
    if (newId) onSelect(newId)
  }

  // ── Render helpers ───────────────────────────────────────────────
  function renderBox(b: Box) {
    const selected = b.id === selectedId
    switch (b.kind) {
      case 'audience':
        return <AudienceNode loop={loop} onClick={onAudience} drafting={drafting} />
      case 'step': {
        const n = b.node!
        if (n.kind !== 'step') return null
        const card = stepCard(n, ctx)
        const marker = card.titleAdornment
        return (
          <StepCard
            {...card}
            titleAdornment={
              marker ? (
                <span
                  data-ui
                  onMouseEnter={() => setHintFor(n.id)}
                  onMouseLeave={() => setHintFor(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRules?.()
                  }}
                  className="cursor-pointer"
                >
                  {marker}
                </span>
              ) : undefined
            }
            hint={
              hintFor === n.id ? (
                <HintCard title="Skipped by a loop rule" onClick={onRules}>
                  Not sent to anyone who replies or books first. Click to edit.
                </HintCard>
              ) : undefined
            }
            width={b.w}
            selected={selected}
            selectedGlow
            className={cn(mode === 'paused' && changed?.has(n.id) && !selected && EDITED_RING, drafting && 'animate-[nodeIn_.35s_ease-out]')}
            onClick={() => select(n.id)}
          />
        )
      }
      case 'wait': {
        const n = b.node!
        if (n.kind !== 'step' || n.type !== 'wait') return null
        return <WaitPill n={n} selected={selected} onClick={() => select(n.id)} />
      }
      case 'split': {
        const n = b.node!
        if (n.kind !== 'split') return null
        return <SplitPill n={n} selected={selected} onClick={() => select(n.id)} />
      }
      case 'label':
        return <BranchPill split={b.split!} index={b.branch!} ctx={ctx} />
      case 'branchSlot':
        return (
          <EmptySlot width={b.w} style={{ height: 122 }}>
            <AddStepButton onClick={() => openMenu({ seqId: b.seqId, index: 0 }, b.x, b.y + 40)} />
          </EmptySlot>
        )
      case 'endSlot':
        return (
          <EmptySlot width={b.w}>
            <AddStepButton onClick={() => openMenu({ seqId: 'root', index: b.index }, b.x, b.y)}>{graph.steps.length ? 'Add step' : 'Add the first step'}</AddStepButton>
          </EmptySlot>
        )
      case 'goal':
        return graph.goal ? <GoalNode goal={graph.goal} selected={selected} onClick={() => select('goal')} booked={mode !== 'edit' ? loop.live?.counts.booked : undefined} /> : null
    }
  }

  const toolbarFor = (b: Box) => editable && (b.kind === 'step' || b.kind === 'wait' || b.kind === 'split' || b.kind === 'goal')

  function renderInsert(ins: Insert) {
    return (
      <div
        key={ins.key}
        data-ui
        className="group/ins absolute z-[5] flex h-5 w-[120px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{ left: ins.x, top: ins.y }}
      >
        <button
          type="button"
          aria-label="Add a step here"
          data-testid={`insert-${ins.key}`}
          onClick={() => openMenu(ins.slot, ins.x, ins.y)}
          className="flex h-5 w-5 scale-75 cursor-pointer items-center justify-center rounded-full bg-white opacity-0 shadow-[0_0_0_1.5px_#6559F7] transition-[opacity,transform] duration-150 group-hover/ins:scale-100 group-hover/ins:opacity-100"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 3v10M3 8h10" stroke="#5A3FE6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    )
  }

  const sctx = menu ? slotContext(loop, menu.slot) : null

  return (
    <div className="relative h-full min-h-0 flex-1 overflow-hidden">
      <div ref={containerRef} data-testid="canvas" className="canvas-dots absolute inset-0 touch-none select-none overflow-hidden overscroll-none">
        <div ref={layerRef} data-testid="canvas-layer" className="absolute left-0 top-0 origin-top-left will-change-transform">
          <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1" aria-hidden>
            {layout.paths.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#CFCFD6" strokeWidth="1.5" />
            ))}
          </svg>
          {layout.inserts.map(renderInsert)}
          {layout.boxes.map((b) => (
            <div
              key={b.id}
              data-node={b.id}
              className="group/node absolute"
              style={{ left: b.x, top: b.y, transform: 'translateX(-50%)', zIndex: b.id === selectedId ? 3 : 2 }}
            >
              <div ref={measure} data-measure={b.id} className="flex w-max flex-col items-center">
                {renderBox(b)}
              </div>
              {toolbarFor(b) && (
                <div
                  data-ui
                  className={cn(
                    'absolute right-full top-1/2 -translate-y-1/2 pr-4 transition-opacity duration-150',
                    b.id === selectedId ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover/node:pointer-events-auto group-hover/node:opacity-100',
                  )}
                >
                  <StepToolbar
                    active={b.id === selectedId ? 'edit' : null}
                    onEdit={() => select(b.id)}
                    onCopy={b.kind === 'goal' ? undefined : () => dup(b.id)}
                    onDelete={() => remove(b.id)}
                  />
                </div>
              )}
            </div>
          ))}
          {drafting && last && (
            <div className="absolute z-10 transition-[left,top] duration-300 ease-out" style={{ left: last.x + last.w / 2 + 16, top: last.y + last.h / 2 - 8 }}>
              <GiftyCursor label="Gifty is drafting" />
            </div>
          )}
          {menu && sctx && (
            <StepMenu
              key={`${menu.slot.seqId}:${menu.slot.index}`}
              content={menuContent(sctx)}
              suggestion={suggestionFor(sctx)}
              onPick={pick}
              onClose={() => setMenu(null)}
              style={menu.x >= 0 ? { left: menu.x + 176, top: menu.y - 40 } : { left: menu.x - 176 - 368, top: menu.y - 40 }}
            />
          )}
        </div>
      </div>
      {topLeft && <div className="absolute left-12 top-6 z-20">{topLeft}</div>}
      <CanvasZoom vp={vp} onFit={() => vp.fit(layout.bounds, panelOpen ? PANEL_INSET : 0)} />
    </div>
  )
}

function CanvasZoom({ vp, onFit }: { vp: Viewport; onFit: () => void }) {
  const zoom = useZoom(vp)
  return (
    <div className="absolute bottom-6 left-12 z-20">
      <ZoomControl value={Math.round(zoom * 100)} onZoomIn={() => vp.zoomBy(1.25)} onZoomOut={() => vp.zoomBy(0.8)} onReset={() => vp.reset()} onFit={onFit} />
    </div>
  )
}
