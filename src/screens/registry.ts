import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type ScreenEntry = {
  path: string // route pattern
  href?: string // link used in the index if it differs (query-string variants)
  code: string // Paper artboard number
  name: string
  artboard: string // Paper node id
  group: 'Path A' | 'Live' | 'Paused' | 'Path B' | 'Variants'
  Component?: LazyExoticComponent<ComponentType>
}

const s = (load: () => Promise<{ default: ComponentType }>) => lazy(load)

const Home = s(() => import('./home/Home'))
const NewLoop = s(() => import('./home/NewLoop'))
const Audience = s(() => import('./audience/Audience'))
const AlwaysOnAudience = s(() => import('./audience/AlwaysOnAudience'))
const ReviewGift = s(() => import('./build/ReviewGift'))
const ReviewEmail = s(() => import('./build/ReviewEmail'))
const Preview = s(() => import('./launch/Preview'))
const ReviewLaunch = s(() => import('./launch/ReviewLaunch'))
const Results = s(() => import('./live/Results'))
const LiveBuild = s(() => import('./live/LiveBuild'))
const PausedBuild = s(() => import('./live/PausedBuild'))
const ReviewChanges = s(() => import('./live/ReviewChanges'))
const BlankList = s(() => import('./blank/BlankList'))
const BlankPeople = s(() => import('./blank/BlankPeople'))
const BlankBuild = s(() => import('./blank/BlankBuild'))
const LoopRules = s(() => import('./blank/LoopRules'))

export const SCREENS: ScreenEntry[] = [
  // Path A — Gifty drafts the loop
  { group: 'Path A', code: '01', name: 'Home, with what Gifty spotted', artboard: '86E-0', path: '/home', Component: Home },
  { group: 'Path A', code: '02', name: 'Start a new loop (describe it)', artboard: '14B-0', path: '/new', Component: NewLoop },
  { group: 'Path A', code: '03', name: 'Audience check (Gifty drafted)', artboard: '1AA-0', path: '/loop/audience', Component: Audience },
  { group: 'Path A', code: '04', name: 'Review the draft, gift step open', artboard: 'LS-0', path: '/loop/build/gift', Component: ReviewGift },
  { group: 'Path A', code: '05', name: 'Review the draft, email step open', artboard: '1FN-0', path: '/loop/build/email', Component: ReviewEmail },
  { group: 'Path A', code: '06', name: 'Preview, one person end to end', artboard: '72Z-0', path: '/loop/preview', Component: Preview },
  { group: 'Path A', code: '07', name: 'Review & launch', artboard: '1ZR-0', path: '/loop/launch', Component: ReviewLaunch },

  // Live
  { group: 'Live', code: '09', name: 'Live, Results with replies', artboard: '6R0-0', path: '/live/results', Component: Results },
  { group: 'Live', code: '12', name: 'Home, Diwali loop running', artboard: 'CUX-0', path: '', href: '/home?state=live' },
  { group: 'Live', code: '13', name: 'Loop finished, what worked', artboard: 'D3Y-0', path: '', href: '/live/results?state=finished' },
  { group: 'Live', code: '08', name: 'Live, Build tab with counts', artboard: '2KW-0', path: '/live/build', Component: LiveBuild },

  // Paused
  { group: 'Paused', code: '10', name: 'Paused, editing a live loop', artboard: '7LP-0', path: '/paused/build', Component: PausedBuild },
  { group: 'Paused', code: '11', name: 'Review changes before resuming', artboard: '7Y5-0', path: '/paused/review', Component: ReviewChanges },

  // Path B — start blank
  { group: 'Path B', code: 'B0', name: 'Start blank: pick who it’s for', artboard: '9HR-0', path: '/blank/list', Component: BlankList },
  { group: 'Path B', code: 'B0a', name: 'Start blank: check the people', artboard: 'A4K-0', path: '/blank/people', Component: BlankPeople },
  { group: 'Path B', code: 'B1', name: 'First step, pick from canvas', artboard: '3V8-0', path: '/blank/build/:step', href: '/blank/build/1', Component: BlankBuild },
  { group: 'Path B', code: 'B2', name: 'Add a check after the email', artboard: '49X-0', path: '', href: '/blank/build/2' },
  { group: 'Path B', code: 'B3', name: 'People who open', artboard: '3Q6-0', path: '', href: '/blank/build/3' },
  { group: 'Path B', code: 'B4', name: 'People who don’t open', artboard: '3KK-0', path: '', href: '/blank/build/4' },
  { group: 'Path B', code: 'B5', name: 'Something in the mail', artboard: '3E8-0', path: '', href: '/blank/build/5' },
  { group: 'Path B', code: 'B6', name: 'The gift', artboard: '36R-0', path: '', href: '/blank/build/6' },
  { group: 'Path B', code: 'B7', name: 'The goal', artboard: '2X7-0', path: '', href: '/blank/build/7' },
  { group: 'Path B', code: 'B8', name: 'Loop rules', artboard: '4G8-0', path: '/blank/rules', Component: LoopRules },

  // Variants — states of the parent screen, linkable via query string
  { group: 'Variants', code: '01a', name: 'Home without suggestions', artboard: '102-0', path: '', href: '/home?suggestions=none' },
  { group: 'Variants', code: '02c', name: 'Typing @ to pull in a list', artboard: '9AA-0', path: '', href: '/new?mention=1' },
  { group: 'Variants', code: '03a', name: 'Always-on audience, a rule not a list', artboard: '8QU-0', path: '/loop/audience/always-on', Component: AlwaysOnAudience },
  { group: 'Variants', code: '03c', name: '“How” opened, Gifty’s funnel', artboard: '9XE-0', path: '', href: '/loop/audience?how=1' },
  { group: 'Variants', code: '03d', name: 'Behavioural profile open', artboard: 'B94-0', path: '', href: '/loop/audience?profile=kenji' },
  { group: 'Variants', code: '03e', name: 'Add the missing addresses', artboard: 'BRK-0', path: '', href: '/loop/audience?sheet=addresses' },
  { group: 'Variants', code: '04a', name: 'Swap one person’s gift', artboard: '1Q6-0', path: '', href: '/loop/build/gift?swap=1' },
  { group: 'Variants', code: '04b', name: 'Gift panel states', artboard: '23M-0', path: '', href: '/loop/build/gift?panel=addresses' },
  { group: 'Variants', code: 'B0b', name: 'Behavioural profile open (start blank)', artboard: 'BDQ-0', path: '', href: '/blank/people?profile=kenji' },
  { group: 'Variants', code: 'B0c', name: 'Start blank: “When something happens” tab', artboard: 'BXY-0', path: '', href: '/blank/list?tab=trigger' },
  { group: 'Variants', code: 'B0d', name: 'Start blank: “Ask Gifty to find them” tab', artboard: 'C2M-0', path: '', href: '/blank/list?tab=gifty' },
  { group: 'Variants', code: '05a', name: 'Loop rules Gifty drafted', artboard: 'DGL-0', path: '', href: '/loop/build/email?panel=rules' },
  { group: 'Variants', code: '07a', name: 'Launch blocked: LinkedIn + budget approval', artboard: 'CCR-0', path: '', href: '/loop/launch?blocked=1' },
  { group: 'Variants', code: '08a', name: 'A delivery fails, Gifty handles most', artboard: 'CHQ-0', path: '', href: '/live/build?step=gift' },
  { group: 'Variants', code: '09a', name: 'Surfaces visits in Results (Page visits tab)', artboard: 'CNL-0', path: '', href: '/live/results?tab=visits' },
  { group: 'Variants', code: 'B1a', name: 'Configure: Intro email, written by hand', artboard: 'DWY-0', path: '', href: '/blank/build/2?step=intro' },
  { group: 'Variants', code: 'B2a', name: 'Configure: Wait and check', artboard: 'DRH-0', path: '', href: '/blank/build/3?step=check' },
  { group: 'Variants', code: 'B3a', name: 'Configure: LinkedIn step', artboard: 'E6X-0', path: '', href: '/blank/build/4?step=linkedin' },
  { group: 'Variants', code: 'B4a', name: 'Configure: Bump email', artboard: 'ECJ-0', path: '', href: '/blank/build/5?step=bump' },
  { group: 'Variants', code: 'B5a', name: 'Configure: Postcard', artboard: 'EIV-0', path: '', href: '/blank/build/6?step=postcard' },
  { group: 'Variants', code: 'B6a', name: 'Configure: The gift', artboard: 'EPY-0', path: '', href: '/blank/build/7?step=gift' },
  { group: 'Variants', code: 'B7a', name: 'Configure: The goal', artboard: 'EXP-0', path: '', href: '/blank/rules?step=goal' },
  { group: 'Variants', code: 'B8a', name: 'Rules panel states', artboard: '5B1-0', path: '', href: '/blank/rules?panel=trigger' },
]
