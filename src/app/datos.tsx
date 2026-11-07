import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Outlet } from 'react-router'
import { Plus } from 'lucide-react'
import { call, Cargando, EMAIL_RE, useAuth, type Role, type User } from './auth'
import { comercialesDe, farmaciaDeFila, pharmacies as compartidas, type FilaFarmacia, type Pharmacy } from '@/data/pharmacies'
import { CONTENIDO_VACIO, normalizaContenido, type Contenido } from '@/data/contenido'
import { Button } from '@/ui/Button'

/**
 * Datos de la sesión, servidos por Xano (ver xano/HANDOFF.md):
 *   · GET /farmacias        → admin, todas; comercial, las de su rep_name; farmacia, la de su pharmacy_slug.
 *   · GET /admin/usuarios   → solo admin: las cuentas, sin contraseña.
 *   · POST /admin/usuarios  → solo admin: crea una cuenta.
 *   · GET /contenido        → fichas, recomendador, campañas y documentos. Si falla, el resto de la app sigue.
 *
 * Se piden al entrar y se tiran al cerrar sesión. Mientras cargan, el área no se pinta; si Xano
 * dice 401, la sesión se cierra. Nada de esto vive en el código: el repositorio es público.
 */

export interface Usuario {
  id: number
  name: string
  email: string
  role: Role
  /** Slug de su farmacia cuando role = 'farmacia' ('' si no tiene) */
  pharmacy_slug: string
  /** El comercial que es (mismo texto que Pharmacy.rep) cuando role = 'comercial' ('' si no) */
  rep_name: string
  /** Alta en Xano, en milisegundos desde 1970 (0 si no consta) */
  created_at: number
}

export interface NuevoUsuario {
  name: string
  email: string
  /** Mínimo 10 caracteres */
  password: string
  role: Role
  pharmacy_slug?: string
  rep_name?: string
}

export type EstadoDatos = 'cargando' | 'listo' | 'error'

export interface Datos {
  estado: EstadoDatos
  /** Las farmacias que Xano deja ver a esta sesión */
  farmacias: Pharmacy[]
  /** Las cuentas de Xano; solo para admin (para el resto, []) */
  usuarios: Usuario[]
  /** Fichas, recomendador, campañas y documentos */
  contenido: Contenido
  /** Xano no ha podido darnos el contenido */
  contenidoFalla: boolean
  /**
   * Vuelve a pedirlo todo. Con los datos ya en pantalla, recarga sin quitarlos y, si falla, lanza
   * un Error con el motivo (los datos que había se quedan). Tras un error de carga, reintenta.
   */
  recargar: () => Promise<void>
  /** Crea una cuenta en Xano (solo admin) y recarga la lista. Si falla, lanza un Error con el mensaje de Xano. */
  crearUsuario: (input: NuevoUsuario) => Promise<Usuario>
}

/** Datos fijos para renderizar sin red (el test de humo). Se filtran por rol igual que en Xano. */
export interface DatosFijos {
  farmacias: Pharmacy[]
  usuarios?: Usuario[]
  contenido?: Contenido
}

const SIN_CONEXION = 'No hay conexión con Suprafeel. Revisa tu conexión e inténtalo de nuevo.'
const CADUCADA = 'Tu sesión ha caducado. Vuelve a entrar.'
const ROLES: Role[] = ['farmacia', 'comercial', 'admin']

class SesionCaducada extends Error {
  constructor() { super(CADUCADA) }
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

function usuarioDeFila(raw: unknown): Usuario | null {
  const u = raw as Record<string, unknown> | null
  if (!u || typeof u.id !== 'number' || !ROLES.includes(u.role as Role)) return null
  const created = typeof u.created_at === 'number' ? u.created_at : Date.parse(str(u.created_at)) || 0
  return {
    id: u.id,
    name: str(u.name),
    email: str(u.email),
    role: u.role as Role,
    pharmacy_slug: str(u.pharmacy_slug),
    rep_name: str(u.rep_name),
    created_at: created,
  }
}

const usuariosDe = (filas: unknown[]) => filas.map(usuarioDeFila).filter((u): u is Usuario => !!u)
const farmaciasDe = (filas: unknown[]) =>
  filas.filter((f): f is FilaFarmacia => !!f && typeof f === 'object' && typeof (f as FilaFarmacia).name === 'string').map(farmaciaDeFila)

/** Motivo legible de una respuesta fallida de Xano. */
function motivo(status: number, body: unknown, porDefecto: string): string {
  const msg = str((body as { message?: unknown } | null)?.message)
  if (status === 403) return msg && !/^access denied/i.test(msg) ? msg : 'Tu cuenta no tiene permiso para esto.'
  if (status === 429) return 'Demasiadas peticiones seguidas. Espera un minuto y vuelve a probar.'
  return msg || porDefecto
}

/** GET autenticado que devuelve una lista (Xano a veces la envuelve en { items }). */
async function leerLista(path: string, token: string): Promise<unknown[]> {
  let r
  try {
    r = await call(path, {}, token)
  } catch {
    throw new Error(SIN_CONEXION)
  }
  if (r.res.status === 401) throw new SesionCaducada()
  if (!r.res.ok) throw new Error(motivo(r.res.status, r.body, `Xano ha respondido ${r.res.status}.`))
  const lista = Array.isArray(r.body) ? r.body : Array.isArray(r.body?.items) ? r.body.items : null
  if (!lista) throw new Error('Xano ha respondido algo que no es una lista.')
  return lista
}

/** Lo que Xano dejaría ver a cada rol: lo usa el modo sin red para parecerse a la API. */
function comoXano(farmacias: Pharmacy[], user: User | null): Pharmacy[] {
  if (!user) return []
  if (user.role === 'admin') return farmacias
  if (user.role === 'comercial') return farmacias.filter((p) => !!user.rep_name && p.rep === user.rep_name)
  return farmacias.filter((p) => !!user.pharmacy_slug && p.id === user.pharmacy_slug)
}

/** Mantiene el array exportado de src/data/pharmacies.ts igual que el estado, para el código antiguo. */
function sincronizar(lista: Pharmacy[]) {
  compartidas.splice(0, compartidas.length, ...lista)
}

const Ctx = createContext<Datos | null>(null)

/** Va dentro de AuthProvider. `datos` solo lo usa el test de humo, para renderizar sin red. */
export function DatosProvider({ children, datos }: { children: ReactNode; datos?: DatosFijos }) {
  const { status, user, token, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [estado, setEstado] = useState<EstadoDatos>(datos ? 'listo' : 'cargando')
  const [cargadas, setCargadas] = useState<Pharmacy[]>([])
  const [usuariosXano, setUsuariosXano] = useState<Usuario[]>(datos?.usuarios ?? [])
  const [contenido, setContenido] = useState<Contenido>(datos?.contenido ?? CONTENIDO_VACIO)
  const [contenidoFalla, setContenidoFalla] = useState(false)
  const [detalle, setDetalle] = useState('')
  // Cada carga lleva su número: la respuesta de una carga vieja (otra sesión) no pisa a la nueva.
  const turno = useRef(0)
  const estadoRef = useRef(estado)
  estadoRef.current = estado

  const fijas = useMemo(() => (datos ? comoXano(datos.farmacias, user) : null), [datos, user])
  const farmacias = fijas ?? cargadas
  const usuarios = isAdmin ? usuariosXano : []

  // El array compartido se pone al día en el mismo render, antes de que lo lean las pantallas.
  const sincronizadas = useRef<Pharmacy[] | null>(null)
  if (sincronizadas.current !== farmacias) {
    sincronizar(farmacias)
    sincronizadas.current = farmacias
  }

  const cargar = useCallback(
    async (silencioso: boolean) => {
      if (datos || status !== 'in' || !token) return
      const mio = ++turno.current
      if (!silencioso) setEstado('cargando')
      try {
        // En serie: Xano lleva mal las ráfagas.
        const f = farmaciasDe(await leerLista('/farmacias', token))
        const u = isAdmin ? usuariosDe(await leerLista('/admin/usuarios', token)) : []
        const c = await call('/contenido', {}, token).catch(() => null)
        if (mio !== turno.current) return
        if (c?.res.status === 401) throw new SesionCaducada()
        setContenido(c?.res.ok ? normalizaContenido(c.body) : CONTENIDO_VACIO)
        setContenidoFalla(!c?.res.ok)
        setCargadas(f)
        setUsuariosXano(u)
        setDetalle('')
        setEstado('listo')
      } catch (e) {
        if (mio !== turno.current) return
        if (e instanceof SesionCaducada) {
          logout()
          if (silencioso) throw e
          return
        }
        if (silencioso) throw e instanceof Error ? e : new Error(SIN_CONEXION)
        setDetalle(e instanceof Error ? e.message : '')
        setEstado('error')
      }
    },
    [datos, status, token, isAdmin, logout],
  )

  useEffect(() => {
    if (datos) return
    if (status === 'in' && token) {
      void cargar(false)
      return
    }
    // Sin sesión (o comprobándola): fuera todo lo de la anterior.
    turno.current++
    setCargadas([])
    setUsuariosXano([])
    setContenido(CONTENIDO_VACIO)
    setContenidoFalla(false)
    setDetalle('')
    setEstado('cargando')
  }, [datos, status, token, cargar])

  const recargar = useCallback(() => cargar(estadoRef.current === 'listo'), [cargar])

  const crearUsuario = useCallback(
    async (input: NuevoUsuario): Promise<Usuario> => {
      const body = {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        role: input.role,
        pharmacy_slug: input.role === 'farmacia' ? input.pharmacy_slug?.trim() || undefined : undefined,
        rep_name: input.role === 'comercial' ? input.rep_name?.trim() || undefined : undefined,
      }
      if (!body.name) throw new Error('Escribe el nombre de la cuenta.')
      if (!EMAIL_RE.test(body.email)) throw new Error('Escribe un correo válido, por ejemplo nombre@farmacia.es.')
      if (body.password.length < 10) throw new Error('La contraseña tiene que tener al menos 10 caracteres.')
      if (!ROLES.includes(body.role)) throw new Error('Elige qué tipo de cuenta es.')
      if (body.role === 'farmacia' && !body.pharmacy_slug) throw new Error('Elige la farmacia de la cuenta.')
      if (body.role === 'comercial' && !body.rep_name) throw new Error('Elige qué comercial es.')

      // Sin red (test de humo): se queda en memoria.
      if (datos) {
        const nuevo: Usuario = {
          id: usuariosXano.reduce((m, u) => Math.max(m, u.id), 0) + 1,
          name: body.name,
          email: body.email,
          role: body.role,
          pharmacy_slug: body.pharmacy_slug ?? '',
          rep_name: body.rep_name ?? '',
          created_at: Date.now(),
        }
        setUsuariosXano((l) => [...l, nuevo])
        return nuevo
      }

      if (status !== 'in' || !token) throw new Error(CADUCADA)
      let r
      try {
        r = await call('/admin/usuarios', { method: 'POST', body: JSON.stringify(body) }, token)
      } catch {
        throw new Error(SIN_CONEXION)
      }
      if (r.res.status === 401) {
        logout()
        throw new Error(CADUCADA)
      }
      if (!r.res.ok) throw new Error(motivo(r.res.status, r.body, 'No hemos podido crear la cuenta. Inténtalo de nuevo en un momento.'))

      let creado = usuarioDeFila(r.body) ?? usuarioDeFila(r.body?.user)
      try {
        const lista = usuariosDe(await leerLista('/admin/usuarios', token))
        setUsuariosXano(lista)
        creado = creado ?? lista.find((u) => u.email === body.email) ?? null
      } catch (e) {
        if (e instanceof SesionCaducada) logout()
        else if (creado) {
          const c = creado
          setUsuariosXano((l) => (l.some((u) => u.id === c.id) ? l : [...l, c]))
        }
      }
      if (!creado) throw new Error('La cuenta se ha creado, pero no hemos podido leerla. Recarga la página.')
      return creado
    },
    [datos, status, token, logout, usuariosXano],
  )

  const value = useMemo<Datos & { detalle: string }>(
    () => ({ estado: datos ? 'listo' : estado, farmacias, usuarios, contenido, contenidoFalla, recargar, crearUsuario, detalle }),
    [datos, estado, farmacias, usuarios, contenido, contenidoFalla, recargar, crearUsuario, detalle],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDatos(): Datos {
  const d = useContext(Ctx)
  if (!d) throw new Error('DatosProvider missing')
  return d
}

/** El contenido de la sesión y si no se ha podido cargar. */
export function useContenido(): { contenido: Contenido; falla: boolean } {
  const { contenido, contenidoFalla } = useDatos()
  return { contenido, falla: contenidoFalla }
}

/**
 * Cuántas farmacias y comerciales hay en los datos de la sesión (el admin los ve todos). Para los
 * textos del tipo «lo verán N farmacias», en vez de una cifra escrita a mano.
 */
export function useCifras(): { farmacias: number; comerciales: number } {
  const { farmacias } = useDatos()
  return useMemo(() => ({ farmacias: farmacias.length, comerciales: comercialesDe(farmacias).length }), [farmacias])
}

/** «251 farmacias», «1 comercial»: número con su palabra en singular o plural. */
export const cuenta = (n: number, uno: string, varios: string) => `${n.toLocaleString('es-ES')} ${n === 1 ? uno : varios}`

/**
 * Puerta de cada área, detrás de RequireRole: mientras llegan los datos, el mismo hueco que la
 * comprobación de sesión; si no llegan, una pantalla para reintentar.
 */
export function DatosListos() {
  const datos = useContext(Ctx) as (Datos & { detalle: string }) | null
  const { logout } = useAuth()
  if (!datos) throw new Error('DatosProvider missing')
  if (datos.estado === 'cargando') return <Cargando />
  if (datos.estado === 'error') {
    return (
      <div className="min-h-dvh w-full bg-canvas flex flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center gap-3 mb-9">
          <span className="h-[30px] w-[30px] rounded-[8px] bg-accent text-on-accent inline-flex items-center justify-center"><Plus size={16} strokeWidth={2.4} /></span>
          <span className="text-lg font-semibold text-ink">Suprafeel <span className="font-normal text-muted">Soft</span></span>
        </div>
        <div role="alert" className="w-full max-w-[372px] flex flex-col">
          <h1 className="text-h1 font-semibold tracking-tight text-ink">No hemos podido cargar tus datos</h1>
          <p className="mt-2 text-base text-muted">Suele ser la conexión. Comprueba que tienes internet y vuelve a intentarlo en un momento.</p>
          {datos.detalle && <p className="mt-3 text-sm text-faint">{datos.detalle}</p>}
          <div className="mt-7 flex items-center gap-2.5">
            <Button variant="primary" size="lg" onClick={() => void datos.recargar()}>Reintentar</Button>
            <Button size="lg" onClick={logout}>Cerrar sesión</Button>
          </div>
        </div>
      </div>
    )
  }
  return <Outlet />
}
