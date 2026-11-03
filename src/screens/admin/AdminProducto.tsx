import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Check, Eye, PencilLine } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { PENDIENTE_ADMIN, useStore } from '@/app/store'
import { productById, euro, historialDe, TARIFA } from '@/data/products'
import { cuenta, useCifras } from '@/app/datos'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { ProductArt } from '@/ui/ProductArt'
import { VideoProducto } from '@/ui/VideoProducto'
import { cn } from '@/lib/cn'

const tabs = ['General', 'Precios y tarifa', 'Actividad', 'Versiones']

export function AdminProducto() {
  const { id } = useParams()
  const { notify } = useStore()
  const cifras = useCifras()
  const farmacias = cuenta(cifras.farmacias, 'farmacia', 'farmacias')
  const p = productById(id)
  const [tab, setTab] = useState(tabs[0])
  const [published, setPublished] = useState(p?.status === 'Publicado')
  if (!p) return <Navigate to="/admin/catalogo" replace />
  const checks = [['Precio y margen', !!p.pvp], ['Composición y VRN', p.composition.length > 1], ['Argumentario de mostrador', !!p.pitch], ['Foto del producto', !!p.photo], ['Vídeo de formación', !!p.video]] as const
  const okCount = checks.filter((c) => c[1]).length

  return (
    <Screen toolbar={<Toolbar back="/admin/catalogo" crumbs={[{ label: 'Catálogo', to: '/admin/catalogo' }, { label: p.name }]} right={<><Link to={`/farmacia/catalogo/${p.id}`}><Button icon={<Eye size={13} />}>Ver como farmacia</Button></Link><Link to={`/admin/catalogo/${p.id}/editar`}><Button variant="primary" icon={<PencilLine size={13} />}>Editar ficha</Button></Link></>} />}>
      <PageHeader
        title={<span className="flex items-center gap-3">{p.name}<Badge tone={published ? 'ok' : 'warn'} className="mt-1">{published ? 'Publicado' : 'Despublicado'}</Badge></span>}
        subtitle={[p.categoryLabel.split(' y ')[0], p.cn && `CN ${p.cn}`, p.format, `actualizado el ${p.updated} por ${p.updatedBy}`].filter(Boolean).join(' · ')}
        right={<><Button onClick={() => notify(PENDIENTE_ADMIN, 'aviso')}>Duplicar</Button><Button onClick={() => { setPublished((v) => !v); notify(PENDIENTE_ADMIN, 'aviso') }}>{published ? 'Despublicar' : 'Publicar'}</Button><Button variant="danger" onClick={() => notify('Pide confirmación antes de eliminar')}>Eliminar</Button></>}
      />
      <nav className="flex gap-5 border-b border-line -mt-2 overflow-x-auto no-scrollbar scroll-hint">
        {tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={cn('h-9 shrink-0 whitespace-nowrap text-base font-medium border-b-2 -mb-px inline-flex items-center gap-1.5', tab === t ? 'text-ink border-accent font-semibold' : 'text-muted border-transparent hover:text-ink')}>{t}</button>)}
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {(tab === 'General' || tab === 'Precios y tarifa') && (
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              <div className="min-h-11 py-2 px-4 flex items-center justify-between gap-3 border-b border-line-soft"><span className="text-base font-semibold text-ink">Datos comerciales</span><span className="text-sm text-muted text-right">{TARIFA}</span></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 px-4 py-4 border-b border-line-soft gap-3">{[['PVP', p.pvp ? euro(p.pvp) : '—', ''], ['PVF', p.pvf ? euro(p.pvf) : '—', ''], ['Margen', p.margin ? `${p.margin} %` : '—', 'text-ok'], ['IVA', '10 %', '']].map(([k, v, c]) => <div key={k} className="flex flex-col"><span className="label">{k}</span><span className={cn('mt-1.5 text-h1 font-semibold tracking-tight leading-8', c)}>{v}</span></div>)}</div>
              <div className="px-4 py-3 flex flex-col gap-2 text-base">{[['Código nacional', p.cn || 'Sin asignar'], ['EAN', p.ean || 'Sin asignar'], ['Categoría', p.categoryLabel], ['Visible para', farmacias]].map(([k, v]) => <div key={k} className="flex gap-3"><span className="w-[120px] sm:w-[160px] max-sm:shrink-0 text-sm text-muted">{k}</span><span className="max-sm:min-w-0 text-ink break-words">{v}</span></div>)}</div>
            </div>
          )}
          {tab === 'General' && (
            <>
              <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
                <div className="min-h-11 py-2 px-4 flex flex-col items-start sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-3 border-b border-line-soft"><span className="text-base font-semibold text-ink">Composición y formato</span><span className="text-sm text-muted sm:text-right">Por dosis diaria · {p.dose}</span></div>
                {p.composition.map((c, i) => <div key={`${i}-${c.name}`} className={cn('min-h-8 py-1.5 px-4 flex items-center gap-3 sm:gap-0 text-base', i < p.composition.length - 1 && 'border-b border-line-soft')}><span className="flex-1 min-w-0 text-ink">{c.name}</span><span className="min-w-[72px] sm:min-w-[90px] shrink-0 whitespace-nowrap text-right font-semibold text-ink">{c.qty}</span><span className="w-[64px] sm:w-[90px] shrink-0 text-right text-muted">{c.vrn === '—' ? '—' : `${c.vrn} VRN`}</span></div>)}
              </div>
              <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
                <div className="min-h-11 py-2 px-4 flex items-center justify-between gap-3 border-b border-line-soft"><span className="text-base font-semibold text-ink">Argumentario de mostrador</span><span className="text-sm text-muted text-right">Lo que ve la farmacia</span></div>
                <div className="p-4 flex flex-col gap-3"><p className="text-base leading-[19px] text-ink">{p.pitch || 'Sin argumentario. La farmacia no ve nada en esta ficha.'}</p></div>
              </div>
            </>
          )}
          {tab === 'Precios y tarifa' && <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden"><div className="min-h-11 py-2 px-4 flex items-center border-b border-line-soft"><span className="text-base font-semibold text-ink">Histórico de tarifa</span></div><div className="min-h-10 py-2 xl:py-0 px-4 flex flex-wrap items-center gap-y-1 text-base border-b border-line-soft"><span className="w-[100px] sm:w-[140px] shrink-0 text-ink">{TARIFA}</span><span className="w-[80px] sm:w-[100px] shrink-0 font-semibold">{p.pvp ? euro(p.pvp) : '—'}</span><span className="sm:w-[100px] shrink-0 text-muted">PVF {p.pvf ? euro(p.pvf) : '—'}</span><span className="flex-1 min-w-[150px] sm:text-right text-sm text-faint">{historialDe(p)[0].fecha} · {historialDe(p)[0].quien}</span></div><p className="px-4 py-3 text-sm text-muted">Las tarifas anteriores no están en la app: el histórico empieza con esta.</p></div>}
          {tab === 'Actividad' && <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-3.5">{historialDe(p).map(({ t, fecha, quien }) => [t, `${fecha} · ${quien}`]).map(([t, m]) => <div key={t} className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-line shrink-0" /><div className="flex flex-col"><span className="text-base text-ink">{t}</span><span className="text-xs text-faint">{m}</span></div></div>)}</div>}
          {tab === 'Versiones' && <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">{[['Actual', historialDe(p)[0].fecha, historialDe(p)[0].t.charAt(0).toUpperCase() + historialDe(p)[0].t.slice(1)]].map(([v, d, w]) => <div key={v} className="min-h-10 py-2 lg:py-0.5 px-4 flex items-center gap-3 sm:gap-0 text-base"><span className="w-[64px] sm:w-[110px] shrink-0 font-medium text-ink">{v}</span><span className="w-[72px] sm:w-[120px] shrink-0 text-muted">{d}</span><span className="flex-1 min-w-0 text-ink-soft">{w}</span></div>)}</div>}
        </div>

        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <ProductArt art={p.art} photo={p.photo} size={92} filled className="h-[122px]" />
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col">
            <div className="flex items-center justify-between"><span className="text-base font-semibold text-ink">Estado de la ficha</span><span className="text-sm font-semibold text-ok">{okCount} / {checks.length}</span></div>
            <div className="mt-3 flex flex-col gap-2">{checks.map(([l, ok]) => <div key={l} className="flex items-center gap-2 text-base"><span className={cn('h-4 w-4 rounded-full inline-flex items-center justify-center', ok ? 'bg-ok-wash text-ok' : 'bg-warn-wash text-warn')}>{ok ? <Check size={10} strokeWidth={3} /> : <span className="text-[10px] font-bold">!</span>}</span><span className={ok ? 'text-ink' : 'text-warn'}>{l}</span></div>)}</div>
          </div>
          {p.video && <VideoProducto video={p.video} nombre={p.name} />}
        </aside>
      </div>
    </Screen>
  )
}
