import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/shell'
import Home from '@/pages/home/Home'
import LoopRoute from '@/pages/loop/LoopRoute'
import { useStore } from '@/store/store'

/** Drives the demo clock and the simulated approvals while the app is open. */
function useSimulation() {
  useEffect(() => {
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = Math.min(1000, now - last)
      last = now
      const s = useStore.getState()
      s.tick(dt)
      s.resolvePending(false)
    }, 250)
    // Demo shortcuts (also in the avatar menu): ⌥⇧R approvals, ⌥⇧D skip a day, ⌥⇧E end this loop, ⌥⇧1/2/3 speed.
    function onKey(e: KeyboardEvent) {
      if (!e.altKey || !e.shiftKey) return
      const s = useStore.getState()
      const loopId = window.location.pathname.match(/^\/loops\/([^/]+)/)?.[1]
      const speeds: Record<string, number> = { Digit1: 1, Digit2: 4, Digit3: 10 }
      if (e.code === 'KeyR') s.resolvePending(true)
      else if (e.code === 'KeyD') s.skipDay()
      else if (e.code === 'KeyE' && loopId) s.endNow(loopId)
      else if (speeds[e.code]) {
        s.setSpeed(speeds[e.code])
        s.toast(`Demo speed ${speeds[e.code]}×`)
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [])
}

export default function App() {
  useSimulation()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loops/:id/:section" element={<LoopRoute />} />
        <Route path="/loops/:id" element={<LoopRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
