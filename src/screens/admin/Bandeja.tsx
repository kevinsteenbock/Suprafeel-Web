import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Inbox } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useAuth } from '@/app/auth'
import { fechaCorta, formacionLabel } from '@/data/pharmacies'
import { fechaHoraCorta, leerLista, responderMensaje, type Mensaje, type TipoMensaje } from '@/data/mensajes'
import { Notice, PageHeader, Toolbar, Vacio } from '@/ui/Page'
import { Badge } from '@/ui/Badge'
import { Button } from '@/ui/Button'
import { Textarea } from '@/ui/Field'
import { cn } from '@/lib/cn'
import { ListaSolicitudes } from './AdminMaterial'
import { useDatos } from '@/app/datos'

const PESTANAS: { key: TipoMensaje | 'material'; label: string; vacio: string }[] = [
  { key: 'formacion', label: 'Formación', vacio: 'Todavía no hay peticiones de formación.' },
  { key: 'escribir', label: 'Mensajes', vacio: 'Todavía no hay mensajes.' },
  { key: 'duda', label: 'Dudas', vacio: 'Todavía no hay preguntas.' },
  { key: 'material', label: 'Material', vacio: '' },
]

function Fila({ m, onCambio }: { m: Mensaje; onCambio: () => void }) {
  const { token } = useAuth()
  const { farmacias } = useDatos()
  const [respuesta, setRespuesta] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const f = farmacias.find((x) => x.id === m.farmacia_slug)

  const guardar = async (datos: { respuesta?: string; estado?: 'pendiente' | 'atendido' }) => {
    setGuardando(true)
    setError('')
    try {
      await responderMensaje(token, m.id, datos)
      setRespuesta('')
      onCambio()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido guardar.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <article className="rounded-xl bg-surface border border-line p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 flex flex-col">
          <h2 className="text-base font-semibold text-ink">{m.farmacia_nombre}</h2>
          <span className="text-xs text-faint">{[m.autor, fechaHoraCorta(m.created_at)].filter(Boolean).join(' · ')}</span>
        </div>
        <Badge tone={m.estado === 'atendido' ? 'ok' : 'warn'} className="shrink-0">{m.estado === 'atendido' ? 'Atendido' : 'Pendiente'}</Badge>
      </div>
      {m.tipo === 'formacion' && <p className="text-base font-medium text-ink">Prefiere el {fechaCorta(m.fecha_preferida)} a las {m.hora_preferida}{f ? ` · ahora: ${formacionLabel(f.formacion).toLowerCase()}` : ''}</p>}
      {m.texto && <p className="text-base text-ink-soft whitespace-pre-line">{m.texto}</p>}
      {m.respuesta && <div className="rounded-lg bg-chrome px-3 py-2.5"><p className="text-base text-ink-soft whitespace-pre-line">{m.respuesta}</p><span className="text-xs text-faint">{fechaHoraCorta(m.respondido_at)}</span></div>}
      {!m.respuesta && <Textarea rows={2} value={respuesta} onChange={setRespuesta} placeholder="Contestar: la farmacia lo verá en la web" />}
      {error && <Notice tone="danger">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        {!m.respuesta && <Button variant="primary" disabled={guardando || respuesta.trim().length < 2} onClick={() => void guardar({ respuesta: respuesta.trim() })}>Contestar</Button>}
        <Button disabled={guardando} onClick={() => void guardar({ estado: m.estado === 'atendido' ? 'pendiente' : 'atendido' })}>{m.estado === 'atendido' ? 'Volver a pendiente' : 'Marcar atendido'}</Button>
        {m.tipo === 'formacion' && m.farmacia_slug && <Link to={`/admin/cuentas/${m.farmacia_slug}/editar`}><Button>Programar</Button></Link>}
      </div>
    </article>
  )
}

/** Bandeja de administración: peticiones de formación, mensajes, dudas y solicitudes de material, en un mismo sitio. */
export function Bandeja() {
  const { token } = useAuth()
  const [sp, setSp] = useSearchParams()
  const [mensajes, setMensajes] = useState<Mensaje[] | null>(null)
  const [fallo, setFallo] = useState(false)
  const activa = PESTANAS.find((x) => x.key === sp.get('tab')) ?? PESTANAS[0]

  const cargar = useCallback(() => {
    leerLista<Mensaje>('/mensajes', token)
      .then((l) => { setMensajes(l); setFallo(false) })
      .catch(() => setFallo(true))
  }, [token])
  useEffect(cargar, [cargar])

  const pendientes = (k: string) => mensajes?.filter((m) => m.tipo === k && m.estado !== 'atendido').length ?? 0
  const lista = (mensajes ?? []).filter((m) => m.tipo === activa.key).sort((a, b) => Number(a.estado === 'atendido') - Number(b.estado === 'atendido'))

  return (
    <Screen toolbar={<Toolbar title="Bandeja" />}>
      <PageHeader title="Bandeja" subtitle="Peticiones de formación, mensajes, dudas y solicitudes de material." />
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {PESTANAS.map((t) => {
          const n = t.key === 'material' ? 0 : pendientes(t.key)
          return (
            <button key={t.key} role="tab" aria-selected={t.key === activa.key} onClick={() => setSp({ tab: t.key }, { replace: true })} className={cn('h-9 rounded-full px-3.5 text-sm font-medium inline-flex items-center gap-1.5', t.key === activa.key ? 'bg-accent text-on-accent' : 'bg-chrome text-ink-soft hover:bg-chrome-deep')}>
              {t.label}{n > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-surface text-accent-deep text-xs font-semibold inline-flex items-center justify-center">{n}</span>}
            </button>
          )
        })}
      </div>
      {activa.key === 'material' ? (
        <ListaSolicitudes />
      ) : (
        <>
          {fallo && <Notice tone="danger">No hemos podido cargar la bandeja. Revisa tu conexión y vuelve a entrar.</Notice>}
          {mensajes && lista.length === 0 && <Vacio icon={<Inbox size={18} />} title={activa.vacio} />}
          <div className="flex flex-col gap-3">{lista.map((m) => <Fila key={m.id} m={m} onCambio={cargar} />)}</div>
        </>
      )}
    </Screen>
  )
}
