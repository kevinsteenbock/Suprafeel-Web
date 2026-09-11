import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { reps } from '@/data/accounts'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Avatar } from '@/ui/Avatar'
import { Drawer } from '@/ui/Drawer'
import { VistaButton, useVista } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain, Bar } from '@/ui/Table'
import { KeyValue } from '@/ui/Page'
import { cn } from '@/lib/cn'

export function Comerciales() {
  const { notify } = useStore()
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<(typeof reps)[number] | null>(null)
  const { vista, setVista } = useVista({ mode: 'list', perRow: 3 })
  const list = reps.filter((r) => filter === 'all' || (filter === 'low' ? r.coverage < 65 : r.coverage >= 70))
  return (
    <Screen toolbar={<Toolbar title="Comerciales" right={<><SearchField placeholder="Buscar comercial o zona" /><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => notify('Alta de comercial')}>Nuevo comercial</Button></>} />}>
      <PageHeader title="Comerciales" subtitle="6 comerciales · 367 farmacias asignadas · cobertura media del 66 % en Q3" right={<span className="text-base text-muted">45 farmacias sin comercial asignado</span>} />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} />}>
        {[['all', 'Todos', 6], ['high', 'Cobertura alta', 3], ['low', 'Cobertura baja', 2]].map(([k, l, n]) => <Chip key={k as string} active={filter === k} count={n as number} onClick={() => setFilter(k as string)}>{l}</Chip>)}
      </ChipRow>
      {vista.mode === 'list' ? (
        <TableCard footer={`${list.length} de 6 comerciales`} footerRight={<button onClick={() => notify('Informe exportado')}>Exportar informe</button>}>
          <THead><Th className="flex-1">Comercial</Th><Th className="w-[90px]" align="right">Farmacias</Th><Th className="w-[140px]">Cobertura Q3</Th><Th className="w-[90px]" align="right">Visitas / mes</Th></THead>
          {list.map((r, i) => (
            <Tr key={r.name} onClick={() => setOpen(r)} last={i === list.length - 1}>
              <TdMain title={r.name} meta={r.zone} avatar={<Avatar initials={r.initials} size={30} tone={i === 0 ? 'soft' : 'neutral'} rounded="full" />} />
              <Td className="w-[90px] font-semibold text-ink" align="right">{r.pharmacies}</Td>
              <div className="w-[140px] flex items-center gap-2"><Bar value={r.coverage} width={70} tone={r.coverage >= 65 ? 'ok' : 'warn'} /><span className={cn('text-sm', r.coverage < 65 ? 'text-warn font-medium' : 'text-muted')}>{r.coverage} %</span></div>
              <Td className="w-[90px]" align="right">{r.visits}</Td>
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${vista.perRow}, minmax(0, 1fr))` }}>
          {list.map((r) => <button key={r.name} onClick={() => setOpen(r)} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3 text-left hover:border-faint"><div className="flex items-center gap-3"><Avatar initials={r.initials} size={36} tone="soft" rounded="full" /><span className="flex flex-col"><span className="text-base font-semibold text-ink">{r.name}</span><span className="text-xs text-faint">{r.zone}</span></span></div><Bar value={r.coverage} width={999} className="w-full" tone={r.coverage >= 65 ? 'ok' : 'warn'} /><span className="text-sm text-muted">{r.pharmacies} farmacias · {r.coverage} % cobertura · {r.visits} visitas/mes</span></button>)}
        </div>
      )}
      {open && (
        <Drawer open onClose={() => setOpen(null)} title={open.name} subtitle={open.zone} width={420} footer={<><Button size="lg" onClick={() => notify('Zona reasignada')}>Reasignar zona</Button><Button variant="primary" size="lg" onClick={() => { notify('Ficha guardada'); setOpen(null) }}>Guardar</Button></>}>
          <div className="flex items-center gap-4"><Avatar initials={open.initials} size={56} tone="soft" rounded="full" /><div className="flex flex-col"><span className="text-lg font-semibold text-ink">{open.name}</span><span className="text-sm text-muted">{open.name.toLowerCase().replace(' ', '.')}@suprafeel.com</span></div></div>
          <KeyValue className="mt-5" labelWidth={130} rows={[{ k: 'Zona', v: open.zone }, { k: 'Farmacias', v: `${open.pharmacies} asignadas` }, { k: 'Cobertura Q3', v: `${open.coverage} %` }, { k: 'Visitas este mes', v: String(open.visits) }, { k: 'Formación en zona', v: '58 % de media' }]} />
          <span className="label mt-6">Últimas altas que ha traído</span>
          <div className="mt-2 rounded-lg bg-surface border border-line overflow-hidden">{['Farmacia Benimaclet · jul 2025', 'Farmacia Port Saplà · sep 2025', 'Farmacia San Jaume · pendiente de aprobar'].map((t, i) => <div key={t} className={cn('h-10 px-3 flex items-center text-base text-ink', i < 2 && 'border-b border-line-soft')}>{t}</div>)}</div>
        </Drawer>
      )}
    </Screen>
  )
}
