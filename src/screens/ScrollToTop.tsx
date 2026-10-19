import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** Scroll to top on route change; press "\" anywhere to open the screen index. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, [contenteditable="true"]')) return
      if (e.key === '\\') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return null
}
