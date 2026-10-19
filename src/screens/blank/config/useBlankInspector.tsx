import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PathBHeader } from '@/screens/blank/build/shared'
import { parseRulesPanel, RulesButton, useRulesPanel, type RulesPanel } from '@/screens/blank/rules/useRulesPanel'
import { CONFIG_PANELS } from './panels'
import { CONFIG_STEPS, type ConfigStepId } from './types'

/**
 * Right-rail state for every Path B canvas (B1–B7):
 *   ?step=<ConfigStepId>        a placed step is selected (violet ring) and its config panel shows (B1a–B7a)
 *   ?panel=rules[&rules=…]      the loop rules panel (same as B8 / 05a)
 * While either is open the step menu should be hidden (`menuHidden`).
 *
 *   const ins = useBlankInspector({ finishTo })
 *   <CanvasLayout header={ins.header} inspector={ins.inspector}>…
 *   <IntroCard selected={ins.selected === 'intro'} onClick={() => ins.select('intro')} />
 */
export function useBlankInspector({ ready, finishTo }: { ready?: boolean; finishTo?: string } = {}) {
  const [params, setParams] = useSearchParams()
  const rawStep = params.get('step')
  const selected: ConfigStepId | null = rawStep && (CONFIG_STEPS as readonly string[]).includes(rawStep) ? (rawStep as ConfigStepId) : null
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
  })

  function select(id: ConfigStepId) {
    setParams({ step: id })
  }

  function close() {
    setParams({})
  }

  function renderInspector(): ReactNode {
    if (rulesOpen) return rules.panel
    if (!selected) return undefined
    const Panel = CONFIG_PANELS[selected]
    return <Panel key={selected} onClose={close} />
  }

  const rulesButton = <RulesButton count={rules.count} active={rulesOpen} onClick={() => goRules(rulesOpen ? 'closed' : 'defaults')} />

  return {
    selected: rulesOpen ? null : selected,
    select,
    close,
    menuHidden: rulesOpen || selected !== null,
    inspector: renderInspector(),
    header: <PathBHeader ready={ready} finishTo={finishTo} before={rulesButton} />,
  }
}
