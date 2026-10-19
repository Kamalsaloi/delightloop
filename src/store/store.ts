import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { listById, LISTS } from '@/data/catalog'
import { DAY, nextMonday } from '@/lib/time'
import { extractEntities, listEntity, type Entity } from './entities'
import { duplicateNode, insertAt, locate, removeNode, updateNode, uid } from './graph'
import { seedLoops, seedSuggestions, START_CLOCK, SUGGESTION_LIST } from './seed'
import { advance, startLive, summarize } from './sim'
import { blankLoop, draftLoop, fitGiftsToAudience, graphGiftTotal, listAudience, recipeLoop } from './templates'
import type {
  Audience,
  CheckState,
  Fix,
  FlowNode,
  GoalData,
  Graph,
  Integrations,
  Loop,
  Note,
  Rule,
  SignalAudience,
  Slot,
  StepNode,
  Suggestion,
  Toast,
} from './types'

/** Seconds of real time per loop-day at 1× speed. */
export const SECONDS_PER_DAY = 25

type Pending = { id: string; dueAt: number; kind: 'linkedin' | 'budget'; loopId?: string }

export type State = {
  version: number
  clock: number
  speed: number
  loops: Loop[]
  suggestions: Suggestion[]
  integrations: Integrations
  pending: Pending[]
  toasts: Toast[]
  newLoopOpen: boolean
}

type Actions = {
  reset: () => void
  setSpeed: (n: number) => void
  toast: (text: string, action?: Toast['action']) => void
  dismissToast: (id: number) => void
  setNewLoopOpen: (open: boolean) => void

  draftFromBrief: (text: string, entities: Entity[]) => string
  draftFromSuggestion: (id: string) => string
  createFromRecipe: (recipeId: string) => string
  createBlank: () => string
  setReveal: (id: string, n: number | null) => void
  renameLoop: (id: string, name: string) => void

  chooseList: (id: string, listId: string) => void
  chooseSignal: (id: string, signal: Partial<SignalAudience>) => void
  chooseFound: (id: string, count: number) => void
  clearAudience: (id: string) => void
  setSignal: (id: string, patch: Partial<SignalAudience>) => void
  setCustomers: (id: string, s: CheckState) => void
  setLeavers: (id: string, s: CheckState) => void
  removePerson: (id: string, slug: string) => void
  restorePerson: (id: string, slug: string) => void
  resolveAddresses: (id: string, lines: Record<string, string>) => void

  insertNode: (id: string, slot: Slot, node: FlowNode) => void
  updateStep: <T extends StepNode['type']>(id: string, nodeId: string, patch: Partial<Extract<StepNode, { type: T }>['data']>) => void
  updateSplit: (id: string, nodeId: string, patch: Partial<Extract<FlowNode, { kind: 'split' }>['data']>) => void
  removeNode: (id: string, nodeId: string) => void
  duplicateNode: (id: string, nodeId: string) => string | null
  setGoal: (id: string, goal: GoalData | null) => void
  updateGoal: (id: string, patch: Partial<GoalData>) => void

  setRuleOn: (id: string, ruleId: string, on: boolean) => void
  setRuleEmailsOnly: (id: string, ruleId: string) => void
  addRule: (id: string, rule: Omit<Rule, 'id' | 'on'>) => void

  nudgeBudget: (id: string) => void
  askLinkedIn: () => void
  /** Simulated replies to approval requests; `all` = the dev shortcut (don't wait). */
  resolvePending: (all?: boolean) => void
  sendTest: (id: string) => void

  launch: (id: string, startAt: number) => void
  pause: (id: string) => void
  resume: (id: string) => void
  discardChanges: (id: string) => Graph | null
  restoreGraph: (id: string, g: Graph) => void

  sendReply: (id: string, replyId: string, draft: string) => void
  toggleOverride: (id: string, replyId: string) => void
  markRepliesSeen: (id: string) => void
  fixDelivery: (id: string, fix: Fix | null) => void
  toggleSwap: (id: string) => void
  draftVisitNote: (id: string, visitId: string) => void

  tick: (realMs: number) => void
  skipDay: () => void
  endNow: (id: string) => void
}

export type Store = State & Actions

const STATE_VERSION = 3

function initial(): State {
  return {
    version: STATE_VERSION,
    clock: START_CLOCK,
    speed: 1,
    loops: seedLoops(START_CLOCK),
    suggestions: seedSuggestions(),
    integrations: { linkedin: 'missing' },
    pending: [],
    toasts: [],
    newLoopOpen: false,
  }
}

let pendingWrite: { k: string; v: string } | null = null
let writeTimer = 0
function flushWrite() {
  writeTimer = 0
  if (!pendingWrite) return
  const { k, v } = pendingWrite
  pendingWrite = null
  try {
    window.localStorage.setItem(k, v)
  } catch {
    /* storage full or blocked: keep running in memory */
  }
}
if (typeof window !== 'undefined') window.addEventListener('beforeunload', flushWrite)

// localStorage can throw (private mode, blocked storage); the app must still work without it.
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return window.localStorage.getItem(k)
    } catch {
      return null
    }
  },
  // Debounced: typing animations and the sim clock update the store many times a second.
  setItem: (k, v) => {
    pendingWrite = { k, v }
    if (writeTimer) return
    writeTimer = window.setTimeout(flushWrite, 400)
  },
  removeItem: (k) => {
    try {
      window.localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

let toastSeq = 0

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      /** Update one loop. */
      const patch = (id: string, fn: (l: Loop) => Loop) =>
        set((s) => ({ loops: s.loops.map((l) => (l.id === id ? { ...fn(l), updatedAt: s.clock } : l)) }))
      const graphEdit = (id: string, fn: (g: Graph) => Graph) => patch(id, (l) => ({ ...l, graph: fn(l.graph) }))
      const audienceEdit = (id: string, fn: (a: Audience) => Audience) => patch(id, (l) => ({ ...l, audience: fn(l.audience) }))
      const addLoop = (loop: Loop) => {
        set((s) => ({ loops: [loop, ...s.loops] }))
        return loop.id
      }
      const notify = (notes: Note[]) => notes.slice(-3).forEach((n) => get().toast(n.text, n.to ? { label: n.label ?? 'Open', to: n.to } : undefined))

      return {
        ...initial(),

        reset: () => {
          set({ ...initial() })
          get().toast('Demo reset')
        },
        setSpeed: (speed) => set({ speed }),
        toast: (text, action) => {
          const t: Toast = { id: ++toastSeq, text, action }
          set((s) => ({ toasts: [...s.toasts.slice(-2), t] }))
          window.setTimeout(() => get().dismissToast(t.id), action ? 5000 : 3000)
        },
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        setNewLoopOpen: (newLoopOpen) => set({ newLoopOpen }),

        // ── Creating loops ──────────────────────────────────────────────
        draftFromBrief: (text, entities) => addLoop(draftLoop({ text, entities, now: get().clock })),
        draftFromSuggestion: (sid) => {
          const sug = get().suggestions.find((x) => x.id === sid)
          if (!sug) return ''
          if (sug.usedBy && get().loops.some((l) => l.id === sug.usedBy)) return sug.usedBy
          const list = listById(SUGGESTION_LIST[sid])
          const entities = extractEntities(sug.brief).filter((e) => e.kind !== 'list')
          const id = addLoop({ ...draftLoop({ text: sug.brief, entities: list ? [listEntity(list), ...entities] : entities, now: get().clock }), reveal: null })
          set((s) => ({ suggestions: s.suggestions.map((x) => (x.id === sid ? { ...x, usedBy: id } : x)) }))
          return id
        },
        createFromRecipe: (rid) => addLoop(recipeLoop(rid, get().clock)),
        createBlank: () => addLoop(blankLoop(get().clock)),
        setReveal: (id, n) => patch(id, (l) => ({ ...l, reveal: n })),
        renameLoop: (id, name) => patch(id, (l) => ({ ...l, name: name.trim() || l.name })),

        // ── Audience ────────────────────────────────────────────────────
        chooseList: (id, listId) => {
          const list = listById(listId) ?? LISTS[0]
          patch(id, (l) => {
            const audience = listAudience(list, 'you')
            const name = l.name === 'Untitled loop' ? `Untitled loop` : l.origin === 'recipe' && !l.name.includes('·') ? `${l.name} · ${list.short}` : l.name
            const graph = fitGiftsToAudience(l.graph, audience.people.length, l.moment?.id)
            return { ...l, name, audience, graph, budget: { ...l.budget, approval: graphGiftTotal(graph) > l.budget.limit ? 'waiting' : 'none' } }
          })
        },
        chooseSignal: (id, signal) =>
          patch(id, (l) => ({
            ...l,
            kind: 'always-on',
            audience: {
              ...listAudience(LISTS[0], 'you'),
              kind: 'signal',
              title: 'New VP Sales at target accounts',
              source: 'An always-on audience. People join when the signal fires, not from a fixed list.',
              noun: 'people',
              pillSource: 'join when they start a new role',
              signal: {
                signal: 'starts a new role',
                title: 'VP or Head of Sales',
                accounts: '212 target accounts',
                skipDeals: true,
                wait: 14,
                perWeek: 5,
                monthlyBudget: '1,500',
                noRepeat: true,
                matches: ['tom', 'ethan', 'sofia'],
                ...signal,
              },
            },
          })),
        chooseFound: (id, count) => {
          get().chooseList(id, 'webinar')
          audienceEdit(id, (a) => {
            const people = a.people.slice(0, count)
            return { ...a, people, title: 'People Gifty found', source: `${people.length} people Gifty found, ${Math.round(people.length * 0.34)} already in HubSpot.`, pillSource: 'found by Gifty' }
          })
        },
        clearAudience: (id) => patch(id, (l) => ({ ...l, kind: 'campaign', audience: { ...l.audience, kind: 'none' } })),
        setSignal: (id, p) => audienceEdit(id, (a) => (a.signal ? { ...a, signal: { ...a.signal, ...p } } : a)),
        setCustomers: (id, s) =>
          audienceEdit(id, (a) => {
            const customers = a.people.filter((p) => p.customer).map((p) => p.slug)
            const removed = s === 'removed' ? [...new Set([...a.removed, ...customers])] : a.removed.filter((x) => !customers.includes(x))
            return { ...a, customers: s, removed }
          }),
        setLeavers: (id, s) =>
          audienceEdit(id, (a) => {
            const left = a.people.filter((p) => p.left).map((p) => p.slug)
            const removed = s === 'removed' ? [...new Set([...a.removed, ...left])] : a.removed.filter((x) => !left.includes(x))
            return { ...a, leavers: s, removed }
          }),
        removePerson: (id, slug) => audienceEdit(id, (a) => ({ ...a, removed: [...new Set([...a.removed, slug])] })),
        restorePerson: (id, slug) => audienceEdit(id, (a) => ({ ...a, removed: a.removed.filter((x) => x !== slug) })),
        resolveAddresses: (id, lines) =>
          audienceEdit(id, (a) => ({
            ...a,
            people: a.people.map((p) =>
              lines[p.slug] ? { ...p, noAddress: false, address: { line: lines[p.slug], note: 'Added by you' }, addressHint: undefined } : p,
            ),
          })),

        // ── Graph ───────────────────────────────────────────────────────
        insertNode: (id, slot, node) => graphEdit(id, (g) => insertAt(g, slot, node)),
        updateStep: (id, nodeId, p) =>
          graphEdit(id, (g) => updateNode(g, nodeId, (n) => (n.kind === 'step' ? ({ ...n, data: { ...n.data, ...p } } as FlowNode) : n))),
        updateSplit: (id, nodeId, p) => graphEdit(id, (g) => updateNode(g, nodeId, (n) => (n.kind === 'split' ? { ...n, data: { ...n.data, ...p } } : n))),
        removeNode: (id, nodeId) => {
          const loop = get().loops.find((l) => l.id === id)
          if (!loop) return
          const before = loop.graph
          const at = locate(before.steps, nodeId)
          graphEdit(id, (g) => removeNode(g, nodeId))
          const title = at?.node.kind === 'split' ? 'Check removed' : 'Step removed'
          get().toast(title, { label: 'Undo', run: () => get().restoreGraph(id, before) })
        },
        duplicateNode: (id, nodeId) => {
          const loop = get().loops.find((l) => l.id === id)
          if (!loop) return null
          const { graph, newId } = duplicateNode(loop.graph, nodeId)
          graphEdit(id, () => graph)
          return newId
        },
        setGoal: (id, goal) => {
          const before = get().loops.find((l) => l.id === id)?.graph
          graphEdit(id, (g) => ({ ...g, goal }))
          if (!goal && before) get().toast('Goal removed', { label: 'Undo', run: () => get().restoreGraph(id, before) })
        },
        updateGoal: (id, p) => graphEdit(id, (g) => (g.goal ? { ...g, goal: { ...g.goal, ...p } } : g)),

        // ── Rules ───────────────────────────────────────────────────────
        setRuleOn: (id, ruleId, on) => patch(id, (l) => ({ ...l, rules: l.rules.map((r) => (r.id === ruleId ? { ...r, on, emailsOnly: on ? r.emailsOnly : false } : r)) })),
        setRuleEmailsOnly: (id, ruleId) =>
          patch(id, (l) => ({
            ...l,
            rules: l.rules.map((r) =>
              r.id === ruleId ? { ...r, on: true, emailsOnly: true, then: [{ label: 'Stop the emails' }, { label: 'Letter and gift still ship' }], summary: 'Stop emails, still ship' } : r,
            ),
          })),
        addRule: (id, rule) => patch(id, (l) => ({ ...l, rules: [...l.rules, { ...rule, id: uid('r'), on: true }] })),

        // ── Launch checks ───────────────────────────────────────────────
        nudgeBudget: (id) => {
          patch(id, (l) => ({ ...l, budget: { ...l.budget, approval: 'asked' } }))
          set((s) => ({ pending: [...s.pending, { id: uid('p'), kind: 'budget', loopId: id, dueAt: Date.now() + 5000 }] }))
          get().toast('Nudged Arjun in Slack')
        },
        askLinkedIn: () => {
          set((s) => ({ integrations: { ...s.integrations, linkedin: 'asked' }, pending: [...s.pending, { id: uid('p'), kind: 'linkedin', dueAt: Date.now() + 4000 }] }))
          get().toast('Asked Sam in Slack to connect LinkedIn')
        },
        resolvePending: (all = true) => {
          const now = Date.now()
          const due = get().pending.filter((p) => all || p.dueAt <= now)
          if (!due.length) {
            if (all) get().toast('Nothing is waiting on anyone')
            return
          }
          set((s) => ({ pending: s.pending.filter((p) => !due.includes(p)) }))
          for (const p of due) {
            if (p.kind === 'linkedin') {
              set((s) => ({ integrations: { ...s.integrations, linkedin: 'connected' } }))
              get().toast('Sam connected his LinkedIn')
            } else if (p.loopId) {
              const l = get().loops.find((x) => x.id === p.loopId)
              patch(p.loopId, (x) => ({ ...x, budget: { ...x.budget, approval: 'approved' } }))
              get().toast(`Arjun approved the ${l ? `$${graphGiftTotal(l.graph).toLocaleString('en-US')} ` : ''}budget`)
            }
          }
        },
        sendTest: (id) => {
          patch(id, (l) => ({ ...l, testSent: true }))
          get().toast('Test sent to priya@delightloop.co')
        },

        // ── Running a loop ──────────────────────────────────────────────
        launch: (id, startAt) => {
          const s = get()
          // A future start fast-forwards the demo clock so the loop starts now.
          const clock = Math.max(s.clock, startAt)
          set({ clock })
          patch(id, (l) => ({ ...l, status: 'live', startAt: clock, live: startLive({ ...l, startAt: clock }) }))
          const suggestion = s.suggestions.find((x) => x.usedBy === id)
          if (suggestion) set((st) => ({ suggestions: st.suggestions.map((x) => (x.after === suggestion.id ? { ...x, after: undefined } : x)) }))
          s.tick(0)
        },
        pause: (id) => {
          patch(id, (l) => ({ ...l, status: 'paused', pausedGraph: structuredClone(l.graph), pausedAt: get().clock }))
          get().toast('Loop paused. Nothing new goes out until you resume')
        },
        resume: (id) => {
          patch(id, (l) => ({ ...l, status: 'live', pausedGraph: undefined, pausedAt: undefined }))
          get().toast('Loop resumed')
        },
        discardChanges: (id) => {
          const loop = get().loops.find((l) => l.id === id)
          if (!loop?.pausedGraph) return null
          const current = loop.graph
          patch(id, (l) => ({ ...l, graph: structuredClone(l.pausedGraph!) }))
          return current
        },
        restoreGraph: (id, g) => graphEdit(id, () => g),

        // ── Results ─────────────────────────────────────────────────────
        sendReply: (id, replyId, draft) => {
          patch(id, (l) => {
            if (!l.live) return l
            return {
              ...l,
              live: { ...l.live, replies: l.live.replies.map((r) => (r.id === replyId ? { ...r, draft, status: 'sent', fresh: false, sentDay: l.live!.day } : r)) },
            }
          })
          const r = get().loops.find((l) => l.id === id)?.live?.replies.find((x) => x.id === replyId)
          get().toast(`Sent to ${r?.first ?? 'them'} from Sam’s inbox`)
        },
        toggleOverride: (id, replyId) =>
          patch(id, (l) => (l.live ? { ...l, live: { ...l.live, replies: l.live.replies.map((r) => (r.id === replyId ? { ...r, overridden: !r.overridden } : r)) } } : l)),
        markRepliesSeen: (id) =>
          patch(id, (l) => (l.live && l.live.replies.some((r) => r.fresh) ? { ...l, live: { ...l.live, replies: l.live.replies.map((r) => ({ ...r, fresh: false })) } } : l)),
        fixDelivery: (id, fix) => {
          patch(id, (l) => (l.live ? { ...l, live: { ...l.live, delivery: { ...l.live.delivery, issue: fix ?? 'open' } } } : l))
          if (fix) get().toast('Delivery sorted. The gift step is all handled')
        },
        toggleSwap: (id) => patch(id, (l) => (l.live ? { ...l, live: { ...l.live, delivery: { ...l.live.delivery, swapUndone: !l.live.delivery.swapUndone } } } : l)),
        draftVisitNote: (id, visitId) => {
          const loop = get().loops.find((l) => l.id === id)
          const v = loop?.live?.visits.find((x) => x.id === visitId)
          if (!loop?.live || !v) return
          const first = v.name.split(' ')[0]
          const reply = {
            id: `${id}-note-${v.slug}`,
            slug: v.slug,
            name: v.name,
            first,
            face: v.face,
            initials: v.initials,
            role: `${v.meta.split(' · ')[0]} · opened their page`,
            company: v.meta.split(' · ')[0],
            at: get().clock,
            preview: 'Gifty drafted a note after the page visit',
            quote: `${first} scanned the postcard and opened the page made for them.`,
            intent: { label: 'Note from Sam', tone: 'violet' as const },
            draft: `Hi ${first}, saw the postcard made it. Happy to walk you through what we showed on the page, here’s my calendar.`,
            chip: { icon: 'calendar' as const, label: 'Meet Sam · 30 min' },
            stopped: { title: `${first} is still in the loop`, sub: 'The gift still goes out as planned.', action: 'Hold the gift', done: 'Gift held until Sam hears back.' },
            overridden: false,
            status: 'open' as const,
            fresh: true,
            booksAfter: 0.6,
          }
          patch(id, (l) => (l.live && !l.live.replies.some((r) => r.id === reply.id) ? { ...l, live: { ...l.live, replies: [reply, ...l.live.replies] } } : l))
          get().toast(`Drafted a note to ${first}. It’s in Replies`)
        },

        // ── Clock ───────────────────────────────────────────────────────
        tick: (realMs) => {
          const s = get()
          // The clock only runs while a loop you launched is live.
          if (!s.loops.some((l) => l.status === 'live' && l.origin !== 'seed')) return
          const dtDays = (realMs / 1000 / SECONDS_PER_DAY) * s.speed
          const clock = s.clock + dtDays * DAY
          const notes: Note[] = []
          const loops = s.loops.map((l) => {
            const r = advance(l, dtDays, clock)
            notes.push(...r.notes)
            return r.loop
          })
          set({ clock, loops })
          notify(notes)
        },
        skipDay: () => {
          const s = get()
          if (!s.loops.some((l) => l.status === 'live' && l.origin !== 'seed')) {
            s.toast('Launch a loop first. The clock runs while one is live')
            return
          }
          // One loop-day in small steps so every event fires in order.
          for (let i = 0; i < 8; i++) get().tick(((SECONDS_PER_DAY * 1000) / 8) / get().speed)
        },
        endNow: (id) => {
          const l = get().loops.find((x) => x.id === id)
          if (!l?.live || l.status !== 'live') return
          const left = l.live.endDay - l.live.day + 0.01
          const steps = Math.ceil(left * 4)
          for (let i = 0; i < steps; i++) {
            const cur = get().loops.find((x) => x.id === id)
            if (!cur || cur.status !== 'live') break
            get().tick(((SECONDS_PER_DAY * 1000) / 4) / get().speed)
          }
          const after = get().loops.find((x) => x.id === id)
          if (after?.status === 'live' && after.live) patch(id, (x) => ({ ...x, status: 'finished', live: { ...x.live!, summary: summarize(x, x.live!) } }))
        },
      }
    },
    {
      name: 'delightloop-demo',
      version: STATE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        version: s.version,
        clock: s.clock,
        speed: s.speed,
        loops: s.loops,
        suggestions: s.suggestions,
        integrations: s.integrations,
        pending: s.pending,
      }),
      // Older shapes are simply replaced with fresh seed data.
      migrate: () => initial() as unknown as Store,
    },
  ),
)

// ── Selectors ───────────────────────────────────────────────────────────────

export const useLoop = (id: string | undefined) => useStore((s) => s.loops.find((l) => l.id === id))
export const nextMondayFrom = (clock: number) => nextMonday(clock)
export type { Entity }
