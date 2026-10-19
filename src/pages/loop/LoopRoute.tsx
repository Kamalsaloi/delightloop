import { Navigate, useParams } from 'react-router-dom'
import { useLoop } from '@/store/store'
import AudiencePage from './audience/AudiencePage'
import BuildPage from './build/BuildPage'
import LaunchPage from './launch/LaunchPage'
import PreviewPage from './preview/PreviewPage'
import ResultsPage from './results/ResultsPage'

/** /loops/:id/:section. Sections that don't apply yet fall back to one that does. */
export default function LoopRoute() {
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
