import { useState, type ReactNode } from 'react'
import { CanvasLayout, DiwaliFlow } from '@/components/canvas'
import { PausedCard } from './PausedCard'
import { EDITED_CARD, LIVE_BRANCH_LABELS, PausedHeader, pausedFooters } from './shared'

/** 10's canvas: paused loop with the gift edit marked. 11 renders it under the resume modal. */
export function PausedCanvas({ overlay, tightMerge }: { overlay?: ReactNode; tightMerge?: boolean }) {
  const [discarded, setDiscarded] = useState(false)
  const edited = !discarded

  return (
    <CanvasLayout
      header={<PausedHeader />}
      railTop={<PausedCard discarded={discarded} onDiscard={() => setDiscarded(true)} onUndo={() => setDiscarded(false)} />}
      overlay={overlay}
    >
      <DiwaliFlow
        footers={pausedFooters(edited)}
        subtitles={edited ? { gift: '14 now get chai' } : undefined}
        branchLabels={LIVE_BRANCH_LABELS}
        cards={edited ? { gift: EDITED_CARD } : undefined}
        tightMerge={tightMerge}
      />
    </CanvasLayout>
  )
}
