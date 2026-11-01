import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { Phone, MapPin, Plus, Check, Package } from 'lucide-react'
import { products, euro } from '@/data/products'
import { Screen } from '@/app/Shell'
import { useDatos } from '@/app/datos'
import { formacionChapa, formacionLabel, formacionVencida, iniciales, pharmacyById, type Pharmacy } from '@/data/pharmacies'
import { Toolbar, SearchField, PageHeader, Stat, StatRow, Section, Notice } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Drawer } from '@/ui/Drawer'
import { Avatar } from '@/ui/Avatar'
import { ProductArt } from '@/ui/ProductArt'
import { Textarea } from '@/ui/Field'
import { cn } from '@/lib/cn'
import { tactilBase } from '@/ui/tactil'

/** '2026-11-07' → «viernes, 7 de noviembre» (sin pasar por UTC). */
function fechaLarga(iso?: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  if (!m) return ''
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** El estado de la formación en una línea: «viernes, 7 de noviembre · 10:30». */
function cuandoFormacion(p: Pharmacy) {
  const fecha = fechaLarga(p.formacionFecha)
  if (p.formacion === 'prevista' && fecha) {
    const pasada = formacionVencida(p)
    return `${pasada ? 'Era el ' : ''}${fecha}${p.formacionHora ? ` · ${p.formacionHora}` : ''}${pasada ? ' · sin cerrar' : ''}`
  }
  if (p.formacion === 'hecha') return fecha ? `Hecha el ${fecha}` : 'Hecha'
  if (p.formacion === 'pendiente') return 'Pendiente de pactar fecha'
  if (p.formacion === 'rechazada') return 'No quieren formación por ahora'
  return 'No consta en el seguimiento'
}

const lugar = (p: Pharmacy) => [p.address, [p.postal, p.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')

export function Farmacia() {
  const { id } = useParams()
  const [sp, setSp] = useSearchParams()
  const { farmacias } = useDatos()
  const p = pharmacyById(id, farmacias)
  const [visit, setVisit] = useState(sp.get('visita') === '1')
  useEffect(() => { if (sp.get('visita') === '1') { setVisit(true); sp.delete('visita'); setSp(sp, { replace: true }) } }, [sp, setSp])
  if (!p) return <Navigate to="/comercial/farmacias" replace />

  const team = p.team ?? []
  const activity = p.activity ?? []
  const enLineal = p.lineal.map((pid) => products.find((x) => x.id === pid)).filter((x): x is (typeof products)[number] => !!x)
  const faltan = products.filter((x) => !p.lineal.includes(x.id))
  const tel = p.telefono?.replace(/[^\d+]/g, '')
  const mapa = lugar(p) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${lugar(p)}`)}` : ''

  const datos = ([
    p.nombreComercial && p.nombreComercial !== p.name ? { k: 'Nombre comercial', v: p.nombreComercial } : null,
    p.owner ? { k: 'Titular', v: p.owner } : null,
    p.address ? { k: 'Dirección', v: p.address } : null,
    p.postal ? { k: 'Código postal', v: p.postal } : null,
    p.city ? { k: 'Población', v: p.city } : null,
    p.telefono ? { k: 'Teléfono', v: <a href={`tel:${tel}`} className="text-accent hover:underline">{p.telefono}</a> } : null,
    p.codigoCliente ? { k: 'Cód. de cliente', v: p.codigoCliente } : null,
    p.zona ? { k: 'Zona', v: p.zona } : null,
    p.rep ? { k: 'Comercial', v: p.rep } : null,
  ] as ({ k: string; v: ReactNode } | null)[]).filter((r): r is { k: string; v: ReactNode } => !!r)

  return (
    <Screen toolbar={<Toolbar back="/comercial/farmacias" crumbs={[{ label: 'Mis farmacias', to: '/comercial/farmacias' }, { label: p.name }]} right={<><SearchField placeholder="Buscar en la ficha" /><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => setVisit(true)}>Registrar visita</Button></>} />}>
      <PageHeader
        title={p.name}
        subtitle={[p.nombreComercial && p.nombreComercial !== p.name ? `«${p.nombreComercial}»` : '', lugar(p), p.owner ? `${p.owner} (titular)` : '', p.rep ? `La lleva ${p.rep}` : ''].filter(Boolean).join(' · ')}
        right={
          (tel || mapa) ? (
            <>
              {tel && <Button icon={<Phone size={13} />} onClick={() => { window.location.href = `tel:${tel}` }}>Llamar</Button>}
              {mapa && <Button icon={<MapPin size={13} />} onClick={() => window.open(mapa, '_blank', 'noopener')}>Cómo llegar</Button>}
            </>
          ) : undefined
        }
      />
      <StatRow>
        <Stat label="Referencias en el lineal" value={p.refs} sub={`de ${products.length} del catálogo`} bar={Math.min(100, Math.round((p.refs / products.length) * 100))} />
        <Stat label="Formación" value={formacionLabel(p.formacion)} sub={cuandoFormacion(p)} tone={p.formacion === 'hecha' ? 'ok' : p.formacion === 'rechazada' ? 'danger' : undefined} />
        {p.city && <Stat label="Población" value={p.city} sub={p.postal ? `CP ${p.postal}` : undefined} />}
        {p.rep && <Stat label="Comercial" value={p.rep} sub={p.zona || 'Responsable de la cuenta'} />}
      </StatRow>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <Section title="Lo que tiene en el lineal" right={<Link to="/comercial/catalogo" className={`${tactilBase} text-base font-medium text-accent`}>Ver catálogo</Link>}>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {enLineal.length === 0 && <div className="p-8 text-center text-base text-muted">Todavía no tiene ninguna referencia Suprafeel en el lineal.</div>}
              {enLineal.map((x, i) => (
                <Link key={x.id} to={`/comercial/catalogo/${x.id}`} className={cn('min-h-[60px] px-4 py-2 flex items-center gap-3.5 hover:bg-canvas', i < enLineal.length - 1 && 'border-b border-line-soft')}>
                  <ProductArt art={x.art} photo={x.photo} size={30} className="h-10 w-10 rounded-md border border-line-soft shrink-0" />
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{x.name}</span><span className="text-xs text-faint mt-[2px] truncate">{[x.format, x.categoryLabel].filter(Boolean).join(' · ')}</span></span>
                  <span className="text-sm text-muted shrink-0">{euro(x.pvp)}</span>
                </Link>
              ))}
            </div>
          </Section>

          {faltan.length > 0 && (
            <Section title={`Para proponer · ${faltan.length === 1 ? '1 referencia' : `${faltan.length} referencias`}`}>
              <div className="flex flex-wrap gap-2">
                {faltan.map((x) => (
                  <Link key={x.id} to={`/comercial/catalogo/${x.id}`} className="h-[27px] max-lg:h-8 rounded-full bg-surface border border-line px-3 inline-flex items-center text-md text-ink-soft hover:bg-chrome">{x.name}</Link>
                ))}
              </div>
            </Section>
          )}

          {activity.length > 0 && (
            <Section title="Actividad de la cuenta">
              <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
                {activity.map((a, i) => (
                  <div key={a.title + a.date} className={cn('h-[60px] px-4 flex items-center gap-3.5', i < activity.length - 1 && 'border-b border-line-soft')}>
                    <span className={cn('h-8 w-8 rounded-md inline-flex items-center justify-center shrink-0', a.tone === 'accent' ? 'bg-accent-wash text-accent' : a.tone === 'ok' ? 'bg-ok-wash text-ok' : 'bg-chrome text-muted')}><Package size={14} /></span>
                    <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{a.title}</span><span className="text-xs text-faint mt-[2px]">{a.meta}</span></span>
                    <span className="text-sm text-muted">{a.date}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-5">
          {p.formacion && (
            <Section title="Formación en el mostrador">
              <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-2">
                <Badge tone={formacionChapa(p).tone} className="self-start">{formacionChapa(p).label}</Badge>
                <span className="text-base text-ink first-letter:uppercase">{cuandoFormacion(p)}</span>
                {p.formacionNote && <p className="text-sm text-muted leading-[17px]">{p.formacionNote}</p>}
              </div>
            </Section>
          )}
          {datos.length > 0 && (
            <Section title="Datos de la farmacia">
              <div className="rounded-xl bg-surface border border-line overflow-hidden">
                {datos.map((r, i) => (
                  <div key={r.k} className={cn('min-h-[42px] px-[14px] py-2.5 flex items-start gap-3', i < datos.length - 1 && 'border-b border-line-soft')}>
                    <span className="w-[104px] shrink-0 text-sm text-muted leading-[19px]">{r.k}</span>
                    <span className="flex-1 min-w-0 text-base text-ink leading-[19px] break-words">{r.v}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {team.length > 0 && (
            <Section title="Equipo de la farmacia">
              <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
                {team.map((t, i) => (
                  <div key={t.name} className={cn('h-14 px-4 flex items-center gap-3', i < team.length - 1 && 'border-b border-line-soft')}>
                    <Avatar initials={t.initials} size={28} tone={i === 0 ? 'soft' : 'neutral'} rounded="full" />
                    <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{t.name}</span><span className="text-xs text-faint truncate">{t.role}</span></span>
                    <span className={cn('text-base font-semibold', t.pct === 100 ? 'text-ok' : t.pct < 40 ? 'text-warn' : 'text-ink')}>{t.pct} %</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {p.notes && (
            <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col">
              <div className="flex items-center justify-between"><span className="label">Notas para la próxima visita</span><button className="text-sm font-medium text-accent" onClick={() => setVisit(true)}>Editar</button></div>
              <p className="mt-3 text-base leading-[19px] text-ink">{p.notes}</p>
              {p.notesMeta && <span className="mt-4 text-xs text-muted">{p.notesMeta}</span>}
            </div>
          )}
        </aside>
      </div>

      {visit && <VisitDrawer name={p.name} owner={p.owner} initials={team[0]?.initials ?? (iniciales(p.owner) || p.code)} notes={p.notes ?? ''} onClose={() => setVisit(false)} />}
    </Screen>
  )
}

function VisitDrawer({ name, owner, initials, notes, onClose }: { name: string; owner: string; initials: string; notes: string; onClose: () => void }) {
  const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  const [done, setDone] = useState<string[]>([])
  const [text, setText] = useState(notes)
  const toggle = (t: string) => setDone((d) => (d.includes(t) ? d.filter((x) => x !== t) : [...d, t]))
  // Las visitas aún no tienen dónde guardarse: el botón queda desactivado y se dice claro, sin «visita guardada» falsa.
  return (
    <Drawer
      open
      onClose={onClose}
      title="Registrar visita"
      subtitle={`${name} · hoy, ${hora}`}
      width={372}
      footer={<><Button size="lg" onClick={onClose}>Cerrar</Button><Button variant="primary" size="lg" className="flex-1" disabled>Guardar visita</Button></>}
    >
      <Notice tone="warn">Todavía no se pueden guardar visitas desde la app. Lo que apuntes aquí se pierde al cerrar.</Notice>
      <span className="label mt-6">Qué has hecho <span className="text-accent">*</span></span>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {['Revisión de lineal', 'Novedades', 'Formación', 'Entrega de PLV', 'Incidencia'].map((t) => {
          const on = done.includes(t)
          return <button key={t} onClick={() => toggle(t)} aria-pressed={on} className={cn('h-[27px] max-lg:h-8 rounded-full px-3 text-md font-medium inline-flex items-center gap-1.5', on ? 'bg-accent-wash text-accent-deep border border-accent-line' : 'bg-surface border border-line text-ink-soft hover:bg-chrome')}>{on && <Check size={11} strokeWidth={2.5} />}{t}</button>
        })}
      </div>
      <span className="label mt-6">Con quién has hablado</span>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {owner && <span className="h-[27px] rounded-full bg-accent-wash text-accent-deep border border-accent-line pl-1 pr-3 inline-flex items-center gap-2 text-md font-medium"><Avatar initials={initials} size={20} tone="accent" rounded="full" />{owner}</span>}
      </div>
      <div className="mt-6 flex items-center justify-between"><span className="label">Productos que has enseñado</span><Link to="/comercial/catalogo" className="text-sm font-medium text-accent">Del catálogo</Link></div>
      <span className="mt-2.5 text-sm text-faint">Añádelos desde el catálogo.</span>
      <div className="mt-6 flex items-center justify-between"><span className="label">Notas para la próxima visita</span></div>
      <Textarea className="mt-2.5 flex-1 min-h-[180px]" rows={9} value={text} onChange={setText} placeholder="Qué has hablado, qué tienes que traer la próxima vez…" />
    </Drawer>
  )
}
