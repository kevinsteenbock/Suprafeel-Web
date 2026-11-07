import { useState } from 'react'
import { Link } from 'react-router'
import { Tag as IconoTag } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { useContenido } from '@/app/datos'
import { euro, fechaDato, products, TARIFA } from '@/data/products'
import { hoyISO } from '@/data/pharmacies'
import { documentoDe, type Campana, type Contenido } from '@/data/contenido'
import { Notice, PageHeader, Section, Toolbar, Vacio } from '@/ui/Page'
import { Tag } from '@/ui/Badge'
import { ProductArt } from '@/ui/ProductArt'
import { VisorDocumento } from '@/ui/VisorDocumento'

type Estado = 'activa' | 'proxima' | 'terminada' | 'sin-fechas'

export function estadoCampana(c: Pick<Campana, 'desde' | 'hasta'>, hoy = hoyISO()): Estado {
  if (!c.hasta && !c.desde) return 'sin-fechas'
  if (c.hasta && hoy > c.hasta) return 'terminada'
  if (c.desde && hoy < c.desde) return 'proxima'
  return 'activa'
}

/** Las que siguen en pie: las activas y las que no traen fechas en su cartel. */
export const campanasVigentes = (c: Contenido) => c.campanas.filter((x) => ['activa', 'sin-fechas'].includes(estadoCampana(x)))

function TarjetaCampana({ c, contenido }: { c: Campana; contenido: Contenido }) {
  const [abierto, setAbierto] = useState(false)
  const doc = documentoDe(contenido, c.imagen)
  const estado = estadoCampana(c)
  const fechas = c.desde && c.hasta ? `Del ${fechaDato(c.desde)} al ${fechaDato(c.hasta)}` : 'Fechas por confirmar'
  return (
    <article className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col sm:flex-row">
      <button onClick={() => doc && setAbierto(true)} disabled={!doc} aria-label={`Ver el cartel de ${c.titulo}`} className="sm:w-[170px] shrink-0 bg-chrome flex items-center justify-center">
        {doc?.portada ? <img src={doc.portada} alt="" className="w-full max-sm:max-h-[260px] object-contain" loading="lazy" /> : <span className="py-10 text-faint"><IconoTag size={24} /></span>}
      </button>
      <div className="p-4 flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-ink">{c.titulo}</h3>
          {estado === 'activa' && <Tag>Activa</Tag>}
          {estado === 'terminada' && <Tag tone="muted">Terminada</Tag>}
          {estado === 'proxima' && <Tag tone="neutral">Próximamente</Tag>}
        </div>
        <p className="text-sm text-muted">{fechas}</p>
        <ul className="flex flex-col gap-1 text-base text-ink-soft list-disc pl-5">{c.condiciones.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
      {abierto && doc && <VisorDocumento slug={doc.slug} titulo={c.titulo} onClose={() => setAbierto(false)} />}
    </article>
  )
}

/** Promociones y ofertas: el margen básico de cada producto y, aparte, lo que suman las campañas. */
export function Promociones() {
  const base = useBase()
  const { contenido, falla } = useContenido()
  const lista = products.filter((p) => p.status === 'Publicado')
  return (
    <Screen toolbar={<Toolbar title="Promociones y ofertas" />}>
      <PageHeader title="Promociones y ofertas" subtitle="Dos niveles de ganancia: el margen básico, siempre disponible, y lo que sumas con cada campaña." />

      <Section title="Margen extra: campañas">
        {contenido.campanas.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            {contenido.campanas.map((c) => <TarjetaCampana key={c.id} c={c} contenido={contenido} />)}
          </div>
        ) : (
          <Vacio icon={<IconoTag size={18} />} title={falla ? 'No hemos podido cargar las campañas' : 'Ahora mismo no hay campañas'}>
            {falla ? 'Revisa tu conexión y vuelve a entrar en un momento.' : 'Cuando Suprafeel lance una, saldrá aquí con su imagen, fechas y condiciones.'}
          </Vacio>
        )}
      </Section>

      <Section title="Margen básico por producto" right={<span className="text-sm text-muted">{TARIFA}</span>}>
        <Notice tone="neutral">El margen se calcula sobre el PVPR sin IVA (10 %), igual que en los carteles de campaña.</Notice>
        <div className="rounded-xl bg-surface border border-line overflow-hidden">
          <div className="hidden sm:flex h-8 px-3.5 bg-chrome border-b border-line items-center">
            <span className="label flex-1 min-w-0">Producto</span><span className="label w-[84px] text-right">PVF</span><span className="label w-[84px] text-right">PVPR</span><span className="label w-[72px] text-right">Margen</span>
          </div>
          {lista.map((p, i) => (
            <Link key={p.id} to={`${base}/formacion/${p.id}`} className={`min-h-[52px] px-3.5 py-2 flex flex-wrap sm:flex-nowrap items-center gap-x-3 hover:bg-sel ${i < lista.length - 1 ? 'border-b border-line-soft' : ''}`}>
              <span className="w-full sm:w-auto sm:flex-1 min-w-0 flex items-center gap-2.5">
                <ProductArt art={p.art} photo={p.photo} size={32} className="h-8 w-8 rounded-md shrink-0" />
                <span className="text-base font-medium text-ink">{p.name}</span>
              </span>
              <span className="text-sm sm:text-base text-ink-soft sm:w-[84px] sm:text-right"><span className="sm:hidden text-muted">PVF </span>{euro(p.pvf)}</span>
              <span className="text-sm sm:text-base text-ink-soft sm:w-[84px] sm:text-right"><span className="sm:hidden text-muted">PVPR </span>{euro(p.pvp)}</span>
              <span className="text-sm sm:text-base font-semibold text-ink sm:w-[72px] sm:text-right"><span className="sm:hidden font-normal text-muted">Margen </span>{p.margin} %</span>
            </Link>
          ))}
        </div>
      </Section>
    </Screen>
  )
}
