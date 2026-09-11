import { Link, Navigate, useParams } from 'react-router'
import { Check, ChevronRight } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { productById, euro } from '@/data/products'
import { Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { ProductArt } from '@/ui/ProductArt'
import { demoCase, ScoreCircle } from './Consejo'
import { cn } from '@/lib/cn'

const detail: Record<string, { why: { t: string; d: string }[]; say: string; remember: string[]; dose: string[]; ask: string[] }> = {
  'melatonina-noche': {
    why: [
      { t: 'Despertar de madrugada', d: 'La liberación retardada mantiene niveles durante la segunda mitad de la noche, que es justo donde ella falla.' },
      { t: 'Compatible con la levotiroxina', d: 'No comparte vía de absorción ni interacciona. Puede tomarla sin cambiar su pauta de la mañana.' },
      { t: '1,9 mg: no necesita receta', d: 'Por debajo de 2 mg se dispensa sin receta. Por encima sería medicamento y habría que derivar.' },
    ],
    say: '«Lo que me cuenta, despertarse a las tres, suele ir más de mantener el sueño que de coger el sueño. Esta melatonina es de liberación lenta, así que acompaña toda la noche. Tómela media hora antes de acostarse.»',
    remember: ['Nada de pantallas la última hora: la luz retrasa su propia melatonina.', 'Misma hora de acostarse también el fin de semana.', 'Si a las 4 semanas sigue igual, que lo comente con su médico.'],
    dose: ['1 cápsula', '30 min antes de dormir', '4 semanas y revisar'],
    ask: ['¿Toma lorazepam u otro ansiolítico para dormir?', '¿Lleva más de 4 semanas durmiendo mal? Derivar al médico.', '¿Conduce de madrugada o hace turnos de noche?'],
  },
  'magnesio-complex': {
    why: [
      { t: 'Insomnio de mantenimiento', d: 'El bisglicinato relaja el músculo y baja los despertares de madrugada.' },
      { t: 'Fatiga diurna', d: 'A los 52 el magnesio suele andar justo y eso da cansancio y calambres.' },
      { t: 'Ojo con la levotiroxina', d: 'Reduce su absorción: separar 4 horas. Levotiroxina en ayunas, magnesio con la cena.' },
    ],
    say: '«El magnesio le va a ayudar a descansar mejor y con el cansancio, pero tómelo siempre con la cena, lejos de la pastilla del tiroides de la mañana.»',
    remember: ['Separar 4 horas de la levotiroxina.', 'Con la cena, no en ayunas.', 'El bisglicinato no suelta el vientre como el óxido.'],
    dose: ['2 cápsulas', 'Con la cena', '8 semanas'],
    ask: ['¿Toma la levotiroxina en ayunas? Mantenerlo así.', '¿Tiene problemas de riñón? Derivar.', '¿Ha probado otro magnesio que le sentara mal?'],
  },
  'complejo-b': {
    why: [
      { t: 'Fatiga diurna', d: 'Las vitaminas B activadas ayudan con el cansancio de día, no con el sueño.' },
      { t: 'Apoyo, no respuesta', d: 'No toca el insomnio: es un acompañante de la melatonina o el magnesio.' },
      { t: 'Por la mañana', d: 'De noche podría activar. Siempre con el desayuno.' },
    ],
    say: '«Esto es para el cansancio del día, no para dormir. Tómelo por la mañana y combínelo con lo que le hemos dado para la noche.»',
    remember: ['Nunca por la noche.', 'No es la solución al insomnio.', 'Revisar en 4 semanas.'],
    dose: ['1 comprimido', 'Con el desayuno', '4 semanas'],
    ask: ['¿Toma algún otro multivitamínico?', '¿Come con normalidad?', '¿Está embarazada o en lactancia?'],
  },
}

export function ConsejoProducto() {
  const { id } = useParams()
  const base = useBase()
  const { saveCase, notify } = useStore()
  const p = productById(id)
  if (!p) return <Navigate to={`${base}/consejo`} replace />
  const r = demoCase.results.find((x) => x.id === p.id)
  const d = detail[p.id] ?? detail['melatonina-noche']
  const others = demoCase.results.filter((x) => x.id !== p.id)

  return (
    <Screen
      padded={false}
      toolbar={<Toolbar back={`${base}/consejo`} crumbs={[{ label: 'Consejo por síntomas', to: `${base}/consejo` }, { label: p.name }]} right={<Button onClick={saveCase}>Guardar el caso</Button>} />}
    >
      <div className="h-[38px] shrink-0 px-7 bg-accent-wash border-b border-accent-line flex items-center gap-3 text-sm">
        <span className="label text-accent">Caso abierto</span>
        <span className="text-ink-soft flex-1 truncate">{demoCase.query} · Mujer 52 años · Toma levotiroxina</span>
        <Link to={`${base}/consejo`} className="font-medium text-accent">Volver a los {demoCase.results.length} resultados</Link>
      </div>

      <div className="flex gap-6 px-7 pt-6 pb-7">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ProductArt art={p.art} size={44} className="h-[76px] w-[76px] rounded-xl border border-line" />
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="label text-accent">{p.categoryLabel}</span>
              <h1 className="text-h1 font-semibold tracking-tight text-ink mt-1">{p.name}</h1>
              <span className="text-base text-muted mt-1">{p.format} · CN {p.cn} · PVP {euro(p.pvp)}</span>
            </div>
            <div className="flex flex-col items-center gap-1"><ScoreCircle score={r?.score ?? 80} size={52} /><span className="label-faint">Encaje</span></div>
          </div>

          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-9 px-4 bg-chrome border-b border-line flex items-center"><span className="label">Por qué encaja con este caso</span></div>
            {d.why.map((w, i) => (
              <div key={w.t} className={cn('px-4 py-3.5 flex gap-3', i < d.why.length - 1 && 'border-b border-line-soft')}>
                <span className="h-5 w-5 rounded-full bg-ok-wash text-ok inline-flex items-center justify-center shrink-0 mt-px"><Check size={11} strokeWidth={3} /></span>
                <div className="flex flex-col"><span className="text-base font-semibold text-ink">{w.t}</span><span className="text-sm text-muted mt-[3px] leading-4">{w.d}</span></div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-[#7B3A24] text-on-accent p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="label text-on-accent-soft">Qué decirle en el mostrador</span>
              <button onClick={() => { navigator.clipboard?.writeText(d.say); notify('Copiado') }} className="text-sm font-semibold hover:underline">Copiar</button>
            </div>
            <p className="mt-3.5 text-[17px] leading-[26px] font-medium">{d.say}</p>
          </div>

          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-9 px-4 bg-chrome border-b border-line flex items-center"><span className="label">Y además, recuérdale</span></div>
            {d.remember.map((t, i) => (
              <div key={t} className={cn('h-[43px] px-4 flex items-center gap-4', i < d.remember.length - 1 && 'border-b border-line-soft')}>
                <span className="w-4 text-sm text-faint">{i + 1}</span><span className="text-base text-ink">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="w-[300px] shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-9 px-4 bg-chrome border-b border-line flex items-center"><span className="label">Pauta sugerida</span></div>
            {[['Dosis', d.dose[0]], ['Cuándo', d.dose[1]], ['Duración', d.dose[2]]].map(([k, v], i) => (
              <div key={k} className={cn('h-[42px] px-4 flex items-center gap-3', i < 2 && 'border-b border-line-soft')}><span className="w-[72px] text-sm text-muted">{k}</span><span className="text-base font-medium text-ink">{v}</span></div>
            ))}
          </div>
          <div className="rounded-xl bg-warn-wash border border-warn-line p-4 flex flex-col">
            <span className="label text-warn">Antes de dispensar, pregunta</span>
            <ul className="mt-3 flex flex-col gap-2.5">
              {d.ask.map((a) => (<li key={a} className="flex gap-2 text-sm leading-4 text-[#5C4512]"><span className="mt-[6px] h-1 w-1 rounded-full bg-warn shrink-0" />{a}</li>))}
            </ul>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col">
            <div className="h-9 px-4 bg-chrome border-b border-line flex items-center"><span className="label">Otras opciones del caso</span></div>
            {others.map((o) => {
              const op = productById(o.id)!
              return (
                <Link key={o.id} to={`${base}/consejo/${o.id}`} className="h-[54px] px-4 flex items-center gap-3 border-b border-line-soft hover:bg-canvas">
                  <ScoreCircle score={o.score} size={28} />
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{op.name}</span><span className="text-xs text-accent-deep truncate">{o.badges[0].label === 'Requiere separación' ? 'Requiere separar 4 h' : 'Solo apoyo, por la mañana'}</span></span>
                  <ChevronRight size={14} className="text-faint" />
                </Link>
              )
            })}
            <Link to={`${base}/catalogo/${p.id}`} className="h-[46px] flex items-center justify-center gap-1.5 text-base font-medium text-accent hover:bg-canvas">Ver ficha completa del producto <ChevronRight size={14} /></Link>
          </div>
        </aside>
      </div>
    </Screen>
  )
}
