import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { Download, Maximize2, Play } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { PENDIENTE, useBase, useStore } from '@/app/store'
import { courseById } from '@/data/courses'
import { Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { FileBadge } from '@/ui/ProductArt'
import { LessonIcon } from './Curso'
import { cn } from '@/lib/cn'
import { tactilBase } from '@/ui/tactil'

export function Clase() {
  const { id, n } = useParams()
  const base = useBase()
  const navigate = useNavigate()
  const { notify } = useStore()
  const c = courseById(id)
  const [playing, setPlaying] = useState(false)
  if (!c) return <Navigate to={`${base}/formacion/cursos`} replace />
  const idx = Math.max(0, c.lessons.findIndex((l) => l.n === Number(n)))
  const lesson = c.lessons[idx] ?? c.lessons[0]
  const next = c.lessons[idx + 1]
  const done = c.lessons.filter((l) => l.state === 'done').length
  const files = lesson.files ?? c.materials.slice(0, 2).map((m) => ({ kind: m.kind === 'URL' ? ('PDF' as const) : m.kind, name: m.name, meta: m.meta }))
  const courseTo = `${base}/formacion/cursos/${c.id}`

  return (
    <Screen toolbar={<Toolbar back={courseTo} crumbs={[{ label: c.title.length > 28 ? c.title.slice(0, 26) + '…' : c.title, to: courseTo }, { label: `Lección ${lesson.n} · ${lesson.title}` }]} right={<Button onClick={() => { void navigator.clipboard?.writeText(window.location.href).then(() => notify('Enlace copiado'), () => notify('No se ha podido copiar el enlace', 'aviso')) }}>Copiar el enlace</Button>} />}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Caja de vídeo 16:9 en el móvil y la tableta; en escritorio, el alto fijo de siempre. */}
          <div className="relative rounded-xl bg-video aspect-video lg:aspect-auto lg:h-[366px] overflow-hidden flex items-center justify-center">
            {lesson.type === 'text' ? (
              <div className="px-6 lg:px-12 text-center text-[#CFCAC2] text-base leading-6 max-w-[560px]">Esta lección es de lectura. Abajo tienes el texto y los archivos que la acompañan.</div>
            ) : (
              <button onClick={() => setPlaying((p) => !p)} className="h-[60px] w-[60px] rounded-full bg-[#F3E2D9] text-accent inline-flex items-center justify-center shadow-pop hover:scale-105 transition-transform">
                {playing ? <span className="flex gap-1"><span className="w-[4px] h-4 bg-accent rounded-sm" /><span className="w-[4px] h-4 bg-accent rounded-sm" /></span> : <Play size={18} fill="currentColor" className="ml-1" />}
              </button>
            )}
            <div className="absolute left-0 right-0 bottom-0 px-6 pb-5 flex flex-col gap-3">
              <div className="h-[3px] rounded-full bg-white/15 overflow-hidden"><span className={cn('block h-full bg-accent transition-all duration-[3000ms]', playing ? 'w-[52%]' : 'w-[34%]')} /></div>
              <div className="flex items-center gap-4 text-[#E9E5DE] text-sm">
                <Play size={12} fill="currentColor" /><span>{playing ? '7:18' : '4:47'} / 14:02</span>
                <span className="ml-auto font-medium">1×</span><span className="font-semibold">CC</span><Maximize2 size={13} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="flex flex-col">
              <span className="label text-accent">Lección {lesson.n} de {c.lessons.length} · {lesson.minutes} min</span>
              <h1 className="mt-1.5 text-title font-semibold tracking-tight text-ink">{lesson.title}</h1>
              <p className="mt-2 text-base text-muted leading-[19px] max-w-[660px]">{lesson.summary ?? lesson.meta}</p>
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Archivos de esta clase</h2>
            <button onClick={() => notify(PENDIENTE, 'aviso')} className={`${tactilBase} text-base font-medium text-accent`}>Descargar todo</button>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {files.map((f, i) => (
              <button key={`${i}-${f.name}`} onClick={() => notify(PENDIENTE, 'aviso')} className="rounded-xl bg-surface border border-line shadow-card p-3.5 flex items-center gap-3 text-left hover:border-faint">
                <FileBadge kind={f.kind} />
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink leading-[17px]">{f.name}</span><span className="text-xs text-faint mt-[2px]">{f.meta}</span></span>
                <Download size={14} className="text-muted shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <aside className="w-full lg:w-[300px] lg:shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-ink">Lecciones del curso</h2><span className="text-sm text-muted">{done} de {c.lessons.length}</span></div>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden -mt-1">
            {c.lessons.map((l, i) => (
              <Link key={l.n} to={`${courseTo}/leccion/${l.n}`} className={cn('min-h-[50px] py-2 px-3.5 flex items-center gap-3 text-left', i < c.lessons.length - 1 && 'border-b border-line-soft', l.n === lesson.n ? 'bg-accent-wash' : 'hover:bg-canvas')}>
                <LessonIcon state={l.n === lesson.n ? 'current' : l.state} />
                {/* El título en dos líneas como mucho: en una sola se cortaban casi todos (también en la columna de escritorio). */}
                <span className="flex-1 min-w-0 text-base text-ink line-clamp-2">{l.title}</span>
                <span className="text-xs text-faint shrink-0 whitespace-nowrap">{l.minutes} min</span>
              </Link>
            ))}
          </div>
          {next && (
            <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col">
              <span className="label-faint">Siguiente</span>
              <span className="mt-1.5 text-base font-semibold text-ink">{next.title}</span>
              <Button variant="primary" className="mt-3.5 w-full h-8" onClick={() => navigate(`${courseTo}/leccion/${next.n}`)}>Ir a la siguiente</Button>
            </div>
          )}
          {!next && (
            <div className="rounded-xl bg-ok-wash border border-[#CBD9CC] p-4 flex flex-col">
              <span className="text-base font-semibold text-ok">Última lección</span>
              <span className="text-sm text-ok/80 mt-1">Todavía no se guarda tu progreso ni se emiten certificados desde la app.</span>
              <Button variant="primary" className="mt-3.5 w-full h-8" onClick={() => navigate(courseTo)}>Volver al curso</Button>
            </div>
          )}
        </aside>
      </div>
    </Screen>
  )
}
