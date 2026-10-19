import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useLoop } from '@/store/store'

// Each tab is its own chunk; Home stays in the main bundle.
const AudiencePage = lazy(() => import('./audience/AudiencePage'))
const BuildPage = lazy(() => import('./build/BuildPage'))
const LaunchPage = lazy(() => import('./launch/LaunchPage'))
const PreviewPage = lazy(() => import('./preview/PreviewPage'))
const ResultsPage = lazy(() => import('./results/ResultsPage'))

const Fallback = () => <div className="h-dvh bg-page" />
const wrap = (node: ReactNode) => <Suspense fallback={<Fallback />}>{node}</Suspense>

/** /loops/:id/:section. Sections that don't apply yet fall back to one that does. */
export default function LoopRoute() {
  return wrap(<Section />)
}

function Section() {
  const { id, section } = useParams()
  const loop = useLoop(id)
  if (!loop) return <Navigate to="/" replace />

  const fallback = loop.status === 'draft' ? (loop.audience.kind === 'none' ? 'audience' : 'build') : 'results'
  const noAudience = loop.audience.kind === 'none'
  switch (section) {
    case 'audience':
      return <AudiencePage key={loop.id} loop={loop} />
    case 'build':
      if (noAudience && loop.origin === 'blank') return <Navigate to={`/loops/${loop.id}/audience`} replace />
      return <BuildPage key={loop.id} loop={loop} />
    case 'preview':
      if (noAudience) return <Navigate to={`/loops/${loop.id}/audience`} replace />
      return <PreviewPage key={loop.id} loop={loop} />
    case 'launch':
      if (loop.status !== 'draft') return <Navigate to={`/loops/${loop.id}/results`} replace />
      return <LaunchPage key={loop.id} loop={loop} />
    case 'results':
      if (loop.status === 'draft') return <Navigate to={`/loops/${loop.id}/${fallback}`} replace />
      return <ResultsPage key={loop.id} loop={loop} />
    default:
      return <Navigate to={`/loops/${loop.id}/${fallback}`} replace />
  }
}
