import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ArrowUpRight, Plus, AlertCircle } from 'lucide-react'
import { Screen, FooterBar } from '@/app/Shell'
import { useStore } from '@/app/store'
import { productById } from '@/data/products'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Input, Select, Textarea } from '@/ui/Field'
import { Toggle } from '@/ui/Toggle'
import { ProductArt } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'

const tabs = ['General', 'Precios y tarifa', 'Composición', 'Materiales y cursos', 'Visibilidad']

export function EditarProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useStore()
  const p = productById(id)
  const [tab, setTab] = useState(tabs[0])
  const [f, setF] = useState({ name: p?.name ?? '', cn: p?.cn ?? '', ean: p?.ean ?? '', slug: p?.id ?? '', pvp: p ? p.pvp.toFixed(2).replace('.', ',') : '', pvf: p ? p.pvf.toFixed(2).replace('.', ',') : '', format: `${p?.format ?? ''} · 800 mg`, dose: p?.dose ?? '', pitch: p?.pitch ?? '' })
  const [visible, setVisible] = useState(true)
  const [novelty, setNovelty] = useState(false)
  const [dirty, setDirty] = useState(true)
  if (!p) return <Navigate to="/admin/catalogo" replace />
  const set = (k: keyof typeof f) => (v: string) => { setF({ ...f, [k]: v }); setDirty(true) }
  const pvp = parseFloat(f.pvp.replace(',', '.')) || 0
  const pvf = parseFloat(f.pvf.replace(',', '.')) || 0
  const margin = pvp && pvf ? Math.round(((pvp - pvf) / pvp) * 100) : 0

  return (
    <Screen
      toolbar={<Toolbar back={`/admin/catalogo/${p.id}`} crumbs={[{ label: 'Catálogo', to: '/admin/catalogo' }, { label: p.name, to: `/admin/catalogo/${p.id}` }, { label: 'Editar' }]} right={<span className="text-sm text-muted flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', dirty ? 'bg-accent' : 'bg-ok')} />{dirty ? 'Cambios sin guardar' : 'Guardado'}</span>} />}
      footer={<FooterBar title={dirty ? 'Hay cambios sin guardar' : 'Todo guardado'} subtitle="Al guardar se genera una nueva versión de tarifa y los 6 comerciales reciben el aviso"><Link to={`/admin/catalogo/${p.id}`}><Button size="lg">Cancelar</Button></Link><Button variant="primary" size="lg" disabled={!dirty} onClick={() => { setDirty(false); notify('Ficha guardada · v7 publicada a 412 farmacias'); navigate(`/admin/catalogo/${p.id}`) }}>Guardar y publicar</Button></FooterBar>}
    >
      <PageHeader title="Editar producto" subtitle="Los cambios en precio y estado se publican a las 412 farmacias en cuanto guardas." />
      <nav className="flex gap-5 border-b border-line -mt-2">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={cn('h-9 text-base font-medium border-b-2 -mb-px', tab === t ? 'text-ink border-accent font-semibold' : 'text-muted border-transparent hover:text-ink')}>{t}</button>)}</nav>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {(tab === 'General' || tab === 'Precios y tarifa') && (
            <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
              {tab === 'General' && (
                <>
                  <Field label="Nombre del producto" required labelClass="label"><Input value={f.name} onChange={set('name')} focus /></Field>
                  <div className="grid grid-cols-3 gap-4"><Field label="Código nacional" required labelClass="label"><Input value={f.cn} onChange={set('cn')} /></Field><Field label="EAN" labelClass="label"><Input value={f.ean} onChange={set('ean')} /></Field><Field label="Categoría" required labelClass="label"><Select value={p.categoryLabel.split(' y ')[0]} chevron="down" /></Field></div>
                  <Field label="Página pública en la web" labelClass="label" right={<button className="text-sm font-medium text-accent inline-flex items-center gap-1" onClick={() => notify('suprafeel.com/producto/' + f.slug)}>Abrir <ArrowUpRight size={11} /></button>}><div className="flex"><span className="h-[34px] px-3 rounded-l-md bg-chrome border border-r-0 border-line text-base text-faint inline-flex items-center">suprafeel.com/producto/</span><Input className="rounded-l-none" value={f.slug} onChange={set('slug')} /></div></Field>
                </>
              )}
              <div className="grid grid-cols-3 gap-4">
                <Field label="PVP" required labelClass="label"><Input value={f.pvp} onChange={set('pvp')} right={<span className="text-sm text-muted">€</span>} /></Field>
                <Field label="PVF" required labelClass="label"><Input value={f.pvf} onChange={set('pvf')} right={<span className="text-sm text-muted">€</span>} /></Field>
                <Field label="Margen calculado" labelClass="label"><div className="h-[34px] rounded-md bg-ok-wash px-3 flex items-center text-base font-semibold text-ok">{margin} %</div></Field>
              </div>
              {pvp !== p.pvp && <div className="rounded-lg bg-accent-wash border border-accent-line px-3.5 py-3 flex items-center gap-2.5 text-sm text-accent-deep"><AlertCircle size={14} className="shrink-0 text-accent" /><span><b className="font-semibold">Has cambiado el PVP</b> Pasa de {p.pvp.toFixed(2).replace('.', ',')} € a {f.pvp} €. Al guardar se genera una nueva versión de tarifa y los 6 comerciales reciben el aviso.</span></div>}
            </div>
          )}
          {(tab === 'General' || tab === 'Composición') && (
            <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4"><Field label="Formato" required labelClass="label"><Input value={f.format} onChange={set('format')} /></Field><Field label="Dosis diaria" labelClass="label"><Input value={f.dose} onChange={set('dose')} /></Field></div>
              {tab === 'Composición' && <div className="rounded-lg border border-line overflow-hidden">{p.composition.map((c, i) => <div key={c.name} className={cn('h-10 px-3 flex items-center gap-3 text-base', i < p.composition.length - 1 && 'border-b border-line-soft')}><span className="flex-1 text-ink">{c.name}</span><span className="w-[90px] text-right font-semibold">{c.qty}</span><span className="w-[70px] text-right text-muted">{c.vrn}</span></div>)}<button onClick={() => notify('Añadir ingrediente')} className="h-10 px-3 w-full flex items-center gap-2 text-base font-medium text-accent hover:bg-canvas"><Plus size={13} /> Añadir ingrediente</button></div>}
              <Field label="Argumentario de mostrador" required labelClass="label" right={<span className="text-xs text-faint">{f.pitch.length} / 400</span>}><Textarea rows={3} value={f.pitch} onChange={set('pitch')} /></Field>
            </div>
          )}
          {tab === 'Materiales y cursos' && <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-3"><span className="text-base font-semibold text-ink">Vinculado a este producto</span>{['Folleto Magnesio Complex · Otoño 2025', 'Stopper de lineal otoño · Otoño 2025', 'Curso · Magnesio en el mostrador', 'Regla del chat · Insomnio adulto'].map((x) => <div key={x} className="h-10 rounded-lg border border-line px-3 flex items-center text-base text-ink">{x}<button className="ml-auto text-sm font-medium text-danger" onClick={() => notify('Desvinculado')}>Quitar</button></div>)}<button onClick={() => notify('Buscar material o curso')} className="h-10 rounded-lg border border-dashed border-line text-base font-medium text-accent">+ Vincular otro</button></div>}
          {tab === 'Visibilidad' && <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4"><Field label="Visible para" labelClass="label"><Select value="Todas las farmacias · 412" chevron="down" /></Field><Field label="Zonas" labelClass="label"><Select value="Todas las zonas" chevron="down" /></Field><div className="flex items-center justify-between pt-3 border-t border-line-soft"><div className="flex flex-col"><span className="text-base font-medium text-ink">Ocultar a las farmacias en plan Básico</span><span className="text-sm text-muted">Solo lo verán las 118 farmacias Pro</span></div><Toggle on={false} onChange={() => notify('Cambio de visibilidad')} /></div></div>}
        </div>

        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col">
            <span className="text-base font-semibold text-ink">Imágenes</span>
            <div className="mt-3 flex items-center gap-3"><ProductArt art={p.art} size={54} filled className="h-[86px] w-[74px] rounded-lg border border-line" /><button onClick={() => notify('Sube JPG o PNG · mínimo 1200 px')} className="h-[86px] w-[74px] rounded-lg border border-dashed border-line bg-chrome flex flex-col items-center justify-center text-faint text-xs"><Plus size={14} />Subir</button><div className="flex flex-col text-sm"><span className="text-ink">3 imágenes</span><span className="text-faint text-xs mt-0.5">PNG o JPG, mínimo 1200 px</span></div></div>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-4">
            <span className="text-base font-semibold text-ink">Publicación</span>
            <div className="flex items-center justify-between"><div className="flex flex-col"><span className="text-base font-medium text-ink">Visible en el catálogo</span><span className="text-xs text-faint">412 farmacias lo ven ahora</span></div><Toggle on={visible} onChange={(v) => { setVisible(v); setDirty(true) }} /></div>
            <div className="flex items-center justify-between"><div className="flex flex-col"><span className="text-base font-medium text-ink">Marcar como novedad</span><span className="text-xs text-faint">Aparece arriba durante 30 días</span></div><Toggle on={novelty} onChange={(v) => { setNovelty(v); setDirty(true) }} /></div>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col">
            <div className="flex items-center justify-between"><span className="text-base font-semibold text-ink">Últimos cambios</span><Link to={`/admin/catalogo/${p.id}`} className="text-sm font-medium text-accent">Ver todo</Link></div>
            <div className="mt-3 flex flex-col gap-3">{[['Argumentario reescrito', '3 sep · Kevin S.'], ['PVP 16,90 € → 17,50 €', '12 ago · Kevin S.'], ['Publicado por primera vez', '14 feb 2024 · Kevin S.']].map(([t, m]) => <div key={t} className="flex gap-3 pb-3 border-b border-line-soft last:border-0 last:pb-0"><span className="mt-1.5 h-2 w-2 rounded-full bg-line shrink-0" /><div className="flex flex-col"><span className="text-base text-ink">{t}</span><span className="text-xs text-faint">{m}</span></div></div>)}</div>
          </div>
        </aside>
      </div>
    </Screen>
  )
}
