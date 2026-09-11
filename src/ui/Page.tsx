import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, Search } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Barra superior fina (52 px) */
export function Toolbar({ title, crumbs, right, back, meta }: {
  title?: ReactNode
  crumbs?: { label: ReactNode; to?: string }[]
  right?: ReactNode
  back?: string
  meta?: ReactNode
}) {
  return (
    <header className="h-[52px] shrink-0 px-7 bg-chrome/60 border-b border-line-soft flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0">
        {back && (
          <Link to={back} className="text-ink-soft hover:text-ink -ml-1 mr-1" aria-label="Volver">
            <ChevronLeft size={16} />
          </Link>
        )}
        {crumbs ? (
          <nav className="flex items-center gap-2 text-base min-w-0">
            {crumbs.map((c, i) => {
              const lastCrumb = i === crumbs.length - 1
              return (
                <span key={i} className="flex items-center gap-2 min-w-0">
                  {c.to && !lastCrumb ? (
                    <Link to={c.to} className="text-muted hover:text-ink truncate">{c.label}</Link>
                  ) : (
                    <span className={cn('truncate', lastCrumb ? 'font-semibold text-ink' : 'text-muted')}>{c.label}</span>
                  )}
                  {!lastCrumb && <span className="text-faint">/</span>}
                </span>
              )
            })}
          </nav>
        ) : (
          <span className="text-base font-semibold text-ink">{title}</span>
        )}
        {meta}
      </div>
      {right && <div className="flex items-center gap-2.5 shrink-0">{right}</div>}
    </header>
  )
}

export function SearchField({ placeholder = 'Buscar', width = 208, value, className }: { placeholder?: string; width?: number; value?: string; className?: string }) {
  return (
    <div style={{ width }} className={cn('h-7 rounded-[7px] bg-surface border border-line px-[10px] flex items-center gap-[7px]', className)}>
      <Search size={13} className="text-faint shrink-0" strokeWidth={2} />
      <input className="flex-1 min-w-0 bg-transparent text-md text-ink" placeholder={placeholder} defaultValue={value} />
    </div>
  )
}

/** Título de página con subtítulo y hueco a la derecha */
export function PageHeader({ title, subtitle, right, className }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-end justify-between gap-6', className)}>
      <div className="flex flex-col min-w-0">
        <h1 className="text-h1 font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-[5px] text-base text-muted">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0 flex items-center gap-3">{right}</div>}
    </div>
  )
}

/** Contenedor del cuerpo de página: padding 26/28/28 y gap 22 como en el Paper */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex-1 flex flex-col gap-[22px] px-7 pt-[26px] pb-7 min-h-0', className)}>{children}</div>
}

export function Section({ title, right, children, className }: { title: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
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
    <div className={cn('flex-1 min-w-0 px-5 py-4 flex flex-col', className)}>
      <span className="label">{label}</span>
      <span className={cn('mt-2 text-h1 font-semibold tracking-tight leading-8', vt)}>{value}</span>
      {sub && <span className="mt-1 text-sm text-muted">{sub}</span>}
      {bar !== undefined && (
        <span className="mt-2.5 h-[5px] w-[208px] rounded-full bg-chrome-deep overflow-hidden">
          <span style={{ width: `${bar}%` }} className="block h-full rounded-full bg-accent" />
        </span>
      )}
    </div>
  )
}

export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-xl bg-surface border border-line shadow-card flex divide-x divide-line-soft', className)}>{children}</div>
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
