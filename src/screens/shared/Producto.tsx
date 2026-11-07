import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router'
import { Bookmark } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { productById, euro } from '@/data/products'
import { Toolbar, KeyValue, Notice } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { ProductArt } from '@/ui/ProductArt'
import { VideoProducto } from '@/ui/VideoProducto'
import { cn } from '@/lib/cn'

const tabs = ['Composición', 'Modo de empleo', 'Advertencias']

export function Producto() {
  const { id } = useParams()
  const base = useBase()
  const { miLista, toggleLista } = useStore()
  const p = productById(id)
  const [tab, setTab] = useState(tabs[0])
  if (!p) return <Navigate to={`${base}/catalogo`} replace />
  const saved = miLista.includes(p.id)
  const isComercial = base === '/comercial'

  return (
    <Screen
      toolbar={
        <Toolbar
          back={`${base}/catalogo`}
          crumbs={[{ label: 'Catálogo', to: `${base}/catalogo` }, { label: p.name }]}
          right={<Button variant={saved ? 'soft' : 'secondary'} icon={<Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />} onClick={() => toggleLista(p.id)}>{saved ? 'En Mi lista' : 'Guardar en Mi lista'}</Button>}
        />
      }
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Columna imagen */}
        <div className="w-full lg:w-[336px] lg:shrink-0 flex flex-col gap-4">
          <ProductArt art={p.art} photo={p.photo} size={180} className="h-[330px] rounded-xl border border-line" />
          {p.video && <VideoProducto video={p.video} nombre={p.name} />}
          <KeyValue labelWidth={104} rows={[{ k: 'Formato', v: p.packaging }, { k: 'Alérgenos', v: p.allergens }, { k: 'Apto para', v: p.suitable }, { k: 'Registro sanitario', v: p.registry }].filter((r) => r.v)} />
        </div>

        {/* Columna ficha */}
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="label text-accent">{p.categoryLabel}{p.tag ? ` · ${p.tag}` : ''}</span>
          <h1 className="mt-2 text-display font-semibold tracking-tight text-ink">{p.name}</h1>
          <p className="mt-2 text-base text-muted">{[p.format, p.cn && `CN ${p.cn}`, p.ean && `EAN ${p.ean}`].filter(Boolean).join(' · ')}</p>
          <Link to={`${base}/formacion/${p.id}`} className="mt-2 self-start text-sm font-medium text-accent hover:text-accent-deep">Ver su ficha de formación</Link>

          <div className="mt-5 rounded-xl bg-surface border border-line flex flex-col sm:flex-row divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-line-soft">
            <div className="flex-1 px-4 py-4 flex flex-col"><span className="label">PVP recomendado</span><span className="mt-2 text-h1 font-semibold tracking-tight leading-8">{euro(p.pvp)}</span></div>
            <div className="flex-1 px-4 py-4 flex flex-col"><span className="label">{isComercial ? 'Margen para la farmacia' : 'Margen orientativo'}</span><span className="mt-2 text-h1 font-semibold tracking-tight leading-8">{p.margin} %</span></div>
          </div>

          <nav className="mt-5 flex gap-5 border-b border-line overflow-x-auto no-scrollbar scroll-hint">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn('h-9 shrink-0 whitespace-nowrap text-base font-medium border-b-2 -mb-px', tab === t ? 'text-ink border-accent font-semibold' : 'text-muted border-transparent hover:text-ink')}>{t}</button>
            ))}
          </nav>

          {tab === 'Composición' && (
            <div className="mt-4 rounded-xl bg-surface border border-line overflow-hidden">
              <div className="h-8 px-[14px] bg-chrome border-b border-line flex items-center"><span className="label flex-1 min-w-0">Por {p.dose.match(/^\d+ \p{L}+/u)?.[0] ?? '1 toma'}</span><span className="label w-[96px] sm:w-[110px] shrink-0 text-right">Cantidad</span><span className="label w-[60px] sm:w-[70px] shrink-0 text-right">% VRN</span></div>
              {/* Las filas crecen con su texto: en el móvil un nombre largo ocupa 2 o 3 líneas sin pisar la fila siguiente. */}
              {p.composition.map((c, i) => (
                <div key={`${i}-${c.name}`} className={cn('min-h-[38px] py-2 px-[14px] flex items-center', i < p.composition.length - 1 && 'border-b border-line-soft')}>
                  <span className="flex-1 min-w-0 pr-2 text-base text-ink">{c.name}</span>
                  <span className="min-w-[96px] sm:min-w-[110px] shrink-0 text-right text-base font-semibold text-ink whitespace-nowrap">{c.qty}</span>
                  <span className="w-[60px] sm:w-[70px] shrink-0 text-right text-base text-muted whitespace-nowrap">{c.vrn}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'Modo de empleo' && (
            <KeyValue className="mt-4" rows={[{ k: 'Pauta', v: p.dose }]} />
          )}
          {tab === 'Advertencias' && (
            <div className="mt-4 flex flex-col gap-2.5">
              {p.warning && <Notice tone="warn" icon={<span className="text-warn font-bold">!</span>}>{p.warning}</Notice>}
              <Notice tone="neutral">No superar la dosis diaria recomendada. Los complementos alimenticios no sustituyen una dieta variada.</Notice>
            </div>
          )}


          {p.warning && <Notice className="mt-4" tone="warn" icon={<span className="text-warn font-bold text-base">!</span>}>{p.warning}</Notice>}

        </div>
      </div>
    </Screen>
  )
}
