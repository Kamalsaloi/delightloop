import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasLayout, FlowLine, StepRow } from '@/components/canvas'
import { FACE } from '@/lib/assets'
import { useBlankInspector } from '@/screens/blank/config/useBlankInspector'
import {
  DiwaliGiftCard,
  FLOW_SHIFT,
  FlowTop,
  glyph,
  MenuSlot,
  RowIcon,
  ShortLetterCard,
  StepMenu,
  TIMING_SECTIONS,
  type MenuSection,
  type Suggestion,
} from './late-shared'

// B7 · The goal: gift added, the menu opens on Timing & logic and suggests the goal.
// ?step=<id> selects a placed step and shows its config panel (B6a: ?step=gift); ?panel=rules opens the rules.

const SUGGESTION: Suggestion = {
  media: (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#1F9D61] shadow-[inset_0_0_0_1px_#198A54]">
      {glyph.flag()}
    </span>
  ),
  title: 'Goal: a meeting booked',
  subtitle: 'Ends the loop for that person',
  options: [
    {
      label: 'Counts',
      choices: [{ label: 'Meeting booked' }, { label: 'Positive reply' }, { label: 'Demo request' }],
      selected: 0,
      wrap: true,
    },
    { label: 'With', choices: [{ label: 'Sam, 30 min', face: FACE.sam }, { label: 'Anyone on the team' }], selected: 0 },
  ],
}

// Reach-out rows after a gift (same as B6's list).
const REACH: MenuSection[] = [
  { title: 'Email', rows: [{ icon: RowIcon.gmail(), label: 'Thank-you email', hint: 'After it lands' }] },
  { title: 'LinkedIn', rows: [{ icon: RowIcon.linkedin(), label: 'LinkedIn message', hint: 'When it lands' }] },
  { title: 'Tasks', rows: [{ icon: RowIcon.glyph(glyph.phone()), label: 'Call task for Sam', hint: 'A day after delivery' }] },
]

const SECTIONS = { reach: REACH, timing: TIMING_SECTIONS }

export default function Step7() {
  const navigate = useNavigate()
  const ins = useBlankInspector({ finishTo: '/blank/rules' })
  const [open, setOpen] = useState(true)

  function handleAddStep() {
    if (ins.menuHidden) ins.close()
    setOpen(ins.menuHidden || !open)
  }

  return (
    <div onClick={() => setOpen(false)}>
      <CanvasLayout header={ins.header} inspector={ins.inspector} flowStyle={{ top: -330, left: ins.inspector ? FLOW_SHIFT : 0 }}>
        <FlowTop selected={ins.selected} onSelect={ins.select} />
        {/* With a panel open (B6a) the postcard sits right on the branch merge. */}
        {!ins.menuHidden && <FlowLine />}
        <ShortLetterCard selected={ins.selected === 'postcard'} onClick={() => ins.select('postcard')} />
        <FlowLine />
        <StepRow>
          <DiwaliGiftCard selected={ins.selected === 'gift'} onClick={() => ins.select('gift')} />
        </StepRow>
        {/* …and the slot is a plain "Add step", 32px below the gift. */}
        <FlowLine h={ins.menuHidden ? 32 : 16} />
        <MenuSlot
          label={ins.menuHidden ? 'Add step' : 'Set the goal'}
          open={open && !ins.menuHidden}
          onToggle={handleAddStep}
          menuTop={-120}
          menu={<StepMenu defaultTab="timing" sections={SECTIONS} suggestion={SUGGESTION} onPick={() => navigate('/blank/rules')} />}
        />
      </CanvasLayout>
    </div>
  )
}
