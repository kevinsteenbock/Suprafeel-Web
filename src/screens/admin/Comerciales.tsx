import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { reps as seed } from '@/data/accounts'
import { Toolbar, SearchField, PageHeader, KeyValue } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { Drawer } from '@/ui/Drawer'
import { Field, Input, Select, Textarea } from '@/ui/Field'
import { Toggle } from '@/ui/Toggle'
import { VistaButton, useVista, gridCols } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain, Bar } from '@/ui/Table'
import { cn } from '@/lib/cn'

interface Rep { initials: string; name: string; zone: string; pharmacies: number; coverage: number; visits: number; email?: string; phone?: string; state?: 'Activo' | 'Invitado' }

const zones = ['Zona Levante', 'Zona Centro', 'Zona Cataluña', 'Zona Andalucía', 'Zona Norte', 'Zona Galicia', 'Zona Canarias', 'Zona Baleares']

const initialsOf = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '··'

export function Comerciales() {
  const { notify } = useStore()
  const [reps, setReps] = useState<Rep[]>(seed.map((r) => ({ ...r, state: 'Activo', email: `${r.name.toLowerCase().replace(/\s+/g, '.')}@suprafeel.com` })))
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<Rep | null>(null)
  const [alta, setAlta] = useState(false)
  const { vista, setVista, resetVista } = useVista({ mode: 'list', perRow: 3 })
  const list = reps.filter((r) => (filter === 'all' ? true : filter === 'low' ? r.coverage < 65 : filter === 'new' ? r.state === 'Invitado' : r.coverage >= 70))
  const freeZones = zones.filter((z) => !reps.some((r) => r.zone === z))

  return (
    <Screen toolbar={<Toolbar title="Comerciales" right={<><SearchField placeholder="Buscar comercial o zona" /><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => setAlta(true)}>Nuevo comercial</Button></>} />}>
      <PageHeader
        title="Comerciales"
        subtitle={`${reps.length} comerciales · ${reps.reduce((a, r) => a + r.pharmacies, 0)} farmacias asignadas · cobertura media del ${Math.round(reps.reduce((a, r) => a + r.coverage, 0) / reps.length)} % en Q3`}
        right={<span className="text-base text-muted">45 farmacias sin comercial asignado</span>}
      />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} />}>
        {[['all', 'Todos', reps.length], ['high', 'Cobertura alta', reps.filter((r) => r.coverage >= 70).length], ['low', 'Cobertura baja', reps.filter((r) => r.coverage < 65).length], ['new', 'Sin aceptar', reps.filter((r) => r.state === 'Invitado').length]].map(([k, l, n]) => (
          <Chip key={k as string} active={filter === k} count={n as number} onClick={() => setFilter(k as string)}>{l}</Chip>
        ))}
      </ChipRow>

      {vista.mode === 'list' ? (
        <TableCard footer={`${list.length} de ${reps.length} comerciales`} footerRight={<button onClick={() => notify('Informe exportado')}>Exportar informe</button>}>
          <THead><Th className="flex-1">Comercial</Th><Th className="w-[90px]" align="right">Farmacias</Th><Th className="w-[140px]">Cobertura Q3</Th><Th className="w-[90px]" align="right">Visitas / mes</Th><Th className="w-[90px]" align="right">Estado</Th></THead>
          {list.map((r, i) => (
            <Tr key={r.name} onClick={() => setOpen(r)} last={i === list.length - 1}>
              <TdMain title={r.name} meta={r.zone} avatar={<Avatar initials={r.initials} size={30} tone={i === 0 ? 'soft' : 'neutral'} rounded="full" />} />
              <Td className="w-[90px] font-semibold text-ink" align="right">{r.pharmacies}</Td>
              <div className="w-[140px] flex items-center gap-2">
                {r.coverage ? <><Bar value={r.coverage} width={70} tone={r.coverage >= 65 ? 'ok' : 'warn'} /><span className={cn('text-sm', r.coverage < 65 ? 'text-warn font-medium' : 'text-muted')}>{r.coverage} %</span></> : <span className="text-sm text-faint">sin datos</span>}
              </div>
              <Td className="w-[90px]" align="right">{r.visits || '—'}</Td>
              <div className="w-[90px] flex justify-end"><Badge tone={r.state === 'Invitado' ? 'warn' : 'ok'}>{r.state ?? 'Activo'}</Badge></div>
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={gridCols(vista)}>
          {list.map((r) => (
            <button key={r.name} onClick={() => setOpen(r)} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3 text-left hover:border-faint">
              <div className="flex items-center gap-3">
                <Avatar initials={r.initials} size={36} tone="soft" rounded="full" />
                <span className="flex-1 flex flex-col"><span className="text-base font-semibold text-ink">{r.name}</span><span className="text-xs text-faint">{r.zone}</span></span>
                <Badge tone={r.state === 'Invitado' ? 'warn' : 'ok'}>{r.state ?? 'Activo'}</Badge>
              </div>
              <Bar value={r.coverage} width={999} className="w-full" tone={r.coverage >= 65 ? 'ok' : 'warn'} />
              <span className="text-sm text-muted">{r.pharmacies} farmacias · {r.coverage} % cobertura · {r.visits} visitas/mes</span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <Drawer
          open
          onClose={() => setOpen(null)}
          title={open.name}
          subtitle={open.zone}
          badge={<Badge tone={open.state === 'Invitado' ? 'warn' : 'ok'}>{open.state ?? 'Activo'}</Badge>}
          width={420}
          footer={<><Button size="lg" onClick={() => notify('Elige otra zona para este comercial')}>Reasignar zona</Button><Button variant="primary" size="lg" onClick={() => { notify('Ficha guardada'); setOpen(null) }}>Guardar</Button></>}
        >
          <div className="flex items-center gap-4">
            <Avatar initials={open.initials} size={56} tone="soft" rounded="full" />
            <div className="flex flex-col"><span className="text-lg font-semibold text-ink">{open.name}</span><span className="text-sm text-muted">{open.email}</span></div>
          </div>
          <KeyValue className="mt-5" labelWidth={130} rows={[{ k: 'Zona', v: open.zone }, { k: 'Farmacias', v: `${open.pharmacies} asignadas` }, { k: 'Visitas este mes', v: String(open.visits) }]} />
          {open.state === 'Invitado' ? (
            <>
              <span className="label mt-6">Estado del alta</span>
              <div className="mt-2 rounded-lg bg-warn-wash border border-warn-line px-3.5 py-3 flex flex-col">
                <span className="text-base font-semibold text-[#7A5A18]">Invitación enviada, sin aceptar</span>
                <span className="text-sm text-[#7A5A18] mt-1 leading-4">Hasta que entre por primera vez no puede registrar visitas ni ver sus farmacias.</span>
                <div className="mt-3 flex gap-2">
                  <Button size="lg" onClick={() => notify('Invitación reenviada')}>Reenviar invitación</Button>
                  <Button size="lg" variant="danger" onClick={() => { setReps((rs) => rs.filter((x) => x.name !== open.name)); setOpen(null); notify('Alta cancelada') }}>Cancelar alta</Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="label mt-6">Últimas altas que ha traído</span>
              <div className="mt-2 rounded-lg bg-surface border border-line overflow-hidden">
                {['Farmacia Benimaclet · jul 2025', 'Farmacia Port Saplà · sep 2025', 'Farmacia San Jaume · pendiente de aprobar'].map((t, i) => (
                  <div key={t} className={cn('h-10 px-3 flex items-center text-base text-ink', i < 2 && 'border-b border-line-soft')}>{t}</div>
                ))}
              </div>
            </>
          )}
        </Drawer>
      )}

      {alta && (
        <AltaComercial
          zones={freeZones}
          taken={reps}
          onClose={() => setAlta(false)}
          onCreate={(rep) => { setReps((rs) => [...rs, rep]); setAlta(false); notify(`${rep.name} dado de alta${rep.state === 'Invitado' ? ` · invitación enviada a ${rep.email}` : ''}`) }}
        />
      )}
    </Screen>
  )
}

function AltaComercial({ zones, taken, onClose, onCreate }: { zones: string[]; taken: Rep[]; onClose: () => void; onCreate: (r: Rep) => void }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', zone: zones[0] ?? 'Zona Levante', pharmacies: '0', notes: '' })
  const [invite, setInvite] = useState(true)
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  const email = f.email.trim()
  const dupe = !!email && taken.some((r) => r.email?.toLowerCase() === email.toLowerCase())
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  const missing = !f.name.trim() ? 'el nombre' : !email ? 'el correo' : !emailOk ? 'un correo válido' : dupe ? 'un correo que no esté usado' : null
  const shown = zones.length ? zones : ['Zona Levante', 'Zona Centro', 'Zona Cataluña']

  return (
    <Drawer
      open
      onClose={onClose}
      title="Nuevo comercial"
      subtitle="Se le asigna una zona y recibe la invitación por correo"
      width={448}
      footer={
        <>
          <span className="text-sm text-muted">{missing ? `Falta ${missing}` : 'Listo para darlo de alta'}</span>
          <div className="flex gap-2">
            <Button size="lg" onClick={onClose}>Cancelar</Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!!missing}
              onClick={() => onCreate({ initials: initialsOf(f.name), name: f.name.trim(), zone: f.zone, pharmacies: Number(f.pharmacies) || 0, coverage: 0, visits: 0, email, phone: f.phone.trim(), state: invite ? 'Invitado' : 'Activo' })}
            >
              Dar de alta
            </Button>
          </div>
        </>
      }
    >
      <div className="flex items-center gap-3.5">
        <Avatar initials={f.name ? initialsOf(f.name) : '··'} size={48} tone={f.name ? 'soft' : 'outline'} rounded="full" />
        <div className="flex flex-col">
          <span className="text-base font-semibold text-ink">{f.name || 'Sin nombre todavía'}</span>
          <span className="text-sm text-muted">{f.zone}</span>
        </div>
      </div>

      <span className="label mt-6">Quién es</span>
      <div className="mt-3 flex flex-col gap-3.5">
        <Field label="Nombre y apellidos" required><Input value={f.name} onChange={set('name')} placeholder="Ej.: Marta Ruiz Ferrán" focus /></Field>
        <Field label="Correo de Suprafeel" required hint={dupe || (email && !emailOk) ? undefined : 'Con este correo entrará en la aplicación'}>
          <Input value={f.email} onChange={set('email')} placeholder="nombre.apellido@suprafeel.com" />
        </Field>
        {dupe && <span className="-mt-2.5 text-xs text-danger">Ese correo ya está en otro comercial.</span>}
        {!!email && !emailOk && !dupe && <span className="-mt-2.5 text-xs text-warn">Eso no parece un correo.</span>}
        <Field label="Teléfono"><Input value={f.phone} onChange={set('phone')} placeholder="+34 ___ __ __ __" /></Field>
      </div>

      <span className="label mt-6">Qué lleva</span>
      <div className="mt-3 flex flex-col gap-3.5">
        <Field label="Zona" required hint={zones.length ? `${zones.length} zonas sin comercial` : 'Todas las zonas tienen comercial: esta se compartirá'}>
          <div className="flex flex-wrap gap-2">
            {shown.map((z) => (
              <button key={z} type="button" onClick={() => set('zone')(z)} className={cn('h-8 rounded-md px-3 text-md font-medium border inline-flex items-center gap-1.5', f.zone === z ? 'bg-accent-wash border-accent-line text-accent-deep' : 'bg-surface border-line text-ink-soft hover:bg-chrome')}>
                {f.zone === z && <Check size={12} strokeWidth={2.5} />}
                {z}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Farmacias que le asignas" hint="De las 45 sin comercial"><Input value={f.pharmacies} onChange={set('pharmacies')} /></Field>
          <Field label="Días de ruta"><Select value="Martes y jueves" chevron="down" /></Field>
        </div>
        <Field label="Notas internas"><Textarea rows={3} value={f.notes} onChange={set('notes')} placeholder="De dónde viene, qué zona conoce, con quién ha trabajado…" /></Field>
      </div>

      <div className="mt-6 pt-4 border-t border-line-soft flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-base font-medium text-ink">Enviar la invitación ahora</span>
          <span className="text-sm text-muted">Si lo apagas, queda dado de alta pero no puede entrar</span>
        </div>
        <Toggle on={invite} onChange={setInvite} />
      </div>
    </Drawer>
  )
}
