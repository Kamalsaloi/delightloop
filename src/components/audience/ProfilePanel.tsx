import type { ReactNode } from 'react'
import { getProfile, subtitle, type Person, type Profile } from '@/data/people'
import { HubSpotDot, PersonAvatar, SourceMark } from './marks'

type Props = {
  person: Person
  backLabel?: string
  /** e.g. "3 of 48" */
  position?: string
  onClose: () => void
  onAddAddress?: () => void
  onRemove?: () => void
}

/** Right-hand behavioural profile for one person (03d / B0b, Paper DAL-0). Works for any slug. */
export function ProfilePanel({ person, backLabel = 'Everyone', position, onClose, onAddAddress, onRemove }: Props) {
  const profile = getProfile(person)

  return (
    <aside className="flex flex-col overflow-clip rounded-card bg-white shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A,0_20px_48px_-24px_#1112162E] animate-[slideIn_.2s_ease-out]">
      <Header person={person} profile={profile} backLabel={backLabel} position={position} onClose={onClose} />

      {(profile.post || profile.timeline.length > 0) && (
        <Section title="On their mind" gap={12}>
          {profile.post && <PostCard person={person} post={profile.post} />}
          {profile.timeline.length > 0 && (
            <div className="flex flex-col">
              {profile.timeline.map((t, i) => (
                <div key={t.date + t.text} className={i > 0 ? 'flex items-baseline gap-3 border-t border-[#F4F4F2] py-2' : 'flex items-baseline gap-3 py-2'}>
                  <span className="w-[52px] shrink-0 text-[12px] leading-4 text-grey-3">{t.date}</span>
                  <span className="flex-1 text-[13px] leading-[18px] text-ink">{t.text}</span>
                  <SourceMark source={t.source} size={14} />
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      <Section title="Outside work" gap={10}>
        {profile.interests.length > 0 && <InterestBars interests={profile.interests} />}
        <p className="text-[12.5px] leading-[18px] text-grey-2">{profile.interestNote}</p>
      </Section>

      <Section title="How they write" gap={10}>
        <div className="flex flex-wrap gap-1.5">
          {profile.writing.map((w) => (
            <span key={w} className="flex h-6 items-center rounded-[6px] bg-fill px-[9px] text-[12px] leading-4 text-[#33353C]">
              {w}
            </span>
          ))}
        </div>
      </Section>

      <div className="flex items-start gap-3 border-b border-line-soft px-5 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <SectionTitle>Ships to</SectionTitle>
          {profile.shipsTo ? (
            <>
              <span className="text-[13px] leading-[18px] text-[#33353C]">{profile.shipsTo.line}</span>
              <span className="text-[12px] leading-4 text-grey-3">{profile.shipsTo.note}</span>
            </>
          ) : (
            <span className="text-[13px] leading-[18px] text-amber-text">Gifty couldn’t find an address</span>
          )}
        </div>
        <button
          onClick={profile.shipsTo ? undefined : onAddAddress}
          className="shrink-0 cursor-pointer text-[12.5px] font-medium leading-4 text-violet-link hover:underline"
        >
          {profile.shipsTo ? 'Edit' : 'Add'}
        </button>
      </div>

      <div className="flex items-center justify-between px-5 pb-4 pt-[14px] text-[12.5px] font-medium leading-4">
        <button className="flex cursor-pointer items-center gap-1.5 text-grey-1 hover:text-ink">
          <HubSpotDot size={14} />
          Open in HubSpot
        </button>
        <button onClick={onRemove ?? onClose} className="cursor-pointer text-[#C2410C] hover:underline">
          Remove from loop
        </button>
      </div>
    </aside>
  )
}

function Header({ person, profile, backLabel, position, onClose }: { person: Person; profile: Profile; backLabel: string; position?: string; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-[18px] border-b border-[#EFEFEC] bg-[#F7F7F5] px-5 pb-5 pt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex h-[26px] cursor-pointer items-center gap-1 rounded-[7px] pl-1 pr-2 text-[12.5px] font-medium leading-4 text-grey-2 hover:bg-[#EEEEEB] hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 16 16">
            <path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {backLabel}
        </button>
        <div className="flex items-center gap-3">
          {position && <span className="text-[12.5px] leading-4 text-grey-3">{position}</span>}
          <button onClick={onClose} aria-label="Close" className="-m-0.5 cursor-pointer rounded-[6px] p-0.5 hover:bg-[#EEEEEB]">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#8B8D95" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <PersonAvatar person={person} size={64} className="shadow-[0_0_0_3px_#FFFFFF,0_2px_8px_#1112161F]" />
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="text-[19px] font-semibold leading-6 tracking-[-0.015em] text-ink">{person.name}</span>
          <span className="text-[13px] leading-4 text-grey-1">{subtitle(person)}</span>
          <div className="flex gap-1.5">
            {profile.socials.map((s) => (
              <span key={s.source} className="flex h-[22px] items-center gap-[5px] rounded-[6px] bg-white pl-1 pr-[7px] shadow-[inset_0_0_0_1px_#E4E4E1]">
                <SourceMark source={s.source} size={14} />
                <span className="text-[11.5px] font-medium leading-[14px] text-[#33353C]">{s.followers}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex rounded-[12px] bg-white shadow-[0_0_0_1px_#EBEBE8]">
        {profile.facts.map((f, i) => (
          <div key={f.label} className={i < profile.facts.length - 1 ? 'flex flex-1 flex-col gap-0.5 border-r border-line-soft px-3 py-[10px]' : 'flex flex-1 flex-col gap-0.5 px-3 py-[10px]'}>
            <span className="text-[13.5px] font-semibold leading-[18px] text-ink">{f.value}</span>
            <span className="text-[11.5px] leading-[14px] text-grey-3">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PostCard({ person, post }: { person: Person; post: NonNullable<Profile['post']> }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[12px] bg-white p-[14px] shadow-[0_0_0_1px_#EBEBE8,0_1px_2px_#1112160A]">
      <div className="flex items-center gap-2">
        <PersonAvatar person={person} size={20} />
        <span className="flex-1 text-[12px] font-medium leading-4 text-[#33353C]">
          {post.handle} · {post.when}
        </span>
        <SourceMark source={post.source} size={16} />
      </div>
      <p className="text-[14px] leading-5 text-ink">{post.text}</p>
      <span className="text-[12px] leading-4 text-grey-3">{post.stats}</span>
    </div>
  )
}

function InterestBars({ interests }: { interests: Profile['interests'] }) {
  const max = Math.max(...interests.map((i) => i.posts))
  return (
    <div className="flex flex-col gap-2">
      {interests.map((i) => (
        <div key={i.label} className="flex items-center gap-[10px]">
          <span className="w-[104px] shrink-0 text-[13px] leading-4 text-ink">{i.label}</span>
          <span className="flex h-1.5 flex-1 rounded-[3px] bg-line-soft">
            <span className="rounded-[3px] bg-[#A49BFA]" style={{ width: `${Math.round((i.posts / max) * 100)}%` }} />
          </span>
          <span className="w-[52px] shrink-0 text-right text-[12px] leading-4 text-grey-3">
            {i.posts} post{i.posts === 1 ? '' : 's'}
          </span>
        </div>
      ))}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-semibold leading-4 text-ink">{children}</span>
}

function Section({ title, gap, children }: { title: string; gap: number; children: ReactNode }) {
  return (
    <div className="flex flex-col border-b border-line-soft px-5 py-[18px]" style={{ gap }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  )
}
