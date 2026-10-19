import { Link } from 'react-router-dom'
import { Avatar, Icon, Logo } from '@/components/ui'
import { FACE } from '@/lib/assets'
import { cn } from '@/lib/cn'

const NAV = ['Campaigns', 'Audiences', 'Gift gallery', 'Reports'] as const

/** Top app bar for non-builder pages (Home). */
export function AppHeader({ active = 'Campaigns' }: { active?: (typeof NAV)[number] }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-12">
      <div className="flex items-center gap-8">
        <Link to="/home" className="flex items-center gap-2">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item}
              to="/home"
              className={cn(
                'rounded-[8px] px-3 py-2 text-[13.5px] leading-4',
                item === active ? 'bg-fill font-semibold text-ink' : 'font-medium text-grey-2 hover:text-ink',
              )}
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex h-10 w-60 shrink-0 items-center gap-2 rounded-[10px] bg-page px-3">
          <Icon name="search" size={15} color="#8B8D95" />
          <input
            placeholder="Search campaigns"
            className="w-full bg-transparent text-[13px] leading-4 text-ink outline-none placeholder:text-grey-3"
          />
        </label>
        <Avatar id={FACE.priya} size={32} />
      </div>
    </header>
  )
}
