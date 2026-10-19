import { useEffect, useRef, useState } from 'react'
import type { FlowNode } from '@/store/types'

/** A step whose required copy is still empty: shows "Needs copy" and blocks launch. */
export function needsCopy(n: FlowNode): boolean {
  if (n.kind !== 'step') return false
  switch (n.type) {
    case 'email':
      return !n.data.subject.trim() || !n.data.body.trim()
    case 'bump':
      return !n.data.body.trim()
    case 'linkedin':
      return n.data.noteMode === 'note' && !n.data.note.trim()
    case 'postcard':
      return !n.data.note.trim()
    case 'gift':
      return n.data.noteOn && !n.data.note.trim()
    default:
      return false
  }
}

/**
 * Gifty "writing" text into a field: calls `write` with a growing prefix until done.
 * `start(text, write)` begins; `busy` is true meanwhile. Cancels on unmount.
 */
export function useGiftyTyping(cps = 90) {
  const [busy, setBusy] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearInterval(timer.current), [])

  function start(text: string, write: (partial: string) => void, done?: () => void) {
    window.clearInterval(timer.current)
    setBusy(true)
    let i = 0
    const step = Math.max(1, Math.round(cps / 30))
    // A short "thinking" beat before the words appear.
    write('')
    window.setTimeout(() => {
      timer.current = window.setInterval(() => {
        i = Math.min(text.length, i + step)
        write(text.slice(0, i))
        if (i >= text.length) {
          window.clearInterval(timer.current)
          setBusy(false)
          done?.()
        }
      }, 1000 / 30)
    }, 350)
  }
  return { busy, start }
}
