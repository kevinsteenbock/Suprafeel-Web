import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl bg-surface border border-line shadow-card', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({ title, right, className }: { title: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('h-[34px] px-[14px] flex items-center justify-between bg-chrome border-b border-line-soft rounded-t-xl', className)}>
      <span className="label">{title}</span>
      {right}
    </div>
  )
}

export function SoftCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-xl bg-chrome border border-line', className)}>{children}</div>
}

/** Fila de "Ajustes" estilo macOS: etiqueta a la izquierda, valor / control a la derecha */
export function Row({ label, hint, children, className, height = 46, last }: { label: ReactNode; hint?: ReactNode; children?: ReactNode; className?: string; height?: number; last?: boolean }) {
  return (
    <div style={{ minHeight: height }} className={cn('px-[14px] flex items-center justify-between gap-4', !last && 'border-b border-line-soft', className)}>
      <div className="flex flex-col py-2">
        <span className="text-base font-medium text-ink">{label}</span>
        {hint && <span className="text-xs text-faint mt-[1px]">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
