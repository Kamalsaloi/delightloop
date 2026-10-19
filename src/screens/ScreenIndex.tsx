import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui'
import { SCREENS, type ScreenEntry } from './registry'

const GROUPS: ScreenEntry['group'][] = ['Path A', 'Live', 'Paused', 'Path B', 'Variants']

/** Reviewer-only jump list of every screen. Not part of the product. */
export default function ScreenIndex() {
  return (
    <div className="mx-auto max-w-[960px] px-12 py-16">
      <div className="mb-10 flex items-center gap-3">
        <Logo />
        <div>
          <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.02em]">Loop builder prototype</h1>
          <p className="text-[13px] leading-5 text-grey-2">Every screen from the Paper file. Start at Home and click through, or jump in here.</p>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        {GROUPS.map((g) => (
          <section key={g}>
            <h2 className="mb-2 text-[14px] font-semibold leading-5">{g}</h2>
            <div className="overflow-hidden rounded-card bg-white shadow-card">
              {SCREENS.filter((x) => x.group === g).map((x) => {
                const href = x.href ?? x.path
                return (
                  <Link key={x.code} to={href} className="flex items-center gap-4 border-b border-line-soft px-5 py-3 last:border-0 hover:bg-fill-hover">
                    <span className="w-10 shrink-0 text-[13px] font-medium tabular-nums text-grey-3">{x.code}</span>
                    <span className="flex-1 text-[13.5px] font-medium text-ink">{x.name}</span>
                    <span className="font-mono text-[12px] text-grey-3">{href}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
