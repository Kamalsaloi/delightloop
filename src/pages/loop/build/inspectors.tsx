// Data-bound inspectors for each step type. Every edit writes to the store; the canvas card follows.
import { useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { InspectorTabs } from '@/components/canvas'
import { PanelFrame } from '@/components/panels/FloatingPanel'
import { Avatar, GmailMark, GmailTile } from '@/components/ui'
import { needsCopy, useGiftyTyping } from '@/canvas/copy'
import { teammate, TEAMMATES } from '@/data/catalog'
import { asset, CREAM, designUrl, FACE, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { DAY, fmtDay } from '@/lib/time'
import { locate, nodeDays, SPLIT_PATHS, waitDays } from '@/store/graph'
import { audienceCounts } from '@/store/selectors'
import { useStore } from '@/store/store'
import { copyCtx, giftyBump, giftyEmail, giftyLinkedIn, giftyPostcard } from '@/store/templates'
import type { CheckData, Loop, Ship, SplitKind, SplitNode, StepNode, WaitUnit } from '@/store/types'
import { AutoText, Footer, GiftyWriteButton, HeaderTile, KitHeader, MessageBox, Note, RadioList, Row, SaveButton, Section, SecondaryButton, Segmented, Select, Toggle, Token, type Option } from './kit'

type Props<T extends StepNode['type']> = { loop: Loop; node: Extract<StepNode, { type: T }>; onClose: () => void }

function useStepTools(loop: Loop, nodeId: string, onClose: () => void) {
  const updateStep = useStore((s) => s.updateStep)
  const removeNode = useStore((s) => s.removeNode)
  const toast = useStore((s) => s.toast)
  const days = nodeDays(loop.graph, loop.startAt)
  const day = days[nodeId] ?? 0
  return {
    day,
    date: fmtDay(loop.startAt + day * DAY),
    update: (patch: object) => updateStep(loop.id, nodeId, patch as never),
    remove: () => {
      onClose()
      removeNode(loop.id, nodeId)
    },
    saved: (what: string) => {
      onClose()
      toast(`${what} saved`)
    },
  }
}

/** Who a step reaches: everyone, or one side of a split. */
function reachOf(loop: Loop, nodeId: string) {
  const c = audienceCounts(loop)
  const at = locate(loop.graph.steps, nodeId)
  if (!at?.parentSplit) return { people: c.everyone, label: '' }
  const split = locate(loop.graph.steps, at.parentSplit)?.node as SplitNode | undefined
  if (!split) return { people: c.everyone, label: '' }
  const first = split.branches[0].id === at.seqId
  const opened = Math.round(c.everyone * 0.65)
  return { people: first ? opened : c.everyone - opened, label: SPLIT_PATHS[split.data.split][first ? 0 : 1].toLowerCase() }
}

// ── Email ───────────────────────────────────────────────────────────────────

type EmailTab = 'write' | 'timing'

export function EmailPanel({ loop, node, onClose }: Props<'email'>) {
  const navigate = useNavigate()
  const sendTest = useStore((s) => s.sendTest)
  const t = useStepTools(loop, node.id, onClose)
  const [tab, setTab] = useState<EmailTab>('write')
  const [variant, setVariant] = useState(0)
  const typing = useGiftyTyping(120)
  const bodyRef = useRef<HTMLDivElement>(null)
  const d = node.data
  const sender = teammate(d.from)
  const reach = reachOf(loop, node.id)
  const empty = !d.subject.trim() && !d.body.trim()
  const preview = loop.audience.people.find((p) => p.face && !loop.audience.removed.includes(p.slug))

  function write() {
    const copy = giftyEmail(copyCtx(loop), empty ? 0 : variant + 1)
    setVariant((v) => v + 1)
    t.update({ subject: copy.subject })
    typing.start(copy.body, (body) => t.update({ body }))
  }

  function insertField(token: string) {
    t.update({ body: `${d.body}${d.body && !d.body.endsWith(' ') ? ' ' : ''}{${token}}` })
  }

  return (
    <PanelFrame
      header={
        <div className="flex flex-col gap-4 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GmailTile />
              <div className="flex flex-col gap-0.5">
                <span className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-ink">{d.title}</span>
                <span className="text-[12.5px] leading-4 text-grey-3">
                  Email · Day {Math.round(t.day)}, {t.date} · {reach.people} people
                </span>
              </div>
            </div>
            <CloseX onClick={onClose} />
          </div>
          <InspectorTabs<EmailTab>
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'write', label: 'Write' },
              { value: 'timing', label: 'Timing' },
            ]}
          />
        </div>
      }
      footer={
        <Footer onRemove={t.remove}>
          <SecondaryButton onClick={() => sendTest(loop.id)} testId="send-test">
            Send me a test
          </SecondaryButton>
          <SaveButton onSaved={() => t.saved('Email')}>Save email</SaveButton>
        </Footer>
      }
    >
      {tab === 'write' ? (
        <div ref={bodyRef} className="flex flex-col gap-4 px-6 py-4">
          <Field title="From">
            <Select
              options={TEAMMATES.filter((x) => x.id !== 'priya').map((x) => x.id)}
              value={d.from}
              onChange={(from) => t.update({ from })}
              render={(id) => {
                const m = teammate(id)
                return (
                  <>
                    {m.face ? <Avatar id={m.face} size={20} /> : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ECEBE7] text-[9px] font-semibold text-grey-1">{m.initials}</span>}
                    <span className="text-[13.5px] font-medium text-ink">{m.name}</span>
                  </>
                )
              }}
            />
          </Field>
          <Field title="Subject">
            <input
              data-testid="email-subject"
              value={d.subject}
              onChange={(e) => t.update({ subject: e.target.value })}
              placeholder="Write a subject, e.g. Quick idea for {company}"
              className="h-10 rounded-[10px] px-3 text-[13.5px] leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] outline-none placeholder:text-grey-3 focus:shadow-[inset_0_0_0_1.5px_#6559F7]"
            />
          </Field>
          <Field title="Message">
            <MessageBox
              testId="email-body"
              value={d.body}
              onChange={(body) => t.update({ body })}
              placeholder={`Write a few lines in ${sender.first}’s voice. Use {company} to personalise.`}
              signoff={sender.first}
              footer={
                <>
                  <div className="flex items-center gap-1">
                    <ToolButton onClick={() => insertField('company')} wide>
                      <span className="text-[12.5px] font-medium leading-4">{'{ } Company'}</span>
                    </ToolButton>
                    <ToolButton onClick={() => insertField('first name')} wide>
                      <span className="text-[12.5px] font-medium leading-4">{'{ } Name'}</span>
                    </ToolButton>
                  </div>
                  <GiftyWriteButton empty={empty} busy={typing.busy} onClick={write} />
                </>
              }
            />
          </Field>
          {preview && (
            <div className="flex items-center justify-between rounded-[12px] bg-page px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] leading-4 text-grey-2">Preview as</span>
                <img src={asset(preview.face!)} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
                <span className="text-[13px] font-medium leading-4 text-ink">{preview.name}</span>
              </div>
              <button type="button" onClick={() => navigate(`/loops/${loop.id}/preview`)} className="cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link underline-offset-2 hover:underline">
                Open preview
              </button>
            </div>
          )}
          {needsCopy(node) && <Note tone="amber">Needs a subject and a message before launch</Note>}
        </div>
      ) : (
        <div className="flex flex-col gap-6 px-6 py-4">
          <Field title="Goes out">
            <div className="flex h-10 items-center justify-between rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1]">
              <span className="text-[13.5px] font-medium leading-4 text-ink">
                Day {Math.round(t.day)} · {t.date}
              </span>
              <span className="text-[12.5px] leading-4 text-grey-3">{t.day === 0 ? 'right after launch' : 'set by the steps before'}</span>
            </div>
          </Field>
          <Field title="Send time">
            <Segmented<'theirs' | 'ist'>
              value={d.sendAt}
              onChange={(sendAt) => t.update({ sendAt })}
              options={[
                { value: 'theirs', label: '9:00 their time' },
                { value: 'ist', label: '9:00 IST for all' },
              ]}
            />
            <Note>{d.sendAt === 'theirs' ? 'Lands at the top of each inbox, wherever they are' : 'Everyone gets it at once, some at night'}</Note>
          </Field>
          <Field title="Days">
            <Segmented<'weekdays' | 'any'>
              value={d.days}
              onChange={(days) => t.update({ days })}
              options={[
                { value: 'weekdays', label: 'Weekdays only' },
                { value: 'any', label: 'Any day' },
              ]}
            />
          </Field>
        </div>
      )}
    </PanelFrame>
  )
}

function CloseX({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" aria-label="Close" data-testid="panel-close" onClick={onClick} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-page hover:bg-fill">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" stroke="#55575F" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function Field({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12.5px] font-medium leading-4 text-grey-1">{title}</span>
      {children}
    </div>
  )
}

function ToolButton({ children, onClick, wide }: { children: ReactNode; onClick?: () => void; wide?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn('flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-grey-1 hover:bg-fill', wide ? 'px-2' : 'w-7')}
    >
      {children}
    </button>
  )
}

// ── Bump ────────────────────────────────────────────────────────────────────

export function BumpPanel({ loop, node, onClose }: Props<'bump'>) {
  const sendTest = useStore((s) => s.sendTest)
  const t = useStepTools(loop, node.id, onClose)
  const typing = useGiftyTyping(110)
  const [variant, setVariant] = useState(0)
  const d = node.data
  const reach = reachOf(loop, node.id)
  const intro = loop.graph.steps.find((n) => n.kind === 'step' && n.type === 'email')
  const introSubject = intro?.kind === 'step' && intro.type === 'email' ? intro.data.subject : ''

  function write() {
    typing.start(giftyBump(d.body ? variant + 1 : 0), (body) => t.update({ body }))
    setVariant((v) => v + 1)
  }

  return (
    <PanelFrame
      header={
        <KitHeader
          media={
            <HeaderTile>
              <GmailMark width={18} />
            </HeaderTile>
          }
          title={d.title}
          subtitle={`Email · Day ${Math.round(t.day)}, ${t.date}${reach.label ? ` · ${reach.label}` : ''}`}
          onClose={onClose}
        />
      }
      footer={
        <Footer onRemove={t.remove}>
          <SecondaryButton onClick={() => sendTest(loop.id)}>Send me a test</SecondaryButton>
          <SaveButton onSaved={() => t.saved('Email')}>Save email</SaveButton>
        </Footer>
      }
    >
      <Section title="Send it as">
        <Segmented<'thread' | 'new'>
          options={[
            { value: 'thread', label: 'Reply in the intro’s thread' },
            { value: 'new', label: 'New email', grow: 0.7 },
          ]}
          value={d.sendAs}
          onChange={(sendAs) => t.update({ sendAs })}
        />
        <Note>{d.sendAs === 'thread' ? `Shows up under “Re: ${introSubject || 'the intro'}”` : 'Starts a fresh thread with its own subject line'}</Note>
      </Section>
      <Section title="Message">
        <MessageBox
          testId="bump-body"
          value={d.body}
          onChange={(body) => t.update({ body })}
          placeholder="Two short lines that bring the first email back up."
          signoff={teammate(loop.senderId).first}
          footer={
            <>
              <span className="text-[12px] leading-4 text-grey-3">{d.body.length} characters</span>
              <GiftyWriteButton empty={!d.body.trim()} busy={typing.busy} onClick={write} />
            </>
          }
        />
      </Section>
      <Row
        last
        title="Skip if they open it meanwhile"
        note={d.skipIfOpened ? 'They move to the opened path instead' : 'Everyone on this path gets the bump'}
        control={<Toggle on={d.skipIfOpened} onChange={(skipIfOpened) => t.update({ skipIfOpened })} label="Skip if they open it meanwhile" />}
      />
    </PanelFrame>
  )
}

// ── LinkedIn ────────────────────────────────────────────────────────────────

const LIMIT = 200
const GREETING_CHARS = 25
const WAITS = ['After 3 days', 'After 5 days', 'After a week', 'Never, wait for them']

export function LinkedInPanel({ loop, node, onClose }: Props<'linkedin'>) {
  const integration = useStore((s) => s.integrations.linkedin)
  const askLinkedIn = useStore((s) => s.askLinkedIn)
  const t = useStepTools(loop, node.id, onClose)
  const typing = useGiftyTyping(110)
  const [variant, setVariant] = useState(0)
  const d = node.data
  const counts = audienceCounts(loop)
  const reach = reachOf(loop, node.id)
  const chars = GREETING_CHARS + d.note.trim().length
  const hasNote = d.action === 'connect' || d.action === 'message'

  function write() {
    typing.start(giftyLinkedIn(copyCtx(loop), d.note ? variant + 1 : 0), (note) => t.update({ note }))
    setVariant((v) => v + 1)
  }

  return (
    <PanelFrame
      header={<KitHeader media={<HeaderTile tone="linkedin">in</HeaderTile>} title={d.title} subtitle={`Day ${Math.round(t.day)}, ${t.date}${reach.label ? ` · people who ${reach.label === 'opened' ? 'opened' : reach.label}` : ''}`} onClose={onClose} />}
      footer={
        <Footer onRemove={t.remove}>
          <SaveButton onSaved={() => t.saved('Step')}>Save step</SaveButton>
        </Footer>
      }
    >
      <Section title="From">
        <div className="flex h-10 shrink-0 items-center gap-[10px] rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1]">
          <img src={asset(FACE.sam)} alt="" className="h-[22px] w-[22px] shrink-0 rounded-full object-cover" />
          <span className="grow basis-0 text-[13.5px] font-medium leading-4 text-ink">Sam Rivera’s LinkedIn</span>
          {integration === 'connected' ? (
            <span className="text-[12px] leading-4 text-green-text">Connected</span>
          ) : integration === 'asked' ? (
            <span className="text-[12px] leading-4 text-amber-text">Asked Sam</span>
          ) : (
            <button type="button" onClick={askLinkedIn} className="cursor-pointer text-[12px] font-medium leading-4 text-violet-link hover:underline">
              Ask Sam to connect
            </button>
          )}
        </div>
        {integration !== 'connected' && <Note tone="amber">Not connected yet. This blocks launch until Sam connects.</Note>}
      </Section>

      {hasNote && (
        <Section gap={10}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold leading-4 text-ink">{d.action === 'message' ? 'Message' : 'Note with the request'}</span>
            {d.action === 'connect' && (
              <Segmented<'note' | 'none'>
                options={[
                  { value: 'note', label: 'Short note' },
                  { value: 'none', label: 'No note' },
                ]}
                value={d.noteMode}
                onChange={(noteMode) => t.update({ noteMode })}
                size="sm"
              />
            )}
          </div>
          {d.noteMode === 'note' ? (
            <MessageBox
              testId="linkedin-note"
              value={d.note}
              onChange={(note) => t.update({ note })}
              placeholder="A line or two on why you’d like to connect."
              footer={
                <>
                  <GiftyWriteButton empty={!d.note.trim()} busy={typing.busy} onClick={write} />
                  <span className={chars > LIMIT ? 'text-[12px] leading-4 text-[#C2362F]' : 'text-[12px] leading-4 text-grey-3'}>
                    {d.note.trim() ? chars : 0} / {LIMIT}
                  </span>
                </>
              }
            />
          ) : (
            <Note>They get a plain request. Notes get about twice the accepts.</Note>
          )}
        </Section>
      )}

      <Section title="If they’re not on LinkedIn">
        <RadioList<'email' | 'skip'>
          options={[
            { value: 'email', label: 'Send the note as an email instead' },
            { value: 'skip', label: 'Skip this step for them' },
          ]}
          value={d.fallback}
          onChange={(fallback) => t.update({ fallback })}
        />
        <Note>
          {counts.notOnLinkedIn} of the {counts.everyone} have no profile
        </Note>
      </Section>

      {d.action === 'connect' && <Row last title="If they don’t accept" note="Move on to the next step anyway" control={<Select variant="pill" options={WAITS} value={d.wait} onChange={(wait) => t.update({ wait })} />} />}
    </PanelFrame>
  )
}

// ── Postcard ────────────────────────────────────────────────────────────────

const NOTE_MAX = 220
const SHIP_OPTIONS: Option<Ship>[] = [
  { value: 'best', label: 'Best per person' },
  { value: 'home', label: 'Home first' },
  { value: 'office', label: 'Office first' },
]

/** Downscale an uploaded image to a small data URL so it can live in the store. */
function readDesign(file: File, done: (url: string) => void) {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, 480 / img.width)
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height)
      done(c.toDataURL('image/jpeg', 0.8))
    }
    img.src = String(reader.result)
  }
  reader.readAsDataURL(file)
}

export function PostcardPanel({ loop, node, onClose }: Props<'postcard'>) {
  const t = useStepTools(loop, node.id, onClose)
  const typing = useGiftyTyping(120)
  const [designing, setDesigning] = useState(false)
  const [variant, setVariant] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const d = node.data
  const c = audienceCounts(loop)
  const src = designUrl(d.design)
  const sender = teammate(loop.senderId)
  const land1 = loop.startAt + (t.day + 1) * DAY
  const land2 = loop.startAt + (t.day + 2) * DAY
  const perCard = d.kind === 'letter' ? 9 : 6

  function askDesign() {
    setDesigning(true)
    window.setTimeout(() => {
      t.update({ design: GIFT.postcard })
      setDesigning(false)
    }, 1200)
  }

  function write() {
    typing.start(giftyPostcard(copyCtx(loop), d.note ? variant + 1 : 0), (note) => t.update({ note }))
    setVariant((v) => v + 1)
  }

  return (
    <PanelFrame
      header={
        <KitHeader
          media={<span className="block h-10 w-[52px] shrink-0 rounded-[8px] bg-cover bg-center" style={src ? { backgroundImage: `url(${src})` } : { backgroundColor: CREAM }} />}
          title={d.title}
          subtitle={`${d.kind === 'letter' ? 'Letter' : 'Postcard'} · lands ${fmtDay(land1)} to ${new Date(land2).getDate()} ${new Date(land2).toLocaleDateString('en-GB', { month: 'short' })}`}
          onClose={onClose}
        />
      }
      footer={
        <Footer
          left={
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold leading-4 text-ink">${perCard} a card</span>
              <span className="text-[12px] leading-4 text-grey-3">
                ${(perCard * c.withAddress).toLocaleString('en-US')} for {c.withAddress} people
              </span>
            </div>
          }
        >
          <SaveButton onSaved={() => t.saved('Step')}>Save step</SaveButton>
        </Footer>
      }
    >
      <Section title="Front of the card" gap={10}>
        {src ? (
          <div className="group relative h-[176px] overflow-hidden rounded-[12px] bg-cover bg-center shadow-[0_0_0_1px_#EBEBE8]" style={{ backgroundImage: `url(${src})` }}>
            <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" onClick={() => input.current?.click()} className="h-7 cursor-pointer rounded-[8px] bg-white px-2.5 text-[12px] font-medium text-ink shadow-[0_1px_2px_#11121626]">
                Replace
              </button>
              <button type="button" onClick={() => t.update({ design: null })} className="h-7 cursor-pointer rounded-[8px] bg-white px-2.5 text-[12px] font-medium text-ink shadow-[0_1px_2px_#11121626]">
                Use plain card
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn('flex h-32 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-dashed border-[#D4D4CF] bg-[#FBFBFA] hover:border-grey-4', designing && 'shimmer-bg')}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_#E4E4E1]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 10.5V2.5M5 5.5l3-3 3 3M3 10.5v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" stroke="#111216" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[13px] font-medium leading-4 text-ink">{designing ? 'Gifty is designing…' : 'Add your design'}</span>
            <span className="text-[12px] leading-4 text-grey-3">PNG or PDF, 6 × 4 in, front only</span>
          </button>
        )}
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readDesign(e.target.files[0], (design) => t.update({ design }))} />
        {!src && (
          <div className="flex items-center justify-between">
            <Note>No design? It goes out on plain cream card.</Note>
            <button type="button" data-testid="ask-gifty-design" disabled={designing} onClick={askDesign} className="cursor-pointer text-[12px] font-medium leading-4 text-violet-link hover:underline disabled:opacity-50">
              Ask Gifty
            </button>
          </div>
        )}
      </Section>

      <Section title="Handwritten note" meta={`${d.note.length} / ${NOTE_MAX}`}>
        <div className="flex flex-col gap-[10px] rounded-[12px] bg-[#FBF8F2] p-[14px] shadow-[inset_0_0_0_1.5px_#6559F7]">
          <AutoText
            testId="postcard-note"
            value={d.note}
            maxLength={NOTE_MAX}
            onChange={(note) => t.update({ note })}
            placeholder={`Write a few lines in ${sender.first}’s voice. Use {first name} to personalise.`}
            className="min-h-[46px] font-serif text-[16px] italic leading-[23px] text-[#2A2B36] placeholder:text-[#A8A49B]"
          />
          <span className={cn('font-serif text-[16px] italic leading-[23px]', d.note ? 'text-[#2A2B36]' : 'text-[#A8A49B]')}>Signed, {sender.first}</span>
          <div className="flex items-center justify-end border-t border-[#EDE7DD] pt-[10px]">
            <GiftyWriteButton empty={!d.note.trim()} busy={typing.busy} onClick={write} white />
          </div>
        </div>
        <Note>A pen robot writes it in {sender.first}’s handwriting</Note>
      </Section>

      <Section title="Ship to" last>
        <Segmented options={SHIP_OPTIONS} value={d.ship} onChange={(ship) => t.update({ ship })} />
        {c.noAddress > 0 ? <Note tone="amber">{c.noAddress} have no address yet, they skip this step</Note> : <Note>Every address found</Note>}
      </Section>
      <div className="flex justify-start px-6 pb-4">
        <button type="button" data-testid="remove-step" onClick={t.remove} className="cursor-pointer text-[13px] font-medium leading-4 text-[#C2410C] underline-offset-2 hover:underline">
          Remove step
        </button>
      </div>
    </PanelFrame>
  )
}

// ── Wait, then check (split) and plain waits ────────────────────────────────

const UNITS: Option<WaitUnit>[] = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weekdays', label: 'Weekdays', grow: 1.3 },
]
const SPLITS: Option<SplitKind>[] = [
  { value: 'opened', label: 'Opened the email' },
  { value: 'twice', label: 'Opened it twice or more' },
  { value: 'clicked', label: 'Clicked a link' },
  { value: 'linkedin', label: 'Has a LinkedIn profile' },
  { value: 'delivered', label: 'Gift delivered' },
]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const WINDOWS = ['9:00 to 17:00, their time', '8:00 to 12:00, their time', 'Any time, their time', '9:00 to 17:00, IST for all']
const MAX: Record<WaitUnit, number> = { hours: 72, days: 14, weekdays: 10 }

const checkGlyph = (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5 11 11 5M6 5h5v5" stroke="#111216" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const clockGlyph = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="5.5" stroke="#111216" strokeWidth="1.4" />
    <path d="M8 5v3l2 1.5" stroke="#111216" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

function NumberStepper({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  const btn = 'flex h-9 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] hover:bg-fill-hover disabled:cursor-default disabled:opacity-40'
  return (
    <div className="flex h-9 items-center rounded-[10px] shadow-[inset_0_0_0_1px_#E4E4E1]">
      <button type="button" aria-label="Less" data-testid="wait-less" disabled={value <= 1} onClick={() => onChange(value - 1)} className={btn}>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3.5 8h9" stroke="#55575F" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-6 shrink-0 text-center text-[14px] font-semibold tabular-nums leading-[18px] text-ink" data-testid="wait-count">
        {value}
      </span>
      <button type="button" aria-label="More" data-testid="wait-more" disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 3.5v9M3.5 8h9" stroke="#55575F" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function WaitFields({ count, unit, startAt, fromDay, onChange }: { count: number; unit: WaitUnit; startAt: number; fromDay: number; onChange: (p: Partial<CheckData>) => void }) {
  const from = startAt + fromDay * DAY
  const days = waitDays({ count, unit }, from)
  return (
    <>
      <div className="flex items-center gap-2">
        <NumberStepper value={count} max={MAX[unit]} onChange={(n) => onChange({ count: n })} />
        <Segmented options={UNITS} value={unit} onChange={(u) => onChange({ unit: u, count: Math.min(count, MAX[u]) })} className="grow basis-0" />
      </div>
      <div className="flex items-center gap-2 rounded-[10px] bg-[#F7F7F5] px-3 py-[10px]">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
          <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="#6E6F7C" strokeWidth="1.4" />
          <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="#6E6F7C" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="text-[12.5px] leading-4 text-[#33353C]">
          From {fmtDay(from)}, then {fmtDay(from + days * DAY)}
        </span>
      </div>
    </>
  )
}

export function CheckPanel({ loop, node, onClose }: { loop: Loop; node: SplitNode; onClose: () => void }) {
  const updateSplit = useStore((s) => s.updateSplit)
  const removeNode = useStore((s) => s.removeNode)
  const toast = useStore((s) => s.toast)
  const days = nodeDays(loop.graph, loop.startAt)
  const d = node.data
  const waitDaysCount = waitDays(d, loop.startAt + ((days[node.id] ?? 0) - 0) * DAY)
  const fromDay = (days[node.id] ?? 0) - waitDaysCount
  const [yes, no] = SPLIT_PATHS[d.split]
  const update = (p: Partial<CheckData>) => updateSplit(loop.id, node.id, p)

  function toggleDay(day: string) {
    update({ days: d.days.includes(day) ? (d.days.length > 1 ? d.days.filter((x) => x !== day) : d.days) : [...d.days, day] })
  }

  return (
    <PanelFrame
      header={<KitHeader media={<HeaderTile>{checkGlyph}</HeaderTile>} title="Wait, then check" subtitle={`${audienceCounts(loop).everyone} people · Day ${Math.round(days[node.id] ?? 0)}`} onClose={onClose} />}
      footer={
        <Footer
          removeLabel="Remove check"
          onRemove={() => {
            onClose()
            removeNode(loop.id, node.id)
          }}
        >
          <SaveButton
            onSaved={() => {
              onClose()
              toast('Check saved')
            }}
          >
            Save check
          </SaveButton>
        </Footer>
      }
    >
      <Section title="Wait" gap={12}>
        <WaitFields count={d.count} unit={d.unit} startAt={loop.startAt} fromDay={fromDay} onChange={update} />
      </Section>
      <Section title="Next step goes out" gap={10}>
        <div className="flex gap-1.5">
          {DAYS.map((day) => {
            const on = d.days.includes(day)
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                onClick={() => toggleDay(day)}
                className={cn(
                  'flex h-8 grow basis-0 cursor-pointer items-center justify-center rounded-[8px] text-[12.5px] leading-4',
                  on ? 'font-semibold text-[#4B3FD9] shadow-[inset_0_0_0_1.5px_#6559F7]' : 'font-medium text-grey-3 shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover',
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
        <Select options={WINDOWS} value={d.window} onChange={(window) => update({ window })} />
      </Section>
      <Section title="Then split by" gap={10}>
        <RadioList options={SPLITS} value={d.split} onChange={(split) => update({ split })} />
        <Note>Replies don’t need a path here. Your reply rule already stops their loop.</Note>
      </Section>
      <Section title="Paths" gap={8} last>
        {[yes, no].map((label, i) => (
          <div key={label} className="flex items-center justify-between">
            <span className={cn('flex h-[22px] items-center rounded-[11px] px-2 text-[12px] font-semibold leading-[14px] text-white', i === 0 ? 'bg-green' : 'bg-[#E5484D]')}>{label}</span>
            <span className="text-[12.5px] leading-4 text-grey-3">
              {node.branches[i].steps.length ? `${node.branches[i].steps.length} step${node.branches[i].steps.length === 1 ? '' : 's'}` : 'No step yet'}
            </span>
          </div>
        ))}
      </Section>
    </PanelFrame>
  )
}

export function WaitPanel({ loop, node, onClose }: Props<'wait'>) {
  const t = useStepTools(loop, node.id, onClose)
  const d = node.data
  const fromDay = t.day - waitDays(d, loop.startAt)
  return (
    <PanelFrame
      header={<KitHeader media={<HeaderTile>{clockGlyph}</HeaderTile>} title="Wait, then continue" subtitle={`Until Day ${Math.round(t.day)}, ${t.date}`} onClose={onClose} />}
      footer={
        <Footer onRemove={t.remove}>
          <SaveButton onSaved={() => t.saved('Wait')}>Save step</SaveButton>
        </Footer>
      }
    >
      <Section title="Wait" gap={12} last>
        <WaitFields count={d.count} unit={d.unit} startAt={loop.startAt} fromDay={fromDay} onChange={(p) => t.update({ count: p.count ?? d.count, unit: p.unit ?? d.unit })} />
        <Note>Everyone moves on together, no split.</Note>
      </Section>
    </PanelFrame>
  )
}

export function TaskPanel({ loop, node, onClose }: Props<'task'>) {
  const t = useStepTools(loop, node.id, onClose)
  const d = node.data
  return (
    <PanelFrame
      header={<KitHeader media={<HeaderTile>{clockGlyph}</HeaderTile>} title={d.title} subtitle={`HubSpot task · Day ${Math.round(t.day)}, ${t.date}`} onClose={onClose} />}
      footer={
        <Footer onRemove={t.remove}>
          <SaveButton onSaved={() => t.saved('Task')}>Save step</SaveButton>
        </Footer>
      }
    >
      <Section title="What to do" last>
        <div className="rounded-[12px] p-3 shadow-[inset_0_0_0_1px_#E4E4E1] focus-within:shadow-[inset_0_0_0_1.5px_#6559F7]">
          <AutoText value={d.note} onChange={(note) => t.update({ note })} placeholder="e.g. Call to check the gift arrived, mention the Q4 plan" className="min-h-[42px] text-[13.5px] leading-[21px] text-ink" />
        </div>
        <Note>
          Each person gets a task for <Token>{teammate(loop.senderId).first}</Token> in HubSpot.
        </Note>
      </Section>
    </PanelFrame>
  )
}
