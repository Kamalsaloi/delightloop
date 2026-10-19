import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasLayout, FlowLine } from '@/components/canvas'
import { asset, GIFT } from '@/lib/assets'
import { useBlankInspector } from '@/screens/blank/config/useBlankInspector'
import { FLOW_SHIFT, FlowTop, glyph, MenuSlot, RowIcon, ShortLetterCard, StepMenu, TIMING_SECTIONS, type MenuSection, type Suggestion } from './late-shared'

// B6 · The gift: postcard added, the menu now suggests a gift per person.
// ?step=<id> selects a placed step and shows its config panel (B5a: ?step=postcard); ?panel=rules opens the rules.

const PEOPLE = 48

function GiftTrio() {
  // Three 36px tiles, 8px apart, last on top.
  const ids = [GIFT.g1, GIFT.g3, GIFT.g4]
  return (
    <span className="relative h-9 w-[52px] shrink-0">
      {ids.map((id, i) => (
        <span
          key={id}
          className="absolute top-0 h-9 w-9 rounded-[9px] bg-cover bg-center shadow-[0_0_0_2px_#FFFFFF]"
          style={{ left: i * 8, backgroundImage: `url(${asset(id)})` }}
        />
      ))}
    </span>
  )
}

const SUGGESTION: Suggestion = {
  media: <GiftTrio />,
  title: 'A gift for each person',
  subtitle: 'Matched to who each person is',
  options: [
    { label: 'Picks', choices: [{ label: 'Gifty' }, { label: 'I’ll pick a few' }, { label: 'Same for all' }], selected: 0 },
    {
      label: 'Per gift',
      choices: [{ label: '$50' }, { label: '$75' }, { label: '$100' }],
      selected: 1,
      note: (price) => `≈ $${(Number(price.slice(1)) * PEOPLE).toLocaleString('en-US')} total`,
    },
    { label: 'Arrives', choices: [{ label: 'Lands by Wed 4 Nov' }, { label: 'Card note from Sam' }], selected: 0 },
  ],
}

const REACH: MenuSection[] = [
  { title: 'Email', rows: [{ icon: RowIcon.gmail(), label: 'Heads-up email', hint: '“Something’s coming”' }] },
  { title: 'LinkedIn', rows: [{ icon: RowIcon.linkedin(), label: 'LinkedIn message', hint: 'When it lands' }] },
  { title: 'Mail and gifts', rows: [{ icon: RowIcon.image(GIFT.g6), label: 'Gift card', hint: 'No address needed' }] },
  { title: 'Tasks', rows: [{ icon: RowIcon.glyph(glyph.phone()), label: 'Call task for Sam', hint: 'A day after delivery' }] },
]

const SECTIONS = { reach: REACH, timing: TIMING_SECTIONS }

export default function Step6() {
  const navigate = useNavigate()
  const ins = useBlankInspector({ finishTo: '/blank/rules' })
  const [open, setOpen] = useState(true)

  function handleAddStep() {
    if (ins.menuHidden) ins.close()
    setOpen(ins.menuHidden || !open)
  }

  return (
    <div onClick={() => setOpen(false)}>
      <CanvasLayout header={ins.header} inspector={ins.inspector} flowStyle={{ top: -260, left: ins.inspector ? FLOW_SHIFT : 0 }}>
        <FlowTop selected={ins.selected} onSelect={ins.select} />
        <FlowLine />
        <ShortLetterCard selected={ins.selected === 'postcard'} onClick={() => ins.select('postcard')} />
        <FlowLine />
        <MenuSlot
          label="Add step"
          open={open && !ins.menuHidden}
          onToggle={handleAddStep}
          menuTop={-40}
          menu={<StepMenu sections={SECTIONS} suggestion={SUGGESTION} onPick={() => navigate('/blank/build/7')} />}
        />
      </CanvasLayout>
    </div>
  )
}
