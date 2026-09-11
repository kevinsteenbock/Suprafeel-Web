import { cn } from '@/lib/cn'

type Tone = 'accent' | 'soft' | 'neutral' | 'outline' | 'ok' | 'warn' | 'dark'
const tones: Record<Tone, string> = {
  accent: 'bg-accent text-on-accent',
  soft: 'bg-accent-wash text-accent-deep',
  neutral: 'bg-chrome-deep text-ink-soft',
  outline: 'bg-surface text-faint border border-line',
  ok: 'bg-ok-wash text-ok',
  warn: 'bg-warn-wash text-warn',
  dark: 'bg-ink text-white',
}

export function Avatar({ initials, size = 28, tone = 'neutral', className, rounded = 'md' }: { initials: string; size?: number; tone?: Tone; className?: string; rounded?: 'md' | 'full' }) {
  const fs = size >= 56 ? 22 : size >= 40 ? 14 : size >= 28 ? 11 : 10
  return (
    <span
      style={{ width: size, height: size, fontSize: fs }}
      className={cn('inline-flex items-center justify-center font-semibold shrink-0 select-none', rounded === 'full' ? 'rounded-full' : 'rounded-[7px]', tones[tone], className)}
    >
      {initials}
    </span>
  )
}
