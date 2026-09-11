import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router'
import { ChevronsUpDown, Sun, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Toast, useStore } from './store'

export interface NavItem { label: string; to: string; icon: LucideIcon; badge?: string | number; badgeTone?: 'neutral' | 'accent'; end?: boolean }
export interface NavSection { title: string; items: NavItem[] }
export interface ShellConfig {
  workspace: { initials: string; name: string; sub: string }
  sections: NavSection[]
  user: { initials: string; name: string; role: string; settingsTo?: string }
}

export function Shell({ config }: { config: ShellConfig }) {
  const navigate = useNavigate()
  const { setRole } = useStore()
  return (
    <div className="h-screen w-full min-w-[1024px] flex bg-canvas text-ink overflow-hidden">
      <aside className="w-60 shrink-0 bg-chrome border-r border-line flex flex-col px-3 pt-3 pb-3">
        <button
          onClick={() => { setRole(null); navigate('/') }}
          title="Cambiar de cuenta"
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
          <span className="h-6 w-6 rounded-full bg-chrome-deep text-ink-soft text-[10px] font-semibold inline-flex items-center justify-center">{config.user.initials}</span>
          <span className="flex-1 min-w-0 flex flex-col">
            <span className="text-md font-medium text-ink truncate">{config.user.name}</span>
            <span className="text-xs text-muted truncate">{config.user.role}</span>
          </span>
          <Sun size={15} strokeWidth={1.6} className="text-faint" />
        </Link>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
        <Outlet />
      </main>
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
        {padded ? <div className="flex-1 flex flex-col gap-[22px] px-7 pt-[26px] pb-7">{children}</div> : children}
      </div>
      {footer}
    </>
  )
}

export function FooterBar({ title, subtitle, children, className }: { title?: ReactNode; subtitle?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('h-[68px] shrink-0 px-7 bg-chrome/70 border-t border-line flex items-center justify-between gap-4', className)}>
      <div className="flex flex-col min-w-0">
        {title && <span className="text-base font-semibold text-ink">{title}</span>}
        {subtitle && <span className="text-sm text-muted mt-[1px]">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">{children}</div>
    </div>
  )
}
