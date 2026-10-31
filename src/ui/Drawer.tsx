import { useEffect, useId, type CSSProperties, type ReactNode } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface DrawerTab { key: string; label: ReactNode }

/**
 * Panel de detalle, alta o edición. Se abre como ventana centrada sobre la página (pop-up), con velo
 * oscuro detrás: nada se abre como cajón lateral (lo pidió Kevin; solo el menú del móvil sale de lado).
 * Mismo contenido, mismas pestañas y mismo pie de siempre; `width` es el ancho de la ventana.
 */
export function Drawer({
  open, onClose, onBack, title, subtitle, badge, width = 472, tabs, activeTab, onTab, footer, children, bodyClass, headerRight,
}: {
  open: boolean
  onClose: () => void
  onBack?: () => void
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  width?: number
  tabs?: DrawerTab[]
  activeTab?: string
  onTab?: (k: string) => void
  footer?: ReactNode
  children: ReactNode
  bodyClass?: string
  headerRight?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const tituloId = useId()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-modal="true" aria-labelledby={tituloId} style={{ '--dw-w': `${width}px` } as CSSProperties} className="w-full sm:w-[var(--dw-w)] max-w-full sm:max-w-[92vw] max-h-[calc(100dvh-32px)] sm:max-h-[86vh] shrink-0 bg-canvas border border-line rounded-xl overflow-hidden shadow-drawer flex flex-col animate-[drawer_.18s_ease-out]">
        <header className="h-[62px] shrink-0 px-5 bg-chrome border-b border-line flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-ink-soft hover:text-ink -ml-1" aria-label="Atrás">
              <ChevronLeft size={16} />
            </button>
          )}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2 min-w-0">
              <span id={tituloId} className="text-lg font-semibold tracking-[-0.01em] text-ink truncate">{title}</span>
              {badge}
            </div>
            {subtitle && <span className="text-[11.5px] text-muted mt-[2px] truncate">{subtitle}</span>}
          </div>
          {headerRight}
          <button onClick={onClose} aria-label="Cerrar" className="h-[26px] w-[26px] rounded-full bg-chrome-deep flex items-center justify-center text-ink-soft hover:bg-line">
            <X size={12} strokeWidth={2.4} />
          </button>
        </header>
        {tabs && (
          <nav className="h-[42px] shrink-0 px-5 gap-5 border-b border-line flex items-end overflow-x-auto no-scrollbar scroll-hint">
            {tabs.map((t) => {
              const on = t.key === activeTab
              return (
                <button
                  key={t.key}
                  onClick={() => onTab?.(t.key)}
                  className={cn('h-[41px] pb-[2px] flex items-center text-md font-medium border-b-2 -mb-px', on ? 'text-accent font-semibold border-accent' : 'text-muted border-transparent hover:text-ink')}
                >
                  {t.label}
                </button>
              )
            })}
          </nav>
        )}
        <div className={cn('flex-1 min-h-0 overflow-y-auto p-5 flex flex-col', bodyClass)}>{children}</div>
        {footer && <footer className="h-[62px] shrink-0 px-5 bg-chrome border-t border-line flex items-center justify-between gap-3">{footer}</footer>}
      </aside>
      <style>{`@keyframes drawer{from{transform:translateY(8px) scale(.98);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  )
}
