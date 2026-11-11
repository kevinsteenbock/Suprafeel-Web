import { useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Plus, Search, X, ArrowUpDown } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useDatos, type Usuario } from '@/app/datos'
import { comercialesDe, esProgramada, formacionChapa, hoyISO, iniciales, type Pharmacy } from '@/data/pharmacies'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { FilterMenuButton, FilterBar, type MenuOption } from '@/ui/FilterMenu'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { VistaButton, useVista, useGridCols, visibleColumns } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'
import { accesosPorComercial, accesosPorFarmacia, ataduraDe, fechaAlta, norm, plural, ROL_LABEL } from './accesos'
import { EditarComercial } from './EditarComercial'
import { AccesoCelda, FilaLista, Principal, principal, porFilaInicial, vistaInicial } from './AccesoCelda'

/** Acciones de fila (la usa una lista de filas). */
export function RowActions({ onEdit, onDup, onDel, className }: { onEdit?: () => void; onDup?: () => void; onDel?: () => void; className?: string }) {
  const stop = (fn?: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn?.() }
  return (
    <div className={cn('flex items-center justify-end gap-3 text-sm font-medium', className)}>
      <button onClick={stop(onEdit)} className="text-ink hover:text-accent">Editar</button>
      <button onClick={stop(onDup)} className="text-ink hover:text-accent">Duplicar</button>
      <button onClick={stop(onDel)} className="text-danger hover:text-accent-deep">Eliminar</button>
    </div>
  )
}

const columnOptions = [
  { key: 'comercial', label: 'Comercial' },
  { key: 'refs', label: 'Referencias' },
  { key: 'formacion', label: 'Formación' },
  { key: 'acceso', label: 'Acceso' },
]

/** Valores del filtro de formación: los estados de Xano + «sin» (sin estado) y «pasada» (prevista con la fecha ya pasada). */
const FORMACION_OPCIONES: { key: string; label: string; test: (p: Pharmacy, hoy: string) => boolean }[] = [
  { key: 'hecha', label: 'Hecha', test: (p) => p.formacion === 'hecha' },
  { key: 'prevista', label: 'Programada', test: (p) => p.formacion === 'prevista' },
  { key: 'reprogramada', label: 'Reprogramada', test: (p) => p.formacion === 'reprogramada' },
  { key: 'pasada', label: 'Programada, fecha pasada', test: (p, hoy) => esProgramada(p.formacion) && !!p.formacionFecha && p.formacionFecha < hoy },
  { key: 'pendiente', label: 'No hecha (pendiente)', test: (p) => p.formacion === 'pendiente' },
  { key: 'cancelada', label: 'Cancelada', test: (p) => p.formacion === 'cancelada' },
  { key: 'rechazada', label: 'No quieren formación', test: (p) => p.formacion === 'rechazada' },
  { key: 'sin', label: 'Sin agendar', test: (p) => !p.formacion },
]

const SIN_REP = '__sin'

function Buscar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="h-7 flex-1 min-w-0 lg:flex-none lg:w-[248px] rounded-[7px] bg-surface border border-line px-[10px] flex items-center gap-[7px]">
      <Search size={13} className="text-faint shrink-0" strokeWidth={2} />
      <input type="search" aria-label={placeholder} className="flex-1 min-w-0 bg-transparent text-md text-ink" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {value && <button type="button" onClick={() => onChange('')} aria-label="Borrar la búsqueda" className="h-4 w-4 rounded-full bg-chrome-deep inline-flex items-center justify-center text-ink-soft shrink-0"><X size={9} strokeWidth={2.6} /></button>}
    </div>
  )
}

export function Cuentas() {
  const navigate = useNavigate()
  const { farmacias, usuarios } = useDatos()
  const [sp, setSp] = useSearchParams()
  const { vista, setVista, resetVista } = useVista({ mode: vistaInicial(), perRow: porFilaInicial(4), columns: columnOptions })
  const gridStyle = useGridCols(vista)
  const hoy = hoyISO()
  const [editando, setEditando] = useState<Usuario | null>(null)

  // Los filtros viven en la URL: así Resumen y Comerciales pueden traer aquí una lista ya filtrada.
  const ver = sp.get('ver') === 'cuentas' ? 'cuentas' : 'farmacias'
  const acceso = sp.get('acceso') ?? 'all'
  const comercial = sp.get('comercial') ?? 'all'
  const formacion = sp.get('formacion') ?? 'all'
  const orden = sp.get('orden') ?? 'az'
  const q = sp.get('q') ?? ''
  const setParam = (k: string, v: string, porDefecto = 'all') => {
    const next = new URLSearchParams(sp)
    if (v === porDefecto || v === '') next.delete(k)
    else next.set(k, v)
    setSp(next, { replace: true })
  }
  const quitarFiltros = () => setSp(ver === 'cuentas' ? { ver } : {}, { replace: true })

  const porFarmacia = accesosPorFarmacia(usuarios)
  const cuentasDe = (p: Pharmacy) => porFarmacia.get(p.id) ?? []
  const n = farmacias.length
  const conAcceso = farmacias.filter((p) => porFarmacia.has(p.id)).length
  const darAcceso = (p: Pharmacy) => navigate(`/admin/cuentas/nueva?farmacia=${encodeURIComponent(p.id)}`)

  // --- Farmacias ---
  const filtroFormacion = FORMACION_OPCIONES.find((f) => f.key === formacion)
  const base = farmacias.filter(
    (p) =>
      (acceso === 'all' || (acceso === 'con') === porFarmacia.has(p.id)) &&
      (comercial === 'all' || (comercial === SIN_REP ? !p.rep : p.rep === comercial)) &&
      (!filtroFormacion || filtroFormacion.test(p, hoy)),
  )
  const nq = norm(q.trim())
  const lista = (nq
    ? base.filter((p) => norm([p.name, p.nombreComercial, p.city, p.owner, p.rep, p.codigoCliente, ...cuentasDe(p).map((u) => u.email)].filter(Boolean).join(' ')).includes(nq))
    : base
  ).slice().sort((a, b) =>
    orden === 'refs' ? b.refs - a.refs || a.name.localeCompare(b.name, 'es')
    : orden === 'city' ? a.city.localeCompare(b.city, 'es') || a.name.localeCompare(b.name, 'es')
    : a.name.localeCompare(b.name, 'es'),
  )

  const reps = comercialesDe(farmacias)
  // Los comerciales con cuenta y aún sin farmacias (los nuevos) también salen en el filtro, con 0.
  const soloCuenta = [...accesosPorComercial(usuarios).keys()].filter((r) => r !== '*' && !reps.some((x) => x.rep === r)).sort((a, b) => a.localeCompare(b, 'es'))
  const sinRep = farmacias.filter((p) => !p.rep).length
  const opcionesAcceso: MenuOption[] = [
    { key: 'all', label: 'Todas', count: n },
    { key: 'con', label: 'Con acceso', count: conAcceso },
    { key: 'sin', label: 'Sin acceso', count: n - conAcceso },
  ]
  const opcionesComercial: MenuOption[] = [
    { key: 'all', label: 'Todos', count: n },
    ...reps.map((r) => ({ key: r.rep, label: r.rep, count: r.farmacias })),
    ...soloCuenta.map((r) => ({ key: r, label: r, count: 0 })),
    ...(sinRep ? [{ key: SIN_REP, label: 'Sin comercial', count: sinRep }] : []),
    ...(comercial !== 'all' && comercial !== SIN_REP && !reps.some((r) => r.rep === comercial) && !soloCuenta.includes(comercial) ? [{ key: comercial, label: comercial, count: 0 }] : []),
  ]
  const opcionesFormacion: MenuOption[] = [
    { key: 'all', label: 'Todas', count: n },
    ...FORMACION_OPCIONES.map((f) => ({ key: f.key, label: f.label, count: farmacias.filter((p) => f.test(p, hoy)).length })).filter((o) => o.count > 0 || o.key === formacion),
  ]

  // --- Cuentas creadas ---
  const cuentas = (nq
    ? usuarios.filter((u) => norm([u.name, u.email, u.rep_name, ataduraDe(u, farmacias)].join(' ')).includes(nq))
    : usuarios
  ).slice().sort((a, b) => (orden === 'az' ? a.name.localeCompare(b.name, 'es') : b.created_at - a.created_at))
  const irACuenta = (u: Usuario) => {
    if (u.role === 'farmacia' && farmacias.some((p) => p.id === u.pharmacy_slug)) navigate(`/admin/cuentas/${u.pharmacy_slug}`)
    // Una cuenta de comercial abre su ficha: nombre, zona y qué farmacias ve.
    else if (u.role === 'comercial') setEditando(u)
  }

  const filtrado = acceso !== 'all' || comercial !== 'all' || formacion !== 'all' || !!q
  type Row = Pharmacy
  const cells: Record<string, { th: ReactNode; td: (p: Row) => ReactNode }> = {
    comercial: { th: <Th key="h2" className="w-[100px] shrink-0">Comercial</Th>, td: (p) => <Td key="c2" className={cn('w-[100px] shrink-0', !p.rep && 'text-accent font-medium')}>{p.rep || 'Sin comercial'}</Td> },
    refs: { th: <Th key="h3" className="w-[92px] shrink-0" align="right">Referencias</Th>, td: (p) => <Td key="c3" className={cn('w-[92px] shrink-0 font-semibold', p.refs >= 10 ? 'text-ink' : p.refs <= 2 ? 'text-warn' : 'text-ink-soft')} align="right">{p.refs}</Td> },
    formacion: {
      th: <Th key="h4" className="w-[122px] shrink-0" align="right">Formación</Th>,
      td: (p) => { const c = formacionChapa(p); return <div key="c4" className="w-[122px] shrink-0 flex justify-end"><Badge tone={c.tone}>{c.label}{p.formacion === 'prevista' && p.formacionDate ? ` · ${p.formacionDate}` : ''}</Badge></div> },
    },
    acceso: { th: <Th key="h5" className="w-[180px] shrink-0" align="right">Acceso</Th>, td: (p) => <AccesoCelda key="c5" className="w-[180px] shrink-0" cuentas={cuentasDe(p)} onDar={() => darAcceso(p)} /> },
  }
  const cols = visibleColumns(vista)

  return (
    <Screen
      toolbar={
        <Toolbar
          title="Cuentas y accesos"
          right={
            <>
              <Buscar value={q} onChange={(v) => setParam('q', v, '')} placeholder={ver === 'cuentas' ? 'Buscar cuenta o correo' : 'Buscar farmacia, población o correo'} />
              <Button onClick={() => navigate('/admin/cuentas/farmacia/nueva')}>Nueva farmacia</Button>
              <Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => navigate('/admin/cuentas/nueva')}>Nueva cuenta</Button>
            </>
          }
        />
      }
    >
      <PageHeader
        title="Cuentas y accesos"
        subtitle={`${plural(n, 'farmacia', 'farmacias')} · ${conAcceso} con acceso y ${n - conAcceso} sin acceso · ${plural(usuarios.length, 'cuenta creada', 'cuentas creadas')}`}
      />
      <FilterBar
        right={
          <>
            <FilterMenuButton
              align="right"
              icon={<ArrowUpDown size={13} strokeWidth={1.8} />}
              value={orden}
              options={ver === 'cuentas' ? [{ key: 'az', label: 'Nombre A-Z' }, { key: 'recent', label: 'Alta más reciente' }] : [{ key: 'az', label: 'Nombre A-Z' }, { key: 'refs', label: 'Más referencias' }, { key: 'city', label: 'Población A-Z' }]}
              onChange={(v) => setParam('orden', v, 'az')}
            />
            {ver === 'farmacias' && <VistaButton vista={vista} onChange={setVista} onReset={resetVista} columns={columnOptions} />}
          </>
        }
      >
        <FilterMenuButton
          label="Ver"
          value={ver}
          options={[{ key: 'farmacias', label: 'Farmacias', count: n }, { key: 'cuentas', label: 'Cuentas creadas', count: usuarios.length }]}
          onChange={(v) => setSp(v === 'cuentas' ? { ver: v } : {}, { replace: true })}
        />
        {ver === 'farmacias' && (
          <>
            <FilterMenuButton label="Acceso" value={acceso} options={opcionesAcceso} onChange={(v) => setParam('acceso', v)} />
            <FilterMenuButton label="Comercial" width={240} value={comercial} options={opcionesComercial} onChange={(v) => setParam('comercial', v)} />
            <FilterMenuButton label="Formación" width={240} value={formacion} options={opcionesFormacion} onChange={(v) => setParam('formacion', v)} />
            {filtrado && <Button variant="ghost" size="sm" onClick={quitarFiltros}>Quitar filtros</Button>}
          </>
        )}
      </FilterBar>

      {ver === 'cuentas' ? (
        <TableCard footer={`${cuentas.length} de ${plural(usuarios.length, 'cuenta', 'cuentas')}`}>
          <THead className="hidden lg:flex">
            <Principal min={220}><Th>Cuenta</Th></Principal>
            <Th className="w-[110px] shrink-0">Rol</Th>
            <Th className="w-[240px] shrink-0">Entra a</Th>
            <Th className="w-[96px] shrink-0" align="right">Alta</Th>
          </THead>
          {cuentas.length === 0 && <div className="p-8 text-center text-base text-muted">{q ? `Ninguna cuenta con «${q}».` : 'Todavía no hay ninguna cuenta.'}</div>}
          {cuentas.map((u, i) => {
            const huerfana = u.role === 'farmacia' && !farmacias.some((p) => p.id === u.pharmacy_slug)
            return (
              <FilaLista key={u.id} onClick={u.role === 'admin' || huerfana ? undefined : () => irACuenta(u)} last={i === cuentas.length - 1}>
                {/* En el móvil y la tableta: nombre, correo entero y rol arriba; a qué entra y el alta, debajo. */}
                <div style={principal(220)} className="flex items-center max-lg:min-w-0!">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <Avatar initials={iniciales(u.name || u.email) || '··'} size={30} tone={u.role === 'admin' ? 'soft' : 'neutral'} rounded="full" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-medium text-ink break-words lg:truncate">{u.name || u.email}</span>
                      <span className="text-xs mt-[2px] text-faint break-all lg:break-normal lg:truncate">{u.email}</span>
                    </div>
                  </div>
                </div>
                <div className="lg:w-[110px] shrink-0 self-start lg:self-auto"><Badge tone={u.role === 'admin' ? 'accent' : 'neutral'}>{ROL_LABEL[u.role]}</Badge></div>
                <div className="lg:hidden w-full pl-[42px] flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className={cn('min-w-0 break-words', huerfana ? 'text-warn' : 'text-ink-soft')}>{ataduraDe(u, farmacias)}</span>
                  <span className="text-faint whitespace-nowrap">Alta: {fechaAlta(u.created_at)}</span>
                </div>
                <Td className={cn('hidden lg:block w-[240px] shrink-0', huerfana && 'text-warn')}>{ataduraDe(u, farmacias)}</Td>
                <Td className="hidden lg:block w-[96px] shrink-0" align="right">{fechaAlta(u.created_at)}</Td>
              </FilaLista>
            )
          })}
        </TableCard>
      ) : vista.mode === 'list' ? (
        <TableCard footer={`${lista.length} de ${plural(n, 'farmacia', 'farmacias')}`}>
          <THead>
            <Principal min={220}><Th>Farmacia</Th></Principal>
            {cols.map((k) => cells[k]!.th)}
          </THead>
          {lista.length === 0 && (
            <div className="p-8 flex flex-col items-center gap-3 text-base text-muted">
              {q ? `Ninguna farmacia con «${q}» en estos filtros.` : 'Ninguna farmacia con estos filtros.'}
              <Button onClick={quitarFiltros}>Quitar filtros</Button>
            </div>
          )}
          {lista.map((p, i) => (
            <Tr key={p.id} onClick={() => navigate(`/admin/cuentas/${p.id}`)} last={i === lista.length - 1}>
              <Principal min={220}><TdMain title={p.name} meta={[p.city, p.nombreComercial || p.owner].filter(Boolean).join(' · ') || p.address} avatar={<Avatar initials={p.code} size={30} tone={porFarmacia.has(p.id) ? 'soft' : 'neutral'} />} /></Principal>
              {cols.map((k) => cells[k]!.td(p))}
            </Tr>
          ))}
        </TableCard>
      ) : (
        <>
          {lista.length === 0 && (
            <div className="rounded-xl bg-surface border border-line shadow-card p-8 flex flex-col items-center gap-3 text-base text-muted">
              Ninguna farmacia con estos filtros.
              <Button onClick={quitarFiltros}>Quitar filtros</Button>
            </div>
          )}
          <div className="grid gap-4" style={gridStyle}>
            {lista.map((p) => {
              const cs = cuentasDe(p)
              return (
                <div key={p.id} role="link" tabIndex={0} onClick={() => navigate(`/admin/cuentas/${p.id}`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/cuentas/${p.id}`)} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3 text-left hover:border-faint cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar initials={p.code} size={32} tone={cs.length ? 'soft' : 'neutral'} />
                    <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-semibold text-ink truncate">{p.name}</span><span className="text-xs text-faint truncate">{[p.city, p.rep || 'Sin comercial'].join(' · ')}</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-muted">
                    <span>{plural(p.refs, 'referencia', 'referencias')}</span>
                    <Badge tone={formacionChapa(p).tone}>{formacionChapa(p).label}</Badge>
                  </div>
                  <AccesoCelda cuentas={cs} onDar={() => darAcceso(p)} align="between" />
                </div>
              )
            })}
          </div>
        </>
      )}
      <EditarComercial key={editando?.id ?? 0} cuentas={editando ? [editando] : []} open={!!editando} onClose={() => setEditando(null)} />
    </Screen>
  )
}
