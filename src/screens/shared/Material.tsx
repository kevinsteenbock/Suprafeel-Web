import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, Package } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { call, useAuth } from '@/app/auth'
import { useContenido } from '@/app/datos'
import { documentoDe } from '@/data/contenido'
import { MATERIALES, materialPorId, type Material as TipoMaterial } from '@/data/material'
import { PageHeader, Section, Toolbar } from '@/ui/Page'
import { Tag } from '@/ui/Badge'
import { Button } from '@/ui/Button'
import { VisorDocumento } from '@/ui/VisorDocumento'
import { campanasVigentes } from './Promociones'

export interface FilaSolicitud {
  id: number
  created_at: number | string
  farmacia_nombre: string
  contacto: string
  direccion: string
  material: string
  unidades: number
  ancho_cm?: number | null
  alto_cm?: number | null
  ubicacion?: string
  foto?: string
  estado: string
}

export const tituloMaterial = (id: string) => materialPorId(id)?.titulo ?? id
export const fechaSolicitud = (v: number | string) => {
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TarjetaMaterial({ m }: { m: TipoMaterial }) {
  const base = useBase()
  const { contenido } = useContenido()
  const [abierto, setAbierto] = useState(false)
  const doc = m.documento ? documentoDe(contenido, m.documento) : undefined
  const imagen = doc?.portada || (m.imagen ? `${import.meta.env.BASE_URL}${m.imagen}` : '')
  return (
    <article className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col">
      <div className="h-[170px] bg-chrome flex items-center justify-center overflow-hidden">
        {imagen ? <img src={imagen} alt="" loading="lazy" className="h-full w-full object-contain" /> : <span className="text-faint"><Package size={30} strokeWidth={1.5} /></span>}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-ink">{m.titulo}</h3>
        <p className="text-sm text-muted leading-[19px] flex-1">{m.descripcion}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to={`${base}/material/solicitar/${m.id}`}><Button variant="primary" size="lg">Solicitar</Button></Link>
          {doc && <Button size="lg" onClick={() => setAbierto(true)}>Ver en digital</Button>}
        </div>
      </div>
      {abierto && doc && <VisorDocumento slug={doc.slug} titulo={doc.titulo} onClose={() => setAbierto(false)} />}
    </article>
  )
}

function MisSolicitudes() {
  const { token } = useAuth()
  const [filas, setFilas] = useState<FilaSolicitud[]>([])
  useEffect(() => {
    let vigente = true
    call('/material/solicitudes', {}, token)
      .then(({ res, body }) => { if (vigente && res.ok && Array.isArray(body)) setFilas(body) })
      .catch(() => {})
    return () => { vigente = false }
  }, [token])
  if (filas.length === 0) return null
  return (
    <Section title="Tus solicitudes">
      <div className="rounded-xl bg-surface border border-line overflow-hidden">
        {filas.map((s, i) => (
          <div key={s.id} className={`min-h-[52px] px-3.5 py-2 flex items-center gap-3 ${i < filas.length - 1 ? 'border-b border-line-soft' : ''}`}>
            <span className="flex-1 min-w-0 flex flex-col">
              <span className="text-base font-medium text-ink">{tituloMaterial(s.material)} · {s.unidades} ud.</span>
              <span className="text-sm text-muted">{s.farmacia_nombre} · {fechaSolicitud(s.created_at)}</span>
            </span>
            <Tag tone={s.estado === 'gestionada' ? 'muted' : 'accent'}>{s.estado === 'gestionada' ? 'Gestionada' : 'Recibida'}</Tag>
          </div>
        ))}
      </div>
    </Section>
  )
}

/** Material publicitario: lo que la farmacia puede ver y pedir, y las campañas activas. */
export function Material() {
  const base = useBase()
  const { contenido } = useContenido()
  const vigentes = campanasVigentes(contenido)
  return (
    <Screen toolbar={<Toolbar title="Material publicitario" />}>
      <PageHeader title="Material publicitario" subtitle="Vinilos, lineales, expositores, catálogos e infografías para tu farmacia." />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {MATERIALES.map((m) => <TarjetaMaterial key={m.id} m={m} />)}
      </div>
      {vigentes.length > 0 && (
        <Section title="Campañas activas">
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
            {vigentes.map((c) => (
              <Link key={c.id} to={`${base}/promociones`} className="rounded-xl bg-surface border border-line px-4 py-3 flex items-center gap-3 hover:border-faint">
                <span className="flex-1 min-w-0 text-base font-medium text-ink">{c.titulo}</span>
                <span className="text-sm font-semibold text-accent shrink-0">{c.oferta}</span>
                <ChevronRight size={15} className="text-faint shrink-0" />
              </Link>
            ))}
          </div>
        </Section>
      )}
      <MisSolicitudes />
    </Screen>
  )
}
