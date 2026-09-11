import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'ok' | 'warn' | 'danger' | 'neutral' | 'accent' | 'solid' | 'solid-danger' | 'dark' | 'outline'

const tones: Record<Tone, string> = {
  ok: 'bg-ok-wash text-ok',
  warn: 'bg-warn-wash text-warn',
  danger: 'bg-danger-wash text-danger',
  neutral: 'bg-chrome-deep text-ink-soft',
  accent: 'bg-accent-wash text-accent-deep',
  solid: 'bg-accent text-on-accent',
  'solid-danger': 'bg-danger text-on-accent',
  dark: 'bg-ink text-white',
  outline: 'bg-surface text-ink-soft border border-line',
}

export function Badge({ tone = 'neutral', children, className, size = 'md' }: { tone?: Tone; children: ReactNode; className?: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[5px] font-medium whitespace-nowrap shrink-0',
        size === 'md' ? 'h-5 px-2 text-xs' : 'h-[17px] px-1.5 text-[10px] font-semibold tracking-[0.04em] uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Etiqueta en mayúsculas sobre las tarjetas (NOVEDAD, EN CURSO…) */
export function Tag({ tone = 'accent', children, className }: { tone?: 'accent' | 'dark' | 'neutral' | 'glass' | 'muted'; children: ReactNode; className?: string }) {
  const t = {
    accent: 'bg-accent text-on-accent',
    dark: 'bg-ink text-white',
    neutral: 'bg-chrome-deep text-ink-soft',
    glass: 'bg-white/25 text-white backdrop-blur',
    muted: 'bg-chrome-deep/80 text-muted',
  }[tone]
  return (
    <span className={cn('inline-flex h-[19px] items-center rounded-full px-[9px] text-[10px] font-semibold tracking-[0.08em] uppercase', t, className)}>
      {children}
    </span>
  )
}
