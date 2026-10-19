import { useNavigate, useSearchParams } from 'react-router-dom'
import { BuilderHeader } from '@/components/shell'
import {
  BUMP_EMAIL,
  CanvasLayout,
  DiwaliFlow,
  DraftActions,
  EmailInspector,
  INTRO_EMAIL,
  SenderChip,
  StepChip,
  type DiwaliStepId,
} from '@/components/canvas'
import { parseRulesPanel, RulesButton, useRulesPanel, type RulesPanel } from '@/screens/blank/rules/useRulesPanel'

// 05 · email step open. ?step=bump opens the follow-up email; ?closed=1 deselects.
// 05a · ?panel=rules opens Gifty's drafted loop rules (sub-states via &rules=, see useRulesPanel); no step selected.
export default function ReviewEmail() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const step: DiwaliStepId = params.get('step') === 'bump' ? 'bump' : 'intro'
  const closed = params.get('closed') === '1'
  const rulesOpen = params.get('panel') === 'rules'
  const acts = params.get('acts')

  function goRules(next: RulesPanel, extra: Record<string, string> = {}) {
    if (next === 'closed') setParams({})
    else setParams({ panel: 'rules', ...(next === 'defaults' ? {} : { rules: next }), ...extra })
  }

  const rules = useRulesPanel({
    panel: rulesOpen ? parseRulesPanel(params.get('rules')) : 'closed',
    go: goRules,
    trigger: params.get('trigger'),
    acts: acts ? acts.split(',').filter(Boolean) : null,
    subtitle: 'Gifty set these from your description',
    selectFirst: false,
  })

  function handleSelect(id: DiwaliStepId) {
    if (id === 'gift') navigate('/loop/build/gift')
    else if (id === 'bump') setParams({ step: 'bump' })
    else setParams({})
  }

  function renderInspector() {
    if (rulesOpen) return rules.panel
    if (closed) return undefined
    return <EmailInspector key={step} draft={step === 'bump' ? BUMP_EMAIL : INTRO_EMAIL} onClose={() => setParams({ closed: '1' })} />
  }

  const rulesButton = <RulesButton count={rules.count} active={rulesOpen} onClick={() => goRules(rulesOpen ? 'closed' : 'defaults')} />

  return (
    <CanvasLayout header={<BuilderHeader tab="Build" mode="draft" right={<DraftActions before={rulesButton} />} />} inspector={renderInspector()}>
      <DiwaliFlow
        selected={closed || rulesOpen ? null : step}
        onSelect={handleSelect}
        selectable={['intro', 'bump', 'gift']}
        tightMerge={rulesOpen}
        footers={{
          intro: {
            left: (
              <>
                <SenderChip />
                <StepChip tone="muted">+2 senders</StepChip>
              </>
            ),
          },
        }}
      />
    </CanvasLayout>
  )
}
