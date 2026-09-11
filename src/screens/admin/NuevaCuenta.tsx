import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen, FooterBar } from '@/app/Shell'
import { useStore } from '@/app/store'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Input, Picker, Textarea } from '@/ui/Field'
import { Toggle } from '@/ui/Toggle'
import { repNames, addRep } from '@/data/accounts'

const L = 'label'

export function Steps({ title, steps }: { title: string; steps: { t: string; d: string }[] }) {
  return (
    <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
      <span className="text-base font-semibold text-ink">{title}</span>
      {steps.map((s, i) => (
        <div key={s.t} className="flex gap-3">
          <span className="h-5 w-5 rounded-full bg-accent-wash text-accent-deep text-xs font-bold inline-flex items-center justify-center shrink-0">{i + 1}</span>
          <div className="flex flex-col"><span className="text-base font-medium text-ink">{s.t}</span><span className="text-sm text-muted leading-4 mt-[2px]">{s.d}</span></div>
        </div>
      ))}
    </div>
  )
}

export function NuevaCuenta() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [f, setF] = useState({ name: 'Farmacia Campanar', cif: 'B-97 004 512', city: 'Valencia · 46015', col: '46 / 2907', dir: 'Av. de Campanar 88, bajo', owner: 'Irene Camps', email: 'irene@fcampanar.es', phone: '963 470 118', rep: 'Álvaro Ferrer', notes: 'Alta pactada en la visita del 9 de septiembre. No la ve la farmacia.' })
  const [invite, setInvite] = useState(true)
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  const dirty = true

  return (
    <Screen
      toolbar={<Toolbar back="/admin/cuentas" crumbs={[{ label: 'Cuentas y accesos', to: '/admin/cuentas' }, { label: 'Dar de alta una cuenta' }]} right={<span className="text-sm text-muted flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-accent' : 'bg-faint'}`} />Sin guardar</span>} />}
      footer={
        <FooterBar title="La cuenta queda activa al guardarla" subtitle="La das de alta tú, así que no pasa por la cola de solicitudes">
          <Link to="/admin/cuentas"><Button size="lg">Cancelar</Button></Link>
          <Button size="lg" onClick={() => { notify('Borrador guardado'); navigate('/admin/cuentas') }}>Guardar borrador</Button>
          <Button variant="primary" size="lg" onClick={() => { notify(`${f.name} dada de alta · invitación enviada a ${f.owner.split(' ')[0]}`); navigate('/admin/cuentas') }}>Dar de alta</Button>
        </FooterBar>
      }
    >
      <PageHeader title="Dar de alta una cuenta" subtitle="Alta directa: la cuenta nace activa y la farmacia recibe la invitación por email." right={<span className="text-base text-muted">Quedan 574 accesos de 1.680</span>} />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 rounded-xl bg-surface border border-line shadow-card p-6 flex flex-col gap-5">
          <Field label="Nombre de la farmacia" required labelClass={L}><Input value={f.name} onChange={set('name')} /></Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="CIF" required labelClass={L}><Input value={f.cif} onChange={set('cif')} /></Field>
            <Field label="Población" required labelClass={L}><Input value={f.city} onChange={set('city')} /></Field>
            <Field label="Nº de colegiado" labelClass={L}><Input value={f.col} onChange={set('col')} /></Field>
          </div>
          <Field label="Dirección" labelClass={L}><Input value={f.dir} onChange={set('dir')} /></Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Titular" required labelClass={L}><Input value={f.owner} onChange={set('owner')} /></Field>
            <Field label="Email del titular" required labelClass={L}><Input value={f.email} onChange={set('email')} /></Field>
            <Field label="Teléfono" labelClass={L}><Input value={f.phone} onChange={set('phone')} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Comercial asignado" labelClass={L}><Picker value={f.rep} options={repNames()} onChange={set("rep")} onCreate={(v) => { addRep(v); notify(`Comercial «${v}» creado · sin zona asignada todavía`) }} createLabel="Crear nuevo comercial" /></Field>
          </div>
          <Field label="Notas internas" labelClass={L}><Textarea rows={3} value={f.notes} onChange={set('notes')} /></Field>
          <div className="pt-4 border-t border-line-soft flex items-center justify-between">
            <div className="flex flex-col"><span className="text-base font-medium text-ink">Enviar la invitación al titular ahora</span><span className="text-sm text-muted">Si lo apagas, la cuenta queda activa pero nadie puede entrar todavía</span></div>
            <Toggle on={invite} onChange={setInvite} />
          </div>
        </div>
        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <Steps title="Al dar de alta" steps={[{ t: 'La cuenta nace activa', d: 'No pasa por la cola: la estás aprobando tú al crearla.' }, { t: `${f.owner.split(' ')[0]} recibe la invitación`, d: 'Pone su contraseña y ya puede dar acceso a su equipo.' }, { t: 'Entra en la zona de Álvaro', d: 'Le aparece en Mis farmacias con la visita sin programar.' }]} />
          <div className="rounded-xl bg-chrome border border-line p-5 flex flex-col">
            <span className="text-base font-semibold text-ink">El otro camino</span>
            <p className="mt-2 text-sm text-muted leading-4">Si la farmacia se registra ella misma en suprafeel.com/alta no se crea nada todavía: entra como solicitud y alguien la tiene que aceptar o rechazar.</p>
            <div className="mt-4 pt-4 border-t border-line flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Pendientes ahora</span><span className="font-semibold text-ink">7</span></div>
              <div className="flex justify-between"><span className="text-muted">La más antigua</span><span className="font-semibold text-accent">3 días</span></div>
              <div className="flex justify-between"><span className="text-muted">Con el CIF ya registrado</span><span className="font-semibold text-ink">1</span></div>
            </div>
            <Link to="/admin/cuentas/solicitudes" className="mt-5"><Button className="w-full h-9">Ver las 7 solicitudes</Button></Link>
          </div>
        </aside>
      </div>
    </Screen>
  )
}
