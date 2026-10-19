import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { GmailMark } from '@/components/ui'
import {
  ConfigFooter,
  ConfigHeader,
  ConfigPanel,
  ConfigPrimary,
  ConfigRow,
  ConfigSecondary,
  ConfigSection,
  ConfigSegmented,
  ConfigToggle,
  HeaderTile,
  NoteEditor,
  RewriteButton,
  SectionNote,
  useFlash,
  type Option,
} from './early-parts'
import type { ConfigPanelProps } from './types'

// B4a · gentle bump (ECJ-0).

type SendAs = 'thread' | 'new'

const SEND_AS: Option<SendAs>[] = [
  { value: 'thread', label: 'Reply in the intro’s thread' },
  { value: 'new', label: 'New email', grow: 0.7 },
]

const BODY = 'Bumping this up in case it got buried. Happy to send a two-line version if that’s easier.'
const REWRITE = 'Floating this back up. If Q4 is already full, a two-line version might be easier to look at.'

function FormatButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} className="cursor-pointer text-[12.5px] leading-4 text-grey-1 hover:text-ink">
      {children}
    </button>
  )
}

export default function BumpConfig({ onClose }: ConfigPanelProps) {
  const navigate = useNavigate()
  const [sendAs, setSendAs] = useState<SendAs>('thread')
  const [body, setBody] = useState(BODY)
  const [version, setVersion] = useState(0)
  const [skipIfOpened, setSkipIfOpened] = useState(true)
  const [rewriting, flashRewrite] = useFlash(700)
  const [tested, flashTest] = useFlash()

  function rewrite() {
    flashRewrite()
    window.setTimeout(() => {
      setBody((b) => (b === BODY ? REWRITE : BODY))
      setVersion((v) => v + 1)
    }, 700)
  }

  const sendAsNote = sendAs === 'thread' ? 'Shows up under “Re: Quick idea for {company}’s Q4”' : 'Starts a fresh thread with its own subject line'

  return (
    <ConfigPanel>
      <ConfigHeader
        media={
          <HeaderTile>
            <GmailMark width={18} />
          </HeaderTile>
        }
        title="Gentle bump"
        subtitle="Email · Day 2, Wed 28 Oct · didn’t open"
        onClose={onClose}
      />

      <ConfigSection title="Send it as">
        <ConfigSegmented options={SEND_AS} value={sendAs} onChange={setSendAs} />
        <SectionNote>{sendAsNote}</SectionNote>
      </ConfigSection>

      <ConfigSection title="Message">
        <NoteEditor
          key={version}
          paragraphs={[body, 'Sam']}
          gap={12}
          footer={
            <>
              <div className="flex items-center gap-3">
                <FormatButton>
                  <span className="font-semibold">B</span>
                </FormatButton>
                <FormatButton>
                  <span className="italic [font-synthesis:style]">I</span>
                </FormatButton>
                <FormatButton>{'{ } Field'}</FormatButton>
              </div>
              <RewriteButton onClick={rewrite} busy={rewriting} />
            </>
          }
        />
      </ConfigSection>

      <ConfigRow
        title="Skip if they open it meanwhile"
        note={skipIfOpened ? 'They move to the opened path instead' : 'Everyone on this path gets the bump'}
        control={<ConfigToggle on={skipIfOpened} onChange={setSkipIfOpened} label="Skip if they open it meanwhile" />}
      />

      <ConfigFooter removeLabel="Remove step" onRemove={() => navigate('/blank/build/4')}>
        <ConfigSecondary onClick={flashTest}>{tested ? 'Test sent' : 'Send me a test'}</ConfigSecondary>
        <ConfigPrimary onClick={onClose}>Save email</ConfigPrimary>
      </ConfigFooter>
    </ConfigPanel>
  )
}
