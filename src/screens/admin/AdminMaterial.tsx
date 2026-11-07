import { useCallback, useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { useStore } from '@/app/store'
import { call, useAuth } from '@/app/auth'
import { Notice, Vacio } from '@/ui/Page'
import { Tag } from '@/ui/Badge'
import { Button } from '@/ui/Button'
import { fechaSolicitud, tituloMaterial, type FilaSolicitud } from '@/screens/shared/Material'

/** Solicitudes de material publicitario que llegan de farmacias y comerciales. Va dentro de la Bandeja. */
export function ListaSolicitudes() {
  const { token } = useAuth()
  const { notify } = useStore()
  const [filas, setFilas] = useState<FilaSolicitud[] | null>(null)
  const [falla, setFalla] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const { res, body } = await call('/material/solicitudes', {}, token)
      if (!res.ok || !Array.isArray(body)) throw new Error()
      setFilas(body)
      setFalla(false)
    } catch {
      setFalla(true)
    }
  }, [token])

  useEffect(() => { void cargar() }, [cargar])

  const cambiar = async (s: FilaSolicitud) => {
    const estado = s.estado === 'gestionada' ? 'pendiente' : 'gestionada'
    try {
      const { res } = await call(`/material/solicitudes/${s.id}`, { method: 'PATCH', body: JSON.stringify({ estado }) }, token)
      if (!res.ok) throw new Error()
      setFilas((l) => l?.map((x) => (x.id === s.id ? { ...x, estado } : x)) ?? l)
    } catch {
      notify('No hemos podido cambiar la solicitud. Inténtalo de nuevo.', 'aviso')
    }
  }

  const pendientes = filas?.filter((s) => s.estado !== 'gestionada').length ?? 0
  return (
    <>
      {!!filas?.length && <p className="text-sm text-muted">{pendientes} {pendientes === 1 ? 'pendiente' : 'pendientes'} de {filas.length}</p>}
      {falla && <Notice tone="danger">No hemos podido cargar las solicitudes. Revisa tu conexión y vuelve a entrar.</Notice>}
      {filas?.length === 0 && <Vacio icon={<Package size={18} />} title="Todavía no hay solicitudes">Cuando una farmacia o un comercial pida material, saldrá aquí.</Vacio>}
      {!!filas?.length && (
        <div className="flex flex-col gap-3">
          {filas.map((s) => (
            <article key={s.id} className="rounded-xl bg-surface border border-line p-4 flex flex-col sm:flex-row gap-4">
              {s.foto && <a href={s.foto} target="_blank" rel="noopener noreferrer" className="shrink-0"><img src={s.foto} alt="Foto del espacio" className="h-24 w-24 rounded-lg border border-line object-cover" /></a>}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-ink">{tituloMaterial(s.material)} · {s.unidades} ud.</h2>
                  <Tag tone={s.estado === 'gestionada' ? 'muted' : 'accent'}>{s.estado === 'gestionada' ? 'Gestionada' : 'Pendiente'}</Tag>
                </div>
                <p className="text-base text-ink-soft">{s.farmacia_nombre} · {s.contacto}</p>
                <p className="text-sm text-muted">{s.direccion}</p>
                {s.ancho_cm && s.alto_cm ? <p className="text-sm text-muted">{s.ancho_cm} × {s.alto_cm} cm · {s.ubicacion}</p> : null}
                <p className="text-xs text-faint">{fechaSolicitud(s.created_at)}</p>
              </div>
              <div className="shrink-0"><Button onClick={() => void cambiar(s)}>{s.estado === 'gestionada' ? 'Volver a pendiente' : 'Marcar gestionada'}</Button></div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
