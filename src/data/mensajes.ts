import { call } from '@/app/auth'

export type TipoMensaje = 'escribir' | 'formacion' | 'duda'

export interface Mensaje {
  id: number
  created_at: number | string
  tipo: TipoMensaje
  farmacia_slug?: string
  farmacia_nombre?: string
  autor?: string
  texto?: string
  fecha_preferida?: string
  hora_preferida?: string
  estado: 'pendiente' | 'atendido'
  respuesta?: string
  respondido_at?: number | string | null
}

/** Lo que dice GET /contacto: el teléfono de la administradora y si esta farmacia puede agendar esta semana. */
export interface Contacto {
  telefono: string
  zona: string
  puede_agendar: boolean
  enlace_calendario: string
}

export const fechaHoraCorta = (v?: number | string | null) => {
  if (!v) return ''
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}

const motivo = (body: unknown, porDefecto: string) => {
  const m = (body as { message?: unknown } | null)?.message
  return typeof m === 'string' && m ? m : porDefecto
}

export async function leerLista<T>(ruta: string, token: string | null): Promise<T[]> {
  const { res, body } = await call(ruta, {}, token)
  if (!res.ok || !Array.isArray(body)) throw new Error(motivo(body, 'No hemos podido cargarlo. Inténtalo de nuevo en un momento.'))
  return body as T[]
}

export async function enviarMensaje(token: string | null, datos: { tipo: TipoMensaje; texto?: string; fecha_preferida?: string; hora_preferida?: string }) {
  let r
  try {
    r = await call('/mensajes', { method: 'POST', body: JSON.stringify(datos) }, token)
  } catch {
    throw new Error('No hay conexión con Suprafeel. Revisa tu conexión e inténtalo de nuevo.')
  }
  if (!r.res.ok) throw new Error(motivo(r.body, 'No hemos podido enviarlo. Inténtalo de nuevo en un momento.'))
}

export async function responderMensaje(token: string | null, id: number, datos: { respuesta?: string; estado?: 'pendiente' | 'atendido' }) {
  const r = await call(`/mensajes/${id}`, { method: 'PATCH', body: JSON.stringify(datos) }, token)
  if (!r.res.ok) throw new Error(motivo(r.body, 'No se ha podido guardar. Inténtalo de nuevo.'))
}
