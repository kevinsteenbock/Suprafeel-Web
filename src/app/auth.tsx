import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'

/**
 * Sesión contra Xano (ver xano/HANDOFF.md).
 *
 * El rol sale SIEMPRE del usuario que devuelve Xano, nunca del correo ni de lo que haya en el
 * navegador: al arrancar se valida el token con /auth/me, y si Xano lo rechaza la sesión se cierra.
 *
 * Esto protege la navegación, no los datos: quien de verdad decide qué puede leer o escribir
 * cada rol son los endpoints de Xano.
 */

export type Role = 'farmacia' | 'comercial' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  pharmacy_slug?: string | null
  rep_name?: string | null
}

type Status = 'checking' | 'in' | 'out'

interface Auth {
  status: Status
  user: User | null
  token: string | null
  login: (email: string, password: string, remember: boolean) => Promise<User>
  logout: () => void
}

export const API_URL: string = import.meta.env.VITE_XANO_API ?? 'https://xsq7-h9en-9cxm.n7d.xano.io/api:suprafeel-soft'

/** Pantalla de entrada de cada rol */
export const homeOf: Record<Role, string> = {
  farmacia: '/farmacia/catalogo',
  comercial: '/comercial/hoy',
  admin: '/admin/cuentas',
}

const ROLES = Object.keys(homeOf) as Role[]
const KEY = 'sf.token'

export class AuthError extends Error {}

/** "Mantener la sesión iniciada" → localStorage; si no, la sesión muere al cerrar el navegador. */
function readToken(): string | null {
  try {
    return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null, remember = false) {
  try {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
    if (token) (remember ? localStorage : sessionStorage).setItem(KEY, token)
  } catch {}
}

function toUser(raw: unknown): User {
  const u = raw as Partial<User> | null
  if (!u || typeof u.id !== 'number' || !ROLES.includes(u.role as Role)) {
    throw new AuthError('Tu cuenta no tiene un rol válido. Escribe a info@suprafeel.es.')
  }
  return u as User
}

/** Llamada a la API de Suprafeel en Xano. Devuelve la respuesta y el cuerpo ya leído (null si no es JSON). */
export async function call(path: string, init: RequestInit = {}, token?: string | null) {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  const body = await res.json().catch(() => null)
  return { res, body }
}

/** nombre@dominio.algo, sin espacios. Lo mismo que exige Xano antes de mirar la contraseña. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAL = 'Escribe un correo válido, por ejemplo nombre@farmacia.es.'

/** Hueco mientras se comprueba la sesión o se cargan los datos: la pantalla no se pinta a medias. */
export function Cargando() {
  return <div className="h-dvh w-full bg-canvas" aria-busy="true" />
}

const Ctx = createContext<Auth | null>(null)

/** `session` solo lo usa el test de humo, para renderizar las rutas sin red. */
export function AuthProvider({ children, session }: { children: ReactNode; session?: { user: User | null } }) {
  const [token, setToken] = useState<string | null>(() => (session ? null : readToken()))
  const [user, setUser] = useState<User | null>(session?.user ?? null)
  const [status, setStatus] = useState<Status>(session ? (session.user ? 'in' : 'out') : token ? 'checking' : 'out')

  const logout = useCallback(() => {
    writeToken(null)
    setToken(null)
    setUser(null)
    setStatus('out')
  }, [])

  // Al arrancar con un token guardado, Xano confirma quién es (o lo ha caducado).
  useEffect(() => {
    if (session || !token || status !== 'checking') return
    let alive = true
    call('/auth/me', {}, token)
      .then(({ res, body }) => {
        if (!alive) return
        if (!res.ok) return logout()
        setUser(toUser(body))
        setStatus('in')
      })
      .catch(() => {
        // Sin red no sabemos si el token vale: mejor pedir que entre otra vez que dejarle dentro a ciegas.
        if (alive) logout()
      })
    return () => { alive = false }
  }, [session, token, status, logout])

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const correo = email.trim().toLowerCase()
    // Un correo mal escrito no es una contraseña equivocada: se avisa sin preguntar a Xano.
    if (!EMAIL_RE.test(correo)) throw new AuthError(EMAIL_MAL)
    let r
    try {
      r = await call('/auth/login', { method: 'POST', body: JSON.stringify({ email: correo, password }) })
    } catch {
      throw new AuthError('No hay conexión con Suprafeel. Revisa tu conexión e inténtalo de nuevo.')
    }
    const { res, body } = r
    // 400 con ERROR_CODE_INPUT_ERROR = formato (p. ej. «Invalid email format»), no credenciales.
    if (res.status === 400 && body?.code === 'ERROR_CODE_INPUT_ERROR') {
      if (body?.payload?.param === 'email' || /email/i.test(String(body?.message ?? ''))) throw new AuthError(EMAIL_MAL)
      throw new AuthError('Escribe tu correo y tu contraseña.')
    }
    if (res.status === 401 || res.status === 403 || res.status === 400) throw new AuthError('El correo o la contraseña no son correctos.')
    if (res.status === 429) throw new AuthError('Demasiados intentos. Espera unos minutos y vuelve a probar.')
    if (!res.ok || !body?.authToken) throw new AuthError('No hemos podido iniciar sesión. Inténtalo de nuevo en un momento.')
    const u = toUser(body.user)
    writeToken(body.authToken, remember)
    setToken(body.authToken)
    setUser(u)
    setStatus('in')
    return u
  }, [])

  const value = useMemo<Auth>(() => ({ status, user, token, login, logout }), [status, user, token, login, logout])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const a = useContext(Ctx)
  if (!a) throw new Error('AuthProvider missing')
  return a
}

/**
 * Guarda de cada área. Sin sesión → al login (recordando a dónde iba).
 * Con sesión de otro rol → a su propia área: una farmacia nunca ve /admin.
 */
export function RequireRole({ role }: { role: Role }) {
  const { status, user } = useAuth()
  const location = useLocation()
  if (status === 'checking') return <Cargando />
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname + location.search }} />
  if (user.role !== role) return <Navigate to={homeOf[user.role]} replace />
  return <Outlet />
}
