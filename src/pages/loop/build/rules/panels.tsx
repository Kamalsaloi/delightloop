import { useState } from 'react'
import { asset, FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { ACTIONS, EXTRA_GUARDRAIL, findPick, GUARDRAILS, TIMING_PHRASE, TIMINGS, TRIGGERS, type Rule, type Timing } from './data'
import { RG } from './glyphs'
import {
  ChosenField,
  CompactRule,
  Field,
  GhostButton,
  NewRuleCard,
  PanelHeader,
  PanelShell,
  PickerList,
  RuleCard,
  SaveRuleButton,
  SearchField,
  StepPills,
} from './parts'

export type RulesState = {
  rules: Rule[]
  on: Record<string, boolean>
  setOn: (id: string, v: boolean) => void
  /** Header subtitle on the rule-list panels. */
  subtitle?: string
  /** Open with the first rule selected (B8) or none (05a). */
  selectFirst?: boolean
}

const DEFAULT_SUBTITLE = 'Apply to everyone, at every step'

// ── A · Gifty's defaults ────────────────────────────────────────────────────

export function DefaultsPanel({
  state,
  onClose,
  onAdd,
  onAutoReply,
  onTurnedOff,
}: {
  state: RulesState
  onClose: () => void
  onAdd: () => void
  onAutoReply: () => void
  onTurnedOff: (id: string) => void
}) {
  const [selected, setSelected] = useState(state.selectFirst === false ? undefined : state.rules[0]?.id)
  function toggle(id: string, v: boolean) {
    state.setOn(id, v)
    if (!v) onTurnedOff(id)
  }
  return (
    <PanelShell>
      <PanelHeader title="Loop rules" subtitle={state.subtitle ?? DEFAULT_SUBTITLE} onClose={onClose} />
      <div className="flex flex-col gap-2">
        {state.rules.map((r) => (
          <RuleCard
            key={r.id}
            rule={r}
            on={state.on[r.id] !== false}
            selected={selected === r.id}
            onSelect={() => setSelected(r.id)}
            onToggle={(v) => toggle(r.id, v)}
            onAddAction={onAutoReply}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-dashed border-[#D4D4CF] hover:bg-fill-hover"
      >
        {RG.plus(12)}
        <span className="text-[13px] font-medium leading-4 text-grey-1">Add a rule</span>
      </button>
    </PanelShell>
  )
}

// ── B · Add a rule, pick when ───────────────────────────────────────────────

export function TriggerPanel({ state, onClose, onPick }: { state: RulesState; onClose: () => void; onPick: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(true)
  return (
    <PanelShell>
      <PanelHeader title="Loop rules" subtitle={state.subtitle ?? DEFAULT_SUBTITLE} onClose={onClose} />
      <div className="flex flex-col gap-1.5">
        {state.rules.slice(0, 3).map((r) => (
          <CompactRule key={r.id} rule={r} on={state.on[r.id] !== false} onToggle={(v) => state.setOn(r.id, v)} />
        ))}
      </div>
      <NewRuleCard>
        <StepPills when="active" then="pending" onThen={() => onPick(TRIGGERS.suggested.id)} />
        <Field label="When this happens">
          <SearchField placeholder="Search triggers" value={query} onChange={setQuery} open={open} onToggle={() => setOpen(!open)} />
        </Field>
        {open && <PickerList list={TRIGGERS} query={query} onPick={onPick} />}
      </NewRuleCard>
    </PanelShell>
  )
}

// ── C · Pick what happens ───────────────────────────────────────────────────

export function ActionsPanel({
  count,
  trigger,
  onBack,
  onChangeTrigger,
  onPick,
}: {
  count: number
  trigger: string | null
  onBack: () => void
  onChangeTrigger: () => void
  onPick: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(true)
  return (
    <PanelShell>
      <PanelHeader title="New rule" subtitle={`Joins the ${count} rules already set`} onBack={onBack} />
      <NewRuleCard>
        <StepPills when="done" then="active" onWhen={onChangeTrigger} />
        <Field label="When this happens">
          <ChosenField item={findPick(TRIGGERS, trigger)} onChange={onChangeTrigger} />
        </Field>
        <Field label="Then do this">
          <SearchField placeholder="Search actions" value={query} onChange={setQuery} open={open} onToggle={() => setOpen(!open)} />
        </Field>
        {open && <PickerList list={ACTIONS} query={query} onPick={onPick} />}
      </NewRuleCard>
    </PanelShell>
  )
}

// ── D · Read it back, then save ─────────────────────────────────────────────

function joinPhrases(parts: string[]) {
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

export function ReviewPanel({
  count,
  trigger,
  actions,
  onBack,
  onChangeTrigger,
  onAddAction,
  onCancel,
  onSave,
}: {
  count: number
  trigger: string | null
  actions: string[]
  onBack: () => void
  onChangeTrigger: () => void
  onAddAction: () => void
  onCancel: () => void
  onSave: (timings: Timing[]) => void
}) {
  const when = findPick(TRIGGERS, trigger)
  const steps = actions.map((id) => findPick(ACTIONS, id))
  const [timings, setTimings] = useState<Timing[]>(() => steps.map((_, i) => (i === 0 ? 'Right away' : 'Next day')))

  function cycle(i: number) {
    setTimings((t) => t.map((v, k) => (k === i ? TIMINGS[(TIMINGS.indexOf(v) + 1) % TIMINGS.length] : v)))
  }

  const sentence = `When ${when.phrase}, ${joinPhrases(steps.map((s, i) => `${s.phrase} ${TIMING_PHRASE[timings[i]]}`))}.`

  return (
    <PanelShell>
      <PanelHeader title="New rule" subtitle={`Joins the ${count} rules already set`} onBack={onBack} />
      <NewRuleCard>
        <StepPills when="done" then="done" onWhen={onChangeTrigger} onThen={onAddAction} />
        <Field label="When this happens">
          <ChosenField item={when} onChange={onChangeTrigger} />
        </Field>
        <Field label="Then do this, in order">
          <div className="flex flex-col rounded-[10px] shadow-[inset_0_0_0_1px_#E4E4E1]">
            {steps.map((s, i) => (
              <div key={s.id + i} className={cn('flex h-12 shrink-0 items-center gap-[10px] pl-2 pr-3', i > 0 && 'border-t border-line-soft')}>
                <span className="w-4 shrink-0 text-center text-[12px] font-semibold leading-4 text-grey-3">{i + 1}</span>
                {s.small}
                <span className="grow basis-0 text-[13px] font-medium leading-4 text-ink">{s.label}</span>
                <button
                  type="button"
                  title="Change timing"
                  onClick={() => cycle(i)}
                  className="cursor-pointer rounded-[6px] bg-fill px-2 py-0.5 text-[12px] font-medium leading-4 text-grey-1 hover:bg-[#ECECE9]"
                >
                  {timings[i]}
                </button>
              </div>
            ))}
          </div>
          <GhostButton onClick={onAddAction} leading={RG.plus(12, '#111216')} className="h-8 self-start rounded-[8px] px-3 text-[12.5px]">
            Add another action
          </GhostButton>
        </Field>
      </NewRuleCard>
      <div className="flex shrink-0 flex-col gap-1.5 rounded-[12px] bg-page p-[14px]">
        <span className="text-[12px] font-medium leading-4 text-grey-3">In plain words</span>
        <p className="text-[13px] leading-5 text-[#33353C]">{sentence}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-line-soft pt-4">
        <span className="grow basis-0 text-[12px] leading-4 text-grey-3">Applies to everyone still in the loop</span>
        <GhostButton onClick={onCancel} leading={RG.close(12, '#111216', 1.7)} className="h-10 px-[14px]">
          Cancel
        </GhostButton>
        <SaveRuleButton onClick={() => onSave(timings)} className="h-10 gap-1.5 px-4" />
      </div>
    </PanelShell>
  )
}

// ── E · Turning a rule off ──────────────────────────────────────────────────

export function OffPanel({ state, onClose, onUndo, onEmailsOnly }: { state: RulesState; onClose: () => void; onUndo: (id: string) => void; onEmailsOnly: (id: string) => void }) {
  const onCount = state.rules.filter((r) => state.on[r.id] !== false).length
  const amberBtn =
    'flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] bg-white px-3 text-[12.5px] leading-4 text-[#7A4A00] shadow-[inset_0_0_0_1px_#EBC98A,0_1px_2px_#7A4A0014] hover:bg-[#FFFBF3]'
  return (
    <PanelShell>
      <PanelHeader title="Loop rules" subtitle={`${onCount} of ${state.rules.length} on`} onClose={onClose} />
      <div className="flex flex-col gap-1.5">
        {state.rules.map((r) => {
          const off = state.on[r.id] === false
          return (
            <CompactRule key={r.id} rule={r} on={!off} onToggle={(v) => state.setOn(r.id, v)}>
              {off && r.offWarning && (
                <div className="flex flex-col gap-2 rounded-[8px] bg-amber-bg px-3 py-[10px]">
                  <p className="text-[12.5px] leading-[18px] text-[#7A4A00]">{r.offWarning}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onUndo(r.id)} className={cn(amberBtn, 'font-semibold')}>
                      {RG.undo()}
                      Undo
                    </button>
                    <button type="button" onClick={() => onEmailsOnly(r.id)} className={cn(amberBtn, 'font-medium')}>
                      {RG.mail()}
                      Only stop the emails
                    </button>
                  </div>
                </div>
              )}
            </CompactRule>
          )
        })}
      </div>
    </PanelShell>
  )
}

// ── F · Let Gifty answer clear yeses ────────────────────────────────────────

const SECTION = 'flex flex-col border-t border-line-soft px-6 py-5'
const SECTION_TITLE = 'text-[12.5px] font-semibold leading-4 text-grey-1'
const LINK = 'cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline underline-offset-2'

function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={onChange} className="flex cursor-pointer items-center gap-[10px] text-left">
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]',
          checked ? 'bg-violet' : 'bg-white shadow-[inset_0_0_0_1px_#C4C5CB]',
        )}
      >
        {checked && RG.check(10, 2.2)}
      </span>
      <span className="text-[13px] leading-4 text-ink">{label}</span>
    </button>
  )
}

type RunMode = 'draft' | 'auto'

export function ReplyPanel({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const [guards, setGuards] = useState(() => GUARDRAILS.map((label) => ({ label, checked: true })))
  const [mode, setMode] = useState<RunMode>('draft')

  function addGuard() {
    if (guards.some((g) => g.label === EXTRA_GUARDRAIL)) return
    setGuards((g) => [...g, { label: EXTRA_GUARDRAIL, checked: true }])
  }

  return (
    <PanelShell flush>
      <div className="flex shrink-0 items-center gap-3 px-6 py-5">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-fill hover:bg-[#ECECE9]"
        >
          {RG.back(12, '#111216', 1.6)}
        </button>
        <div className="flex flex-col gap-0.5">
          <span className="text-[16px] font-semibold leading-5 text-ink">Answer clear yeses</span>
          <span className="text-[12.5px] leading-4 text-grey-3">Gifty replies for Sam, within limits</span>
        </div>
      </div>

      <div className={cn(SECTION, 'gap-[10px]')}>
        <span className={SECTION_TITLE}>When</span>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#EAF5EF]">{RG.replyGreen()}</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-medium leading-[18px] text-ink">They reply with a clear yes</span>
            <span className="text-[12.5px] leading-4 text-grey-3">Anything less certain goes to Sam</span>
          </div>
        </div>
      </div>

      <div className={cn(SECTION, 'gap-3')}>
        <span className={SECTION_TITLE}>Then</span>
        <div className="flex gap-3">
          <div className="flex w-8 shrink-0 flex-col items-center gap-1">
            <img src={asset(FACE.sam)} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            <span className="min-h-3 w-[1.5px] grow basis-0 rounded-[1px] bg-line" />
          </div>
          <div className="flex grow basis-0 flex-col gap-2 pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-medium leading-[18px] text-ink">Reply as Sam</span>
              <button type="button" className={LINK}>
                Edit template
              </button>
            </div>
            <p className="text-[12.5px] leading-[18px] text-grey-2">“Great to hear, {'{first name}'}. Grab any time that works.” + Sam’s calendar</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#4A154B]">{RG.hash()}</span>
          <div className="flex grow basis-0 flex-col gap-0.5">
            <span className="text-[14px] font-medium leading-[18px] text-ink">Tell Sam in Slack</span>
            <span className="text-[12.5px] leading-4 text-grey-3">With a Take over button</span>
          </div>
        </div>
      </div>

      <div className={cn(SECTION, 'gap-[10px]')}>
        <div className="flex items-baseline justify-between">
          <span className={SECTION_TITLE}>Leave it to Sam if</span>
          <button type="button" onClick={addGuard} className={LINK}>
            Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {guards.map((g, i) => (
            <Checkbox
              key={g.label}
              label={g.label}
              checked={g.checked}
              onChange={() => setGuards((all) => all.map((x, k) => (k === i ? { ...x, checked: !x.checked } : x)))}
            />
          ))}
        </div>
      </div>

      <div className={cn(SECTION, 'gap-[10px]')}>
        <span className={SECTION_TITLE}>How it runs</span>
        <div role="tablist" className="flex gap-1 rounded-[10px] bg-fill p-[3px]">
          {(
            [
              ['draft', 'Draft, Sam sends'],
              ['auto', 'Send on its own'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                'flex h-8 grow basis-0 cursor-pointer items-center justify-center rounded-[8px] text-[13px] leading-4 transition-colors',
                mode === value ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160F]' : 'font-medium text-grey-2 hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[12px] leading-[17px] text-grey-3">
          {mode === 'draft'
            ? 'Gifty will offer to switch once Sam sends 10 drafts unchanged.'
            : 'Gifty sends clear yeses itself and tells Sam in Slack each time.'}
        </p>
      </div>

      <div className="flex shrink-0 justify-end gap-2 rounded-b-[20px] border-t border-line-soft bg-[#FBFBFA] px-6 py-4">
        <GhostButton onClick={onBack} className="h-9 px-[14px]">
          Cancel
        </GhostButton>
        <SaveRuleButton onClick={onSave} className="h-9 gap-2 px-[14px]" />
      </div>
    </PanelShell>
  )
}

