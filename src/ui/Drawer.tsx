import { useEffect, useId, type CSSProperties, type ReactNode } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface DrawerTab { key: string; label: ReactNode }

/**
 * Panel de detalle, alta o edición. Se abre como ventana centrada sobre la página (pop-up), con velo
 * oscuro detrás: nada se abre como cajón lateral (lo pidió Kevin; solo el menú del móvil sale de lado).
 * Mismo contenido, mismas pestañas y mismo pie de siempre; `width` es el ancho de la ventana.
 *
 * En el móvil y la tableta el título y el subtítulo bajan a dos líneas en vez de cortarse con «…».
 *
 * El cuerpo hace scroll y sus hijos directos no encogen (si encogieran, una tira de pestañas o una tabla
 * con overflow se quedaría en 1 px). `bodyClass` con relleno propio (p-0, px-4…) sustituye al p-5 de
 * serie en vez de sumarse.
 */
/** ¿Trae `bodyClass` su propio relleno? (p-0, px-4, pt-6, lg:p-8…) Entonces no se pone el p-5 de serie. */
const conRelleno = (c?: string) => !!c && /(^|\s)([a-z0-9-]+:)*p[xytrblse]?-/.test(c)

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
        <header className="min-h-[62px] lg:h-[62px] shrink-0 px-5 py-2 lg:py-0 bg-chrome border-b border-line flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="h-9 w-9 -ml-[14px] -mr-2.5 shrink-0 inline-flex items-center justify-center text-ink-soft hover:text-ink" aria-label="Atrás">
              <ChevronLeft size={16} />
            </button>
          )}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2 min-w-0">
              <span id={tituloId} className="text-lg font-semibold tracking-[-0.01em] text-ink lg:truncate max-lg:line-clamp-2 max-lg:break-words">{title}</span>
              {badge}
            </div>
            {subtitle && <span className="text-[11.5px] text-muted mt-[2px] lg:truncate max-lg:line-clamp-2 max-lg:break-words">{subtitle}</span>}
          </div>
          {headerRight}
          <button onClick={onClose} aria-label="Cerrar" className="h-9 w-9 lg:h-[26px] lg:w-[26px] shrink-0 rounded-full bg-chrome-deep flex items-center justify-center text-ink-soft hover:bg-line">
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
                  className={cn('h-[41px] pb-[2px] shrink-0 whitespace-nowrap flex items-center text-md font-medium border-b-2 -mb-px', on ? 'text-accent font-semibold border-accent' : 'text-muted border-transparent hover:text-ink')}
                >
                  {t.label}
                </button>
              )
            })}
          </nav>
        )}
        <div className={cn('flex-1 min-h-0 overflow-y-auto flex flex-col [&>*]:shrink-0', !conRelleno(bodyClass) && 'p-5', bodyClass)}>{children}</div>
        {footer && <footer className="min-h-[62px] sm:h-[62px] shrink-0 px-4 sm:px-5 py-2.5 sm:py-0 bg-chrome border-t border-line flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-3 gap-y-2">{footer}</footer>}
      </aside>
      <style>{`@keyframes drawer{from{transform:translateY(8px) scale(.98);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  )
}
