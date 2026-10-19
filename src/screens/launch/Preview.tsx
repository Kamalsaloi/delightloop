import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AvatarStack, Button, ButtonLink, Icon } from '@/components/ui'
import { BuilderHeader, SavedLabel } from '@/components/shell'
import { FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { PersonSwitcher } from './PersonSwitcher'
import { FilledRow, STEP_IDS, StepDocument, filledFor, stepMeta, type StepId } from './PreviewSteps'
import { RECIPIENTS, recipientIndex } from './data'

const EDIT: Record<StepId, { label: string; to: string }> = {
  email: { label: 'Edit this email', to: '/loop/build/email' },
  linkedin: { label: 'Edit this note', to: '/loop/build/email' },
  postcard: { label: 'Edit this postcard', to: '/loop/build/gift' },
  gift: { label: 'Swap this gift', to: '/loop/build/gift?swap=1' },
  page: { label: 'Edit this page', to: '/loop/build/gift' },
}

/** 06 · Preview, one person end to end. ?person=<id>&step=<step> */
export default function Preview() {
  // ── Router ──────────────────────────────────────────────────
  const [params, setParams] = useSearchParams()

  // ── Local state ─────────────────────────────────────────────
  const [phone, setPhone] = useState(false)
  const [sent, setSent] = useState<'test' | 'version' | null>(null)

  // ── Derived ─────────────────────────────────────────────────
  const index = recipientIndex(params.get('person'))
  const person = RECIPIENTS[index]
  const step = (STEP_IDS.find((s) => s === params.get('step')) ?? 'email') as StepId

  // ── Handlers ────────────────────────────────────────────────
  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.set(key, value)
    setParams(next, { replace: true })
  }

  function flashSent(kind: 'test' | 'version') {
    setSent(kind)
    window.setTimeout(() => setSent(null), 1800)
  }

  return (
    <div className="flex h-screen min-h-[900px] flex-col bg-page">
      <BuilderHeader
        tab="Preview"
        right={
          <>
            <SavedLabel />
            <AvatarStack ids={[FACE.priya, FACE.sam]} size={30} step={20} />
            <Button
              className="h-[42px]"
              onClick={() => flashSent('test')}
              leading={<Icon name={sent === 'test' ? 'check' : 'play'} size={13} strokeWidth={1.4} />}
            >
              {sent === 'test' ? 'Sent to your inbox' : 'Send me a test'}
            </Button>
            <ButtonLink to="/loop/launch" variant="primary" className="h-[42px]" trailing={<Icon name="arrowRight" size={13} />}>
              Review & launch
            </ButtonLink>
          </>
        }
      />

      <main className="min-h-0 flex-1 px-12 pb-8 pt-6">
        <div className="mx-auto flex h-full max-w-[1344px] gap-6">
          {/* Who + their steps */}
          <aside className="flex w-[296px] shrink-0 flex-col gap-4">
            <PersonSwitcher index={index} onChange={(i) => update('person', RECIPIENTS[i].id)} stretch />
            <div className="flex flex-col rounded-card bg-white p-2 shadow-card">
              <div className="flex flex-col gap-0.5 px-3 pb-2 pt-3">
                <span className="text-[14px] font-semibold leading-5 text-ink">What {person.first} gets</span>
                <span className="text-[12.5px] leading-4 text-grey-3">
                  {person.title}, {person.company} · {person.city}
                </span>
              </div>
              {STEP_IDS.map((id) => {
                const m = stepMeta(id, person)
                const active = id === step
                return (
                  <button
                    key={id}
                    onClick={() => update('step', id)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-[10px] text-left',
                      active ? 'bg-[#F3F2FE] shadow-[inset_0_0_0_1px_#DCD8FD]' : 'hover:bg-fill-hover',
                    )}
                  >
                    {m.icon}
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className={cn('text-[13px] leading-4 text-ink', active ? 'font-semibold' : 'font-medium')}>{m.title}</span>
                      <span className={cn('text-[12px] leading-4', active ? 'text-grey-2' : 'text-grey-3')}>{m.sub}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* The rendered step */}
          <section className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
              <DeviceToggle phone={phone} onChange={setPhone} />
              <div className="flex items-center gap-2">
                <span className="h-3 w-4 shrink-0 rounded-[3px] bg-[#EFECFF]" />
                <span className="text-[12.5px] leading-4 text-grey-2">Filled in for {person.first}</span>
              </div>
            </div>
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col overflow-auto rounded-[16px] bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.04),0_12px_32px_-12px_rgba(17,18,22,.10)]',
                phone && 'mx-auto w-[400px]',
              )}
            >
              <StepDocument step={step} p={person} phone={phone} />
            </div>
          </section>

          {/* Where each highlighted bit came from */}
          <aside className="flex w-[304px] shrink-0 flex-col gap-4">
            <div className="flex flex-col rounded-card bg-white shadow-card">
              <div className="flex flex-col gap-0.5 px-5 pb-3 pt-5">
                <span className="text-[14px] font-semibold leading-5 text-ink">What Gifty filled in</span>
                <span className="text-[12.5px] leading-4 text-grey-3">Every highlighted bit, and where it came from</span>
              </div>
              <div className="flex flex-col px-5 pb-2">
                {filledFor(step, person).map((f) => (
                  <FilledRow key={f.label} f={f} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => flashSent('version')}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-white text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover"
              >
                <Icon name={sent === 'version' ? 'check' : 'send'} size={13} />
                {sent === 'version' ? 'Sent to your inbox' : `Send me ${person.first}’s version`}
              </button>
              <Link
                to={EDIT[step].to}
                className="flex h-10 items-center justify-center rounded-[10px] text-[13px] font-medium leading-4 text-grey-1 hover:bg-fill hover:text-ink"
              >
                {EDIT[step].label}
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function DeviceToggle({ phone, onChange }: { phone: boolean; onChange: (v: boolean) => void }) {
  const item = (label: string, active: boolean, value: boolean) => (
    <button
      onClick={() => onChange(value)}
      className={cn(
        'flex h-7 cursor-pointer items-center rounded-[8px] px-3 text-[12.5px] leading-4',
        active
          ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.06)]'
          : 'font-medium text-grey-2 hover:text-ink',
      )}
    >
      {label}
    </button>
  )
  return (
    <div className="flex items-center gap-1 rounded-[10px] bg-[#EDEDEA] p-[3px]">
      {item('Desktop', !phone, false)}
      {item('Phone', phone, true)}
    </div>
  )
}
