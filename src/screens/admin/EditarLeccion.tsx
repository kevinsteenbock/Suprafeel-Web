import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Settings, Play, Plus, X, ChevronRight, Upload } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { adminCourses, courseById } from '@/data/courses'
import { Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Field, Input, Textarea } from '@/ui/Field'
import { Toggle } from '@/ui/Toggle'
import { FileBadge } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'

export function EditarLeccion() {
  const { id, n } = useParams()
  const navigate = useNavigate()
  const { notify } = useStore()
  const course = adminCourses.find((c) => c.id === id)
  const real = courseById(id)
  const lesson = real?.lessons.find((l) => l.n === Number(n))
  const [title, setTitle] = useState(lesson?.title ?? (n === '1' ? 'Por qué falta vitamina D aquí también' : n === '2' ? 'A quién conviene suplementar y a quién no' : n === '3' ? 'D3 o D2, y por qué con K2' : 'K2: por qué acompaña a la D3'))
  const [text, setText] = useState(lesson?.summary ?? 'Que en España hay déficit aunque haya sol, por qué la síntesis cae de octubre a marzo y qué perfiles conviene revisar aunque no lo pidan.')
  const [files, setFiles] = useState([{ k: 'PDF' as const, n: 'Mapa de déficit por latitud', m: 'PDF · 620 KB' }, { k: 'A5' as const, n: 'Chuleta de mostrador', m: 'Imprimible A5 · 180 KB' }])
  const [gear, setGear] = useState(false)
  const [s, setS] = useState({ oblig: true, skip: false, download: true })
  const [blocks, setBlocks] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (!gear) return; const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setGear(false); window.addEventListener('mousedown', h); return () => window.removeEventListener('mousedown', h) }, [gear])
  const back = `/admin/cursos/${id}`
  const courseTitle = course?.title ?? real?.title ?? 'Vitamina D'

  return (
    <Screen
      toolbar={
        <Toolbar back={back} crumbs={[{ label: courseTitle.split(':')[0], to: back }, { label: `Lección ${n} · ${title}` }]}
          meta={<><Badge tone="accent" className="ml-1">Vídeo</Badge><span className="text-sm text-muted">Guardado hace 4 s</span></>}
          right={
            <>
              <Link to={real ? `/farmacia/formacion/cursos/${real.id}/leccion/${n}` : '/farmacia/formacion/cursos'}><Button>Vista previa</Button></Link>
              <Button variant="primary" onClick={() => { notify('Lección guardada'); navigate(back) }}>Hecho</Button>
              <div ref={ref} className="relative">
                <button onClick={() => setGear((g) => !g)} className={cn('h-7 w-7 rounded-[7px] border border-line inline-flex items-center justify-center text-ink', gear ? 'bg-chrome-deep' : 'bg-chrome-deep/60 hover:bg-chrome-deep')}><Settings size={14} strokeWidth={1.7} /></button>
                {gear && (
                  <div className="absolute right-0 top-9 z-40 w-[304px] rounded-lg bg-surface border border-line shadow-pop py-1.5">
                    <div className="px-3.5 h-6 flex items-center label-faint">Ajustes de la lección</div>
                    <div className="px-3.5 h-[42px] flex items-center justify-between"><div className="flex flex-col"><span className="text-base text-ink">Duración</span><span className="text-xs text-faint">Se calcula del vídeo</span></div><span className="text-base text-muted">6 min</span></div>
                    {[['oblig', 'Obligatoria', 'Hay que verla entera para avanzar'], ['skip', 'Se puede adelantar', 'Solo la primera vez'], ['download', 'Descargar los archivos', 'Farmacias y comerciales']].map(([k, t, h]) => (
                      <div key={k} className="px-3.5 h-[42px] flex items-center justify-between"><div className="flex flex-col"><span className="text-base text-ink">{t}</span><span className="text-xs text-faint">{h}</span></div><Toggle size="sm" on={s[k as keyof typeof s]} onChange={(v) => setS({ ...s, [k]: v })} /></div>
                    ))}
                    <div className="h-px bg-line-soft my-1.5" />
                    {[['Duplicar lección', '⌘D'], ['Mover a otro curso…', '›'], ['Descargar el vídeo original', '']].map(([t, r]) => <button key={t} onClick={() => { setGear(false); notify(t) }} className="w-full h-8 px-3.5 flex items-center justify-between text-base text-ink hover:bg-chrome">{t}<span className="text-xs text-faint">{r}</span></button>)}
                    <div className="h-px bg-line-soft my-1.5" />
                    <button onClick={() => { setGear(false); notify('Lección eliminada'); navigate(back) }} className="w-full h-8 px-3.5 flex items-center text-base text-danger hover:bg-danger-wash">Eliminar lección</button>
                  </div>
                )}
              </div>
            </>
          }
        />
      }
    >
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="relative h-[300px] rounded-xl bg-video flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2">{['Cambiar vídeo', 'Portada del vídeo'].map((t) => <button key={t} onClick={() => notify(t)} className="h-8 px-3 rounded-[7px] bg-white/10 text-[#F4F2EF] text-sm font-medium hover:bg-white/15">{t}</button>)}</div>
            <span className="h-[60px] w-[60px] rounded-full bg-[#F3E2D9] text-accent inline-flex items-center justify-center"><Play size={18} fill="currentColor" className="ml-1" /></span>
            <span className="mt-6 text-base text-[#CFCAC2]">vitamina-d-leccion-{n}.mp4 · 6:12 · 1080p · 214 MB</span>
          </div>
          <Field label="Título de la lección" required><Input value={title} onChange={setTitle} className="h-9" /></Field>
          <Field label="Qué se lleva el farmacéutico" right={<span className="text-xs text-faint">Se muestra bajo el vídeo</span>}><Textarea rows={7} value={text} onChange={setText} /></Field>
          {blocks.map((b, i) => <div key={i} className="rounded-xl bg-surface border border-line p-4 flex items-center justify-between"><span className="text-base text-ink">Bloque nuevo · {b}</span><button onClick={() => setBlocks((bs) => bs.filter((_, j) => j !== i))} className="text-faint hover:text-ink"><X size={14} /></button></div>)}
          <div className="h-[46px] rounded-lg bg-chrome border border-line px-3 flex items-center gap-2">
            <span className="text-sm text-muted mr-1">Añadir a esta lección</span>
            {['Otro vídeo', 'Texto', 'Imagen', 'Archivo'].map((b) => <Button key={b} size="md" icon={<Plus size={11} strokeWidth={2.4} />} onClick={() => { if (b === 'Archivo') { setFiles((fs) => [...fs, { k: 'PDF', n: 'Nuevo archivo', m: 'PDF · 0 KB' }]); notify('Archivo adjuntado') } else { setBlocks((bs) => [...bs, b]); notify(`Bloque de ${b.toLowerCase()} añadido`) } }}>{b}</Button>)}
          </div>
        </div>
        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-[34px] px-3.5 bg-chrome border-b border-line-soft flex items-center justify-between"><span className="label">Archivos de la lección</span><button onClick={() => { setFiles((fs) => [...fs, { k: 'PDF', n: 'Ficha de interacciones', m: 'PDF · 260 KB' }]); notify('Archivo adjuntado') }} className="text-sm font-medium text-accent">Añadir</button></div>
            {files.map((f, i) => <div key={f.n + i} className={cn('h-[50px] px-3.5 flex items-center gap-3', i < files.length - 1 && 'border-b border-line-soft')}><FileBadge kind={f.k} /><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{f.n}</span><span className="text-xs text-faint">{f.m}</span></span><button onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} className="text-faint hover:text-ink"><X size={13} /></button></div>)}
          </div>
          <button onClick={() => { setFiles((fs) => [...fs, { k: 'A5', n: 'Cartel A5 arrastrado', m: 'Imprimible A5 · 210 KB' }]); notify('Archivo adjuntado') }} className="h-[104px] rounded-lg border border-dashed border-line bg-chrome flex flex-col items-center justify-center hover:bg-chrome-deep/50"><Upload size={18} className="text-faint" /><span className="mt-2 text-md font-medium text-ink-soft">Arrastra archivos aquí</span><span className="text-xs text-faint mt-0.5">PDF, imagen o ficha imprimible · máx. 25 MB</span></button>
          <Link to={back} className="mt-auto h-10 rounded-lg bg-surface border border-line px-3.5 flex items-center justify-between text-base text-ink hover:bg-chrome">Volver al temario <ChevronRight size={14} className="text-faint" /></Link>
        </aside>
      </div>
    </Screen>
  )
}
