import type { ReactNode } from 'react'
import { ButtonLink, Button } from '@/components/ui'
import { SavedLabel } from '@/components/shell'
import { asset, FACE } from '@/lib/assets'
import { G } from './glyphs'

/** Two overlapping 30px collaborator faces (Priya + Sam). */
export function Collaborators({ ids = [FACE.priya, FACE.sam] }: { ids?: string[] }) {
  return (
    <div className="relative h-[30px] shrink-0" style={{ width: 30 + 20 * (ids.length - 1) }}>
      {ids.map((id, i) => (
        <img
          key={id}
          src={asset(id)}
          alt=""
          className="absolute top-0 h-[30px] w-[30px] rounded-full border-2 border-white object-cover"
          style={{ left: i * 20 }}
        />
      ))}
    </div>
  )
}

/** Draft top-bar right slot: note · faces · "Send test" · "Review & launch →" (→ /loop/preview). */
export function DraftActions({
  note = 'Saved just now',
  before,
  secondary,
  primary,
}: {
  note?: ReactNode
  /** Extra actions before the secondary button (e.g. B8's "Rules 4" toggle). */
  before?: ReactNode
  /** Replaces "Send test" (e.g. Path B's "Let Gifty finish"). */
  secondary?: ReactNode
  /** Replaces "Review & launch". */
  primary?: ReactNode
}) {
  return (
    <>
      <SavedLabel>{note}</SavedLabel>
      <Collaborators />
      {before}
      {secondary ?? (
        <Button variant="secondary" className="h-[42px]" leading={G.play()}>
          Send test
        </Button>
      )}
      {primary ?? (
        <ButtonLink to="/loop/preview" variant="primary" trailing={G.arrowRight()}>
          Review &amp; launch
        </ButtonLink>
      )}
    </>
  )
}
