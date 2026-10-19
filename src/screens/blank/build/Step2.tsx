import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasLayout } from '@/components/canvas'
import { GIFT } from '@/lib/assets'
import { useBlankInspector } from '@/screens/blank/config/useBlankInspector'
import {
  AddWithMenu,
  ItemIcon,
  PANEL_FLOW_STYLE,
  PathBFlow,
  PathsRow,
  PlainAddStep,
  StepMenu,
  SuggestIcon,
  TIMING_AFTER_EMAIL,
  type MenuContent,
  type MenuTab,
} from './shared'

// B2 · intro email placed; the picker opens on Timing & logic with Gifty's open-check. Any pick → B3.
const CONTENT: Record<MenuTab, MenuContent> = {
  timing: {
    suggest: {
      icon: SuggestIcon.check(),
      title: 'Check if they opened',
      subtitle: 'Splits who saw it from who didn’t',
      rows: [
        { label: 'Wait', value: 1, choices: [{ label: '1 day' }, { label: '2 weekdays' }, { label: '3 days' }, { label: 'Custom' }] },
        { label: 'Check', choices: [{ label: 'Opened' }, { label: 'Opened twice' }, { label: 'Clicked' }] },
        { label: 'Paths', custom: <PathsRow /> },
      ],
    },
    groups: TIMING_AFTER_EMAIL,
  },
  reach: {
    groups: [
      {
        title: 'LinkedIn',
        items: [
          { id: 'connect', label: 'Connection request', hint: '42 have a profile', icon: ItemIcon.linkedin() },
          { id: 'view', label: 'View their profile', hint: 'They see Sam looked', icon: ItemIcon.linkedin() },
        ],
      },
      { title: 'Email', items: [{ id: 'bump', label: 'Reply in thread', hint: 'Right after the intro', icon: ItemIcon.gmail() }] },
      {
        title: 'Mail and gifts',
        items: [
          { id: 'postcard', label: 'Postcard', hint: 'Lands in 1–2 days', icon: ItemIcon.image(GIFT.postcard) },
          { id: 'gift', label: 'Send a gift', hint: 'Lands better later', icon: ItemIcon.image(GIFT.g1), disabled: true },
        ],
      },
    ],
  },
}

export default function Step2() {
  const navigate = useNavigate()
  const ins = useBlankInspector()
  const [open, setOpen] = useState(true)

  function openMenu() {
    ins.close()
    setOpen(true)
  }

  // B1a: intro selected, a plain "Add step" under it and no menu.
  function renderAdd() {
    if (ins.menuHidden) return <PlainAddStep raised onClick={openMenu} />
    return (
      <AddWithMenu
        open={open}
        onOpen={openMenu}
        menu={<StepMenu content={CONTENT} defaultTab="timing" onPick={() => navigate('/blank/build/3')} onClose={() => setOpen(false)} />}
      />
    )
  }

  return (
    <CanvasLayout header={ins.header} inspector={ins.inspector} flowStyle={ins.inspector ? PANEL_FLOW_STYLE : undefined}>
      <PathBFlow intro introSelected={ins.selected === 'intro'} onIntroClick={() => ins.select('intro')}>
        {renderAdd()}
      </PathBFlow>
    </CanvasLayout>
  )
}
