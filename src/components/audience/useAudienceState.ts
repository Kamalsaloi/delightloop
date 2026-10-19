import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PEOPLE, personBySlug } from '@/data/people'
import { matchesFilter, type PeopleFilter } from './PeopleTable'
import type { CustomersState } from './ChecksCard'

const BASE_COUNTS: Record<PeopleFilter, number> = { everyone: 48, noAddress: 7, notOnLinkedIn: 6, customers: 2 }

/**
 * Shared state for the audience check screens (03, B0a).
 * URL holds the linkable bits (?profile=, ?sheet=addresses, ?how=1); filter + resolutions are local.
 */
export function useAudienceState() {
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState<PeopleFilter>('everyone')
  const [customers, setCustomers] = useState<CustomersState>('open')

  const removedCustomers = customers === 'removed'
  const people = removedCustomers ? PEOPLE.filter((p) => !p.customer) : PEOPLE
  const counts: Record<PeopleFilter, number> = removedCustomers
    ? { everyone: BASE_COUNTS.everyone - 2, noAddress: BASE_COUNTS.noAddress - 1, notOnLinkedIn: BASE_COUNTS.notOnLinkedIn, customers: 0 }
    : BASE_COUNTS

  const profileSlug = params.get('profile')
  const profilePerson = profileSlug ? personBySlug(profileSlug) ?? null : null
  const inFilter = people.filter((p) => matchesFilter(p, filter))
  const idx = profilePerson ? inFilter.findIndex((p) => p.slug === profilePerson.slug) : -1
  const profilePosition = idx >= 0 ? `${idx + 1} of ${counts[filter]}` : undefined

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value === null) next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  return {
    filter,
    setFilter,
    customers,
    setCustomers,
    people,
    counts,
    profilePerson,
    profilePosition,
    openProfile: (slug: string) => setParam('profile', slug),
    closeProfile: () => setParam('profile', null),
    sheetOpen: params.get('sheet') === 'addresses',
    openSheet: () => setParam('sheet', 'addresses'),
    closeSheet: () => setParam('sheet', null),
    how: params.get('how') === '1',
    toggleHow: () => setParam('how', params.get('how') === '1' ? null : '1'),
  }
}
