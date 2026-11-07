import { Link } from 'react-router'
import { Download, Sparkles } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { novedades } from '@/data/novedades'
import { Toolbar, PageHeader, Vacio } from '@/ui/Page'

const ruta = (archivo: string) => `${import.meta.env.BASE_URL}${archivo}`

/** Novedades: lo que Suprafeel vaya lanzando, con su imagen, su texto y su material. */
export function Novedades() {
  const base = useBase()
  return (
    <Screen toolbar={<Toolbar title="Novedades" />}>
      <PageHeader title="Novedades" subtitle="Lo último que lanza Suprafeel, con su material." />
      {novedades.length === 0 ? (
        <Vacio icon={<Sparkles size={18} />} title="Pronto tendremos novedades">
          Te avisaremos aquí.
        </Vacio>
      ) : (
        <div className="mt-6 grid gap-5 grid-cols-1 lg:grid-cols-2">
          {novedades.map((n) => (
            <article key={n.id} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col">
              <img src={ruta(n.imagen)} alt="" className="w-full aspect-video object-cover bg-chrome" />
              <div className="p-4 flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-ink">{n.titulo}</h2>
                <p className="text-base text-muted">{n.texto}</p>
                {n.producto && <Link to={`${base}/formacion/${n.producto}`} className="self-start text-sm font-medium text-accent hover:text-accent-deep">Ver la ficha del producto</Link>}
                {n.material?.map((m) => (
                  <a key={m.archivo} href={ruta(m.archivo)} download className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-deep"><Download size={13} />{m.titulo}</a>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </Screen>
  )
}
