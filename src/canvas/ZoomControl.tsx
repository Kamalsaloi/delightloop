import { G } from '@/components/canvas/glyphs'
import { MAX_ZOOM, MIN_ZOOM } from './viewport'

const BTN = 'flex h-7 w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] hover:bg-fill disabled:cursor-default disabled:opacity-40'

/** Bottom-left zoom control: − 100% + | fit. Clicking the % resets to 100%. */
export function ZoomControl({ value, onZoomIn, onZoomOut, onReset, onFit }: { value: number; onZoomIn: () => void; onZoomOut: () => void; onReset: () => void; onFit: () => void }) {
  return (
    <div data-ui className="relative flex items-center gap-0.5 rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_#EBEBE8,0_8px_20px_-14px_#11121640]">
      <button type="button" aria-label="Zoom out" className={BTN} onClick={onZoomOut} disabled={value <= MIN_ZOOM * 100}>
        {G.minus()}
      </button>
      <button
        type="button"
        title="Reset to 100%"
        data-testid="zoom-readout"
        onClick={onReset}
        className="h-7 w-12 cursor-pointer rounded-[8px] text-center text-[12.5px] font-medium tabular-nums leading-4 text-ink hover:bg-fill"
      >
        {value}%
      </button>
      <button type="button" aria-label="Zoom in" className={BTN} onClick={onZoomIn} disabled={value >= MAX_ZOOM * 100}>
        {G.plus()}
      </button>
      <span className="h-4 w-px shrink-0 bg-line" />
      <button type="button" aria-label="Fit to screen" title="Fit to screen" className={BTN} onClick={onFit}>
        {G.fit()}
      </button>
    </div>
  )
}
