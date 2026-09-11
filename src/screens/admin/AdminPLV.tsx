import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { campaigns } from '@/data/plv'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { VistaButton, useVista } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { RowActions } from './Cuentas'
import { CampaignCover } from '../shared/PLV'
import { cn } from '@/lib/cn'

const extra = [
  { id: 'navidad-2024', code: 'N4', name: 'Navidad 2024', period: '1 dic – 6 ene · Archivada, solo consulta', materials: 7, pharmacies: '386', requests: '1.418', adminState: 'Cerrada', updated: '9 ene' },
  { id: 'alergias', code: 'AP', name: 'Alergias primavera', period: '1 mar – 31 may · Antihistamínico y defensas', materials: 4, pharmacies: '412', requests: '331', adminState: 'Cerrada', updated: '3 jun' },
  { id: 'deporte', code: 'DV', name: 'Deporte y verano', period: 'Sin periodo asignado · 3 archivos por revisar', materials: 3, pharmacies: '—', requests: '—', adminState: 'Borrador', updated: 'hace 4 h' },
  { id: 'menopausia', code: 'MP', name: 'Menopausia', period: '1 mar – 31 may · Mujer y hormonal · sin archivos', materials: 0, pharmacies: '—', requests: '—', adminState: 'Borrador', updated: 'hace 2 d' },
]

export function AdminPLV() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [filter, setFilter] = useState('all')
  const [removed, setRemoved] = useState<string[]>([])
  const { vista, setVista } = useVista({ mode: 'list', perRow: 3 })
  const rows = [
    ...campaigns.map((c) => ({ id: c.id, code: c.code, name: c.id === 'otono' ? 'Otoño 2025' : c.id === 'navidad' ? 'Navidad 2025' : c.id === 'marca' ? 'Marca Suprafeel' : c.id === 'cole' ? 'Vuelta al colegio' : c.id === 'piel' ? 'Colágeno · lanzamiento' : c.name, period: `${c.period} · ${c.theme.charAt(0).toUpperCase() + c.theme.slice(1)}`, materials: c.materials, pharmacies: c.pharmacies, requests: c.requests, adminState: c.adminState, updated: c.updated, real: true })),
    ...extra.map((e) => ({ ...e, real: false })),
  ].filter((r) => !removed.includes(r.id)).filter((r) => filter === 'all' || (filter === 'active' ? r.adminState === 'Activa' : filter === 'sched' ? r.adminState === 'Programada' : filter === 'draft' ? r.adminState === 'Borrador' : r.adminState === 'Cerrada'))
  const tone = (s: string): 'ok' | 'danger' | 'warn' | 'neutral' => (s === 'Activa' ? 'ok' : s === 'Programada' ? 'danger' : s === 'Borrador' ? 'warn' : 'neutral')
  const go = (id: string, real: boolean) => (real ? navigate(`/admin/plv/${id}`) : notify('Esta campaña archivada solo se puede consultar'))

  return (
    <Screen toolbar={<Toolbar title="Materiales PLV" right={<><SearchField placeholder="Buscar material o campaña" /><Link to="/admin/plv/nueva"><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />}>Nueva campaña</Button></Link></>} />}>
      <PageHeader title="Materiales PLV" subtitle="9 campañas · 48 materiales · 214 solicitudes abiertas" right={<span className="text-base text-muted">Última subida hace 2 h</span>} />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} />}>
        {[['all', 'Todas', 9], ['active', 'Activas', 2], ['sched', 'Programadas', 1], ['draft', 'Borradores', 2], ['closed', 'Cerradas', 4]].map(([k, l, n]) => <Chip key={k as string} active={filter === k} count={n as number} onClick={() => setFilter(k as string)}>{l}</Chip>)}
      </ChipRow>

      {vista.mode === 'list' ? (
        <TableCard footer={`${rows.length} de 9 campañas · 48 materiales · 1,6 GB de 5 GB en archivos digitales`} footerRight={<button onClick={() => notify('214 solicitudes abiertas')}>Ver solicitudes</button>}>
          <THead><Th className="flex-1">Campaña</Th><Th className="w-[80px]" align="right">Materiales</Th><Th className="w-[80px]" align="right">Farmacias</Th><Th className="w-[84px]" align="right">Solicitudes</Th><Th className="w-[96px]" align="right">Estado</Th><Th className="w-[92px]" align="right">Actualizado</Th><Th className="w-[130px]" align="right">Acciones</Th></THead>
          {rows.map((r, i) => (
            <Tr key={r.id} onClick={() => go(r.id, r.real)} last={i === rows.length - 1}>
              <TdMain title={r.name} meta={r.period} avatar={<Avatar initials={r.code} size={30} tone={i === 0 ? 'soft' : 'neutral'} />} />
              <Td className={cn('w-[80px] font-semibold', r.materials === 0 ? 'text-accent' : 'text-ink')} align="right">{r.materials}</Td>
              <Td className="w-[80px]" align="right">{r.pharmacies}</Td>
              <Td className="w-[84px]" align="right">{r.requests}</Td>
              <div className="w-[96px] flex justify-end"><Badge tone={tone(r.adminState)}>{r.adminState}</Badge></div>
              <Td className="w-[92px]" align="right">{r.updated}</Td>
              <div className="w-[130px] flex justify-end gap-3 text-sm font-medium"><button onClick={(e) => { e.stopPropagation(); go(r.id, r.real) }} className="text-ink">Editar</button><button onClick={(e) => { e.stopPropagation(); setRemoved((x) => [...x, r.id]); notify(`${r.name} eliminada`) }} className="text-danger">Eliminar</button></div>
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${vista.perRow}, minmax(0, 1fr))` }}>
          {campaigns.filter((c) => !removed.includes(c.id)).map((c) => (
            <button key={c.id} onClick={() => navigate(`/admin/plv/${c.id}`)} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden text-left hover:border-faint">
              <CampaignCover c={c} className="h-[130px]" />
              <div className="p-4 flex flex-col"><div className="flex items-center justify-between"><span className="text-lg font-semibold text-ink">{c.name}</span><Badge tone={tone(c.adminState)}>{c.adminState}</Badge></div><span className="text-sm text-faint mt-1">{c.materials} materiales · {c.requests} solicitudes</span></div>
            </button>
          ))}
        </div>
      )}
      <RowActions className="hidden" />
    </Screen>
  )
}
