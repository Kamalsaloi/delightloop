import { useNavigate } from 'react-router-dom'
import { PausedCanvas } from './build/PausedCanvas'
import { ResumeModal } from './build/ResumeModal'

// 11 · Review changes before resuming: modal over 10. Resume → /live/results, Keep paused / Esc → /paused/build.
export default function ReviewChanges() {
  const navigate = useNavigate()
  return <PausedCanvas overlay={<ResumeModal onKeepPaused={() => navigate('/paused/build')} onResume={() => navigate('/live/results')} />} />
}
