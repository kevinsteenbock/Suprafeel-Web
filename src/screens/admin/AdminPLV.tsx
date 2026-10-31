import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, Filter, ArrowUpDown } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { PENDIENTE_ADMIN, useStore } from '@/app/store'
import { alcance, campaigns, TODAS } from '@/data/plv'
import { useCifras } from '@/app/datos'
import { otoño } from './AdminProducto'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { FilterMenuButton, FilterBar } from '@/ui/FilterMenu'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { VistaButton, useVista, useGridCols } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { RowActions } from './Cuentas'
import { CampaignCover } from '../shared/PLV'
import { cn } from '@/lib/cn'

/* Años y fechas contados desde hoy: la Navidad archivada es la del año pasado */
const año = new Date().getFullYear()
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const hace = (n: number) => { const d = new Date(Date.now() - n * 864e5); return `${d.getDate()} ${MESES[d.getMonth()]}${d.getFullYear() !== año ? ` ${d.getFullYear()}` : ''}` }

const extra = [
  { id: 'navidad-anterior', code: 'NA', name: `Navidad ${año - 1}`, period: '1 dic – 6 ene · Archivada, solo consulta', materials: 7, pharmacies: TODAS, requests: '—', adminState: 'Cerrada', updated: hace(290) },
  { id: 'alergias', code: 'AP', name: 'Alergias primavera', period: '1 mar – 31 may · Antihistamínico y defensas', materials: 4, pharmacies: TODAS, requests: '—', adminState: 'Cerrada', updated: hace(150) },
  { id: 'deporte', code: 'DV', name: 'Deporte y verano', period: 'Sin periodo asignado · 3 archivos por revisar', materials: 3, pharmacies: '—', requests: '—', adminState: 'Borrador', updated: 'hace 4 h' },
  { id: 'menopausia', code: 'MP', name: 'Menopausia', period: '1 mar – 31 may · Mujer y hormonal · sin archivos', materials: 0, pharmacies: '—', requests: '—', adminState: 'Borrador', updated: 'hace 2 d' },
]

export function AdminPLV() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const cifras = useCifras()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const removed: string[] = []
  const { vista, setVista, resetVista } = useVista({ mode: 'list', perRow: 3 })
  const gridStyle = useGridCols(vista)
  const allRows = [
    ...campaigns.map((c) => ({ id: c.id, code: c.code, name: c.id === 'otono' ? otoño() : c.id === 'navidad' ? `Navidad ${año}` : c.id === 'marca' ? 'Marca Suprafeel' : c.id === 'cole' ? 'Vuelta al colegio' : c.id === 'piel' ? 'Colágeno · lanzamiento' : c.name, period: `${c.period} · ${c.theme.charAt(0).toUpperCase() + c.theme.slice(1)}`, materials: c.materials, pharmacies: c.pharmacies, requests: c.requests, adminState: c.adminState, updated: c.updated, real: true })),
    ...extra.map((e) => ({ ...e, real: false })),
  ].filter((r) => !removed.includes(r.id))
  const rows = allRows.filter((r) => filter === 'all' || (filter === 'active' ? r.adminState === 'Activa' : filter === 'sched' ? r.adminState === 'Programada' : filter === 'draft' ? r.adminState === 'Borrador' : r.adminState === 'Cerrada'))
  const chips = [
    ['all', 'Todas', allRows.length],
    ['active', 'Activas', allRows.filter((r) => r.adminState === 'Activa').length],
    ['sched', 'Programadas', allRows.filter((r) => r.adminState === 'Programada').length],
    ['draft', 'Borradores', allRows.filter((r) => r.adminState === 'Borrador').length],
    ['closed', 'Cerradas', allRows.filter((r) => r.adminState === 'Cerrada').length],
  ] as const
  const totalMaterials = allRows.reduce((a, r) => a + r.materials, 0)
  const tone = (s: string): 'ok' | 'danger' | 'warn' | 'neutral' => (s === 'Activa' ? 'ok' : s === 'Programada' ? 'danger' : s === 'Borrador' ? 'warn' : 'neutral')
  const go = (id: string, real: boolean) => (real ? navigate(`/admin/plv/${id}`) : notify('Esta campaña archivada solo se puede consultar'))

  return (
    <Screen toolbar={<Toolbar title="Materiales PLV" right={<><SearchField placeholder="Buscar material o campaña" /><Link to="/admin/plv/nueva"><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />}>Nueva campaña</Button></Link></>} />}>
      <PageHeader title="Materiales PLV" subtitle={`${allRows.length} campañas · ${totalMaterials} materiales`} />
      <FilterBar
        right={
          <>
            <FilterMenuButton align="right" icon={<ArrowUpDown size={13} strokeWidth={1.8} />} value={sort} options={[{ key: 'recent', label: 'Más reciente' }, { key: 'az', label: 'Nombre A-Z' }]} onChange={setSort} />
            <VistaButton vista={vista} onChange={setVista} onReset={resetVista} />
          </>
        }
      >
        <FilterMenuButton icon={<Filter size={13} strokeWidth={1.8} />} value={filter} options={chips.map(([k, l, n]) => ({ key: k, label: l, count: n }))} onChange={setFilter} />
      </FilterBar>

      {vista.mode === 'list' ? (
        <TableCard footer={`${rows.length} de ${allRows.length} campañas · ${totalMaterials} materiales`}>
          <THead><Th className="flex-1">Campaña</Th><Th className="w-[80px]" align="right">Materiales</Th><Th className="w-[80px]" align="right">Farmacias</Th><Th className="w-[84px]" align="right">Solicitudes</Th><Th className="w-[96px]" align="right">Estado</Th><Th className="w-[92px]" align="right">Actualizado</Th><Th className="w-[130px]" align="right">Acciones</Th></THead>
          {rows.map((r, i) => (
            <Tr key={r.id} onClick={() => go(r.id, r.real)} last={i === rows.length - 1}>
              <TdMain title={r.name} meta={r.period} avatar={<Avatar initials={r.code} size={30} tone={i === 0 ? 'soft' : 'neutral'} />} />
              <Td className={cn('w-[80px] font-semibold', r.materials === 0 ? 'text-accent' : 'text-ink')} align="right">{r.materials}</Td>
              <Td className="w-[80px]" align="right">{alcance(r.pharmacies, cifras.farmacias)}</Td>
              <Td className="w-[84px]" align="right">{r.requests}</Td>
              <div className="w-[96px] flex justify-end"><Badge tone={tone(r.adminState)}>{r.adminState}</Badge></div>
              <Td className="w-[92px]" align="right">{r.updated}</Td>
              <div className="w-[130px] flex justify-end gap-3 text-sm font-medium"><button onClick={(e) => { e.stopPropagation(); go(r.id, r.real) }} className="text-ink">Editar</button><button onClick={(e) => { e.stopPropagation(); notify(PENDIENTE_ADMIN, 'aviso') }} className="text-danger">Eliminar</button></div>
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-5" style={gridStyle}>
          {rows.map((r) => {
            const real = campaigns.find((c) => c.id === r.id)
            return (
              <button key={r.id} onClick={() => go(r.id, r.real)} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden text-left hover:border-faint">
                {real ? <CampaignCover c={real} className="h-[130px]" /> : (
                  <div className="h-[130px] bg-chrome-deep flex items-center justify-center">
                    <span className="h-11 w-11 rounded-full bg-surface border border-line text-ink-soft text-sm font-bold inline-flex items-center justify-center">{r.code}</span>
                  </div>
                )}
                <div className="p-4 flex flex-col"><div className="flex items-center justify-between"><span className="text-lg font-semibold text-ink">{r.name}</span><Badge tone={tone(r.adminState)}>{r.adminState}</Badge></div><span className="text-sm text-faint mt-1">{r.materials} materiales</span></div>
              </button>
            )
          })}
        </div>
      )}
      <RowActions className="hidden" />
    </Screen>
  )
}
