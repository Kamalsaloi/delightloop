import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

/** B0a · Start blank: check the people. Variant: ?profile=<slug> (B0b). */
export default function BlankPeople() {
  const navigate = useNavigate()
  const s = useAudienceState()
  const [leaversRemoved, setLeaversRemoved] = useState(false)

  return (
    <div className="min-h-screen">
      <BuilderHeader title="Untitled loop" tab="Audience" mode="blank" right={<HeaderPrimary to="/blank/build/1" label="Start building" secondary={s.sheetOpen} />} />

      <main className="mx-auto flex max-w-[1440px] items-start gap-6 px-12 py-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <AudienceHeading
            title="Q4 VP Sales"
            source="48 people from your HubSpot list. Gifty checked every name."
            linkLabel="Change list"
            onLink={() => navigate('/blank/list')}
          />
          <PeopleTable
            people={s.people}
            counts={s.counts}
            filter={s.filter}
            onFilter={s.setFilter}
            selected={s.profilePerson?.slug}
            onOpenProfile={s.openProfile}
            onAddAddress={s.openSheet}
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
              title="About these people"
              count={41}
              total={48}
              countLabel="have an address"
              addressHint="Only matters if you send something by post"
              addressHintTone="grey"
              customers={s.customers}
              onCustomers={s.setCustomers}
              onAddAddresses={s.openSheet}
              last={
                leaversRemoved ? (
                  <SingleCheck icon={<LinkedInSlot />} title="3 who left removed" sub="Gifty checked LinkedIn today">
                    <button onClick={() => setLeaversRemoved(false)} className="cursor-pointer text-violet-link hover:underline">
                      Undo
                    </button>
                  </SingleCheck>
                ) : (
                  <SingleCheck icon={<LinkedInSlot />} title="3 have left the company" sub="Gifty checked LinkedIn today">
                    <button onClick={() => setLeaversRemoved(true)} className="cursor-pointer text-violet-link hover:underline">
                      Remove 3
                    </button>
                  </SingleCheck>
                )
              }
            />
          )}
        </div>
      </main>

      <AddAddressesSheet open={s.sheetOpen} onClose={s.closeSheet} />
    </div>
  )
}
