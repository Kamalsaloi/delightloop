// Loop rules, bound to the loop in the store. Panel states: defaults · trigger · actions · review · off · reply.
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useStore } from '@/store/store'
import type { Loop, RuleGlyph } from '@/store/types'
import { ACTIONS, findPick, TRIGGERS, type Rule as ViewRule, type Timing } from './data'
import { RG } from './glyphs'
import { ActionsPanel, DefaultsPanel, OffPanel, ReplyPanel, ReviewPanel, TriggerPanel, type RulesState } from './panels'

type Nav = { panel: 'defaults' | 'trigger' | 'actions' | 'review' | 'off' | 'reply'; trigger: string | null; acts: string[] }

const GLYPH: Record<RuleGlyph, () => ReturnType<typeof RG.reply> | undefined> = {
  reply: () => RG.reply(),
  calendar: () => RG.calendar(),
  clock: () => RG.clock(),
  ban: () => RG.ban(),
  custom: () => undefined,
}

/** "Rules 4" top-bar toggle. Pressed while the panel is open. */
export function RulesButton({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-testid="rules-button"
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

export function RulesPanel({ loop, onClose }: { loop: Loop; onClose: () => void }) {
  const setRuleOn = useStore((s) => s.setRuleOn)
  const setEmailsOnly = useStore((s) => s.setRuleEmailsOnly)
  const addRule = useStore((s) => s.addRule)
  const toast = useStore((s) => s.toast)
  const [nav, setNav] = useState<Nav>({ panel: 'defaults', trigger: null, acts: [] })

  const rules: ViewRule[] = loop.rules.map((r) => ({ ...r, glyph: GLYPH[r.glyph]() }))
  const on = Object.fromEntries(loop.rules.map((r) => [r.id, r.on]))
  const go = (panel: Nav['panel'], patch: Partial<Nav> = {}) => setNav((n) => ({ ...n, panel, ...patch }))

  function setOn(id: string, v: boolean) {
    setRuleOn(loop.id, id, v)
    if (nav.panel === 'off' && v && loop.rules.every((r) => r.id === id || r.on)) go('defaults')
  }

  const state: RulesState = {
    rules,
    on,
    setOn,
    subtitle: loop.origin === 'gifty' ? 'Gifty set these from your description' : undefined,
    selectFirst: loop.origin !== 'gifty',
  }

  function pickAction(id: string) {
    go('review', { trigger: nav.trigger ?? TRIGGERS.suggested.id, acts: [...nav.acts.filter((a) => a !== id), id] })
  }

  function saveRule(timings: Timing[]) {
    const when = findPick(TRIGGERS, nav.trigger)
    const steps = (nav.acts.length ? nav.acts : [ACTIONS.suggested.id]).map((a) => findPick(ACTIONS, a))
    addRule(loop.id, {
      when: when.label,
      glyph: 'custom',
      then: steps.map((s) => ({ label: s.label })),
      summary: steps.map((s, i) => `${s.label} ${timings[i]?.toLowerCase() ?? ''}`.trim()).join(', '),
    })
    toast('Rule saved')
    setNav({ panel: 'defaults', trigger: null, acts: [] })
  }

  switch (nav.panel) {
    case 'trigger':
      return <TriggerPanel state={state} onClose={onClose} onPick={(id) => go('actions', { trigger: id, acts: [] })} />
    case 'actions':
      return <ActionsPanel count={rules.length} trigger={nav.trigger} onBack={() => go('trigger')} onChangeTrigger={() => go('trigger')} onPick={pickAction} />
    case 'review':
      return (
        <ReviewPanel
          key={nav.acts.join(',')}
          count={rules.length}
          trigger={nav.trigger}
          actions={nav.acts}
          onBack={() => go('actions')}
          onChangeTrigger={() => go('trigger')}
          onAddAction={() => go('actions')}
          onCancel={() => setNav({ panel: 'defaults', trigger: null, acts: [] })}
          onSave={saveRule}
        />
      )
    case 'off':
      return (
        <OffPanel
          state={state}
          onClose={onClose}
          onUndo={(id) => {
            setRuleOn(loop.id, id, true)
            go('defaults')
          }}
          onEmailsOnly={(id) => {
            setEmailsOnly(loop.id, id)
            toast('Only the emails stop. The letter and gift still ship')
            go('defaults')
          }}
        />
      )
    case 'reply':
      return (
        <ReplyPanel
          onBack={() => go('defaults')}
          onSave={() => {
            if (!loop.rules.some((r) => r.when === 'They reply with a clear yes'))
              addRule(loop.id, { when: 'They reply with a clear yes', glyph: 'reply', then: [{ label: 'Gifty drafts the answer' }, { label: 'Sam sends it' }], summary: 'Gifty drafts, Sam sends' })
            toast('Gifty will answer clear yeses')
            go('defaults')
          }}
        />
      )
    default:
      return <DefaultsPanel state={state} onClose={onClose} onAdd={() => go('trigger')} onAutoReply={() => go('reply')} onTurnedOff={(id) => loop.rules.find((r) => r.id === id)?.offWarning && go('off')} />
  }
}
