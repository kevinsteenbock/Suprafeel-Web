import { useState } from 'react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { requests as all, repNames, addRep, type SignupRequest } from '@/data/accounts'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { VistaButton, useVista } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { Picker } from '@/ui/Field'
import { cn } from '@/lib/cn'

export function Solicitudes() {
  const { notify } = useStore()
  const [reqs, setReqs] = useState<SignupRequest[]>(all)
  const [filter, setFilter] = useState('pending')
  const [sel, setSel] = useState(all[0].id)
  const [assigned, setAssigned] = useState<Record<string, string>>({})
  const { vista, setVista, resetVista } = useVista({ mode: 'list' })
  const list = reqs.filter((r) => (filter === 'pending' ? r.state === 'Pendiente' : filter === 'ok' ? r.state === 'Aceptada' : filter === 'ko' ? r.state === 'Rechazada' : !!r.blocked))
  const cur = reqs.find((r) => r.id === sel) ?? list[0]
  const repFor = (r: SignupRequest) => assigned[r.id] ?? (r.via !== 'Formulario web' ? r.via : 'Álvaro Ferrer')
  const decide = (id: string, state: 'Aceptada' | 'Rechazada') => {
    setReqs((rs) => rs.map((r) => (r.id === id ? { ...r, state } : r)))
    const r = reqs.find((x) => x.id === id)!
    notify(state === 'Aceptada' ? `${r.name} dada de alta · invitación enviada a ${r.owner.split(' ')[0]}` : `${r.name} rechazada`)
    const next = list.find((x) => x.id !== id && x.state === 'Pendiente')
    if (next) setSel(next.id)
  }
  const pending = reqs.filter((r) => r.state === 'Pendiente').length

  return (
    <Screen toolbar={<Toolbar back="/admin/cuentas" crumbs={[{ label: 'Cuentas y accesos', to: '/admin/cuentas' }, { label: 'Solicitudes de alta' }]} right={<><SearchField placeholder="Buscar solicitud o CIF" /><Button onClick={() => notify('Ajustes del formulario público')}>Ajustes del formulario</Button></>} />}>
      <PageHeader title="Solicitudes de alta" subtitle={`${pending} pendientes · ${31 + reqs.filter((r) => r.state === 'Aceptada').length} aceptadas y ${2 + reqs.filter((r) => r.state === 'Rechazada').length} rechazadas este año · 1 con el CIF ya registrado`} right={<span className="text-base text-muted">suprafeel.com/alta</span>} />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} />}>
        <Chip active={filter === 'pending'} count={pending} onClick={() => setFilter('pending')}>Pendientes</Chip>
        <Chip active={filter === 'ok'} count={31 + reqs.filter((r) => r.state === 'Aceptada').length} onClick={() => setFilter('ok')}>Aceptadas</Chip>
        <Chip active={filter === 'ko'} count={2 + reqs.filter((r) => r.state === 'Rechazada').length} onClick={() => setFilter('ko')}>Rechazadas</Chip>
        <Chip active={filter === 'cif'} count={1} onClick={() => setFilter('cif')}>Revisar CIF</Chip>
      </ChipRow>

      <div className="flex gap-6">
        <TableCard className="flex-1 min-w-0" footer={`${list.length} ${filter === 'pending' ? 'pendientes · la más antigua lleva 3 días' : 'en esta vista'}`} footerRight={filter === 'pending' ? <button onClick={() => { setReqs((rs) => rs.map((r) => (r.state === 'Pendiente' && !r.blocked ? { ...r, state: 'Aceptada' } : r))); notify('6 solicitudes aceptadas · invitaciones enviadas') }}>Aceptar las 6 verificadas</button> : undefined}>
          <THead><Th className="flex-1">Solicitud</Th><Th className="w-[50px]" align="right">Plan</Th><Th className="w-[70px]" align="right">Recibida</Th><Th className="w-[150px]" align="right">Decisión</Th></THead>
          {list.length === 0 && <div className="p-8 text-center text-base text-muted">Nada en esta vista.</div>}
          {list.map((r, i) => (
            <Tr key={r.id} height={66} active={cur?.id === r.id} onClick={() => setSel(r.id)} last={i === list.length - 1}>
              <TdMain title={r.name} meta={r.meta} metaTone={r.blocked ? 'danger' : 'faint'} avatar={<Avatar initials={r.code} size={30} tone={r.blocked ? 'neutral' : 'soft'} />} />
              <Td className="w-[50px]" align="right">{r.plan}</Td>
              <Td className="w-[70px]" align="right">{r.received}</Td>
              <div className="w-[150px] flex items-center justify-end gap-2">
                {r.state === 'Pendiente' ? (
                  <><Button size="sm" disabled={r.blocked} onClick={(e) => { e.stopPropagation(); decide(r.id, 'Aceptada') }}>Aceptar</Button><button onClick={(e) => { e.stopPropagation(); decide(r.id, 'Rechazada') }} className="text-sm font-medium text-ink-soft hover:text-danger">Rechazar</button></>
                ) : <Badge tone={r.state === 'Aceptada' ? 'ok' : 'danger'}>{r.state}</Badge>}
              </div>
            </Tr>
          ))}
        </TableCard>

        {cur && (
          <aside className="w-[340px] shrink-0 rounded-xl bg-surface border border-line shadow-card flex flex-col">
            <div className="p-4 border-b border-line-soft">
              <div className="flex items-center justify-between"><span className="text-lg font-semibold text-ink">{cur.name}</span><Badge tone={cur.state === 'Pendiente' ? 'warn' : cur.state === 'Aceptada' ? 'ok' : 'danger'}>{cur.state}</Badge></div>
              <p className="mt-1.5 text-sm text-muted leading-4">{cur.state === 'Pendiente' ? `Recibida ${cur.received} desde ${cur.via === 'Formulario web' ? 'el formulario web' : 'un comercial'} · no tiene cuenta ni accesos todavía` : cur.state === 'Aceptada' ? 'Cuenta creada · invitación enviada al titular' : 'Rechazada · el titular ha recibido el aviso'}</p>
            </div>
            <div className="p-4 flex flex-col gap-2.5 text-base">
              {[['CIF', cur.cif], ['Dirección', cur.address], ['Población', cur.city], ['Titular', cur.owner], ['Email', cur.email], ['Teléfono', cur.phone], ['Nº de colegiado', cur.collegiate], ['Plan que pide', cur.planLabel], ['Nos conoció por', cur.via]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3"><span className="text-sm text-muted">{k}</span><span className={cn('text-ink text-right', k === 'CIF' && cur.blocked && 'text-danger font-medium')}>{v}</span></div>
              ))}
            </div>
            {cur.blocked && <div className="mx-4 mb-3 rounded-lg bg-danger-wash border border-danger-line px-3 py-2.5 text-sm text-[#7E2323]">Este CIF ya está en otra cuenta (Farmacia Paterna Nord). Pide más datos antes de aceptar.</div>}
            <div className="mt-auto p-4 border-t border-line-soft flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted shrink-0">Comercial que se le asigna</span><Picker size="sm" className="w-[168px]" value={repFor(cur)} options={repNames()} onChange={(v) => setAssigned((a) => ({ ...a, [cur.id]: v }))} onCreate={(v) => { addRep(v); notify(`Comercial «${v}» creado`) }} createLabel="Crear nuevo comercial" /></div>
              <p className="text-sm text-muted leading-4">Al aceptar se crea la cuenta con plan {cur.plan}, se envía la invitación a {cur.owner.split(' ')[0]} y entra en la zona de {repFor(cur).split(' ')[0]}.</p>
              <Button variant="primary" size="lg" className="w-full h-9 mt-1" disabled={cur.state !== 'Pendiente' || cur.blocked} onClick={() => decide(cur.id, 'Aceptada')}>Aceptar y dar de alta</Button>
              <div className="flex gap-2"><Button size="lg" className="flex-1" onClick={() => notify(`Pedidos más datos a ${cur.owner}`)}>Pedir más datos</Button><Button variant="danger" size="lg" className="flex-1" disabled={cur.state !== 'Pendiente'} onClick={() => decide(cur.id, 'Rechazada')}>Rechazar</Button></div>
            </div>
          </aside>
        )}
      </div>
    </Screen>
  )
}
