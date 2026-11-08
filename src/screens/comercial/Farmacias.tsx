import { useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Plus, Search, X, Mail, PencilLine, ChevronRight, Clock, Send, Filter, ArrowUpDown, RotateCw } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { filterPharmacies, formacionChapa, formacionLabel, hoyISO, pharmacyFiltersWithCounts, registroDe, type Pharmacy } from '@/data/pharmacies'
import { Toolbar, PageHeader, Notice } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { FilterMenuButton, FilterBar } from '@/ui/FilterMenu'
import { Badge } from '@/ui/Badge'
import { Drawer } from '@/ui/Drawer'
import { Field, Input, Textarea } from '@/ui/Field'
import { Avatar } from '@/ui/Avatar'
import { VistaButton, useVista, useGridCols, visibleColumns } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'

const columnOptions = [
  { key: 'refs', label: 'Referencias' },
  { key: 'formacion', label: 'Formación' },
  { key: 'comercial', label: 'Comercial' },
  { key: 'poblacion', label: 'Población' },
]

const sortOptions = [
  { key: 'az', label: 'Nombre A-Z' },
  { key: 'refs', label: 'Más referencias' },
  { key: 'poblacion', label: 'Población' },
]

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`
/** Para buscar sin que importen mayúsculas ni acentos. */
const plano = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Las altas y los accesos los da la central a mano: se le escribe desde el correo de quien lo pide. */
const CENTRAL = 'info@suprafeel.es'
const escribir = (asunto: string, cuerpo = '') => {
  window.location.href = `mailto:${CENTRAL}?subject=${encodeURIComponent(asunto)}${cuerpo ? `&body=${encodeURIComponent(cuerpo)}` : ''}`
}

function ordenar(list: Pharmacy[], sort: string) {
  const az = (a: Pharmacy, b: Pharmacy) => a.name.localeCompare(b.name, 'es')
  const l = [...list]
  if (sort === 'refs') return l.sort((a, b) => b.refs - a.refs || az(a, b))
  if (sort === 'poblacion') return l.sort((a, b) => a.city.localeCompare(b.city, 'es') || az(a, b))
  return l.sort(az)
}

/** Descarga la lista que se ve como CSV (separado por punto y coma, como lo abre Excel en España). */
function exportarCSV(list: Pharmacy[]) {
  const cols: [string, (p: Pharmacy) => string | number][] = [
    ['Farmacia', (p) => p.name], ['Nombre comercial', (p) => p.nombreComercial ?? ''], ['Titular', (p) => p.owner],
    ['Dirección', (p) => p.address], ['CP', (p) => p.postal], ['Población', (p) => p.city], ['Teléfono', (p) => p.telefono ?? ''],
    ['Código de cliente', (p) => p.codigoCliente ?? ''], ['Comercial', (p) => p.rep], ['Referencias', (p) => p.refs],
    ['Formación', (p) => (p.formacion ? formacionLabel(p.formacion) : '')], ['Fecha de formación', (p) => p.formacionFecha ?? ''],
    ['Hora', (p) => p.formacionHora ?? ''], ['Nota', (p) => p.formacionNote ?? ''],
  ]
  const celda = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [cols.map(([h]) => celda(h)).join(';'), ...list.map((p) => cols.map(([, f]) => celda(f(p))).join(';'))].join('\r\n')
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `farmacias-${hoyISO()}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function Farmacias() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const { farmacias, recargar } = useDatos()
  const [sp, setSp] = useSearchParams()
  // El filtro va en la URL (?filtro=top) para que «Ver todo» desde Hoy llegue ya filtrado. Sin «Formación pendiente» (Aura, 8 nov).
  const opciones = pharmacyFiltersWithCounts(farmacias).filter((o) => o.key !== 'to-train')
  const filter = opciones.find((o) => o.key === sp.get('filtro'))?.key ?? 'all'
  const setFilter = (k: string) => {
    const next = new URLSearchParams(sp)
    if (k === 'all') next.delete('filtro')
    else next.set('filtro', k)
    setSp(next, { replace: true })
  }
  const [sort, setSort] = useState('az')
  const [q, setQ] = useState('')
  const [actualizando, setActualizando] = useState(false)
  const [panel, setPanel] = useState<null | 'buscar' | 'alta'>(null)
  const { vista, setVista, resetVista } = useVista({ mode: 'list', columns: columnOptions })
  const gridStyle = useGridCols(vista)
  const list = ordenar(
    filterPharmacies(filter, farmacias).filter((p) => !q || plano([p.name, p.nombreComercial, p.city, p.owner, p.postal].filter(Boolean).join(' ')).includes(plano(q.trim()))),
    sort,
  )
  const hechas = farmacias.filter((p) => p.formacion === 'hecha').length
  const subtitle = farmacias.length
    ? [plural(farmacias.length, 'farmacia', 'farmacias'), `${hechas} con la formación hecha`].join(' · ')
    : 'Todavía no tienes farmacias asignadas.'
  const actualizar = async () => {
    setActualizando(true)
    try {
      await recargar()
      notify('Lista actualizada')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se ha podido actualizar')
    } finally {
      setActualizando(false)
    }
  }
  type Row = (typeof list)[number]
  // Por debajo de 1024 px (móvil y tableta) las columnas no caben junto al nombre: la fila se parte en
  // dos líneas (nombre arriba; referencias, formación… debajo) y la cabecera de columnas se esconde.
  const cells: Record<string, { th: ReactNode; td: (p: Row) => ReactNode }> = {
    refs: { th: <Th key="h1" className="w-[90px]" align="right">Referencias</Th>, td: (p) => <Td key="c1" className={cn('w-[90px] max-lg:w-auto max-lg:text-left font-semibold', p.refs >= 10 ? 'text-ink' : p.refs <= 2 ? 'text-warn' : 'text-ink-soft')} align="right">{p.refs}<span className="lg:hidden font-normal"> {p.refs === 1 ? 'referencia' : 'referencias'}</span></Td> },
    formacion: { th: <Th key="h2" className="w-[96px]" align="right">Formación</Th>, td: (p) => <div key="c2" className="w-[96px] max-lg:w-auto flex justify-end">{p.formacion ? <Badge tone={formacionChapa(p).tone}>{formacionChapa(p).label}</Badge> : <span className="text-faint text-md max-lg:hidden">—</span>}</div> },
    comercial: { th: <Th key="h3" className="w-[100px]" align="right">Comercial</Th>, td: (p) => <Td key="c3" className="w-[100px] max-lg:w-auto max-lg:text-left max-lg:text-sm max-lg:text-muted" align="right">{p.rep}</Td> },
    poblacion: { th: <Th key="h4" className="w-[150px]" align="right">Población</Th>, td: (p) => <Td key="c4" className="w-[150px] max-lg:w-auto max-lg:text-left max-lg:text-sm max-lg:text-muted" align="right">{p.city}</Td> },
  }
  const cols = visibleColumns(vista)

  return (
    <Screen
      toolbar={
        <Toolbar
          title="Mis farmacias"
          right={
            <>
              <div className="h-7 max-lg:h-9 flex-1 min-w-0 lg:flex-none lg:w-[208px] rounded-[7px] bg-surface border border-line px-[10px] flex items-center gap-[7px]"><Search size={13} className="text-faint shrink-0" /><input aria-label="Buscar farmacia" className="flex-1 min-w-0 self-stretch bg-transparent text-md" placeholder="Buscar farmacia" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <Button variant="primary" className="shrink-0" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => setPanel('buscar')}>Añadir farmacia</Button>
            </>
          }
        />
      }
    >
      <PageHeader title="Mis farmacias" subtitle={subtitle} right={<Button icon={<RotateCw size={13} className={cn(actualizando && 'animate-spin')} />} disabled={actualizando} onClick={() => void actualizar()}>{actualizando ? 'Actualizando…' : 'Actualizar'}</Button>} />
      <FilterBar
        right={
          <>
            <FilterMenuButton align="right" icon={<ArrowUpDown size={13} strokeWidth={1.8} />} value={sort} options={sortOptions} onChange={setSort} />
            <VistaButton vista={vista} onChange={setVista} onReset={resetVista} columns={columnOptions} />
          </>
        }
      >
        <FilterMenuButton icon={<Filter size={13} strokeWidth={1.8} />} value={filter} options={opciones} onChange={setFilter} />
      </FilterBar>

      {vista.mode === 'list' ? (
        <TableCard footer={`${list.length} de ${plural(farmacias.length, 'farmacia', 'farmacias')}`} footerRight={list.length ? <button onClick={() => exportarCSV(list)}>Exportar a CSV</button> : undefined}>
          <THead className="max-lg:hidden">
            <Th className="flex-1">Farmacia</Th>
            {cols.map((k) => cells[k].th)}
          </THead>
          {list.length === 0 && <div className="p-8 text-center text-base text-muted">{farmacias.length ? 'Ninguna farmacia coincide con la búsqueda o el filtro.' : 'Todavía no tienes farmacias asignadas.'}</div>}
          {list.map((p, i) => (
            <Tr key={p.id} wrap="lg" className="max-lg:gap-y-1.5" onClick={() => navigate(`/comercial/farmacias/${p.id}`)} last={i === list.length - 1}>
              <TdMain wrap="lg" className="max-lg:basis-full max-lg:w-0" title={p.name} meta={[p.city, p.owner].filter(Boolean).join(' · ')} avatar={<Avatar initials={p.code} size={30} tone={i === 0 ? 'soft' : 'neutral'} />} />
              {cols.length > 0 && <div className="lg:contents max-lg:basis-full max-lg:pl-[42px] max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:gap-x-3 max-lg:gap-y-1">{cols.map((k) => cells[k].td(p))}</div>}
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={gridStyle}>
          {list.length === 0 && <div className="col-span-full p-8 text-center text-base text-muted">{farmacias.length ? 'Ninguna farmacia coincide con la búsqueda o el filtro.' : 'Todavía no tienes farmacias asignadas.'}</div>}
          {list.map((p) => (
            <button key={p.id} onClick={() => navigate(`/comercial/farmacias/${p.id}`)} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3 text-left hover:border-faint">
              <div className="flex items-center gap-3"><Avatar initials={p.code} size={32} tone="soft" /><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-semibold text-ink truncate">{p.name}</span><span className="text-xs text-faint truncate">{[p.city, p.owner].filter(Boolean).join(' · ')}</span></span>{p.formacion && <Badge tone={formacionChapa(p).tone}>{formacionChapa(p).label}</Badge>}</div>
              <div className="flex justify-between text-sm text-muted"><span>{p.refs} referencias</span><span>{p.rep}</span></div>
              <span className="text-sm text-ink-soft">{p.formacionNote ?? [p.address, p.postal].filter(Boolean).join(' · ')}</span>
            </button>
          ))}
        </div>
      )}

      {panel === 'buscar' && <AddDrawer onClose={() => setPanel(null)} onManual={() => setPanel('alta')} />}
      {panel === 'alta' && <ManualDrawer onClose={() => setPanel(null)} onBack={() => setPanel('buscar')} />}
    </Screen>
  )
}

function AddDrawer({ onClose, onManual }: { onClose: () => void; onManual: () => void }) {
  const { user } = useAuth()
  const { farmacias } = useDatos()
  const registry = registroDe(farmacias)
  const [q, setQ] = useState('')
  const busca = plano(q.trim()).replace(/^farmacia\s+/, '')
  const hits = busca.length > 2 ? registry.filter((r) => plano(`${r.name} ${r.meta}`).includes(busca)).slice(0, 8) : []
  const quien = user?.rep_name || user?.name || ''
  return (
    <Drawer open onClose={onClose} title="Añadir farmacia a tu zona" width={448}>
      <div className={cn('field h-[42px] rounded-lg gap-2.5 is-focus')}>
        <Search size={15} className="text-accent shrink-0" />
        <input autoFocus className="flex-1 bg-transparent text-base" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, CIF, código nacional o población" />
        {q && <button onClick={() => setQ('')} className="h-5 w-5 rounded-full bg-chrome-deep inline-flex items-center justify-center text-ink-soft"><X size={10} strokeWidth={2.5} /></button>}
      </div>
      <span className="mt-2 text-xs text-faint">Busca por nombre, CIF, código nacional de farmacia o población.</span>

      {hits.length > 0 && (
        <>
          <span className="label-faint mt-6">{hits.length === 1 ? '1 coincidencia' : `${hits.length} coincidencias`} en tu lista</span>
          <div className="mt-2.5 rounded-xl bg-surface border border-line overflow-hidden">
            {hits.map((r, i) => (
              <div key={r.id} className={cn('h-[60px] px-4 flex items-center gap-3', i < hits.length - 1 && 'border-b border-line-soft')}>
                <Avatar initials={r.code} size={28} tone="neutral" />
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{r.name}</span><span className="text-xs text-faint truncate">{r.meta}</span></span>
                {r.client ? <Badge tone="ok" className="h-7 px-3 rounded-[7px]">Ya es cliente</Badge> : <Button variant="primary" size="sm" onClick={() => escribir(`Acceso a Suprafeel Soft · ${r.name}`, `Hola:\n\nPido acceso a Suprafeel Soft para ${r.name}${r.meta ? ` (${r.meta})` : ''}.\n\n${quien}`)}>Pedir acceso</Button>}
              </div>
            ))}
          </div>
        </>
      )}
      {busca.length > 2 && hits.length === 0 && <div className="mt-6 text-base text-muted">Ninguna de tus farmacias coincide con «{q.trim()}».</div>}

      <div className="my-6 h-px bg-line" />
      <h3 className="text-lg font-semibold text-ink">¿No la encuentras?</h3>
      <p className="mt-1.5 text-base text-muted leading-[19px]">Si la farmacia aún no está en Suprafeel, la central la da de alta a mano. Mándale sus datos por correo o rellénalos aquí y se los enviamos desde tu correo.</p>

      <button onClick={() => escribir('Alta de farmacia en Suprafeel Soft', `Hola:\n\nQuiero dar de alta esta farmacia en mi zona:\n\n${quien}`)} className="mt-4 h-[46px] rounded-xl bg-surface border border-line px-4 flex items-center gap-3 hover:bg-chrome text-left"><Mail size={14} className="text-muted" /><span className="flex-1 text-base text-ink">Escribir a la central</span><ChevronRight size={14} className="text-faint" /></button>
      <button onClick={onManual} className="mt-2.5 h-[46px] rounded-xl bg-surface border border-line px-4 flex items-center gap-3 hover:bg-chrome text-left"><PencilLine size={14} className="text-muted" /><span className="flex-1 text-base text-ink">Darla de alta yo con sus datos</span><ChevronRight size={14} className="text-faint" /></button>
    </Drawer>
  )
}

function ManualDrawer({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const { user } = useAuth()
  const [f, setF] = useState({ nombre: '', razon: '', cif: '', reg: '', dir: '', titular: '', correo: '', tel: '', nota: '' })
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  const ok = f.nombre && f.razon && f.cif && f.reg && f.dir && f.titular && f.correo
  // No hay endpoint de altas: se abre un correo a la central con los datos, y lo envía quien da el alta.
  const enviar = () => {
    const lineas = [
      ['Nombre comercial', f.nombre], ['Razón social', f.razon], ['CIF', f.cif], ['Nº de registro', f.reg], ['Dirección', f.dir],
      ['Titular', f.titular], ['Correo', f.correo], ['Teléfono', f.tel], ['Nota', f.nota],
    ].filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v.trim()}`)
    escribir(`Alta de farmacia · ${f.nombre}`, `Hola:\n\nPido el alta de esta farmacia en Suprafeel Soft:\n\n${lineas.join('\n')}\n\n${user?.rep_name || user?.name || ''}`)
  }
  return (
    <Drawer
      open
      onClose={onClose}
      onBack={onBack}
      title={`Alta manual · ${f.nombre || 'Nueva farmacia'}`}
      width={448}
      footer={
        <>
          <Button size="lg" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="lg" className="flex-1" icon={<Send size={13} />} disabled={!ok} onClick={enviar}>Enviar por correo a la central</Button>
        </>
      }
    >
      <Notice tone="warn" icon={<Clock size={15} className="shrink-0" />}>Se abrirá tu correo con estos datos para que lo envíes a la central. Hasta que la den de alta, la farmacia no tiene acceso ni sale en tu lista.</Notice>
      <span className="label mt-6">Datos de la farmacia</span>
      <div className="mt-3 flex flex-col gap-3.5">
        <Field label="Nombre comercial" required><Input value={f.nombre} onChange={set('nombre')} placeholder="Farmacia …" /></Field>
        <Field label="Razón social" required><Input value={f.razon} onChange={set('razon')} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="CIF" required><Input value={f.cif} onChange={set('cif')} placeholder="B-00 000 000" /></Field>
          <Field label="Nº de registro" required><Input value={f.reg} onChange={set('reg')} placeholder="F-0000-X" /></Field>
        </div>
        <Field label="Dirección completa" required><Input value={f.dir} onChange={set('dir')} placeholder="Calle, número, CP y población" /></Field>
      </div>
      <span className="label mt-6">Titular que recibirá el acceso</span>
      <div className="mt-3 flex flex-col gap-3.5">
        <Field label="Nombre y apellidos" required><Input value={f.titular} onChange={set('titular')} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Correo" required><Input value={f.correo} onChange={set('correo')} placeholder="nombre@farmacia.es" /></Field>
          <Field label="Teléfono"><Input value={f.tel} onChange={set('tel')} placeholder="+34 ___ __ __ __" /></Field>
        </div>
      </div>
      <span className="label mt-6">Nota para la central</span>
      <Textarea className="mt-3" rows={4} value={f.nota} onChange={set('nota')} placeholder="Cómo la conoces, qué le interesa…" />
      {!ok && <span className="mt-3 text-xs text-warn">Faltan campos obligatorios (*) para poder enviarla.</span>}
    </Drawer>
  )
}
