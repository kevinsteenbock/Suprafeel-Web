import { useState, type ComponentProps } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { Screen, FooterBar } from '@/app/Shell'
import { PENDIENTE_ADMIN, useStore } from '@/app/store'
import { historialDe, margen, productById } from '@/data/products'
import { cuenta, useCifras } from '@/app/datos'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Input, Select, Textarea } from '@/ui/Field'
import { Toggle } from '@/ui/Toggle'
import { ProductArt } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'

const tabs = ['General', 'Precios y tarifa', 'Composición']

/** Field dentro de un <label>: la etiqueta queda unida a su campo y al pulsarla se enfoca */
function Campo(props: ComponentProps<typeof Field>) {
  return <label className="contents"><Field {...props} /></label>
}

export function EditarProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useStore()
  const cifras = useCifras()
  const farmacias = cuenta(cifras.farmacias, 'farmacia', 'farmacias')
  const p = productById(id)
  const [tab, setTab] = useState(tabs[0])
  const [f, setF] = useState({ name: p?.name ?? '', cn: p?.cn ?? '', ean: p?.ean ?? '', slug: p?.id ?? '', pvp: p ? p.pvp.toFixed(2).replace('.', ',') : '', pvf: p ? p.pvf.toFixed(2).replace('.', ',') : '', format: p?.format ?? '', dose: p?.dose ?? '', pitch: p?.pitch ?? '' })
  const [visible, setVisible] = useState(true)
  const [novelty, setNovelty] = useState(false)
  // Al abrir no hay nada que guardar: el aviso sale cuando se toca algo.
  const [dirty, setDirty] = useState(false)
  if (!p) return <Navigate to="/admin/catalogo" replace />
  const set = (k: keyof typeof f) => (v: string) => { setF({ ...f, [k]: v }); setDirty(true) }
  const pvp = parseFloat(f.pvp.replace(',', '.')) || 0
  const pvf = parseFloat(f.pvf.replace(',', '.')) || 0
  // El mismo cálculo que la ficha y el catálogo: sobre el precio sin IVA.
  const margin = margen(pvp, pvf)

  return (
    <Screen
      toolbar={<Toolbar back={`/admin/catalogo/${p.id}`} crumbs={[{ label: 'Catálogo', to: '/admin/catalogo' }, { label: p.name, to: `/admin/catalogo/${p.id}` }, { label: 'Editar' }]} right={<span className="text-sm text-muted flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', dirty ? 'bg-accent' : 'bg-ok')} />{dirty ? 'Cambios sin guardar' : 'Guardado'}</span>} />}
      footer={<FooterBar title={dirty ? 'Hay cambios sin guardar' : 'Todo guardado'} subtitle="Todavía no se guarda: el catálogo de la consola aún no está conectado"><Link to={`/admin/catalogo/${p.id}`}><Button size="lg">Cancelar</Button></Link><Button variant="primary" size="lg" disabled={!dirty} onClick={() => { setDirty(false); notify(PENDIENTE_ADMIN, 'aviso'); navigate(`/admin/catalogo/${p.id}`) }}>Guardar y publicar</Button></FooterBar>}
    >
      <PageHeader title="Editar producto" subtitle="Esta pantalla todavía no guarda los cambios: el catálogo de la consola aún no está conectado." />
      <nav className="flex gap-5 border-b border-line -mt-2 overflow-x-auto no-scrollbar scroll-hint">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={cn('h-9 shrink-0 whitespace-nowrap text-base font-medium border-b-2 -mb-px', tab === t ? 'text-ink border-accent font-semibold' : 'text-muted border-transparent hover:text-ink')}>{t}</button>)}</nav>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {(tab === 'General' || tab === 'Precios y tarifa') && (
            <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
              {tab === 'General' && (
                <>
                  <Campo label="Nombre del producto" required labelClass="label"><Input value={f.name} onChange={set('name')} focus /></Campo>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Campo label="Código nacional" required labelClass="label"><Input value={f.cn} onChange={set('cn')} /></Campo><Campo label="EAN" labelClass="label"><Input value={f.ean} onChange={set('ean')} /></Campo><Field label="Categoría" required labelClass="label"><Select value={p.categoryLabel.split(' y ')[0]} chevron="down" /></Field></div>
                </>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Campo label="PVP" required labelClass="label"><Input value={f.pvp} onChange={set('pvp')} right={<span className="text-sm text-muted">€</span>} /></Campo>
                <Campo label="PVF" required labelClass="label"><Input value={f.pvf} onChange={set('pvf')} right={<span className="text-sm text-muted">€</span>} /></Campo>
                <Field label="Margen calculado" labelClass="label"><div className="h-[34px] rounded-md bg-ok-wash px-3 flex items-center text-base font-semibold text-ok">{margin} %</div></Field>
              </div>
              {pvp !== p.pvp && <div className="rounded-lg bg-accent-wash border border-accent-line px-3.5 py-3 flex items-center gap-2.5 text-sm text-accent-deep"><AlertCircle size={14} className="shrink-0 text-accent" /><span><b className="font-semibold">Has cambiado el PVP</b> Pasa de {p.pvp.toFixed(2).replace('.', ',')} € a {f.pvp} €.</span></div>}
            </div>
          )}
          {(tab === 'General' || tab === 'Composición') && (
            <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Campo label="Formato" required labelClass="label"><Input value={f.format} onChange={set('format')} /></Campo><Campo label="Dosis diaria" labelClass="label"><Input value={f.dose} onChange={set('dose')} /></Campo></div>
              {tab === 'Composición' && <div className="rounded-lg border border-line overflow-hidden">{p.composition.map((c, i) => <div key={`${i}-${c.name}`} className={cn('min-h-10 py-1.5 px-3 flex items-center gap-3 text-base', i < p.composition.length - 1 && 'border-b border-line-soft')}><span className="flex-1 min-w-0 text-ink">{c.name}</span><span className="min-w-[72px] sm:min-w-[90px] shrink-0 whitespace-nowrap text-right font-semibold">{c.qty}</span><span className="w-[56px] sm:w-[70px] shrink-0 text-right text-muted">{c.vrn}</span></div>)}</div>}
              <Campo label="Argumentario de mostrador" required labelClass="label" right={<span className="text-xs text-faint">{f.pitch.length} / 400</span>}><Textarea rows={3} value={f.pitch} onChange={set('pitch')} /></Campo>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col">
            <span className="text-base font-semibold text-ink">Foto</span>
            <div className="mt-3 flex items-center gap-3"><ProductArt art={p.art} photo={p.photo} size={54} filled className="h-[86px] w-[74px] rounded-lg border border-line" /><div className="flex flex-col text-sm"><span className="text-ink">{p.photo ? 'Foto de la ficha de Shopify' : 'Sin foto'}</span></div></div>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-4">
            <span className="text-base font-semibold text-ink">Publicación</span>
            <label className="flex items-center justify-between gap-3"><div className="flex flex-col min-w-0"><span className="text-base font-medium text-ink">Visible en el catálogo</span><span className="text-xs text-faint">{visible ? `Lo ven ${farmacias}` : 'Nadie lo ve mientras esté oculto'}</span></div><Toggle on={visible} onChange={(v) => { setVisible(v); setDirty(true) }} /></label>
            <label className="flex items-center justify-between gap-3"><div className="flex flex-col min-w-0"><span className="text-base font-medium text-ink">Marcar como novedad</span><span className="text-xs text-faint">Sale en «Novedades»</span></div><Toggle on={novelty} onChange={(v) => { setNovelty(v); setDirty(true) }} /></label>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col">
            <div className="flex items-center justify-between"><span className="text-base font-semibold text-ink">Últimos cambios</span><Link to={`/admin/catalogo/${p.id}`} className="text-sm font-medium text-accent">Ver todo</Link></div>
            <div className="mt-3 flex flex-col gap-3">{historialDe(p).map(({ t, fecha, quien }) => [t, `${fecha} · ${quien}`]).map(([t, m]) => <div key={t} className="flex gap-3 pb-3 border-b border-line-soft last:border-0 last:pb-0"><span className="mt-1.5 h-2 w-2 rounded-full bg-line shrink-0" /><div className="flex flex-col"><span className="text-base text-ink">{t}</span><span className="text-xs text-faint">{m}</span></div></div>)}</div>
          </div>
        </aside>
      </div>
    </Screen>
  )
}
