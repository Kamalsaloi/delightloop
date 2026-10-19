import { useSearchParams } from 'react-router-dom'
import { BuilderHeader } from '@/components/shell'
import { CanvasLayout, DiwaliFlow, DraftActions, FooterNote, StepChip, type DiwaliStepId, type StepCardProps } from '@/components/canvas'
import { ListAudience, SELECTED_RING } from './build/late-shared'
import { CONFIG_PANELS } from './config/panels'
import { CONFIG_STEPS, type ConfigStepId } from './config/types'
import { parseRulesPanel, RulesButton, useRulesPanel, type RulesPanel } from './rules/useRulesPanel'

// B8 · Loop rules (Path B's full loop) with the rules panel. B8a states via ?panel= (see useRulesPanel).
// ?step=<id> selects a node and shows its config panel instead (B7a: ?step=goal).

// With a step panel open, Paper's flow sits 15px left of centre, postcard right on the merge (B7a).
const STEP_FLOW_SHIFT = -15
const CARD_IDS: DiwaliStepId[] = ['intro', 'linkedin', 'bump', 'postcard', 'gift']

function parseStep(raw: string | null): ConfigStepId | null {
  return raw && (CONFIG_STEPS as readonly string[]).includes(raw) ? (raw as ConfigStepId) : null
}

export default function LoopRules() {
  const [params, setParams] = useSearchParams()
  const step = parseStep(params.get('step'))
  const panel = step ? 'closed' : parseRulesPanel(params.get('panel'))
  const acts = params.get('acts')

  function go(next: RulesPanel, extra: Record<string, string> = {}) {
    setParams(next === 'defaults' ? extra : { panel: next, ...extra })
  }

  function select(id: ConfigStepId) {
    setParams({ step: id })
  }

  // × on a step panel leaves a clean canvas (the rules stay one click away).
  function closeStep() {
    go('closed')
  }

  const rules = useRulesPanel({ panel, go, trigger: params.get('trigger'), acts: acts ? acts.split(',').filter(Boolean) : null })

  const cards: Partial<Record<DiwaliStepId, Partial<StepCardProps>>> = {}
  for (const id of CARD_IDS) if (step === id) cards[id] = { className: SELECTED_RING }

  function renderInspector() {
    if (!step) return rules.panel
    const Panel = CONFIG_PANELS[step]
    return <Panel key={step} onClose={closeStep} />
  }

  const header = (
    <BuilderHeader
      tab="Build"
      mode="blank"
      right={<DraftActions before={<RulesButton count={rules.count} active={rules.open} onClick={() => go(rules.open ? 'closed' : 'defaults')} />} />}
    />
  )

  return (
    <CanvasLayout header={header} inspector={renderInspector()} flowStyle={step ? { left: STEP_FLOW_SHIFT } : undefined}>
      <DiwaliFlow
        audience={<ListAudience />}
        selected={step && CARD_IDS.includes(step as DiwaliStepId) ? (step as DiwaliStepId) : null}
        onSelect={select}
        cards={cards}
        check={{ selected: step === 'check', onClick: () => select('check') }}
        goal={{ selected: step === 'goal', onClick: () => select('goal') }}
        tightMerge={step !== null}
        footers={{ bump: { left: <FooterNote>If not opened</FooterNote>, right: <StepChip tone="green">Ready</StepChip> } }}
      />
    </CanvasLayout>
  )
}
