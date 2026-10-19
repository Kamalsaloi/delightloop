import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<ButtonVariant, string> = {
  // One primary per screen.
  primary: 'bg-violet text-white shadow-primary hover:bg-[#5A4EF0] active:bg-[#5145E8]',
  secondary: 'bg-white text-ink border border-line-strong shadow-secondary hover:bg-fill-hover',
  soft: 'bg-fill text-ink hover:bg-[#ECECE9]',
  ghost: 'text-ink hover:bg-fill',
  link: 'text-violet-link hover:underline underline-offset-2 !p-0 !h-auto',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 gap-1.5 rounded-[8px] text-[13px]',
  md: 'h-10 px-4 gap-[7px] rounded-[10px] text-[13px]',
  lg: 'h-11 px-5 gap-2 rounded-[12px] text-[14px]',
}

type Common = {
  variant?: ButtonVariant
  size?: ButtonSize
  leading?: ReactNode
  trailing?: ReactNode
  className?: string
  children?: ReactNode
}

function classes(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium leading-4 transition-colors select-none',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50',
    'disabled:opacity-50 disabled:pointer-events-none',
    SIZE[size],
    VARIANT[variant],
    className,
  )
}

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', leading, trailing, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={classes(variant, size, className)} {...rest}>
      {leading}
      {children}
      {trailing}
    </button>
  )
})

/** Same look as Button, navigates with react-router. */
export function ButtonLink({
  to,
  variant = 'secondary',
  size = 'md',
  leading,
  trailing,
  className,
  children,
  onClick,
}: Common & { to: string; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} className={classes(variant, size, className)}>
      {leading}
      {children}
      {trailing}
    </Link>
  )
}
