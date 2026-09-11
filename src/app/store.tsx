import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'

export type Role = 'farmacia' | 'comercial' | 'admin'

interface Store {
  role: Role | null
  setRole: (r: Role | null) => void
  miLista: string[]
  toggleLista: (id: string) => void
  solicitud: Record<string, number>
  setQty: (id: string, n: number) => void
  savedCases: number
  saveCase: () => void
  toast: string | null
  notify: (msg: string) => void
}

const Ctx = createContext<Store | null>(null)

function load<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => load('sf.role', null))
  const [miLista, setMiLista] = useState<string[]>(() => load('sf.lista', ['magnesio-complex', 'melatonina-noche', 'omega-3', 'vitamina-d3-k2']))
  const [solicitud, setSolicitud] = useState<Record<string, number>>(() => load('sf.solicitud', { expositor: 1, cartel: 2, 'folleto-magnesio': 1 }))
  const [savedCases, setSavedCases] = useState(2)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { try { localStorage.setItem('sf.role', JSON.stringify(role)) } catch {} }, [role])
  useEffect(() => { try { localStorage.setItem('sf.lista', JSON.stringify(miLista)) } catch {} }, [miLista])
  useEffect(() => { try { localStorage.setItem('sf.solicitud', JSON.stringify(solicitud)) } catch {} }, [solicitud])

  const toastTimer = useRef<number | undefined>(undefined)
  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const value = useMemo<Store>(
    () => ({
      role,
      setRole: setRoleState,
      miLista,
      toggleLista: (id) => {
        setMiLista((l) => {
          const has = l.includes(id)
          notify(has ? 'Quitado de Mi lista' : 'Guardado en Mi lista')
          return has ? l.filter((x) => x !== id) : [...l, id]
        })
      },
      solicitud,
      setQty: (id, n) => {
        setSolicitud((s) => {
          const next = { ...s }
          if (n <= 0) delete next[id]
          else next[id] = n
          return next
        })
      },
      savedCases,
      saveCase: () => {
        setSavedCases((n) => n + 1)
        notify('Caso guardado · tu comercial lo verá antes de la visita')
      },
      toast,
      notify,
    }),
    [role, miLista, solicitud, savedCases, toast, notify],
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
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[60] h-11 px-4 rounded-[11px] bg-[#242220] text-[#F4F2EF] text-md font-medium shadow-toast flex items-center gap-3 animate-[toast_.2s_ease-out]">
      <span className="h-[18px] w-[18px] rounded-full bg-ok inline-flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </span>
      {toast}
      <style>{`@keyframes toast{from{transform:translate(-50%,8px);opacity:0}to{transform:translate(-50%,0);opacity:1}}`}</style>
    </div>
  )
}
