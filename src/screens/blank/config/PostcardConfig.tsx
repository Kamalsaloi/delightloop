import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { asset, GIFT } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { ConfigFooter, ConfigHeader, ConfigPanel, ConfigSection, SaveStepButton, TrackSegmented } from './late-parts'
import type { ConfigPanelProps } from './types'

// B5a · EIV-0 · configure the postcard: card picker, handwritten note, ship-to, cost.

type CardId = 'diwali' | 'plain' | 'custom'
type ShipTo = 'best' | 'home' | 'office'

const NOTE =
  '{first name}, wishing you and the team a bright Diwali. Hope the new offices fill up fast. Coffee’s on me when I’m in town.'
const NOTE_MAX = 220
const CREAM = '#EDE7DD'

const SHIP_OPTIONS: { value: ShipTo; label: string }[] = [
  { value: 'best', label: 'Best per person' },
  { value: 'home', label: 'Home first' },
  { value: 'office', label: 'Office first' },
]

const RING = 'shadow-[0_0_0_2px_#FFFFFF,0_0_0_3.5px_#6559F7]'

export default function PostcardConfig({ onClose }: ConfigPanelProps) {
  const [card, setCard] = useState<CardId>('diwali')
  const [upload, setUpload] = useState<string | null>(null)
  const [note, setNote] = useState(NOTE)
  const [ship, setShip] = useState<ShipTo>('best')

  // Release the picked file's object URL when it's replaced or the panel closes.
  useEffect(() => () => void (upload && URL.revokeObjectURL(upload)), [upload])

  function handleUpload(file: File | undefined) {
    if (!file) return
    setUpload(URL.createObjectURL(file))
    setCard('custom')
  }

  return (
    <ConfigPanel>
      <ConfigHeader
        media={<CardFace card={card} upload={upload} className="h-10 w-[52px]" />}
        title="A short letter"
        subtitle="Postcard · lands Fri 30 to Sat 31 Oct"
        onClose={onClose}
      />

      <ConfigSection title="Card" gap={10}>
        <div className="flex gap-2">
          <CardOption label="Diwali, warm" selected={card === 'diwali'} onClick={() => setCard('diwali')}>
            <CardFace card="diwali" upload={null} className="h-[72px] w-full" />
          </CardOption>
          <CardOption label="Plain cream" selected={card === 'plain'} onClick={() => setCard('plain')}>
            <CardFace card="plain" upload={null} className="h-[72px] w-full" />
          </CardOption>
          <UploadOption upload={upload} selected={card === 'custom'} onSelect={() => setCard('custom')} onFile={handleUpload} />
        </div>
      </ConfigSection>

      <ConfigSection title="Handwritten note" meta={`${note.length} / ${NOTE_MAX}`}>
        <NoteField value={note} onChange={setNote} />
        <span className="text-[12px] leading-4 text-grey-3">Written by a pen robot in Sam’s handwriting</span>
      </ConfigSection>

      <ConfigSection title="Ship to">
        <TrackSegmented options={SHIP_OPTIONS} value={ship} onChange={setShip} />
        <span className="text-[12px] leading-4 text-amber-text">7 have no address yet, they skip this step</span>
      </ConfigSection>

      <ConfigFooter>
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold leading-4 text-ink">$6 a card</span>
          <span className="text-[12px] leading-4 text-grey-3">$246 for 41 people</span>
        </div>
        <SaveStepButton onSaved={onClose}>Save step</SaveStepButton>
      </ConfigFooter>
    </ConfigPanel>
  )
}

/** The card artwork: Diwali photo, plain cream, or the uploaded design. */
function CardFace({ card, upload, className }: { card: CardId; upload: string | null; className?: string }) {
  let style: CSSProperties = { backgroundImage: `url(${asset(GIFT.postcard)})` }
  if (card === 'plain') style = { backgroundColor: CREAM }
  if (card === 'custom' && upload) style = { backgroundImage: `url(${upload})` }
  return <span className={cn('block shrink-0 rounded-[8px] bg-cover bg-center', className)} style={style} />
}

function CardOption({ label, selected, onClick, children }: { label: string; selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="group flex grow basis-0 cursor-pointer flex-col gap-1.5 text-left">
      <span className={cn('block rounded-[8px] transition-shadow', selected ? RING : 'group-hover:shadow-[0_0_0_1px_#DADAD5]')}>{children}</span>
      <CardLabel selected={selected}>{label}</CardLabel>
    </button>
  )
}

function CardLabel({ selected, children }: { selected: boolean; children: ReactNode }) {
  return <span className={cn('text-[12px] leading-4', selected ? 'font-medium text-ink' : 'text-grey-2')}>{children}</span>
}

/** Dashed "+" tile that opens a file picker; once a design is uploaded it shows in the tile. */
function UploadOption({
  upload,
  selected,
  onSelect,
  onFile,
}: {
  upload: string | null
  selected: boolean
  onSelect: () => void
  onFile: (f: File | undefined) => void
}) {
  const input = useRef<HTMLInputElement>(null)

  function handleClick() {
    if (upload && !selected) onSelect()
    else input.current?.click()
  }

  return (
    <div className="flex grow basis-0">
      <button type="button" onClick={handleClick} className="group flex grow cursor-pointer flex-col gap-1.5 text-left">
        {upload ? (
          <span className={cn('block rounded-[8px]', selected && RING)}>
            <CardFace card="custom" upload={upload} className="h-[72px] w-full" />
          </span>
        ) : (
          <span className="flex h-[72px] items-center justify-center rounded-[8px] border-[1.5px] border-dashed border-[#D4D4CF] group-hover:border-grey-4 group-hover:bg-fill-hover">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 3v10M3 8h10" stroke="#8B8D95" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        )}
        <CardLabel selected={selected}>Your design</CardLabel>
      </button>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  )
}

/** Cream note card in Newsreader italic; the textarea grows with its text. Sam's signature sits under it. */
function NoteField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <label className="flex cursor-text flex-col gap-[10px] rounded-[12px] bg-[#FBF8F2] p-[14px] shadow-[inset_0_0_0_1.5px_#6559F7]">
      <textarea
        ref={ref}
        value={value}
        maxLength={NOTE_MAX}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        spellCheck={false}
        className="block w-full resize-none overflow-hidden bg-transparent font-serif text-[16px] italic leading-[23px] text-[#2A2B36] outline-none"
      />
      <span className="font-serif text-[16px] italic leading-[23px] text-[#2A2B36]">Sam</span>
    </label>
  )
}
