import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function TableCard({ children, footer, footerRight, className }: { children: ReactNode; footer?: ReactNode; footerRight?: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col', className)}>
      {children}
      {(footer || footerRight) && (
        <div className="h-[46px] px-4 bg-chrome flex items-center justify-between mt-auto">
          <span className="text-sm text-muted">{footer}</span>
          {footerRight && <span className="text-sm font-medium text-accent">{footerRight}</span>}
        </div>
      )}
    </div>
  )
}

export function THead({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('h-8 px-4 gap-[14px] bg-chrome border-b border-line flex items-center', className)}>{children}</div>
}

export function Th({ children, className, align = 'left' }: { children?: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <span className={cn('label truncate', align === 'right' && 'text-right', align === 'center' && 'text-center', className)}>{children}</span>
  )
}

export function Tr({ children, className, onClick, active, tone, height = 54, last }: {
  children: ReactNode; className?: string; onClick?: () => void; active?: boolean; tone?: 'accent' | 'danger'; height?: number; last?: boolean
}) {
  return (
    <div
      style={{ height }}
      onClick={onClick}
      className={cn(
        'px-4 gap-[14px] flex items-center shrink-0',
        !last && 'border-b border-line-soft',
        onClick && 'cursor-pointer hover:bg-canvas',
        active && 'bg-accent-wash border-accent-line',
        tone === 'danger' && 'bg-danger-wash',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Td({ children, className, align = 'left' }: { children?: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <span className={cn('text-md text-ink-soft truncate', align === 'right' && 'text-right', align === 'center' && 'text-center', className)}>{children}</span>
  )
}

/** Celda principal: nombre + meta */
export function TdMain({ title, meta, avatar, className, metaTone }: { title: ReactNode; meta?: ReactNode; avatar?: ReactNode; className?: string; metaTone?: 'faint' | 'accent' | 'warn' | 'danger' }) {
  const mt = { faint: 'text-faint', accent: 'text-accent-deep', warn: 'text-warn', danger: 'text-danger' }[metaTone ?? 'faint']
  return (
    <div className={cn('flex-1 min-w-0 flex items-center gap-3', className)}>
      {avatar}
      <div className="flex flex-col min-w-0">
        <span className="text-base font-medium text-ink truncate">{title}</span>
        {meta && <span className={cn('text-xs mt-[2px] truncate', mt)}>{meta}</span>}
      </div>
    </div>
  )
}

export function Bar({ value, tone = 'ok', width = 54, className }: { value: number; tone?: 'ok' | 'warn' | 'accent' | 'danger' | 'ink'; width?: number; className?: string }) {
  const fill = { ok: 'bg-ok', warn: 'bg-warn', accent: 'bg-accent', danger: 'bg-danger', ink: 'bg-ink' }[tone]
  return (
    <span style={{ width }} className={cn('h-[5px] rounded-[3px] bg-chrome-deep inline-flex overflow-hidden shrink-0', className)}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} className={cn('h-full rounded-[3px]', fill)} />
    </span>
  )
}
