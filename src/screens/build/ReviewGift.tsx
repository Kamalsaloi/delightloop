import { useNavigate, useSearchParams } from 'react-router-dom'
import { BuilderHeader } from '@/components/shell'
import { CanvasLayout, DiwaliFlow, DraftActions, GIFT_PANELS, GiftInspector, SwapGiftModal, type DiwaliStepId, type GiftPanel } from '@/components/canvas'
import { RulesButton } from '@/screens/blank/rules/useRulesPanel'

// 04 · gift step open. Rules opens 05a (/loop/build/email?panel=rules). ?panel=<GiftPanel> (04b states), ?gift=<id>, ?swap=1 (04a modal), ?closed=1 (deselected).
export default function ReviewGift() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const raw = params.get('panel') as GiftPanel | null
  const panel: GiftPanel = raw && GIFT_PANELS.includes(raw) ? raw : 'gifts'
  const swap = params.get('swap') === '1'
  const closed = params.get('closed') === '1'

  function setSwap(open: boolean) {
    const next = new URLSearchParams(params)
    if (open) next.set('swap', '1')
    else next.delete('swap')
    setParams(next)
  }

  function handlePanel(p: GiftPanel, giftId?: string) {
    if (p === 'gifts') setParams({})
    else if (p === 'gift') setParams({ panel: p, gift: giftId ?? 'olive' })
    else setParams({ panel: p })
  }

  function handleSelect(id: DiwaliStepId) {
    if (id === 'intro') navigate('/loop/build/email')
    else if (id === 'bump') navigate('/loop/build/email?step=bump')
    else setParams({})
  }

  const inspector = closed ? undefined : (
    <GiftInspector
      panel={panel}
      giftId={params.get('gift') ?? 'olive'}
      onPanel={handlePanel}
      onClose={() => setParams({ closed: '1' })}
      onSwap={() => setSwap(true)}
      fill={swap && panel === 'gifts'}
    />
  )

  return (
    <CanvasLayout
      header={
        <BuilderHeader
          tab="Build"
          mode="draft"
          right={<DraftActions before={<RulesButton count={4} active={false} onClick={() => navigate('/loop/build/email?panel=rules')} />} />}
        />
      }
      inspector={inspector}
      overlay={swap && <SwapGiftModal onClose={() => setSwap(false)} onCommit={() => setParams({ panel: 'hover' })} />}
    >
      <DiwaliFlow
        selected={closed ? null : 'gift'}
        onSelect={handleSelect}
        selectable={['intro', 'bump', 'gift']}
        toolbar={!closed}
        cursor
        postcardHint
      />
    </CanvasLayout>
  )
}
