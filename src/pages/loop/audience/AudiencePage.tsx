import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddAddressesSheet, AudienceHeading, ChecksCard, FILTER_LABEL, HeaderPrimary, LinkedInSlot, matchesFilter, PeopleTable, ProfilePanel, SingleCheck, type PeopleFilter } from '@/components/audience'
import { FloatingPanel } from '@/components/panels/FloatingPanel'
import { BuilderHeader, Page, ScrollArea } from '@/components/shell'
import { flatten } from '@/store/graph'
import { audienceCounts } from '@/store/selectors'
import { activePeople } from '@/store/sim'
import { useStore } from '@/store/store'
import type { Loop } from '@/store/types'
import { HowFunnel } from './HowFunnel'
import { ListPicker } from './ListPicker'
import { SignalAudience } from './SignalAudience'

type Panel = { kind: 'profile'; slug: string } | { kind: 'addresses' } | null

/** Audience tab: pick who it's for (blank / recipe), check the people, or tune an always-on signal. */
export default function AudiencePage({ loop }: { loop: Loop }) {
  // ── Router / store ───────────────────────────────────────────────
  const navigate = useNavigate()
  const setCustomers = useStore((s) => s.setCustomers)
  const setLeavers = useStore((s) => s.setLeavers)
  const removePerson = useStore((s) => s.removePerson)
  const restorePerson = useStore((s) => s.restorePerson)
  const resolveAddresses = useStore((s) => s.resolveAddresses)
  const clearAudience = useStore((s) => s.clearAudience)
  const toast = useStore((s) => s.toast)

  // ── Local state ──────────────────────────────────────────────────
  const [filter, setFilter] = useState<PeopleFilter>('everyone')
  const [panel, setPanel] = useState<Panel>(null)
  const [how, setHow] = useState(false)
  const [all, setAll] = useState(false)

  // ── Derived ──────────────────────────────────────────────────────
  const a = loop.audience
  const editable = loop.status === 'draft' || loop.status === 'paused'
  const people = activePeople(loop)
  const counts = audienceCounts(loop)
  const filterCounts: Record<PeopleFilter, number> = { everyone: counts.everyone, noAddress: counts.noAddress, notOnLinkedIn: counts.notOnLinkedIn, customers: counts.customers }
  const inFilter = people.filter((p) => matchesFilter(p, filter))
  const profile = panel?.kind === 'profile' ? people.find((p) => p.slug === panel.slug) ?? null : null
  const idx = profile ? inFilter.findIndex((p) => p.slug === profile.slug) : -1
  const missing = people.filter((p) => !p.address)
  const gifty = a.pickedBy === 'gifty'
  const hasSteps = flatten(loop.graph.steps).length > 0

  // ── Handlers ─────────────────────────────────────────────────────
  function guard(fn: () => void) {
    if (!editable) toast('Pause the loop to change who’s in it')
    else fn()
  }
  function remove(slug: string) {
    guard(() => {
      const p = people.find((x) => x.slug === slug)
      const next = inFilter[idx + 1] ?? inFilter[idx - 1]
      removePerson(loop.id, slug)
      setPanel(next ? { kind: 'profile', slug: next.slug } : null)
      toast(`${p?.name ?? 'They'} won’t get this loop`, { label: 'Undo', run: () => restorePerson(loop.id, slug) })
    })
  }
  function saveAddresses(lines: Record<string, string>) {
    const n = Object.keys(lines).length
    resolveAddresses(loop.id, lines)
    setPanel(null)
    toast(`${n} ${n === 1 ? 'address' : 'addresses'} saved`)
  }
  function next() {
    navigate(`/loops/${loop.id}/build`)
  }

  // ── Render helpers ───────────────────────────────────────────────
  function renderPrimary() {
    if (a.kind === 'none') return <HeaderPrimary label="Continue to build" disabled hint="Pick who it’s for first" />
    const label = gifty ? 'Review the loop' : hasSteps ? 'Continue to build' : 'Start building'
    return <HeaderPrimary label={label} onClick={next} secondary={!!panel} />
  }

  function renderList() {
    const leavers = a.people.filter((p) => p.left)
    return (
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <AudienceHeading
            title={gifty ? `${counts.everyone} ${a.noun}` : a.title}
            source={gifty ? a.source : `${counts.everyone} people from your list. Gifty checked every name.`}
            linkLabel={gifty ? (how ? 'Hide' : 'How') : 'Change list'}
            linkOpen={how}
            onLink={() => (gifty ? setHow((h) => !h) : guard(() => clearAudience(loop.id)))}
            onAddPeople={() => toast('Adding people one by one isn’t part of this prototype. Change the list instead')}
          />
          {how && <HowFunnel total={counts.everyone} />}
          <PeopleTable
            people={people}
            counts={filterCounts}
            filter={filter}
            onFilter={setFilter}
            selected={profile?.slug}
            onOpenProfile={(slug) => setPanel({ kind: 'profile', slug })}
            onAddAddress={() => guard(() => setPanel({ kind: 'addresses' }))}
            showKnows={how}
            pageSize={all ? 999 : 5}
            onSeeAll={() => setAll((v) => !v)}
          />
        </div>
        <div className="flex w-[360px] shrink-0 flex-col gap-4">
          <ChecksCard
            title={gifty ? 'Before you build' : 'About these people'}
            count={counts.withAddress}
            total={counts.everyone}
            countLabel={gifty ? 'can get every step' : 'have an address'}
            addressHint={gifty ? 'No letter or gift until you add one' : 'Only matters if you send something by post'}
            addressHintTone={gifty ? 'amber' : 'grey'}
            missing={missing}
            customers={a.people.filter((p) => p.customer)}
            customersState={a.customers}
            onCustomers={(s) => guard(() => setCustomers(loop.id, s))}
            onAddAddresses={() => guard(() => setPanel({ kind: 'addresses' }))}
            last={
              a.leavers !== 'none' ? (
                <SingleCheck icon={<LinkedInSlot />} title={a.leavers === 'removed' ? `${leavers.length} who left removed` : `${leavers.length} have left the company`} sub="Gifty checked LinkedIn today">
                  <button data-testid="remove-leavers" onClick={() => guard(() => setLeavers(loop.id, a.leavers === 'removed' ? 'open' : 'removed'))} className="cursor-pointer text-violet-link hover:underline">
                    {a.leavers === 'removed' ? 'Undo' : `Remove ${leavers.length}`}
                  </button>
                </SingleCheck>
              ) : counts.notOnLinkedIn > 0 ? (
                <SingleCheck icon={<LinkedInSlot />} title={`${counts.notOnLinkedIn} aren’t on LinkedIn`} sub="They get an email instead of the LinkedIn step">
                  <span className="text-green-text">Handled</span>
                </SingleCheck>
              ) : undefined
            }
          />
        </div>
      </div>
    )
  }

  function renderPanel() {
    if (panel?.kind === 'addresses')
      return <AddAddressesSheet key="addresses" missing={missing} onClose={() => setPanel(null)} onSave={saveAddresses} onAsk={(p) => toast(`Asked ${p.company}’s account owner on Slack`)} />
    if (profile)
      return (
        <ProfilePanel
          key={profile.slug}
          person={profile}
          backLabel={FILTER_LABEL[filter]}
          position={idx >= 0 ? `${idx + 1} of ${filterCounts[filter]}` : undefined}
          onClose={() => setPanel(null)}
          onAddAddress={() => guard(() => setPanel({ kind: 'addresses' }))}
          onRemove={() => remove(profile.slug)}
          onPrev={idx > 0 ? () => setPanel({ kind: 'profile', slug: inFilter[idx - 1].slug }) : undefined}
          onNext={idx >= 0 && idx < inFilter.length - 1 ? () => setPanel({ kind: 'profile', slug: inFilter[idx + 1].slug }) : undefined}
        />
      )
    return null
  }

  return (
    <Page header={<BuilderHeader loop={loop} tab="audience" right={renderPrimary()} />}>
      <ScrollArea inner="py-8">
        {a.kind === 'none' && <ListPicker loop={loop} />}
        {a.kind === 'signal' && <SignalAudience loop={loop} />}
        {a.kind === 'list' && renderList()}
      </ScrollArea>
      <FloatingPanel open={!!panel && (panel.kind === 'addresses' || !!profile)} onClose={() => setPanel(null)} testId="audience-panel">
        {renderPanel()}
      </FloatingPanel>
    </Page>
  )
}
