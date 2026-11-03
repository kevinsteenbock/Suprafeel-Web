import { useState } from 'react'
import { Link } from 'react-router'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { products } from '@/data/products'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { VideoProducto } from '@/ui/VideoProducto'
import { MiListaButton } from './Catalogo'

/** Los productos que tienen vídeo de formación, en el orden del catálogo. */
const conVideo = products.filter((p) => p.video)

/** «3:00» → 180 */
const segundos = (d: string) => d.split(':').reduce((a, n) => a * 60 + Number(n), 0)

/**
 * Formación: los vídeos de formación de Suprafeel, uno por producto. Cada tarjeta abre el vídeo en
 * grande; debajo, el enlace a la ficha del producto.
 */
export function Cursos() {
  const base = useBase()
  const [q, setQ] = useState('')
  const list = conVideo.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
  const totalMin = Math.round(conVideo.reduce((a, p) => a + segundos(p.video!.duracion), 0) / 60)

  return (
    <Screen toolbar={<Toolbar title="Formación" right={<><SearchField placeholder="Buscar producto" value={q} onChange={setQ} />{base !== '/admin' && <MiListaButton />}</>} />}>
      <PageHeader title="Formación" subtitle="Vídeos de formación de Suprafeel: qué es cada producto, para quién es y cómo se toma." right={<span className="text-base text-muted">{conVideo.length} vídeos · {totalMin} min en total</span>} />

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line px-6 py-10 text-center text-base text-muted">Ningún vídeo de formación encaja con «{q}».</div>
      ) : (
        <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} className="flex flex-col gap-2">
              <VideoProducto video={p.video!} nombre={p.name} titulo={p.name} detalle={`${p.categoryLabel} · ${p.video!.duracion} min`} />
              <Link to={`${base}/catalogo/${p.id}`} className="self-start text-sm font-medium text-accent hover:text-accent-deep">Ver la ficha del producto</Link>
            </div>
          ))}
        </div>
      )}
    </Screen>
  )
}
