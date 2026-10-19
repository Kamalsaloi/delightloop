import type { ChipTone } from '@/components/ui'
import { needsCopy } from '@/canvas/copy'
import { allSteps, flatten, nodeTitle, stepsOfType } from './graph'
import { activePeople } from './sim'
import { graphGiftTotal } from './templates'
import type { Integrations, Loop } from './types'

export type LoopTab = 'audience' | 'build' | 'preview' | 'results'

export function statusLabel(l: Loop): { label: string; tone: ChipTone } {
  const day = Math.max(1, Math.ceil(l.live?.day ?? 0))
  switch (l.status) {
    case 'live':
      return { label: l.kind === 'always-on' ? 'Live · always on' : `Live · Day ${day}`, tone: 'green' }
    case 'paused':
      return { label: `Paused · Day ${day}`, tone: 'amber' }
    case 'finished':
      return { label: 'Finished', tone: 'neutral' }
    default:
      return { label: 'Draft', tone: 'neutral' }
  }
}

export const openReplies = (l: Loop) => l.live?.replies.filter((r) => r.status === 'open').length ?? 0

export function loopTabs(l: Loop): { id: LoopTab; label: string; disabled: boolean; why?: string; badge?: number }[] {
  const noAudience = l.audience.kind === 'none'
  const noSteps = flatten(l.graph.steps).length === 0
  const notLive = l.status === 'draft'
  return [
    { id: 'audience', label: 'Audience', disabled: false },
    { id: 'build', label: 'Build', disabled: noAudience && l.origin !== 'recipe', why: 'Pick who it’s for first' },
    { id: 'preview', label: 'Preview', disabled: noAudience || noSteps, why: noAudience ? 'Pick who it’s for first' : 'Add a step first' },
    { id: 'results', label: 'Results', disabled: notLive, why: 'Results start when the loop launches', badge: openReplies(l) || undefined },
  ]
}

export type AudienceCounts = { everyone: number; noAddress: number; notOnLinkedIn: number; customers: number; withAddress: number; leavers: number }

export function audienceCounts(l: Loop): AudienceCounts {
  const people = activePeople(l)
  return {
    everyone: people.length,
    noAddress: people.filter((p) => !p.address).length,
    notOnLinkedIn: people.filter((p) => p.notOnLinkedIn).length,
    customers: people.filter((p) => p.customer).length,
    withAddress: people.filter((p) => p.address).length,
    leavers: people.filter((p) => p.left).length,
  }
}

export const giftTotal = (l: Loop) => graphGiftTotal(l.graph)
export const needsBudgetApproval = (l: Loop) => giftTotal(l) > l.budget.limit

export type LaunchCheck = { id: string; title: string; sub: string; blocking: boolean; done: boolean }

/** What stands between this draft and launch. Blocking checks keep "Launch loop" disabled. */
export function launchChecks(l: Loop, integrations: Integrations): LaunchCheck[] {
  const out: LaunchCheck[] = []
  const counts = audienceCounts(l)
  const steps = allSteps(l.graph)
  if (l.audience.kind === 'none') out.push({ id: 'audience', title: 'No audience yet', sub: 'Pick who this loop is for', blocking: true, done: false })
  if (!flatten(l.graph.steps).length) out.push({ id: 'steps', title: 'No steps yet', sub: 'Add at least one step on the canvas', blocking: true, done: false })
  const copy = steps.filter(needsCopy)
  if (copy.length)
    out.push({
      id: 'copy',
      title: `${copy.length} ${copy.length === 1 ? 'step needs' : 'steps need'} copy`,
      sub: copy.map(nodeTitle).join(', '),
      blocking: true,
      done: false,
    })
  if (needsBudgetApproval(l)) out.push({ id: 'budget', title: 'budget', sub: '', blocking: l.budget.approval !== 'approved', done: l.budget.approval === 'approved' })
  if (stepsOfType(l.graph, 'linkedin').length) out.push({ id: 'linkedin', title: 'linkedin', sub: '', blocking: integrations.linkedin !== 'connected', done: integrations.linkedin === 'connected' })
  out.push({ id: 'test', title: 'test', sub: '', blocking: false, done: l.testSent })
  if (stepsOfType(l.graph, 'gift').length || stepsOfType(l.graph, 'postcard').length)
    out.push({ id: 'addresses', title: 'addresses', sub: `${counts.noAddress}`, blocking: false, done: counts.noAddress === 0 })
  return out
}

export const isBlocked = (l: Loop, i: Integrations) => launchChecks(l, i).some((c) => c.blocking)
