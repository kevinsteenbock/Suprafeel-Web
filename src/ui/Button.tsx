import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'dark' | 'link'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent font-semibold hover:bg-accent-deep',
  secondary: 'bg-surface text-ink border border-line hover:bg-chrome',
  soft: 'bg-accent-wash text-accent-deep font-semibold hover:bg-accent-line',
  ghost: 'text-ink-soft hover:bg-chrome',
  danger: 'bg-danger-wash text-danger font-medium hover:bg-danger-line',
  dark: 'bg-[#242220] text-[#F4F2EF] font-medium hover:bg-ink',
  link: 'text-accent font-medium px-0 h-auto hover:text-accent-deep',
}
const sizes: Record<Size, string> = {
  sm: 'h-[26px] px-[11px] text-sm',
  md: 'h-[28px] px-[13px] text-base',
  lg: 'h-[30px] px-4 text-base',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', icon, iconRight, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[7px] whitespace-nowrap select-none transition-colors disabled:opacity-50 disabled:pointer-events-none shrink-0',
        variant === 'link' ? '' : sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}
