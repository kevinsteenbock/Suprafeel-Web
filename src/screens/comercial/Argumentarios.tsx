import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { call, useAuth } from '@/app/auth'
import { Notice, PageHeader, SearchField, Toolbar, Vacio } from '@/ui/Page'
import { Badge } from '@/ui/Badge'
import { cn } from '@/lib/cn'

type Veredicto = 'ventaja' | 'empate' | 'vigilar' | 'desventaja'

interface Entrada {
  id: string
  nombre: string
  equivalente: string
  pvp_propio: string
  pvp_rival: string
  veredicto: Veredicto
  motivo: string
  datos: string
  defensa: string
  nota?: string
}

interface Guia {
  titulo: string
  rival: string
  marca: string
  regla_de_oro: string
  entradas: Entrada[]
}

const VEREDICTOS: { key: Veredicto; label: string; tone: 'ok' | 'neutral' | 'warn' | 'danger' }[] = [
  { key: 'ventaja', label: 'Ventaja', tone: 'ok' },
  { key: 'empate', label: 'Empate', tone: 'neutral' },
  { key: 'vigilar', label: 'A vigilar', tone: 'warn' },
  { key: 'desventaja', label: 'Desventaja', tone: 'danger' },
]

const plano = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/**
 * Argumentarios de venta: solo comerciales y administración. El contenido no está en este código:
 * lo sirve GET /argumentarios, que responde 403 a una cuenta de farmacia.
 */
export function Argumentarios() {
  const { token } = useAuth()
  const [guia, setGuia] = useState<Guia | null>(null)
  const [fallo, setFallo] = useState(false)
  const [filtro, setFiltro] = useState<Veredicto | 'todos'>('todos')
  const [q, setQ] = useState('')

  useEffect(() => {
    let vigente = true
    call('/argumentarios', {}, token)
      .then(({ res, body }) => {
        if (!vigente) return
        if (res.ok && Array.isArray(body?.entradas)) setGuia(body as Guia)
        else setFallo(true)
      })
      .catch(() => vigente && setFallo(true))
    return () => { vigente = false }
  }, [token])

  const lista = (guia?.entradas ?? []).filter((e) => (filtro === 'todos' || e.veredicto === filtro) && (!q || plano(`${e.nombre} ${e.equivalente}`).includes(plano(q))))

  return (
    <Screen toolbar={<Toolbar title="Argumentarios de venta" right={<SearchField placeholder="Buscar producto" value={q} onChange={setQ} />} />}>
      <PageHeader title="Argumentarios de venta" subtitle={guia ? `${guia.titulo} · ${guia.marca}` : 'Zona privada de comerciales.'} />
      {fallo && <Vacio icon={<ShieldAlert size={18} />} title="No hemos podido cargar los argumentarios">Revisa tu conexión y vuelve a entrar en un momento.</Vacio>}
      {guia && (
        <>
          <Notice tone="accent" title="Regla de oro">{guia.regla_de_oro}</Notice>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por veredicto">
            {[{ key: 'todos' as const, label: 'Todos' }, ...VEREDICTOS].map((v) => (
              <button key={v.key} type="button" aria-pressed={filtro === v.key} onClick={() => setFiltro(v.key)} className={cn('h-8 rounded-full px-3 text-sm font-medium', filtro === v.key ? 'bg-accent text-on-accent' : 'bg-chrome text-ink-soft hover:bg-chrome-deep')}>{v.label}</button>
            ))}
          </div>
          {lista.length === 0 && <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-base text-muted">Nada que encaje con esa búsqueda.</div>}
          <div className="grid gap-3 grid-cols-1 xl:grid-cols-2">
            {lista.map((e) => {
              const v = VEREDICTOS.find((x) => x.key === e.veredicto)
              return (
                <article key={e.id} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h2 className="text-lg font-semibold text-ink">{e.nombre}</h2>
                      <span className="text-sm text-muted">Frente a {e.equivalente} · {e.pvp_propio} / {e.pvp_rival}</span>
                    </div>
                    <Badge tone={v?.tone ?? 'neutral'} className="shrink-0">{v?.label ?? e.veredicto}</Badge>
                  </div>
                  <p className="text-sm text-muted first-letter:uppercase">{e.motivo}</p>
                  <div className="flex flex-col gap-1"><span className="label">Datos clave</span><p className="text-base text-ink-soft">{e.datos}</p></div>
                  <div className="flex flex-col gap-1"><span className="label">Cómo defenderlo</span><p className="text-base text-ink-soft">{e.defensa}</p></div>
                  {e.nota && <Notice tone="neutral">{e.nota}</Notice>}
                </article>
              )
            })}
          </div>
        </>
      )}
    </Screen>
  )
}
