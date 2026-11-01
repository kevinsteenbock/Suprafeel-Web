import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { Info } from 'lucide-react'
import { Screen, FooterBar } from '@/app/Shell'
import { PENDIENTE_ADMIN, useStore } from '@/app/store'
import { alcance, campaignById, materials, TODAS } from '@/data/plv'
import { useCifras } from '@/app/datos'
import { otoño } from './AdminProducto'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Input, Select, Segmented, Textarea } from '@/ui/Field'
import { Toggle } from '@/ui/Toggle'
import { Badge } from '@/ui/Badge'
import { MaterialArt } from '@/ui/MaterialArt'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
/** Fecha de reposición de muestra: dentro de 12 días (calculada, nunca escrita a mano) */
function reposicion() {
  const d = new Date(Date.now() + 12 * 864e5)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

export function NuevoMaterial() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const { notify } = useStore()
  const cifras = useCifras()
  const c = campaignById(id)
  const editing = materials.find((m) => m.id === sp.get('editar'))
  const [f, setF] = useState({ name: editing?.name ?? 'Expositor de mostrador', tipo: editing?.kind === 'digital' ? 'Digital' : 'Impreso', medidas: '28 × 40 cm', desc: editing?.description ?? 'Expositor de tres baldas para mostrador. Va montado en la zona de dermo, no en el lineal de vitaminas. Se sirve plegado y se monta sin herramientas.', stock: editing?.supply ?? '1.200 uds', repo: reposicion() })
  const [publish, setPublish] = useState(true)
  const [photo, setPhoto] = useState(!!editing)
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  if (!c) return <Navigate to="/admin/plv" replace />
  const name = c.id === 'otono' ? otoño() : c.name
  // Una campaña que aún no ha salido también irá a todas las farmacias.
  const verán = alcance(c.pharmacies === '—' ? TODAS : c.pharmacies, cifras.farmacias)
  const ready = photo && !!f.stock

  return (
    <Screen
      toolbar={<Toolbar back={`/admin/plv/${c.id}`} crumbs={[{ label: 'Materiales PLV', to: '/admin/plv' }, { label: name, to: `/admin/plv/${c.id}` }, { label: editing ? 'Editar material' : 'Nuevo material' }]} right={<span className="text-sm text-muted flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Sin guardar</span>} />}
      footer={
        <FooterBar title={ready ? 'Listo para publicar' : 'Para publicarlo hacen falta foto y existencias'} subtitle={ready ? `Lo verán ${verán} farmacias en cuanto guardes` : 'Sin foto la farmacia no reconoce el material que está pidiendo'}>
          <Link className="max-sm:hidden" to={`/admin/plv/${c.id}`}><Button size="lg">Cancelar</Button></Link>
          <Button size="lg" onClick={() => { notify(PENDIENTE_ADMIN, 'aviso'); navigate(`/admin/plv/${c.id}`) }}>Guardar borrador</Button>
          <Button variant="primary" size="lg" onClick={() => { notify(PENDIENTE_ADMIN, 'aviso'); navigate(`/admin/plv/${c.id}`) }}>{editing ? 'Guardar cambios' : 'Añadir a la campaña'}</Button>
        </FooterBar>
      }
    >
      <PageHeader title={editing ? 'Editar material' : 'Nuevo material'} subtitle={editing ? name : `Se añade a ${name}`} right={<span className="text-base text-muted">Lo verán {verán} farmacias</span>} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 rounded-xl bg-surface border border-line shadow-card p-4 sm:p-6 flex flex-col gap-5">
          <Field label="Nombre del material" required labelClass="label"><Input value={f.name} onChange={set('name')} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Tipo" labelClass="label"><Segmented options={['Impreso', 'Digital']} value={f.tipo} onChange={set('tipo')} /></Field>
            <Field label={f.tipo === 'Digital' ? 'Formato del archivo' : 'Material / soporte'} labelClass="label"><Select value={f.tipo === 'Digital' ? 'ZIP · imágenes' : 'Cartón'} chevron="down" /></Field>
            <Field label="Medidas" labelClass="label"><Input value={f.medidas} onChange={set('medidas')} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Unidad de entrega" labelClass="label"><Select value="Unidad" chevron="down" /></Field>
            <Field label="Límite por farmacia" required labelClass="label"><Select value="Máx. 1" chevron="down" /></Field>
          </div>
          <Field label="Descripción que ve la farmacia" labelClass="label"><Textarea rows={7} value={f.desc} onChange={set('desc')} /></Field>
          <div className="pt-4 border-t border-line-soft flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0"><span className="text-base font-medium text-ink">Publicar en cuanto se añada</span><span className="text-sm text-muted">Si lo dejas apagado queda como borrador dentro de la campaña</span></div>
            <Toggle on={publish} onChange={setPublish} />
          </div>
        </div>
        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col">
            <span className="text-base font-semibold text-ink">Foto del material <span className="text-accent">*</span></span>
            {photo ? (
              <MaterialArt art={editing?.art ?? 'shelf'} size={78} className="mt-4 h-[130px] rounded-lg border border-line" />
            ) : (
              <button onClick={() => { setPhoto(true); notify(PENDIENTE_ADMIN, 'aviso') }} className="mt-4 h-[130px] rounded-lg border border-dashed border-line bg-chrome flex flex-col items-center justify-center text-center hover:bg-chrome-deep/50"><span className="text-base font-medium text-ink"><span className="hidden sm:inline">Arrastra la foto aquí</span><span className="sm:hidden">Toca para elegir la foto</span></span><span className="hidden sm:inline text-xs text-faint mt-1">o haz clic para elegirla</span></button>
            )}
            <div className="mt-3 flex gap-3 text-sm font-medium"><button className="text-ink" onClick={() => notify('Elige otra foto')}>Cambiar foto</button><button className="text-accent" onClick={() => setPhoto(false)}>Quitar</button></div>
            <span className="mt-2.5 text-xs text-faint">JPG o PNG · mínimo 1200 px · se recorta a 4:3</span>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
            <span className="text-base font-semibold text-ink flex items-center gap-2">Existencias <Badge tone="neutral">{f.tipo}</Badge></span>
            {f.tipo === 'Impreso' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Field label="En almacén" required labelClass="label"><Input value={f.stock} onChange={set('stock')} /></Field><Field label="Reposición" labelClass="label"><Input value={f.repo} onChange={set('repo')} /></Field></div>
                <Field label="Imprenta" labelClass="label"><Select value="Gráficas Turia" chevron="down" /></Field>
                <div className="rounded-lg bg-chrome border border-line px-3 py-2.5 flex gap-2 text-sm text-muted leading-4"><Info size={13} className="shrink-0 mt-px" />Un impreso no lleva archivo: se sirve físicamente. Si lo pasas a Digital, aquí se pedirá el archivo que descarga la farmacia.</div>
              </>
            ) : (
              <button onClick={() => notify(PENDIENTE_ADMIN, 'aviso')} className="h-[90px] rounded-lg border border-dashed border-line bg-chrome flex flex-col items-center justify-center text-center hover:bg-chrome-deep/50"><span className="text-base font-medium text-ink">Sube el archivo que descargará la farmacia</span><span className="text-xs text-faint mt-1">ZIP, PDF o MP4 · hasta 500 MB</span></button>
            )}
          </div>
        </aside>
      </div>
    </Screen>
  )
}
