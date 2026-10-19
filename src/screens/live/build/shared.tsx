import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ButtonLink, Icon } from '@/components/ui'
import { BuilderHeader } from '@/components/shell'
import { Collaborators, FooterNote, SenderChip, StepChip, type DiwaliStepId, type StepFooter } from '@/components/canvas'

/**
 * Live / paused builder pieces (08, 08a, 10, 11).
 *   LiveHeader { status, now }      "Live · Day n" + time + faces + "Pause loop" → /paused/build
 *   PausedHeader                    "Paused · Day 3" + paused time + faces + "Review & resume" → /paused/review
 *   useLiveFooters / PAUSED_FOOTERS per-step footer overrides for DiwaliFlow
 *   EDITED_CARD                     violet "edited" ring for a changed step (10/11)
 */

const TAB_BADGES = { Results: 3 }

function NowLabel({ children }: { children: ReactNode }) {
  return <span className="text-[12.5px] leading-4 text-grey-3">{children}</span>
}

export function LiveHeader({ status, now }: { status: string; now: string }) {
  return (
    <BuilderHeader
      mode="live"
      tab="Build"
      status={status}
      statusTone="green"
      tabBadges={TAB_BADGES}
      right={
        <>
          <NowLabel>{now}</NowLabel>
          <Collaborators />
          <ButtonLink to="/paused/build" className="h-[42px]" leading={<Icon name="pause" size={13} strokeWidth={1.6} />}>
            Pause loop
          </ButtonLink>
        </>
      }
    />
  )
}

/** Filled play triangle (Paper uses a solid glyph, not the stroke icon). */
export function PlayGlyph({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="inline-block shrink-0" aria-hidden>
      <path d="M5 3.5v9l7.5-4.5L5 3.5Z" fill="#FFFFFF" />
    </svg>
  )
}

export function PausedHeader() {
  return (
    <BuilderHeader
      mode="paused"
      tab="Build"
      status="Paused · Day 3"
      statusTone="amber"
      tabBadges={TAB_BADGES}
      right={
        <>
          <NowLabel>Paused Thu 29 Oct, 10:05</NowLabel>
          <Collaborators />
          <ButtonLink to="/paused/review" variant="primary" className="!gap-2 font-semibold" leading={<PlayGlyph />}>
            Review &amp; resume
          </ButtonLink>
        </>
      }
    />
  )
}

/** 08 footers. `gift` differs per moment (Day 1 vs the 08a delivery panel). */
export function useLiveFooters(giftStatus: ReactNode): Partial<Record<DiwaliStepId, StepFooter>> {
  const navigate = useNavigate()
  return {
    intro: {
      left: <SenderChip />,
      right: (
        <StepChip tone="green" onClick={() => navigate('/live/results')}>
          5 replied →
        </StepChip>
      ),
    },
    bump: { left: <FooterNote>17 people</FooterNote>, right: <StepChip tone="green">Sends Wed</StepChip> },
    postcard: { left: <StepChip>Lands 30–31 Oct</StepChip>, right: <FooterNote>48 people</FooterNote> },
    gift: {
      left: (
        <>
          <StepChip>$58 to $90</StepChip>
          <StepChip>4 gifts</StepChip>
          {giftStatus}
        </>
      ),
    },
  }
}

export const LIVE_BRANCH_LABELS = { opened: 'Opened · 31', notOpened: 'Not opened · 17' }

/** 10/11: what already went out is locked; the gift step carries the unsaved edit. */
export function pausedFooters(edited: boolean): Partial<Record<DiwaliStepId, StepFooter>> {
  return {
    intro: { left: <SenderChip />, right: <StepChip tone="green">5 replied →</StepChip> },
    linkedin: {
      left: (
        <>
          <StepChip tone="green">25 sent Wed</StepChip>
          <FooterNote>6 got an email instead</FooterNote>
        </>
      ),
    },
    bump: { left: <FooterNote>17 people</FooterNote>, right: <StepChip tone="green">Sent Wed</StepChip> },
    postcard: { left: <StepChip>Lands 30–31 Oct</StepChip>, right: <FooterNote tone="amber">36 printed, can’t change</FooterNote> },
    gift: {
      left: (
        <>
          <StepChip>$58 to $90</StepChip>
          <StepChip>4 gifts</StepChip>
          {edited && <StepChip className="!bg-[#ECEAFE] !text-[#5547E6]">Edited · not live yet</StepChip>}
        </>
      ),
    },
  }
}

export const EDITED_CARD = { className: '!shadow-[0_0_0_1.5px_#6559F7,0_8px_24px_-12px_#6559F74D]' }
