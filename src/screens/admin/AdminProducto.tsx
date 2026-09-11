import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { ArrowUpRight, Check, ChevronRight, Eye, PencilLine, AlertTriangle } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { productById, euro } from '@/data/products'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { ProductArt, FileBadge } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'

const tabs = ['General', 'Precios y tarifa', 'Materiales y cursos', 'Actividad', 'Versiones']

export function AdminProducto() {
  const { id } = useParams()
  const { notify } = useStore()
  const p = productById(id)
  const [tab, setTab] = useState(tabs[0])
  const [published, setPublished] = useState(p?.status === 'Publicado')
  if (!p) return <Navigate to="/admin/catalogo" replace />
  const checks = [['Precio y margen', !!p.pvp], ['Composición y VRN', p.composition.length > 1], ['Argumentario de mostrador', !!p.pitch], ['Imágenes del producto', true], ['Categoría y etiquetas', true], ['Material PLV asociado', !!p.hasPLV || p.id === 'magnesio-complex']] as const
  const okCount = checks.filter((c) => c[1]).length

  return (
    <Screen toolbar={<Toolbar back="/admin/catalogo" crumbs={[{ label: 'Catálogo', to: '/admin/catalogo' }, { label: p.name }]} right={<><Link to={`/farmacia/catalogo/${p.id}`}><Button icon={<Eye size={13} />}>Ver como farmacia</Button></Link><Link to={`/admin/catalogo/${p.id}/editar`}><Button variant="primary" icon={<PencilLine size={13} />}>Editar ficha</Button></Link></>} />}>
      <PageHeader
        title={<span className="flex items-center gap-3">{p.name}<Badge tone={published ? 'ok' : 'warn'} className="mt-1">{published ? 'Publicado' : 'Despublicado'}</Badge><button onClick={() => notify('suprafeel.com/producto/' + p.id)} className="mt-1 h-5 px-2 rounded-[5px] border border-accent-line text-xs font-medium text-accent inline-flex items-center gap-1">Ver en la web <ArrowUpRight size={11} /></button></span>}
        subtitle={`${p.categoryLabel.split(' y ')[0]} · CN ${p.cn} · ${p.format} · actualizado el ${p.updated} por ${p.updatedBy}`}
        right={<><Button onClick={() => notify('Duplicado como borrador')}>Duplicar</Button><Button onClick={() => { setPublished((v) => !v); notify(published ? 'Despublicado · las farmacias ya no lo ven' : 'Publicado · visible para 412 farmacias') }}>{published ? 'Despublicar' : 'Publicar'}</Button><Button variant="danger" onClick={() => notify('Pide confirmación antes de eliminar')}>Eliminar</Button></>}
      />
      <nav className="flex gap-5 border-b border-line -mt-2">
        {tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={cn('h-9 text-base font-medium border-b-2 -mb-px inline-flex items-center gap-1.5', tab === t ? 'text-ink border-accent font-semibold' : 'text-muted border-transparent hover:text-ink')}>{t}{t === 'Materiales y cursos' && <span className="h-4 min-w-4 px-1 rounded-full bg-chrome-deep text-[10px] font-semibold inline-flex items-center justify-center">4</span>}</button>)}
      </nav>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {(tab === 'General' || tab === 'Precios y tarifa') && (
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              <div className="h-11 px-4 flex items-center justify-between border-b border-line-soft"><span className="text-base font-semibold text-ink">Datos comerciales</span><span className="text-sm text-muted">Tarifa vigente desde el 3 sep</span></div>
              <div className="grid grid-cols-4 px-4 py-4 border-b border-line-soft">{[['PVP', p.pvp ? euro(p.pvp) : '—', ''], ['PVF', p.pvf ? euro(p.pvf) : '—', ''], ['Margen', p.margin ? `${p.margin} %` : '—', 'text-ok'], ['IVA', '10 %', '']].map(([k, v, c]) => <div key={k} className="flex flex-col"><span className="label">{k}</span><span className={cn('mt-1.5 text-h1 font-semibold tracking-tight leading-8', c)}>{v}</span></div>)}</div>
              <div className="px-4 py-3 flex flex-col gap-2 text-base">{[['Código nacional', p.cn], ['EAN', p.ean], ['Categoría', `${p.categoryLabel.split(' y ')[0]} · ${p.name.split(' ')[0]}`], ['Visible para', '412 farmacias · todas las zonas']].map(([k, v]) => <div key={k} className="flex gap-3"><span className="w-[160px] text-sm text-muted">{k}</span><span className="text-ink">{v}</span></div>)}<div className="flex gap-3"><span className="w-[160px] text-sm text-muted">Página pública</span><button onClick={() => notify('suprafeel.com/producto/' + p.id)} className="text-accent font-medium">suprafeel.com/producto/{p.id}</button></div></div>
            </div>
          )}
          {tab === 'General' && (
            <>
              <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
                <div className="h-11 px-4 flex items-center justify-between border-b border-line-soft"><span className="text-base font-semibold text-ink">Composición y formato</span><span className="text-sm text-muted">Por dosis diaria · {p.dose}</span></div>
                {p.composition.map((c, i) => <div key={c.name} className={cn('h-8 px-4 flex items-center text-base', i < p.composition.length - 1 && 'border-b border-line-soft')}><span className="flex-1 text-ink">{c.name}</span><span className="w-[90px] text-right font-semibold text-ink">{c.qty}</span><span className="w-[90px] text-right text-muted">{c.vrn === '—' ? '—' : `${c.vrn} VRN`}</span></div>)}
              </div>
              <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
                <div className="h-11 px-4 flex items-center justify-between border-b border-line-soft"><span className="text-base font-semibold text-ink">Argumentario de mostrador</span><span className="text-sm text-muted">Lo que ve la farmacia</span></div>
                <div className="p-4 flex flex-col gap-3"><p className="text-base leading-[19px] text-ink">{p.pitch || 'Sin argumentario. La farmacia no ve nada en esta ficha.'}</p><div className="rounded-lg bg-warn-wash border border-warn-line px-3 py-2.5 flex items-center gap-2 text-sm text-[#7A5A18]"><AlertTriangle size={13} className="shrink-0" />No se puede prometer mejora del sueño: no hay declaración autorizada para ese efecto.</div></div>
              </div>
            </>
          )}
          {tab === 'Precios y tarifa' && <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden"><div className="h-11 px-4 flex items-center border-b border-line-soft"><span className="text-base font-semibold text-ink">Histórico de tarifa</span></div>{[['3 sep 2025', euro(p.pvp || 18.9), euro(p.pvf || 12.85), 'Kevin S.'], ['12 ago 2025', euro((p.pvp || 18.9) - 1.4), euro((p.pvf || 12.85) - 0.7), 'Kevin S.'], ['14 feb 2024', euro((p.pvp || 18.9) - 2), euro((p.pvf || 12.85) - 1.2), 'Alta']].map(([d, a, b, w], i) => <div key={d} className={cn('h-10 px-4 flex items-center text-base', i < 2 && 'border-b border-line-soft')}><span className="w-[140px] text-ink">{d}</span><span className="w-[100px] font-semibold">{a}</span><span className="w-[100px] text-muted">PVF {b}</span><span className="flex-1 text-right text-sm text-faint">{w}</span></div>)}</div>}
          {tab === 'Materiales y cursos' && <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">{[{ k: 'PDF' as const, n: `Folleto ${p.name}`, m: 'Otoño 2025 · 156 solicitudes', to: '/admin/plv/otono' }, { k: 'PNG' as const, n: 'Stopper de lineal otoño', m: 'Otoño 2025 · 88 solicitudes', to: '/admin/plv/otono' }, { k: 'CUR' as const, n: 'Magnesio en el mostrador', m: 'Curso · 18 min · 94 completados', to: '/admin/cursos/magnesio' }, { k: 'DOC' as const, n: 'Regla · Insomnio adulto sin medicación', m: 'Chat inteligente · 412 usos', to: '/admin/chat/reglas' }].map((x, i) => <Link key={x.n} to={x.to} className={cn('h-[54px] px-4 flex items-center gap-3 hover:bg-canvas', i < 3 && 'border-b border-line-soft')}><FileBadge kind={x.k} /><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{x.n}</span><span className="text-xs text-faint">{x.m}</span></span><ChevronRight size={14} className="text-faint" /></Link>)}</div>}
          {tab === 'Actividad' && <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-3.5">{[['Argumentario reescrito', '3 sep · Kevin S.'], ['PVP 17,50 € → 18,90 €', '3 sep · Kevin S. · aviso a 6 comerciales'], ['PVP 16,90 € → 17,50 €', '12 ago · Kevin S.'], ['Vinculado al curso de magnesio', '2 jun · Kevin S.'], ['Publicado por primera vez', '14 feb 2024 · Kevin S.']].map(([t, m]) => <div key={t} className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-line shrink-0" /><div className="flex flex-col"><span className="text-base text-ink">{t}</span><span className="text-xs text-faint">{m}</span></div></div>)}</div>}
          {tab === 'Versiones' && <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">{[['v6 · actual', '3 sep 2025', 'Argumentario y tarifa'], ['v5', '12 ago 2025', 'Tarifa'], ['v4', '2 jun 2025', 'Vínculo al curso'], ['v3', '20 mar 2025', 'Imágenes nuevas'], ['v2', '9 oct 2024', 'Composición corregida'], ['v1', '14 feb 2024', 'Alta']].map(([v, d, w], i) => <div key={v} className={cn('h-10 px-4 flex items-center text-base', i < 5 && 'border-b border-line-soft')}><span className="w-[110px] font-medium text-ink">{v}</span><span className="w-[120px] text-muted">{d}</span><span className="flex-1 text-ink-soft">{w}</span>{i > 0 && <button className="text-sm font-medium text-accent" onClick={() => notify(`Restaurada ${v}`)}>Restaurar</button>}</div>)}</div>}
        </div>

        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <ProductArt art={p.art} size={92} filled className="h-[122px]" />
            <div className="p-4 flex items-center gap-2">{[0, 1, 2].map((i) => <span key={i} className={cn('h-9 w-9 rounded-md bg-chrome border', i === 0 ? 'border-accent ring-2 ring-accent-wash' : 'border-line')} />)}<button className="ml-auto text-sm font-medium text-accent" onClick={() => notify('Gestión de imágenes')}>Gestionar</button></div>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col">
            <div className="flex items-center justify-between"><span className="text-base font-semibold text-ink">Estado de la ficha</span><span className="text-sm font-semibold text-ok">{okCount} / {checks.length}</span></div>
            <div className="mt-3 flex flex-col gap-2">{checks.map(([l, ok]) => <div key={l} className="flex items-center gap-2 text-base"><span className={cn('h-4 w-4 rounded-full inline-flex items-center justify-center', ok ? 'bg-ok-wash text-ok' : 'bg-warn-wash text-warn')}>{ok ? <Check size={10} strokeWidth={3} /> : <span className="text-[10px] font-bold">!</span>}</span><span className={ok ? 'text-ink' : 'text-warn'}>{l}</span></div>)}</div>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-11 px-4 flex items-center justify-between border-b border-line-soft"><span className="text-base font-semibold text-ink">Contenido vinculado</span><button className="text-sm font-medium text-accent" onClick={() => notify('Vincular material o curso')}>Vincular</button></div>
            {[{ k: 'PDF' as const, n: `Folleto ${p.name.split(' ')[0]} ${p.name.split(' ')[1] ?? ''}`, m: 'Otoño 2025 · 156 solicitudes', to: '/admin/plv/otono' }, { k: 'PNG' as const, n: 'Stopper de lineal otoño', m: 'Otoño 2025 · 88 solicitudes', to: '/admin/plv/otono' }, { k: 'CUR' as const, n: 'Magnesio en el mostrador', m: 'Curso · 18 min · 94 completados', to: '/admin/cursos/magnesio' }].map((x, i) => <Link key={x.n} to={x.to} className={cn('h-[46px] px-4 flex items-center gap-2.5 hover:bg-canvas', i < 2 && 'border-b border-line-soft')}><FileBadge kind={x.k} /><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{x.n}</span><span className="text-xs text-faint">{x.m}</span></span><ChevronRight size={14} className="text-faint" /></Link>)}
          </div>
        </aside>
      </div>
    </Screen>
  )
}
