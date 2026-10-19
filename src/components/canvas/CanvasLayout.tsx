import { useState, type CSSProperties, type ReactNode } from 'react'
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

/** Builder page: top bar + dotted canvas with zoom rail, centred flow and optional right inspector. */
export function CanvasLayout({ header, children, inspector, railTop, overlay, flowClassName, flowStyle, initialZoom = 100 }: Props) {
  const [zoom, setZoom] = useState(initialZoom)
  return (
    <div className="flex h-screen min-h-[900px] flex-col">
      {header}
      <div className="canvas-dots relative flex flex-1 gap-6 overflow-hidden px-12 py-6">
        <div className="relative z-10 flex shrink-0 flex-col justify-end">
          <ZoomControl value={zoom} onChange={setZoom} />
        </div>
        {railTop && <div className="absolute left-12 top-6 z-20">{railTop}</div>}
        <div className={cn('relative flex min-w-0 grow flex-col items-center', flowClassName)} style={flowStyle}>
          <div
            className="flex flex-col items-center transition-transform duration-200 ease-out"
            style={{ transform: zoom === 100 ? undefined : `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {children}
          </div>
        </div>
        {inspector && <div className="relative z-10 flex w-[384px] shrink-0 flex-col">{inspector}</div>}
      </div>
      {overlay}
    </div>
  )
}
