import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { Phone, Mail, MapPin, Plus, Check, Package } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { pharmacyById } from '@/data/pharmacies'
import { Toolbar, SearchField, PageHeader, Stat, StatRow, Section } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Drawer } from '@/ui/Drawer'
import { Avatar } from '@/ui/Avatar'
import { Textarea, Select } from '@/ui/Field'
import { cn } from '@/lib/cn'

export function Farmacia() {
  const { id } = useParams()
  const [sp, setSp] = useSearchParams()
  const { notify } = useStore()
  const p = pharmacyById(id)
  const [visit, setVisit] = useState(sp.get('visita') === '1')
  useEffect(() => { if (sp.get('visita') === '1') { setVisit(true); sp.delete('visita'); setSp(sp, { replace: true }) } }, [sp, setSp])
  if (!p) return <Navigate to="/comercial/farmacias" replace />
  const certs = p.team.filter((t) => t.pct === 100).length

  return (
    <Screen toolbar={<Toolbar back="/comercial/farmacias" crumbs={[{ label: 'Mis farmacias', to: '/comercial/farmacias' }, { label: p.name }]} right={<><SearchField placeholder="Buscar en la ficha" /><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => setVisit(true)}>Registrar visita</Button></>} />}>
      <PageHeader
        title={p.name}
        subtitle={`${p.address} · ${p.owner} (titular) · Cliente desde ${p.since}`}
        right={<><Button icon={<Phone size={13} />} onClick={() => notify(`Llamando a ${p.name}…`)}>Llamar</Button><Button icon={<Mail size={13} />} onClick={() => notify('Abriendo el correo…')}>Escribir</Button><Button icon={<MapPin size={13} />} onClick={() => notify('Abriendo la ruta en Mapas…')}>Ruta</Button></>}
      />
      <StatRow>
        <Stat label="Formación del equipo" value={`${p.training} %`} sub={`${p.team.length} personas · ${certs} certificado${certs === 1 ? '' : 's'}`} bar={p.training} />
        <Stat label="Última visita" value={p.lastVisit} sub="Revisión de lineal · Álvaro F." />
        <Stat label="Consultas en 90 días" value={p.consultations} sub={`${Math.round(p.consultations * 0.66)} acabaron en recomendación`} />
        <Stat label="Visitas este año" value={p.visitsYear} sub="2 más que en todo 2024" />
      </StatRow>

      <div className="flex gap-6">
        <Section className="flex-1 min-w-0" title="Actividad de la cuenta" right={<button className="text-base font-medium text-accent" onClick={() => notify('Histórico completo')}>Ver todo el histórico</button>}>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden min-h-[300px]">
            {p.activity.length === 0 && <div className="p-8 text-center text-base text-muted">Sin actividad registrada todavía.</div>}
            {p.activity.map((a, i) => (
              <div key={a.title + a.date} className={cn('h-[60px] px-4 flex items-center gap-3.5', i < p.activity.length - 1 && 'border-b border-line-soft')}>
                <span className={cn('h-8 w-8 rounded-md inline-flex items-center justify-center shrink-0', a.tone === 'accent' ? 'bg-accent-wash text-accent' : a.tone === 'ok' ? 'bg-ok-wash text-ok' : 'bg-chrome text-muted')}><Package size={14} /></span>
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{a.title}</span><span className="text-xs text-faint mt-[2px]">{a.meta}</span></span>
                <span className="text-sm text-muted">{a.date}</span>
              </div>
            ))}
          </div>
        </Section>

        <aside className="w-[316px] shrink-0 flex flex-col gap-5">
          <Section title="Equipo de la farmacia">
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {p.team.map((t, i) => (
                <div key={t.name} className={cn('h-14 px-4 flex items-center gap-3', i < p.team.length - 1 && 'border-b border-line-soft')}>
                  <Avatar initials={t.initials} size={28} tone={i === 0 ? 'soft' : 'neutral'} rounded="full" />
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{t.name}</span><span className="text-xs text-faint truncate">{t.role}</span></span>
                  <span className={cn('text-base font-semibold', t.pct === 100 ? 'text-ok' : t.pct < 40 ? 'text-warn' : 'text-ink')}>{t.pct} %</span>
                </div>
              ))}
            </div>
          </Section>
          <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between"><span className="label">Notas para la próxima visita</span><button className="text-sm font-medium text-accent" onClick={() => setVisit(true)}>Editar</button></div>
            <p className="mt-3 text-base leading-[19px] text-ink flex-1">{p.notes || 'Sin notas todavía. Añádelas al registrar la visita.'}</p>
            {p.notesMeta && <div className="mt-4 flex items-center gap-2"><Avatar initials="ÁF" size={20} tone="neutral" rounded="full" /><span className="text-xs text-muted">{p.notesMeta}</span></div>}
          </div>
        </aside>
      </div>

      {visit && <VisitDrawer name={p.name} owner={p.owner} initials={p.team[0]?.initials ?? 'FC'} notes={p.notes} onClose={() => setVisit(false)} />}
    </Screen>
  )
}

function VisitDrawer({ name, owner, initials, notes, onClose }: { name: string; owner: string; initials: string; notes: string; onClose: () => void }) {
  const { notify } = useStore()
  const [done, setDone] = useState<string[]>(['Revisión de lineal', 'Novedades'])
  const [text, setText] = useState('Laura mueve el lineal de descanso a la zona de caja en octubre. Le dejo la tabla comparativa de colágeno para que lo decida. Jorge sigue sin tocar la formación: volver con él delante.')
  const [products, setProducts] = useState([{ code: 'MG', name: 'Magnesio Complex', r: 'Entra al lineal' }, { code: 'CO', name: 'Colágeno + Ácido Hialurónico', r: 'Se lo piensa' }])
  const toggle = (t: string) => setDone((d) => (d.includes(t) ? d.filter((x) => x !== t) : [...d, t]))
  return (
    <Drawer
      open
      onClose={onClose}
      title="Registrar visita"
      subtitle={`${name} · hoy, 11:00`}
      width={372}
      footer={<><Button size="lg" onClick={onClose}>Cancelar</Button><Button variant="primary" size="lg" className="flex-1" disabled={!done.length} onClick={() => { notify('Visita guardada · la siguiente entra en tu ruta del 23 oct'); onClose() }}>Guardar visita</Button></>}
    >
      <span className="label">Qué has hecho <span className="text-accent">*</span></span>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {['Revisión de lineal', 'Novedades', 'Formación', 'Entrega de PLV', 'Incidencia'].map((t) => {
          const on = done.includes(t)
          return <button key={t} onClick={() => toggle(t)} className={cn('h-[27px] rounded-full px-3 text-md font-medium inline-flex items-center gap-1.5', on ? 'bg-accent-wash text-accent-deep border border-accent-line' : 'bg-surface border border-line text-ink-soft hover:bg-chrome')}>{on && <Check size={11} strokeWidth={2.5} />}{t}</button>
        })}
      </div>
      <span className="label mt-6">Con quién has hablado</span>
      <div className="mt-2.5 flex gap-2">
        <span className="h-[27px] rounded-full bg-accent-wash text-accent-deep border border-accent-line pl-1 pr-3 inline-flex items-center gap-2 text-md font-medium"><Avatar initials={initials} size={20} tone="accent" rounded="full" />{owner}</span>
        <button onClick={() => notify('Elige a alguien del equipo')} className="h-[27px] rounded-full border border-dashed border-line px-3 text-md text-muted inline-flex items-center gap-1 hover:bg-chrome"><Plus size={11} /> Añadir</button>
      </div>
      <div className="mt-6 flex items-center justify-between"><span className="label">Productos que has enseñado</span><Link to="/comercial/catalogo" className="text-sm font-medium text-accent">Del catálogo</Link></div>
      <div className="mt-2.5 flex flex-col gap-2">
        {products.map((p, i) => (
          <div key={p.code} className="h-10 rounded-lg bg-surface border border-line px-3 flex items-center gap-2.5">
            <span className="h-5 w-5 rounded-[5px] bg-accent-wash text-accent-deep text-[8.5px] font-bold inline-flex items-center justify-center">{p.code}</span>
            <span className="flex-1 text-base text-ink truncate">{p.name}</span>
            <button onClick={() => setProducts((ps) => ps.map((x, j) => (j === i ? { ...x, r: x.r === 'Entra al lineal' ? 'Se lo piensa' : x.r === 'Se lo piensa' ? 'No interesa' : 'Entra al lineal' } : x)))} className={cn('text-sm font-medium', p.r === 'Entra al lineal' ? 'text-ok' : p.r === 'No interesa' ? 'text-faint' : 'text-accent')}>{p.r}</button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between"><span className="label">Notas para la próxima visita</span><span className="text-xs text-faint">Solo las ves tú</span></div>
      <Textarea className="mt-2.5 flex-1 min-h-[180px]" rows={9} value={text || notes} onChange={setText} focus />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col"><span className="text-base font-medium text-ink">Planificar la siguiente</span><span className="text-xs text-faint">Entra en tu ruta automáticamente</span></div>
        <Select value="23 oct" size="sm" className="w-[88px]" chevron="down" />
      </div>
    </Drawer>
  )
}
