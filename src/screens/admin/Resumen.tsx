import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { requests, accounts } from '@/data/accounts'
import { unanswered } from '@/data/chat'
import { Toolbar, SearchField, PageHeader, Stat, StatRow, Section } from '@/ui/Page'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { cn } from '@/lib/cn'

export function Resumen() {
  return (
    <Screen toolbar={<Toolbar title="Resumen" right={<SearchField placeholder="Buscar en la consola" />} />}>
      <PageHeader title="Buenos días, Kevin" subtitle="412 farmacias activas · 6 comerciales en ruta · 2.104 consultas al chat este mes" right={<span className="text-base text-muted">Viernes, 11 de septiembre</span>} />
      <StatRow>
        <Stat label="Farmacias activas" value="412" sub={<span className="text-ok font-medium">+14 este mes</span>} />
        <Stat label="Solicitudes de alta" value="7" tone="accent" sub="la más antigua lleva 3 días" />
        <Stat label="Consultas resueltas" value="87 %" sub="64 sin respuesta esta semana" bar={87} />
        <Stat label="Formación completada" value="54 %" sub="1.430 certificados emitidos" />
      </StatRow>
      <div className="flex gap-6">
        <Section className="flex-1 min-w-0" title="Pendiente de ti" right={<Link to="/admin/cuentas/solicitudes" className="text-base font-medium text-accent">Ver solicitudes</Link>}>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            {requests.slice(0, 5).map((r, i) => (
              <Link key={r.id} to="/admin/cuentas/solicitudes" className={cn('h-[58px] px-4 flex items-center gap-3 hover:bg-canvas', i < 4 && 'border-b border-line-soft')}>
                <Avatar initials={r.code} size={30} tone={r.blocked ? 'neutral' : 'soft'} />
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{r.name}</span><span className={cn('text-xs', r.blocked ? 'text-danger' : 'text-faint')}>{r.meta}</span></span>
                <Badge tone={r.blocked ? 'danger' : 'warn'}>{r.blocked ? 'Revisar CIF' : 'Pendiente'}</Badge>
                <span className="text-sm text-muted w-[60px] text-right">{r.received}</span>
              </Link>
            ))}
          </div>
        </Section>
        <aside className="w-[380px] shrink-0 flex flex-col gap-5">
          <Section title="El chat no supo contestar" right={<Link to="/admin/chat/sin-respuesta" className="text-base font-medium text-accent">Ver las 64</Link>}>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {unanswered.slice(0, 4).map((u, i) => (
                <Link key={u.id} to="/admin/chat/sin-respuesta" className={cn('h-[54px] px-4 flex items-center gap-3 hover:bg-canvas', i < 3 && 'border-b border-line-soft')}>
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base text-ink truncate">{u.text}</span><span className="text-xs text-faint">{u.pharmacy} · {u.when}</span></span>
                  <ChevronRight size={14} className="text-faint" />
                </Link>
              ))}
            </div>
          </Section>
          <Section title="Cuentas con más actividad">
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {accounts.slice(0, 3).map((a, i) => (
                <Link key={a.id} to={`/admin/cuentas/${a.id}`} className={cn('h-[52px] px-4 flex items-center gap-3 hover:bg-canvas', i < 2 && 'border-b border-line-soft')}>
                  <Avatar initials={a.code} size={28} tone="neutral" /><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{a.name}</span><span className="text-xs text-faint">{a.usage.chat} consultas · {a.usage.courses} cursos</span></span><ChevronRight size={14} className="text-faint" />
                </Link>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    </Screen>
  )
}
