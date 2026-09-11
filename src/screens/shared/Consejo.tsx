import { useState } from 'react'
import { Link } from 'react-router'
import { Sparkles, X, Plus, Check } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { euro, productById } from '@/data/products'
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
    { id: 'melatonina-noche', score: 94, why: 'La liberación retardada cubre el despertar de madrugada, que es justo lo que describe. A 1,9 mg no requiere receta y no interfiere con la levotiroxina.', badges: [{ label: 'Sin interacción', tone: 'ok' }, { label: 'Evidencia alta', tone: 'neutral' }] },
    { id: 'magnesio-complex', score: 81, why: 'El bisglicinato ayuda en el insomnio de mantenimiento y en la fatiga muscular. Ojo: la levotiroxina se toma en ayunas y el magnesio reduce su absorción — separar 4 horas.', badges: [{ label: 'Requiere separación', tone: 'warn' }, { label: 'Evidencia moderada', tone: 'neutral' }] },
    { id: 'complejo-b', score: 76, why: 'Encaja con la fatiga diurna, no con el insomnio. Recomendar por la mañana y como apoyo, nunca como única respuesta al caso.', badges: [{ label: 'Sin interacción', tone: 'ok' }, { label: 'Apoyo secundario', tone: 'neutral' }] },
  ] as CaseResult[],
  warnings: [
    { title: 'Deriva al médico si dura más de 4 semanas', body: 'El insomnio crónico en mujer de 52 años puede ser perimenopáusico o tiroideo. Conviene descartarlo.' },
    { title: 'Magnesio y levotiroxina: separar 4 h', body: 'Si finalmente lleva magnesio, que lo tome por la noche y la levotiroxina en ayunas.' },
    { title: 'No combinar melatonina con ansiolíticos', body: 'Pregunta si toma lorazepam o similares antes de recomendar melatonina.' },
  ],
}

export function ScoreCircle({ score, size = 44 }: { score: number; size?: number }) {
  const tone = score >= 90 ? 'bg-accent text-on-accent' : score >= 80 ? 'bg-accent-wash text-accent-deep' : 'bg-surface text-ink-soft border border-line'
  return <span style={{ width: size, height: size, fontSize: size >= 44 ? 15 : 12 }} className={cn('rounded-full inline-flex items-center justify-center font-semibold shrink-0', tone)}>{score}</span>
}

export function Consejo() {
  const base = useBase()
  const { miLista, toggleLista, saveCase } = useStore()
  const isComercial = base === '/comercial'
  const [query, setQuery] = useState(demoCase.query)
  const [analyzed, setAnalyzed] = useState(true)
  const [facts, setFacts] = useState(demoCase.facts)
  const [thinking, setThinking] = useState(false)

  const analyze = () => {
    if (!query.trim()) return
    setThinking(true)
    setAnalyzed(false)
    window.setTimeout(() => { setThinking(false); setAnalyzed(true); setFacts(demoCase.facts) }, 700)
  }

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
          <Button variant="primary" size="lg" onClick={analyze} disabled={thinking}>{thinking ? 'Analizando…' : 'Analizar'}</Button>
        </div>
        {analyzed && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="label mr-1">He entendido</span>
            {facts.map((f) => (
              <span key={f.label} className={cn('h-[26px] rounded-full pl-3 pr-2 inline-flex items-center gap-1.5 text-md font-medium', f.tone === 'accent' ? 'bg-accent-wash text-accent-deep' : 'bg-surface border border-line text-ink-soft')}>
                {f.label}
                <button onClick={() => setFacts((fs) => fs.filter((x) => x !== f))} className="opacity-60 hover:opacity-100"><X size={11} strokeWidth={2.5} /></button>
              </span>
            ))}
            <button onClick={() => setFacts((fs) => [...fs, { label: 'Sin alergias', tone: 'neutral' }])} className="h-[26px] rounded-full border border-dashed border-line px-3 text-md text-muted inline-flex items-center gap-1 hover:bg-chrome"><Plus size={11} /> Añadir dato</button>
          </div>
        )}
      </div>

      {thinking && (
        <div className="rounded-xl border border-dashed border-line bg-chrome/60 h-[220px] flex flex-col items-center justify-center gap-2 text-muted">
          <Sparkles size={20} className="text-accent animate-pulse" />
          <span className="text-base">Cruzando síntomas con 48 fichas técnicas…</span>
        </div>
      )}

      {analyzed && !thinking && (
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">{demoCase.results.length} productos encajan con el caso</h2>
              <span className="text-sm text-faint">Ordenados por grado de encaje</span>
            </div>
            {demoCase.results.map((r) => {
              const p = productById(r.id)!
              const saved = miLista.includes(p.id)
              return (
                <div key={r.id} className="rounded-xl bg-surface border border-line shadow-card p-4 flex gap-4">
                  <ScoreCircle score={r.score} />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0 flex flex-col">
                        <Link to={`${base}/consejo/${p.id}`} className="text-lg font-semibold text-ink hover:text-accent-deep">{p.name}</Link>
                        <span className="text-sm text-faint mt-[2px]">{p.format} · CN {p.cn} · PVP {euro(p.pvp)}</span>
                      </div>
                      <Link to={`${base}/consejo/${p.id}`}><Button>Ver ficha</Button></Link>
                      <Button variant="soft" onClick={() => toggleLista(p.id)} icon={saved ? <Check size={12} strokeWidth={2.5} /> : undefined}>{saved ? 'Guardado' : 'Guardar'}</Button>
                    </div>
                    <p className="mt-3 text-base leading-[19px] text-ink-soft">{r.why}</p>
                    <div className="mt-3 flex gap-2">
                      {r.badges.map((b) => (
                        <Badge key={b.label} tone={b.tone} className="h-[22px] px-2.5 rounded-[6px]">
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

          <aside className="w-[300px] shrink-0 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-ink">Antes de recomendar</h2>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {demoCase.warnings.map((w, i) => (
                <div key={w.title} className={cn('px-4 py-4 flex gap-3', i < demoCase.warnings.length - 1 && 'border-b border-line-soft')}>
                  <span className="h-5 w-5 rounded-full bg-warn-wash text-warn text-xs font-bold inline-flex items-center justify-center shrink-0 mt-px">!</span>
                  <div className="flex flex-col"><span className="text-base font-semibold text-ink">{w.title}</span><span className="text-sm text-muted mt-1 leading-4">{w.body}</span></div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col">
              <span className="text-base font-semibold text-ink">{isComercial ? '¿Se lo dejas preparado a la farmacia?' : '¿Lo hablamos con tu comercial?'}</span>
              <span className="text-sm text-muted mt-1.5 leading-4">{isComercial ? 'Guarda el caso en la ficha de Farmacia Central y lo verán en su área.' : 'Guarda el caso y Álvaro lo verá antes de la visita del martes.'}</span>
              <Button className="mt-6 w-full h-8" onClick={saveCase}>{isComercial ? 'Guardar en la ficha' : 'Guardar el caso'}</Button>
            </div>
          </aside>
        </div>
      )}
    </Screen>
  )
}
