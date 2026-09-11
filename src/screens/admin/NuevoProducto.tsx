import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Upload, AlertTriangle } from 'lucide-react'
import { Screen, FooterBar } from '@/app/Shell'
import { useStore } from '@/app/store'
import { addCategory, categories } from '@/data/products'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Input, Picker } from '@/ui/Field'
import { Steps } from './NuevaCuenta'

export function NuevoProducto() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [f, setF] = useState({ name: 'Cúrcuma Fitosomada', cn: '', ean: '', slug: 'curcuma-fitosomada', pvp: '24,50', pvf: '', format: '30 cápsulas', pitch: '', category: 'Digestivo' })
  const [photo, setPhoto] = useState(false)
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v, ...(k === 'name' ? { slug: v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {}) })
  const missing = [!f.pvf && 'PVF', !f.pitch && 'argumentario'].filter(Boolean) as string[]

  return (
    <Screen
      toolbar={<Toolbar back="/admin/catalogo" crumbs={[{ label: 'Catálogo', to: '/admin/catalogo' }, { label: 'Nuevo producto' }]} right={<span className="text-sm text-muted flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Sin guardar</span>} />}
      footer={<FooterBar title={missing.length ? `Faltan ${missing.length} campo${missing.length > 1 ? 's' : ''} para poder publicar` : 'Listo para crear'} subtitle={missing.length ? `${missing.join(' y ')} · puedes guardarlo como borrador igualmente` : 'Nace como borrador; lo publicas desde su ficha'}><Link to="/admin/catalogo"><Button size="lg">Cancelar</Button></Link><Button size="lg" onClick={() => { notify('Borrador guardado'); navigate('/admin/catalogo') }}>Guardar borrador</Button><Button variant="primary" size="lg" disabled={!f.name} onClick={() => { notify(`«${f.name}» creado como borrador`); navigate('/admin/catalogo') }}>Crear producto</Button></FooterBar>}
    >
      <PageHeader title="Nuevo producto" subtitle="Nace como borrador. Solo lo ven las farmacias cuando lo publicas." />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
            <Field label="Nombre del producto" required labelClass="label"><Input value={f.name} onChange={set('name')} focus /></Field>
            <div className="grid grid-cols-3 gap-4"><Field label="Código nacional" labelClass="label"><Input value={f.cn} onChange={set('cn')} placeholder="Aún sin asignar" /></Field><Field label="EAN" labelClass="label"><Input value={f.ean} onChange={set('ean')} placeholder="8436017 …" /></Field><Field label="Categoría" required labelClass="label"><Picker value={f.category} options={categories} onChange={set("category")} onCreate={(v) => { addCategory(v); notify(`Categoría «${v}» creada`) }} createLabel="Crear categoría" /></Field></div>
            <Field label="Página pública en la web" labelClass="label" right={<span className="text-xs text-faint">Se genera del nombre</span>}><div className="flex"><span className="h-[34px] px-3 rounded-l-md bg-chrome border border-r-0 border-line text-base text-faint inline-flex items-center">suprafeel.com/producto/</span><Input className="rounded-l-none" value={f.slug} onChange={set('slug')} /></div></Field>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4"><Field label="PVP" required labelClass="label"><Input value={f.pvp} onChange={set('pvp')} right={<span className="text-sm text-muted">€</span>} /></Field><Field label="PVF" required labelClass="label"><Input value={f.pvf} onChange={set('pvf')} placeholder="0,00" right={<span className="text-sm text-muted">€</span>} /></Field><Field label="Formato" required labelClass="label"><Input value={f.format} onChange={set('format')} /></Field></div>
            {!f.pvf && <div className="rounded-lg bg-warn-wash border border-warn-line px-3 py-2.5 flex items-center gap-2 text-sm text-[#7A5A18]"><AlertTriangle size={13} className="shrink-0" />Sin PVF no se puede calcular el margen ni publicar el producto.</div>}
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between"><span className="label">Argumentario de mostrador <span className="text-accent">*</span></span><span className="text-xs text-faint">{f.pitch.length} / 400</span></div>
            <div className="rounded-lg border border-dashed border-line bg-canvas p-3.5 min-h-[130px] flex flex-col">
              <textarea rows={3} className="w-full bg-transparent text-base leading-[19px] text-ink resize-none" placeholder="Cuenta a la farmacia cuándo recomendarlo y qué no se puede prometer." value={f.pitch} onChange={(e) => set('pitch')(e.target.value)} />
            </div>
          </div>
        </div>
        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <button onClick={() => { setPhoto(true); notify('Foto subida') }} className="h-[186px] rounded-xl border border-dashed border-line bg-surface flex flex-col items-center justify-center text-center hover:bg-chrome/50">
            <span className="h-11 w-11 rounded-full bg-accent-wash text-accent inline-flex items-center justify-center"><Upload size={17} /></span>
            <span className="mt-4 text-base font-semibold text-ink">{photo ? 'Foto subida · cambiar' : 'Arrastra la foto del producto'}</span>
            <span className="mt-1 text-sm text-muted">PNG o JPG · mínimo 1200 px · fondo blanco</span>
          </button>
          <Steps title="Cómo funciona" steps={[{ t: 'Creas el borrador', d: 'Nombre, categoría y precio. El CN puedes añadirlo después.' }, { t: 'Completas la ficha', d: 'Composición, imágenes y argumentario dentro del producto.' }, { t: 'Lo publicas', d: 'Hasta que no lo publiques, las 412 farmacias no lo ven.' }]} />
        </aside>
      </div>
    </Screen>
  )
}
