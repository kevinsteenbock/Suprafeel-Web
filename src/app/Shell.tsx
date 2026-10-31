import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router'
import { ChevronsUpDown, Sun, Menu, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Toast } from './store'
import { useAuth } from './auth'
import { useDatos } from './datos'
import { shellDe } from './nav'

export interface NavItem { label: string; to: string; icon: LucideIcon; badge?: string | number; badgeTone?: 'neutral' | 'accent'; end?: boolean }
export interface NavSection { title: string; items: NavItem[] }
export interface ShellConfig {
  workspace: { initials: string; name: string; sub: string }
  sections: NavSection[]
  user: { initials: string; name: string; role: string; settingsTo?: string }
}

export function Shell({ config: base }: { config: ShellConfig }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { farmacias } = useDatos()
  // La tarjeta de arriba, las chapas y el nombre de la persona salen de la sesión y de sus datos.
  const config = shellDe(base, user, farmacias)
  const name = user?.name || config.user.name
  const initials = user?.name ? user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() : config.user.initials
  const [navOpen, setNavOpen] = useState(false)

  const navBody = (
    <>
      <button
        onClick={() => { logout(); navigate('/') }}
        title="Cerrar sesión y cambiar de cuenta"
        className="h-[46px] rounded-lg bg-surface border border-line px-2 flex items-center gap-2 text-left hover:bg-canvas"
      >
        <span className="h-7 w-7 rounded-[7px] bg-accent text-on-accent text-xs font-bold inline-flex items-center justify-center">{config.workspace.initials}</span>
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="text-md font-semibold text-ink truncate">{config.workspace.name}</span>
          <span className="text-xs text-muted truncate">{config.workspace.sub}</span>
        </span>
        <ChevronsUpDown size={11} className="text-muted" />
      </button>

      <nav className="flex-1 flex flex-col mt-[22px] gap-[26px] overflow-y-auto no-scrollbar">
        {config.sections.map((s) => (
          <div key={s.title} className="flex flex-col gap-px">
            <span className="label px-2 h-[19px] flex items-center mb-1">{s.title}</span>
            {s.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  cn('h-[30px] rounded-sm px-2 flex items-center gap-[9px] text-md', isActive ? 'bg-accent text-on-accent font-medium' : 'text-ink-soft hover:bg-chrome-deep/70')
                }
              >
                {({ isActive }) => (
                  <>
                    <it.icon size={15} strokeWidth={1.7} className={isActive ? 'text-on-accent' : 'text-muted'} />
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge !== undefined && (
                      <span
                        className={cn(
                          'h-[17px] min-w-[18px] px-1.5 rounded-full text-xs font-medium inline-flex items-center justify-center',
                          isActive ? 'bg-white/25 text-on-accent' : it.badgeTone === 'accent' ? 'bg-accent-wash text-accent-deep' : 'bg-chrome-deep text-ink-soft',
                        )}
                      >
                        {it.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <Link to={config.user.settingsTo ?? '#'} className="h-10 mt-3 px-2 rounded-md flex items-center gap-2 hover:bg-chrome-deep/70">
        <span className="h-6 w-6 rounded-full bg-chrome-deep text-ink-soft text-[10px] font-semibold inline-flex items-center justify-center">{initials}</span>
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="text-md font-medium text-ink truncate">{name}</span>
          <span className="text-xs text-muted truncate">{config.user.role}</span>
        </span>
        <Sun size={15} strokeWidth={1.6} className="text-faint" />
      </Link>
    </>
  )

  return (
    <div className="h-screen w-full flex bg-canvas text-ink overflow-hidden">
      {/* Barra lateral fija en escritorio (≥1024px) */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-chrome border-r border-line flex-col px-3 pt-3 pb-3">
        {navBody}
      </aside>

      {/* Menú deslizante en móvil/tablet: se cierra solo al tocar cualquier enlace */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-scrim" onClick={() => setNavOpen(false)} />
          <aside className="relative w-72 max-w-[82vw] h-full bg-chrome border-r border-line flex flex-col px-3 pt-3 pb-3 animate-[drawer_.18s_ease-out]">
            <button
              onClick={() => setNavOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-chrome-deep flex items-center justify-center text-ink-soft hover:bg-line z-10"
            >
              <X size={13} strokeWidth={2.4} />
            </button>
            <div onClick={() => setNavOpen(false)} className="flex-1 min-h-0 flex flex-col">{navBody}</div>
          </aside>
          <style>{`@keyframes drawer{from{transform:translateX(-24px);opacity:.6}to{transform:none;opacity:1}}`}</style>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Barra superior solo en móvil/tablet, con el botón de menú */}
        <div className="lg:hidden h-12 shrink-0 bg-chrome border-b border-line flex items-center gap-2.5 px-3">
          <button onClick={() => setNavOpen(true)} aria-label="Abrir menú" className="h-8 w-8 -ml-1 rounded-md flex items-center justify-center text-ink-soft hover:bg-chrome-deep/70">
            <Menu size={18} />
          </button>
          <span className="h-6 w-6 rounded-[7px] bg-accent text-on-accent text-[10px] font-bold inline-flex items-center justify-center shrink-0">{config.workspace.initials}</span>
          <span className="flex-1 min-w-0 text-md font-semibold text-ink truncate">{config.workspace.name}</span>
        </div>
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}

/** Cuerpo de pantalla: barra superior fija + zona con scroll + barra inferior opcional */
export function Screen({ toolbar, children, footer, className, padded = true }: { toolbar?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string; padded?: boolean }) {
  return (
    <>
      {toolbar}
      <div className={cn('flex-1 min-h-0 overflow-y-auto flex flex-col', className)}>
        {padded ? <div className="flex-1 flex flex-col gap-[22px] px-4 pt-4 pb-4 lg:px-7 lg:pt-[26px] lg:pb-7">{children}</div> : children}
      </div>
      {footer}
    </>
  )
}

export function FooterBar({ title, subtitle, children, className }: { title?: ReactNode; subtitle?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-[68px] lg:h-[68px] shrink-0 px-4 lg:px-7 py-2.5 lg:py-0 bg-chrome/70 border-t border-line flex flex-wrap lg:flex-nowrap items-center justify-between gap-3', className)}>
      <div className="flex flex-col min-w-0">
        {title && <span className="text-base font-semibold text-ink">{title}</span>}
        {subtitle && <span className="text-sm text-muted mt-[1px]">{subtitle}</span>}
      </div>
      <div className="flex items-center flex-wrap gap-2.5 shrink-0">{children}</div>
    </div>
  )
}
