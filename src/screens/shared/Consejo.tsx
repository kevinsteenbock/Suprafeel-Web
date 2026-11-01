import { useState } from 'react'
import { Link } from 'react-router'
import { Sparkles, X, Plus, Check } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { euro, filterProducts, productById } from '@/data/products'
import { Toolbar, SearchField } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { cn } from '@/lib/cn'
import { MiListaButton } from './Catalogo'

export interface CaseResult { id: string; score: number; why: string; badges: { label: string; tone: 'ok' | 'warn' | 'neutral' }[] }

export const demoCase = {
  query: 'Duerme mal, se despierta sobre las 3 y está cansada todo el día',
  facts: [
    { label: 'Insomnio de mantenimiento', tone: 'accent' },
    { label: 'Fatiga diurna', tone: 'accent' },
    { label: 'Mujer · 52 años', tone: 'neutral' },
    { label: 'Toma levotiroxina', tone: 'neutral' },
  ] as { label: string; tone: 'accent' | 'neutral' }[],
  results: [
    { id: 'magnesio', score: 92, why: 'El citrato + bisglicinato ayuda con el sueño de baja calidad y la tensión muscular que describe. Ojo: la levotiroxina se toma en ayunas y el magnesio reduce su absorción — separar 4 horas.', badges: [{ label: 'Requiere separación', tone: 'warn' }, { label: 'Evidencia alta', tone: 'neutral' }] },
    { id: 'vitamina-b12', score: 79, why: 'Encaja con el cansancio persistente, no con el insomnio en sí. No interacciona con la levotiroxina. Recomendar por la mañana, en ayunas, como apoyo.', badges: [{ label: 'Sin interacción', tone: 'ok' }, { label: 'Apoyo secundario', tone: 'neutral' }] },
    { id: 'ashwagandha', score: 68, why: 'Puede ayudar con el componente de estrés detrás del insomnio, pero hay casos descritos de alteración de la función tiroidea con su uso — mejor que lo consulte con su médico antes, ya que toma levotiroxina.', badges: [{ label: 'Precaución', tone: 'warn' }, { label: 'Evidencia moderada', tone: 'neutral' }] },
  ] as CaseResult[],
  warnings: [
    { title: 'Deriva al médico si dura más de 4 semanas', body: 'El insomnio crónico en mujer de 52 años puede ser perimenopáusico o tiroideo. Conviene descartarlo.' },
    { title: 'Magnesio y levotiroxina: separar 4 h', body: 'Si finalmente lleva magnesio, que lo tome por la noche y la levotiroxina en ayunas.' },
    { title: 'Ashwagandha y patología tiroidea', body: 'Se han descrito casos de alteración de la función tiroidea. Si toma levotiroxina, que lo consulte antes con su médico.' },
  ],
}

export function ScoreCircle({ score, size = 44 }: { score: number; size?: number }) {
  const tone = score >= 90 ? 'bg-accent text-on-accent' : score >= 80 ? 'bg-accent-wash text-accent-deep' : 'bg-surface text-ink-soft border border-line'
  return <span style={{ width: size, height: size, fontSize: size >= 44 ? 15 : 12 }} className={cn('rounded-full inline-flex items-center justify-center font-semibold shrink-0', tone)}>{score}</span>
}

/** Para comparar textos sin que importen mayúsculas, acentos ni espacios de más. */
const plano = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
const esEjemplo = (t: string) => plano(t) === plano(demoCase.query)

/**
 * Todavía no hay motor que analice casos (ni en Xano ni en el chat). La pantalla solo enseña el caso de
 * ejemplo del Paper, y lo dice; con cualquier otro texto no se inventa un análisis: sale un aviso honesto.
 */
export function Consejo() {
  const base = useBase()
  const { miLista, toggleLista, saveCase } = useStore()
  const isComercial = base === '/comercial'
  const [query, setQuery] = useState(demoCase.query)
  // El texto que se analizó la última vez (lo que hay en pantalla corresponde a esto, no a lo que se está escribiendo).
  const [analizado, setAnalizado] = useState(demoCase.query)
  const [facts, setFacts] = useState(demoCase.facts)
  const [thinking, setThinking] = useState(false)
  const ejemplo = esEjemplo(analizado)
  const analyzed = !thinking && ejemplo

  const analyze = () => {
    if (!query.trim()) return
    if (!esEjemplo(query)) {
      setAnalizado(query)
      return
    }
    setThinking(true)
    window.setTimeout(() => { setThinking(false); setAnalizado(query); setFacts(demoCase.facts) }, 700)
  }
  const verEjemplo = () => { setQuery(demoCase.query); setAnalizado(demoCase.query); setFacts(demoCase.facts) }

  return (
    <Screen toolbar={<Toolbar title="Consejo por síntomas" right={<><SearchField placeholder="Buscar producto o CN" /><MiListaButton /></>} />}>
      <div className="flex flex-col">
        <h1 className="text-h1 font-semibold tracking-tight text-ink">¿Qué le pasa a tu cliente?</h1>
        <p className="mt-[5px] text-base text-muted">Descríbelo con tus palabras. Suprafeel cruza los síntomas con la ficha técnica de cada producto.</p>
      </div>

      <div className="rounded-xl bg-surface border-2 border-accent shadow-focus p-[18px] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Sparkles size={16} className="text-accent shrink-0" />
          <input
            className="flex-1 bg-transparent text-lg text-ink placeholder:text-faint"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyze()}
            placeholder="Ej.: señor de 60 años, calambres por la noche y toma sintrom"
          />
          <Button variant="primary" size="lg" className="shrink-0" onClick={analyze} disabled={thinking}>{thinking ? 'Analizando…' : 'Analizar'}</Button>
        </div>
        {analyzed && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="neutral" className="mr-1">Caso de ejemplo</Badge>
            <span className="label mr-1">He entendido</span>
            {facts.map((f, i) => (
              <span key={`${i}-${f.label}`} className={cn('h-[26px] max-lg:h-8 rounded-full pl-3 pr-px inline-flex items-center gap-1.5 text-md font-medium', f.tone === 'accent' ? 'bg-accent-wash text-accent-deep' : 'bg-surface border border-line text-ink-soft')}>
                {f.label}
                <button onClick={() => setFacts((fs) => fs.filter((x) => x !== f))} aria-label={`Quitar «${f.label}»`} className="h-6 w-6 max-lg:h-[30px] max-lg:w-[30px] -ml-1.5 shrink-0 rounded-full inline-flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-chrome-deep/60"><X size={11} strokeWidth={2.5} /></button>
              </span>
            ))}
            <button onClick={() => setFacts((fs) => [...fs, { label: 'Sin alergias', tone: 'neutral' }])} className="h-[26px] max-lg:h-8 rounded-full border border-dashed border-line px-3 text-md text-muted inline-flex items-center gap-1 hover:bg-chrome"><Plus size={11} /> Añadir dato</button>
          </div>
        )}
      </div>

      {thinking && (
        <div className="rounded-xl border border-dashed border-line bg-chrome/60 h-[220px] flex flex-col items-center justify-center gap-2 text-muted">
          <Sparkles size={20} className="text-accent animate-pulse" />
          <span className="text-base">{`Cruzando síntomas con ${filterProducts('all').length} fichas técnicas…`}</span>
        </div>
      )}

      {!thinking && !ejemplo && (
        <div className="rounded-xl border border-dashed border-line bg-chrome/60 px-6 py-10 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-lg font-semibold text-ink">El consejo por síntomas aún no está disponible</span>
          <span className="text-base text-muted max-w-[460px] leading-[19px]">Todavía no analiza casos reales, así que no te enseñamos una recomendación que no sale de lo que has escrito. {isComercial ? 'De momento, consúltalo con la central en info@suprafeel.es.' : 'De momento, pregunta a tu comercial o escríbenos a info@suprafeel.es.'}</span>
          <Button className="mt-3" onClick={verEjemplo}>Ver el caso de ejemplo</Button>
        </div>
      )}

      {analyzed && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <h2 className="text-lg font-semibold text-ink">{demoCase.results.length} productos encajan con el caso de ejemplo</h2>
              <span className="text-sm text-faint">Ordenados por grado de encaje</span>
            </div>
            {demoCase.results.map((r) => {
              const p = productById(r.id)!
              const saved = miLista.includes(p.id)
              return (
                <div key={r.id} className="rounded-xl bg-surface border border-line shadow-card p-4 flex gap-4">
                  <ScoreCircle score={r.score} />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0 flex flex-col">
                        <Link to={`${base}/consejo/${p.id}`} className="text-lg font-semibold text-ink hover:text-accent-deep">{p.name}</Link>
                        <span className="text-sm text-faint mt-[2px]">{[p.format, p.cn && `CN ${p.cn}`, `PVP ${euro(p.pvp)}`].filter(Boolean).join(' · ')}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`${base}/consejo/${p.id}`}><Button>Ver ficha</Button></Link>
                        <Button variant="soft" onClick={() => toggleLista(p.id)} icon={saved ? <Check size={12} strokeWidth={2.5} /> : undefined}>{saved ? 'Guardado' : 'Guardar'}</Button>
                      </div>
                    </div>
                    <p className="mt-3 text-base leading-[19px] text-ink-soft">{r.why}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.badges.map((b, i) => (
                        <Badge key={`${i}-${b.label}`} tone={b.tone} className="h-[22px] px-2.5 rounded-[6px]">
                          {b.tone === 'ok' && <Check size={11} strokeWidth={2.5} className="mr-1" />}
                          {b.tone === 'warn' && <span className="mr-1 font-bold">!</span>}
                          {b.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="w-full lg:w-[300px] lg:shrink-0 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-ink">Antes de recomendar</h2>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {demoCase.warnings.map((w, i) => (
                <div key={`${i}-${w.title}`} className={cn('px-4 py-4 flex gap-3', i < demoCase.warnings.length - 1 && 'border-b border-line-soft')}>
                  <span className="h-5 w-5 rounded-full bg-warn-wash text-warn text-xs font-bold inline-flex items-center justify-center shrink-0 mt-px">!</span>
                  <div className="flex flex-col"><span className="text-base font-semibold text-ink">{w.title}</span><span className="text-sm text-muted mt-1 leading-4">{w.body}</span></div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col">
              <span className="text-base font-semibold text-ink">¿Te lo guardas para luego?</span>
              <span className="text-sm text-muted mt-1.5 leading-4">Se guarda en Mi lista, en este navegador. Todavía no llega a {isComercial ? 'la farmacia' : 'tu comercial'}.</span>
              <Button className="mt-6 w-full h-8" onClick={saveCase}>Guardar el caso</Button>
            </div>
          </aside>
        </div>
      )}
    </Screen>
  )
}
