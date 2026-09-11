import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { courseFilters, filterCourses } from '@/data/courses'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Chip, ChipRow } from '@/ui/Chip'
import { VistaButton, useVista } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain, Bar } from '@/ui/Table'
import { cn } from '@/lib/cn'
import { MiListaButton } from './Catalogo'

export function Cursos() {
  const base = useBase()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const { vista, setVista } = useVista({ mode: 'cards', perRow: 3 })
  const list = filterCourses(filter)

  return (
    <Screen toolbar={<Toolbar title="Cursos" right={<><SearchField placeholder="Buscar curso" /><MiListaButton /></>} />}>
      <PageHeader title="Cursos" subtitle="Formación breve para el mostrador. Cada curso deja un certificado a tu nombre." right={<span className="text-base text-muted">6 cursos · 3 h 09 min en total</span>} />

      <ChipRow right={<VistaButton vista={vista} onChange={setVista} />}>
        {courseFilters.map((f) => <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>)}
      </ChipRow>

      {vista.mode === 'cards' ? (
        <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${vista.perRow}, minmax(0, 1fr))` }}>
          {list.map((c) => {
            const action = c.state === 'progress' ? 'Continuar' : c.state === 'done' ? 'Repasar' : 'Empezar'
            const to = `${base}/formacion/cursos/${c.id}`
            return (
              <div key={c.id} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col hover:border-faint transition-colors">
                <Link to={to} className="relative block h-[124px] bg-chrome-deep">
                  <img src={c.cover} alt="" className="h-full w-full object-cover" />
                  <span className="absolute top-3 right-3 h-[22px] px-2.5 rounded-full bg-surface text-xs font-semibold text-ink shadow-card inline-flex items-center">{c.minutes} min</span>
                </Link>
                <div className="p-4 flex flex-col">
                  <span className={cn('label', c.state === 'progress' ? 'text-accent' : 'text-muted')}>{c.itinerary}</span>
                  <Link to={to} className="mt-1.5 text-lg font-semibold text-ink leading-[21px] hover:text-accent-deep">{c.title}</Link>
                  <span className="text-sm text-faint mt-1.5">{c.lessons.length} lecciones · {c.teacher}</span>
                  <Bar value={c.progress} width={999} className="w-full mt-3.5" tone={c.state === 'done' ? 'ok' : 'accent'} />
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-sm text-muted">{c.stateLabel}</span>
                    <Link to={c.state === 'progress' ? `${to}/leccion/3` : to} className={cn('text-sm font-semibold', c.state === 'done' ? 'text-ink' : 'text-accent')}>{action}</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <TableCard footer={`${list.length} de 6 cursos`}>
          <THead><Th className="flex-1">Curso</Th><Th className="w-[140px]">Itinerario</Th><Th className="w-[80px]" align="right">Lecciones</Th><Th className="w-[80px]" align="right">Duración</Th><Th className="w-[140px]" align="right">Estado</Th><Th className="w-4"> </Th></THead>
          {list.map((c, i) => (
            <Tr key={c.id} height={58} onClick={() => navigate(`${base}/formacion/cursos/${c.id}`)} last={i === list.length - 1}>
              <TdMain title={c.title} meta={c.teacher} avatar={<img src={c.cover} alt="" className="h-9 w-14 rounded-md object-cover shrink-0" />} />
              <Td className="w-[140px]">{c.itinerary}</Td>
              <Td className="w-[80px]" align="right">{c.lessons.length}</Td>
              <Td className="w-[80px]" align="right">{c.minutes} min</Td>
              <div className="w-[140px] flex flex-col items-end gap-1"><span className="text-xs text-muted">{c.stateLabel}</span><Bar value={c.progress} width={100} tone={c.state === 'done' ? 'ok' : 'accent'} /></div>
              <ChevronRight size={14} className="text-faint" />
            </Tr>
          ))}
        </TableCard>
      )}
    </Screen>
  )
}
