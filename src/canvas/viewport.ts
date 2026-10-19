// Pan/zoom for the builder canvas. Writes `transform` straight to one layer element (no React render
// per frame); React only hears about zoom changes, through a tiny subscription for the % readout.
import { useEffect, useMemo, useRef, useSyncExternalStore, type RefObject } from 'react'

export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 2
const DOT = 24

export type Rect = { x: number; y: number; w: number; h: number }
type View = { x: number; y: number; s: number }

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export class Viewport {
  view: View = { x: 0, y: 0, s: 1 }
  container: HTMLElement | null = null
  layer: HTMLElement | null = null
  private listeners = new Set<() => void>()
  private animTimer = 0

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  getZoom = () => this.view.s

  private apply(animate = false) {
    const { x, y, s } = this.view
    if (this.layer) {
      if (animate) {
        this.layer.style.transition = 'transform 220ms cubic-bezier(.2,.8,.2,1)'
        window.clearTimeout(this.animTimer)
        this.animTimer = window.setTimeout(() => this.layer && (this.layer.style.transition = ''), 240)
      } else if (this.layer.style.transition) this.layer.style.transition = ''
      this.layer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`
    }
    if (this.container) {
      this.container.style.backgroundSize = `${DOT * s}px ${DOT * s}px`
      this.container.style.backgroundPosition = `${x}px ${y}px`
    }
  }

  set(next: Partial<View>, animate = false) {
    const prevS = this.view.s
    this.view = { ...this.view, ...next, s: clamp(next.s ?? this.view.s, MIN_ZOOM, MAX_ZOOM) }
    this.apply(animate)
    if (this.view.s !== prevS) this.listeners.forEach((l) => l())
  }

  size() {
    const r = this.container?.getBoundingClientRect()
    return { w: r?.width ?? window.innerWidth, h: r?.height ?? window.innerHeight }
  }

  panBy(dx: number, dy: number, animate = false) {
    this.set({ x: this.view.x + dx, y: this.view.y + dy }, animate)
  }

  /** Zoom to `s` keeping the point (px, py) — container coords — fixed on screen. */
  zoomAt(s: number, px: number, py: number, animate = false) {
    const next = clamp(s, MIN_ZOOM, MAX_ZOOM)
    const k = next / this.view.s
    this.set({ s: next, x: px - (px - this.view.x) * k, y: py - (py - this.view.y) * k }, animate)
  }

  zoomBy(factor: number) {
    const { w, h } = this.size()
    this.zoomAt(this.view.s * factor, w / 2, h / 2, true)
  }

  reset() {
    const { w, h } = this.size()
    this.zoomAt(1, w / 2, h / 2, true)
  }

  /** Fit `rect` (layer coords) into the visible area, leaving `rightInset` px for an open panel. */
  fit(rect: Rect, rightInset = 0, animate = true) {
    const { w, h } = this.size()
    const pad = 64
    const availW = Math.max(200, w - rightInset - pad * 2)
    const availH = Math.max(200, h - pad * 2)
    const s = clamp(Math.min(availW / rect.w, availH / rect.h, 1), MIN_ZOOM, 1)
    const cx = rect.x + rect.w / 2
    const x = pad + availW / 2 - cx * s
    const y = rect.h * s < availH ? pad + (availH - rect.h * s) / 2 - rect.y * s : pad - rect.y * s
    this.set({ s, x, y: Math.min(y, 40 - rect.y * s) }, animate)
  }

  /** Centre content horizontally and start near the top. */
  home(rect: Rect, rightInset = 0) {
    const { w } = this.size()
    this.set({ s: 1, x: (w - rightInset) / 2 - (rect.x + rect.w / 2), y: 40 - rect.y })
  }

  /** Pan (animated) so `rect` sits inside the visible area left of the panel. */
  ensureVisible(rect: Rect, rightInset = 0, margin = 32) {
    const { w, h } = this.size()
    const { x, y, s } = this.view
    const left = rect.x * s + x
    const right = (rect.x + rect.w) * s + x
    const top = rect.y * s + y
    const bottom = (rect.y + rect.h) * s + y
    const maxRight = w - rightInset - margin
    let dx = 0
    let dy = 0
    if (right > maxRight) dx = maxRight - right
    if (left + dx < margin + 120) dx = Math.max(dx, margin + 120 - left)
    if (bottom > h - margin) dy = h - margin - bottom
    if (top + dy < margin) dy = margin - top
    if (dx || dy) this.panBy(dx, dy, true)
  }

  toLayer(clientX: number, clientY: number) {
    const r = this.container?.getBoundingClientRect()
    const px = clientX - (r?.left ?? 0)
    const py = clientY - (r?.top ?? 0)
    return { x: (px - this.view.x) / this.view.s, y: (py - this.view.y) / this.view.s }
  }
}

function isTyping(el: EventTarget | null) {
  const n = el as HTMLElement | null
  return !!n && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.isContentEditable)
}

/**
 * Wire a Viewport to a container + layer:
 *   two-finger scroll pans · pinch or ctrl/⌘+wheel zooms at the cursor · space-drag, middle-drag
 *   and dragging empty canvas pan · a click on empty canvas (no drag) calls onBackgroundClick.
 */
export function useViewport(container: RefObject<HTMLElement>, layer: RefObject<HTMLElement>, onBackgroundClick?: () => void) {
  const vp = useMemo(() => new Viewport(), [])
  const bgClick = useRef(onBackgroundClick)
  bgClick.current = onBackgroundClick

  useEffect(() => {
    const el = container.current
    vp.container = el
    vp.layer = layer.current
    vp.set({})
    if (!el) return

    let space = false
    let drag: { id: number; x: number; y: number; moved: boolean; bg: boolean } | null = null

    function onWheel(e: WheelEvent) {
      // Let scrollable menus inside the canvas scroll themselves.
      if ((e.target as HTMLElement).closest('[data-canvas-scroll]')) return
      e.preventDefault()
      const r = el!.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        const unit = e.deltaMode === 1 ? 16 : 1
        const d = clamp(e.deltaY * unit, -60, 60)
        vp.zoomAt(vp.view.s * Math.exp(-d * 0.01), e.clientX - r.left, e.clientY - r.top)
      } else {
        const unit = e.deltaMode === 1 ? 16 : 1
        const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX
        const dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY
        vp.panBy(-dx * unit, -dy * unit)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && !isTyping(e.target)) {
        if (!space) el!.style.cursor = 'grab'
        space = true
        e.preventDefault()
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        space = false
        el!.style.cursor = ''
      }
    }

    function onPointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement
      const onNode = !!target.closest('[data-node], [data-ui]')
      const bg = !onNode && e.button === 0 && !space
      if (!(space && e.button === 0) && e.button !== 1 && !bg) return
      if (e.button === 1) e.preventDefault()
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, bg }
      el!.setPointerCapture(e.pointerId)
      if (!bg) el!.style.cursor = 'grabbing'
    }
    function onPointerMove(e: PointerEvent) {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      if (!drag.moved && Math.hypot(dx, dy) < 4) return
      if (!drag.moved) el!.style.cursor = 'grabbing'
      drag.moved = true
      drag.x = e.clientX
      drag.y = e.clientY
      vp.panBy(dx, dy)
    }
    function onPointerUp(e: PointerEvent) {
      if (!drag || e.pointerId !== drag.id) return
      if (drag.bg && !drag.moved) bgClick.current?.()
      drag = null
      el!.style.cursor = space ? 'grab' : ''
      try {
        el!.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
    }
    // Safari pinch.
    let gestureStart = 1
    const onGestureStart = (e: Event) => {
      e.preventDefault()
      gestureStart = vp.view.s
    }
    const onGestureChange = (e: Event) => {
      e.preventDefault()
      const g = e as Event & { scale: number; clientX: number; clientY: number }
      const r = el!.getBoundingClientRect()
      vp.zoomAt(gestureStart * g.scale, g.clientX - r.left, g.clientY - r.top)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    el.addEventListener('gesturestart', onGestureStart)
    el.addEventListener('gesturechange', onGestureChange)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('gesturestart', onGestureStart)
      el.removeEventListener('gesturechange', onGestureChange)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [container, layer, vp])

  return vp
}

export function useZoom(vp: Viewport) {
  return useSyncExternalStore(vp.subscribe, vp.getZoom)
}
