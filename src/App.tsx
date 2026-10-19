import { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SCREENS } from './screens/registry'
import { ScrollToTop } from './screens/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          {SCREENS.filter((x) => x.path && x.Component).map(({ path, Component }) => {
            const C = Component!
            return <Route key={path} path={path} element={<C />} />
          })}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
