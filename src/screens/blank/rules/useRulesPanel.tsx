import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ACTIONS, DEFAULT_RULES, findPick, TRIGGERS, type Rule, type Timing } from './data'
import { RG } from './glyphs'
import { ActionsPanel, DefaultsPanel, OffPanel, ReplyPanel, ReviewPanel, TriggerPanel, type RulesState } from './panels'

// Loop rules panel + top-bar toggle, shared by B8 (/blank/rules) and 05a (/loop/build/email?panel=rules).
// States: defaults (A) · trigger (B) · actions (C, &trigger=) · review (D, &acts=a,b) · off (E) · reply (F) · closed.
export const RULES_PANELS = ['defaults', 'trigger', 'actions', 'review', 'off', 'reply', 'closed'] as const
export type RulesPanel = (typeof RULES_PANELS)[number]

export function parseRulesPanel(raw: string | null, fallback: RulesPanel = 'defaults'): RulesPanel {
  return raw && (RULES_PANELS as readonly string[]).includes(raw) ? (raw as RulesPanel) : fallback
}

const DEFAULT_ACTS = ['slack', 'linkedin']

/** "Rules 4" top-bar button. Pressed (grey fill, white badge) while the panel is open. */
export function RulesButton({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] px-[14px]',
        active ? 'bg-fill shadow-[inset_0_0_0_1px_#E4E4E1]' : 'bg-white shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover',
      )}
    >
      {RG.rules()}
      <span className="text-[13px] font-medium leading-4 text-ink">Rules</span>
      <span className={cn('rounded-[6px] px-1.5 text-[12px] font-semibold leading-[18px] text-ink', active ? 'bg-white' : 'bg-fill')}>{count}</span>
    </button>
  )
}

type Options = {
  panel: RulesPanel
  /** Write the next state to the URL; `extra` carries trigger / acts. */
  go: (next: RulesPanel, extra?: Record<string, string>) => void
  trigger: string | null
  acts: string[] | null
  subtitle?: string
  selectFirst?: boolean
}

/** Rule list state + the panel for the current state (undefined when closed). */
export function useRulesPanel({ panel, go, trigger, acts, subtitle, selectFirst = true }: Options) {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES)
  // A direct link to E shows the meeting rule switched off.
  const [on, setOnMap] = useState<Record<string, boolean>>(() => (panel === 'off' ? { book: false } : ({} as Record<string, boolean>)))

  function setOn(id: string, v: boolean) {
    const nextMap = { ...on, [id]: v }
    setOnMap(nextMap)
    // In E, switching the last off rule back on returns to the defaults view.
    if (panel === 'off' && v && rules.every((r) => nextMap[r.id] !== false)) go('defaults')
  }

  function handleUndo(id: string) {
    setOnMap((m) => ({ ...m, [id]: true }))
    go('defaults')
  }

  function pickAction(id: string) {
    const list = acts ?? []
    go('review', { trigger: trigger ?? TRIGGERS.suggested.id, acts: [...list.filter((a) => a !== id), id].join(',') })
  }

  function saveRule(timings: Timing[]) {
    const when = findPick(TRIGGERS, trigger)
    const steps = (acts ?? DEFAULT_ACTS).map((a) => findPick(ACTIONS, a))
    const rule: Rule = {
      id: `custom-${rules.length}`,
      when: when.label,
      glyph: undefined,
      then: steps.map((s) => ({ label: s.label })),
      summary: steps.map((s, i) => `${s.label} ${timings[i]?.toLowerCase() ?? ''}`.trim()).join(', '),
    }
    setRules((r) => [...r, rule])
    go('defaults')
  }

  const state: RulesState = { rules, on, setOn, subtitle, selectFirst }
  const reviewActs = acts ?? DEFAULT_ACTS
  const backToActions = () => go('actions', { trigger: trigger ?? TRIGGERS.suggested.id, acts: reviewActs.join(',') })

  function renderPanel(): ReactNode {
    switch (panel) {
      case 'closed':
        return undefined
      case 'trigger':
        return <TriggerPanel state={state} onClose={() => go('closed')} onPick={(id) => go('actions', { trigger: id })} />
      case 'actions':
        return (
          <ActionsPanel count={rules.length} trigger={trigger} onBack={() => go('trigger')} onChangeTrigger={() => go('trigger')} onPick={pickAction} />
        )
      case 'review':
        return (
          <ReviewPanel
            key={reviewActs.join(',')}
            count={rules.length}
            trigger={trigger}
            actions={reviewActs}
            onBack={backToActions}
            onChangeTrigger={() => go('trigger')}
            onAddAction={backToActions}
            onCancel={() => go('defaults')}
            onSave={saveRule}
          />
        )
      case 'off':
        return <OffPanel state={state} onClose={() => go('closed')} onUndo={handleUndo} />
      case 'reply':
        return <ReplyPanel onBack={() => go('defaults')} onSave={() => go('defaults')} />
      default:
        return (
          <DefaultsPanel state={state} onClose={() => go('closed')} onAdd={() => go('trigger')} onAutoReply={() => go('reply')} onTurnedOff={() => go('off')} />
        )
    }
  }

  return { count: rules.length, open: panel !== 'closed', panel: renderPanel() }
}
