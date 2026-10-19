import { useState } from 'react'
import { createPortal } from 'react-dom'
import { GiftInspector, SwapGiftModal, type GiftPanel } from '@/components/canvas'
import type { ConfigPanelProps } from './types'

// B6a · EPY-0 · the gift: 04's gift inspector, with its sub-states and swap modal kept local.
export default function GiftConfig({ onClose }: ConfigPanelProps) {
  const [panel, setPanel] = useState<GiftPanel>('gifts')
  const [giftId, setGiftId] = useState<string | undefined>()
  const [swap, setSwap] = useState(false)

  function handlePanel(next: GiftPanel, id?: string) {
    setPanel(next)
    if (id) setGiftId(id)
  }

  function handleCommit() {
    setSwap(false)
    setPanel('hover')
  }

  return (
    <>
      <GiftInspector panel={panel} onPanel={handlePanel} giftId={giftId} onClose={onClose} onSwap={() => setSwap(true)} />
      {swap && createPortal(<SwapGiftModal onClose={() => setSwap(false)} onCommit={handleCommit} />, document.body)}
    </>
  )
}
