import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CanvasLayout, DiwaliFlow, StepChip, type DiwaliStepId } from '@/components/canvas'
import { DeliveryPanel, type Fix } from './build/DeliveryPanel'
import { LIVE_BRANCH_LABELS, LiveHeader, useLiveFooters } from './build/shared'

// 08 · Live, Build tab with counts. ?step=gift opens the gift-delivery panel (08a, a later moment: Day 6).
export default function LiveBuild() {
  // ── Router ──────────────────────────────────────────────────
  const [params, setParams] = useSearchParams()

  // ── Local state ─────────────────────────────────────────────
  const [fix, setFix] = useState<Fix | null>(null)
  const [swapUndone, setSwapUndone] = useState(false)

  // ── Derived ─────────────────────────────────────────────────
  const panelOpen = params.get('step') === 'gift'
  const giftStatus = panelOpen ? renderGiftStatus() : <StepChip tone="amber">Goes out Sat 31 · 5 held</StepChip>
  const footers = useLiveFooters(giftStatus)

  // ── Handlers ────────────────────────────────────────────────
  function handleSelect(id: DiwaliStepId) {
    if (id === 'gift') setParams({ step: 'gift' })
  }

  function handleClose() {
    setParams({})
  }

  // ── Render helpers ──────────────────────────────────────────
  function renderGiftStatus() {
    if (fix) return <StepChip tone="green">All handled</StepChip>
    return <StepChip tone="amber">1 needs you</StepChip>
  }

  return (
    <CanvasLayout
      header={panelOpen ? <LiveHeader status="Live · Day 6" now="Sun 1 Nov, 10:15" /> : <LiveHeader status="Live · Day 1" now="Tue 27 Oct, 8:40" />}
      flowStyle={panelOpen ? { marginRight: 372 } : undefined}
      overlay={
        panelOpen && (
          <DeliveryPanel
            fix={fix}
            onFix={setFix}
            swapUndone={swapUndone}
            onToggleSwap={() => setSwapUndone((v) => !v)}
            onClose={handleClose}
          />
        )
      }
    >
      <DiwaliFlow
        footers={footers}
        branchLabels={LIVE_BRANCH_LABELS}
        onSelect={handleSelect}
        selectable={['gift']}
        tightMerge={panelOpen}
      />
    </CanvasLayout>
  )
}
