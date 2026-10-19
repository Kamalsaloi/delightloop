import type { ReactNode } from 'react'
import { GmailTile } from '@/components/ui'
import { AudiencePill, Branches, ConditionPill, FlowLine, GoalPill, StepRow } from './Flow'
import { GiftyCursor, HintCard, StepToolbar } from './Overlays'
import { FooterNote, GiftStack, LinkedInTile, PostcardThumb, RuleMarker, SenderChip, StepCard, StepChip, type StepCardProps } from './StepCard'
import { G } from './glyphs'

export type DiwaliStepId = 'intro' | 'linkedin' | 'bump' | 'postcard' | 'gift'
export type StepFooter = { left?: ReactNode; right?: ReactNode }

/** Default footers = 04 (draft). Override per step for live / paused states. */
export const DRAFT_FOOTERS: Record<DiwaliStepId, StepFooter> = {
  intro: { left: <SenderChip />, right: <StepChip tone="green">Ready</StepChip> },
  linkedin: {
    left: (
      <>
        <StepChip tone="amber">6 have no profile</StepChip>
        <FooterNote>They get an email</FooterNote>
      </>
    ),
  },
  bump: { left: <FooterNote>Replies in the intro’s thread</FooterNote>, right: <StepChip tone="green">Ready</StepChip> },
  postcard: { left: <StepChip>Lands 30–31 Oct</StepChip>, right: <StepChip tone="amber">7 addresses missing</StepChip> },
  gift: {
    left: (
      <>
        <StepChip>$58 to $90</StepChip>
        <StepChip>4 gifts</StepChip>
        <StepChip tone="amber">7 addresses missing</StepChip>
      </>
    ),
  },
}

export const DRAFT_SUBTITLES: Record<DiwaliStepId, ReactNode> = {
  intro: 'Quick idea for {company}',
  linkedin: 'With a short note',
  bump: '“Bumping this up”',
  postcard: 'Postcard, signed by Sam',
  gift: 'One per person',
}

type Props = {
  selected?: DiwaliStepId | null
  onSelect?: (id: DiwaliStepId) => void
  /** Which steps react to clicks (default: all, when onSelect is set). */
  selectable?: DiwaliStepId[]
  /** Per-step footer overrides ({left,right}); merged over DRAFT_FOOTERS. */
  footers?: Partial<Record<DiwaliStepId, StepFooter>>
  subtitles?: Partial<Record<DiwaliStepId, ReactNode>>
  branchLabels?: { opened?: ReactNode; notOpened?: ReactNode }
  /** Floating edit/copy/delete toolbar beside the gift card. */
  toolbar?: boolean
  /** Gifty's cursor right of the gift card. */
  cursor?: boolean
  /** "Skipped by a loop rule" note beside the postcard; its rule marker turns active. */
  postcardHint?: boolean
  onHintClick?: () => void
  /** Per-step StepCard overrides (className, selected, …), e.g. an "edited" ring in 10. */
  cards?: Partial<Record<DiwaliStepId, Partial<StepCardProps>>>
  /** Postcard sits right on the branch merge and the goal line is 32px (08a/10 in Paper). */
  tightMerge?: boolean
  /** Extra nodes rendered inside the flow (rare). */
  children?: ReactNode
  /** Replaces the top audience pill (Path B: "48 people from your list"). */
  audience?: ReactNode
  /** Make the "Opened the email?" pill and the goal pill selectable (Path B config states). */
  check?: { selected?: boolean; onClick?: () => void }
  goal?: { selected?: boolean; onClick?: () => void }
}

/** The drafted Diwali loop (04/05/08/10): audience → intro → check → LinkedIn | bump → postcard → gift → goal. */
export function DiwaliFlow({
  selected = null,
  onSelect,
  selectable,
  footers,
  subtitles,
  branchLabels,
  toolbar,
  cursor,
  postcardHint,
  onHintClick,
  cards,
  tightMerge,
  children,
  audience,
  check,
  goal,
}: Props) {
  const f = (id: DiwaliStepId) => ({ ...DRAFT_FOOTERS[id], ...footers?.[id] })
  const sub = (id: DiwaliStepId) => subtitles?.[id] ?? DRAFT_SUBTITLES[id]
  const pick = (id: DiwaliStepId) => (onSelect && (!selectable || selectable.includes(id)) ? () => onSelect(id) : undefined)
  const card = (id: DiwaliStepId) => ({
    selected: selected === id,
    onClick: pick(id),
    subtitle: sub(id),
    footerLeft: f(id).left,
    footerRight: f(id).right,
    ...cards?.[id],
  })

  return (
    <>
      {audience ?? <AudiencePill />}
      <FlowLine />
      <StepCard {...card('intro')} icon={<GmailTile />} title="Intro from Sam" day="Day 0" date="Mon 26 Oct" />
      <FlowLine />
      <ConditionPill selected={check?.selected} onClick={check?.onClick} />
      <FlowLine />
      <Branches
        left={{
          label: branchLabels?.opened ?? 'Opened',
          tone: 'green',
          node: (
            <StepCard
              {...card('linkedin')}
              width={280}
              icon={<LinkedInTile />}
              title="Connect on LinkedIn"
              subtitleIcon={G.pen()}
              day="Day 2"
              date="Wed 28 Oct"
            />
          ),
        }}
        right={{
          label: branchLabels?.notOpened ?? 'Not opened',
          tone: 'red',
          node: <StepCard {...card('bump')} width={280} icon={<GmailTile />} title="Gentle bump" day="Day 2" date="Wed 28 Oct" />,
        }}
      />
      {!tightMerge && <FlowLine />}
      <StepCard
        {...card('postcard')}
        icon={<PostcardThumb />}
        title="A short letter"
        titleAdornment={<RuleMarker active={postcardHint} />}
        day="Day 3"
        date="Thu 29 Oct"
        hint={
          postcardHint ? (
            <HintCard title="Skipped by a loop rule" onClick={onHintClick}>
              Not sent to anyone who replies or books first. Click to edit.
            </HintCard>
          ) : undefined
        }
      />
      <FlowLine />
      <StepRow
        left={toolbar ? <StepToolbar /> : undefined}
        right={cursor ? <GiftyCursor /> : undefined}
      >
        <StepCard {...card('gift')} icon={<GiftStack />} title="Diwali gift" titleAdornment={<RuleMarker />} day="Day 5" date="Sat 31 Oct" />
      </StepRow>
      <FlowLine h={tightMerge ? 32 : 16} />
      <GoalPill selected={goal?.selected} onClick={goal?.onClick} />
      {children}
    </>
  )
}
