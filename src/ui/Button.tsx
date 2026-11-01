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
// Alto de cada tamaño. En pantallas táctiles (móvil y tableta, por debajo de 1024 px), 32-36 px:
// 26-30 px es poco para el dedo. En escritorio, el de siempre.
const heights: Record<Size, string> = {
  sm: 'h-[26px] max-lg:h-8',
  md: 'h-[28px] max-lg:h-8',
  lg: 'h-[30px] max-lg:h-9',
}
const sizes: Record<Size, string> = {
  sm: 'px-[11px] text-sm',
  md: 'px-[13px] text-base',
  lg: 'px-4 text-base',
}
/**
 * Botones con alto propio (h-10, h-11…): en escritorio el alto del tamaño le ganaba (el arbitrario va
 * después en el CSS) y así se queda, para no mover nada. Por debajo de 1024 px manda el alto propio.
 */
const altosEscritorio: Record<Size, string> = { sm: 'lg:h-[26px]', md: 'lg:h-[28px]', lg: 'lg:h-[30px]' }
const conAlto = (c?: string) => !!c && /(^|[\s:])h-/.test(c)

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
        variant === 'link' ? '' : cn(sizes[size], conAlto(className) ? altosEscritorio[size] : heights[size]),
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
