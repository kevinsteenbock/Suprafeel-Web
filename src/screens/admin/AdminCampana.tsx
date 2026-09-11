import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { Plus } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { campaignById, materialsOf } from '@/data/plv'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { MaterialArt } from '@/ui/MaterialArt'
import { VistaButton, useVista, gridCols } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td } from '@/ui/Table'
import { cn } from '@/lib/cn'

export function AdminCampana() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useStore()
  const c = campaignById(id)
  const [filter, setFilter] = useState('all')
  const [removed, setRemoved] = useState<string[]>([])
  const { vista, setVista, resetVista } = useVista({ mode: 'list', perRow: 4 })
  if (!c) return <Navigate to="/admin/plv" replace />
  // Las campañas de ejemplo enseñan el material de Otoño; una recién creada nace vacía.
  const demo = ['descanso', 'marca', 'navidad', 'cole', 'piel']
  const source = materialsOf(c.id).length ? materialsOf(c.id) : demo.includes(c.id) ? materialsOf('otono') : []
  const all = source.filter((m) => !removed.includes(m.id))
  const list = all.filter((m) => filter === 'all' || (filter === 'print' ? m.kind !== 'digital' && m.state === 'Publicado' : filter === 'digital' ? m.kind === 'digital' : m.state === 'Borrador'))
  const name = c.id === 'otono' ? 'Otoño 2025' : c.name

  return (
    <Screen toolbar={<Toolbar back="/admin/plv" crumbs={[{ label: 'Materiales PLV', to: '/admin/plv' }, { label: name }]} right={<><SearchField placeholder="Buscar material" /><Link to={`/admin/plv/${c.id}/nuevo-material`}><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />}>Añadir material</Button></Link></>} />}>
      <PageHeader
        title={<span className="flex items-center gap-3">{name}<Badge tone={c.adminState === 'Activa' ? 'ok' : c.adminState === 'Borrador' ? 'warn' : 'neutral'} className="mt-1">{c.adminState}</Badge></span>}
        subtitle={`${c.period} · ${c.theme.charAt(0).toUpperCase() + c.theme.slice(1)} · ${c.pharmacies} farmacias · ${c.requests} solicitudes`}
        right={<><Button onClick={() => notify('Edición de la campaña')}>Editar campaña</Button><Button onClick={() => notify('Campaña duplicada como borrador')}>Duplicar</Button><Button onClick={() => notify('Campaña archivada')}>Archivar</Button><Button variant="danger" onClick={() => notify('Pide confirmación antes de eliminar')}>Eliminar</Button></>}
      />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} />}>
        {[['all', 'Todos', all.length], ['print', 'Impreso', all.filter((m) => m.kind !== 'digital' && m.state === 'Publicado').length], ['digital', 'Digital', all.filter((m) => m.kind === 'digital').length], ['draft', 'Borradores', all.filter((m) => m.state === 'Borrador').length]].map(([k, l, n]) => <Chip key={k as string} active={filter === k} count={n as number} onClick={() => setFilter(k as string)}>{l}</Chip>)}
      </ChipRow>

      {vista.mode === 'list' ? (
        <TableCard footer={all.length ? `${all.length} materiales · ${all.filter((m) => m.kind !== 'digital').length} impresos y ${all.filter((m) => m.kind === 'digital').length} digitales` : 'Sin materiales todavía'} footerRight={all.length ? <button onClick={() => notify(`${c.requests} solicitudes`)}>Ver {c.requests} solicitudes</button> : undefined}>
          <THead><Th className="flex-1">Material</Th><Th className="w-[120px]" align="right">Suministro</Th><Th className="w-[130px]" align="right">Entrega</Th><Th className="w-[90px]" align="right">Estado</Th><Th className="w-[80px]" align="right">Solicitudes</Th><Th className="w-[130px]" align="right">Acciones</Th></THead>
          {all.length === 0 && (
            <div className="py-12 px-8 flex flex-col items-center text-center">
              <span className="text-lg font-semibold text-ink">La campaña está creada y vacía</span>
              <span className="mt-1.5 text-base text-muted max-w-[440px]">Ahora toca el material: cada uno con su nombre, su foto y sus opciones. Si es digital, también su archivo; si es impreso, sus existencias.</span>
              <Link to={`/admin/plv/${c.id}/nuevo-material`} className="mt-5">
                <Button variant="primary" size="lg" className="h-9 px-5" icon={<Plus size={13} strokeWidth={2.4} />}>Añadir el primer material</Button>
              </Link>
              <span className="mt-3 text-sm text-faint">Hasta que no publiques la campaña, las farmacias no la ven</span>
            </div>
          )}
          {list.map((m, i) => (
            <Tr key={m.id} height={58} onClick={() => navigate(`/admin/plv/${c.id}/nuevo-material?editar=${m.id}`)} last={i === list.length - 1}>
              <div className="flex-1 min-w-0 flex items-center gap-3">
                {m.state === 'Borrador' ? <span className="h-10 w-10 rounded-md bg-accent-wash border border-accent-line inline-flex items-center justify-center text-accent shrink-0"><Plus size={14} /></span> : <MaterialArt art={m.art} size={26} className="h-10 w-10 rounded-md border border-line-soft shrink-0" />}
                <span className="flex flex-col min-w-0"><span className="text-base font-medium text-ink truncate">{m.name}</span><span className="text-xs text-faint truncate">{m.kind === 'digital' ? 'Digital' : 'Impreso'} · {m.meta}</span></span>
              </div>
              <div className="w-[120px] flex flex-col items-end"><span className={cn('text-base font-semibold', m.supplyLow ? 'text-accent' : 'text-ink')}>{m.supply}</span><span className="text-xs text-faint">{m.supplyMeta}</span></div>
              <Td className="w-[130px]" align="right">{m.delivery}</Td>
              <div className="w-[90px] flex justify-end"><Badge tone={m.state === 'Publicado' ? 'ok' : 'warn'}>{m.state}</Badge></div>
              <Td className="w-[80px] font-semibold text-ink" align="right">{m.requests}</Td>
              <div className="w-[130px] flex justify-end gap-3 text-sm font-medium"><button className="text-ink" onClick={(e) => { e.stopPropagation(); navigate(`/admin/plv/${c.id}/nuevo-material?editar=${m.id}`) }}>Editar</button><button className="text-danger" onClick={(e) => { e.stopPropagation(); setRemoved((r) => [...r, m.id]); notify(`${m.name} eliminado`) }}>Eliminar</button></div>
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={gridCols(vista)}>
          {list.map((m) => (
            <button key={m.id} onClick={() => navigate(`/admin/plv/${c.id}/nuevo-material?editar=${m.id}`)} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden text-left hover:border-faint">
              <MaterialArt art={m.art} size={80} className="h-[120px] border-b border-line-soft" />
              <div className="p-3.5 flex flex-col"><div className="flex items-center justify-between gap-2"><span className="text-base font-semibold text-ink truncate">{m.name}</span><Badge tone={m.state === 'Publicado' ? 'ok' : 'warn'}>{m.state}</Badge></div><span className="text-xs text-faint mt-1">{m.supply} · {m.requests} solicitudes</span></div>
            </button>
          ))}
        </div>
      )}
    </Screen>
  )
}
