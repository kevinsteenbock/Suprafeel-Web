import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CalendarDays, Mail, Phone } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { call, useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { formacionLabel, iniciales, nombreDe, pharmacyById } from '@/data/pharmacies'
import { enviarMensaje, fechaHoraCorta, leerLista, type Contacto, type Mensaje } from '@/data/mensajes'
import { Toolbar, PageHeader, KeyValue, Notice, Section } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Avatar } from '@/ui/Avatar'
import { Badge } from '@/ui/Badge'
import { Textarea } from '@/ui/Field'
import { Escribir } from './Escribir'

/** '2026-11-07' → «sábado, 7 de noviembre» (sin pasar por UTC). */
function fechaLarga(iso?: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  if (!m) return ''
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function useContacto() {
  const { token } = useAuth()
  const [contacto, setContacto] = useState<Contacto | null>(null)
  const [cargado, setCargado] = useState(false)
  useEffect(() => {
    let vigente = true
    call('/contacto', {}, token)
      .then(({ res, body }) => { if (vigente && res.ok) setContacto(body as Contacto) })
      .catch(() => {})
      .finally(() => { if (vigente) setCargado(true) })
    return () => { vigente = false }
  }, [token])
  return { contacto, cargado }
}

/** Preguntas y dudas: la farmacia pregunta y la respuesta sale aquí mismo. */
function Dudas() {
  const { token } = useAuth()
  const [lista, setLista] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    leerLista<Mensaje>('/mensajes', token).then((l) => setLista(l.filter((m) => m.tipo === 'duda'))).catch(() => {})
  }, [token])
  useEffect(cargar, [cargar])

  const enviar = async () => {
    if (texto.trim().length < 2) return setError('Escribe tu pregunta.')
    setError('')
    setEnviando(true)
    try {
      await enviarMensaje(token, { tipo: 'duda', texto: texto.trim() })
      setTexto('')
      cargar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No hemos podido enviarla.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Section title="Preguntas y dudas">
      <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3">
        <Textarea rows={3} value={texto} onChange={setTexto} placeholder="Escribe tu duda. Se contesta una vez al día, aquí mismo." />
        {error && <Notice tone="danger">{error}</Notice>}
        <div className="flex justify-end"><Button variant="primary" size="lg" disabled={enviando} onClick={() => void enviar()}>{enviando ? 'Enviando…' : 'Enviar pregunta'}</Button></div>
      </div>
      {lista.map((m) => (
        <article key={m.id} className="rounded-xl bg-surface border border-line p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <p className="flex-1 min-w-0 text-base font-medium text-ink whitespace-pre-line">{m.texto}</p>
            <Badge tone={m.respuesta ? 'ok' : 'neutral'} className="shrink-0">{m.respuesta ? 'Contestada' : 'Sin contestar'}</Badge>
          </div>
          <span className="text-xs text-faint">{fechaHoraCorta(m.created_at)}</span>
          {m.respuesta && <div className="rounded-lg bg-chrome px-3 py-2.5 flex flex-col gap-1"><p className="text-base text-ink-soft whitespace-pre-line">{m.respuesta}</p><span className="text-xs text-faint">Aura · {fechaHoraCorta(m.respondido_at)}</span></div>}
        </article>
      ))}
    </Section>
  )
}

/** Mi comercial: quién lleva la farmacia, cómo contactar, la formación ya hecha y sus dudas. */
export function MiComercial() {
  const { user } = useAuth()
  const { farmacias } = useDatos()
  const { contacto } = useContacto()
  const p = pharmacyById(user?.pharmacy_slug ?? undefined, farmacias) ?? farmacias[0]
  const rep = p?.rep ?? ''
  const [escribiendo, setEscribiendo] = useState<string | null>(null)
  // Solo se enseña la formación ya hecha: las pendientes y programadas las lleva Aura (doc de cambios, 9 nov).
  const hecha = p?.formacion === 'hecha'
  const tel = contacto?.telefono?.replace(/[^\d+]/g, '')

  return (
    <Screen toolbar={<Toolbar title="Mi comercial" right={<Link to="/farmacia/pedir-formacion"><Button variant="primary" icon={<CalendarDays size={13} />}>Pedir formación</Button></Link>} />}>
      <PageHeader title={rep || 'Tu comercial'} subtitle={rep ? ['Tu comercial de Suprafeel', p?.zona].filter(Boolean).join(' · ') : 'Todavía no tienes un comercial asignado.'} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0 flex items-center gap-4">
              <Avatar initials={iniciales(rep) || 'SF'} size={56} tone="soft" rounded="full" className="shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-lg font-semibold text-ink">{rep || 'Suprafeel'}</span>
                {p && rep && <span className="text-sm text-faint mt-0.5">Lleva la cuenta de {nombreDe(p)}</span>}
              </div>
            </div>
            <Button icon={<Mail size={13} />} className="self-start sm:self-auto" onClick={() => setEscribiendo('')}>Escribir</Button>
          </div>

          {tel && (
            <div className="rounded-xl bg-surface border border-line p-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-base font-semibold text-ink">Aura, para cualquier duda</span>
                <span className="text-sm text-muted mt-0.5">{contacto?.telefono}</span>
              </div>
              <a href={`tel:${tel}`} className="self-start sm:self-auto"><Button icon={<Phone size={13} />}>Llamar</Button></a>
            </div>
          )}

          {p && hecha && (
            <Section title="Formación en el mostrador">
              <div className="rounded-xl bg-surface border border-line shadow-card px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-base font-medium text-ink">{p.formacionFecha ? `Hecha el ${fechaLarga(p.formacionFecha)}` : 'Hecha'}</span>
                  <span className="text-sm text-muted mt-1">Si se incorpora alguien nuevo al equipo y queréis repetirla, pide formación.</span>
                </div>
                <Badge tone="ok">{formacionLabel(p.formacion)}</Badge>
              </div>
            </Section>
          )}

          <Dudas />
        </div>

        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-4">
          <KeyValue labelWidth={90} rows={[
            ...(rep ? [{ k: 'Comercial', v: rep }] : []),
            ...(p?.zona ? [{ k: 'Zona', v: p.zona }] : []),
            ...(p ? [{ k: 'Farmacia', v: nombreDe(p) }] : []),
            ...(contacto?.telefono ? [{ k: 'Teléfono', v: <a href={`tel:${tel}`} className="text-accent hover:underline">{contacto.telefono}</a> }] : []),
          ]} />
        </aside>
      </div>
      {escribiendo !== null && <Escribir inicial={escribiendo} onClose={() => setEscribiendo(null)} />}
    </Screen>
  )
}
