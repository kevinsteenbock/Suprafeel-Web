import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router'
import { ChevronsUpDown, Sun, Menu, X, LogOut, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Drawer } from '@/ui/Drawer'
import { Button } from '@/ui/Button'
import { Toast, useStore } from './store'
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
  // La tarjeta de arriba cierra la sesión, pero nunca de un toque: antes pregunta en un pop-up.
  const [salir, setSalir] = useState(false)

  const navBody = (
    <>
      <button
        onClick={() => setSalir(true)}
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
    <div className="h-dvh w-full flex bg-canvas text-ink overflow-hidden">
      {/* Barra lateral fija en escritorio (≥1024px) */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-chrome border-r border-line flex-col px-3 pt-3 pb-3">
        {navBody}
      </aside>

      {/* Menú deslizante en móvil/tablet: se cierra solo al tocar cualquier enlace */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-scrim" onClick={() => setNavOpen(false)} />
          <aside className="relative w-72 max-w-[82vw] h-full bg-chrome border-r border-line flex flex-col px-3 pt-2 pb-3 animate-[drawer_.18s_ease-out]">
            {/* La X va en su propia fila, lejos de la tarjeta de la cuenta */}
            <div className="h-10 mb-1.5 shrink-0 flex items-center justify-end">
              <button
                onClick={() => setNavOpen(false)}
                aria-label="Cerrar menú"
                className="h-9 w-9 -mr-1 rounded-full bg-chrome-deep flex items-center justify-center text-ink-soft hover:bg-line"
              >
                <X size={14} strokeWidth={2.4} />
              </button>
            </div>
            <div onClick={() => setNavOpen(false)} className="flex-1 min-h-0 flex flex-col">{navBody}</div>
          </aside>
          <style>{`@keyframes drawer{from{transform:translateX(-24px);opacity:.6}to{transform:none;opacity:1}}`}</style>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Barra superior solo en móvil/tablet, con el botón de menú */}
        <div className="lg:hidden h-12 shrink-0 bg-chrome border-b border-line flex items-center gap-2.5 px-3">
          <button onClick={() => setNavOpen(true)} aria-label="Abrir menú" className="h-10 w-10 -ml-2 -mr-1 rounded-md flex items-center justify-center text-ink-soft hover:bg-chrome-deep/70">
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
      {salir && <ConfirmarSalida onClose={() => setSalir(false)} onSalir={() => { setSalir(false); logout(); navigate('/') }} cuenta={user?.email} />}
    </div>
  )
}

/** Pop-up centrado para cerrar la sesión. Dice qué se borra de este navegador si hay algo guardado. */
function ConfirmarSalida({ onClose, onSalir, cuenta }: { onClose: () => void; onSalir: () => void; cuenta?: string }) {
  const { miLista, solicitud, savedCases } = useStore()
  const enSolicitud = Object.values(solicitud).filter((n) => n > 0).length
  const seBorra = [
    miLista.length > 0 && `Mi lista (${miLista.length})`,
    enSolicitud > 0 && `la solicitud de material (${enSolicitud})`,
    savedCases > 0 && `los casos guardados (${savedCases})`,
  ].filter(Boolean) as string[]
  return (
    <Drawer
      open
      onClose={onClose}
      width={400}
      title="¿Cerrar la sesión?"
      subtitle={cuenta}
      footer={
        <>
          <Button size="lg" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" size="lg" className="flex-1" icon={<LogOut size={13} />} onClick={onSalir}>Cerrar sesión</Button>
        </>
      }
    >
      <p className="text-base text-ink-soft leading-[19px]">Vuelves a la pantalla de entrada, donde puedes entrar con otra cuenta.</p>
      {seBorra.length > 0 && (
        <p className="mt-2.5 text-base text-ink-soft leading-[19px]">
          También se borra de este navegador: {seBorra.length > 1 ? `${seBorra.slice(0, -1).join(', ')} y ${seBorra[seBorra.length - 1]}` : seBorra[0]}.
        </p>
      )}
    </Drawer>
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
    <div className={cn('min-h-[68px] lg:h-[68px] shrink-0 px-4 lg:px-7 py-2.5 lg:py-0 bg-chrome/70 border-t border-line flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-3 gap-y-2 lg:gap-3', className)}>
      <div className="flex flex-col min-w-0">
        {title && <span className="text-base font-semibold text-ink">{title}</span>}
        {/* En el teléfono, solo el título: el pie fijo no puede comerse media pantalla */}
        {subtitle && <span className="hidden sm:block text-sm text-muted mt-[1px]">{subtitle}</span>}
      </div>
      {/* En el teléfono, los botones van en su fila, alineados a la derecha, y bajan de línea si no caben */}
      <div className="flex items-center flex-wrap justify-end gap-2.5 min-w-0 max-w-full w-full sm:w-auto sm:ml-auto lg:shrink-0">{children}</div>
    </div>
  )
}
