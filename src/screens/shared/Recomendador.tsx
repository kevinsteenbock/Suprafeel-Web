import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Check, ChevronRight, Compass, Download, RotateCcw } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { productById } from '@/data/products'
import { useContenido } from '@/app/datos'
import { documentoDe, SLUG_DIAGRAMA, type DatosRecomendador, type GrupoSeguridad, type Motivo, type Resultado, type Salto } from '@/data/contenido'
import { Toolbar, PageHeader, Notice, Vacio } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { ProductArt } from '@/ui/ProductArt'
import { VisorDocumento } from '@/ui/VisorDocumento'
import { cn } from '@/lib/cn'
import { MiListaButton } from './Catalogo'

type Base = Record<string, 'si' | 'no'>
/** Lo marcado en el paso 1, por pantalla. */
type Marcas = Record<string, string[]>
type Pantalla =
  | { t: 'seguridad'; i: number }
  | { t: 'base' }
  | { t: 'motivo' }
  | { t: 'pregunta'; motivo: Motivo; nota?: string }
  | { t: 'resultado'; motivo: Motivo; resultado: Resultado; nota?: string }

/** Lo que dicen las reglas de un producto para esta persona: motivos para no recomendarlo y avisos. */
interface Evaluacion { no: string[]; consultar: string[] }

function evaluar(datos: DatosRecomendador, marcas: Marcas, producto: string): Evaluacion {
  const condiciones = new Set(Object.values(marcas).flat())
  const ev: Evaluacion = { no: [], consultar: [] }
  for (const r of datos.reglas) {
    if (!r.productos.includes(producto) || !r.cuando.some((c) => condiciones.has(c))) continue
    const lista = r.nivel === 'no' ? ev.no : ev.consultar
    if (!lista.includes(r.texto)) lista.push(r.texto)
  }
  return ev
}

const PASOS = ['Seguridad', 'La Base', 'Motivo de consulta', 'Resultado']

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

function Opcion({ activa, onClick, titulo, children, disabled }: { activa: boolean; onClick: () => void; titulo: string; children?: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={activa} disabled={disabled} onClick={onClick} className={cn('flex-1 min-w-0 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed', activa ? 'border-accent bg-accent-wash' : 'border-line bg-surface hover:bg-chrome')}>
      <span className={cn('block text-sm font-semibold', activa ? 'text-accent-deep' : 'text-ink')}>{titulo}</span>
      {children && <span className="block mt-0.5 text-sm text-muted">{children}</span>}
    </button>
  )
}

/** Paso 1: una pantalla por grupo. «Para quién es» pide una respuesta; el resto se puede dejar en «Ninguna». */
function PasoSeguridad({ grupo, i, total, marcadas, marcar, seguir }: { grupo: GrupoSeguridad; i: number; total: number; marcadas: string[]; marcar: (ids: string[]) => void; seguir: () => void }) {
  const alternar = (id: string) => {
    if (grupo.unica) return marcar(marcadas.includes(id) ? [] : [id])
    marcar(marcadas.includes(id) ? marcadas.filter((x) => x !== id) : [...marcadas, id])
  }
  const falta = grupo.unica && marcadas.length === 0
  return (
    <section className="mt-5 rounded-xl bg-surface border border-line p-5 flex flex-col gap-4 max-w-[640px]">
      <span className="label text-accent">Seguridad · {i + 1} de {total}</span>
      <div>
        <h2 className="text-title font-semibold tracking-tight text-ink">{grupo.texto}</h2>
        {grupo.ayuda && <p className="mt-1 text-base text-muted">{grupo.ayuda}</p>}
      </div>
      <div className="flex flex-col gap-2" role={grupo.unica ? 'radiogroup' : 'group'} aria-label={grupo.texto}>
        {grupo.opciones.map((o) => {
          const activa = marcadas.includes(o.id)
          return (
            <button key={o.id} type="button" role={grupo.unica ? 'radio' : 'checkbox'} aria-checked={activa} onClick={() => alternar(o.id)}
              className={cn('min-h-[48px] rounded-lg border px-3.5 py-2.5 text-left flex items-center gap-3 transition-colors', activa ? 'border-accent bg-accent-wash' : 'border-line bg-surface hover:bg-chrome')}>
              <span className={cn('h-5 w-5 shrink-0 inline-flex items-center justify-center border', grupo.unica ? 'rounded-full' : 'rounded-md', activa ? 'bg-accent border-accent text-on-accent' : 'border-line bg-surface')}>
                {activa && <Check size={13} strokeWidth={3} />}
              </span>
              <span className={cn('text-base', activa ? 'text-accent-deep font-medium' : 'text-ink')}>{o.texto}</span>
            </button>
          )
        })}
      </div>
      <div className="flex justify-end">
        <Button variant="primary" size="lg" disabled={falta} iconRight={<ChevronRight size={14} />} onClick={seguir}>
          {grupo.unica || marcadas.length > 0 ? 'Continuar' : 'Ninguna, continuar'}
        </Button>
      </div>
    </section>
  )
}

function PasoBase({ datos, marcas, base, setBase, seguir }: { datos: DatosRecomendador; marcas: Marcas; base: Base; setBase: (b: Base) => void; seguir: () => void }) {
  const elegir = (id: string, v: 'si' | 'no') => {
    const { [id]: previo, ...resto } = base
    setBase(previo === v ? resto : { ...base, [id]: v })
  }
  return (
    <section className="mt-5 flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-ink">¿Qué básicos encajan con esta persona?</h2>
        <p className="mt-1 text-base text-muted">La mayoría de clientes se beneficia de alguno, pero no todos necesitan los cinco. Marca lo que sepas: también puedes seguir sin marcar.</p>
      </div>
      {datos.basicos.map((b) => {
        const ev = evaluar(datos, marcas, b.id)
        const vetado = ev.no.length > 0
        return (
          <div key={b.id} className="rounded-xl bg-surface border border-line p-3.5 flex flex-col gap-2.5">
            <span className="text-base font-semibold text-ink">{b.nombre}</span>
            {vetado && <Notice tone="danger">No se recomienda: {ev.no.join(' ')}</Notice>}
            {!vetado && ev.consultar.length > 0 && <Notice tone="warn">{ev.consultar.join(' ')}</Notice>}
            <div className="flex flex-col sm:flex-row gap-2">
              <Opcion activa={base[b.id] === 'si'} disabled={vetado} onClick={() => elegir(b.id, 'si')} titulo="Sí">{b.si}</Opcion>
              <Opcion activa={base[b.id] === 'no'} onClick={() => elegir(b.id, 'no')} titulo="No hace tanta falta">{b.no}</Opcion>
            </div>
          </div>
        )
      })}
      <div className="flex justify-end"><Button variant="primary" size="lg" iconRight={<ChevronRight size={14} />} onClick={seguir}>Continuar</Button></div>
    </section>
  )
}

function PasoMotivo({ motivos, elegir }: { motivos: Motivo[]; elegir: (m: Motivo) => void }) {
  return (
    <section className="mt-5 flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-ink">¿Cuál es el motivo de consulta?</h2>
        <p className="mt-1 text-base text-muted">Elige uno y responde a su pregunta.</p>
      </div>
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {motivos.map((m) => (
          <button key={m.id} type="button" onClick={() => elegir(m)} className="rounded-xl bg-surface border border-line px-4 py-3 text-left flex items-center gap-3 hover:border-faint">
            <span className="flex-1 min-w-0 flex flex-col">
              <span className="text-base font-semibold text-ink">{m.titulo}</span>
              <span className="text-sm text-muted">{m.gama}</span>
            </span>
            <ChevronRight size={15} className="text-faint shrink-0" />
          </button>
        ))}
      </div>
    </section>
  )
}

function PasoPregunta({ motivo, nota, responder }: { motivo: Motivo; nota?: string; responder: (r: Resultado | Salto) => void }) {
  return (
    <section className="mt-5 rounded-xl bg-surface border border-line p-5 flex flex-col gap-4 max-w-[640px]">
      <span className="label text-accent">{motivo.titulo}</span>
      {nota && <Notice tone="neutral">{nota}</Notice>}
      <h2 className="text-title font-semibold tracking-tight text-ink">{motivo.pregunta}</h2>
      <div className="flex flex-col gap-2">
        {motivo.opciones.map((o) => (
          <button key={o.texto} type="button" onClick={() => responder(o.resultado)} className="min-h-[48px] rounded-lg border border-line bg-surface px-3.5 py-2.5 text-left flex items-center gap-3 hover:border-accent hover:bg-accent-wash">
            <span className="flex-1 min-w-0 text-base text-ink">{o.texto}</span>
            <ChevronRight size={15} className="text-faint shrink-0" />
          </button>
        ))}
      </div>
    </section>
  )
}

function Lista({ items }: { items: string[] }) {
  return <ul className="flex flex-col gap-0.5 text-sm text-ink-soft list-disc pl-4">{items.map((x) => <li key={x}>{x}</li>)}</ul>
}

/** Un producto con su toma, quién sí, quién no y sus avisos. Si las reglas lo vetan, lo dice y no lo recomienda. */
function TarjetaProducto({ datos, marcas, id, avisos = [], destacado }: { datos: DatosRecomendador; marcas: Marcas; id: string; avisos?: string[]; destacado?: boolean }) {
  const base = useBase()
  const { contenido } = useContenido()
  const p = productById(id)
  const t = datos.tomas[id]
  if (!p) return null
  const ev = evaluar(datos, marcas, id)
  const vetado = ev.no.length > 0
  const quienSi = contenido.fichas[id]?.para_quien ?? []
  const quienNo = datos.quien_no[id]
  // La advertencia de la toma repite lo de «quién no»: solo sale en las tarjetas pequeñas y si no hay ya un aviso.
  const deLaToma = !destacado && ev.consultar.length === 0 && t?.advertencia ? [t.advertencia] : []
  const ambar = [...ev.consultar, ...avisos, ...deLaToma].filter((a, i, l) => l.indexOf(a) === i)
  return (
    <article className={cn('rounded-xl bg-surface border p-4 flex gap-4', !vetado && destacado ? 'border-accent-line shadow-card' : 'border-line')}>
      <ProductArt art={p.art} photo={p.photo} size={64} className={cn('rounded-lg border border-line-soft shrink-0', destacado ? 'h-24 w-24' : 'h-16 w-16', vetado && 'grayscale')} />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <h3 className={cn('font-semibold text-ink', destacado ? 'text-title tracking-tight' : 'text-base')}>{p.name}</h3>
        {vetado ? (
          <Notice tone="danger"><span className="font-semibold">No se recomienda para esta persona. </span>{ev.no.join(' ')}</Notice>
        ) : (
          <>
            {t && <p className="text-base text-ink-soft"><span className="font-medium">Toma: </span>{t.toma}</p>}
            {ambar.map((a) => <Notice key={a} tone="warn">{a}</Notice>)}
            {destacado && quienSi.length > 0 && <div className="flex flex-col gap-1"><span className="text-sm font-semibold text-ink">Quién sí</span><Lista items={quienSi} /></div>}
            {destacado && quienNo && <div className="flex flex-col gap-1"><span className="text-sm font-semibold text-ink">No recomendado, o consultar antes si…</span><p className="text-sm text-ink-soft">{quienNo}</p></div>}
          </>
        )}
        <Link to={`${base}/formacion/${id}`} className="self-start text-sm font-medium text-accent hover:text-accent-deep">Ver la ficha</Link>
      </div>
    </article>
  )
}

function PasoResultado({ datos, marcas, motivo, resultado: r, nota, elegidos, reiniciar }: { datos: DatosRecomendador; marcas: Marcas; motivo: Motivo; resultado: Resultado; nota?: string; elegidos: Base; reiniciar: () => void }) {
  const vetado = evaluar(datos, marcas, r.producto).no.length > 0
  const baseElegida = datos.basicos.filter((b) => elegidos[b.id] === 'si' && b.id !== r.producto && evaluar(datos, marcas, b.id).no.length === 0)
  const descartado = r.tipo === 'base' && elegidos[r.producto] === 'no'
  const zincConBase = r.producto === 'zinc' ? baseElegida.filter((b) => datos.basicos_con_zinc.includes(b.id)) : []
  const combinables = vetado ? [] : datos.combinables.filter((c) => c.productos.includes(r.producto))
  const yaSalen = new Set([r.producto, ...baseElegida.map((b) => b.id)])
  const incompatibles = datos.incompatibles.filter((c) => c.productos.includes(r.producto))

  return (
    <section className="mt-5 flex flex-col gap-4 max-w-[760px]">
      <div className="flex flex-col gap-1">
        <span className="label text-accent">{motivo.titulo}</span>
        <h2 className="text-lg font-semibold text-ink">{vetado ? 'Este producto no es para esta persona' : r.tipo === 'base' ? 'Ya cubierto por la Base' : 'Producto recomendado'}</h2>
        {r.tipo === 'base' && !vetado && <p className="text-base text-muted">{r.texto}</p>}
      </div>
      {nota && <Notice tone="neutral">{nota}</Notice>}
      {vetado && <Notice tone="neutral">Por lo que has respondido en Seguridad, no se recomienda. Si aun así lo necesita, que lo valore su médico.</Notice>}
      {descartado && !vetado && <Notice tone="neutral">En La Base lo marcaste como «no hace tanta falta»: revisa si encaja con esta persona.</Notice>}
      <TarjetaProducto datos={datos} marcas={marcas} id={r.producto} avisos={r.tipo === 'producto' ? r.avisos : []} destacado />

      {zincConBase.length > 0 && <Notice tone="warn">{zincConBase.map((b) => b.nombre).join(' y ')} también {zincConBase.length > 1 ? 'llevan' : 'lleva'} zinc: el Zinc no se recomienda junto a otros suplementos que lo contengan.</Notice>}
      {!vetado && incompatibles.map((c) => <Notice key={c.texto} tone="warn">{c.texto}</Notice>)}

      {combinables.map((c) => (
        <div key={c.texto} className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-ink">Se puede combinar</h3>
          <p className="text-base text-muted">{c.texto}</p>
          {c.productos.filter((id) => !yaSalen.has(id)).map((id) => <TarjetaProducto key={id} datos={datos} marcas={marcas} id={id} />)}
        </div>
      ))}

      {baseElegida.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-ink">Su Base</h3>
          {baseElegida.map((b) => <TarjetaProducto key={b.id} datos={datos} marcas={marcas} id={b.id} />)}
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
 * Recomendador (doc de cambios del 9 nov): primero la seguridad (quién puede tomar qué), después la
 * Base, el motivo de consulta y el resultado. Un producto vetado por la seguridad no se recomienda;
 * si solo hay que consultar, sale con el aviso en ámbar. No guarda nada.
 */
export function Recomendador() {
  const { contenido, falla } = useContenido()
  const datos = contenido.recomendador
  const diagrama = documentoDe(contenido, SLUG_DIAGRAMA)
  const [verDiagrama, setVerDiagrama] = useState(false)
  const [marcas, setMarcas] = useState<Marcas>({})
  const [base, setBase] = useState<Base>({})
  const [pila, setPila] = useState<Pantalla[]>([{ t: 'seguridad', i: 0 }])
  const actual = pila[pila.length - 1]
  const ir = (p: Pantalla) => setPila([...pila, p])
  const atras = () => setPila(pila.length > 1 ? pila.slice(0, -1) : pila)
  const reiniciar = () => { setMarcas({}); setBase({}); setPila([{ t: 'seguridad', i: 0 }]) }

  const botonDiagrama = diagrama && <Button icon={<Download size={13} />} onClick={() => setVerDiagrama(true)}>Descargar diagrama (PDF)</Button>

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

  const responder = (motivo: Motivo, r: Resultado | Salto) => {
    if (r.tipo === 'salto') {
      const otro = datos.motivos.find((m) => m.id === r.motivo)
      if (otro) ir({ t: 'pregunta', motivo: otro, nota: r.nota })
    } else {
      ir({ t: 'resultado', motivo, resultado: r, nota: actual.t === 'pregunta' ? actual.nota : undefined })
    }
  }
  const indice = actual.t === 'seguridad' ? 0 : actual.t === 'base' ? 1 : actual.t === 'resultado' ? 3 : 2
  const condiciones = Object.values(marcas).flat()
  const soloAdultos = condiciones.includes('menor') || condiciones.includes('embarazo')

  return (
    <Screen toolbar={<Toolbar title="Recomendador" right={<>{botonDiagrama}<MiListaButton /></>} />}>
      <PageHeader title="Recomendador" subtitle="Responde unas preguntas cortas sobre tu cliente: primero comprobamos qué puede tomar y después te decimos qué suplemento encaja." />
      <Pasos actual={indice} />
      {pila.length > 1 && (
        <button type="button" onClick={atras} className="mt-4 h-9 self-start inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"><ArrowLeft size={14} />Atrás</button>
      )}
      {soloAdultos && actual.t !== 'seguridad' && <Notice className="mt-4 max-w-[760px]" tone="warn">Los complementos son para adultos: en menores, embarazo o lactancia no se recomiendan salvo indicación médica. Consultar al médico.</Notice>}
      {actual.t === 'seguridad' && (
        <PasoSeguridad
          key={actual.i}
          grupo={datos.seguridad[actual.i]}
          i={actual.i}
          total={datos.seguridad.length}
          marcadas={marcas[datos.seguridad[actual.i].id] ?? []}
          marcar={(ids) => setMarcas({ ...marcas, [datos.seguridad[actual.i].id]: ids })}
          seguir={() => ir(actual.i + 1 < datos.seguridad.length ? { t: 'seguridad', i: actual.i + 1 } : { t: 'base' })}
        />
      )}
      {actual.t === 'base' && <PasoBase datos={datos} marcas={marcas} base={base} setBase={setBase} seguir={() => ir({ t: 'motivo' })} />}
      {actual.t === 'motivo' && <PasoMotivo motivos={datos.motivos} elegir={(m) => ir({ t: 'pregunta', motivo: m })} />}
      {actual.t === 'pregunta' && <PasoPregunta key={actual.motivo.id + (actual.nota ?? '')} motivo={actual.motivo} nota={actual.nota} responder={(r) => responder(actual.motivo, r)} />}
      {actual.t === 'resultado' && <PasoResultado datos={datos} marcas={marcas} motivo={actual.motivo} resultado={actual.resultado} nota={actual.nota} elegidos={base} reiniciar={reiniciar} />}
      {verDiagrama && diagrama && <VisorDocumento slug={diagrama.slug} titulo="Diagrama de recomendación" onClose={() => setVerDiagrama(false)} />}
    </Screen>
  )
}
