import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { SlidersHorizontal, Check, ChevronDown, GripVertical } from 'lucide-react'
import { cn } from '@/lib/cn'

export type VistaMode = 'list' | 'cards'
export type PerRow = 'fit' | 2 | 3 | 4 | 5 | 6

export interface ColumnOption { key: string; label: string }
export interface VistaState {
  mode: VistaMode
  perRow: PerRow
  /** columnas visibles (ausente o true = visible) */
  columns: Record<string, boolean>
  /** orden de las columnas, de izquierda a derecha */
  order: string[]
  /** interruptores sueltos, p. ej. «Ver las etiquetas» */
  extras: Record<string, boolean>
}

export interface VistaInit { mode?: VistaMode; perRow?: PerRow; columns?: ColumnOption[]; extras?: Record<string, boolean> }

export function useVista(init: VistaInit = {}) {
  const initial = useMemo<VistaState>(
    () => ({ mode: init.mode ?? 'cards', perRow: init.perRow ?? 4, columns: {}, order: (init.columns ?? []).map((c) => c.key), extras: init.extras ?? {} }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [vista, setVista] = useState<VistaState>(initial)
  const reset = () => setVista(initial)
  return { vista, setVista, resetVista: reset, initialVista: initial }
}

/** Columnas visibles, ya en el orden elegido */
export function visibleColumns(vista: VistaState) {
  return vista.order.filter((k) => vista.columns[k] !== false)
}

/** Rejilla de tarjetas según «tarjetas por fila» */
export function gridCols(vista: VistaState): CSSProperties {
  return { gridTemplateColumns: vista.perRow === 'fit' ? 'repeat(auto-fill, minmax(236px, 1fr))' : `repeat(${vista.perRow}, minmax(0, 1fr))` }
}

const perRowOptions: { value: PerRow; label: string }[] = [
  { value: 'fit', label: 'Las que quepan' },
  { value: 2, label: '2 por fila' },
  { value: 3, label: '3 por fila' },
  { value: 4, label: '4 por fila' },
  { value: 5, label: '5 por fila' },
  { value: 6, label: '6 por fila' },
]

function Item({ on, label, indent, onClick, right, className }: { on?: boolean; label: ReactNode; indent?: boolean; onClick?: () => void; right?: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn('h-[30px] w-full pr-3 flex items-center gap-2 text-base text-ink hover:bg-chrome text-left', indent ? 'pl-9' : 'pl-3', className)}>
      {!indent && <span className="w-4 shrink-0 flex justify-center">{on && <Check size={13} strokeWidth={2.5} className="text-ink" />}</span>}
      {indent && on && <Check size={13} strokeWidth={2.5} className="text-ink -ml-[22px] mr-[9px] shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {right}
    </button>
  )
}

function GroupHeader({ label, open, onToggle, right }: { label: string; open: boolean; onToggle: () => void; right?: ReactNode }) {
  return (
    <div className="h-[30px] pl-3 pr-3 flex items-center gap-2">
      <button type="button" onClick={onToggle} className="w-4 shrink-0 flex justify-center text-ink-soft">
        <ChevronDown size={13} strokeWidth={2.2} className={cn('transition-transform', !open && '-rotate-90')} />
      </button>
      <button type="button" onClick={onToggle} className="flex-1 text-left text-base text-ink">{label}</button>
      {right}
    </div>
  )
}

/**
 * Control «Vista»: formato de la lista, tarjetas por fila y qué columnas se ven
 * y en qué orden (se arrastran por el asa de la derecha).
 */
export function VistaButton({ vista, onChange, onReset, columns, extra }: {
  vista: VistaState
  onChange: (v: VistaState) => void
  onReset?: () => void
  columns?: ColumnOption[]
  extra?: ColumnOption
}) {
  const [open, setOpen] = useState(false)
  const [showCards, setShowCards] = useState(true)
  const [showCols, setShowCols] = useState(true)
  const [drag, setDrag] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', h)
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('mousedown', h); window.removeEventListener('keydown', k) }
  }, [open])

  const ordered = (columns ?? []).slice().sort((a, b) => vista.order.indexOf(a.key) - vista.order.indexOf(b.key))
  const allOn = ordered.every((c) => vista.columns[c.key] !== false)

  const move = (from: string, to: string) => {
    if (from === to) return
    const next = vista.order.filter((k) => k !== from)
    next.splice(next.indexOf(to), 0, from)
    onChange({ ...vista, order: next })
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn('h-[27px] rounded-[7px] border border-line px-[11px] flex items-center gap-[7px] text-md font-medium text-ink', open ? 'bg-chrome-deep' : 'bg-chrome-deep/70 hover:bg-chrome-deep')}
      >
        <SlidersHorizontal size={13} strokeWidth={1.8} />
        Vista
      </button>

      {open && (
        <div className="absolute right-0 top-[33px] z-40 w-[256px] rounded-[10px] bg-surface border border-line shadow-pop py-1.5 overflow-hidden">
          <span className="absolute -top-[6px] right-[14px] h-3 w-3 rotate-45 bg-surface border-l border-t border-line" />

          <Item on={vista.mode === 'list'} label="Lista" onClick={() => onChange({ ...vista, mode: 'list' })} />

          <div className="h-px bg-line-soft my-1.5" />

          <GroupHeader label="Tarjetas por fila" open={showCards} onToggle={() => setShowCards((s) => !s)} />
          {showCards && perRowOptions.map((o) => (
            <Item key={String(o.value)} indent on={vista.mode === 'cards' && vista.perRow === o.value} label={o.label} onClick={() => onChange({ ...vista, mode: 'cards', perRow: o.value })} />
          ))}

          {extra && (
            <Item on={vista.extras[extra.key] !== false} label={extra.label} onClick={() => onChange({ ...vista, extras: { ...vista.extras, [extra.key]: vista.extras[extra.key] === false } })} />
          )}

          {ordered.length > 0 && (
            <>
              <div className="h-px bg-line-soft my-1.5" />
              <GroupHeader
                label="Columnas"
                open={showCols}
                onToggle={() => setShowCols((s) => !s)}
                right={
                  <button
                    type="button"
                    onClick={() => onChange({ ...vista, columns: Object.fromEntries(ordered.map((c) => [c.key, !allOn])) })}
                    className="text-md text-faint hover:text-ink"
                  >
                    {allOn ? 'Ninguna' : 'Todo'}
                  </button>
                }
              />
              {showCols && ordered.map((c) => {
                const on = vista.columns[c.key] !== false
                return (
                  <div
                    key={c.key}
                    onDragOver={(e) => { e.preventDefault(); if (drag) move(drag, c.key) }}
                    className={cn('flex items-center', drag === c.key && 'opacity-40')}
                  >
                    <Item
                      indent
                      on={on}
                      label={c.label}
                      onClick={() => onChange({ ...vista, columns: { ...vista.columns, [c.key]: !on } })}
                      className="pr-1"
                    />
                    <span
                      draggable
                      onDragStart={() => setDrag(c.key)}
                      onDragEnd={() => setDrag(null)}
                      title="Arrastra para cambiar el orden"
                      className="h-[30px] w-7 -ml-1 shrink-0 flex items-center justify-center text-faint hover:text-ink cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical size={13} />
                    </span>
                  </div>
                )
              })}
            </>
          )}

          {onReset && (
            <>
              <div className="h-px bg-line-soft my-1.5" />
              <Item label="Volver a como venía" onClick={() => { onReset(); setOpen(false) }} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
