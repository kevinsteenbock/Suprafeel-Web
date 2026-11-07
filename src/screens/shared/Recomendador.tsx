import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, ChevronRight, Compass, RotateCcw } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { productById } from '@/data/products'
import { useContenido } from '@/app/datos'
import type { DatosRecomendador, Pregunta, Rama, Resultado, Salida } from '@/data/contenido'
import { Toolbar, PageHeader, Notice, Vacio } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { ProductArt } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'
import { MiListaButton } from './Catalogo'

type Base = Record<string, 'si' | 'no'>
/** Un punto del camino: en una pregunta o ya en el resultado, y por qué se llegó ahí si vino de otra rama. */
interface Punto { rama: Rama; salida: Pregunta | Resultado; nota?: string }

const PASOS = ['La Base', 'Motivo de consulta', 'Resultado']

function Pasos({ actual }: { actual: number }) {
  return (
    <ol className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
      {PASOS.map((p, i) => (
        <li key={p} aria-current={i === actual ? 'step' : undefined} className={cn('flex items-center gap-2 text-sm', i === actual ? 'text-ink font-semibold' : 'text-muted')}>
          <span className={cn('h-5 w-5 rounded-full inline-flex items-center justify-center text-xs font-semibold', i === actual ? 'bg-accent text-on-accent' : 'bg-chrome-deep text-muted')}>{i + 1}</span>
          {p}
        </li>
      ))}
    </ol>
  )
}

function Opcion({ activa, onClick, titulo, children }: { activa: boolean; onClick: () => void; titulo: string; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={activa} onClick={onClick} className={cn('flex-1 min-w-0 rounded-lg border px-3 py-2.5 text-left transition-colors', activa ? 'border-accent bg-accent-wash' : 'border-line bg-surface hover:bg-chrome')}>
      <span className={cn('block text-sm font-semibold', activa ? 'text-accent-deep' : 'text-ink')}>{titulo}</span>
      <span className="block mt-0.5 text-sm text-muted">{children}</span>
    </button>
  )
}

function PasoBase({ datos, base, setBase, seguir }: { datos: DatosRecomendador; base: Base; setBase: (b: Base) => void; seguir: () => void }) {
  const elegir = (id: string, v: 'si' | 'no') => {
    const { [id]: previo, ...resto } = base
    setBase(previo === v ? resto : { ...base, [id]: v })
  }
  return (
    <section className="mt-5 flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-ink">¿A quién va cada uno de los 5 básicos?</h2>
        <p className="mt-1 text-base text-muted">La mayoría de clientes se beneficia de alguno o varios, pero no todos necesitan los cinco. Marca lo que sepas: también puedes seguir sin marcar.</p>
      </div>
      {datos.basicos.map((b) => (
        <div key={b.id} className="rounded-xl bg-surface border border-line p-3.5 flex flex-col gap-2.5">
          <span className="text-base font-semibold text-ink">{b.nombre}</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <Opcion activa={base[b.id] === 'si'} onClick={() => elegir(b.id, 'si')} titulo="Sí">{b.si}</Opcion>
            <Opcion activa={base[b.id] === 'no'} onClick={() => elegir(b.id, 'no')} titulo="No hace tanta falta">{b.no}</Opcion>
          </div>
        </div>
      ))}
      <div className="flex justify-end"><Button variant="primary" size="lg" iconRight={<ChevronRight size={14} />} onClick={seguir}>Continuar</Button></div>
    </section>
  )
}

function PasoMotivo({ ramas, elegir }: { ramas: Rama[]; elegir: (r: Rama) => void }) {
  return (
    <section className="mt-5 flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-ink">¿Cuál es la necesidad principal?</h2>
        <p className="mt-1 text-base text-muted">Elige una y responde a sus preguntas.</p>
      </div>
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {ramas.map((r) => (
          <button key={r.id} type="button" onClick={() => elegir(r)} className="rounded-xl bg-surface border border-line px-4 py-3 text-left flex items-center gap-3 hover:border-faint">
            <span className="flex-1 min-w-0 flex flex-col">
              <span className="text-base font-semibold text-ink">{r.titulo}</span>
              <span className="text-sm text-muted">{r.gama}</span>
            </span>
            <ChevronRight size={15} className="text-faint shrink-0" />
          </button>
        ))}
      </div>
    </section>
  )
}

function PasoPregunta({ punto, responder }: { punto: Punto & { salida: Pregunta }; responder: (s: Salida) => void }) {
  const { salida: p, rama, nota } = punto
  return (
    <section className="mt-5 rounded-xl bg-surface border border-line p-5 flex flex-col gap-4 max-w-[640px]">
      <span className="label text-accent">{rama.titulo}</span>
      {nota && <Notice tone="neutral">{nota}</Notice>}
      <h2 className="text-title font-semibold tracking-tight text-ink">{p.texto}</h2>
      {p.aviso && <Notice tone="warn">{p.aviso}</Notice>}
      <div className="flex gap-2.5">
        <Button variant="primary" size="lg" className="flex-1 h-11" onClick={() => responder(p.si)}>Sí</Button>
        <Button variant="secondary" size="lg" className="flex-1 h-11" onClick={() => responder(p.no)}>No</Button>
      </div>
    </section>
  )
}

function TarjetaProducto({ datos, id, destacado }: { datos: DatosRecomendador; id: string; destacado?: boolean }) {
  const base = useBase()
  const p = productById(id)
  const t = datos.tomas[id]
  if (!p || !t) return null
  return (
    <article className={cn('rounded-xl bg-surface border p-4 flex gap-4', destacado ? 'border-accent-line shadow-card' : 'border-line')}>
      <ProductArt art={p.art} photo={p.photo} size={64} className={cn('rounded-lg border border-line-soft shrink-0', destacado ? 'h-24 w-24' : 'h-16 w-16')} />
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <h3 className={cn('font-semibold text-ink', destacado ? 'text-title tracking-tight' : 'text-base')}>{p.name}</h3>
        <p className="text-base text-ink-soft"><span className="font-medium">Toma: </span>{t.toma}</p>
        {t.advertencia && <p className="text-sm text-[#7A5A18]"><span className="font-semibold">Advertencia: </span>{t.advertencia}</p>}
        <Link to={`${base}/formacion/${id}`} className="self-start text-sm font-medium text-accent hover:text-accent-deep">Ver la ficha</Link>
      </div>
    </article>
  )
}

function PasoResultado({ datos, punto, elegidos, reiniciar }: { datos: DatosRecomendador; punto: Punto & { salida: Resultado }; elegidos: Base; reiniciar: () => void }) {
  const { salida: r, rama, nota } = punto
  const baseElegida = datos.basicos.filter((b) => elegidos[b.id] === 'si' && b.id !== r.producto)
  const descartado = r.tipo === 'base' && elegidos[r.producto] === 'no'
  const zincConBase = r.producto === 'zinc' ? baseElegida.filter((b) => datos.basicos_con_zinc.includes(b.id)) : []
  const combinable = r.tipo === 'producto' ? r.combinable : undefined

  return (
    <section className="mt-5 flex flex-col gap-4 max-w-[760px]">
      <div className="flex flex-col gap-1">
        <span className="label text-accent">{rama.titulo}</span>
        <h2 className="text-lg font-semibold text-ink">{r.tipo === 'base' ? 'Ya cubierto por la Base' : 'Producto recomendado'}</h2>
        {r.tipo === 'base' && <p className="text-base text-muted">{r.texto}</p>}
      </div>
      {nota && <Notice tone="neutral">{nota}</Notice>}
      {descartado && <Notice tone="neutral">En el paso 1 lo marcaste como «no hace tanta falta»: revisa si encaja con esta persona.</Notice>}
      <TarjetaProducto datos={datos} id={r.producto} destacado />

      {r.tipo === 'producto' && r.avisos?.map((a) => <Notice key={a} tone="warn">{a}</Notice>)}
      {zincConBase.length > 0 && <Notice tone="warn">{zincConBase.map((b) => b.nombre).join(' y ')} también {zincConBase.length > 1 ? 'llevan' : 'lleva'} zinc: el Zinc no se recomienda junto a otros suplementos que lo contengan.</Notice>}

      {combinable && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-ink">Se puede combinar</h3>
          <p className="text-base text-muted">{combinable.cuando}: {combinable.productos.map((id) => productById(id)?.name).join(' + ')}.</p>
          {combinable.productos.filter((id) => id !== r.producto).map((id) => <TarjetaProducto key={id} datos={datos} id={id} />)}
        </div>
      )}

      {baseElegida.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-ink">Su Base</h3>
          {baseElegida.map((b) => <TarjetaProducto key={b.id} datos={datos} id={b.id} />)}
        </div>
      )}

      <div className="rounded-xl bg-chrome border border-line px-4 py-3.5">
        <h3 className="text-sm font-semibold text-ink-soft">Advertencias generales</h3>
        <ul className="mt-1.5 flex flex-col gap-1 text-sm text-muted list-disc pl-4">
          {datos.generales.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </div>
      <div><Button variant="secondary" size="lg" icon={<RotateCcw size={13} />} onClick={reiniciar}>Empezar otra recomendación</Button></div>
    </section>
  )
}

/**
 * Recomendador: la farmacéutica marca la Base, elige el motivo de consulta y responde sí o no hasta
 * llegar a un producto, siguiendo el diagrama de recomendación de Suprafeel. No guarda nada.
 */
export function Recomendador() {
  const { contenido, falla } = useContenido()
  const datos = contenido.recomendador
  const [base, setBase] = useState<Base>({})
  const [paso, setPaso] = useState<'base' | 'motivo' | 'rama'>('base')
  const [camino, setCamino] = useState<Punto[]>([])
  const punto = camino[camino.length - 1]

  const empezar = (r: Rama) => { setCamino([{ rama: r, salida: r.inicio }]); setPaso('rama') }
  const responder = (s: Salida) => {
    if (s.tipo === 'salto') {
      const rama = datos?.ramas.find((r) => r.id === s.rama)
      if (!rama) return
      setCamino([...camino, { rama, salida: rama.inicio, nota: s.nota }])
    } else {
      setCamino([...camino, { rama: punto.rama, salida: s }])
    }
  }
  const atras = () => {
    if (paso === 'motivo') setPaso('base')
    else if (camino.length > 1) setCamino(camino.slice(0, -1))
    else { setCamino([]); setPaso('motivo') }
  }
  const reiniciar = () => { setBase({}); setCamino([]); setPaso('base') }
  const enResultado = paso === 'rama' && punto?.salida.tipo !== 'pregunta'

  if (!datos) {
    return (
      <Screen toolbar={<Toolbar title="Recomendador" />}>
        <PageHeader title="Recomendador" />
        <Vacio icon={<Compass size={18} />} title={falla ? 'No hemos podido cargar el recomendador' : 'El recomendador aún no está disponible'}>
          {falla ? 'Revisa tu conexión y vuelve a entrar en un momento.' : 'Pregunta a tu comercial o escríbenos a info@suprafeel.es.'}
        </Vacio>
      </Screen>
    )
  }

  return (
    <Screen toolbar={<Toolbar title="Recomendador" right={<MiListaButton />} />}>
      <PageHeader title="Recomendador" subtitle="Responde unas preguntas cortas sobre tu cliente y te decimos qué suplemento encaja." />
      <Pasos actual={paso === 'base' ? 0 : paso === 'motivo' ? 1 : enResultado ? 2 : 1} />
      {paso !== 'base' && (
        <button type="button" onClick={atras} className="mt-4 h-9 self-start inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"><ArrowLeft size={14} />Atrás</button>
      )}
      {paso === 'base' && <PasoBase datos={datos} base={base} setBase={setBase} seguir={() => setPaso('motivo')} />}
      {paso === 'motivo' && <PasoMotivo ramas={datos.ramas} elegir={empezar} />}
      {paso === 'rama' && punto?.salida.tipo === 'pregunta' && <PasoPregunta key={camino.length} punto={punto as Punto & { salida: Pregunta }} responder={responder} />}
      {paso === 'rama' && enResultado && <PasoResultado datos={datos} punto={punto as Punto & { salida: Resultado }} elegidos={base} reiniciar={reiniciar} />}
    </Screen>
  )
}
