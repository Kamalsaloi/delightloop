import { Fragment, type ReactNode } from 'react'
import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import type { PickItem, PickList, Rule } from './data'
import { RG } from './glyphs'

// ── Shell ───────────────────────────────────────────────────────────────────

/** 384 rules panel (radius 20, panel shadow). Scrolls inside the rail when taller than the canvas. */
export function PanelShell({ children, flush }: { children: ReactNode; flush?: boolean }) {
  return (
    <aside
      className={cn(
        'flex min-h-0 w-[384px] flex-col overflow-y-auto rounded-card bg-white shadow-panel [scrollbar-width:none] animate-[fade_.15s_ease-out]',
        !flush && 'gap-4 p-6',
      )}
    >
      {children}
    </aside>
  )
}

function SquareButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-page hover:bg-fill"
    >
      {children}
    </button>
  )
}

/** Title + subtitle; close (×) or back (‹) on the right. */
export function PanelHeader({ title, subtitle, onClose, onBack }: { title: string; subtitle: string; onClose?: () => void; onBack?: () => void }) {
  return (
    <div className="flex shrink-0 items-start justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-ink">{title}</span>
        <span className="text-[12.5px] leading-4 text-grey-3">{subtitle}</span>
      </div>
      {onBack && (
        <SquareButton label="Back" onClick={onBack}>
          {RG.back()}
        </SquareButton>
      )}
      {onClose && (
        <SquareButton label="Close" onClick={onClose}>
          {RG.close()}
        </SquareButton>
      )}
    </div>
  )
}

// ── Controls ────────────────────────────────────────────────────────────────

/** Violet switch: lg 32×18 (rule cards), sm 26×16 (compact rows). */
export function Switch({ on, onChange, size = 'lg', label }: { on: boolean; onChange: (v: boolean) => void; size?: 'lg' | 'sm'; label?: string }) {
  const lg = size === 'lg'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!on)
      }}
      className={cn(
        'flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors',
        lg ? 'h-[18px] w-8' : 'h-4 w-[26px]',
        on ? 'bg-violet' : 'bg-line-strong',
      )}
    >
      <span
        className={cn('shrink-0 rounded-full bg-white transition-transform', lg ? 'h-[14px] w-[14px]' : 'h-3 w-3')}
        style={{ transform: on ? `translateX(${lg ? 14 : 10}px)` : undefined }}
      />
    </button>
  )
}

/** Grey 28px chip used in rule cards. */
function RuleChip({ children, face, glyph }: { children: ReactNode; face?: string; glyph?: ReactNode }) {
  return (
    <span className={cn('flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-fill', face ? 'pl-1 pr-[10px]' : 'px-[10px]')}>
      {face && <img src={asset(face)} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />}
      {glyph}
      <span className="text-[12.5px] font-medium leading-4 text-ink">{children}</span>
    </span>
  )
}

const LABEL = 'w-10 shrink-0 text-[12.5px] leading-4 text-grey-3'

/** A · full rule card: When chip + switch, Then chips, optional note. */
export function RuleCard({
  rule,
  on,
  selected,
  onToggle,
  onSelect,
  onAddAction,
}: {
  rule: Rule
  on: boolean
  selected: boolean
  onToggle: (v: boolean) => void
  onSelect: () => void
  onAddAction?: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer flex-col gap-[10px] rounded-[14px] p-[14px] transition-shadow',
        selected ? 'shadow-[inset_0_0_0_1.5px_#6559F7]' : 'shadow-[inset_0_0_0_1px_#EBEBE8] hover:shadow-[inset_0_0_0_1px_#DADAD5]',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={LABEL}>When</span>
        <RuleChip glyph={rule.glyph}>{rule.when}</RuleChip>
        <span className="grow" />
        <Switch on={on} onChange={onToggle} label={rule.when} />
      </div>
      <div className={cn('flex items-start gap-2', !on && 'opacity-50')}>
        <span className={cn(LABEL, 'pt-1.5')}>Then</span>
        <div className="flex grow basis-0 flex-wrap gap-1.5">
          {rule.then.map((c) => (
            <RuleChip key={c.label} face={c.face}>
              {c.label}
            </RuleChip>
          ))}
          {rule.addAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAddAction?.()
              }}
              className="flex h-7 cursor-pointer items-center gap-1 rounded-[8px] px-2 shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover"
            >
              {RG.plus(11)}
              <span className="text-[12.5px] font-medium leading-4 text-grey-1">Action</span>
            </button>
          )}
        </div>
      </div>
      {rule.note && <p className="pt-0.5 text-[12px] leading-4 text-grey-3">{rule.note}</p>}
    </div>
  )
}

/** B / E · one-line rule row: name, summary, small switch. `children` = expanded content (E warning). */
export function CompactRule({ rule, on, onToggle, children }: { rule: Rule; on: boolean; onToggle: (v: boolean) => void; children?: ReactNode }) {
  const row = (
    <div className="flex items-center gap-2">
      <span className={cn('text-[13px] font-medium leading-4', on ? 'text-ink' : 'text-grey-3')}>{rule.when}</span>
      <span className={cn('grow basis-0 truncate text-[12.5px] leading-4', on ? 'text-grey-3' : 'text-[#B4B5BB]')}>{on ? rule.summary : 'Off'}</span>
      <Switch on={on} onChange={onToggle} size="sm" label={rule.when} />
    </div>
  )
  if (children) {
    return <div className="flex flex-col gap-[10px] rounded-[10px] p-3 shadow-[inset_0_0_0_1px_#EBEBE8]">{row}{children}</div>
  }
  return <div className="rounded-[10px] px-3 py-[10px] shadow-[inset_0_0_0_1px_#EBEBE8]">{row}</div>
}

// ── New-rule builder ────────────────────────────────────────────────────────

type PillState = 'active' | 'pending' | 'done'

function StepPill({ n, label, state, onClick }: { n: number; label: string; state: PillState; onClick?: () => void }) {
  const active = state === 'active'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex h-6 items-center gap-[5px] rounded-full pl-1 pr-2 disabled:cursor-default',
        active ? 'bg-white shadow-[inset_0_0_0_1.5px_#6559F7]' : 'cursor-pointer shadow-[inset_0_0_0_1px_#EBEBE8] hover:bg-fill-hover',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-3',
          active && 'bg-violet text-white',
          state === 'pending' && 'bg-fill text-grey-3',
          state === 'done' && 'bg-green',
        )}
      >
        {state === 'done' ? RG.check(9, 2.4) : n}
      </span>
      <span
        className={cn(
          'text-[12px] leading-4',
          active && 'font-semibold text-[#4B33D6]',
          state === 'pending' && 'font-medium text-grey-3',
          state === 'done' && 'font-medium text-ink',
        )}
      >
        {label}
      </span>
    </button>
  )
}

/** "① When — ② Then" progress pills. */
export function StepPills({ when, then, onWhen, onThen }: { when: PillState; then: PillState; onWhen?: () => void; onThen?: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <StepPill n={1} label="When" state={when} onClick={onWhen} />
      <span className="h-[1.5px] w-4 shrink-0 rounded-[1px] bg-line-strong" />
      <StepPill n={2} label="Then" state={then} onClick={onThen} />
    </div>
  )
}

/** White card with a violet ring holding the new rule's fields. */
export function NewRuleCard({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 flex-col gap-[14px] rounded-[14px] bg-white p-4 shadow-[inset_0_0_0_1.5px_#6559F7]">{children}</div>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12.5px] font-medium leading-4 text-grey-1">{label}</span>
      {children}
    </div>
  )
}

/** Focused search box with a chevron that collapses the list below. */
export function SearchField({
  placeholder,
  value,
  onChange,
  open,
  onToggle,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  open: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex h-10 shrink-0 cursor-text items-center gap-[10px] rounded-[10px] bg-white px-3 shadow-[inset_0_0_0_1.5px_#6559F7]">
      {RG.search()}
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 grow bg-transparent text-[13.5px] leading-4 text-ink outline-none placeholder:text-grey-3"
      />
      <button type="button" aria-label={open ? 'Collapse' : 'Expand'} onClick={onToggle} className={cn('cursor-pointer transition-transform', !open && 'rotate-180')}>
        {RG.chevronUp()}
      </button>
    </label>
  )
}

/** The chosen trigger: small icon, label, "Change". */
export function ChosenField({ item, onChange }: { item: PickItem; onChange: () => void }) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-[10px] rounded-[10px] pl-1.5 pr-2 shadow-[inset_0_0_0_1px_#E4E4E1]">
      {item.small}
      <span className="grow basis-0 text-[13.5px] font-medium leading-4 text-ink">{item.label}</span>
      <button type="button" onClick={onChange} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline underline-offset-2">
        Change
      </button>
    </div>
  )
}

/** Dropdown list of triggers / actions: Gifty's suggestion, then sections with hairline headings. */
export function PickerList({ list, query, onPick }: { list: PickList; query: string; onPick: (id: string) => void }) {
  const q = query.trim().toLowerCase()
  const match = (p: PickItem) => !q || `${p.label} ${p.sub}`.toLowerCase().includes(q)
  const sections = list.sections.map((s) => ({ ...s, items: s.items.filter(match) })).filter((s) => s.items.length > 0)
  const s = list.suggested
  return (
    <div className="flex shrink-0 flex-col gap-1 rounded-[12px] bg-white p-2 shadow-[0_0_0_1px_#EBEBE8,0_20px_40px_-16px_#11121638] animate-[fade_.15s_ease-out]">
      {match(s) && (
        <>
          <div className="px-2 py-1.5 text-[12px] font-medium leading-4 text-grey-3">{list.heading}</div>
          <button
            type="button"
            onClick={() => onPick(s.id)}
            className="group flex cursor-pointer items-center gap-3 rounded-[10px] bg-page p-[10px] text-left shadow-[inset_0_0_0_1px_#EBEBE8] hover:shadow-[inset_0_0_0_1px_#DADAD5]"
          >
            {s.media}
            <span className="flex min-w-0 grow basis-0 flex-col gap-0.5">
              <span className="text-[13.5px] font-semibold leading-4 text-ink">{s.label}</span>
              <span className="text-[12px] leading-4 text-grey-2">{s.sub}</span>
            </span>
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-white text-[12px] leading-3 text-grey-1 shadow-[0_0_0_1px_#E4E4E1]">
              ↵
            </span>
          </button>
        </>
      )}
      {sections.map((sec) => (
        <Fragment key={sec.title}>
          <div className="flex items-center gap-2 px-2 pb-1 pt-3">
            <span className="text-[12px] font-medium leading-4 text-grey-3">{sec.title}</span>
            <span className="h-px grow basis-0 bg-line-soft" />
          </div>
          {sec.items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p.id)}
              className="flex cursor-pointer items-center gap-3 rounded-[10px] p-2 text-left hover:bg-page"
            >
              {p.icon}
              <span className="flex grow basis-0 flex-col gap-px">
                <span className="text-[13px] font-medium leading-4 text-ink">{p.label}</span>
                <span className="text-[11.5px] leading-[14px] text-grey-3">{p.sub}</span>
              </span>
            </button>
          ))}
        </Fragment>
      ))}
      {!match(s) && sections.length === 0 && <div className="px-2 py-3 text-[12.5px] leading-4 text-grey-3">Nothing matches “{query}”</div>}
    </div>
  )
}

// ── Buttons ─────────────────────────────────────────────────────────────────

export function GhostButton({ children, onClick, leading, className }: { children: ReactNode; onClick?: () => void; leading?: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-white text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover',
        className,
      )}
    >
      {leading}
      {children}
    </button>
  )
}

export function SaveRuleButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[10px] bg-violet text-[13px] font-semibold leading-4 text-white shadow-primary hover:bg-[#5A4EF0] active:bg-[#5145E8]',
        className,
      )}
    >
      {RG.check(13, 1.9)}
      Save rule
    </button>
  )
}
