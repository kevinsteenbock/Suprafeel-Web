import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Plus } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { accountById } from '@/data/accounts'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { TableCard, THead, Th, Tr, Td, TdMain, Bar } from '@/ui/Table'
import { cn } from '@/lib/cn'

export function Cuenta() {
  const { id } = useParams()
  const { notify } = useStore()
  const a = accountById(id)
  const [people, setPeople] = useState(a?.people ?? [])
  const [status, setStatus] = useState(a?.status ?? 'Activa')
  if (!a) return <Navigate to="/admin/cuentas" replace />
  const used = people.filter((p) => p.state === 'Activo').length
  const tone = status === 'Activa' ? 'ok' : status === 'Suspendida' ? 'danger' : 'warn'

  return (
    <Screen toolbar={<Toolbar back="/admin/cuentas" crumbs={[{ label: 'Cuentas y accesos', to: '/admin/cuentas' }, { label: a.name }]} right={<><SearchField placeholder="Buscar cuenta, CIF o correo" /><Link to="/admin/cuentas/nueva"><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />}>Dar de alta una cuenta</Button></Link></>} />}>
      <PageHeader
        title={<span className="flex items-center gap-3">{a.name}<Badge tone={tone} className="mt-1">{status}</Badge></span>}
        subtitle={`${a.city} · ${a.cif} · plan ${a.plan} · alta en ${a.since === 'mar 2023' ? 'marzo de 2023' : a.since} · ${a.rep}`}
        right={<><Button onClick={() => notify('Edición de datos')}>Editar datos</Button><Button onClick={() => notify('Cuenta duplicada como borrador')}>Duplicar</Button><Button onClick={() => { setStatus((s) => (s === 'Suspendida' ? 'Activa' : 'Suspendida')); notify(status === 'Suspendida' ? 'Cuenta reactivada' : 'Cuenta suspendida') }}>{status === 'Suspendida' ? 'Reactivar' : 'Suspender'}</Button><Button variant="danger" onClick={() => notify('Pide confirmación por correo antes de eliminar')}>Eliminar</Button></>}
      />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="rounded-xl bg-surface border border-line shadow-card p-6 grid grid-cols-3 gap-y-5 gap-x-6">
            {[['CIF', a.cif], ['Dirección', a.address], ['Población', a.postal], ['Titular', a.owner], ['Email', a.email], ['Teléfono', a.phone], ['Plan', `${a.plan} · ${a.seats} accesos`], ['Comercial', `${a.rep} · Zona Levante`], ['Alta', a.since === 'mar 2023' ? '14 de marzo de 2023' : a.since]].map(([k, v]) => (
              <div key={k} className="flex flex-col"><span className="label">{k}</span><span className="mt-1.5 text-base text-ink">{v}</span></div>
            ))}
          </div>

          <TableCard footer={`${used} accesos en uso de ${a.seats} · ${people.filter((p) => p.state === 'Invitado').length} invitación sin aceptar`} footerRight={<button onClick={() => notify('Plan ampliado a 10 accesos')}>Subir a 10 accesos</button>}>
            <THead><Th className="flex-1">Persona con acceso</Th><Th className="w-[100px]" align="right">Rol</Th><Th className="w-[110px]" align="right">Último acceso</Th><Th className="w-[90px]" align="right">Estado</Th><Th className="w-[130px]" align="right">Acciones</Th></THead>
            {people.map((p) => (
              <Tr key={p.email}>
                <TdMain title={p.name} meta={p.email} avatar={<Avatar initials={p.initials} size={30} tone="neutral" rounded="full" />} />
                <Td className="w-[100px]" align="right">{p.role}</Td>
                <Td className="w-[110px]" align="right">{p.last}</Td>
                <div className="w-[90px] flex justify-end"><Badge tone={p.state === 'Activo' ? 'ok' : p.state === 'Invitado' ? 'warn' : 'neutral'}>{p.state}</Badge></div>
                <div className="w-[130px] flex justify-end gap-3 text-sm font-medium">
                  {p.state === 'Activo' && <><button className="text-ink" onClick={() => notify('Editar acceso')}>Editar</button><button className="text-danger" onClick={() => setPeople((ps) => ps.map((x) => (x.email === p.email ? { ...x, state: 'Retirado', last: 'retirado hoy' } : x)))}>Quitar</button></>}
                  {p.state === 'Invitado' && <><button className="text-ink" onClick={() => notify('Invitación reenviada')}>Reenviar</button><button className="text-muted" onClick={() => setPeople((ps) => ps.filter((x) => x.email !== p.email))}>Cancelar</button></>}
                  {p.state === 'Retirado' && <button className="text-ink" onClick={() => setPeople((ps) => ps.map((x) => (x.email === p.email ? { ...x, state: 'Activo', last: 'hoy' } : x)))}>Reactivar</button>}
                </div>
              </Tr>
            ))}
            <button onClick={() => { setPeople((ps) => [...ps, { initials: 'NU', name: 'Nueva persona', email: 'pendiente@' + a.email.split('@')[1], role: 'Auxiliar', last: 'invitado ahora', state: 'Invitado' }]); notify('Invitación enviada') }} className="h-[54px] px-4 flex items-center gap-3 text-left hover:bg-canvas">
              <span className="h-[30px] w-[30px] rounded-full bg-accent-wash text-accent inline-flex items-center justify-center"><Plus size={14} /></span>
              <span className="text-base font-medium text-accent">Invitar a alguien del mostrador</span><span className="text-sm text-muted">quedan {a.seats - used} accesos libres de {a.seats}</span>
            </button>
          </TableCard>
        </div>

        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col">
            <span className="text-base font-semibold text-ink">Uso de la cuenta</span>
            <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted">Accesos en uso</span><span className="font-semibold text-ink">{used} de {a.seats}</span></div>
            <Bar value={(used / a.seats) * 100} width={999} className="w-full mt-2" tone="accent" />
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              {[['Consultas al chat', a.usage.chat], ['Cursos completados', a.usage.courses], ['Último pedido', a.usage.order], ['Material PLV pedido', a.usage.plv]].map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-muted">{k}</span><span className="font-medium text-ink">{v}</span></div>)}
            </div>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col">
            <span className="text-base font-semibold text-ink">Actividad de la cuenta</span>
            <div className="mt-4 flex flex-col gap-3.5">
              {a.activity.map((x) => (
                <div key={x.title} className="flex gap-3"><span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', x.live ? 'bg-accent' : 'bg-line')} /><div className="flex flex-col"><span className="text-base text-ink">{x.title}</span><span className="text-xs text-faint">{x.meta}</span></div></div>
              ))}
            </div>
            <button className="mt-5 text-sm font-medium text-accent text-left" onClick={() => notify('Histórico completo')}>Ver todo el histórico</button>
          </div>
        </aside>
      </div>
    </Screen>
  )
}
