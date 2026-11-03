import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Bookmark, Check, Maximize2, GraduationCap, Presentation } from 'lucide-react'
import { useBase, useStore } from '@/app/store'
import { euro, type Product } from '@/data/products'
import { courseById } from '@/data/courses'
import { Drawer } from '@/ui/Drawer'
import { Button } from '@/ui/Button'
import { Tag } from '@/ui/Badge'
import { ProductArt } from '@/ui/ProductArt'
import { VideoProducto } from '@/ui/VideoProducto'
import { cn } from '@/lib/cn'

const tabs = [
  { key: 'comp', label: 'Composición' },
  { key: 'uso', label: 'Modo de empleo' },
  { key: 'avisos', label: 'Advertencias' },
]

/**
 * Pop-up de producto (ventana centrada): lo primero que se abre al pulsar un producto en
 * cualquier lista. Desde aquí, «Ampliar» lleva a la ficha completa.
 */
export function ProductPeek({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const base = useBase()
  const navigate = useNavigate()
  const { miLista, toggleLista } = useStore()
  const [tab, setTab] = useState('comp')
  if (!product) return null
  const p = product
  const saved = miLista.includes(p.id)
  const course = courseById(p.courseId)
  const isComercial = base === '/comercial'
  const tag = isComercial && p.tag === 'MÁS VENDIDO' ? 'MÁS CONSULTADO' : p.tag
  const tagTone = tag === 'NOVEDAD' ? 'accent' : tag === 'MÁS VENDIDO' || tag === 'MÁS CONSULTADO' ? 'dark' : 'neutral'

  return (
    <Drawer
      open
      onClose={onClose}
      width={420}
      title={p.name}
      subtitle={[p.format, p.cn && `CN ${p.cn}`].filter(Boolean).join(' · ')}
      badge={tag && <Tag tone={tagTone}>{tag}</Tag>}
      bodyClass="p-0"
      footer={
        <>
          <Button size="lg" className="flex-1" icon={<Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />} onClick={() => toggleLista(p.id)}>
            {saved ? 'En Mi lista' : 'Guardar'}
          </Button>
          <Button variant="primary" size="lg" className="flex-[1.4]" icon={<Maximize2 size={13} />} onClick={() => { onClose(); navigate(`${base}/catalogo/${p.id}`) }}>
            Ampliar
          </Button>
        </>
      }
    >
      <ProductArt art={p.art} photo={p.photo} size={124} className="h-[212px] border-b border-line-soft" />

      {/* Las tres cifras en una fila; si no caben, lo que no cabe baja a una segunda fila en vez de partir el
          precio o las etiquetas. En el teléfono el precio va solo arriba y margen y disponibilidad debajo.
          Con la etiqueta larga del comercial («para la farmacia») el hueco es algo menor para que quepan en una fila. */}
      <div className={cn('px-5 py-4 border-b border-line-soft flex flex-wrap items-end gap-y-3', isComercial ? 'gap-x-4' : 'gap-x-6')}>
        <div className="basis-full sm:basis-auto flex flex-col">
          <span className="label whitespace-nowrap">PVP recomendado</span>
          <span className="mt-1 text-display font-semibold tracking-tight leading-none text-ink whitespace-nowrap">{euro(p.pvp)}</span>
        </div>
        <div className="flex flex-col pb-1">
          <span className="text-sm text-muted whitespace-nowrap">Margen {isComercial ? 'para la farmacia' : 'orientativo'}</span>
          <span className="text-base font-semibold text-ok mt-0.5">{p.margin} %</span>
        </div>
        <div className="ml-auto flex flex-col items-end pb-1">
          <span className="text-sm text-muted whitespace-nowrap">Disponibilidad</span>
          <span className="text-base font-medium text-ink mt-0.5 whitespace-nowrap">En almacén</span>
        </div>
      </div>

      <div className="px-5 flex gap-5 border-b border-line-soft overflow-x-auto no-scrollbar scroll-hint">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('h-9 shrink-0 whitespace-nowrap text-md font-medium border-b-2 -mb-px', tab === t.key ? 'text-accent font-semibold border-accent' : 'text-muted border-transparent hover:text-ink')}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 flex flex-col">
        {tab === 'comp' && (
          <div className="rounded-lg border border-line overflow-hidden">
            <div className="h-8 px-3 bg-chrome border-b border-line-soft flex items-center">
              <span className="label flex-1">Por {p.dose.match(/^\d+ \p{L}+/u)?.[0] ?? '1 toma'}</span>
              <span className="label w-[74px] shrink-0 text-right">Cantidad</span>
              <span className="label w-[54px] shrink-0 text-right">% VRN</span>
            </div>
            {/* El nombre entero, en dos líneas si hace falta: cortado no se sabe de qué ingrediente es cada cantidad. */}
            {p.composition.map((c, i) => (
              <div key={`${i}-${c.name}`} className={cn('min-h-9 py-1.5 px-3 flex items-center', i < p.composition.length - 1 && 'border-b border-line-soft')}>
                <span className="flex-1 min-w-0 pr-2 text-md text-ink">{c.name}</span>
                <span className="min-w-[74px] shrink-0 text-right text-md font-semibold text-ink whitespace-nowrap">{c.qty}</span>
                <span className="w-[54px] shrink-0 text-right text-md text-muted whitespace-nowrap">{c.vrn}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'uso' && (
          <div className="rounded-lg border border-line overflow-hidden">
            {[['Pauta', p.dose], ['Duración', '4 semanas y revisar'], ['Con o sin comida', p.dose.includes('ayunas') ? 'En ayunas' : 'Con comida'], ['Formato', p.packaging]].map(([k, v], i) => (
              <div key={k} className={cn('min-h-[42px] px-3 py-2 flex items-center gap-3', i < 3 && 'border-b border-line-soft')}>
                <span className="w-[124px] shrink-0 text-sm text-muted">{k}</span>
                <span className="text-md text-ink">{v}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'avisos' && (
          <div className="flex flex-col gap-2.5">
            <div className="rounded-lg bg-warn-wash border border-warn-line px-3 py-2.5 flex gap-2.5">
              <span className="text-warn font-bold text-base leading-none mt-px">!</span>
              <span className="text-sm leading-[16px] text-[#7A5A18]">{p.warning ?? 'Sin interacciones relevantes descritas. En embarazo y lactancia, consultar.'}</span>
            </div>
            <div className="rounded-lg bg-chrome border border-line px-3 py-2.5 text-sm leading-[16px] text-ink-soft">
              No superar la dosis diaria recomendada. Los complementos alimenticios no sustituyen una dieta variada.
            </div>
            <div className="rounded-lg border border-line overflow-hidden mt-1">
              {[['Alérgenos', p.allergens], ['Apto para', p.suitable], ['Registro sanitario', p.registry]].filter(([, v]) => v).map(([k, v], i, arr) => (
                <div key={k} className={cn('min-h-[38px] px-3 py-2 flex items-center gap-3', i < arr.length - 1 && 'border-b border-line-soft')}>
                  <span className="w-[124px] shrink-0 text-sm text-muted">{k}</span>
                  <span className="text-md text-ink">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <span className="label mt-5">Se recomienda cuando el cliente cuenta</span>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {p.symptoms.map((s, i) => (
            <span key={`${i}-${s}`} className="h-[25px] rounded-full bg-accent-wash text-accent-deep text-md font-medium px-[11px] inline-flex items-center">{s}</span>
          ))}
        </div>

        {(p.video || course || p.hasPLV) && (
          <div className="mt-5 flex flex-col gap-2">
            {p.video && <VideoProducto video={p.video} nombre={p.name} compacta />}
            {course && (
              <button onClick={() => { onClose(); navigate(`${base}/formacion/cursos/${course.id}`) }} className="h-[52px] rounded-lg bg-chrome border border-line px-3 flex items-center gap-2.5 text-left hover:bg-chrome-deep/60">
                <span className="h-7 w-7 rounded-full bg-accent-wash text-accent-deep inline-flex items-center justify-center shrink-0"><GraduationCap size={14} /></span>
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-md font-medium text-ink truncate">Hay curso de este producto</span><span className="text-xs text-muted">{course.lessons.length} lecciones · {course.minutes} min</span></span>
              </button>
            )}
            {p.hasPLV && (
              <button onClick={() => { onClose(); navigate(`${base}/plv/otono`) }} className="h-[52px] rounded-lg bg-chrome border border-line px-3 flex items-center gap-2.5 text-left hover:bg-chrome-deep/60">
                <span className="h-7 w-7 rounded-full bg-chrome-deep text-ink-soft inline-flex items-center justify-center shrink-0"><Presentation size={14} /></span>
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-md font-medium text-ink truncate">Material PLV disponible</span><span className="text-xs text-muted">{p.plv ?? 'Cartel de campaña y folleto'}</span></span>
              </button>
            )}
          </div>
        )}

        {saved && (
          <div className="mt-5 rounded-lg bg-ok-wash border border-[#CBD9CC] px-3 py-2.5 flex items-center gap-2 text-sm text-ok">
            <Check size={13} strokeWidth={2.5} /> Guardado en Mi lista
          </div>
        )}
      </div>
    </Drawer>
  )
}
