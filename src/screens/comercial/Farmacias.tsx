import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search, X, Mail, PencilLine, ChevronRight, QrCode, Clock, Send } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { filterPharmacies, pharmacyFilters, registry } from '@/data/pharmacies'
import { Toolbar, SearchField, PageHeader, Notice } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { Drawer } from '@/ui/Drawer'
import { Field, Input, Textarea } from '@/ui/Field'
import { Avatar } from '@/ui/Avatar'
import { VistaButton, useVista } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'

export function Farmacias() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [panel, setPanel] = useState<null | 'buscar' | 'alta'>(null)
  const { vista, setVista } = useVista({ mode: 'list' })
  const list = filterPharmacies(filter).filter((p) => !q || (p.name + p.city + p.owner).toLowerCase().includes(q.toLowerCase()))
  const tone = (s: string): 'ok' | 'danger' | 'accent' => (s === 'Activa' ? 'ok' : s === 'En riesgo' ? 'danger' : 'accent')

  return (
    <Screen
      toolbar={
        <Toolbar
          title="Mis farmacias"
          right={
            <>
              <div className="h-7 w-[208px] rounded-[7px] bg-surface border border-line px-[10px] flex items-center gap-[7px]"><Search size={13} className="text-faint" /><input className="flex-1 min-w-0 bg-transparent text-md" placeholder="Buscar farmacia" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => setPanel('buscar')}>Añadir farmacia</Button>
            </>
          }
        />
      }
    >
      <PageHeader title="Mis farmacias" subtitle="34 farmacias en Zona Levante · 2 en riesgo · 5 sin visitar este trimestre" right={<span className="text-base text-muted">Actualizado hace 10 min</span>} />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} columns={[{ key: 'consultas', label: 'Consultas' }, { key: 'formacion', label: 'Formación' }]} />}>
        {pharmacyFilters.map((f) => <Chip key={f.key} active={filter === f.key} count={f.count} onClick={() => setFilter(f.key)}>{f.label}</Chip>)}
      </ChipRow>

      {vista.mode === 'list' ? (
        <TableCard footer={`${list.length} de 34 farmacias · 5 sin visitar este trimestre`} footerRight={<button onClick={() => notify('CSV exportado')}>Exportar a CSV</button>}>
          <THead>
            <Th className="flex-1">Farmacia</Th><Th className="w-[90px]" align="right">Última visita</Th>
            {vista.columns.consultas !== false && <Th className="w-[80px]" align="right">Consultas</Th>}
            {vista.columns.formacion !== false && <Th className="w-[80px]" align="right">Formación</Th>}
            <Th className="w-[96px]" align="right">Estado</Th><Th className="w-[110px]" align="right">Próxima visita</Th>
          </THead>
          {list.map((p, i) => (
            <Tr key={p.id} onClick={() => navigate(`/comercial/farmacias/${p.id}`)} last={i === list.length - 1}>
              <TdMain title={p.name} meta={`${p.city} · ${p.owner}`} avatar={<Avatar initials={p.code} size={30} tone={i === 0 ? 'soft' : 'neutral'} />} />
              <Td className="w-[90px]" align="right">{p.lastVisit}</Td>
              {vista.columns.consultas !== false && <Td className="w-[80px] font-semibold text-ink" align="right">{p.consultations}</Td>}
              {vista.columns.formacion !== false && <Td className={cn('w-[80px]', p.training < 40 && 'text-warn font-medium')} align="right">{p.training} %</Td>}
              <div className="w-[96px] flex justify-end"><Badge tone={tone(p.status)}>{p.status}</Badge></div>
              <Td className={cn('w-[110px]', p.nextToday ? 'text-accent font-semibold' : p.nextVisit === 'Sin planificar' ? 'text-faint' : 'text-ink-soft')} align="right">{p.nextVisit}</Td>
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${vista.perRow}, minmax(0, 1fr))` }}>
          {list.map((p) => (
            <button key={p.id} onClick={() => navigate(`/comercial/farmacias/${p.id}`)} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3 text-left hover:border-faint">
              <div className="flex items-center gap-3"><Avatar initials={p.code} size={32} tone="soft" /><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-semibold text-ink truncate">{p.name}</span><span className="text-xs text-faint">{p.city} · {p.owner}</span></span><Badge tone={tone(p.status)}>{p.status}</Badge></div>
              <div className="flex justify-between text-sm text-muted"><span>Última visita {p.lastVisit}</span><span className={cn(p.training < 40 && 'text-warn font-medium')}>Formación {p.training} %</span></div>
              <span className={cn('text-sm font-medium', p.nextToday ? 'text-accent' : 'text-ink-soft')}>{p.nextVisit}</span>
            </button>
          ))}
        </div>
      )}

      {panel === 'buscar' && <AddDrawer onClose={() => setPanel(null)} onManual={() => setPanel('alta')} />}
      {panel === 'alta' && <ManualDrawer onClose={() => setPanel(null)} onBack={() => setPanel('buscar')} />}
    </Screen>
  )
}

function AddDrawer({ onClose, onManual }: { onClose: () => void; onManual: () => void }) {
  const { notify } = useStore()
  const [q, setQ] = useState('farmacia san jaume')
  const hits = q.trim().length > 2 ? registry.filter((r) => r.name.toLowerCase().includes(q.toLowerCase().replace('farmacia ', '').trim()) || q.toLowerCase().includes('san')) : []
  return (
    <Drawer open onClose={onClose} title="Añadir farmacia a tu zona" width={448}>
      <div className={cn('field h-[42px] rounded-lg gap-2.5 is-focus')}>
        <Search size={15} className="text-accent shrink-0" />
        <input autoFocus className="flex-1 bg-transparent text-base" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, CIF, código nacional o población" />
        {q && <button onClick={() => setQ('')} className="h-5 w-5 rounded-full bg-chrome-deep inline-flex items-center justify-center text-ink-soft"><X size={10} strokeWidth={2.5} /></button>}
      </div>
      <span className="mt-2 text-xs text-faint">Busca por nombre, CIF, código nacional de farmacia o población.</span>

      {hits.length > 0 && (
        <>
          <span className="label-faint mt-6">{hits.length} coincidencias en el registro</span>
          <div className="mt-2.5 rounded-xl bg-surface border border-line overflow-hidden">
            {hits.map((r, i) => (
              <div key={r.name} className={cn('h-[60px] px-4 flex items-center gap-3', i < hits.length - 1 && 'border-b border-line-soft')}>
                <Avatar initials={r.code} size={28} tone="neutral" />
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{r.name}</span><span className="text-xs text-faint truncate">{r.meta}</span></span>
                {r.client ? <Badge tone="ok" className="h-7 px-3 rounded-[7px]">Ya es cliente</Badge> : <Button variant="primary" size="sm" onClick={() => { notify(`Invitación enviada a ${r.name}`); onClose() }}>Invitar</Button>}
              </div>
            ))}
          </div>
        </>
      )}
      {q.trim().length > 2 && hits.length === 0 && <div className="mt-6 text-base text-muted">Nada en el registro con «{q}».</div>}

      <div className="my-6 h-px bg-line" />
      <h3 className="text-lg font-semibold text-ink">¿No la encuentras?</h3>
      <p className="mt-1.5 text-base text-muted leading-[19px]">Si la farmacia aún no está en Suprafeel, que se den de alta ellos mismos desde el mostrador.</p>

      <div className="mt-4 rounded-xl bg-surface border border-line p-4 flex gap-4">
        <span className="h-[86px] w-[86px] rounded-lg bg-canvas border border-line inline-flex items-center justify-center text-ink shrink-0"><QrCode size={56} strokeWidth={1.2} /></span>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-ink">Que lo escaneen en el mostrador</span>
          <span className="text-sm text-muted mt-1 leading-4">El titular rellena sus datos en dos minutos y la farmacia aparece en tu lista ya asignada a ti.</span>
          <button className="mt-2.5 text-sm font-medium text-accent text-left" onClick={() => notify('QR descargado · suprafeel.com/alta?ref=alvaro')}>Descargar o imprimir el QR</button>
        </div>
      </div>

      <button onClick={() => { notify('Escribe el correo del titular y se lo enviamos'); }} className="mt-2.5 h-[46px] rounded-xl bg-surface border border-line px-4 flex items-center gap-3 hover:bg-chrome text-left"><Mail size={14} className="text-muted" /><span className="flex-1 text-base text-ink">Enviar la invitación por correo</span><ChevronRight size={14} className="text-faint" /></button>
      <button onClick={onManual} className="mt-2.5 h-[46px] rounded-xl bg-surface border border-line px-4 flex items-center gap-3 hover:bg-chrome text-left"><PencilLine size={14} className="text-muted" /><span className="flex-1 text-base text-ink">Darla de alta yo con sus datos</span><ChevronRight size={14} className="text-faint" /></button>
    </Drawer>
  )
}

function ManualDrawer({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const { notify } = useStore()
  const [f, setF] = useState({ nombre: 'Farmacia San Jaume', razon: 'San Jaume Farmacia S.L.', cif: '', reg: 'F-0871-V', dir: 'C/ Sant Jaume 4, 46011 Valencia', titular: 'Teresa Miralles Bosch', correo: 'teresa@farmaciasanjaume.es', tel: '', nota: 'La conozco de la jornada del COF. Quiere empezar con la gama de descanso y ya me ha pedido el expositor. Pongo mi mano en el fuego.' })
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  const ok = f.nombre && f.razon && f.cif && f.reg && f.dir && f.titular && f.correo
  return (
    <Drawer
      open
      onClose={onClose}
      onBack={onBack}
      title={`Alta manual · ${f.nombre || 'Nueva farmacia'}`}
      width={448}
      footer={
        <>
          <Button size="lg" onClick={() => { notify('Borrador guardado'); onClose() }}>Guardar borrador</Button>
          <Button variant="primary" size="lg" className="flex-1" icon={<Send size={13} />} disabled={!ok} onClick={() => { notify('Enviada a la central · te avisamos cuando la aprueben'); onClose() }}>Enviar a la central</Button>
        </>
      }
    >
      <Notice tone="warn" icon={<Clock size={15} className="shrink-0" />}>La central tiene que aprobarla. Hasta entonces la farmacia no tiene acceso ni cuenta en tu lista. Suele resolverse en menos de 24 h.</Notice>
      <span className="label mt-6">Datos de la farmacia</span>
      <div className="mt-3 flex flex-col gap-3.5">
        <Field label="Nombre comercial" required><Input value={f.nombre} onChange={set('nombre')} focus /></Field>
        <Field label="Razón social" required><Input value={f.razon} onChange={set('razon')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CIF" required><Input value={f.cif} onChange={set('cif')} placeholder="B-00 000 000" /></Field>
          <Field label="Nº de registro" required><Input value={f.reg} onChange={set('reg')} /></Field>
        </div>
        <Field label="Dirección completa" required><Input value={f.dir} onChange={set('dir')} /></Field>
      </div>
      <span className="label mt-6">Titular que recibirá el acceso</span>
      <div className="mt-3 flex flex-col gap-3.5">
        <Field label="Nombre y apellidos" required><Input value={f.titular} onChange={set('titular')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Correo" required><Input value={f.correo} onChange={set('correo')} /></Field>
          <Field label="Teléfono"><Input value={f.tel} onChange={set('tel')} placeholder="+34 ___ __ __ __" /></Field>
        </div>
      </div>
      <span className="label mt-6">Nota para la central</span>
      <Textarea className="mt-3" rows={4} value={f.nota} onChange={set('nota')} />
      {!ok && <span className="mt-3 text-xs text-warn">Faltan campos obligatorios (*) para poder enviarla.</span>}
    </Drawer>
  )
}
