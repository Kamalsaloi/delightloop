import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Canvas } from '@/canvas/Canvas'
import { needsCopy } from '@/canvas/copy'
import { FloatingPanel } from '@/components/panels/FloatingPanel'
import { BuilderHeader, NowLabel, Page } from '@/components/shell'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'
import { DAY, fmtDayTime } from '@/lib/time'
import { allSteps, diffGraphs, flatten, locate, nodeCount, nodeDays, partialGraph } from '@/store/graph'
import { useStore } from '@/store/store'
import { copyCtx, defaultGoal, giftyBump, giftyEmail, giftyGiftNote, giftyLinkedIn, giftyPostcard } from '@/store/templates'
import type { Graph, Loop } from '@/store/types'
import { DeliveryPanel } from './DeliveryPanel'
import { GiftPanel } from './GiftPanel'
import { GoalPanel } from './GoalPanel'
import { BumpPanel, CheckPanel, EmailPanel, LinkedInPanel, PostcardPanel, TaskPanel, WaitPanel } from './inspectors'
import { PausedCard, PlayGlyph, ResumeModal } from './Paused'
import { RulesButton, RulesPanel } from './rules/RulesPanel'

const BTN = 'flex h-10 shrink-0 cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-[10px] px-4 text-[13px] leading-4 transition-colors disabled:cursor-not-allowed disabled:opacity-50'
const PRIMARY = cn(BTN, 'bg-violet font-semibold text-white shadow-primary hover:bg-[#5A4EF0]')
const WHITE = cn(BTN, 'bg-white font-medium text-ink shadow-[inset_0_0_0_1px_#E4E4E1,0_1px_2px_#1112160D] hover:bg-fill-hover')

/** Build tab: the canvas for drafts, live loops (read-only with counts) and paused loops (editable). */
export default function BuildPage({ loop }: { loop: Loop }) {
  // ── Router / store ───────────────────────────────────────────────
  const navigate = useNavigate()
  const location = useLocation()
  const clock = useStore((s) => s.clock)
  const toast = useStore((s) => s.toast)
  const setReveal = useStore((s) => s.setReveal)
  const sendTest = useStore((s) => s.sendTest)
  const pause = useStore((s) => s.pause)
  const resume = useStore((s) => s.resume)
  const discardChanges = useStore((s) => s.discardChanges)
  const restoreGraph = useStore((s) => s.restoreGraph)
  const updateStep = useStore((s) => s.updateStep)
  const setGoal = useStore((s) => s.setGoal)

  // ── Local state ──────────────────────────────────────────────────
  const [selected, setSelected] = useState<string | null>(() => (location.state as { select?: string } | null)?.select ?? null)
  const [rulesOpen, setRulesOpen] = useState(() => (location.state as { panel?: string } | null)?.panel === 'rules')
  const [reviewing, setReviewing] = useState(false)
  const [discarded, setDiscarded] = useState<Graph | null>(null)
  const [finishing, setFinishing] = useState(false)

  // ── Derived ──────────────────────────────────────────────────────
  const mode = loop.status === 'paused' ? 'paused' : loop.status === 'draft' ? 'edit' : 'live'
  const drafting = loop.reveal !== null
  const total = nodeCount(loop.graph)
  const graph = useMemo(() => (loop.reveal !== null ? partialGraph(loop.graph, loop.reveal) : loop.graph), [loop.graph, loop.reveal])
  const located = selected && selected !== 'goal' ? locate(loop.graph.steps, selected) : null
  const node = located?.node ?? null
  const panel: 'rules' | 'node' | 'goal' | 'delivery' | null = rulesOpen ? 'rules' : selected === 'goal' && loop.graph.goal ? 'goal' : node ? (mode === 'live' ? 'delivery' : 'node') : null
  const days = useMemo(() => nodeDays(loop.graph, loop.startAt), [loop.graph, loop.startAt])
  const locked = useMemo(() => {
    if (mode !== 'paused' || !loop.live) return new Set<string>()
    return new Set(flatten(loop.graph.steps).filter((n) => (days[n.id] ?? 0) <= loop.live!.day && loop.pausedGraph && locate(loop.pausedGraph.steps, n.id)).map((n) => n.id))
  }, [mode, loop.graph, loop.live, loop.pausedGraph, days])
  const changes = useMemo(() => (loop.pausedGraph ? diffGraphs(loop.pausedGraph, loop.graph) : []), [loop.pausedGraph, loop.graph])
  const changed = useMemo(() => new Set(changes.map((c) => c.id)), [changes])
  const missingCopy = allSteps(loop.graph).filter(needsCopy)
  const canFinish = mode === 'edit' && (missingCopy.length > 0 || !loop.graph.goal) && flatten(loop.graph.steps).length > 0

  // ── Handlers ─────────────────────────────────────────────────────
  function select(id: string | null) {
    setRulesOpen(false)
    setSelected(id)
  }
  function toggleRules() {
    setSelected(null)
    setRulesOpen((o) => !o)
  }
  function closePanel() {
    setSelected(null)
    setRulesOpen(false)
  }
  function blocked(id: string) {
    if (mode === 'live') toast(id === 'audience' ? 'The audience is locked while the loop runs' : 'Pause the loop to change this step', { label: 'Pause loop', run: () => pause(loop.id) })
    else toast('This step already went out, so it can’t change')
  }
  /** "Let Gifty finish": Gifty writes every empty step and sets the goal. */
  function letGiftyFinish() {
    setFinishing(true)
    const ctx = copyCtx(loop)
    window.setTimeout(() => {
      for (const n of missingCopy) {
        if (n.type === 'email') updateStep(loop.id, n.id, giftyEmail(ctx) as never)
        if (n.type === 'bump') updateStep(loop.id, n.id, { body: giftyBump() } as never)
        if (n.type === 'linkedin') updateStep(loop.id, n.id, { note: giftyLinkedIn(ctx) } as never)
        if (n.type === 'postcard') updateStep(loop.id, n.id, { note: giftyPostcard(ctx) } as never)
        if (n.type === 'gift') updateStep(loop.id, n.id, { note: giftyGiftNote(ctx) } as never)
      }
      if (!loop.graph.goal) setGoal(loop.id, defaultGoal())
      setFinishing(false)
      toast(`Gifty wrote ${missingCopy.length} ${missingCopy.length === 1 ? 'step' : 'steps'}${loop.graph.goal ? '' : ' and set the goal'}`)
    }, 900)
  }
  function handleDiscard() {
    const current = discardChanges(loop.id)
    if (current) setDiscarded(current)
  }
  function handleResume() {
    setReviewing(false)
    setDiscarded(null)
    resume(loop.id)
    navigate(`/loops/${loop.id}/results`)
  }

  // ── Effects ──────────────────────────────────────────────────────
  // Gifty drafts the loop step by step, then hands over to the audience check.
  useEffect(() => {
    if (loop.reveal === null) return
    if (loop.reveal < total) {
      const t = window.setTimeout(() => setReveal(loop.id, (loop.reveal ?? 0) + 1), loop.reveal === 0 ? 700 : 480)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => {
      setReveal(loop.id, null)
      toast(`Gifty drafted ${allSteps(loop.graph).length} steps. Check who it’s for first`)
      navigate(`/loops/${loop.id}/audience`)
    }, 900)
    return () => window.clearTimeout(t)
  }, [loop.reveal, total, loop.id, loop.graph, setReveal, navigate, toast])

  // A deleted or vanished node closes its panel.
  useEffect(() => {
    if (selected && selected !== 'goal' && !node) setSelected(null)
    if (selected === 'goal' && !loop.graph.goal) setSelected(null)
  }, [selected, node, loop.graph.goal])

  // ── Render helpers ───────────────────────────────────────────────
  function renderRight() {
    if (drafting)
      return (
        <span className="shimmer-text text-[13px] font-medium leading-4" data-testid="drafting">
          Gifty is drafting your loop…
        </span>
      )
    if (mode === 'live')
      return (
        <>
          <NowLabel>{fmtDayTime(clock)}</NowLabel>
          {loop.status === 'live' ? (
            <button type="button" data-testid="pause" onClick={() => pause(loop.id)} className={WHITE}>
              <Icon name="pause" size={13} strokeWidth={1.6} />
              Pause loop
            </button>
          ) : (
            <button type="button" onClick={() => navigate(`/loops/${loop.id}/results`)} className={WHITE}>
              See results
            </button>
          )}
        </>
      )
    if (mode === 'paused')
      return (
        <>
          <NowLabel>Paused {loop.pausedAt ? fmtDayTime(loop.pausedAt) : ''}</NowLabel>
          <RulesButton count={loop.rules.length} active={rulesOpen} onClick={toggleRules} />
          <button type="button" data-testid="review-resume" onClick={() => setReviewing(true)} className={panel ? WHITE : PRIMARY}>
            <PlayGlyph color={panel ? '#111216' : '#FFFFFF'} />
            Review &amp; resume
          </button>
        </>
      )
    const empty = flatten(loop.graph.steps).length === 0
    return (
      <>
        <RulesButton count={loop.rules.length} active={rulesOpen} onClick={toggleRules} />
        {canFinish ? (
          <button type="button" data-testid="gifty-finish" disabled={finishing} onClick={letGiftyFinish} className={cn(WHITE, finishing && 'shimmer-text')}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 4l4 4-4 4M8.5 4l4 4-4 4" stroke="#111216" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {finishing ? 'Gifty is writing…' : 'Let Gifty finish'}
          </button>
        ) : (
          <button type="button" disabled={empty} onClick={() => sendTest(loop.id)} className={WHITE}>
            <Icon name="play" size={13} strokeWidth={1.4} />
            Send test
          </button>
        )}
        <button type="button" data-testid="review-launch" disabled={empty} onClick={() => navigate(`/loops/${loop.id}/preview`)} className={panel ? WHITE : PRIMARY}>
          Review &amp; launch
          <Icon name="arrowRight" size={13} color={panel ? '#111216' : '#FFFFFF'} />
        </button>
      </>
    )
  }

  function renderPanel() {
    if (panel === 'rules') return <RulesPanel loop={loop} onClose={closePanel} />
    if (panel === 'goal') return <GoalPanel key="goal" loop={loop} onClose={closePanel} />
    if (panel === 'delivery') return <DeliveryPanel loop={loop} onClose={closePanel} />
    if (!node) return null
    if (node.kind === 'split') return <CheckPanel key={node.id} loop={loop} node={node} onClose={closePanel} />
    switch (node.type) {
      case 'email':
        return <EmailPanel key={node.id} loop={loop} node={node} onClose={closePanel} />
      case 'bump':
        return <BumpPanel key={node.id} loop={loop} node={node} onClose={closePanel} />
      case 'linkedin':
        return <LinkedInPanel key={node.id} loop={loop} node={node} onClose={closePanel} />
      case 'postcard':
        return <PostcardPanel key={node.id} loop={loop} node={node} onClose={closePanel} />
      case 'gift':
        return <GiftPanel key={node.id} loop={loop} node={node} onClose={closePanel} />
      case 'wait':
        return <WaitPanel key={node.id} loop={loop} node={node} onClose={closePanel} />
      case 'task':
        return <TaskPanel key={node.id} loop={loop} node={node} onClose={closePanel} />
    }
  }

  const pausedFor = loop.pausedAt ? `${Math.max(1, Math.round((clock - loop.pausedAt) / 3_600_000))} hours` : 'a moment'
  const c = loop.live?.counts
  const stays = c
    ? [
        c.sent ? `Already sent: ${c.sent} intros${c.linkedinSent ? `, ${c.linkedinSent} LinkedIn notes` : ''}${c.bumpSent ? `, ${c.bumpSent} bumps` : ''}` : 'Nothing has gone out yet',
        c.postcards ? `${c.postcards} postcards are printed and go out as planned` : 'Postcards and gifts haven’t shipped yet',
        `The loop still ends ${new Date(loop.startAt + (loop.live?.endDay ?? 0) * DAY).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')}`,
      ]
    : []

  return (
    <Page header={<BuilderHeader loop={loop} tab="build" right={renderRight()} />}>
      <Canvas
        loop={loop}
        graph={graph}
        mode={mode}
        selectedId={panel === 'rules' ? null : selected}
        onSelect={select}
        panelOpen={!!panel}
        drafting={drafting}
        locked={locked}
        changed={changed}
        onAudience={() => (mode === 'live' ? blocked('audience') : navigate(`/loops/${loop.id}/audience`))}
        onRules={() => {
          setSelected(null)
          setRulesOpen(true)
        }}
        onResults={() => navigate(`/loops/${loop.id}/results`)}
        onBlocked={blocked}
        topLeft={
          mode === 'paused' ? (
            <PausedCard
              loop={loop}
              changes={discarded ? [] : changes}
              discarded={!!discarded}
              onDiscard={handleDiscard}
              onUndo={() => {
                if (discarded) restoreGraph(loop.id, discarded)
                setDiscarded(null)
              }}
            />
          ) : undefined
        }
      />
      <FloatingPanel open={!!panel && !drafting} onClose={closePanel} testId="right-panel">
        {renderPanel()}
      </FloatingPanel>
      {reviewing && <ResumeModal changes={changes} pausedFor={pausedFor} stays={stays} onKeepPaused={() => setReviewing(false)} onResume={handleResume} />}
    </Page>
  )
}
