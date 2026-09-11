import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { Check, ChevronRight, Download, ExternalLink, Lock, Play } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { courseById, type Lesson } from '@/data/courses'
import { Toolbar, Section } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Bar } from '@/ui/Table'
import { FileBadge } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'

export function LessonIcon({ state }: { state: Lesson['state'] }) {
  const cls = 'h-6 w-6 rounded-full inline-flex items-center justify-center shrink-0'
  if (state === 'done') return <span className={cn(cls, 'bg-ok-wash text-ok')}><Check size={11} strokeWidth={3} /></span>
  if (state === 'current') return <span className={cn(cls, 'bg-accent text-on-accent')}><Play size={9} fill="currentColor" /></span>
  if (state === 'locked') return <span className={cn(cls, 'bg-surface border border-line text-faint')}><Lock size={10} /></span>
  return <span className={cn(cls, 'bg-surface border border-line text-faint')}><ChevronRight size={11} /></span>
}

export function Curso() {
  const { id } = useParams()
  const base = useBase()
  const navigate = useNavigate()
  const { notify } = useStore()
  const c = courseById(id)
  if (!c) return <Navigate to={`${base}/formacion/cursos`} replace />
  const done = c.lessons.filter((l) => l.state === 'done').length
  const current = c.lessons.find((l) => l.state === 'current') ?? c.lessons.find((l) => l.state === 'todo') ?? c.lessons[0]

  return (
    <Screen
      toolbar={<Toolbar back={`${base}/formacion/cursos`} crumbs={[{ label: 'Cursos', to: `${base}/formacion/cursos` }, { label: c.title.length > 32 ? c.title.slice(0, 30) + '…' : c.title }]} right={<Button onClick={() => notify('Enlace copiado para tu equipo')}>Compartir con el equipo</Button>} />}
    >
      <div className="flex gap-5">
        <img src={c.cover} alt="" className="w-[216px] h-[140px] rounded-xl object-cover shrink-0 bg-chrome-deep" />
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="label text-accent">Itinerario {c.itinerary}</span>
          <h1 className="mt-1.5 text-h1 font-semibold tracking-tight text-ink">{c.title}</h1>
          <p className="mt-2 text-base text-muted leading-[19px] max-w-[620px]">{c.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <Link to={`${base}/formacion/cursos/${c.id}/leccion/${current.n}`}>
              <Button variant="primary" size="lg" className="h-9 px-4" icon={<Play size={11} fill="currentColor" />}>{done > 0 && done < c.lessons.length ? `Seguir por la lección ${current.n}` : done === c.lessons.length ? 'Repasar el curso' : 'Empezar el curso'}</Button>
            </Link>
            <Bar value={(done / c.lessons.length) * 100} width={120} tone={done === c.lessons.length ? 'ok' : 'accent'} />
            <span className="text-sm text-ink-soft">{done} de {c.lessons.length} lecciones</span>
            <span className="text-sm text-faint">{c.minutes} min · {c.certificate ? 'certificado al terminar' : 'sin certificado'}</span>
          </div>
        </div>
      </div>

      <Section title="Temario">
        <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
          {c.lessons.map((l, i) => (
            <button
              key={l.n}
              onClick={() => l.state !== 'locked' ? navigate(`${base}/formacion/cursos/${c.id}/leccion/${l.n}`) : notify('Se desbloquea al terminar las lecciones anteriores')}
              className={cn('w-full h-14 px-4 flex items-center gap-3.5 text-left', i < c.lessons.length - 1 && 'border-b border-line-soft', l.state === 'current' ? 'bg-accent-wash' : 'hover:bg-canvas')}
            >
              <LessonIcon state={l.state} />
              <span className="flex-1 min-w-0 flex flex-col">
                <span className="text-base font-medium text-ink">{l.n} · {l.title}</span>
                <span className="text-xs text-faint mt-[2px]">{l.meta}</span>
              </span>
              <span className="text-sm text-muted">{l.minutes} min</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Material del curso">
        <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
          {c.materials.map((m, i) => (
            <button key={m.name} onClick={() => notify(m.kind === 'URL' ? 'Abriendo el enlace…' : `Descargando ${m.name}`)} className={cn('w-full h-[46px] px-4 flex items-center gap-3 text-left hover:bg-canvas', i < c.materials.length - 1 && 'border-b border-line-soft')}>
              <FileBadge kind={m.kind} />
              <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{m.name}</span><span className="text-xs text-faint">{m.meta}</span></span>
              {m.kind === 'URL' ? <ExternalLink size={14} className="text-muted" /> : <Download size={14} className="text-muted" />}
            </button>
          ))}
        </div>
      </Section>
    </Screen>
  )
}
