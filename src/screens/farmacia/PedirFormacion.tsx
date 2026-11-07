import { useState } from 'react'
import { CalendarDays, ExternalLink, Mail, Phone } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useAuth } from '@/app/auth'
import { hoyISO } from '@/data/pharmacies'
import { enviarMensaje } from '@/data/mensajes'
import { Notice, PageHeader, Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Textarea } from '@/ui/Field'
import { Escribir } from './Escribir'
import { useContacto } from './MiComercial'

/** Horas en 24 h, de 9:00 a 19:30 cada media hora. */
const HORAS = Array.from({ length: 22 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)

function Via({ icono, titulo, texto, children }: { icono: React.ReactNode; titulo: string; texto: string; children?: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="h-9 w-9 shrink-0 rounded-lg bg-accent-wash text-accent inline-flex items-center justify-center">{icono}</span>
        <div className="flex-1 min-w-0 flex flex-col">
          <h2 className="text-base font-semibold text-ink">{titulo}</h2>
          <p className="text-sm text-muted">{texto}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

/**
 * Pedir formación, por tres vías: calendario, llamada o «Escribir». El calendario solo se abre a las
 * farmacias de la zona de la semana; Xano lo comprueba también al recibir la petición.
 */
export function PedirFormacion() {
  const { token } = useAuth()
  const { contacto, cargado } = useContacto()
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [hecho, setHecho] = useState(false)
  const [escribiendo, setEscribiendo] = useState(false)
  const tel = contacto?.telefono?.replace(/[^\d+]/g, '')

  const pedir = async () => {
    if (!fecha) return setError('Elige el día que prefieres.')
    if (!hora) return setError('Elige la hora que prefieres.')
    setError('')
    setEnviando(true)
    try {
      await enviarMensaje(token, { tipo: 'formacion', fecha_preferida: fecha, hora_preferida: hora, texto: nota.trim() })
      setHecho(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No hemos podido enviarla.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Screen toolbar={<Toolbar back="/farmacia/mi-comercial" crumbs={[{ label: 'Mi comercial', to: '/farmacia/mi-comercial' }, { label: 'Pedir formación' }]} />}>
      <PageHeader title="Pedir formación" subtitle="Elige cómo prefieres organizarla." />
      <div className="w-full max-w-[640px] flex flex-col gap-3">
        {cargado && !contacto && <Notice tone="warn">No hemos podido comprobar la agenda de esta semana. Puedes escribirnos igualmente.</Notice>}

        {contacto?.puede_agendar ? (
          <Via icono={<CalendarDays size={16} />} titulo="Calendario abierto" texto={`Esta semana estamos en tu zona${contacto.zona ? ` (${contacto.zona})` : ''}. Pide el día y la hora que te vengan bien.`}>
            {contacto.enlace_calendario && (
              <a href={contacto.enlace_calendario} target="_blank" rel="noopener noreferrer" className="self-start"><Button variant="primary" size="lg" icon={<ExternalLink size={13} />}>Ver las horas libres</Button></a>
            )}
            {hecho ? (
              <Notice tone="ok">Petición enviada. Te confirmaremos la fecha.</Notice>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Día" required><input type="date" aria-label="Día" min={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} className="field text-base text-ink appearance-none block min-w-full" /></Field>
                  <Field label="Hora" required>
                    <select aria-label="Hora" value={hora} onChange={(e) => setHora(e.target.value)} className="field text-base text-ink">
                      <option value="">Elige una hora</option>
                      {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Algo que debamos saber (opcional)"><Textarea rows={2} value={nota} onChange={setNota} /></Field>
                {error && <Notice tone="danger">{error}</Notice>}
                <div><Button variant={contacto.enlace_calendario ? 'secondary' : 'primary'} size="lg" disabled={enviando} onClick={() => void pedir()}>{enviando ? 'Enviando…' : 'Pedir formación'}</Button></div>
              </>
            )}
          </Via>
        ) : contacto ? (
          <Notice tone="neutral" title="Esta semana no se agenda en tu zona">
            {contacto.zona ? `Estamos en ${contacto.zona}. ` : ''}Llámanos o escríbenos y lo coordinamos.
          </Notice>
        ) : null}

        {tel && (
          <Via icono={<Phone size={16} />} titulo="Llamada" texto={`Llama a Aura: ${contacto?.telefono}`}>
            <a href={`tel:${tel}`} className="self-start"><Button size="lg" icon={<Phone size={13} />}>Llamar</Button></a>
          </Via>
        )}

        <Via icono={<Mail size={16} />} titulo="Escribir" texto="Cuéntanos qué necesitas y te contestamos.">
          <div><Button size="lg" icon={<Mail size={13} />} onClick={() => setEscribiendo(true)}>Escribir</Button></div>
        </Via>
      </div>
      {escribiendo && <Escribir inicial="Me gustaría organizar una formación." onClose={() => setEscribiendo(false)} />}
    </Screen>
  )
}
