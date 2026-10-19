import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonAvatar } from '@/components/audience/marks'
import { BuilderHeader, Page } from '@/components/shell'
import { HubSpotMark, Icon } from '@/components/ui'
import { giftById, teammate } from '@/data/catalog'
import type { Person } from '@/data/people'
import { asset, CREAM, designUrl, FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { DAY, fmtDay } from '@/lib/time'
import { GIFT_TRANSIT, nodeDays, stepsOfType } from '@/store/graph'
import { giftAssignments } from '@/store/gifts'
import { activePeople } from '@/store/sim'
import { useStore } from '@/store/store'
import type { Loop, StepNode } from '@/store/types'
import { Hl } from './Hl'
import { recipientFor, type Recipient } from './recipients'

type StepId = 'email' | 'linkedin' | 'postcard' | 'gift' | 'page'
type Ctx = { loop: Loop; r: Recipient; person: Person; days: Record<string, number> }
type Email = Extract<StepNode, { type: 'email' }>
type Li = Extract<StepNode, { type: 'linkedin' }>
type Post = Extract<StepNode, { type: 'postcard' }>
type GiftN = Extract<StepNode, { type: 'gift' }>

const BTN = 'flex h-10 shrink-0 cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-[10px] px-4 text-[13px] leading-4 transition-colors disabled:cursor-not-allowed disabled:opacity-50'

/** Replace merge fields with this person's values, highlighted. */
function fill(text: string, r: Recipient): ReactNode[] {
  const parts = text.split(/(\{company\}|\{first name\})/g)
  return parts.map((p, i) => (p === '{company}' ? <Hl key={i}>{r.short}</Hl> : p === '{first name}' ? <Hl key={i}>{r.first}</Hl> : <span key={i}>{p}</span>))
}

/** 06 · Preview one person end to end, desktop or phone. */
export default function PreviewPage({ loop }: { loop: Loop }) {
  // ── Router / store ───────────────────────────────────────────────
  const navigate = useNavigate()
  const sendTest = useStore((s) => s.sendTest)
  const toast = useStore((s) => s.toast)

  // ── Local state ──────────────────────────────────────────────────
  const [index, setIndex] = useState(0)
  const [phone, setPhone] = useState(false)
  const [step, setStep] = useState<StepId>('email')

  // ── Derived ──────────────────────────────────────────────────────
  const people = activePeople(loop)
  const person = people[Math.min(index, people.length - 1)]
  const r = useMemo(() => recipientFor(person, index), [person, index])
  const days = useMemo(() => nodeDays(loop.graph, loop.startAt), [loop.graph, loop.startAt])
  const email = stepsOfType(loop.graph, 'email')[0]
  const li = stepsOfType(loop.graph, 'linkedin')[0]
  const post = stepsOfType(loop.graph, 'postcard')[0]
  const gift = stepsOfType(loop.graph, 'gift')[0]
  const giftId = gift ? giftAssignments(loop, gift.data)[person.slug] : undefined
  const available: StepId[] = [email && 'email', li && 'linkedin', post && 'postcard', gift && 'gift', (gift || post) && 'page'].filter(Boolean) as StepId[]
  const current = available.includes(step) ? step : available[0]
  const ctx: Ctx = { loop, r, person, days }
  const nodeFor: Record<StepId, StepNode | undefined> = { email, linkedin: li, postcard: post, gift, page: gift ?? post }

  // ── Effects ──────────────────────────────────────────────────────
  useEffect(() => {
    if (index >= people.length) setIndex(Math.max(0, people.length - 1))
  }, [index, people.length])

  // ── Render helpers ───────────────────────────────────────────────
  function meta(id: StepId): { title: string; sub: string; icon: ReactNode } {
    const day = (n?: StepNode) => (n ? days[n.id] ?? 0 : 0)
    const date = (d: number) => fmtDay(loop.startAt + d * DAY)
    switch (id) {
      case 'email':
        return { title: email!.data.title, sub: `Day ${day(email)} · ${date(day(email))}, 9:00`, icon: <IconTile kind="gmail" /> }
      case 'linkedin':
        return { title: li!.data.action === 'connect' ? 'Connection request' : li!.data.title, sub: `Day ${day(li)} · if the intro is opened`, icon: <IconTile kind="linkedin" /> }
      case 'postcard':
        return { title: post!.data.kind === 'letter' ? 'Handwritten letter' : 'Handwritten postcard', sub: `Day ${day(post)} · lands ${date(day(post) + 1)}`, icon: <Thumb src={designUrl(post!.data.design)} /> }
      case 'gift':
        return { title: giftById(giftId ?? 'chai').name, sub: `Day ${day(gift)} · lands by ${date(day(gift) + GIFT_TRANSIT + 2)}`, icon: <Thumb src={asset(giftById(giftId ?? 'chai').img)} /> }
      case 'page':
        return { title: `${r.first}’s page`, sub: 'QR on the gift card opens it', icon: <IconTile kind="qr" /> }
    }
  }

  const editLabel: Record<StepId, string> = { email: 'Edit this email', linkedin: 'Edit this note', postcard: 'Edit this postcard', gift: 'Swap this gift', page: 'Edit this page' }

  return (
    <Page
      header={
        <BuilderHeader
          loop={loop}
          tab="preview"
          right={
            <>
              <button type="button" onClick={() => sendTest(loop.id)} className={cn(BTN, 'bg-white font-medium text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover')}>
                <Icon name="play" size={13} strokeWidth={1.4} />
                Send me a test
              </button>
              {loop.status === 'draft' && (
                <button type="button" data-testid="to-launch" onClick={() => navigate(`/loops/${loop.id}/launch`)} className={cn(BTN, 'bg-violet font-semibold text-white shadow-primary hover:bg-[#5A4EF0]')}>
                  Review &amp; launch
                  <Icon name="arrowRight" size={13} color="#FFFFFF" />
                </button>
              )}
            </>
          }
        />
      }
    >
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-12 pb-8 pt-6" data-scroll="content">
        <div className="mx-auto flex min-h-full max-w-[1344px] gap-6">
          <aside className="flex w-[296px] shrink-0 flex-col gap-4">
            <PersonSwitcher people={people} index={index} onChange={setIndex} />
            <div className="flex flex-col rounded-card bg-white p-2 shadow-card">
              <div className="flex flex-col gap-0.5 px-3 pb-2 pt-3">
                <span className="text-[14px] font-semibold leading-5 text-ink">What {r.first} gets</span>
                <span className="text-[12.5px] leading-4 text-grey-3">
                  {r.title}, {r.company} · {r.city}
                </span>
              </div>
              {available.map((id) => {
                const m = meta(id)
                const active = id === current
                return (
                  <button
                    key={id}
                    data-testid={`preview-step-${id}`}
                    onClick={() => setStep(id)}
                    className={cn('flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-[10px] text-left', active ? 'bg-[#F3F2FE] shadow-[inset_0_0_0_1px_#DCD8FD]' : 'hover:bg-fill-hover')}
                  >
                    {m.icon}
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className={cn('text-[13px] leading-4 text-ink', active ? 'font-semibold' : 'font-medium')}>{m.title}</span>
                      <span className={cn('text-[12px] leading-4', active ? 'text-grey-2' : 'text-grey-3')}>{m.sub}</span>
                    </span>
                  </button>
                )
              })}
              {available.length === 0 && <p className="px-3 pb-3 text-[12.5px] leading-4 text-grey-3">No steps yet. Add some on the Build tab.</p>}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 rounded-[10px] bg-[#EDEDEA] p-[3px]">
                {(['Desktop', 'Phone'] as const).map((label) => {
                  const on = (label === 'Phone') === phone
                  return (
                    <button
                      key={label}
                      data-testid={`device-${label.toLowerCase()}`}
                      onClick={() => setPhone(label === 'Phone')}
                      className={cn('flex h-7 cursor-pointer items-center rounded-[8px] px-3 text-[12.5px] leading-4', on ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.06)]' : 'font-medium text-grey-2 hover:text-ink')}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-4 shrink-0 rounded-[3px] bg-[#EFECFF]" />
                <span className="text-[12.5px] leading-4 text-grey-2">Filled in for {r.first}</span>
              </div>
            </div>
            {current && (
              <div key={`${current}-${phone}-${person.slug}`} className="flex min-h-0 flex-1 animate-[fade_.2s_ease-out] flex-col" data-testid="preview-doc">
                {phone ? <PhoneView step={current} ctx={ctx} email={email} li={li} post={post} gift={gift} giftId={giftId} /> : <DesktopDoc step={current} ctx={ctx} email={email} li={li} post={post} gift={gift} giftId={giftId} />}
              </div>
            )}
          </section>

          <aside className="flex w-[304px] shrink-0 flex-col gap-4">
            {current && (
              <div className="flex flex-col rounded-card bg-white shadow-card">
                <div className="flex flex-col gap-0.5 px-5 pb-3 pt-5">
                  <span className="text-[14px] font-semibold leading-5 text-ink">What Gifty filled in</span>
                  <span className="text-[12.5px] leading-4 text-grey-3">Every highlighted bit, and where it came from</span>
                </div>
                <div className="flex flex-col px-5 pb-2">
                  {filledFor(current, ctx, li, giftId).map((f) => (
                    <FilledRow key={f.label} f={f} />
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => toast(`${r.first}’s version is in your inbox`)}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-white text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)] hover:bg-fill-hover"
              >
                <Icon name="send" size={13} />
                Send me {r.first}’s version
              </button>
              {current && (
                <button
                  onClick={() => navigate(`/loops/${loop.id}/build`, { state: { select: nodeFor[current]?.id } })}
                  className="flex h-10 cursor-pointer items-center justify-center rounded-[10px] text-[13px] font-medium leading-4 text-grey-1 hover:bg-fill hover:text-ink"
                >
                  {editLabel[current]}
                </button>
              )}
            </div>
          </aside>
        </div>
      </main>
    </Page>
  )
}

// ── Person switcher ─────────────────────────────────────────────────────────

const RING = 'bg-white shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_rgba(17,18,22,.05)]'

function PersonSwitcher({ people, index, onChange }: { people: Person[]; index: number; onChange: (i: number) => void }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const p = people[index]
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  const square = cn('flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] hover:bg-fill-hover disabled:cursor-default disabled:hover:bg-white', RING)
  const matches = people.map((x, i) => ({ x, i })).filter(({ x }) => !q || x.name.toLowerCase().includes(q.toLowerCase()))
  if (!p) return null
  return (
    <div ref={ref} className="relative flex w-full items-center gap-1">
      <button className={square} disabled={index === 0} data-testid="person-prev" onClick={() => onChange(index - 1)} aria-label="Previous person">
        <Icon name="chevronLeft" size={12} strokeWidth={1.6} color={index === 0 ? '#B4B5BB' : '#111216'} />
      </button>
      <button onClick={() => setOpen((o) => !o)} className={cn('flex h-9 flex-1 cursor-pointer items-center gap-[10px] rounded-[10px] pl-1 pr-3 text-left hover:bg-fill-hover', RING)}>
        <PersonAvatar person={p} size={28} />
        <span className="flex-1 truncate text-[13px] font-semibold leading-4 text-ink" data-testid="person-name">
          {p.name}
        </span>
        <span className="text-[12px] tabular-nums leading-4 text-grey-3">
          {index + 1} of {people.length}
        </span>
        <Icon name="chevronDown" size={10} strokeWidth={1.8} color="#6E6F7C" />
      </button>
      <button className={square} disabled={index === people.length - 1} data-testid="person-next" onClick={() => onChange(index + 1)} aria-label="Next person">
        <Icon name="chevronRight" size={12} strokeWidth={1.6} color={index === people.length - 1 ? '#B4B5BB' : '#111216'} />
      </button>
      {open && (
        <div className="absolute left-10 top-full z-30 mt-2 flex w-[280px] flex-col rounded-[14px] bg-white p-1.5 shadow-pop">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a person" className="mb-1 h-9 rounded-[9px] bg-page px-3 text-[13px] leading-4 outline-none placeholder:text-grey-3" />
          <div className="thin-scroll flex max-h-[320px] flex-col overflow-y-auto overscroll-contain">
            {matches.map(({ x, i }) => (
              <button
                key={x.slug}
                onClick={() => {
                  onChange(i)
                  setOpen(false)
                }}
                className={cn('flex w-full cursor-pointer items-center gap-[10px] rounded-[10px] px-2 py-2 text-left', i === index ? 'bg-fill' : 'hover:bg-fill-hover')}
              >
                <PersonAvatar person={x} size={28} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[13px] font-semibold leading-4 text-ink">{x.name}</span>
                  <span className="truncate text-[12px] leading-4 text-grey-3">
                    {x.role}, {x.company}
                  </span>
                </span>
                {i === index && <Icon name="check" size={14} color="#6559F7" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────────────────────────

function GmailIcon({ w = 16 }: { w?: number }) {
  return (
    <svg width={w} height={(w * 3) / 4} viewBox="0 0 24 18" aria-hidden>
      <path d="M1.6 18h3.8V8.7L0 4.6v11.8C0 17.3.7 18 1.6 18z" fill="#4285F4" />
      <path d="M18.6 18h3.8c.9 0 1.6-.7 1.6-1.6V4.6l-5.4 4.1V18z" fill="#34A853" />
      <path d="M18.6 1.6v7.1L24 4.6V2.4c0-2-2.3-3.1-3.9-1.9l-1.5 1.1z" fill="#FBBC04" />
      <path d="M5.4 8.7V1.6L12 6.5l6.6-4.9v7.1L12 13.6 5.4 8.7z" fill="#EA4335" />
      <path d="M0 2.4v2.2l5.4 4.1V1.6L3.9.5C2.3-.7 0 .4 0 2.4z" fill="#C5221F" />
    </svg>
  )
}

function IconTile({ kind }: { kind: 'gmail' | 'linkedin' | 'qr' }) {
  if (kind === 'gmail')
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[0_0_0_1px_#EBEBE8]">
        <GmailIcon />
      </span>
    )
  if (kind === 'linkedin') return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-linkedin text-[13px] font-bold leading-[14px] text-white">in</span>
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-fill">
      <Icon name="qr" size={16} strokeWidth={1.4} color="#55575F" />
    </span>
  )
}

function Thumb({ src }: { src: string | null }) {
  return <span className="h-9 w-9 shrink-0 rounded-[10px] bg-cover bg-center" style={src ? { backgroundImage: `url(${src})` } : { backgroundColor: CREAM }} />
}

function Empty({ what }: { what: string }) {
  return <p className="text-[14px] italic leading-6 text-grey-3">No {what} yet. Write it on the Build tab, or ask Gifty to.</p>
}

// ── Desktop ─────────────────────────────────────────────────────────────────

const BODY = 'text-[15px] leading-6 text-ink'
const CARD = 'flex min-h-0 flex-1 flex-col overflow-auto rounded-[16px] bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_rgba(17,18,22,.04),0_12px_32px_-12px_rgba(17,18,22,.10)]'

type DocProps = { step: StepId; ctx: Ctx; email?: Email; li?: Li; post?: Post; gift?: GiftN; giftId?: string }

function DocHeader({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[14px] border-b border-line-soft px-8 pb-5 pt-6">
      <div className="text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink">{title}</div>
      {children}
    </div>
  )
}

function DesktopDoc({ step, ctx, email, li, post, giftId }: DocProps) {
  const { r, loop, days } = ctx
  const sender = teammate(loop.senderId)
  switch (step) {
    case 'email': {
      const d = email!.data
      const from = teammate(d.from)
      return (
        <div className={CARD}>
          <DocHeader title={d.subject ? fill(d.subject, r) : <span className="text-grey-3">No subject yet</span>}>
            <div className="flex items-center gap-3">
              <PersonAvatar person={{ face: from.face, initials: from.initials }} size={36} />
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13.5px] font-semibold leading-4 text-ink">{from.name}</span>
                  <span className="text-[12.5px] leading-4 text-grey-3">{from.first.toLowerCase()}@delightloop.co</span>
                </div>
                <span className="text-[12.5px] leading-4 text-grey-3">to {r.email}</span>
              </div>
              <span className="text-[12.5px] leading-4 text-grey-3">{fmtDay(loop.startAt + (days[email!.id] ?? 0) * DAY)}, 9:00</span>
            </div>
          </DocHeader>
          <div className={cn('flex max-w-[640px] flex-col gap-4 px-8 py-6', BODY)}>
            <p>
              Hi <Hl>{r.first}</Hl>,
            </p>
            {d.body ? d.body.split(/\n\n+/).map((para, i) => <p key={i}>{fill(para, r)}</p>) : <Empty what="message" />}
            <p>{from.first}</p>
          </div>
        </div>
      )
    }
    case 'linkedin':
      return (
        <div className={CARD}>
          <DocHeader title={li!.data.action === 'connect' ? 'Connection request' : li!.data.title}>
            <div className="text-[12.5px] leading-4 text-grey-3">
              From {sender.name}’s LinkedIn to {r.name}, {r.title} at {r.company}
            </div>
          </DocHeader>
          <div className="flex flex-col gap-5 px-8 py-6">
            <div className="flex max-w-[560px] gap-4 rounded-[14px] p-5 shadow-[0_0_0_1px_#EBEBE8]">
              <PersonAvatar person={{ face: sender.face, initials: sender.initials }} size={56} />
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold leading-5 text-ink">{sender.name}</span>
                  <span className="text-[12.5px] leading-4 text-grey-3">{sender.role}, DelightLoop</span>
                </div>
                <div className="rounded-[10px] rounded-bl-[2px] bg-white px-3 py-2.5 shadow-[0_0_0_1px_#EBEBE8]">
                  <p className="text-[14px] leading-[21px] text-[#33353C]">
                    {li!.data.noteMode === 'note' ? (
                      li!.data.note ? (
                        <>
                          Hi <Hl>{r.first}</Hl>, {fill(li!.data.note, r)}
                        </>
                      ) : (
                        <Empty what="note" />
                      )
                    ) : (
                      'A plain request, no note.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    case 'postcard':
      return (
        <div className={CARD}>
          <DocHeader title={post!.data.kind === 'letter' ? 'Handwritten letter' : 'Handwritten postcard'}>
            <div className="text-[12.5px] leading-4 text-grey-3">Written with a pen in blue ink · lands {fmtDay(loop.startAt + ((days[post!.id] ?? 0) + 1) * DAY)}</div>
          </DocHeader>
          <div className="grid grid-cols-2 gap-4 px-8 py-6">
            <PostcardFront post={post!} />
            <PostcardBack post={post!} r={r} sender={sender.first} />
          </div>
        </div>
      )
    case 'gift':
      return (
        <div className={CARD}>
          <DocHeader title={giftById(giftId ?? 'chai').name}>
            <div className="text-[12.5px] leading-4 text-grey-3">With a card from {sender.first}</div>
          </DocHeader>
          <div className="flex gap-6 px-8 py-6">
            <GiftItem ctx={ctx} giftId={giftId} />
          </div>
        </div>
      )
    case 'page':
      return (
        <div className={CARD}>
          <DocHeader title={`${r.first}’s page`}>
            <div className="flex items-center gap-1.5 text-[12.5px] leading-4 text-grey-3">
              <Icon name="link" size={13} color="#8B8D95" />
              delightloop.page/{r.short.toLowerCase()}/{r.first.toLowerCase()} · opens from the QR on the gift card
            </div>
          </DocHeader>
          <div className="max-w-[640px] px-8 py-6">
            <PageContent ctx={ctx} giftId={giftId} />
          </div>
        </div>
      )
  }
}

function PostcardFront({ post }: { post: Post }) {
  const src = designUrl(post.data.design)
  return src ? <img src={src} alt="Postcard front" className="aspect-[3/2] w-full rounded-[12px] object-cover shadow-[0_0_0_1px_#EBEBE8]" /> : <div className="aspect-[3/2] w-full rounded-[12px] shadow-[0_0_0_1px_#E4DCCD]" style={{ backgroundColor: CREAM }} />
}

function PostcardBack({ post, r, sender }: { post: Post; r: Recipient; sender: string }) {
  return (
    <div className="flex aspect-[3/2] w-full gap-4 rounded-[12px] bg-[#FBF9F4] p-5 shadow-[0_0_0_1px_#EBEBE8]">
      <p className="flex-1 font-serif text-[15.5px] italic leading-[23px] text-[#2B3A67]">
        {post.data.note ? fill(post.data.note, r) : <span className="text-[#A8A49B]">No note yet</span>}
        <br />
        {sender}
      </p>
      <div className="flex w-[34%] flex-col justify-end gap-1 border-l border-[#E8E3D6] pl-4 text-[12px] leading-4 text-grey-1">
        <span className="font-medium text-ink">{r.name}</span>
        <span>{r.company}</span>
        <span>{r.city}</span>
      </div>
    </div>
  )
}

function GiftItem({ ctx, giftId }: { ctx: Ctx; giftId?: string }) {
  const { r, loop } = ctx
  const g = giftById(giftId ?? 'chai')
  const node = stepsOfType(loop.graph, 'gift')[0]
  return (
    <>
      <img src={asset(g.img)} alt="" className="h-[280px] w-[300px] rounded-[12px] object-cover" />
      <div className="flex max-w-[300px] flex-col justify-between gap-4 rounded-[12px] bg-[#FBF9F4] p-5 shadow-[0_0_0_1px_#EBEBE8]">
        <p className="font-serif text-[17px] italic leading-[25px] text-ink">
          {node?.data.noteOn ? (
            node.data.note ? (
              <>
                Dear <Hl>{r.first}</Hl>, {fill(node.data.note, r)}
              </>
            ) : (
              <span className="text-[#A8A49B]">No card note yet</span>
            )
          ) : (
            <span className="text-grey-3">No card in this box</span>
          )}
          <br />— {teammate(loop.senderId).first}
        </p>
        <div className="flex items-center gap-2.5 border-t border-[#E8E3D6] pt-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white shadow-[0_0_0_1px_#EBEBE8]">
            <Icon name="qr" size={18} strokeWidth={1.4} color="#111216" />
          </span>
          <span className="text-[12px] leading-4 text-grey-2">Scan for a page made for {r.first}</span>
        </div>
      </div>
    </>
  )
}

function PageContent({ ctx, giftId, mobile }: { ctx: Ctx; giftId?: string; mobile?: boolean }) {
  const { r, loop, days } = ctx
  const sender = teammate(loop.senderId)
  const g = giftById(giftId ?? 'chai')
  const gift = stepsOfType(loop.graph, 'gift')[0]
  const lands = gift ? fmtDay(loop.startAt + ((days[gift.id] ?? 0) + GIFT_TRANSIT + 2) * DAY) : ''
  const moment = loop.moment?.label
  return (
    <div className={cn('flex flex-col', mobile ? 'gap-4' : 'gap-5')}>
      <div className="flex items-center gap-2">
        <PersonAvatar person={{ face: sender.face, initials: sender.initials }} size={22} />
        <span className="text-[12.5px] leading-4 text-grey-2">From {sender.first} at DelightLoop</span>
      </div>
      <p className={cn('font-serif italic text-[#2A2B36]', mobile ? 'text-[26px] leading-8' : 'text-[30px] leading-9')}>
        <Hl>{r.first}</Hl>, {moment === 'Diwali' ? 'a little Diwali light' : 'a little something'} for the <Hl>{r.short}</Hl> team
      </p>
      <div className="relative h-[170px] overflow-hidden rounded-[12px]">
        <img src={asset(sender.face ?? FACE.sam)} alt="" className="h-full w-full object-cover" />
        <span className="absolute bottom-3 left-3 flex h-7 items-center gap-1.5 rounded-full bg-[rgba(17,18,22,.72)] px-2.5 text-[12px] font-medium leading-4 text-white">
          <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden>
            <path d="M2 1v8l7-4z" fill="#fff" />
          </svg>
          A note from {sender.first} · 1:12
        </span>
      </div>
      {gift && (
        <div className="flex items-center gap-3 rounded-[12px] bg-white p-2.5 shadow-[0_0_0_1px_#EBEBE8]">
          <img src={asset(g.img)} alt="" className="h-14 w-14 rounded-[10px] object-cover" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[13.5px] font-semibold leading-[18px] text-ink">A {g.name.toLowerCase()} is on its way</span>
            <span className="text-[12.5px] leading-4 text-grey-2">
              Lands at your {r.city} {ctx.person.address?.line.startsWith('Office') ? 'office' : 'home'} by {lands}
            </span>
          </div>
        </div>
      )}
      <span className="flex h-11 items-center justify-center rounded-[10px] bg-violet text-[14px] font-semibold leading-4 text-white shadow-primary">Book 15 minutes with {sender.first}</span>
      <span className="text-center text-[13px] font-medium leading-4 text-grey-1">See how {r.proof.split(' and ')[0]} did it</span>
    </div>
  )
}

// ── Phone ───────────────────────────────────────────────────────────────────

function PhoneFrame({ children, statusDark }: { children: ReactNode; statusDark?: boolean }) {
  return (
    <div className="flex flex-1 items-start justify-center py-2">
      <div className="flex h-[700px] w-[340px] shrink-0 flex-col rounded-[54px] bg-[#1A1B20] p-[11px] shadow-[0_24px_60px_-28px_rgba(17,18,22,.5)]" data-testid="phone">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[44px] bg-white">
          <div className={cn('flex h-[50px] shrink-0 items-center justify-between px-8 text-[15px] font-semibold', statusDark ? 'text-white' : 'text-ink')}>
            <span>9:02</span>
            <span className="absolute left-1/2 top-[10px] h-[28px] w-[96px] -translate-x-1/2 rounded-full bg-[#111216]" />
            <span className="flex items-center gap-1">
              <svg width="16" height="11" viewBox="0 0 16 11" aria-hidden>
                <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
                <rect x="4.3" y="5" width="3" height="6" rx="1" fill="currentColor" />
                <rect x="8.6" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
                <rect x="12.9" y="0" width="3" height="11" rx="1" fill="currentColor" />
              </svg>
              <svg width="24" height="12" viewBox="0 0 24 12" aria-hidden>
                <rect x=".5" y=".5" width="20" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4" />
                <rect x="2" y="2" width="16" height="8" rx="1.8" fill="currentColor" />
                <rect x="21.5" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".4" />
              </svg>
            </span>
          </div>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain" data-testid="phone-screen">
            {children}
          </div>
          <span className="absolute bottom-2 left-1/2 h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-ink" />
        </div>
      </div>
    </div>
  )
}

const ToolGlyph = ({ d }: { d: string }) => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d={d} stroke="#111216" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function PhoneView({ step, ctx, email, li, post, giftId }: DocProps) {
  const { r, loop } = ctx
  const sender = teammate(loop.senderId)
  if (step === 'postcard')
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6">
        <div className="w-[420px] rotate-[-2deg]">
          <PostcardFront post={post!} />
        </div>
        <div className="w-[420px] rotate-[1.5deg]">
          <PostcardBack post={post!} r={r} sender={sender.first} />
        </div>
      </div>
    )
  if (step === 'gift')
    return (
      <div className="flex flex-1 items-center justify-center gap-6 py-6">
        <GiftItem ctx={ctx} giftId={giftId} />
      </div>
    )
  if (step === 'linkedin') {
    const d = li!.data
    return (
      <PhoneFrame>
        <div className="flex min-h-full flex-col bg-[#F4F2EE]">
          <div className="flex items-center gap-3 bg-white px-4 py-3">
            <ToolGlyph d="M10 3.5 5.5 8l4.5 4.5" />
            <span className="flex-1 text-[17px] font-semibold leading-6 text-ink">Invitations</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-linkedin text-[12px] font-bold text-white">in</span>
          </div>
          <div className="flex items-center justify-between border-y border-[#E8E5DF] px-4 py-2.5 text-[12.5px] font-semibold leading-4">
            <span className="text-grey-1">Received · 1 new</span>
            <span className="text-linkedin">Manage</span>
          </div>
          <div className="flex flex-col gap-3 bg-white px-4 pb-4 pt-4">
            <div className="flex items-center gap-3">
              <PersonAvatar person={{ face: sender.face, initials: sender.initials }} size={56} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold leading-5 text-ink">{sender.name}</span>
                <span className="text-[12.5px] leading-4 text-grey-1">{sender.role} at DelightLoop</span>
                <span className="text-[12px] leading-4 text-grey-3">4 mutual connections · now</span>
              </div>
            </div>
            {d.noteMode === 'note' && (
              <div className="rounded-[12px] bg-[#F4F2EE] px-3.5 py-3 text-[14px] leading-[23px] text-[#33353C]">
                {d.note ? (
                  <>
                    Hi <Hl>{r.first}</Hl>, {fill(d.note, r)}
                  </>
                ) : (
                  <span className="text-grey-3">No note yet</span>
                )}
              </div>
            )}
            <div className="flex gap-2.5">
              <span className="flex h-9 flex-1 items-center justify-center rounded-full text-[14px] font-semibold text-grey-1 shadow-[inset_0_0_0_1px_#55575F]">Ignore</span>
              <span className="flex h-9 flex-1 items-center justify-center rounded-full bg-linkedin text-[14px] font-semibold text-white">Accept</span>
            </div>
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 opacity-60">
              <span className="h-11 w-11 shrink-0 rounded-full bg-[#E8E5DF]" />
              <div className="flex flex-1 flex-col gap-2">
                <span className="h-2.5 w-3/5 rounded bg-[#E8E5DF]" />
                <span className="h-2 w-4/5 rounded bg-[#EDEAE4]" />
              </div>
            </div>
          ))}
        </div>
      </PhoneFrame>
    )
  }
  if (step === 'page')
    return (
      <PhoneFrame>
        <div className="flex min-h-full flex-col bg-[#FBF8F2]">
          <div className="bg-white px-3 pb-2.5">
            <div className="flex h-8 items-center justify-center gap-1.5 rounded-[9px] bg-fill text-[12.5px] leading-4 text-ink">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" stroke="#55575F" strokeWidth="1.6" />
                <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" stroke="#55575F" strokeWidth="1.6" />
              </svg>
              delightloop.page/{r.short.toLowerCase()}/{r.first.toLowerCase()}
            </div>
          </div>
          <div className="px-5 pb-10 pt-4">
            <PageContent ctx={ctx} giftId={giftId} mobile />
          </div>
        </div>
      </PhoneFrame>
    )
  const d = email!.data
  const from = teammate(d.from)
  return (
    <PhoneFrame>
      <div className="flex min-h-full flex-col px-5 pb-6">
        <div className="flex items-center justify-between py-3">
          <ToolGlyph d="M10 3.5 5.5 8l4.5 4.5" />
          <span className="flex items-center gap-4">
            <ToolGlyph d="M2.5 4.5h11v2h-11zM3.5 6.5v6h9v-6M6.5 9h3" />
            <ToolGlyph d="M3.5 4.5h9M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
            <ToolGlyph d="M2 3.5h12v9H2zM2.5 4.5l5.5 4 5.5-4" />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pb-4 pt-1">
          <span className="text-[21px] font-semibold leading-7 tracking-[-0.01em] text-ink">{d.subject ? fill(d.subject, r) : <span className="text-grey-3">No subject yet</span>}</span>
          <span className="rounded-[4px] bg-fill px-1.5 py-0.5 text-[11px] leading-4 text-grey-1">Inbox</span>
        </div>
        <div className="flex items-center gap-2.5 pb-4">
          <PersonAvatar person={{ face: from.face, initials: from.initials }} size={36} />
          <div className="flex flex-1 flex-col">
            <span className="text-[14.5px] font-semibold leading-5 text-ink">{from.name}</span>
            <span className="text-[12.5px] leading-4 text-grey-3">to me</span>
          </div>
          <span className="text-[12.5px] leading-4 text-grey-3">9:00 AM</span>
        </div>
        <div className="flex flex-1 flex-col gap-3.5 text-[15px] leading-[22px] text-ink">
          <p>
            Hi <Hl>{r.first}</Hl>,
          </p>
          {d.body ? d.body.split(/\n\n+/).map((para, i) => <p key={i}>{fill(para, r)}</p>) : <Empty what="message" />}
          <p>{from.first}</p>
        </div>
        <div className="flex gap-2.5 pt-6">
          {['Reply', 'Forward'].map((l) => (
            <span key={l} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[14px] font-medium text-ink shadow-[inset_0_0_0_1px_#DADAD5]">
              {l}
            </span>
          ))}
        </div>
      </div>
    </PhoneFrame>
  )
}

// ── What Gifty filled in ────────────────────────────────────────────────────

type Filled = { label: string; value: string; source: { kind: 'hubspot' | 'linkedin' | 'text'; text: string; link?: string } }

function filledFor(step: StepId, ctx: Ctx, li?: Li, giftId?: string): Filled[] {
  const { r, loop, days } = ctx
  const sender = teammate(loop.senderId)
  const company: Filled = { label: 'Company', value: r.short, source: { kind: 'hubspot', text: 'HubSpot, short name' } }
  const first: Filled = { label: 'First name', value: r.first, source: { kind: 'hubspot', text: 'HubSpot contact' } }
  const proof: Filled = { label: 'Proof', value: r.proof, source: { kind: 'text', text: `Your case studies closest to ${r.short}’s size` } }
  const address: Filled = { label: 'Address', value: ctx.person.address?.line ?? 'No address yet', source: { kind: 'hubspot', text: ctx.person.address ? 'HubSpot, checked by Gifty' : 'Add one on the Audience tab' } }
  const g = giftById(giftId ?? 'chai')
  switch (step) {
    case 'email':
      return [
        company,
        { label: 'Opening line', value: r.news.charAt(0).toUpperCase() + r.news.slice(1), source: { kind: 'linkedin', text: r.newsSource, link: 'View' } },
        proof,
        { label: 'Send time', value: `9:00 in ${r.city}`, source: { kind: 'text', text: 'From the Timing tab' } },
      ]
    case 'linkedin': {
      const len = li?.data.note ? 25 + li.data.note.length : 0
      const sends = li ? fmtDay(loop.startAt + (days[li.id] ?? 0) * DAY) : ''
      return [
        first,
        { label: 'Reason to connect', value: 'Points back to Monday’s intro', source: { kind: 'linkedin', text: `Only sent if ${r.pronoun} opened it` } },
        { label: 'Length', value: `${len} of 200 characters`, source: { kind: 'text', text: 'Fits LinkedIn’s note limit' } },
        { label: 'Sends', value: `${sends}, 10:30 in ${r.city}`, source: { kind: 'text', text: `From ${sender.first}’s LinkedIn, after ${r.pronoun} opens` } },
      ]
    }
    case 'postcard':
      return [first, address, { label: 'Message', value: 'Handwritten note', source: { kind: 'text', text: 'From the postcard step' } }]
    case 'gift':
      return [{ label: 'Gift', value: g.name, source: { kind: 'text', text: g.why } }, address, { label: 'Card note', value: 'From the gift step', source: { kind: 'text', text: 'Printed inside the box' } }]
    case 'page':
      return [
        { label: 'Headline', value: `A little ${loop.moment?.label === 'Diwali' ? 'Diwali light' : 'something'} for the ${r.short} team`, source: { kind: 'linkedin', text: r.newsSource } },
        { label: 'Video', value: `${sender.first}’s 1:12 note, recorded once`, source: { kind: 'text', text: 'Their name and company dropped in' } },
        { label: 'Gift', value: g.name, source: { kind: 'text', text: g.why } },
        { label: 'Opens from', value: 'The QR on the postcard and gift card', source: { kind: 'text', text: 'Each visit shows up in Results' } },
      ]
  }
}

function FilledRow({ f }: { f: Filled }) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-line-soft py-3">
      <span className="text-[12px] leading-4 text-grey-3">{f.label}</span>
      <span className="text-[13px] font-medium leading-[18px] text-ink">{f.value}</span>
      <span className="flex items-center gap-1.5 text-[12px] leading-4 text-grey-2">
        {f.source.kind === 'hubspot' && <HubSpotMark size={14} />}
        {f.source.kind === 'linkedin' && <span className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[3px] bg-linkedin text-[8px] font-bold leading-[10px] text-white">in</span>}
        {f.source.text}
        {f.source.link && <span className="font-medium text-violet-link">{f.source.link}</span>}
      </span>
    </div>
  )
}

