import { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SCREENS } from './screens/registry'
import ScreenIndex from './screens/ScreenIndex'
import { ScrollToTop } from './screens/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<ScreenIndex />} />
          {SCREENS.filter((x) => x.path && x.Component).map(({ path, Component }) => {
            const C = Component!
            return <Route key={path} path={path} element={<C />} />
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
