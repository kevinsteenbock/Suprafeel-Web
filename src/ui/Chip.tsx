import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Chip({
  active,
  children,
  count,
  countTone = 'neutral',
  onClick,
  className,
  icon,
}: {
  active?: boolean
  children: ReactNode
  count?: number | string
  countTone?: 'neutral' | 'danger'
  onClick?: () => void
  className?: string
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-[27px] rounded-full px-[13px] text-md inline-flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0',
        active
          ? 'bg-accent text-on-accent font-semibold'
          : 'bg-surface text-ink-soft border border-line font-medium hover:bg-chrome',
        className,
      )}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'h-4 min-w-4 rounded-full px-1.5 text-[10.5px] font-semibold inline-flex items-center justify-center',
            active
              ? 'bg-white/25 text-on-accent'
              : countTone === 'danger'
                ? 'bg-danger-wash text-danger'
                : 'bg-chrome-deep text-ink-soft',
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

export function ChipRow({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  )
}
