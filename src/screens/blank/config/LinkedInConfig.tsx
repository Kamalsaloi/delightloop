import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { asset, FACE } from '@/lib/assets'
import {
  ConfigFooter,
  ConfigHeader,
  ConfigPanel,
  ConfigPrimary,
  ConfigRow,
  ConfigSection,
  ConfigSegmented,
  ConfigSelect,
  HeaderTile,
  NoteEditor,
  RadioList,
  RewriteButton,
  SectionNote,
  SectionTitle,
  useFlash,
  type Option,
} from './early-parts'
import type { ConfigPanelProps } from './types'

// B3a · connect on LinkedIn (E6X-0).

type NoteMode = 'note' | 'none'
type Fallback = 'email' | 'skip'

const NOTE_MODES: Option<NoteMode>[] = [
  { value: 'note', label: 'Short note' },
  { value: 'none', label: 'No note' },
]

const FALLBACKS: Option<Fallback>[] = [
  { value: 'email', label: 'Send the note as an email instead' },
  { value: 'skip', label: 'Skip this step for them' },
]

const NOTE = 'Sent you a note on Monday about outbound for Q4. Would love to connect.'
const REWRITE = 'Saw the Q4 hiring push at your team. Would love to swap notes on outbound.'
const LIMIT = 200
// Room the greeting takes once the name is filled in (Paper: 71-char note shows 96).
const GREETING_CHARS = 25
const WAITS = ['After 3 days', 'After 5 days', 'After a week', 'Never, wait for them']

export default function LinkedInConfig({ onClose }: ConfigPanelProps) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<NoteMode>('note')
  const [note, setNote] = useState(NOTE)
  const [version, setVersion] = useState(0)
  const [fallback, setFallback] = useState<Fallback>('email')
  const [wait, setWait] = useState(WAITS[0])
  const [rewriting, flashRewrite] = useFlash(700)

  const chars = GREETING_CHARS + note.trim().length

  function rewrite() {
    flashRewrite()
    window.setTimeout(() => {
      setNote((n) => (n === NOTE ? REWRITE : NOTE))
      setVersion((v) => v + 1)
    }, 700)
  }

  return (
    <ConfigPanel>
      <ConfigHeader
        media={<HeaderTile tone="linkedin">in</HeaderTile>}
        title="Connect on LinkedIn"
        subtitle="Day 2, Wed 28 Oct · people who opened"
        onClose={onClose}
      />

      <ConfigSection title="From">
        <div className="flex h-10 shrink-0 items-center gap-[10px] rounded-[10px] px-3 shadow-[inset_0_0_0_1px_#E4E4E1]">
          <img src={asset(FACE.sam)} alt="" className="h-[22px] w-[22px] shrink-0 rounded-full object-cover" />
          <span className="grow basis-0 text-[13.5px] font-medium leading-4 text-ink">Sam Rivera’s LinkedIn</span>
          <span className="text-[12px] leading-4 text-green-text">Connected</span>
        </div>
      </ConfigSection>

      <ConfigSection gap={10}>
        <div className="flex items-center justify-between">
          <SectionTitle>Note with the request</SectionTitle>
          <ConfigSegmented options={NOTE_MODES} value={mode} onChange={setMode} size="sm" />
        </div>
        {mode === 'note' ? (
          <NoteEditor
            key={version}
            paragraphs={[note]}
            onChange={setNote}
            gap={10}
            footer={
              <>
                <RewriteButton onClick={rewrite} busy={rewriting} />
                <span className={chars > LIMIT ? 'text-[12px] leading-4 text-[#C2362F]' : 'text-[12px] leading-4 text-grey-3'}>
                  {chars} / {LIMIT}
                </span>
              </>
            }
          />
        ) : (
          <SectionNote>They get a plain request. Notes get about twice the accepts.</SectionNote>
        )}
      </ConfigSection>

      <ConfigSection title="If they’re not on LinkedIn">
        <RadioList options={FALLBACKS} value={fallback} onChange={setFallback} />
        <SectionNote>6 of the 48 have no profile</SectionNote>
      </ConfigSection>

      <ConfigRow
        title="If they don’t accept"
        note="Move on to the next step anyway"
        control={<ConfigSelect variant="pill" options={WAITS} value={wait} onChange={setWait} />}
      />

      <ConfigFooter removeLabel="Remove step" onRemove={() => navigate('/blank/build/3')}>
        <ConfigPrimary onClick={onClose}>Save step</ConfigPrimary>
      </ConfigFooter>
    </ConfigPanel>
  )
}
