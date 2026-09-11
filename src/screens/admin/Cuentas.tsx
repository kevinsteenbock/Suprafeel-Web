import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, Mail } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { accountFilters, filterAccounts } from '@/data/accounts'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { VistaButton, useVista, visibleColumns } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'

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
  { key: 'plan', label: 'Plan' },
  { key: 'accesos', label: 'Accesos' },
  { key: 'rep', label: 'Comercial' },
  { key: 'estado', label: 'Estado' },
  { key: 'alta', label: 'Alta' },
]

export function Cuentas() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [filter, setFilter] = useState('all')
  const [removed, setRemoved] = useState<string[]>([])
  const { vista, setVista, resetVista } = useVista({ mode: 'list', columns: columnOptions })
  const list = filterAccounts(filter).filter((a) => !removed.includes(a.id))
  const tone = (s: string): 'ok' | 'danger' | 'warn' => (s === 'Activa' ? 'ok' : s === 'Suspendida' ? 'danger' : 'warn')
  type Row = (typeof list)[number]
  const cells: Record<string, { th: ReactNode; td: (a: Row) => ReactNode }> = {
    plan: { th: <Th key="h1" className="w-[70px]" align="right">Plan</Th>, td: (a) => <Td key="c1" className="w-[70px]" align="right">{a.plan}</Td> },
    accesos: { th: <Th key="h2" className="w-[80px]" align="right">Accesos</Th>, td: (a) => <Td key="c2" className="w-[80px] font-semibold text-ink" align="right">{a.seatsUsed} / {a.seats}</Td> },
    rep: { th: <Th key="h3" className="w-[92px]" align="right">Comercial</Th>, td: (a) => <Td key="c3" className={cn('w-[92px]', a.rep === 'Sin asignar' && 'text-accent font-medium')} align="right">{a.rep}</Td> },
    estado: { th: <Th key="h4" className="w-[100px]" align="right">Estado</Th>, td: (a) => <div key="c4" className="w-[100px] flex justify-end"><Badge tone={tone(a.status)}>{a.status}</Badge></div> },
    alta: { th: <Th key="h5" className="w-[72px]" align="right">Alta</Th>, td: (a) => <Td key="c5" className="w-[72px]" align="right">{a.since}</Td> },
  }
  const cols = visibleColumns(vista)

  return (
    <Screen toolbar={<Toolbar title="Cuentas y accesos" right={<><SearchField placeholder="Buscar cuenta, CIF o correo" /><Link to="/admin/cuentas/nueva"><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />}>Dar de alta una cuenta</Button></Link></>} />}>
      <PageHeader title="Cuentas y accesos" subtitle="412 farmacias activas · 1.106 accesos en uso · 9 invitaciones sin aceptar" right={<span className="text-base text-muted">Sincronizado hace 4 min</span>} />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} columns={columnOptions} />}>
        {accountFilters.map((f) => <Chip key={f.key} active={filter === f.key} count={f.count} onClick={() => setFilter(f.key)}>{f.label}</Chip>)}
      </ChipRow>

      <div className="rounded-xl bg-accent-wash border border-accent-line px-5 py-3.5 flex items-center gap-4">
        <span className="h-8 w-8 rounded-full bg-surface text-accent inline-flex items-center justify-center shrink-0"><Mail size={14} /></span>
        <div className="flex-1 flex flex-col"><span className="text-base font-semibold text-ink">7 farmacias han pedido el alta desde el formulario web</span><span className="text-sm text-accent-deep mt-[1px]">Hasta que las aceptes no tienen cuenta ni accesos · la más antigua lleva 3 días esperando</span></div>
        <Link to="/admin/cuentas/solicitudes"><Button variant="primary" size="lg">Revisar solicitudes</Button></Link>
      </div>

      <TableCard footer={`${list.length} de 412 cuentas · 1.106 accesos de 1.680 contratados`} footerRight={<button onClick={() => notify('CRM exportado')}>Exportar CRM</button>}>
        <THead>
          <Th className="flex-1">Cuenta</Th>
          {cols.map((k) => cells[k].th)}
          <Th className="w-[172px]" align="right">Acciones</Th>
        </THead>
        {list.map((a, i) => (
          <Tr key={a.id} onClick={() => navigate(`/admin/cuentas/${a.id}`)} last={i === list.length - 1}>
            <TdMain title={a.name} meta={`${a.city} · ${a.owner}`} avatar={<Avatar initials={a.code} size={30} tone={i === 0 ? 'soft' : 'neutral'} />} />
            {cols.map((k) => cells[k].td(a))}
            <RowActions className="w-[172px]" onEdit={() => navigate(`/admin/cuentas/${a.id}`)} onDup={() => notify(`Duplicada ${a.name}`)} onDel={() => { setRemoved((r) => [...r, a.id]); notify(`${a.name} eliminada`) }} />
          </Tr>
        ))}
      </TableCard>
    </Screen>
  )
}
