import type { ReactNode } from 'react'
import { ChevronsUpDown, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Field({ label, required, hint, right, children, className, labelClass = 'text-sm text-ink-soft' }: {
  label?: ReactNode; required?: boolean; hint?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; labelClass?: string
}) {
  return (
    <div className={cn('flex flex-col gap-[5px] min-w-0', className)}>
      {(label || right) && (
        <div className="flex items-center justify-between">
          <span className={labelClass}>
            {label}
            {required && <span className="text-accent"> *</span>}
          </span>
          {right}
        </div>
      )}
      {children}
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  )
}

export function Input({ value, placeholder, focus, right, left, readOnly = true, onChange, className, mono, size = 'md' }: {
  value?: string; placeholder?: string; focus?: boolean; right?: ReactNode; left?: ReactNode; readOnly?: boolean; onChange?: (v: string) => void; className?: string; mono?: boolean; size?: 'sm' | 'md'
}) {
  return (
    <div className={cn('field gap-2', size === 'sm' && 'h-[30px] rounded-[7px]', focus && 'is-focus', className)}>
      {left}
      <input
        className={cn('flex-1 min-w-0 bg-transparent text-base text-ink', mono && 'font-mono')}
        value={value ?? ''}
        placeholder={placeholder}
        readOnly={readOnly && !onChange}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {right}
    </div>
  )
}

export function Textarea({ value, placeholder, rows = 4, focus, onChange, className, dashed }: {
  value?: string; placeholder?: string; rows?: number; focus?: boolean; onChange?: (v: string) => void; className?: string; dashed?: boolean
}) {
  return (
    <div className={cn('rounded-md bg-surface border border-line p-[10px]', dashed && 'border-dashed bg-canvas', focus && 'border-accent shadow-focus', className)}>
      <textarea
        rows={rows}
        className="w-full resize-none bg-transparent text-base leading-[19px] text-ink block"
        value={value ?? ''}
        placeholder={placeholder}
        readOnly={!onChange}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}

export function Select({ value, className, size = 'md', muted, chevron = 'updown' }: { value: ReactNode; className?: string; size?: 'sm' | 'md'; muted?: boolean; chevron?: 'updown' | 'down' }) {
  return (
    <div className={cn('field justify-between gap-2 cursor-default', size === 'sm' && 'h-[30px] rounded-[7px]', className)}>
      <span className={cn('text-base truncate', muted ? 'text-faint' : 'text-ink')}>{value}</span>
      {chevron === 'updown' ? <ChevronsUpDown size={12} className="text-muted shrink-0" /> : <ChevronDown size={13} className="text-muted shrink-0" />}
    </div>
  )
}

export function Segmented({ options, value, onChange, className }: { options: string[]; value: string; onChange?: (v: string) => void; className?: string }) {
  return (
    <div className={cn('h-[34px] rounded-md bg-surface border border-line p-[3px] flex', className)}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange?.(o)}
          className={cn('flex-1 rounded-[6px] text-base font-medium px-3', o === value ? 'bg-accent text-on-accent' : 'text-ink-soft hover:bg-chrome')}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export function Radio({ on }: { on?: boolean }) {
  return on ? (
    <span className="h-4 w-4 rounded-full border-[5px] border-accent bg-surface shrink-0" />
  ) : (
    <span className="h-4 w-4 rounded-full border border-line bg-surface shrink-0" />
  )
}

export function Checkbox({ on }: { on?: boolean }) {
  return on ? (
    <span className="h-4 w-4 rounded-[4px] bg-accent inline-flex items-center justify-center shrink-0">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FBF7F5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  ) : (
    <span className="h-4 w-4 rounded-[4px] border border-line bg-surface shrink-0" />
  )
}
