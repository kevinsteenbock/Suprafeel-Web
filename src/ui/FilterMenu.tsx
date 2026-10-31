import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface MenuOption { key: string; label: string; count?: number; countTone?: 'neutral' | 'danger' }

/**
 * Botón + desplegable de una sola elección (filtro, orden, sección…). Sustituye a la
 * fila de chips: en vez de N botones sueltos, un único botón compacto que abre la lista.
 */
export function FilterMenuButton({ icon, label, value, options, onChange, width = 220, align = 'left', className }: {
  icon?: ReactNode
  label?: string
  value: string
  options: MenuOption[]
  onChange: (key: string) => void
  width?: number
  align?: 'left' | 'right'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', h)
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('mousedown', h); window.removeEventListener('keydown', k) }
  }, [open])

  const current = options.find((o) => o.key === value)

  return (
    <div ref={ref} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn('h-[27px] rounded-[7px] border border-line px-[11px] flex items-center gap-[7px] text-md font-medium text-ink', open ? 'bg-chrome-deep' : 'bg-chrome-deep/70 hover:bg-chrome-deep')}
      >
        {icon}
        {label && <span className="text-muted">{label}</span>}
        <span className="truncate max-w-[140px]">{current?.label ?? value}</span>
        {current?.count !== undefined && (
          <span className={cn('h-4 min-w-4 rounded-full px-1.5 text-[10.5px] font-semibold inline-flex items-center justify-center', current.countTone === 'danger' ? 'bg-danger-wash text-danger' : 'bg-chrome-deep text-ink-soft')}>
            {current.count}
          </span>
        )}
        <ChevronDown size={12} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div style={{ width }} className={cn('absolute top-[33px] z-40 rounded-[10px] bg-surface border border-line shadow-pop py-1.5 overflow-hidden', align === 'right' ? 'right-0' : 'left-0')}>
          <span className={cn('absolute -top-[6px] h-3 w-3 rotate-45 bg-surface border-l border-t border-line', align === 'right' ? 'right-[14px]' : 'left-[14px]')} />
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => { onChange(o.key); setOpen(false) }}
              className="h-[34px] w-full px-3 flex items-center gap-2 text-base text-ink hover:bg-chrome text-left"
            >
              <span className="w-4 shrink-0 flex justify-center">{o.key === value && <Check size={13} strokeWidth={2.5} className="text-accent" />}</span>
              <span className="flex-1 min-w-0 truncate">{o.label}</span>
              {o.count !== undefined && (
                <span className={cn('h-4 min-w-4 rounded-full px-1.5 text-[10.5px] font-semibold inline-flex items-center justify-center', o.countTone === 'danger' ? 'bg-danger-wash text-danger' : 'bg-chrome-deep text-ink-soft')}>
                  {o.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FilterBar({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
      {right && <div className="ml-auto shrink-0 flex items-center gap-2">{right}</div>}
    </div>
  )
}
