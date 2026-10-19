import { BuilderHeader } from '@/components/shell'
import {
  AddAddressesSheet,
  AudienceHeading,
  ChecksCard,
  FILTER_LABEL,
  HeaderPrimary,
  LinkedInSlot,
  PeopleTable,
  ProfilePanel,
  SingleCheck,
  useAudienceState,
} from '@/components/audience'
import { HowFunnel } from './HowFunnel'

/** 03 · Audience check (Gifty drafted). Variants: ?how=1 (03c), ?profile=<slug> (03d), ?sheet=addresses (03e). */
export default function Audience() {
  const s = useAudienceState()

  return (
    <div className="min-h-screen">
      <BuilderHeader
        tab="Audience"
        mode="draft"
        right={<HeaderPrimary to="/loop/build/gift" label={s.how ? 'Continue to build' : 'Review the loop'} secondary={s.sheetOpen} />}
      />

      <main className="mx-auto flex max-w-[1440px] items-start gap-6 px-12 py-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <AudienceHeading
            title="48 VP Sales"
            source="Gifty picked 48 of 212 people at your Q4 accounts"
            linkLabel={s.how ? 'Hide' : 'How'}
            linkOpen={s.how}
            onLink={s.toggleHow}
          />
          {s.how && <HowFunnel />}
          <PeopleTable
            people={s.people}
            counts={s.counts}
            filter={s.filter}
            onFilter={s.setFilter}
            selected={s.profilePerson?.slug}
            onOpenProfile={s.openProfile}
            onAddAddress={s.openSheet}
            showKnows={s.how}
          />
        </div>

        <div className="flex w-[360px] shrink-0 flex-col gap-4">
          {s.profilePerson ? (
            <ProfilePanel
              key={s.profilePerson.slug}
              person={s.profilePerson}
              backLabel={FILTER_LABEL[s.filter]}
              position={s.profilePosition}
              onClose={s.closeProfile}
              onAddAddress={s.openSheet}
            />
          ) : (
            <ChecksCard
              title="Before you build"
              count={41}
              total={48}
              countLabel="can get every step"
              addressHint="No letter or gift until you add one"
              customers={s.customers}
              onCustomers={s.setCustomers}
              onAddAddresses={s.openSheet}
              last={
                <SingleCheck
                  icon={<LinkedInSlot />}
                  title="6 aren’t on LinkedIn"
                  sub={s.how ? 'They get a Day 2 email instead' : 'They get an email instead of the LinkedIn step'}
                >
                  <span className="text-green-text">Handled</span>
                </SingleCheck>
              }
            />
          )}
        </div>
      </main>

      <AddAddressesSheet open={s.sheetOpen} onClose={s.closeSheet} />
    </div>
  )
}
