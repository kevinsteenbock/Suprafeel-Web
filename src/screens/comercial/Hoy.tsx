import { Link, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { formacionesVencidas, hoyISO, proximasFormaciones, type Pharmacy } from '@/data/pharmacies'
import { Toolbar, SearchField, PageHeader, Stat, StatRow, Section } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { TableCard, Tr } from '@/ui/Table'

/** «sábado, 31 de octubre» → «Sábado, 31 de octubre». */
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** '2026-11-07' → Date local (sin que la zona horaria mueva el día). */
const diaDe = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

/** Saludo según la hora del día. */
function saludo(d: Date) {
  const h = d.getHours()
  return h >= 6 && h < 14 ? 'Buenos días' : h >= 14 && h < 21 ? 'Buenas tardes' : 'Buenas noches'
}

/** Nombre para el saludo: el de pila; si la cuenta es una etiqueta («X · Comercial»), lo que va antes del punto. */
function nombreDeSaludo(name: string) {
  const base = name.split('·')[0]!.trim()
  return name.includes('·') ? base : base.split(/\s+/)[0] ?? ''
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** Ruta en Google Maps con las formaciones en orden: la última es el destino y las demás, paradas. */
function rutaEnMapas(lista: Pharmacy[]) {
  const sitio = (p: Pharmacy) => [p.address, p.postal, p.city].filter(Boolean).join(', ')
  const paradas = lista.map(sitio).filter(Boolean).slice(0, 9)
  if (!paradas.length) return ''
  const q = new URLSearchParams({ api: '1', destination: paradas[paradas.length - 1]!, travelmode: 'driving' })
  if (paradas.length > 1) q.set('waypoints', paradas.slice(0, -1).join('|'))
  return `https://www.google.com/maps/dir/?${q.toString()}`
}

export function Hoy() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const { user } = useAuth()
  const { farmacias } = useDatos()

  const ahora = new Date()
  const hoy = hoyISO(ahora)
  const fecha = capital(ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))
  const nombre = nombreDeSaludo(user?.name || user?.rep_name || '')

  const agenda = proximasFormaciones(farmacias, ahora)
  const hechas = farmacias.filter((p) => p.formacion === 'hecha').length
  const pendientes = farmacias.filter((p) => p.formacion === 'pendiente').sort((a, b) => a.name.localeCompare(b.name, 'es'))
  // Previstas con la fecha ya pasada y sin cerrar: van primero en «Requieren atención».
  const sinCerrar = formacionesVencidas(farmacias, hoy)
  const vencidas = sinCerrar.length
  const porAtender = [
    ...sinCerrar.map((p) => ({ p, motivo: `Formación sin cerrar · era el ${p.formacionDate}`, urgente: true })),
    ...pendientes.map((p) => ({ p, motivo: 'Formación pendiente', urgente: false })),
  ]
  const atencion = porAtender.slice(0, 4)
  const refsTotal = farmacias.reduce((a, p) => a + p.refs, 0)
  const masRefs = farmacias.filter((p) => p.refs > 0).sort((a, b) => b.refs - a.refs).slice(0, 4)
  const mapas = rutaEnMapas(agenda)

  const subtitle = farmacias.length
    ? `${plural(farmacias.length, 'farmacia', 'farmacias')} en tu cartera · ${agenda.length ? plural(agenda.length, 'formación programada', 'formaciones programadas') : 'ninguna formación programada'}`
    : 'Todavía no tienes farmacias asignadas. Cuando la central te asigne alguna, aparecerá aquí.'

  const subProgramadas = agenda[0]
    ? `La próxima, el ${agenda[0].formacionDate}${vencidas ? ` · ${vencidas} con fecha pasada` : ''}`
    : vencidas
      ? `${plural(vencidas, 'prevista', 'previstas')} con fecha pasada`
      : 'Ninguna en el calendario'

  return (
    <Screen
      toolbar={
        <Toolbar
          title="Hoy"
          right={
            <>
              <SearchField placeholder="Buscar farmacia o producto" />
              <Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => { notify('Elige la farmacia que has visitado'); navigate('/comercial/farmacias') }}>Registrar visita</Button>
            </>
          }
        />
      }
    >
      <PageHeader title={nombre ? `${saludo(ahora)}, ${nombre}` : saludo(ahora)} subtitle={subtitle} right={<span className="text-base text-muted">{fecha}</span>} />

      <StatRow>
        <Stat label="Farmacias" value={farmacias.length} sub={`${refsTotal} ${refsTotal === 1 ? 'referencia' : 'referencias'} en sus lineales`} />
        <Stat label="Formaciones hechas" value={hechas} tone={hechas ? 'ok' : undefined} sub={farmacias.length ? `${Math.round((hechas / farmacias.length) * 100)} % de tus farmacias` : 'Sin farmacias todavía'} />
        <Stat label="Programadas" value={agenda.length} sub={subProgramadas} />
        <Stat label="Pendientes" value={pendientes.length} tone={pendientes.length ? 'accent' : undefined} sub="Formación sin fecha todavía" />
      </StatRow>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Los enlaces de las cabeceras («Abrir en Mapas», «Ver todo») tienen 44 px de zona táctil: los
            márgenes negativos los dejan en el sitio del texto y la cabecera no crece. */}
        <Section
          className="flex-1 min-w-0"
          title="Formación agendada"
          right={mapas ? <a href={mapas} target="_blank" rel="noreferrer" className="h-11 -my-[13px] px-2 -mx-2 inline-flex items-center text-base font-medium text-accent">Abrir en Mapas</a> : undefined}
        >
          <TableCard footer={agenda.length ? `${plural(agenda.length, 'formación programada', 'formaciones programadas')} de hoy en adelante` : undefined}>
            {agenda.length === 0 && (
              <div className="px-6 py-10 text-center flex flex-col items-center gap-1.5">
                <span className="text-base font-medium text-ink">No hay ninguna formación en el calendario</span>
                <span className="text-sm text-muted max-w-[360px]">Cuando pactes una fecha con una farmacia, aparecerá aquí con su día y su hora.</span>
              </div>
            )}
            {agenda.map((r, i) => (
              <Tr key={r.id} wrap height={66} onClick={() => navigate(`/comercial/farmacias/${r.id}`)} last={i === agenda.length - 1}>
                <span className="w-[64px] shrink-0 flex flex-col">
                  <span className="text-base font-semibold text-accent">{r.formacionDate}</span>
                  <span className="text-xs text-faint mt-[2px]">{diaDe(r.formacionFecha!).toLocaleDateString('es-ES', { weekday: 'long' })}</span>
                </span>
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="text-base font-medium text-ink lg:truncate">{r.name}</span>
                  <span className="text-xs text-faint mt-[2px] lg:truncate">{[r.city, r.formacionNote].filter(Boolean).join(' · ')}</span>
                </span>
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pl-[78px] sm:pl-0">
                  {r.formacionFecha === hoy ? <Badge tone="solid">Hoy</Badge> : <Badge tone="warn">Prevista</Badge>}
                  <span className="sm:w-[56px] text-right text-base font-medium text-ink">{r.formacionHora ?? 'Sin hora'}</span>
                </div>
              </Tr>
            ))}
          </TableCard>
        </Section>

        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-5">
          <Section title="Requieren atención" right={porAtender.length > atencion.length ? <Link to="/comercial/farmacias?filtro=to-train" className="h-11 -my-[13px] px-2 -mx-2 inline-flex items-center text-base font-medium text-accent">Ver todo</Link> : undefined}>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {atencion.length === 0 && <div className="px-4 py-5 text-base text-muted">Ninguna de tus farmacias tiene la formación pendiente ni sin cerrar.</div>}
              {atencion.map(({ p: x, motivo, urgente }) => (
                <div key={x.id} className="px-4 py-3 flex items-center gap-3 border-b border-line-soft">
                  <span className={`w-[3px] h-9 rounded-full shrink-0 ${urgente ? 'bg-danger' : 'bg-warn'}`} />
                  <Link to={`/comercial/farmacias/${x.id}`} className="flex-1 min-w-0 flex flex-col hover:text-accent-deep">
                    <span className="text-base font-medium text-ink lg:truncate">{x.name}</span>
                    <span className="text-xs text-faint mt-[2px] leading-4 lg:truncate">{[motivo, x.city].filter(Boolean).join(' · ')}</span>
                  </Link>
                  {/* Mismo aspecto, pero con 44 px de zona táctil: los márgenes negativos la dejan en el sitio del texto. */}
                  {x.telefono
                    ? <a href={`tel:${x.telefono.replace(/\s+/g, '')}`} className="h-11 -my-3 px-2 -mx-2 shrink-0 inline-flex items-center text-sm font-medium text-accent">Llamar</a>
                    : <Link to={`/comercial/farmacias/${x.id}`} className="h-11 -my-3 px-2 -mx-2 shrink-0 inline-flex items-center text-sm font-medium text-accent">Ver ficha</Link>}
                </div>
              ))}
              {porAtender.length > 0 && (
                <div className="h-[46px] px-4 bg-chrome flex items-center justify-between">
                  <span className="text-sm text-muted">{[vencidas ? `${vencidas} sin cerrar` : '', pendientes.length ? `${plural(pendientes.length, 'farmacia', 'farmacias')} sin fecha de formación` : ''].filter(Boolean).join(' · ')}</span>
                </div>
              )}
            </div>
          </Section>
          <Section title="Más referencias en el lineal" right={masRefs.length ? <Link to="/comercial/farmacias?filtro=top" className="h-11 -my-[13px] px-2 -mx-2 inline-flex items-center text-base font-medium text-accent">Ver todo</Link> : undefined}>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {masRefs.length === 0 && <div className="px-4 py-5 text-base text-muted border-b border-line-soft">Ninguna de tus farmacias tiene referencias Suprafeel todavía.</div>}
              {masRefs.map((p) => (
                <Link key={p.id} to={`/comercial/farmacias/${p.id}`} className="h-[58px] px-4 flex items-center gap-3 border-b border-line-soft hover:bg-canvas">
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{p.name}</span><span className="text-xs text-faint mt-[2px] truncate">{[p.city, p.owner].filter(Boolean).join(' · ')}</span></span>
                  <span className="text-base font-semibold text-ink shrink-0">{p.refs}</span>
                </Link>
              ))}
              <div className="h-[46px] px-4 bg-chrome flex items-center justify-between"><span className="text-sm text-muted">Media de referencias por farmacia</span><span className="text-base font-semibold text-ink">{farmacias.length ? (refsTotal / farmacias.length).toLocaleString('es-ES', { maximumFractionDigits: 1 }) : '—'}</span></div>
            </div>
          </Section>
        </aside>
      </div>
    </Screen>
  )
}
