import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BuilderHeader } from '@/components/shell'
import { Toggle } from '@/components/ui'
import { HeaderPrimary, HubSpotDot, PersonAvatar, SourceMark } from '@/components/audience'
import { FACES, personBySlug } from '@/data/people'
import { asset, FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'

type Tab = 'list' | 'trigger' | 'gifty'

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'list', label: 'Your lists', sub: 'Pick a list you already have. Gifty checks every name once you do.' },
  { id: 'trigger', label: 'When something happens', sub: 'People join the moment something happens. Pick the signal.' },
  { id: 'gifty', label: 'Ask Gifty to find them', sub: 'Describe the people. Gifty finds them, in your CRM and outside it.' },
]

/** B0 · Start blank: pick who it's for. Tabs via ?tab=list|trigger|gifty (B0, B0c, B0d). */
export default function BlankList() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: Tab = raw === 'trigger' || raw === 'gifty' ? raw : 'list'
  const current = TABS.find((t) => t.id === tab)!

  function selectTab(t: Tab) {
    setParams(t === 'list' ? {} : { tab: t }, { replace: true })
  }

  return (
    <div className="min-h-screen">
      <BuilderHeader title="Untitled loop" tab="Audience" mode="blank" right={<HeaderPrimary label="Continue to build" disabled />} />

      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 px-12 py-8">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.02em] text-ink">Who is this loop for?</h1>
            <p className="text-[14px] leading-5 text-grey-2">{current.sub}</p>
          </div>
          <div role="tablist" className="flex gap-1 rounded-[10px] bg-[#EDEDEA] p-[3px]">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={t.id === tab}
                onClick={() => selectTab(t.id)}
                className={cn(
                  'flex h-8 cursor-pointer items-center rounded-[8px] px-[14px] text-[13px] leading-4 transition-colors',
                  t.id === tab ? 'bg-white font-semibold text-ink shadow-[0_0_0_1px_#E4E4E1,0_1px_2px_#1112160F]' : 'font-medium text-grey-2 hover:text-ink',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'list' && <ListsTab />}
        {tab === 'trigger' && <TriggerTab />}
        {tab === 'gifty' && <GiftyTab />}
      </main>
    </div>
  )
}

// ── Shared bits ─────────────────────────────────────────────

const panelShadow = 'shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_12px_32px_-16px_#1112161A]'

function GroupLabel({ icon, children, border }: { icon?: ReactNode; children: ReactNode; border?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 px-5 pb-1.5 pt-[14px]', border && 'border-t border-line-soft')}>
      {icon}
      {children}
    </div>
  )
}

function GroupTitle({ children }: { children: ReactNode }) {
  return <span className="text-[12.5px] font-semibold leading-4 text-grey-1">{children}</span>
}

function Radio({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        'h-[18px] w-[18px] shrink-0 rounded-full transition-shadow',
        on ? 'shadow-[inset_0_0_0_5px_#6559F7]' : 'shadow-[inset_0_0_0_1.5px_#D4D4D0]',
      )}
    />
  )
}

/** Selectable row used by both the list picker and the signal picker. */
function ChoiceRow({ on, onSelect, title, sub, trailing }: { on: boolean; onSelect: () => void; title: string; sub: string; trailing: ReactNode }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-[14px] rounded-[12px] px-3 py-[14px] text-left transition-colors',
        on ? 'bg-[#F3F2FE] shadow-[inset_0_0_0_1px_#DCD8FD]' : 'hover:bg-fill-hover',
      )}
    >
      <Radio on={on} />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className={cn('text-[14px] leading-[18px] text-ink', on ? 'font-semibold' : 'font-medium')}>{title}</span>
        <span className={cn('text-[12.5px] leading-4', on ? 'text-grey-2' : 'text-grey-3')}>{sub}</span>
      </span>
      {trailing}
    </button>
  )
}

function PrimaryBlock({ to, label, note }: { to: string; label: string; note: string }) {
  return (
    <div className="flex flex-col gap-[10px] border-t border-line-soft px-6 pb-5 pt-4">
      <Link
        to={to}
        className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-violet text-[13.5px] font-semibold leading-4 text-white shadow-primary transition-colors hover:bg-[#5A4EF0]"
      >
        {label}
        <svg width="13" height="13" viewBox="0 0 16 16">
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <span className="text-center text-[12px] leading-4 text-grey-3">{note}</span>
    </div>
  )
}

// ── Your lists ──────────────────────────────────────────────

type ListItem = { id: string; name: string; meta: string; faces: string[]; people: number; accounts: number }

const HUBSPOT_LISTS: ListItem[] = [
  { id: 'q4vp', name: 'Q4 VP Sales', meta: '48 people at 36 accounts · updated today', faces: [FACES.ananya, FACES.daniel, FACES.kenji], people: 48, accounts: 36 },
  { id: 'q4all', name: 'Q4 target accounts, everyone', meta: '212 people at 36 accounts · updated today', faces: [FACES.ethan, FACES.sofia, FACES.tom], people: 212, accounts: 36 },
  { id: 'lost', name: 'Accounts lost in 2025', meta: '88 people at 29 accounts · last week', faces: [FACES.meera, FACE.sam, FACES.daniel], people: 88, accounts: 29 },
  { id: 'renewals', name: 'Q4 renewals', meta: '54 people at 18 accounts · 2 days ago', faces: [FACES.kenji, FACES.sofia, FACES.ananya], people: 54, accounts: 18 },
]
const SAVED_LISTS: ListItem[] = [
  { id: 'saasboomi', name: 'SaaSBoomi booth visitors', meta: '112 people · used in 1 loop, 21 meetings', faces: [FACE.priya, FACES.tom, FACES.ethan], people: 112, accounts: 0 },
]

function FaceRow({ ids, size = 26, gap = 4 }: { ids: string[]; size?: number; gap?: number }) {
  return (
    <span className="flex items-center" style={{ gap }}>
      {ids.map((id, i) => (
        <img key={id + i} src={asset(id)} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
      ))}
    </span>
  )
}

function ListsTab() {
  const [selected, setSelected] = useState('q4vp')
  const [query, setQuery] = useState('')
  const all = [...HUBSPOT_LISTS, ...SAVED_LISTS]
  const list = all.find((l) => l.id === selected)!
  const match = (l: ListItem) => l.name.toLowerCase().includes(query.trim().toLowerCase())

  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col rounded-card bg-white shadow-card">
        <div className="flex items-center gap-3 border-b border-line-soft px-5 py-4">
          <label className="flex h-9 flex-1 items-center gap-2 rounded-[10px] bg-page px-3">
            <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="#8B8D95" strokeWidth="1.5" />
              <path d="M10.5 10.5 13.5 13.5" fill="none" stroke="#8B8D95" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 14 lists"
              className="flex-1 bg-transparent text-[13px] leading-4 text-ink outline-none placeholder:text-[#9C9DA5]"
            />
          </label>
          <button className="flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover">
            <svg width="13" height="13" viewBox="0 0 16 16">
              <path d="M8 10.5V2.5M5 5.5l3-3 3 3M3 10.5v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" fill="none" stroke="#111216" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Upload CSV
          </button>
        </div>

        <GroupLabel icon={<HubSpotDot />}>
          <GroupTitle>HubSpot lists</GroupTitle>
          <span className="text-[12.5px] leading-4 text-grey-3">synced 4 min ago</span>
        </GroupLabel>
        <div className="flex flex-col gap-0.5 px-2 pb-2">
          {HUBSPOT_LISTS.filter(match).map((l) => (
            <ChoiceRow key={l.id} on={l.id === selected} onSelect={() => setSelected(l.id)} title={l.name} sub={l.meta} trailing={<FaceRow ids={l.faces} />} />
          ))}
        </div>

        <GroupLabel border>
          <GroupTitle>Saved in DelightLoop</GroupTitle>
        </GroupLabel>
        <div className="flex flex-col px-2 pb-2">
          {SAVED_LISTS.filter(match).map((l) => (
            <ChoiceRow key={l.id} on={l.id === selected} onSelect={() => setSelected(l.id)} title={l.name} sub={l.meta} trailing={<FaceRow ids={l.faces} />} />
          ))}
        </div>
      </div>

      <ListSummary list={list} />
    </div>
  )
}

const TITLE_MIX = [
  { label: 'VP Sales', n: 31, color: '#6559F7' },
  { label: 'Head of Sales', n: 12, color: '#A49BFA' },
  { label: 'CRO', n: 5, color: '#D6D2FD' },
]
const WHERE = [
  { label: 'India', n: 22, pct: 46 },
  { label: 'UK', n: 11, pct: 23 },
  { label: 'US', n: 9, pct: 19 },
  { label: 'Singapore', n: 6, pct: 12 },
]

function ListSummary({ list }: { list: ListItem }) {
  const faces = [FACES.ananya, FACES.daniel, FACES.kenji, FACES.meera, FACES.sofia]
  return (
    <div className={cn('sticky top-[88px] self-start max-h-[calc(100vh-112px)] overflow-y-auto overscroll-contain [scrollbar-width:thin] flex w-[400px] shrink-0 flex-col rounded-card bg-white', panelShadow)}>
      <div className="flex flex-col gap-[14px] px-6 py-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[16px] font-semibold leading-5 text-ink">{list.name}</span>
          <span className="text-[13px] leading-[18px] text-grey-2">{list.accounts ? `${list.people} people at ${list.accounts} accounts` : `${list.people} people`}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaceRow ids={faces} size={36} gap={6} />
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fill text-[12px] font-semibold leading-[14px] text-grey-1">
            +{list.people - faces.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-[10px] border-t border-line-soft px-6 py-4">
        <GroupTitle>Titles</GroupTitle>
        <div className="flex h-2 shrink-0 gap-[3px]">
          {TITLE_MIX.map((t) => (
            <div key={t.label} className="rounded-[4px]" style={{ flex: `${t.n} 1 0px`, background: t.color }} />
          ))}
        </div>
        <div className="flex gap-4">
          {TITLE_MIX.map((t) => (
            <span key={t.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: t.color }} />
              <span className="text-[12.5px] leading-4 text-grey-1">
                {t.label} {t.n}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-line-soft px-6 py-4">
        <GroupTitle>Where they are</GroupTitle>
        {WHERE.map((w) => (
          <div key={w.label} className="flex items-center gap-[10px]">
            <span className="w-[76px] shrink-0 text-[12.5px] leading-4 text-[#33353C]">{w.label}</span>
            <span className="flex h-1.5 flex-1 rounded-[3px] bg-line-soft">
              <span className="rounded-[3px] bg-[#B4B5BB]" style={{ width: `${w.pct}%` }} />
            </span>
            <span className="w-5 shrink-0 text-right text-[12.5px] leading-4 text-grey-1">{w.n}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-[10px] border-t border-line-soft px-6 py-[14px]">
        <span className="flex-1 text-[12.5px] leading-[17px] text-amber-text">6 are already in Stalled deals, nudge. They’ll be skipped here.</span>
      </div>

      <PrimaryBlock to="/blank/people" label="Use this list" note="Next, Gifty checks roles, addresses and customers" />
    </div>
  )
}

// ── When something happens ──────────────────────────────────

type Signal = { id: string; title: string; sub: string; rate: string }

const SIGNAL_GROUPS: { id: string; label: string; icon: ReactNode; signals: Signal[] }[] = [
  {
    id: 'linkedin',
    label: 'On LinkedIn',
    icon: <SourceMark source="linkedin" size={16} />,
    signals: [
      { id: 'role', title: 'Someone starts a new role', sub: 'A job change or promotion at one of your accounts', rate: 'about 2 a week' },
      { id: 'topic', title: 'Someone posts about a topic', sub: 'You pick the topic, like hiring or a tool switch', rate: 'depends on topic' },
    ],
  },
  {
    id: 'hubspot',
    label: 'In HubSpot',
    icon: <HubSpotDot />,
    signals: [
      { id: 'quiet', title: 'A deal goes quiet', sub: 'No reply or activity for a number of days you set', rate: 'about 5 a week' },
      { id: 'stage', title: 'A deal reaches a stage', sub: 'Like Demo done or Closed won', rate: 'about 8 a week' },
    ],
  },
  {
    id: 'website',
    label: 'On your website',
    icon: <DelightMark />,
    signals: [{ id: 'pricing', title: 'A known account visits pricing', sub: 'DelightSense matches the visit to a company you sell to', rate: 'about 11 a week' }],
  },
]

function DelightMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
      <defs>
        <linearGradient id="b0c-dl" x1="21.506" x2="2.984" y1="16.417" y2="9.716" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6941C6" />
          <stop offset=".48" stopColor="#D2CEFE" />
          <stop offset="1" stopColor="#6941C6" />
        </linearGradient>
      </defs>
      <path
        d="M2.531 8.623c1.957-2.06 5.137-2.163 7.21-.239 2.123 1.97 4.041 4.44 6.162 6.442 1.657 1.442 4.246.482 4.643-1.737.488-2.735-2.416-4.668-4.544-2.994-.21.165-.456.499-.639.63-.036.024-.062.052-.11.033L13.645 9.04c.785-.915 1.807-1.66 2.971-1.917 2.716-.597 5.355 1.024 6.153 3.81 1.285 4.49-3.023 8.436-7.092 6.611-1.483-.664-3.29-2.945-4.486-4.182-.948-.982-2.026-2.245-3.013-3.13-1.557-1.395-4.038-.766-4.656 1.32-.87 2.93 2.385 5.201 4.654 3.191.104-.092.39-.471.496-.442l1.607 1.718c-.781.928-1.897 1.688-3.08 1.884-5.108.845-8.237-5.527-4.668-9.284z"
        fill="url(#b0c-dl)"
      />
    </svg>
  )
}

function TriggerTab() {
  const [selected, setSelected] = useState('role')
  const [titles, setTitles] = useState(['VP Sales', 'Head of Sales'])
  const signal = SIGNAL_GROUPS.flatMap((g) => g.signals).find((s) => s.id === selected)!
  const matches = [
    { slug: 'sofia', text: 'Sofia Marin, VP Sales at Northwind', when: 'today' },
    { slug: 'ethan', text: 'Ethan Brooks, Head of Sales at Larkspur', when: '7 days ago' },
  ]

  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col rounded-card bg-white shadow-card">
        {SIGNAL_GROUPS.map((g, gi) => (
          <div key={g.id} className="flex flex-col">
            <GroupLabel icon={g.icon} border={gi > 0}>
              <GroupTitle>{g.label}</GroupTitle>
            </GroupLabel>
            <div className="flex flex-col gap-0.5 px-2 pb-2">
              {g.signals.map((s) => (
                <ChoiceRow
                  key={s.id}
                  on={s.id === selected}
                  onSelect={() => setSelected(s.id)}
                  title={s.title}
                  sub={s.sub}
                  trailing={<span className={cn('text-[12.5px] leading-4', s.id === selected ? 'text-grey-1' : 'text-grey-3')}>{s.rate}</span>}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={cn('sticky top-[88px] self-start max-h-[calc(100vh-112px)] overflow-y-auto overscroll-contain [scrollbar-width:thin] flex w-[400px] shrink-0 flex-col rounded-card bg-white', panelShadow)}>
        <div className="flex flex-col gap-1 px-6 pb-4 pt-5">
          <span className="text-[16px] font-semibold leading-5 text-ink">{signal.title}</span>
          <span className="text-[13px] leading-[18px] text-grey-2">Narrow it down, then they join as it happens</span>
        </div>

        <div className="flex flex-col gap-[14px] border-t border-line-soft px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <GroupTitle>Titles</GroupTitle>
            <div className="flex flex-wrap gap-1.5">
              {titles.map((t) => (
                <span key={t} className="flex h-7 items-center gap-1.5 rounded-[8px] bg-fill px-[10px] text-[12.5px] font-medium leading-4 text-ink">
                  {t}
                  <button onClick={() => setTitles(titles.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="cursor-pointer">
                    <svg width="9" height="9" viewBox="0 0 16 16">
                      <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#8B8D95" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                onClick={() => !titles.includes('CRO') && setTitles([...titles, 'CRO'])}
                className="flex h-7 cursor-pointer items-center gap-1 px-2 text-[12.5px] font-medium leading-4 text-violet-link hover:underline"
              >
                <svg width="10" height="10" viewBox="0 0 16 16">
                  <path d="M8 3v10M3 8h10" fill="none" stroke="#5A3FE6" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Add
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <GroupTitle>At</GroupTitle>
            <button className="flex h-9 shrink-0 cursor-pointer items-center justify-between rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1] hover:bg-fill-hover">
              <span className="flex items-center gap-2">
                <HubSpotDot />
                <span className="text-[13px] font-medium leading-4 text-ink">Q4 target accounts · 212</span>
              </span>
              <svg width="11" height="11" viewBox="0 0 16 16">
                <path d="M4 6l4 4 4-4" fill="none" stroke="#8B8D95" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line-soft px-6 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[13.5px] font-semibold leading-[18px] text-ink">6 match right now</span>
            <span className="text-[12.5px] leading-4 text-grey-3">{signal.rate} since May</span>
          </div>
          {matches.map((m) => (
            <div key={m.slug} className="flex items-center gap-[10px]">
              <PersonAvatar person={personBySlug(m.slug)!} size={28} />
              <span className="flex-1 text-[12.5px] leading-4 text-[#33353C]">{m.text}</span>
              <span className="text-[12px] leading-4 text-grey-3">{m.when}</span>
            </div>
          ))}
        </div>

        <PrimaryBlock to="/loop/audience/always-on?from=blank" label="Use this signal" note="Next, set the wait and a weekly cap" />
      </div>
    </div>
  )
}

// ── Ask Gifty to find them ──────────────────────────────────

type Found = { name: string; title: string; where: string; inHubSpot: boolean; face?: string; initials: string }

const FOUND: Found[] = [
  { name: 'Ananya Rao', title: 'VP Sales, Kestrel Labs', where: 'Bengaluru · 140 people', inHubSpot: true, face: FACES.ananya, initials: 'AR' },
  { name: 'Arjun Mehta', title: 'Head of Sales, Quillpay', where: 'Mumbai · 210 people', inHubSpot: false, initials: 'AM' },
  { name: 'Meera Shah', title: 'VP Sales, Orbital', where: 'Bengaluru · 320 people', inHubSpot: true, face: FACES.meera, initials: 'MS' },
  { name: 'Rohan Iyer', title: 'Head of Sales, Lumen HR', where: 'Pune · 95 people', inHubSpot: false, initials: 'RI' },
]

const READ_AS = ['Head or VP of Sales', 'SaaS, Series B', 'India', 'SDR roles posted in the last 60 days']

function GiftyTab() {
  const [prompt, setPrompt] = useState('Heads of Sales at Series B SaaS companies in India that are hiring SDRs')
  const [saveNew, setSaveNew] = useState(true)

  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col rounded-card bg-white shadow-card">
        <div className="flex flex-col gap-[14px] p-5">
          <div className="flex items-end gap-3 rounded-[14px] bg-white py-[14px] pl-4 pr-[14px] shadow-[inset_0_0_0_1.5px_#6559F7,0_0_0_4px_#6559F71A]">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-6 min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-ink outline-none"
            />
            <button className="flex h-8 shrink-0 cursor-pointer items-center rounded-[9px] bg-white px-3 text-[13px] font-medium leading-4 text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover">
              Search again
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12.5px] leading-4 text-grey-3">Gifty read that as</span>
            {READ_AS.map((r) => (
              <span key={r} className="flex h-[26px] items-center rounded-[7px] bg-fill px-[10px] text-[12.5px] leading-4 text-[#33353C]">
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-y border-line-soft bg-[#FBFBFA] px-6 py-3 text-[12.5px] leading-4">
          <span className="font-semibold text-grey-1">64 people at 41 companies</span>
          <span className="text-grey-3">Sorted by company</span>
        </div>

        {FOUND.map((f) => (
          <div key={f.name} className="flex h-[60px] shrink-0 items-center gap-4 border-b border-line-soft px-6 transition-colors hover:bg-[#FAFAF8]">
            <div className="flex w-[300px] shrink-0 items-center gap-3">
              <PersonAvatar person={f} size={32} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold leading-4 text-ink">{f.name}</span>
                <span className="text-[12.5px] leading-4 text-grey-3">{f.title}</span>
              </div>
            </div>
            <span className="flex-1 text-[12.5px] leading-4 text-grey-1">{f.where}</span>
            {f.inHubSpot ? (
              <span className="flex items-center gap-1.5">
                <HubSpotDot size={14} />
                <span className="text-[12.5px] leading-4 text-grey-1">In HubSpot</span>
              </span>
            ) : (
              <span className="text-[12.5px] font-medium leading-4 text-violet-link">New to you</span>
            )}
          </div>
        ))}

        <div className="flex h-[52px] shrink-0 items-center justify-between px-6 text-[13px] leading-4">
          <span className="text-grey-3">Showing 4 of 64</span>
          <button className="cursor-pointer font-medium text-violet-link hover:underline">See everyone</button>
        </div>
      </div>

      <div className={cn('sticky top-[88px] self-start max-h-[calc(100vh-112px)] overflow-y-auto overscroll-contain [scrollbar-width:thin] flex w-[400px] shrink-0 flex-col rounded-card bg-white', panelShadow)}>
        <div className="flex flex-col gap-3 px-6 py-5">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold leading-8 tracking-[-0.02em] text-ink">64</span>
            <span className="text-[13.5px] leading-5 text-grey-2">people Gifty found</span>
          </div>
          <div className="flex h-1.5 shrink-0 gap-[3px]">
            <div className="rounded-[3px] bg-hubspot" style={{ flex: '22 1 0px' }} />
            <div className="rounded-[3px] bg-violet" style={{ flex: '42 1 0px' }} />
          </div>
          <div className="flex gap-4">
            <Legend color="#FF7A59">22 already in HubSpot</Legend>
            <Legend color="#6559F7">42 new to you</Legend>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 border-t border-line-soft px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13.5px] font-medium leading-[18px] text-ink">Save the new 42 to HubSpot</span>
            <span className="text-[12.5px] leading-[17px] text-grey-3">As a list called “Gifty, Series B heads of sales”, so replies land on a real contact</span>
          </div>
          <Toggle on={saveNew} onChange={setSaveNew} label="Save the new 42 to HubSpot" />
        </div>

        <div className="flex flex-col gap-1 border-t border-line-soft px-6 py-4">
          <span className="text-[13.5px] font-medium leading-[18px] text-ink">Uses 42 of your 500 monthly lookups</span>
          <span className="text-[12.5px] leading-[17px] text-grey-3">People already in HubSpot are free</span>
        </div>

        <PrimaryBlock to="/blank/people" label="Use these 64 people" note="Next, Gifty checks roles, addresses and customers" />
      </div>
    </div>
  )
}

function Legend({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: color }} />
      <span className="text-[12.5px] leading-4 text-grey-1">{children}</span>
    </span>
  )
}
