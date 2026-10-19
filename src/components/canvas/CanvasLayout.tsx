import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ZoomControl } from './Overlays'

type Props = {
  /** Top bar, usually <BuilderHeader/>. */
  header: ReactNode
  /** The flow column content (AudiencePill, FlowLine, StepCard, …). Centred, scaled by the zoom control. */
  children: ReactNode
  /** Right rail content (384 wide), usually an <Inspector/>. Omit for a full-width centred flow (08, 10, Path B). */
  inspector?: ReactNode
  /** Card pinned to the top-left of the canvas (e.g. 10's "Loop paused" card). */
  railTop?: ReactNode
  /** Anything fixed above the page (modals). */
  overlay?: ReactNode
  /** Extra classes/styles on the flow column, e.g. `style={{ top: -150 }}` to show the flow scrolled (B5). */
  flowClassName?: string
  flowStyle?: CSSProperties
  /** Start zoom (percent). */
  initialZoom?: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * Builder page: fixed-viewport shell. The page never scrolls; two-finger scroll pans the canvas,
 * pinch or ⌘/ctrl + scroll zooms, and the inspector scrolls on its own.
 */
export function CanvasLayout({ header, children, inspector, railTop, overlay, flowClassName, flowStyle, initialZoom = 100 }: Props) {
  const [zoom, setZoom] = useState(initialZoom)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Non-passive wheel listener so we can stop the browser scrolling or page-zooming.
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      if ((e.target as HTMLElement).closest('[data-scroll-panel]')) return
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        setZoom((z) => clamp(Math.round(z * Math.exp(-e.deltaY * 0.01)), 50, 200))
      } else {
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function handleZoom(z: number) {
    setZoom(z)
    if (z === 100) setPan({ x: 0, y: 0 })
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {header}
      <div ref={canvasRef} className="canvas-dots relative flex min-h-0 flex-1 gap-6 overflow-hidden overscroll-none px-12 py-6">
        <div className="relative z-10 flex shrink-0 flex-col justify-end">
          <ZoomControl value={zoom} onChange={handleZoom} />
        </div>
        {railTop && <div className="absolute left-12 top-6 z-20">{railTop}</div>}
        <div className={cn('relative flex min-w-0 grow flex-col items-center', flowClassName)} style={flowStyle}>
          <div
            className="flex flex-col items-center will-change-transform"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {children}
          </div>
        </div>
        {inspector && (
          <div data-scroll-panel className="relative z-10 flex min-h-0 w-[384px] shrink-0 flex-col overflow-y-auto overscroll-contain [scrollbar-width:thin]">
            {inspector}
          </div>
        )}
      </div>
      {overlay}
    </div>
  )
}
