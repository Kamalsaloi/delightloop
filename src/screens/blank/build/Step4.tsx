import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasLayout } from '@/components/canvas'
import { GIFT } from '@/lib/assets'
import { useBlankInspector } from '@/screens/blank/config/useBlankInspector'
import {
  ConnectCard,
  ItemIcon,
  PANEL_FLOW_STYLE,
  PathBFlow,
  SlotAdd,
  StepMenu,
  SuggestIcon,
  TIMING_AFTER_EMAIL,
  type MenuContent,
  type MenuTab,
} from './shared'

// B4 · Opened branch has LinkedIn; the picker opens under the Not opened branch. Any pick → B5.
const CONTENT: Record<MenuTab, MenuContent> = {
  reach: {
    suggestLabel: 'Gifty suggests for people who don’t open',
    suggest: {
      icon: SuggestIcon.gmail(),
      title: 'Bump the same thread',
      subtitle: 'Lands on top of the first email',
      rows: [{ label: 'Sends', choices: [{ label: 'Day 2' }, { label: 'Day 3' }, { label: 'Different time' }] }],
    },
    groups: [
      {
        title: 'LinkedIn',
        items: [
          { id: 'connect', label: 'Connection request', hint: 'Try another channel', icon: ItemIcon.linkedin() },
          { id: 'view', label: 'View their profile', hint: 'Shows on their phone', icon: ItemIcon.linkedin() },
        ],
      },
      { title: 'Email', items: [{ id: 'new-email', label: 'New email', hint: 'Fresh subject line', icon: ItemIcon.gmail() }] },
      {
        title: 'Mail and gifts',
        items: [
          { id: 'postcard', label: 'Postcard', hint: 'Skips the inbox', icon: ItemIcon.image(GIFT.postcard) },
          { id: 'gift', label: 'Send a gift', hint: 'Too early for them', icon: ItemIcon.image(GIFT.g1), disabled: true },
        ],
      },
    ],
  },
  timing: { groups: TIMING_AFTER_EMAIL },
}

export default function Step4() {
  const navigate = useNavigate()
  const ins = useBlankInspector()
  const [open, setOpen] = useState(true)

  function openMenu() {
    ins.close()
    setOpen(true)
  }

  const menu = open && !ins.menuHidden && (
    <StepMenu
      content={CONTENT}
      onPick={() => navigate('/blank/build/5')}
      onClose={() => setOpen(false)}
      className="absolute"
      style={{ left: -44, top: 130 }}
    />
  )

  // Flow scrolled up 240px so the branch and menu fit (Paper B4 / B3a).
  const flowStyle = ins.inspector ? { top: -240, ...PANEL_FLOW_STYLE } : { top: -240 }

  return (
    <CanvasLayout header={ins.header} inspector={ins.inspector} flowStyle={flowStyle}>
      <PathBFlow
        intro
        introSelected={ins.selected === 'intro'}
        onIntroClick={() => ins.select('intro')}
        checkSelected={ins.selected === 'check'}
        onCheckClick={() => ins.select('check')}
        split={{
          left: <ConnectCard selected={ins.selected === 'linkedin'} onClick={() => ins.select('linkedin')} />,
          right: <SlotAdd onAdd={openMenu}>{menu}</SlotAdd>,
        }}
      />
    </CanvasLayout>
  )
}
