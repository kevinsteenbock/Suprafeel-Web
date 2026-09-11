import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { GripVertical, ChevronRight, Play, AlignLeft, Image as ImageIcon, Plus, Check, Search, Upload, FileText, X } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { adminCourses, courseById } from '@/data/courses'
import { Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Drawer } from '@/ui/Drawer'
import { Field, Input, Select, Textarea } from '@/ui/Field'
import { Avatar } from '@/ui/Avatar'
import { FileBadge } from '@/ui/ProductArt'
import { cn } from '@/lib/cn'

interface L { n: number; title: string; meta: string; minutes: string; type: 'video' | 'text'; processing?: number }

const defaultLessons: L[] = [
  { n: 1, title: 'Por qué falta vitamina D aquí también', meta: 'Vídeo · 6 min · sin archivos adjuntos', minutes: '6 min', type: 'video' },
  { n: 2, title: 'A quién conviene suplementar y a quién no', meta: 'Vídeo · 8 min · 1 PDF adjunto', minutes: '8 min', type: 'video' },
  { n: 3, title: 'D3 o D2, y por qué con K2', meta: 'Texto · 4 min de lectura · sin adjuntos', minutes: '4 min', type: 'text' },
]

export function CrearCurso() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useStore()
  const existing = id ? adminCourses.find((c) => c.id === id) : undefined
  const real = courseById(id)
  const [title, setTitle] = useState(existing?.title ?? 'Vitamina D: la pregunta de cada invierno')
  const [lessons, setLessons] = useState<L[]>(real ? real.lessons.map((l) => ({ n: l.n, title: l.title, meta: l.meta, minutes: `${l.minutes} min`, type: l.type === 'text' ? 'text' : 'video' })) : existing && existing.lessons === 0 ? [] : defaultLessons)
  const [cover, setCover] = useState(!!real)
  const [panel, setPanel] = useState<null | 'nueva' | 'subiendo' | 'biblioteca'>(null)
  const [fromLibrary, setFromLibrary] = useState<string | null>(null)
  const [saved, setSaved] = useState('Guardado hace 12 s')
  const [published, setPublished] = useState(existing?.state === 'Publicado')
  const [toast, setToast] = useState<L | null>(null)
  const courseId = id ?? 'nuevo'

  useEffect(() => {
    const p = lessons.find((l) => l.processing !== undefined && l.processing < 100)
    if (!p) return
    const t = window.setTimeout(() => setLessons((ls) => ls.map((l) => (l.n === p.n ? { ...l, processing: Math.min(100, (l.processing ?? 0) + 9) } : l))), 500)
    return () => window.clearTimeout(t)
  }, [lessons])

  const addLesson = (t: string, video: boolean) => {
    const n = lessons.length + 1
    const nl: L = { n, title: t || 'Lección sin título', meta: video ? 'Vídeo · 7:12 · 2 archivos adjuntos' : 'Texto · 3 min de lectura', minutes: video ? '7:12' : '3 min', type: video ? 'video' : 'text', processing: video ? 68 : undefined }
    setLessons((ls) => [...ls, nl])
    setToast(nl)
    setSaved('Guardado ahora')
    window.setTimeout(() => setToast(null), 4000)
  }
  const undo = () => { if (toast) setLessons((ls) => ls.filter((l) => l.n !== toast.n)); setToast(null) }
  const checks = [['Título e itinerario', !!title], [`${lessons.length} lecciones con contenido`, lessons.length > 0], ['Portada del curso', cover]] as const
  const ready = checks.every((c) => c[1])

  return (
    <Screen
      toolbar={
        <Toolbar back="/admin/cursos" crumbs={[{ label: 'Cursos', to: '/admin/cursos' }, { label: existing ? existing.title.slice(0, 34) + (existing.title.length > 34 ? '…' : '') : 'Nuevo curso' }]}
          meta={<><Badge tone={published ? 'ok' : 'warn'} className="ml-1">{published ? 'Publicado' : 'Borrador'}</Badge><span className="text-sm text-muted">{saved}</span></>}
          right={<><Link to={real ? `/farmacia/formacion/cursos/${real.id}` : '/farmacia/formacion/cursos'}><Button>Vista previa</Button></Link><Button variant="primary" disabled={!ready && !published} onClick={() => { setPublished(true); notify(ready ? 'Curso publicado · lo ven 412 farmacias y 6 comerciales' : 'Falta la portada para publicar') }}>{published ? 'Publicado' : 'Publicar'}</Button></>}
        />
      }
    >
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex gap-4">
            <button onClick={() => { setCover(true); notify('Portada subida') }} className={cn('h-[106px] w-[168px] shrink-0 rounded-xl border flex flex-col items-center justify-center gap-2', cover ? 'border-line overflow-hidden' : 'border-dashed border-line bg-chrome hover:bg-chrome-deep/50')}>
              {cover && real ? <img src={real.cover} alt="" className="h-full w-full object-cover" /> : cover ? <span className="text-sm text-ok font-medium inline-flex items-center gap-1"><Check size={12} /> Portada subida</span> : <><ImageIcon size={18} className="text-muted" /><span className="text-sm text-ink-soft">Portada del curso</span></>}
            </button>
            <Field className="flex-1" label="Título del curso" required hint={<span className="flex justify-between"><span>Aparece en la tarjeta del curso y en el buscador.</span><span>{title.length} / 70</span></span>}>
              <Input value={title} onChange={(v) => { setTitle(v); setSaved('Guardando…'); window.setTimeout(() => setSaved('Guardado ahora'), 600) }} focus className="h-[38px] text-lg" />
            </Field>
          </div>

          <div className="mt-7 flex items-center justify-between"><h2 className="text-lg font-semibold text-ink">Lecciones</h2><span className="text-sm text-faint">Arrastra para reordenar</span></div>
          <div className="mt-3 flex-1 rounded-xl bg-surface border border-line shadow-card flex flex-col min-h-[420px]">
            {lessons.length === 0 && <div className="flex-1 flex flex-col items-center justify-center text-center px-10 text-muted"><span className="text-base font-medium text-ink">Este curso aún no tiene lecciones</span><span className="text-sm mt-1">Añade la primera abajo: puede llevar vídeo, texto y archivos a la vez.</span></div>}
            {lessons.map((l) => (
              <button key={l.n} onClick={() => navigate(`/admin/cursos/${courseId}/leccion/${l.n}`)} className={cn('h-[58px] px-3.5 flex items-center gap-3 text-left border-b border-line-soft hover:bg-canvas', l.processing !== undefined && l.processing < 100 && 'bg-accent-wash border-accent-line')}>
                <GripVertical size={14} className="text-faint" />
                <span className={cn('h-7 w-7 rounded-[7px] inline-flex items-center justify-center shrink-0', l.type === 'video' ? 'bg-accent-wash text-accent' : 'bg-chrome-deep text-ink-soft')}>{l.type === 'video' ? <Play size={11} fill="currentColor" /> : <AlignLeft size={12} />}</span>
                <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                  <span className="text-md font-medium text-ink truncate">{l.n} · {l.title}</span>
                  {l.processing !== undefined && l.processing < 100 ? (<><span className="h-1 rounded-full bg-accent-line overflow-hidden"><span style={{ width: `${l.processing}%` }} className="block h-full bg-accent transition-all" /></span><span className="text-xs text-accent-deep">Procesando el vídeo · {l.processing} % · quedan {Math.max(2, Math.round((100 - l.processing) * 1.2))} s</span></>) : <span className="text-xs text-faint">{l.meta}</span>}
                </span>
                <span className="text-sm text-muted w-[46px] text-right">{l.minutes}</span>
                <ChevronRight size={14} className="text-faint" />
              </button>
            ))}
            <div className="mt-auto h-[54px] px-3.5 flex items-center justify-between">
              <Button variant="soft" icon={<Plus size={12} strokeWidth={2.5} />} onClick={() => setPanel('nueva')}>Añadir lección</Button>
              <span className="text-sm text-faint">O arrastra aquí un vídeo o un PDF y te creamos la lección</span>
            </div>
          </div>
        </div>

        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <div className="h-[34px] px-4 bg-chrome border-b border-line-soft flex items-center"><span className="label">Publicación</span></div>
            <div className="px-4 py-3.5 border-b border-line-soft flex flex-col gap-1.5"><span className="text-sm text-ink-soft">Itinerario</span><Select value={existing?.itinerary === 'Vitaminas' || !existing ? 'Vitaminas y minerales' : existing.itinerary} /></div>
            <div className="px-4 py-3.5 border-b border-line-soft flex flex-col gap-1.5"><span className="text-sm text-ink-soft">Quién lo ve</span><Select value="Farmacias y comerciales" /></div>
          </div>
          <div className="rounded-xl bg-surface border border-line shadow-card px-4 py-3.5 flex items-center gap-3"><Avatar initials="ES" size={32} tone="neutral" rounded="full" /><span className="flex-1 flex flex-col"><span className="text-base font-medium text-ink">Dra. Elena Sanz</span><span className="text-xs text-faint">Docente del curso</span></span><button className="text-sm font-medium text-accent" onClick={() => notify('Elige otro docente')}>Cambiar</button></div>
          <div className="rounded-xl bg-chrome border border-line p-4 flex flex-col gap-2.5 flex-1">
            <span className="label">Antes de publicar</span>
            {checks.map(([l, ok]) => <div key={l} className="flex items-center gap-2.5 text-base"><span className={cn('h-4 w-4 rounded-full inline-flex items-center justify-center', ok ? 'bg-ok-wash text-ok' : 'bg-warn-wash text-warn')}>{ok ? <Check size={10} strokeWidth={3} /> : <span className="text-[10px] font-bold">!</span>}</span><span className={ok ? 'text-ink' : 'text-warn'}>{ok || l !== 'Portada del curso' ? l : 'Falta la portada'}</span></div>)}
          </div>
        </aside>
      </div>

      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[96px] z-40 h-11 pl-3.5 pr-2 rounded-[11px] bg-[#242220] text-[#F4F2EF] shadow-toast flex items-center gap-3">
          <span className="h-[18px] w-[18px] rounded-full bg-ok inline-flex items-center justify-center"><Check size={11} strokeWidth={3} className="text-white" /></span>
          <span className="flex flex-col"><span className="text-md font-medium">Lección añadida como la {toast.n}</span><span className="text-[10.5px] text-[#9A958D]">{toast.type === 'video' ? 'El vídeo se sigue procesando' : 'Ya se puede abrir'}</span></span>
          <span className="w-px h-[22px] bg-[#3C3936]" />
          <button onClick={undo} className="h-7 px-2.5 rounded-[7px] text-md font-semibold text-[#E5A88F] hover:bg-white/5">Deshacer</button>
        </div>
      )}

      {panel === 'nueva' && <NuevaLeccion n={lessons.length + 1} course={title} fromLibrary={fromLibrary} onLibrary={() => setPanel('biblioteca')} onClose={() => { setPanel(null); setFromLibrary(null) }} onCreate={(t, video) => { if (video && !fromLibrary) { setPanel('subiendo'); window.setTimeout(() => { setPanel(null); addLesson(t, true) }, 1800) } else { setPanel(null); addLesson(t, video) } setFromLibrary(null) }} />}
      {panel === 'subiendo' && <Subiendo n={lessons.length + 1} />}
      {panel === 'biblioteca' && <Biblioteca onBack={() => setPanel('nueva')} onClose={() => setPanel(null)} onPick={(name) => { setFromLibrary(name); setPanel('nueva') }} />}
    </Screen>
  )
}

function Block({ icon, title, right, children }: { icon: React.ReactNode; title: string; right: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-surface border border-line overflow-hidden">
      <div className="h-9 px-3 bg-chrome border-b border-line-soft flex items-center gap-2">{icon}<span className="flex-1 text-sm font-semibold text-ink">{title}</span><span className="text-xs text-faint">{right}</span></div>
      <div className="p-3">{children}</div>
    </div>
  )
}

function NuevaLeccion({ n, course, fromLibrary, onLibrary, onClose, onCreate }: { n: number; course: string; fromLibrary: string | null; onLibrary: () => void; onClose: () => void; onCreate: (title: string, video: boolean) => void }) {
  const { notify } = useStore()
  const [title, setTitle] = useState(fromLibrary ?? 'K2: por qué acompaña a la D3')
  const [text, setText] = useState('')
  const [files, setFiles] = useState<{ k: 'PDF' | 'A5'; n: string; m: string }[]>([])
  const [video, setVideo] = useState<string | null>(fromLibrary)
  return (
    <Drawer open onClose={onClose} title="Nueva lección" subtitle={`Será la lección ${n} de «${course.split(':')[0]}»`} footer={<><span className="text-sm text-muted">Se guarda como borrador</span><div className="flex gap-2"><Button size="lg" onClick={onClose}>Cancelar</Button><Button variant="primary" size="lg" disabled={!title.trim()} onClick={() => onCreate(title, !!video || true)}>Crear lección</Button></div></>}>
      <Field label="Título de la lección" required><Input value={title} onChange={setTitle} focus /></Field>
      <div className="mt-5 flex items-baseline justify-between"><span className="label-faint">Qué lleva esta lección</span><span className="text-xs text-faint">Puedes poner varias cosas a la vez</span></div>
      <div className="mt-2.5 flex flex-col gap-2.5">
        <Block icon={<Play size={12} fill="#B4502E" className="text-accent" />} title="Vídeo" right={video ? 'de la biblioteca' : 'opcional'}>
          {video ? (
            <div className="h-14 rounded-md bg-canvas border border-line px-3 flex items-center gap-3"><span className="h-9 w-14 rounded bg-video inline-flex items-center justify-center text-[10px] text-white/70 font-medium">7:12</span><span className="flex-1 min-w-0 flex flex-col"><span className="text-md font-medium text-ink truncate">{video}</span><span className="text-xs text-faint">1080p · 184 MB · biblioteca</span></span><button onClick={() => setVideo(null)} className="text-faint hover:text-ink"><X size={13} /></button></div>
          ) : (
            <div className="h-24 rounded-md border border-dashed border-line bg-chrome flex flex-col items-center justify-center gap-2"><span className="text-md font-medium text-ink-soft">Arrastra aquí un mp4 o mov</span><div className="flex gap-2"><Button variant="primary" size="sm" onClick={() => setVideo('vitamina-d-leccion-4-k2.mp4')}>Subir archivo</Button><Button size="sm" onClick={onLibrary}>Elegir de la biblioteca</Button></div></div>
          )}
        </Block>
        <Block icon={<AlignLeft size={12} className="text-ink-soft" />} title="Texto" right={text ? `${text.length} caracteres` : 'se ve bajo el vídeo'}>
          <Textarea rows={3} value={text} onChange={setText} placeholder="Escribe qué se tiene que llevar el farmacéutico de esta lección. Dos o tres frases bastan." />
        </Block>
        <Block icon={<FileText size={12} className="text-ink-soft" />} title="Archivos adjuntos" right={files.length ? String(files.length) : 'ninguno todavía'}>
          {files.map((f) => <div key={f.n} className="h-10 mb-2 rounded-md border border-line px-2.5 flex items-center gap-2.5"><FileBadge kind={f.k} /><span className="flex-1 min-w-0 flex flex-col"><span className="text-md font-medium text-ink truncate">{f.n}</span><span className="text-xs text-faint">{f.m}</span></span><button onClick={() => setFiles((fs) => fs.filter((x) => x !== f))} className="text-faint hover:text-ink"><X size={12} /></button></div>)}
          <button onClick={() => { setFiles((fs) => [...fs, fs.length === 0 ? { k: 'PDF', n: 'Mapa de déficit por latitud', m: '620 KB · descargable' } : { k: 'A5', n: 'Chuleta de mostrador', m: '180 KB · imprimible' }]); notify('Archivo adjuntado') }} className="h-11 w-full rounded-md border border-dashed border-line bg-chrome flex items-center justify-center gap-2 text-md font-medium text-ink-soft hover:bg-chrome-deep/50"><Plus size={13} />PDF, ficha imprimible, imagen o enlace</button>
        </Block>
      </div>
      <div className="mt-4 flex items-center gap-2.5"><span className="w-[74px] text-md text-ink-soft">Dónde va</span><Select value="Al final del temario" size="sm" className="flex-1" /></div>
    </Drawer>
  )
}

function Subiendo({ n }: { n: number }) {
  const [p, setP] = useState(68)
  useEffect(() => { const t = window.setInterval(() => setP((x) => Math.min(99, x + 3)), 160); return () => window.clearInterval(t) }, [])
  return (
    <Drawer open onClose={() => {}} title="Nueva lección" subtitle={<span className="text-accent-deep">Subiendo el vídeo · {p} %</span>} footer={<><span className="text-sm text-muted">La subida sigue aunque cierres</span><div className="flex gap-2"><Button size="lg" disabled>Cancelar</Button><Button variant="primary" size="lg" disabled>Creando…</Button></div></>}>
      <Field label="Título de la lección" required><Input value="K2: por qué acompaña a la D3" /></Field>
      <div className="mt-5 flex items-baseline justify-between"><span className="label-faint">Qué lleva esta lección</span><span className="text-xs text-faint">Vídeo · texto · 2 archivos</span></div>
      <div className="mt-2.5 rounded-lg bg-surface border border-line overflow-hidden">
        <div className="h-9 px-3 bg-chrome border-b border-line-soft flex items-center gap-2"><Play size={12} fill="#B4502E" className="text-accent" /><span className="flex-1 text-sm font-semibold text-ink">Vídeo</span><span className="text-xs font-medium text-accent">Cancelar subida</span></div>
        <div className="p-3 flex gap-3"><span className="h-12 w-[84px] rounded-md bg-video inline-flex items-center justify-center text-base font-semibold text-[#FBF7F5]">{p} %</span><div className="flex-1 flex flex-col"><span className="text-md font-medium text-ink">vitamina-d-leccion-4-k2.mp4</span><span className="text-xs text-muted">1080p · 184 MB · 7:12</span><span className="mt-2 h-[5px] rounded-full bg-chrome-deep overflow-hidden"><span style={{ width: `${p}%` }} className="block h-full bg-accent transition-all" /></span><span className="mt-1.5 text-[10.5px] text-faint">{Math.round(1.84 * p)} MB de 184 MB · quedan {Math.max(1, Math.round((100 - p) * 1.25))} s</span></div></div>
      </div>
      <div className="mt-2.5 rounded-lg bg-surface border border-line p-3 text-md leading-[17px] text-ink">Que la K2 dirige el calcio al hueso y no a la arteria, por qué la MK-7 aguanta más en sangre y en qué casos conviene ofrecerlas juntas.</div>
      <div className="mt-6 rounded-lg bg-warn-wash border border-warn-line px-3 py-2.5 text-sm text-[#7A5A18] flex items-center gap-2"><Upload size={13} className="shrink-0" />Puedes cerrar esta ventana: la subida sigue en segundo plano. Lección {n}.</div>
    </Drawer>
  )
}

function Biblioteca({ onBack, onClose, onPick }: { onBack: () => void; onClose: () => void; onPick: (name: string) => void }) {
  const [q, setQ] = useState('k2')
  const [sel, setSel] = useState(0)
  const vids = [{ n: 'K2: por qué acompaña a la D3', m: '1080p · 184 MB · subido el 4 mar', u: 'Sin usar en ningún curso', d: '7:12', free: true }, { n: 'D3 + K2 en el mostrador', m: '1080p · 96 MB · subido el 12 feb', u: 'Se usa en 2 cursos', d: '4:38' }, { n: 'Menaquinona-7, en un minuto', m: '720p · 41 MB · subido el 28 ene', u: 'Se usa en 1 curso', d: '2:05' }].filter((v) => !q || v.n.toLowerCase().includes(q.toLowerCase()))
  return (
    <Drawer open onClose={onClose} onBack={onBack} title="Biblioteca de vídeos" subtitle="48 vídeos · 312 GB de 500 GB" footer={<><span className="text-sm text-muted">{vids[sel] ? '1 seleccionado' : 'Nada seleccionado'}</span><div className="flex gap-2"><Button size="lg" onClick={onBack}>Atrás</Button><Button variant="primary" size="lg" disabled={!vids[sel]} onClick={() => onPick(vids[sel].n)}>Usar este vídeo</Button></div></>}>
      <div className="field h-8 gap-2 rounded-[7px]"><Search size={13} className="text-faint" /><input className="flex-1 bg-transparent text-md" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en la biblioteca" /><span className="text-xs text-faint">{vids.length} resultados</span></div>
      <div className="mt-2.5 flex gap-1.5">{['Todos', 'Sin usar', 'Vitaminas', 'Recientes'].map((c, i) => <span key={c} className={cn('h-[25px] px-[11px] rounded-full text-sm font-medium inline-flex items-center', i === 0 ? 'bg-accent text-on-accent' : 'bg-surface border border-line text-ink-soft')}>{c}</span>)}</div>
      <div className="mt-4 flex flex-col gap-2">
        {vids.map((v, i) => (
          <button key={v.n} onClick={() => setSel(i)} className={cn('h-[76px] rounded-lg border p-[11px] flex items-center gap-3 text-left', sel === i ? 'bg-accent-wash border-accent' : 'bg-surface border-line hover:border-faint')}>
            <span className="h-[52px] w-[92px] rounded-md bg-video inline-flex items-end justify-end p-1.5"><span className="h-4 px-1.5 rounded bg-black/60 text-[9.5px] text-white font-medium inline-flex items-center">{v.d}</span></span>
            <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-semibold text-ink truncate">{v.n}</span><span className="text-xs text-muted mt-[2px]">{v.m}</span><span className={cn('text-xs mt-[3px]', v.free ? 'text-ok' : 'text-faint')}>{v.u}</span></span>
            <span className={cn('h-[22px] w-[22px] rounded-full inline-flex items-center justify-center', sel === i ? 'bg-accent text-on-accent' : 'border border-line')}>{sel === i && <Check size={12} strokeWidth={3} />}</span>
          </button>
        ))}
        <button onClick={() => onPick('vitamina-d-leccion-4-k2.mp4')} className="h-[52px] rounded-lg border border-dashed border-line bg-chrome flex items-center justify-center gap-2 text-md font-medium text-ink-soft hover:bg-chrome-deep/50"><Plus size={13} />Subir uno nuevo en vez de esto</button>
      </div>
    </Drawer>
  )
}
