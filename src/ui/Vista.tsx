import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, Check, LayoutList, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/cn'

export type VistaMode = 'list' | 'cards'
export interface VistaState { mode: VistaMode; perRow: 2 | 3 | 4; columns: Record<string, boolean> }

export function useVista(initial: Partial<VistaState> = {}) {
  const [vista, setVista] = useState<VistaState>({ mode: 'cards', perRow: 4, columns: {}, ...initial })
  return { vista, setVista }
}

/** Control "Vista": icono + palabra, a la altura de los chips. Abre un menú de formato. */
export function VistaButton({ vista, onChange, columns }: { vista: VistaState; onChange: (v: VistaState) => void; columns?: { key: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [open])

  const Row = ({ on, label, onClick, icon }: { on: boolean; label: string; onClick: () => void; icon?: React.ReactNode }) => (
    <button onClick={onClick} className="h-8 px-3 flex items-center gap-2 text-base text-ink hover:bg-chrome w-full text-left">
      <span className="w-4 flex justify-center">{on && <Check size={13} className="text-accent" strokeWidth={2.5} />}</span>
      {icon}
      {label}
    </button>
  )

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn('h-[27px] rounded-[7px] border border-line px-[11px] flex items-center gap-[7px] text-md font-medium text-ink', open ? 'bg-chrome-deep' : 'bg-chrome-deep/70 hover:bg-chrome-deep')}
      >
        <SlidersHorizontal size={13} strokeWidth={1.8} />
        Vista
      </button>
      {open && (
        <div className="absolute right-0 top-[33px] z-40 w-[232px] rounded-lg bg-surface border border-line shadow-pop py-1.5 overflow-hidden">
          <div className="px-3 h-6 flex items-center label-faint">Formato</div>
          <Row on={vista.mode === 'list'} label="Lista" icon={<LayoutList size={14} className="text-muted" />} onClick={() => onChange({ ...vista, mode: 'list' })} />
          <Row on={vista.mode === 'cards'} label="Tarjetas" icon={<LayoutGrid size={14} className="text-muted" />} onClick={() => onChange({ ...vista, mode: 'cards' })} />
          {vista.mode === 'cards' && (
            <>
              <div className="h-px bg-line-soft my-1.5" />
              <div className="px-3 h-6 flex items-center label-faint">Tarjetas por fila</div>
              <div className="px-3 pb-1 flex gap-1.5">
                {([2, 3, 4] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => onChange({ ...vista, perRow: n })}
                    className={cn('flex-1 h-7 rounded-[6px] text-base font-medium border', vista.perRow === n ? 'bg-accent text-on-accent border-accent' : 'border-line text-ink-soft hover:bg-chrome')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}
          {columns && columns.length > 0 && (
            <>
              <div className="h-px bg-line-soft my-1.5" />
              <div className="px-3 h-6 flex items-center label-faint">Columnas</div>
              {columns.map((c) => (
                <Row
                  key={c.key}
                  on={vista.columns[c.key] !== false}
                  label={c.label}
                  onClick={() => onChange({ ...vista, columns: { ...vista.columns, [c.key]: vista.columns[c.key] === false } })}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
