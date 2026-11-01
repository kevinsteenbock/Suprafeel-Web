import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight, KeyRound, Briefcase, CalendarClock, CalendarX2, MapPinOff } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { comercialesDe, hoyISO, iniciales, proximasFormaciones, type Formacion } from '@/data/pharmacies'
import { Toolbar, PageHeader, Stat, StatRow, Section } from '@/ui/Page'
import { Avatar } from '@/ui/Avatar'
import { Bar } from '@/ui/Table'
import { cn } from '@/lib/cn'
import { accesosPorComercial, accesosPorFarmacia, fechaDeHoy, plural } from './accesos'
import { tactilBase } from '@/ui/tactil'

function saludo(d = new Date()) {
  const h = d.getHours()
  return h >= 6 && h < 14 ? 'Buenos días' : h >= 14 && h < 21 ? 'Buenas tardes' : 'Buenas noches'
}

/** «hoy», «mañana», «en 5 días» */
function cuandoEs(iso: string, hoy: string) {
  const dias = Math.round((Date.parse(`${iso}T12:00:00`) - Date.parse(`${hoy}T12:00:00`)) / 86_400_000)
  return dias <= 0 ? 'hoy' : dias === 1 ? 'mañana' : `en ${dias} días`
}

interface Tarea { key: string; icon: ReactNode; title: string; meta: string; to: string }

export function Resumen() {
  const { user } = useAuth()
  const { farmacias, usuarios } = useDatos()
  const hoy = hoyISO()
  const n = farmacias.length
  const reps = comercialesDe(farmacias)

  const porFarmacia = accesosPorFarmacia(usuarios)
  const porComercial = accesosPorComercial(usuarios)
  const sinAcceso = farmacias.filter((p) => !porFarmacia.has(p.id)).length
  const repsSinCuenta = reps.filter((r) => !porComercial.has(r.rep))
  const sinComercial = farmacias.filter((p) => !p.rep).length
  const poblaciones = new Set(farmacias.map((p) => p.city).filter(Boolean)).size

  const cuenta = (f: Formacion) => farmacias.filter((p) => p.formacion === f).length
  const hechas = cuenta('hecha')
  const previstas = cuenta('prevista')
  const pendientes = cuenta('pendiente')
  const rechazadas = cuenta('rechazada')
  const sinAgendar = farmacias.filter((p) => !p.formacion).length
  const proximas = proximasFormaciones(farmacias)
  const atrasadas = farmacias.filter((p) => p.formacion === 'prevista' && !!p.formacionFecha && p.formacionFecha < hoy).length
  const pct = (x: number) => (n ? Math.round((x / n) * 100) : 0)

  const porRol = (r: string) => usuarios.filter((u) => u.role === r).length
  const nombre = user?.name?.trim().split(/\s+/)[0]

  const tareas = ([
    sinAcceso > 0 && { key: 'acceso', icon: <KeyRound size={14} />, title: plural(sinAcceso, 'farmacia sin acceso a la app', 'farmacias sin acceso a la app'), meta: 'Dales acceso desde Cuentas y accesos', to: '/admin/cuentas?acceso=sin' },
    repsSinCuenta.length > 0 && { key: 'reps', icon: <Briefcase size={14} />, title: plural(repsSinCuenta.length, 'comercial sin cuenta', 'comerciales sin cuenta'), meta: repsSinCuenta.slice(0, 4).map((r) => r.rep).join(', ') + (repsSinCuenta.length > 4 ? '…' : ''), to: '/admin/comerciales?acceso=sin' },
    atrasadas > 0 && { key: 'atrasadas', icon: <CalendarX2 size={14} />, title: plural(atrasadas, 'formación prevista con la fecha ya pasada', 'formaciones previstas con la fecha ya pasada'), meta: 'Confirma con el comercial si se hicieron', to: '/admin/cuentas?formacion=pasada' },
    pendientes > 0 && { key: 'pendientes', icon: <CalendarClock size={14} />, title: plural(pendientes, 'formación pendiente de agendar', 'formaciones pendientes de agendar'), meta: 'La farmacia la quiere y todavía no tiene fecha', to: '/admin/cuentas?formacion=pendiente' },
    sinComercial > 0 && { key: 'sin-rep', icon: <MapPinOff size={14} />, title: plural(sinComercial, 'farmacia sin comercial', 'farmacias sin comercial'), meta: 'Nadie la tiene asignada todavía', to: '/admin/cuentas?comercial=__sin' },
  ] as (Tarea | false)[]).filter((x): x is Tarea => !!x)

  const formacion = [
    { label: 'Hecha', n: hechas, tone: 'ok' as const, to: 'hecha' },
    { label: 'Prevista', n: previstas, tone: 'warn' as const, to: 'prevista' },
    { label: 'Pendiente de agendar', n: pendientes, tone: 'accent' as const, to: 'pendiente' },
    { label: 'No la quieren', n: rechazadas, tone: 'danger' as const, to: 'rechazada' },
    { label: 'Sin agendar', n: sinAgendar, tone: 'ink' as const, to: 'sin' },
  ]

  return (
    <Screen toolbar={<Toolbar title="Resumen" />}>
      <PageHeader
        title={nombre ? `${saludo()}, ${nombre}` : saludo()}
        subtitle={`${plural(n, 'farmacia', 'farmacias')} · ${plural(reps.length, 'comercial', 'comerciales')} · ${plural(usuarios.length, 'cuenta con acceso', 'cuentas con acceso')}`}
        right={<span className="text-base text-muted">{fechaDeHoy()}</span>}
      />
      <StatRow>
        <Stat label="Farmacias" value={n.toLocaleString('es-ES')} sub={`en ${plural(poblaciones, 'población', 'poblaciones')}`} />
        <Stat label="Comerciales" value={reps.length} sub={`${reps.length - repsSinCuenta.length} con cuenta en la app`} />
        <Stat label="Formación hecha" value={`${pct(hechas)} %`} sub={`${hechas} hechas · ${previstas} programadas · ${pendientes} pendientes`} bar={pct(hechas)} />
        <Stat label="Cuentas con acceso" value={usuarios.length} sub={`${porRol('farmacia')} de farmacia · ${porRol('comercial')} de comercial · ${porRol('admin')} admin`} />
      </StatRow>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Por debajo de 1024 px los nombres y las notas de las filas bajan de línea en vez de cortarse con «…». */}
          <Section title="Pendiente de ti">
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {tareas.length === 0 && <div className="p-6 text-center text-base text-muted">Nada pendiente: todas las farmacias tienen acceso y la formación está al día.</div>}
              {tareas.map((x, i) => (
                <Link key={x.key} to={x.to} className={cn('min-h-[58px] py-2 px-4 flex items-center gap-3 hover:bg-canvas', i < tareas.length - 1 && 'border-b border-line-soft')}>
                  <span className="h-[30px] w-[30px] rounded-[7px] bg-accent-wash text-accent inline-flex items-center justify-center shrink-0">{x.icon}</span>
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{x.title}</span><span className="text-xs text-faint lg:truncate">{x.meta}</span></span>
                  <ChevronRight size={14} className="text-faint shrink-0" />
                </Link>
              ))}
            </div>
          </Section>

          <Section title="Próximas formaciones" right={proximas.length > 0 ? <Link to="/admin/cuentas?formacion=prevista" className={cn(tactilBase, 'text-base font-medium text-accent')}>Ver todas las previstas</Link> : undefined}>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {proximas.length === 0 && <div className="p-6 text-center text-base text-muted">No hay ninguna formación programada de hoy en adelante.</div>}
              {proximas.slice(0, 6).map((p, i, l) => (
                <Link key={p.id} to={`/admin/cuentas/${p.id}`} className={cn('min-h-[54px] py-2 px-4 flex items-center gap-3 hover:bg-canvas', i < l.length - 1 && 'border-b border-line-soft')}>
                  <Avatar initials={p.code} size={30} tone="neutral" />
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink lg:truncate">{p.name}</span><span className="text-xs text-faint lg:truncate">{[p.city, p.rep].filter(Boolean).join(' · ')}</span></span>
                  <span className="flex flex-col items-end shrink-0">
                    <span className="text-base font-medium text-ink">{p.formacionDate}{p.formacionHora ? ` · ${p.formacionHora}` : ''}</span>
                    <span className="text-xs text-faint">{cuandoEs(p.formacionFecha ?? hoy, hoy)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Section>
        </div>

        <aside className="w-full lg:w-[380px] lg:shrink-0 flex flex-col gap-6">
          <Section title="Formación en el mostrador">
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {formacion.map((f, i) => (
                <Link key={f.label} to={`/admin/cuentas?formacion=${f.to}`} className={cn('min-h-[46px] lg:h-[46px] py-2 lg:py-0 px-4 flex items-center gap-3 hover:bg-canvas', i < formacion.length - 1 && 'border-b border-line-soft')}>
                  <span className="flex-1 min-w-0 text-base text-ink lg:truncate">{f.label}</span>
                  <Bar value={pct(f.n)} width={90} tone={f.tone} />
                  <span className="w-[34px] text-right text-base font-semibold text-ink">{f.n}</span>
                </Link>
              ))}
            </div>
          </Section>
          <Section title="Comerciales" right={reps.length > 0 ? <Link to="/admin/comerciales" className={cn(tactilBase, 'text-base font-medium text-accent')}>Ver todos</Link> : undefined}>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {reps.length === 0 && <div className="p-6 text-center text-base text-muted">Ninguna farmacia tiene comercial asignado.</div>}
              {reps.slice(0, 5).map((r, i, l) => (
                <Link key={r.rep} to={`/admin/cuentas?comercial=${encodeURIComponent(r.rep)}`} className={cn('min-h-[52px] lg:h-[52px] py-2 lg:py-0 px-4 flex items-center gap-3 hover:bg-canvas', i < l.length - 1 && 'border-b border-line-soft')}>
                  <Avatar initials={iniciales(r.rep)} size={28} tone="neutral" rounded="full" />
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink lg:truncate">{r.rep}</span><span className="text-xs text-faint lg:truncate">{[r.zona, plural(r.hechas, 'formación hecha', 'formaciones hechas')].filter(Boolean).join(' · ')}</span></span>
                  <span className="text-sm text-muted shrink-0">{plural(r.farmacias, 'farmacia', 'farmacias')}</span>
                  <ChevronRight size={14} className="text-faint shrink-0" />
                </Link>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    </Screen>
  )
}
