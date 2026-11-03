import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { useAuth } from './auth'

/** El aviso de algo que la app todavía no puede hacer: nunca un «guardado» o «enviado» que no ha pasado. */
export const PENDIENTE = 'Todavía no se puede hacer desde la app: escríbenos a info@suprafeel.es'
/** Lo mismo en la consola de admin: la pantalla todavía no escribe en ningún sitio. */
export const PENDIENTE_ADMIN = 'Todavía no se guarda: esta parte de la consola aún no está conectada'

export type TonoAviso = 'ok' | 'aviso'

interface Store {
  miLista: string[]
  toggleLista: (id: string) => void
  toast: string | null
  toastTono: TonoAviso
  /** `tono = 'aviso'` para lo que no ha salido bien o aún no se puede hacer (no lleva el check verde). */
  notify: (msg: string, tono?: TonoAviso) => void
}

const Ctx = createContext<Store | null>(null)

/**
 * Mi lista vive en este navegador, por cuenta: `sf.lista.<id>`. Una cuenta nueva empieza vacía, y al
 * cerrar sesión se borra lo de esa cuenta, así que otra persona en el mismo navegador no hereda nada.
 * `solicitud` y `casos` eran de la PLV y del caso de ejemplo, que ya no están: se siguen borrando al salir.
 */
const CLAVES = ['lista', 'solicitud', 'casos'] as const
const clave = (k: (typeof CLAVES)[number], uid: number) => `sf.${k}.${uid}`

function load<T>(k: string | null, fallback: T): T {
  if (!k) return fallback
  try {
    const v = localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function save(k: string | null, v: unknown) {
  if (!k) return
  try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
}
function borrarDe(uid: number) {
  try { for (const k of CLAVES) localStorage.removeItem(clave(k, uid)) } catch {}
}
// Las claves de antes no llevaban la cuenta: cualquiera que entrase en el navegador las heredaba.
try { localStorage.removeItem('sf.lista'); localStorage.removeItem('sf.solicitud') } catch {}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.id ?? null
  // Al cerrar sesión (había cuenta y ya no), fuera lo suyo de este navegador.
  const anterior = useRef<number | null>(uid)
  useEffect(() => {
    if (anterior.current != null && uid == null) borrarDe(anterior.current)
    anterior.current = uid
  }, [uid])
  // Cada cuenta monta su propio estado: al cambiar de cuenta no queda nada de la anterior en memoria.
  return <StoreDeCuenta key={uid ?? 'sin-cuenta'} uid={uid}>{children}</StoreDeCuenta>
}

function StoreDeCuenta({ uid, children }: { uid: number | null; children: ReactNode }) {
  const k = (n: (typeof CLAVES)[number]) => (uid == null ? null : clave(n, uid))
  const [miLista, setMiLista] = useState<string[]>(() => load(k('lista'), []))
  const [toast, setToast] = useState<string | null>(null)
  const [toastTono, setToastTono] = useState<TonoAviso>('ok')

  useEffect(() => { save(uid == null ? null : clave('lista', uid), miLista) }, [uid, miLista])

  const toastTimer = useRef<number | undefined>(undefined)
  const notify = useCallback((msg: string, tono: TonoAviso = 'ok') => {
    setToast(msg)
    setToastTono(tono)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), tono === 'aviso' ? 4200 : 2600)
  }, [])

  const value = useMemo<Store>(
    () => ({
      miLista,
      toggleLista: (id) => {
        setMiLista((l) => {
          const has = l.includes(id)
          notify(has ? 'Quitado de Mi lista' : 'Guardado en Mi lista')
          return has ? l.filter((x) => x !== id) : [...l, id]
        })
      },
      toast,
      toastTono,
      notify,
    }),
    [miLista, toast, toastTono, notify],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider missing')
  return s
}

/** Prefijo de la app activa: /farmacia, /comercial o /admin */
export function useBase() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg ? `/${seg}` : ''
}

export function Toast() {
  const { toast, toastTono } = useStore()
  if (!toast) return null
  return (
    <div role="status" className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[60] min-h-11 py-2.5 px-4 rounded-[11px] bg-[#242220] text-[#F4F2EF] text-md font-medium shadow-toast flex items-center gap-3 animate-[toast_.2s_ease-out] max-w-[calc(100vw-32px)]">
      {toastTono === 'aviso' ? (
        <span className="h-[18px] w-[18px] rounded-full bg-warn inline-flex items-center justify-center shrink-0 text-[11px] font-bold text-white">!</span>
      ) : (
        <span className="h-[18px] w-[18px] rounded-full bg-ok inline-flex items-center justify-center shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
      )}
      {toast}
      <style>{`@keyframes toast{from{transform:translate(-50%,8px);opacity:0}to{transform:translate(-50%,0);opacity:1}}`}</style>
    </div>
  )
}
