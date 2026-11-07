import { type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Plus, Search, X, ArrowUpDown } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useDatos, type Usuario } from '@/app/datos'
import { comercialesDe, iniciales, type ResumenComercial } from '@/data/pharmacies'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { FilterMenuButton, FilterBar } from '@/ui/FilterMenu'
import { Avatar } from '@/ui/Avatar'
import { VistaButton, useVista, useGridCols, visibleColumns } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain, Bar } from '@/ui/Table'
import { cn } from '@/lib/cn'
import { accesosPorComercial, norm, plural } from './accesos'
import { AccesoCelda, Principal, porFilaInicial, vistaInicial } from './AccesoCelda'

const columnOptions = [
  { key: 'farmacias', label: 'Farmacias' },
  { key: 'hechas', label: 'Formación hecha' },
  { key: 'previstas', label: 'Programadas' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'acceso', label: 'Acceso' },
]

type Rep = ResumenComercial & { cuentas: Usuario[] }

export function Comerciales() {
  const navigate = useNavigate()
  const { farmacias, usuarios } = useDatos()
  const [sp, setSp] = useSearchParams()
  const { vista, setVista, resetVista } = useVista({ mode: vistaInicial(), perRow: porFilaInicial(3), columns: columnOptions })
  const gridStyle = useGridCols(vista)

  const acceso = sp.get('acceso') ?? 'all'
  const orden = sp.get('orden') ?? 'farmacias'
  const q = sp.get('q') ?? ''
  const setParam = (k: string, v: string, porDefecto: string) => {
    const next = new URLSearchParams(sp)
    if (v === porDefecto || v === '') next.delete(k)
    else next.set(k, v)
    setSp(next, { replace: true })
  }

  // Los comerciales salen de las farmacias (su campo rep); se suman los que tienen cuenta y aún ninguna farmacia.
  const porComercial = accesosPorComercial(usuarios)
  const deFarmacias = comercialesDe(farmacias)
  const soloCuenta = [...porComercial.keys()]
    .filter((rep) => !deFarmacias.some((r) => r.rep === rep))
    .map((rep): ResumenComercial => ({ rep, zona: '', farmacias: 0, refs: 0, hechas: 0, previstas: 0, pendientes: 0, rechazadas: 0 }))
  const reps: Rep[] = [...deFarmacias, ...soloCuenta].map((r) => ({ ...r, cuentas: porComercial.get(r.rep) ?? [] }))
  const conAcceso = reps.filter((r) => r.cuentas.length).length
  const asignadas = deFarmacias.reduce((a, r) => a + r.farmacias, 0)
  const sinRep = farmacias.filter((p) => !p.rep).length

  const nq = norm(q.trim())
  const lista = reps
    .filter((r) => acceso === 'all' || (acceso === 'con') === r.cuentas.length > 0)
    .filter((r) => !nq || norm([r.rep, r.zona, ...r.cuentas.map((u) => u.email)].join(' ')).includes(nq))
    .sort((a, b) =>
      orden === 'az' ? a.rep.localeCompare(b.rep, 'es')
      : orden === 'hechas' ? b.hechas - a.hechas || b.farmacias - a.farmacias
      : b.farmacias - a.farmacias || a.rep.localeCompare(b.rep, 'es'),
    )

  const verFarmacias = (r: Rep) => navigate(`/admin/cuentas?comercial=${encodeURIComponent(r.rep)}`)
  const darAcceso = (r: Rep) => navigate(`/admin/cuentas/nueva?rol=comercial&comercial=${encodeURIComponent(r.rep)}`)
  const pct = (r: Rep) => (r.farmacias ? Math.round((r.hechas / r.farmacias) * 100) : 0)

  const cells: Record<string, { th: ReactNode; td: (r: Rep) => ReactNode }> = {
    farmacias: { th: <Th key="h1" className="w-[72px] shrink-0" align="right">Farmacias</Th>, td: (r) => <Td key="c1" className="w-[72px] shrink-0 font-semibold text-ink" align="right">{r.farmacias}</Td> },
    hechas: {
      th: <Th key="h2" className="w-[140px] shrink-0">Formación hecha</Th>,
      td: (r) => (
        <div key="c2" className="w-[140px] shrink-0 flex items-center gap-2">
          {r.farmacias ? <><Bar value={pct(r)} width={70} tone="ok" /><span className="text-sm text-muted">{r.hechas} de {r.farmacias}</span></> : <span className="text-sm text-faint">—</span>}
        </div>
      ),
    },
    previstas: { th: <Th key="h3" className="w-[92px] shrink-0" align="right">Programadas</Th>, td: (r) => <Td key="c3" className="w-[92px] shrink-0" align="right">{r.previstas || '—'}</Td> },
    pendientes: { th: <Th key="h4" className="w-[80px] shrink-0" align="right">Pendientes</Th>, td: (r) => <Td key="c4" className={cn('w-[80px] shrink-0', r.pendientes > 0 && 'text-accent font-medium')} align="right">{r.pendientes || '—'}</Td> },
    acceso: { th: <Th key="h5" className="w-[180px] shrink-0" align="right">Acceso</Th>, td: (r) => <AccesoCelda key="c5" className="w-[180px] shrink-0" cuentas={r.cuentas} onDar={() => darAcceso(r)} /> },
  }
  const cols = visibleColumns(vista)

  return (
    <Screen
      toolbar={
        <Toolbar
          title="Comerciales"
          right={
            <>
              <div className="h-7 flex-1 min-w-0 lg:flex-none lg:w-[208px] rounded-[7px] bg-surface border border-line px-[10px] flex items-center gap-[7px]">
                <Search size={13} className="text-faint shrink-0" strokeWidth={2} />
                <input type="search" aria-label="Buscar comercial o zona" className="flex-1 min-w-0 bg-transparent text-md text-ink" placeholder="Buscar comercial o zona" value={q} onChange={(e) => setParam('q', e.target.value, '')} />
                {q && <button type="button" onClick={() => setParam('q', '', '')} aria-label="Borrar la búsqueda" className="h-4 w-4 rounded-full bg-chrome-deep inline-flex items-center justify-center text-ink-soft shrink-0"><X size={9} strokeWidth={2.6} /></button>}
              </div>
              <Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => navigate('/admin/cuentas/nueva?rol=comercial')}>Nuevo comercial</Button>
            </>
          }
        />
      }
    >
      <PageHeader
        title="Comerciales"
        subtitle={`${plural(reps.length, 'comercial', 'comerciales')} · ${plural(asignadas, 'farmacia asignada', 'farmacias asignadas')} · ${conAcceso} con acceso a la app`}
        right={sinRep > 0 ? <button onClick={() => navigate('/admin/cuentas?comercial=__sin')} className="text-base font-medium text-accent">{plural(sinRep, 'farmacia sin comercial', 'farmacias sin comercial')}</button> : undefined}
      />
      <FilterBar
        right={
          <>
            <FilterMenuButton
              align="right"
              icon={<ArrowUpDown size={13} strokeWidth={1.8} />}
              value={orden}
              options={[{ key: 'farmacias', label: 'Más farmacias' }, { key: 'hechas', label: 'Más formaciones hechas' }, { key: 'az', label: 'Nombre A-Z' }]}
              onChange={(v) => setParam('orden', v, 'farmacias')}
            />
            <VistaButton vista={vista} onChange={setVista} onReset={resetVista} columns={columnOptions} />
          </>
        }
      >
        <FilterMenuButton
          label="Acceso"
          value={acceso}
          options={[
            { key: 'all', label: 'Todos', count: reps.length },
            { key: 'con', label: 'Con acceso', count: conAcceso },
            { key: 'sin', label: 'Sin acceso', count: reps.length - conAcceso },
          ]}
          onChange={(v) => setParam('acceso', v, 'all')}
        />
      </FilterBar>

      {vista.mode === 'list' ? (
        <TableCard footer={`${lista.length} de ${plural(reps.length, 'comercial', 'comerciales')}`}>
          <THead><Principal min={160}><Th>Comercial</Th></Principal>{cols.map((k) => cells[k]!.th)}</THead>
          {lista.length === 0 && <div className="p-8 text-center text-base text-muted">{reps.length ? 'Ningún comercial con estos filtros.' : 'Ninguna farmacia tiene comercial asignado todavía.'}</div>}
          {lista.map((r, i) => (
            <Tr key={r.rep} onClick={() => verFarmacias(r)} last={i === lista.length - 1}>
              <Principal min={160}><TdMain title={r.rep} meta={r.zona || (r.farmacias ? 'Sin zona' : 'Todavía sin farmacias')} avatar={<Avatar initials={iniciales(r.rep) || '··'} size={30} tone={r.cuentas.length ? 'soft' : 'neutral'} rounded="full" />} /></Principal>
              {cols.map((k) => cells[k]!.td(r))}
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={gridStyle}>
          {lista.map((r) => (
            <div key={r.rep} role="link" tabIndex={0} onClick={() => verFarmacias(r)} onKeyDown={(e) => e.key === 'Enter' && verFarmacias(r)} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3 text-left hover:border-faint cursor-pointer">
              <div className="flex items-center gap-3">
                <Avatar initials={iniciales(r.rep) || '··'} size={36} tone={r.cuentas.length ? 'soft' : 'neutral'} rounded="full" />
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-semibold text-ink truncate">{r.rep}</span><span className="text-xs text-faint truncate">{r.zona || 'Sin zona'}</span></span>
              </div>
              <span className="h-[5px] w-full rounded-[3px] bg-chrome-deep inline-flex overflow-hidden" role="img" aria-label={`Formación hecha en ${r.hechas} de ${r.farmacias} farmacias`}>
                <span style={{ width: `${pct(r)}%` }} className="h-full rounded-[3px] bg-ok" />
              </span>
              <span className="text-sm text-muted">{plural(r.farmacias, 'farmacia', 'farmacias')} · {r.hechas} hechas · {r.previstas} previstas · {r.pendientes} pendientes</span>
              <AccesoCelda cuentas={r.cuentas} onDar={() => darAcceso(r)} align="between" />
            </div>
          ))}
        </div>
      )}
    </Screen>
  )
}
