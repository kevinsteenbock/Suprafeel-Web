import { useState, type ReactNode } from 'react'
import { Navigate, useParams } from 'react-router'
import { FileText } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { useContenido } from '@/app/datos'
import { euro, productById } from '@/data/products'
import { documentosDeFicha, type Documento } from '@/data/contenido'
import { KeyValue, Notice, Toolbar, Vacio } from '@/ui/Page'
import { ProductArt } from '@/ui/ProductArt'
import { VideoProducto } from '@/ui/VideoProducto'
import { VisorDocumento } from '@/ui/VisorDocumento'
import { cn } from '@/lib/cn'

function Bloque({ titulo, children, className }: { titulo: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-2.5', className)}>
      <h2 className="text-lg font-semibold text-ink">{titulo}</h2>
      {children}
    </section>
  )
}

const Lista = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-1.5 text-base text-ink-soft list-disc pl-5">{items.map((t) => <li key={t}>{t}</li>)}</ul>
)

const Fichas = ({ items, tono = 'neutra' }: { items: string[]; tono?: 'neutra' | 'marca' }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((t) => (
      <span key={t} className={cn('min-h-[27px] rounded-full px-3 py-1 text-sm font-medium inline-flex items-center', tono === 'marca' ? 'bg-accent-wash text-accent-deep' : /^Contiene/.test(t) ? 'bg-warn-wash text-[#7A5A18]' : 'bg-chrome text-ink-soft')}>{t}</span>
    ))}
  </div>
)

function BotonDocumento({ doc }: { doc: Documento }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <>
      <button onClick={() => setAbierto(true)} className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 flex items-center gap-3 text-left hover:border-faint">
        <span className="h-9 w-9 shrink-0 rounded-lg bg-accent-wash text-accent inline-flex items-center justify-center"><FileText size={16} /></span>
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="text-base font-medium text-ink">{doc.titulo}</span>
          <span className="text-xs text-muted">{doc.paginas} páginas · ver o descargar</span>
        </span>
      </button>
      {abierto && <VisorDocumento slug={doc.slug} titulo={doc.titulo} onClose={() => setAbierto(false)} />}
    </>
  )
}

/** Ficha de un suplemento: lo que dice el Catálogo 2026, sus datos de tarifa, su presentación y su vídeo. */
export function FichaFormacion() {
  const { id } = useParams()
  const base = useBase()
  const { contenido, falla } = useContenido()
  const p = productById(id)
  if (!p) return <Navigate to={`${base}/formacion`} replace />
  const f = contenido.fichas[p.id]
  const docs = documentosDeFicha(contenido, p.id)
  const toolbar = <Toolbar back={`${base}/formacion`} crumbs={[{ label: 'Formación', to: `${base}/formacion` }, { label: p.name }]} />

  if (!f) {
    return (
      <Screen toolbar={toolbar}>
        <Vacio icon={<FileText size={18} />} title="No hemos podido cargar esta ficha">
          {falla ? 'Revisa tu conexión y vuelve a entrar en un momento.' : 'Todavía no está publicada. Pregunta a tu comercial o escríbenos a info@suprafeel.es.'}
        </Vacio>
      </Screen>
    )
  }

  const cabecera = (
    <div className="flex flex-col">
      <span className="label text-accent">{p.categoryLabel} · {f.funcion}</span>
      <h1 className="mt-2 text-display font-semibold tracking-tight text-ink">{p.name}</h1>
      <p className="mt-1.5 text-base text-muted">{f.subtitulo}</p>
    </div>
  )

  return (
    <Screen toolbar={toolbar}>
      {/* En el móvil la ficha abre con su nombre; en escritorio va al lado de la foto. */}
      <div className="lg:hidden">{cabecera}</div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[320px] lg:shrink-0 flex flex-col gap-3">
          <ProductArt art={p.art} photo={p.photo} size={150} className="h-[220px] rounded-xl border border-line" />
          {p.video ? <VideoProducto video={p.video} nombre={p.name} /> : <Notice tone="neutral">El vídeo de este suplemento todavía no está disponible.</Notice>}
          {docs.map((d) => <BotonDocumento key={d.slug} doc={d} />)}
          <KeyValue labelWidth={88} rows={[
            { k: 'C.N.', v: p.cn || 'Sin C.N. en la tarifa' },
            { k: 'EAN', v: p.ean || 'Pendiente de aclarar en la tarifa' },
            { k: 'Formato', v: f.presentacion },
            { k: 'PVF', v: euro(p.pvf) },
            { k: 'PVPR', v: euro(p.pvp) },
          ]} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="hidden lg:block">{cabecera}</div>
          {f.aviso && <Notice tone="warn" title="Aviso regulatorio">{f.aviso}</Notice>}

          <Bloque titulo="Para qué sirve"><p className="text-base text-ink-soft">{f.que_es}</p></Bloque>
          <Bloque titulo="Para quién es"><Fichas items={f.para_quien} tono="marca" /></Bloque>
          <KeyValue labelWidth={104} rows={[{ k: 'Presentación', v: f.presentacion }, { k: 'Duración', v: f.duracion }, { k: 'Posología', v: f.posologia }]} />

          <Bloque titulo="Funciones principales"><Fichas items={f.funciones} tono="marca" /><Fichas items={f.sellos} /></Bloque>

          <Bloque titulo="Cómo actúa">
            <div className="grid gap-2.5 grid-cols-1 xl:grid-cols-3">
              {f.como_actua.map((c, i) => (
                <div key={`${i}-${c.t}`} className="rounded-xl bg-surface border border-line p-3.5 flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-ink">{c.t}</h3>
                  <p className="text-sm text-muted leading-[19px]">{c.d}</p>
                </div>
              ))}
            </div>
          </Bloque>

          <Bloque titulo="Información nutricional">
            <div className="rounded-xl bg-surface border border-line overflow-hidden">
              {f.tomas.map((toma, t) => (
                <div key={toma} className={cn(t > 0 && 'border-t-4 border-line-soft')}>
                  <div className="h-8 px-3.5 bg-chrome border-b border-line flex items-center"><span className="label flex-1 min-w-0">Por {toma}</span><span className="label w-[100px] shrink-0 text-right">Cantidad</span><span className="label w-[64px] shrink-0 text-right">% VRN</span></div>
                  {f.filas.map((fila, i) => (
                    <div key={`${i}-${fila[0]}`} className={cn('min-h-[38px] py-2 px-3.5 flex items-center', i < f.filas.length - 1 && 'border-b border-line-soft')}>
                      <span className="flex-1 min-w-0 pr-2 text-base text-ink">{fila[0]}</span>
                      <span className="w-[100px] shrink-0 text-right text-base font-semibold text-ink">{fila[1 + t * 2]}</span>
                      <span className="w-[64px] shrink-0 text-right text-base text-muted">{fila[2 + t * 2]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs text-faint">VRN: Valores de Referencia de Nutrientes (UE 1169/2011).</p>
          </Bloque>

          {f.extra && <Bloque titulo={f.extra.t}><p className="text-base text-ink-soft">{f.extra.d}</p></Bloque>}

          <Bloque titulo="Consejo en farmacia">
            <div className="grid gap-2.5 grid-cols-1 xl:grid-cols-2">
              <div className="rounded-xl bg-surface border border-line p-3.5 flex flex-col gap-2"><h3 className="text-base font-semibold text-ink">Perfil de cliente</h3><Lista items={f.perfil} /></div>
              <div className="rounded-xl bg-surface border border-line p-3.5 flex flex-col gap-2"><h3 className="text-base font-semibold text-ink">Argumentos de venta</h3><Lista items={f.argumentos} /></div>
            </div>
          </Bloque>

          <Bloque titulo="Advertencias">
            {f.advertencias.map((a) => <Notice key={a} tone="warn">{a}</Notice>)}
            {contenido.recomendador && (
              <div className="rounded-xl bg-chrome border border-line px-4 py-3">
                <h3 className="text-sm font-semibold text-ink-soft">Advertencias generales</h3>
                <ul className="mt-1.5 flex flex-col gap-1 text-sm text-muted list-disc pl-4">{contenido.recomendador.generales.slice(0, 5).map((a) => <li key={a}>{a}</li>)}</ul>
              </div>
            )}
          </Bloque>
        </div>
      </div>
    </Screen>
  )
}
