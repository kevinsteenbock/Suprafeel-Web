import { cn } from '@/lib/cn'

export function Toggle({ on, onChange, disabled, size = 'md' }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean; size?: 'sm' | 'md' }) {
  const dims = size === 'md' ? 'h-[23px] w-10 p-[2px]' : 'h-[22px] w-[38px] p-[2px]'
  const knob = size === 'md' ? 'h-[19px] w-[19px]' : 'h-[18px] w-[18px]'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={cn(
        'rounded-full flex items-center shrink-0 transition-colors',
        dims,
        on ? 'bg-accent justify-end' : 'bg-chrome-deep justify-start',
        disabled && 'opacity-60 cursor-default',
      )}
    >
      <span className={cn('rounded-full bg-surface shadow-[0_1px_2px_rgba(26,25,24,0.24)]', knob)} />
    </button>
  )
}
