import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasLayout, FlowLine } from '@/components/canvas'
import { asset, GIFT } from '@/lib/assets'
import { useBlankInspector } from '@/screens/blank/config/useBlankInspector'
import { FLOW_SHIFT, FlowTop, glyph, MenuSlot, RowIcon, StepMenu, TIMING_SECTIONS, type MenuSection, type Suggestion } from './late-shared'

// B5 · Something in the mail: the step menu is open on the empty slot, Gifty suggests a postcard.
// ?step=<id> selects a placed step and shows its config panel (B4a: ?step=bump); ?panel=rules opens the rules.

const SUGGESTION: Suggestion = {
  media: <span className="h-9 w-11 shrink-0 rounded-[8px] bg-cover bg-center" style={{ backgroundImage: `url(${asset(GIFT.postcard)})` }} />,
  title: 'Postcard from Sam',
  subtitle: 'Paper gets noticed in Diwali week',
  options: [
    { label: 'Design', choices: [{ label: 'Diwali card' }, { label: 'Plain' }, { label: 'Upload' }], selected: 0 },
    { label: 'Lands', choices: [{ label: '30–31 Oct' }, { label: '$3 each', kind: 'tag' }], selected: 0 },
  ],
}

const REACH: MenuSection[] = [
  {
    title: 'Mail and gifts',
    rows: [
      { icon: RowIcon.glyph(glyph.pen('#33353C')), label: 'Handwritten letter', hint: '$9, a day slower' },
      { icon: RowIcon.image(GIFT.g1), label: 'Send a gift', hint: 'Skip straight to it' },
    ],
  },
  {
    title: 'LinkedIn',
    rows: [
      { icon: RowIcon.linkedin(), label: 'LinkedIn message', hint: 'If they accepted' },
      { icon: RowIcon.linkedin(), label: 'Like a recent post', hint: 'Stay warm online' },
    ],
  },
  { title: 'Email', rows: [{ icon: RowIcon.gmail(), label: 'Reply in thread', hint: 'A third email is a lot', disabled: true }] },
]

const SECTIONS = { reach: REACH, timing: TIMING_SECTIONS }

export default function Step5() {
  const navigate = useNavigate()
  const ins = useBlankInspector({ finishTo: '/blank/rules' })
  const [open, setOpen] = useState(true)

  function handleAddStep() {
    if (ins.menuHidden) ins.close()
    setOpen(ins.menuHidden || !open)
  }

  return (
    <div onClick={() => setOpen(false)}>
      <CanvasLayout header={ins.header} inspector={ins.inspector} flowStyle={{ top: -150, left: ins.inspector ? FLOW_SHIFT : 0 }}>
        <FlowTop selected={ins.selected} onSelect={ins.select} />
        <FlowLine />
        <MenuSlot
          label="Add step"
          open={open && !ins.menuHidden}
          onToggle={handleAddStep}
          menu={<StepMenu sections={SECTIONS} suggestion={SUGGESTION} onPick={() => navigate('/blank/build/6')} />}
        />
      </CanvasLayout>
    </div>
  )
}
