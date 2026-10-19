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
    return () => window.clearInterval(id)
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
