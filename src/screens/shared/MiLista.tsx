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
  const { miLista, toggleLista } = useStore()
  const items = miLista.map(productById).filter(Boolean) as NonNullable<ReturnType<typeof productById>>[]
  const isComercial = base === '/comercial'
  // Se manda de verdad: se abre el correo de quien la tiene, con la lista dentro, para enviarla a quien quiera.
  const enviar = () => {
    const cuerpo = items.map((p) => `· ${p.name}${p.format ? ` (${p.format})` : ''} · PVP ${euro(p.pvp)}`).join('\n')
    window.location.href = `mailto:?subject=${encodeURIComponent('Mi lista de Suprafeel')}&body=${encodeURIComponent(cuerpo)}`
  }

  return (
    <Screen toolbar={<Toolbar back={`${base}/catalogo`} crumbs={[{ label: 'Catálogo', to: `${base}/catalogo` }, { label: 'Mi lista' }]} right={<Button disabled={!items.length} onClick={enviar}>Enviar por correo</Button>} />}>
      <PageHeader
        title="Mi lista"
        subtitle={isComercial ? 'Referencias que quieres enseñar en las próximas visitas.' : 'Productos que has guardado para tenerlos a mano o comentarlos con tu comercial.'}
        right={<span className="text-base text-muted">{items.length === 1 ? '1 producto' : `${items.length} productos`}</span>}
      />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 rounded-xl bg-surface border border-line shadow-card overflow-hidden">
          {items.length === 0 && <div className="p-8 text-center text-base text-muted">Todavía no has guardado nada. Pulsa el marcador en cualquier producto.</div>}
          {items.map((p, i) => (
            <div key={p.id} className={cn('h-[66px] px-4 flex items-center gap-3.5', i < items.length - 1 && 'border-b border-line-soft')}>
              <ProductArt art={p.art} photo={p.photo} size={30} className="h-11 w-11 rounded-md border border-line-soft" />
              <Link to={`${base}/catalogo/${p.id}`} className="flex-1 min-w-0 flex flex-col hover:text-accent-deep">
                <span className="text-base font-medium text-ink">{p.name}</span>
                <span className="text-xs text-faint">{[p.format, p.cn && `CN ${p.cn}`].filter(Boolean).join(' · ')}</span>
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
        <aside className="w-full lg:w-[300px] lg:shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col">
            <span className="text-base font-semibold text-ink">Se guarda en este navegador</span>
            <span className="text-sm text-muted mt-1.5 leading-4">{isComercial ? 'Todavía no se comparte con las farmacias. Si quieres pasársela a alguien, envíala por correo.' : 'Todavía no se comparte con tu comercial. Si quieres pasársela, envíala por correo.'} Al cerrar sesión se borra.</span>
          </div>
        </aside>
      </div>
    </Screen>
  )
}
