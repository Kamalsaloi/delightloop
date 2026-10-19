import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { GmailTile } from '@/components/ui'
import { asset, FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { G } from './glyphs'
import { Inspector, InspectorFooter, InspectorHeader, InspectorTabs, PanelSecondaryButton, PanelSegmented, SaveButton } from './Inspector'

/** Inline merge field token ("company", "first name"). */
export function FieldToken({ children }: { children: ReactNode }) {
  return (
    <span contentEditable={false} className="mx-0.5 inline-block rounded-[6px] bg-[#F1EEFF] px-1.5 py-0.5 align-baseline text-[12.5px] font-medium leading-4 text-[#4B33D6]">
      {children}
    </span>
  )
}

export type EmailDraft = {
  title: string
  meta: string
  subject: ReactNode
  /** Paragraphs after the "Hi {first name}," line. */
  body: string[]
  signoff?: string
}

export const INTRO_EMAIL: EmailDraft = {
  title: 'Intro from Sam',
  meta: 'Email · Day 0, Mon 26 Oct · 48 people',
  subject: (
    <>
      Quick idea for<FieldToken>company</FieldToken>’s Q4
    </>
  ),
  body: [
    'Saw Kestrel opened two new offices this year. Teams growing that fast usually hit the same wall with outbound in Q4.',
    'We helped Orbit and Fieldwork book their first meetings with a short loop like this one. Worth 15 minutes next week?',
  ],
  signoff: 'Sam',
}

export const BUMP_EMAIL: EmailDraft = {
  title: 'Gentle bump',
  meta: 'Email · Day 2, Wed 28 Oct · 17 people',
  subject: (
    <>
      Re: Quick idea for<FieldToken>company</FieldToken>’s Q4
    </>
  ),
  body: ['Bumping this up in case it got buried. Happy to send a two-minute video instead if that’s easier to look at.'],
  signoff: 'Sam',
}

const label = 'text-[12.5px] font-medium leading-4 text-grey-1'
const field = 'flex h-10 shrink-0 items-center rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1]'

function Field({ title, children, grow }: { title: string; children: ReactNode; grow?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-2', grow && 'grow')}>
      <span className={label}>{title}</span>
      {children}
    </div>
  )
}

type Tab = 'write' | 'timing'

/** 05 · email step inspector (Write / Timing). */
export function EmailInspector({ draft = INTRO_EMAIL, onClose, fill = true }: { draft?: EmailDraft; onClose?: () => void; fill?: boolean }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('write')
  const [saved, setSaved] = useState(false)
  const [tested, setTested] = useState(false)
  function save() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1600)
  }
  function sendTest() {
    setTested(true)
    window.setTimeout(() => setTested(false), 1600)
  }
  return (
    <Inspector fill={fill}>
      <InspectorHeader media={<GmailTile />} title={draft.title} subtitle={draft.meta} onClose={onClose} />
      <InspectorTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'write', label: 'Write' },
          { value: 'timing', label: 'Timing' },
        ]}
      />
      {tab === 'write' ? <WriteTab draft={draft} onPreview={() => navigate('/loop/preview')} /> : <TimingTab />}
      <InspectorFooter row>
        <PanelSecondaryButton onClick={sendTest}>{tested ? 'Test sent' : 'Send me a test'}</PanelSecondaryButton>
        <SaveButton onClick={save}>{saved ? 'Email saved' : 'Save email'}</SaveButton>
      </InspectorFooter>
    </Inspector>
  )
}

function WriteTab({ draft, onPreview }: { draft: EmailDraft; onPreview: () => void }) {
  return (
    <div className="flex grow flex-col gap-4">
      <Field title="From">
        <button type="button" className={cn(field, 'cursor-pointer gap-2 text-left hover:bg-fill-hover')}>
          <img src={asset(FACE.sam)} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
          <span className="text-[13.5px] font-medium leading-4 text-ink">Sam Rivera</span>
          <span className="grow text-[13px] leading-4 text-grey-3">+ 2 teammates</span>
          {G.chevronDown()}
        </button>
      </Field>
      <Field title="Subject">
        <div contentEditable suppressContentEditableWarning className={cn(field, 'text-[13.5px] leading-4 text-ink outline-none focus:shadow-[inset_0_0_0_1.5px_#6559F7]')}>
          {draft.subject}
        </div>
      </Field>
      <Field title="Message" grow>
        <div className="flex grow flex-col justify-between rounded-[12px] p-4 shadow-[inset_0_0_0_1.5px_#6559F7]">
          <div contentEditable suppressContentEditableWarning className="flex flex-col gap-3 text-[13.5px] leading-5 text-ink outline-none">
            <div>
              Hi<FieldToken>first name</FieldToken>,
            </div>
            {draft.body.map((p) => (
              <div key={p}>{p}</div>
            ))}
            {draft.signoff && <div>{draft.signoff}</div>}
          </div>
          <div className="flex items-center justify-between border-t border-line-soft pt-4">
            <div className="flex items-center gap-1">
              <ToolButton>
                <span className="text-[13px] font-bold leading-4">B</span>
              </ToolButton>
              <ToolButton>
                <span className="text-[13px] font-semibold italic leading-4 [font-synthesis:style]">I</span>
              </ToolButton>
              <ToolButton>{G.link()}</ToolButton>
              <ToolButton wide>
                <span className="text-[12.5px] font-medium leading-4">{'{ } Field'}</span>
              </ToolButton>
            </div>
            <button type="button" className="cursor-pointer rounded-[8px] bg-fill px-[10px] py-1.5 text-[12.5px] font-medium leading-4 text-ink hover:bg-[#ECECE9]">
              Ask Gifty to rewrite
            </button>
          </div>
        </div>
      </Field>
      <div className="flex items-center justify-between rounded-[12px] bg-page px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] leading-4 text-grey-2">Preview as</span>
          <img src={asset(FACE.f3)} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
          <span className="text-[13px] font-medium leading-4 text-ink">Ananya Rao</span>
        </div>
        <button type="button" onClick={onPreview} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline underline-offset-2">
          Open preview
        </button>
      </div>
    </div>
  )
}

function ToolButton({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      className={cn('flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-grey-1 hover:bg-fill', wide ? 'px-2' : 'w-7')}
    >
      {children}
    </button>
  )
}

type SendAt = 'theirs' | 'ist'
type Days = 'weekdays' | 'any'

function TimingTab() {
  const [sendAt, setSendAt] = useState<SendAt>('theirs')
  const [days, setDays] = useState<Days>('weekdays')
  return (
    <div className="flex grow flex-col gap-6">
      <Field title="Goes out">
        <div className={cn(field, 'justify-between')}>
          <span className="text-[13.5px] font-medium leading-4 text-ink">Day 0 · Mon 26 Oct</span>
          <span className="text-[12.5px] leading-4 text-grey-3">right after launch</span>
        </div>
      </Field>
      <Field title="Send time">
        <PanelSegmented<SendAt>
          value={sendAt}
          onChange={setSendAt}
          options={[
            { value: 'theirs', label: '9:00 their time' },
            { value: 'ist', label: '9:00 IST for all' },
          ]}
        />
        <span className="text-[12px] leading-4 text-grey-3">
          {sendAt === 'theirs' ? 'Lands at the top of each inbox, wherever they are' : 'Everyone gets it at once, some at night'}
        </span>
      </Field>
      <Field title="Days">
        <PanelSegmented<Days>
          value={days}
          onChange={setDays}
          options={[
            { value: 'weekdays', label: 'Weekdays only' },
            { value: 'any', label: 'Any day' },
          ]}
        />
      </Field>
    </div>
  )
}
