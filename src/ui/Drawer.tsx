import { useEffect, type ReactNode } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface DrawerTab { key: string; label: ReactNode }

/**
 * Panel lateral: flota sobre la página sin recolocar nada, ocupa todo el alto,
 * pegado al borde derecho, con velo oscuro detrás.
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

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside style={{ width }} className="h-full shrink-0 bg-canvas border-l border-line shadow-drawer flex flex-col animate-[drawer_.22s_ease-out]">
        <header className="h-[62px] shrink-0 px-5 bg-chrome border-b border-line flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-ink-soft hover:text-ink -ml-1" aria-label="Atrás">
              <ChevronLeft size={16} />
            </button>
          )}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg font-semibold tracking-[-0.01em] text-ink truncate">{title}</span>
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
          <nav className="h-[42px] shrink-0 px-5 gap-5 border-b border-line flex items-end">
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
        <div className={cn('flex-1 overflow-y-auto p-5 flex flex-col', bodyClass)}>{children}</div>
        {footer && <footer className="h-[62px] shrink-0 px-5 bg-chrome border-t border-line flex items-center justify-between gap-3">{footer}</footer>}
      </aside>
      <style>{`@keyframes drawer{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}`}</style>
    </div>
  )
}
