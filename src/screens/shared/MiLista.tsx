import { Link } from 'react-router'
import { Bookmark, ChevronRight, Trash2 } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { productById, euro } from '@/data/products'
import { Toolbar, PageHeader, EmptyDashed } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { ProductArt } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'

export function MiLista() {
  const base = useBase()
  const { miLista, toggleLista, savedCases, notify } = useStore()
  const items = miLista.map(productById).filter(Boolean) as NonNullable<ReturnType<typeof productById>>[]
  const isComercial = base === '/comercial'

  return (
    <Screen toolbar={<Toolbar back={`${base}/catalogo`} crumbs={[{ label: 'Catálogo', to: `${base}/catalogo` }, { label: 'Mi lista' }]} right={<Button onClick={() => notify('Lista enviada por correo')}>Enviar por correo</Button>} />}>
      <PageHeader
        title="Mi lista"
        subtitle={isComercial ? 'Referencias que quieres enseñar en las próximas visitas.' : 'Productos que has guardado para tenerlos a mano o comentarlos con Álvaro.'}
        right={<span className="text-base text-muted">{items.length} productos · {savedCases} casos guardados</span>}
      />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 rounded-xl bg-surface border border-line shadow-card overflow-hidden">
          {items.length === 0 && <div className="p-8 text-center text-base text-muted">Todavía no has guardado nada. Pulsa el marcador en cualquier producto.</div>}
          {items.map((p, i) => (
            <div key={p.id} className={cn('h-[66px] px-4 flex items-center gap-3.5', i < items.length - 1 && 'border-b border-line-soft')}>
              <ProductArt art={p.art} size={30} className="h-11 w-11 rounded-md border border-line-soft" />
              <Link to={`${base}/catalogo/${p.id}`} className="flex-1 min-w-0 flex flex-col hover:text-accent-deep">
                <span className="text-base font-medium text-ink">{p.name}</span>
                <span className="text-xs text-faint">{p.format} · CN {p.cn}</span>
              </Link>
              <span className="text-base font-semibold text-ink w-[90px] text-right">{euro(p.pvp)}</span>
              <button onClick={() => toggleLista(p.id)} className="h-7 w-7 rounded-md inline-flex items-center justify-center text-faint hover:text-danger hover:bg-danger-wash"><Trash2 size={14} /></button>
              <Link to={`${base}/catalogo/${p.id}`}><ChevronRight size={14} className="text-faint" /></Link>
            </div>
          ))}
          {items.length > 0 && (
            <div className="p-3">
              <Link to={`${base}/catalogo`}><EmptyDashed className="h-11"><Bookmark size={13} /> Seguir guardando desde el catálogo</EmptyDashed></Link>
            </div>
          )}
        </div>
        <aside className="w-[300px] shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col">
            <span className="text-base font-semibold text-ink">{isComercial ? 'Se comparte con la farmacia' : 'Se comparte con tu comercial'}</span>
            <span className="text-sm text-muted mt-1.5 leading-4">{isComercial ? 'La farmacia verá esta lista en su área si lo activas en la ficha.' : 'Álvaro ve esta lista antes de cada visita para llevarte muestras y material. Puedes desactivarlo en Privacidad y datos.'}</span>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col">
            <span className="label">Casos guardados</span>
            <span className="mt-2 text-h1 font-semibold tracking-tight">{savedCases}</span>
            <span className="text-sm text-muted mt-1">del consejo por síntomas · últimos 30 días</span>
            <Link to={`${base}/consejo`} className="mt-4 text-base font-medium text-accent">Abrir el consejo por síntomas →</Link>
          </div>
        </aside>
      </div>
    </Screen>
  )
}
