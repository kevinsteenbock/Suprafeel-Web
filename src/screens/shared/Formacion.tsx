import { useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, ChevronRight } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { useContenido } from '@/app/datos'
import { categories, products } from '@/data/products'
import { documentoDe, SLUG_CATALOGO } from '@/data/contenido'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { ProductArt } from '@/ui/ProductArt'
import { VisorDocumento } from '@/ui/VisorDocumento'
import { Button } from '@/ui/Button'
import { MiListaButton } from './Catalogo'

const plano = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Formación: la lista de suplementos por gama; cada uno abre su ficha. Delante, el catálogo en digital. */
export function Formacion() {
  const base = useBase()
  const { contenido } = useContenido()
  const [q, setQ] = useState('')
  const [abierto, setAbierto] = useState(false)
  const catalogo = documentoDe(contenido, SLUG_CATALOGO)
  const lista = products.filter((p) => p.status === 'Publicado' && (!q || plano(p.name).includes(plano(q))))

  return (
    <Screen toolbar={<Toolbar title="Formación" right={<><SearchField placeholder="Buscar suplemento" value={q} onChange={setQ} />{base !== '/admin' && <MiListaButton />}</>} />}>
      <PageHeader title="Formación" subtitle="Elige un suplemento para ver su ficha, su presentación de formación y su vídeo." />

      {catalogo && (
        <section className="rounded-xl bg-surface border border-line shadow-card p-4 flex items-center gap-4">
          <span className="h-11 w-11 shrink-0 rounded-lg bg-accent-wash text-accent inline-flex items-center justify-center"><BookOpen size={20} /></span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-ink">{catalogo.titulo}</h2>
            <p className="text-sm text-muted">Todos los suplementos, en la última versión.</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setAbierto(true)}>Ver</Button>
        </section>
      )}
      {abierto && catalogo && <VisorDocumento slug={catalogo.slug} titulo={catalogo.titulo} onClose={() => setAbierto(false)} />}

      {lista.length === 0 && <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-base text-muted">Ningún suplemento encaja con «{q}».</div>}

      {categories.map((gama) => {
        const suyos = lista.filter((p) => p.categoryLabel === gama)
        if (suyos.length === 0) return null
        return (
          <section key={gama} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-ink">{gama}</h2>
            <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {suyos.map((p) => (
                <Link key={p.id} to={`${base}/formacion/${p.id}`} className="rounded-xl bg-surface border border-line p-3 flex items-center gap-3 hover:border-faint">
                  <ProductArt art={p.art} photo={p.photo} size={56} className="h-14 w-14 rounded-lg shrink-0" />
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="text-base font-semibold text-ink">{p.name}</span>
                    <span className="text-sm text-muted">{p.format}{p.video ? ` · vídeo de ${p.video.duracion} min` : ''}</span>
                  </span>
                  <ChevronRight size={15} className="text-faint shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </Screen>
  )
}
