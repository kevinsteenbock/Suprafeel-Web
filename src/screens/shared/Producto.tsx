import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router'
import { Bookmark, ChevronRight, GraduationCap, Presentation } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { productById, euro } from '@/data/products'
import { courseById } from '@/data/courses'
import { Toolbar, KeyValue, Notice } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { ProductArt } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'

const tabs = ['Composición', 'Modo de empleo', 'Advertencias', 'Evidencia']

export function Producto() {
  const { id } = useParams()
  const base = useBase()
  const { miLista, toggleLista } = useStore()
  const p = productById(id)
  const [tab, setTab] = useState(tabs[0])
  const [img, setImg] = useState(0)
  if (!p) return <Navigate to={`${base}/catalogo`} replace />
  const saved = miLista.includes(p.id)
  const course = courseById(p.courseId)
  const isComercial = base === '/comercial'

  return (
    <Screen
      toolbar={
        <Toolbar
          back={`${base}/catalogo`}
          crumbs={[{ label: 'Catálogo', to: `${base}/catalogo` }, { label: p.name }]}
          right={<Button variant={saved ? 'soft' : 'secondary'} icon={<Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />} onClick={() => toggleLista(p.id)}>{saved ? 'En Mi lista' : 'Guardar en Mi lista'}</Button>}
        />
      }
    >
      <div className="flex gap-8">
        {/* Columna imagen */}
        <div className="w-[336px] shrink-0 flex flex-col gap-4">
          <ProductArt art={p.art} size={img === 0 ? 180 : 140} className="h-[330px] rounded-xl border border-line" />
          <div className="grid grid-cols-4 gap-2.5">
            {['', 'DORSAL', 'LINEAL', '+2'].map((t, i) => (
              <button key={i} onClick={() => setImg(i)} className={cn('h-16 rounded-lg bg-chrome border flex items-center justify-center text-[10px] font-semibold tracking-[0.08em] text-faint', img === i ? 'border-accent ring-[3px] ring-accent-wash' : 'border-line')}>
                {i === 0 ? <ProductArt art={p.art} size={26} bg={false} /> : t}
              </button>
            ))}
          </div>
          <KeyValue labelWidth={104} rows={[{ k: 'Formato', v: p.packaging }, { k: 'Alérgenos', v: p.allergens }, { k: 'Apto para', v: p.suitable }, { k: 'Registro sanitario', v: p.registry }]} />
        </div>

        {/* Columna ficha */}
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="label text-accent">{p.categoryLabel}{p.tag ? ` · ${p.tag}` : ''}</span>
          <h1 className="mt-2 text-display font-semibold tracking-tight text-ink">{p.name}</h1>
          <p className="mt-2 text-base text-muted">{p.format} · CN {p.cn} · EAN {p.ean}</p>

          <div className="mt-5 rounded-xl bg-surface border border-line flex divide-x divide-line-soft">
            <div className="flex-1 px-4 py-4 flex flex-col"><span className="label">PVP recomendado</span><span className="mt-2 text-h1 font-semibold tracking-tight leading-8">{euro(p.pvp)}</span></div>
            <div className="flex-1 px-4 py-4 flex flex-col"><span className="label">{isComercial ? 'Margen para la farmacia' : 'Margen orientativo'}</span><span className="mt-2 text-h1 font-semibold tracking-tight leading-8">{p.margin} %</span></div>
            <div className="flex-[1.3] px-4 py-4 flex flex-col"><span className="label">Disponibilidad</span><span className="mt-2 text-base font-semibold text-ink">En almacén central</span><span className="text-xs text-muted mt-[3px]">{isComercial ? 'La farmacia lo pide por su canal habitual' : 'Pídelo por tu canal habitual'}</span></div>
          </div>

          <nav className="mt-5 flex gap-5 border-b border-line">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn('h-9 text-base font-medium border-b-2 -mb-px', tab === t ? 'text-ink border-accent font-semibold' : 'text-muted border-transparent hover:text-ink')}>{t}</button>
            ))}
          </nav>

          {tab === 'Composición' && (
            <div className="mt-4 rounded-xl bg-surface border border-line overflow-hidden">
              <div className="h-8 px-[14px] bg-chrome border-b border-line flex items-center"><span className="label flex-1">Por {p.dose.match(/^\d+ \w+/)?.[0] ?? '1 toma'}</span><span className="label w-[110px] text-right">Cantidad</span><span className="label w-[70px] text-right">% VRN</span></div>
              {p.composition.map((c, i) => (
                <div key={c.name} className={cn('h-[38px] px-[14px] flex items-center', i < p.composition.length - 1 && 'border-b border-line-soft')}>
                  <span className="flex-1 text-base text-ink">{c.name}</span>
                  <span className="w-[110px] text-right text-base font-semibold text-ink">{c.qty}</span>
                  <span className="w-[70px] text-right text-base text-muted">{c.vrn}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'Modo de empleo' && (
            <KeyValue className="mt-4" rows={[{ k: 'Pauta', v: p.dose }, { k: 'Duración', v: '4 semanas y revisar' }, { k: 'Con o sin comida', v: p.dose.includes('ayunas') ? 'En ayunas' : 'Con comida' }]} />
          )}
          {tab === 'Advertencias' && (
            <div className="mt-4 flex flex-col gap-2.5">
              <Notice tone="warn" icon={<span className="text-warn font-bold">!</span>}>{p.warning ?? 'Sin interacciones relevantes descritas. Embarazo y lactancia: consultar.'}</Notice>
              <Notice tone="neutral">No superar la dosis diaria recomendada. Los complementos alimenticios no sustituyen una dieta variada.</Notice>
            </div>
          )}
          {tab === 'Evidencia' && (
            <KeyValue className="mt-4" labelWidth={70} rows={[{ k: '2024', v: 'Revisión sistemática · 12 ensayos · efecto moderado', right: <span className="text-sm font-medium text-accent">PubMed</span> }, { k: '2022', v: 'Ensayo doble ciego · 8 semanas · n = 214', right: <span className="text-sm font-medium text-accent">DOI</span> }]} />
          )}

          <span className="label mt-6">Se recomienda cuando el cliente cuenta</span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {p.symptoms.map((s) => (
              <Link key={s} to={`${base}/consejo`} className="h-[27px] rounded-full bg-accent-wash text-accent-deep text-md font-medium px-[13px] inline-flex items-center hover:bg-accent-line">{s}</Link>
            ))}
          </div>

          {p.warning && <Notice className="mt-4" tone="warn" icon={<span className="text-warn font-bold text-base">!</span>}>{p.warning}</Notice>}

          <div className="mt-6 grid grid-cols-2 gap-4">
            {course ? (
              <Link to={`${base}/formacion/cursos/${course.id}`} className="rounded-xl bg-chrome border border-line px-4 py-4 flex items-center gap-3 hover:bg-chrome-deep/60">
                <span className="h-8 w-8 rounded-full bg-accent-wash text-accent-deep inline-flex items-center justify-center"><GraduationCap size={15} /></span>
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">Curso: {course.title.replace('Cómo recomendar magnesio en el mostrador', 'cómo recomendar magnesio')}</span><span className="text-xs text-muted">{course.lessons.length} lecciones · {course.minutes} min · vas por la 3</span></span>
                <ChevronRight size={14} className="text-faint" />
              </Link>
            ) : <div />}
            <Link to={`${base}/plv/otono`} className="rounded-xl bg-chrome border border-line px-4 py-4 flex items-center gap-3 hover:bg-chrome-deep/60">
              <span className="h-8 w-8 rounded-full bg-chrome-deep text-ink-soft inline-flex items-center justify-center"><Presentation size={15} /></span>
              <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">Material PLV disponible</span><span className="text-xs text-muted">{p.plv ?? 'Cartel de campaña y folleto'}</span></span>
              <ChevronRight size={14} className="text-faint" />
            </Link>
          </div>
        </div>
      </div>
    </Screen>
  )
}
