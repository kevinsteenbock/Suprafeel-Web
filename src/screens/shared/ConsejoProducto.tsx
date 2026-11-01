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
import { tactilSm } from '@/ui/tactil'

const detail: Record<string, { why: { t: string; d: string }[]; say: string; remember: string[]; dose: string[]; ask: string[] }> = {
  magnesio: {
    why: [
      { t: 'Sueño de baja calidad y tensión muscular', d: 'Es justo lo que recoge su ficha: apoya la relajación muscular y nerviosa, que encaja con el despertar de madrugada.' },
      { t: 'Compatible con la levotiroxina, con matiz', d: 'No interacciona con la hormona en sí, pero el magnesio reduce su absorción si se toman juntos. Separando 4 horas no hay problema.' },
      { t: 'Con comida, por la noche', d: 'Así lo indica su modo de empleo: 2 cápsulas al día, preferiblemente por la noche, con comida.' },
    ],
    say: '«Lo que me cuenta, despertarse a las tres, va más de mantener el sueño que de conciliarlo. Este magnesio ayuda con eso y con la tensión muscular. Tómelo por la noche con la cena, y la pastilla del tiroides por la mañana en ayunas, separadas.»',
    remember: ['Separar 4 horas de la levotiroxina.', 'Con comida, no en ayunas.', 'Si a las 4 semanas sigue igual, derivar al médico.'],
    dose: ['2 cápsulas', 'Por la noche, con comida', '4 semanas y revisar'],
    ask: ['¿A qué hora toma la levotiroxina?', '¿Lleva más de 4 semanas durmiendo mal? Derivar.', '¿Toma algún otro suplemento con calcio o hierro?'],
  },
  'vitamina-b12': {
    why: [
      { t: 'Cansancio persistente', d: 'Es el perfil que recoge su ficha, sobre todo en adultos con algo de absorción reducida por la edad.' },
      { t: 'No interacciona con la levotiroxina', d: 'A diferencia del magnesio, la B12 no reduce su absorción — pueden tomarse sin separar horarios.' },
      { t: 'Por la mañana, en ayunas', d: 'Así se recomienda su toma; además ayuda a diferenciarla de lo que se le dé para dormir.' },
    ],
    say: '«Esto es para el cansancio del día, no para el sueño. Tómelo en ayunas por la mañana, junto con lo que le demos para descansar mejor por la noche.»',
    remember: ['Por la mañana, en ayunas.', 'No sustituye al abordaje del insomnio.', 'Revisar en 4 semanas.'],
    dose: ['1 cápsula', 'Por la mañana, en ayunas', '4 semanas'],
    ask: ['¿Sigue alguna dieta vegetariana o vegana?', '¿Toma metformina o antiácidos de forma continuada?', '¿El cansancio es sobre todo por la mañana o todo el día?'],
  },
  ashwagandha: {
    why: [
      { t: 'Estrés como parte del cuadro', d: 'Su ficha la recomienda para periodos de estrés y tensión, que pueden estar detrás de un sueño poco reparador.' },
      { t: 'Ojo con la levotiroxina', d: 'Hay casos descritos de alteración de la función tiroidea asociados a su consumo — mejor no recomendarla sin que lo consulte antes con su médico.' },
      { t: 'No es la primera opción aquí', d: 'Es apoyo para el componente de estrés, no una respuesta directa al despertar de madrugada.' },
    ],
    say: '«Esto podría ayudarle con el estrés de fondo, pero como toma la pastilla del tiroides, mejor que lo consulte antes con su médico — hay algún caso descrito de que afecta a esa función.»',
    remember: ['No recomendar sin consultar con su médico si toma levotiroxina.', 'Es apoyo para el estrés, no para el insomnio en sí.', 'Por la mañana o por la noche, según tolerancia.'],
    dose: ['1 cápsula', 'Mañana o noche', 'Revisar en 4 semanas'],
    ask: ['¿Tiene diagnosticada alguna patología tiroidea además de la levotiroxina?', '¿Está embarazada o en lactancia?', '¿Toma sedantes o ansiolíticos?'],
  },
}

export function ConsejoProducto() {
  const { id } = useParams()
  const base = useBase()
  const { saveCase, notify } = useStore()
  const p = productById(id)
  if (!p) return <Navigate to={`${base}/consejo`} replace />
  const r = demoCase.results.find((x) => x.id === p.id)
  const d = detail[p.id] ?? detail['magnesio']
  const others = demoCase.results.filter((x) => x.id !== p.id)

  return (
    <Screen
      padded={false}
      toolbar={<Toolbar back={`${base}/consejo`} crumbs={[{ label: 'Consejo por síntomas', to: `${base}/consejo` }, { label: p.name }]} right={<Button onClick={saveCase}>Guardar el caso</Button>} />}
    >
      {/* En escritorio, una línea. Por debajo de 1024 px: etiqueta y «Volver» arriba y el caso debajo, en dos líneas como mucho. */}
      <div className="min-h-[38px] py-2 shrink-0 px-4 lg:px-7 bg-accent-wash border-b border-accent-line flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="label text-accent">Caso de ejemplo</span>
        <span className="text-ink-soft basis-full order-last max-lg:line-clamp-2 lg:order-none lg:basis-auto lg:flex-1 lg:min-w-0 lg:truncate">{demoCase.query} · Mujer 52 años · Toma levotiroxina</span>
        <Link to={`${base}/consejo`} className={`${tactilSm} ml-auto font-medium text-accent`}>Volver a los {demoCase.results.length} resultados</Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-4 pt-4 pb-4 lg:px-7 lg:pt-6 lg:pb-7">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ProductArt art={p.art} photo={p.photo} size={44} className="h-[76px] w-[76px] rounded-xl border border-line" />
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="label text-accent">{p.categoryLabel}</span>
              <h1 className="text-h1 font-semibold tracking-tight text-ink mt-1">{p.name}</h1>
              <span className="text-base text-muted mt-1">{[p.format, p.cn && `CN ${p.cn}`, `PVP ${euro(p.pvp)}`].filter(Boolean).join(' · ')}</span>
            </div>
            <div className="flex flex-col items-center gap-1"><ScoreCircle score={r?.score ?? 80} size={52} /><span className="label-faint">Encaje</span></div>
          </div>

          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-9 px-4 bg-chrome border-b border-line flex items-center"><span className="label">Por qué encaja con este caso</span></div>
            {d.why.map((w, i) => (
              <div key={`${i}-${w.t}`} className={cn('px-4 py-3.5 flex gap-3', i < d.why.length - 1 && 'border-b border-line-soft')}>
                <span className="h-5 w-5 rounded-full bg-ok-wash text-ok inline-flex items-center justify-center shrink-0 mt-px"><Check size={11} strokeWidth={3} /></span>
                <div className="flex flex-col"><span className="text-base font-semibold text-ink">{w.t}</span><span className="text-sm text-muted mt-[3px] leading-4">{w.d}</span></div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-[#7B3A24] text-on-accent p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="label text-on-accent-soft">Qué decirle en el mostrador</span>
              <button onClick={() => { navigator.clipboard?.writeText(d.say); notify('Copiado') }} className={`${tactilSm} text-sm font-semibold hover:underline`}>Copiar</button>
            </div>
            <p className="mt-3.5 text-[17px] leading-[26px] font-medium">{d.say}</p>
          </div>

          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-9 px-4 bg-chrome border-b border-line flex items-center"><span className="label">Y además, recuérdale</span></div>
            {d.remember.map((t, i) => (
              <div key={`${i}-${t}`} className={cn('h-[43px] px-4 flex items-center gap-4', i < d.remember.length - 1 && 'border-b border-line-soft')}>
                <span className="w-4 text-sm text-faint">{i + 1}</span><span className="text-base text-ink">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="w-full lg:w-[300px] lg:shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-9 px-4 bg-chrome border-b border-line flex items-center"><span className="label">Pauta sugerida</span></div>
            {[['Dosis', d.dose[0]], ['Cuándo', d.dose[1]], ['Duración', d.dose[2]]].map(([k, v], i) => (
              <div key={k} className={cn('h-[42px] px-4 flex items-center gap-3', i < 2 && 'border-b border-line-soft')}><span className="w-[72px] text-sm text-muted">{k}</span><span className="text-base font-medium text-ink">{v}</span></div>
            ))}
          </div>
          <div className="rounded-xl bg-warn-wash border border-warn-line p-4 flex flex-col">
            <span className="label text-warn">Antes de dispensar, pregunta</span>
            <ul className="mt-3 flex flex-col gap-2.5">
              {d.ask.map((a, i) => (<li key={`${i}-${a}`} className="flex gap-2 text-sm leading-4 text-[#5C4512]"><span className="mt-[6px] h-1 w-1 rounded-full bg-warn shrink-0" />{a}</li>))}
            </ul>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col">
            <div className="h-9 px-4 bg-chrome border-b border-line flex items-center"><span className="label">Otras opciones del caso</span></div>
            {others.map((o) => {
              const op = productById(o.id)!
              return (
                <Link key={o.id} to={`${base}/consejo/${o.id}`} className="h-[54px] px-4 flex items-center gap-3 border-b border-line-soft hover:bg-canvas">
                  <ScoreCircle score={o.score} size={28} />
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{op.name}</span><span className="text-xs text-accent-deep truncate">{o.badges[0].label}</span></span>
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
