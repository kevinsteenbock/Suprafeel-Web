import type { ReactNode, CSSProperties } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, Search } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Barra superior fina (52 px). En el móvil:
 * · la flecha «Volver» tiene 36 px de zona táctil (el icono sigue igual);
 * · con flecha, por debajo de 1024 px solo se ve la última miga: la flecha ya sube de nivel y la
 *   miga se lee entera (baja a dos líneas en vez de cortarse con «…»);
 * · si el grupo de la derecha lleva un buscador, baja a su propia fila y ocupa todo el ancho
 *   (buscador estirado, botón dentro del margen). Sin buscador, se queda junto al título si cabe.
 */
export function Toolbar({ title, crumbs, right, back, meta }: {
  title?: ReactNode
  crumbs?: { label: ReactNode; to?: string }[]
  right?: ReactNode
  back?: string
  meta?: ReactNode
}) {
  return (
    <header className="min-h-[52px] lg:h-[52px] shrink-0 px-4 lg:px-7 py-2 lg:py-0 bg-chrome/60 border-b border-line-soft flex flex-wrap items-center justify-between gap-2 lg:gap-4">
      <div className="flex items-center gap-2 min-w-0">
        {back && (
          <Link to={back} className="h-9 w-9 -ml-[14px] -mr-1.5 shrink-0 inline-flex items-center justify-center text-ink-soft hover:text-ink" aria-label="Volver">
            <ChevronLeft size={16} />
          </Link>
        )}
        {crumbs ? (
          <nav className="flex items-center gap-2 text-base min-w-0">
            {crumbs.map((c, i) => {
              const lastCrumb = i === crumbs.length - 1
              return (
                <span key={i} className={cn('items-center gap-2 min-w-0', !lastCrumb && back ? 'hidden lg:flex' : 'flex')}>
                  {c.to && !lastCrumb ? (
                    <Link to={c.to} className="min-w-0 shrink text-muted hover:text-ink truncate">{c.label}</Link>
                  ) : (
                    <span className={cn('min-w-0 shrink', lastCrumb ? 'font-semibold text-ink lg:truncate max-lg:line-clamp-2 max-lg:break-words' : 'text-muted truncate')}>{c.label}</span>
                  )}
                  {!lastCrumb && <span className="text-faint shrink-0">/</span>}
                </span>
              )
            })}
          </nav>
        ) : (
          <span className="text-base font-semibold text-ink">{title}</span>
        )}
        {meta}
      </div>
      {right && <div className="flex items-center flex-wrap gap-2.5 shrink-0 min-w-0 max-w-full max-lg:has-[input:not([data-sin-conectar]_input)]:w-full">{right}</div>}
    </header>
  )
}

/**
 * Buscador de la barra. Sin `onChange` no filtra nada todavía: entonces no se enseña en el móvil
 * (ocupaba una fila entera para nada) y en escritorio queda como estaba. Con `onChange`, busca de
 * verdad y se ve en todos los anchos.
 */
export function SearchField({ placeholder = 'Buscar', width = 208, value, onChange, className }: { placeholder?: string; width?: number; value?: string; onChange?: (v: string) => void; className?: string }) {
  return (
    <div data-sin-conectar={onChange ? undefined : ''} style={{ '--sf-w': `${width}px` } as CSSProperties} className={cn('h-7 max-lg:h-9 rounded-[7px] bg-surface border border-line px-[10px] items-center gap-[7px] flex-1 min-w-0 lg:flex-none lg:w-[var(--sf-w)]', onChange ? 'flex' : 'hidden lg:flex', className)}>
      <Search size={13} className="text-faint shrink-0" strokeWidth={2} />
      {onChange ? (
        <input className="flex-1 min-w-0 self-stretch bg-transparent text-md text-ink" placeholder={placeholder} aria-label={placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="flex-1 min-w-0 self-stretch bg-transparent text-md text-ink" placeholder={placeholder} aria-label={placeholder} defaultValue={value} />
      )}
    </div>
  )
}

/** Título de página con subtítulo y hueco a la derecha */
export function PageHeader({ title, subtitle, right, className }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-6', className)}>
      <div className="flex flex-col min-w-0">
        <h1 className="text-h1 font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-[5px] text-base text-muted">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0 flex flex-wrap items-center gap-3">{right}</div>}
    </div>
  )
}

/** Contenedor del cuerpo de página: padding 26/28/28 y gap 22 como en el Paper */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex-1 flex flex-col gap-[22px] px-4 pt-4 pb-4 lg:px-7 lg:pt-[26px] lg:pb-7 min-h-0', className)}>{children}</div>
}

export function Section({ title, right, children, className }: { title: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

export function KeyValue({ rows, className, labelWidth = 120 }: { rows: { k: ReactNode; v: ReactNode; right?: ReactNode }[]; className?: string; labelWidth?: number }) {
  return (
    <div className={cn('rounded-xl bg-surface border border-line overflow-hidden', className)}>
      {rows.map((r, i) => (
        <div key={i} className={cn('min-h-[42px] px-[14px] flex items-center gap-3', i < rows.length - 1 && 'border-b border-line-soft')}>
          <span style={{ width: labelWidth }} className="text-sm text-muted shrink-0">{r.k}</span>
          <span className="text-base text-ink flex-1 min-w-0">{r.v}</span>
          {r.right}
        </div>
      ))}
    </div>
  )
}

export function Stat({ label, value, sub, tone, bar, className }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'accent' | 'ok' | 'warn' | 'danger'; bar?: number; className?: string }) {
  const vt = tone === 'accent' ? 'text-accent' : tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : tone === 'danger' ? 'text-danger' : 'text-ink'
  return (
    <div className={cn('flex-1 min-w-0 px-4 py-3 sm:px-5 sm:py-4 flex flex-col', className)}>
      <span className="label">{label}</span>
      <span className={cn('mt-1.5 sm:mt-2 text-title leading-6 sm:text-h1 sm:leading-8 font-semibold tracking-tight break-words hyphens-auto', vt)}>{value}</span>
      {sub && <span className="mt-1 text-sm text-muted">{sub}</span>}
      {bar !== undefined && (
        <span className="mt-2.5 h-[5px] w-full max-w-[208px] rounded-full bg-chrome-deep overflow-hidden">
          <span style={{ width: `${bar}%` }} className="block h-full rounded-full bg-accent" />
        </span>
      )}
    </div>
  )
}

/** Fila de cifras: en el teléfono, rejilla de 2 × 2 (ver .stat-row en index.css); desde 640px, en fila. */
export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('stat-row rounded-xl bg-surface border border-line shadow-card grid grid-cols-2 sm:flex sm:flex-row sm:divide-x divide-line-soft', className)}>{children}</div>
}

export function Notice({ tone = 'warn', title, children, icon, className, right }: { tone?: 'warn' | 'danger' | 'accent' | 'neutral' | 'ok'; title?: ReactNode; children?: ReactNode; icon?: ReactNode; className?: string; right?: ReactNode }) {
  const t = {
    warn: 'bg-warn-wash border-warn-line text-[#7A5A18]',
    danger: 'bg-danger-wash border-danger-line text-[#7E2323]',
    accent: 'bg-accent-wash border-accent-line text-accent-deep',
    neutral: 'bg-chrome border-line text-ink-soft',
    ok: 'bg-ok-wash border-[#CBD9CC] text-ok',
  }[tone]
  return (
    <div className={cn('rounded-lg border px-3 py-[10px] flex items-center gap-[10px]', t, className)}>
      {icon}
      <div className="flex-1 min-w-0 flex flex-col">
        {title && <span className="text-md font-semibold">{title}</span>}
        {children && <span className="text-sm leading-[15px] mt-[1px]">{children}</span>}
      </div>
      {right}
    </div>
  )
}

export function EmptyDashed({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn('rounded-lg border border-dashed border-line bg-chrome flex items-center justify-center gap-2 text-md font-medium text-ink-soft hover:bg-chrome-deep/60 w-full', className)}>
      {children}
    </button>
  )
}

/** Pantalla sin contenido todavía: icono, qué falta y qué pasará cuando lo haya. Nunca datos de ejemplo. */
export function Vacio({ icon, title, children }: { icon: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface border border-line shadow-card px-6 py-14 flex flex-col items-center text-center">
      <span className="h-10 w-10 rounded-full bg-chrome text-muted inline-flex items-center justify-center">{icon}</span>
      <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
      {children && <p className="mt-1.5 text-base text-muted max-w-[440px]">{children}</p>}
    </div>
  )
}
