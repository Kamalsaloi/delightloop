import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasLayout } from '@/components/canvas'
import { GIFT } from '@/lib/assets'
import { useBlankInspector } from '@/screens/blank/config/useBlankInspector'
import {
  GreySlot,
  ItemIcon,
  MENU_GLYPH,
  PANEL_FLOW_STYLE,
  PathBFlow,
  SlotAdd,
  StepMenu,
  SuggestIcon,
  TIMING_AFTER_EMAIL,
  UpNextSlot,
  type MenuContent,
  type MenuTab,
} from './shared'

const notePen = (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M10.5 2.5 13.5 5.5 6 13H3v-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

// B3 · the check split the flow; the picker opens beside the Opened branch. Any pick → B4.
const CONTENT: Record<MenuTab, MenuContent> = {
  reach: {
    suggestLabel: 'Gifty suggests for people who open',
    suggest: {
      icon: SuggestIcon.linkedin(),
      title: 'Connect on LinkedIn',
      subtitle: 'A new channel beats a second email',
      rows: [
        { label: 'Note', choices: [{ label: 'Short note', icon: notePen }, { label: 'No note' }] },
        { label: 'If none', choices: [{ label: 'Send an email' }, { label: 'Skip this step' }] },
      ],
    },
    groups: [
      {
        title: 'LinkedIn',
        items: [
          { id: 'message', label: 'LinkedIn message', hint: '9 are Sam’s connections', icon: ItemIcon.linkedin() },
          { id: 'like', label: 'Like a recent post', hint: 'Light touch, no ask', icon: ItemIcon.linkedin() },
        ],
      },
      { title: 'Email', items: [{ id: 'reply', label: 'Reply in thread', hint: 'Can feel pushy', icon: ItemIcon.gmail() }] },
      {
        title: 'Mail and gifts',
        items: [
          { id: 'postcard', label: 'Postcard', hint: 'Lands in 1–2 days', icon: ItemIcon.image(GIFT.postcard) },
          { id: 'gift', label: 'Send a gift', hint: 'Better after a reply', icon: ItemIcon.image(GIFT.g1), disabled: true },
        ],
      },
      { title: 'Tasks', items: [{ id: 'call', label: 'Call task for Sam', hint: 'One per opener', icon: ItemIcon.glyph(MENU_GLYPH.phone) }] },
    ],
  },
  timing: { groups: TIMING_AFTER_EMAIL },
}

export default function Step3() {
  const navigate = useNavigate()
  const ins = useBlankInspector()
  const [open, setOpen] = useState(true)

  function openMenu() {
    ins.close()
    setOpen(true)
  }

  const menu = open && (
    <StepMenu
      content={CONTENT}
      onPick={() => navigate('/blank/build/4')}
      onClose={() => setOpen(false)}
      className="absolute"
      style={{ left: -384, top: -48 }}
    />
  )

  // B2a: with a step selected both branches are plain grey slots.
  const split = ins.menuHidden
    ? { left: <GreySlot onAdd={openMenu} />, right: <GreySlot onAdd={openMenu} /> }
    : { left: <SlotAdd onAdd={openMenu}>{menu}</SlotAdd>, right: <UpNextSlot /> }

  return (
    <CanvasLayout header={ins.header} inspector={ins.inspector} flowStyle={ins.inspector ? PANEL_FLOW_STYLE : undefined}>
      <PathBFlow
        intro
        introSelected={ins.selected === 'intro'}
        onIntroClick={() => ins.select('intro')}
        checkSelected={ins.selected === 'check'}
        onCheckClick={() => ins.select('check')}
        split={split}
      />
    </CanvasLayout>
  )
}
