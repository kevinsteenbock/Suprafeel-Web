import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check, Lock } from 'lucide-react'
import { Screen, FooterBar } from '@/app/Shell'
import { useStore } from '@/app/store'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Input, Select, Textarea } from '@/ui/Field'
import { Toggle } from '@/ui/Toggle'
import { Steps } from './NuevaCuenta'
import { cn } from '@/lib/cn'

export function NuevaCampana() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [f, setF] = useState({ name: 'Menopausia', from: '01/03/2026', to: '31/05/2026', notes: 'Campaña de apoyo al consejo en perimenopausia. El expositor va en la zona de dermo, no en el lineal de vitaminas. Recordar que el argumentario no puede prometer resultados clínicos.', limit: '1 expositor · 2 carteles · 50 folletos' })
  const [target, setTarget] = useState('Todas · 412')
  const [types, setTypes] = useState(['Impreso', 'Digital'])
  const [notifyReps, setNotifyReps] = useState(true)
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  const toggleType = (t: string) => setTypes((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))

  return (
    <Screen
      toolbar={<Toolbar back="/admin/plv" crumbs={[{ label: 'Materiales PLV', to: '/admin/plv' }, { label: 'Nueva campaña' }]} right={<span className="text-sm text-muted flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Sin guardar</span>} />}
      footer={
        <FooterBar title="La campaña se crea vacía" subtitle="Al crearla se abre su ficha y ahí añades los materiales">
          <Link to="/admin/plv"><Button size="lg">Cancelar</Button></Link>
          <Button size="lg" onClick={() => { notify('Borrador guardado'); navigate('/admin/plv') }}>Guardar borrador</Button>
          <Button variant="primary" size="lg" disabled={!f.name} onClick={() => { notify(`Campaña «${f.name}» creada · ahora añade los materiales`); navigate('/admin/plv/otono') }}>Crear campaña</Button>
        </FooterBar>
      }
    >
      <PageHeader title="Nueva campaña" subtitle="Primero el nombre y las condiciones. Los materiales se añaden después, dentro de la campaña." />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 rounded-xl bg-surface border border-line shadow-card p-6 flex flex-col gap-5">
          <Field label="Nombre de la campaña" required labelClass="label"><Input value={f.name} onChange={set('name')} /></Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Desde" required labelClass="label"><Input value={f.from} onChange={set('from')} /></Field>
            <Field label="Hasta" required labelClass="label"><Input value={f.to} onChange={set('to')} /></Field>
            <Field label="Tema" labelClass="label"><Select value="Mujer y hormonal" chevron="down" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Farmacias destinatarias" labelClass="label">
              <div className="h-[34px] rounded-md bg-surface border border-line p-[3px] flex">
                {['Todas · 412', 'Por zona', 'Manual'].map((o) => <button key={o} onClick={() => setTarget(o)} className={cn('flex-1 rounded-[6px] text-base font-medium', target === o ? 'bg-accent text-on-accent' : 'text-ink-soft hover:bg-chrome')}>{o}</button>)}
              </div>
            </Field>
            <Field label="Tipo de material" labelClass="label">
              <div className="flex gap-2">
                {['Impreso', 'Digital', 'Merchandising'].map((t) => { const on = types.includes(t); return <button key={t} onClick={() => toggleType(t)} className={cn('h-[34px] flex-1 rounded-md border text-base font-medium inline-flex items-center justify-center gap-1.5', on ? 'bg-accent-wash border-accent-line text-accent-deep' : 'bg-surface border-line text-ink-soft')}>{on && <Check size={12} strokeWidth={2.5} />}{t}</button> })}
              </div>
            </Field>
          </div>
          <Field label="Notas para el mostrador" labelClass="label"><Textarea rows={4} value={f.notes} onChange={set('notes')} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Límite por farmacia" labelClass="label"><Input value={f.limit} onChange={set('limit')} /></Field>
            <Field label="Cierre de solicitudes" labelClass="label"><Select value="15 días antes del fin" chevron="down" /></Field>
          </div>
          <div className="pt-4 border-t border-line-soft flex items-center justify-between">
            <div className="flex flex-col"><span className="text-base font-medium text-ink">Avisar a los comerciales al publicar</span><span className="text-sm text-muted">Los 6 comerciales reciben la campaña en su panel de Materiales PLV</span></div>
            <Toggle on={notifyReps} onChange={setNotifyReps} />
          </div>
        </div>
        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <Steps title="Cómo funciona" steps={[{ t: 'Creas la campaña', d: 'Nombre, periodo y a qué farmacias llega.' }, { t: 'Añades los materiales dentro', d: 'Cada uno con su nombre, su foto y sus opciones. Si es digital, también su archivo; si es impreso, sus existencias.' }, { t: 'La publicas', d: 'Hasta que no la publiques, las farmacias no la ven.' }]} />
          <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col">
            <span className="text-base font-semibold text-ink flex items-center gap-2"><Lock size={13} className="text-muted" />Materiales</span>
            <div className="mt-3 h-[220px] rounded-lg border border-dashed border-line flex flex-col items-center justify-center text-center px-6"><span className="text-base font-semibold text-ink">Se activan al crear la campaña</span><span className="text-sm text-muted mt-1.5 leading-4">Un material siempre pertenece a una campaña, así que todavía no hay dónde añadirlo.</span></div>
          </div>
        </aside>
      </div>
    </Screen>
  )
}
