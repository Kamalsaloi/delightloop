import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasLayout } from '@/components/canvas'
import { FACE, GIFT } from '@/lib/assets'
import { useBlankInspector } from '@/screens/blank/config/useBlankInspector'
import { AddWithMenu, ItemIcon, MENU_GLYPH, PANEL_FLOW_STYLE, PathBFlow, StepMenu, SuggestIcon, type MenuContent, type MenuTab } from './shared'

// B1 · first step: "Add step" under the audience opens the step picker. Any pick → B2.
const CONTENT: Record<MenuTab, MenuContent> = {
  reach: {
    suggest: {
      icon: SuggestIcon.gmail(),
      title: 'Intro email from Sam',
      subtitle: 'Sam already knows 12 of them',
      rows: [
        { label: 'From', choices: [{ label: 'Sam', face: FACE.sam }, { label: 'Rotate across 3 AEs' }] },
        { label: 'Sends', choices: [{ label: '9:00 their time' }, { label: '9:00 IST for all' }] },
      ],
    },
    groups: [
      { title: 'Email', items: [{ id: 'email', label: 'Send an email', hint: 'Write your own', icon: ItemIcon.gmail() }] },
      {
        title: 'LinkedIn',
        items: [
          { id: 'connect', label: 'Connection request', hint: '42 have a profile', icon: ItemIcon.linkedin() },
          { id: 'view', label: 'View their profile', hint: 'They see Sam looked', icon: ItemIcon.linkedin() },
          { id: 'like', label: 'Like a recent post', hint: 'A soft first touch', icon: ItemIcon.linkedin() },
        ],
      },
      {
        title: 'Mail and gifts',
        items: [
          { id: 'postcard', label: 'Postcard', hint: 'Lands in 1–2 days', icon: ItemIcon.image(GIFT.postcard) },
          { id: 'gift', label: 'Send a gift', hint: 'Lands better later', icon: ItemIcon.image(GIFT.g1), disabled: true },
        ],
      },
    ],
  },
  // Nothing to wait on yet, so the first step can only be a delay.
  timing: {
    groups: [
      {
        title: 'Wait',
        items: [
          { id: 'wait-date', label: 'Wait until a date', hint: 'e.g. after a holiday', icon: ItemIcon.glyph(MENU_GLYPH.calendar) },
          { id: 'wait', label: 'Wait, then continue', hint: 'Start later', icon: ItemIcon.glyph(MENU_GLYPH.clock) },
        ],
      },
    ],
  },
}

export default function Step1() {
  const navigate = useNavigate()
  const ins = useBlankInspector()
  const [open, setOpen] = useState(true)

  function openMenu() {
    ins.close()
    setOpen(true)
  }

  return (
    <CanvasLayout header={ins.header} inspector={ins.inspector} flowStyle={ins.inspector ? PANEL_FLOW_STYLE : undefined}>
      <PathBFlow>
        <AddWithMenu
          open={open && !ins.menuHidden}
          onOpen={openMenu}
          menu={<StepMenu content={CONTENT} onPick={() => navigate('/blank/build/2')} onClose={() => setOpen(false)} />}
        />
      </PathBFlow>
    </CanvasLayout>
  )
}
