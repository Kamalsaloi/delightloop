import { EmailInspector, INTRO_EMAIL } from '@/components/canvas'
import type { ConfigPanelProps } from './types'

// B1a · intro email written by hand (DWY-0). Same Write / Timing panel as 05.
export default function IntroConfig({ onClose }: ConfigPanelProps) {
  return <EmailInspector draft={INTRO_EMAIL} onClose={onClose} />
}
