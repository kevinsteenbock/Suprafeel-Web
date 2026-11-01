import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, Filter, ArrowUpDown } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { adminCourses } from '@/data/courses'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { FilterMenuButton, FilterBar } from '@/ui/FilterMenu'
import { Badge } from '@/ui/Badge'
import { Thumb } from '@/ui/ProductArt'
import { VistaButton, useVista, useGridCols } from '@/ui/Vista'
import { porFilaInicial, vistaInicial } from './AccesoCelda'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'

export function AdminCursos() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const { vista, setVista, resetVista } = useVista({ mode: vistaInicial(), perRow: porFilaInicial(3) })
  const gridStyle = useGridCols(vista)
  const list = adminCourses.filter((c) => filter === 'all' || (filter === 'pub' ? c.state === 'Publicado' : filter === 'draft' ? c.state === 'Borrador' : c.lessons === 0))
  const totalLessons = adminCourses.reduce((a, c) => a + c.lessons, 0)
  // Solo lo que se calcula: cursos, lecciones y duración. Certificados y finalización no se registran todavía.
  const totalMin = adminCourses.reduce((a, c) => a + c.minutes, 0)
  const duracion = totalMin >= 60 ? `${Math.floor(totalMin / 60)} h ${String(totalMin % 60).padStart(2, '0')} min` : `${totalMin} min`
  const chips = [
    ['all', 'Todos', adminCourses.length],
    ['pub', 'Publicados', adminCourses.filter((c) => c.state === 'Publicado').length],
    ['draft', 'Borradores', adminCourses.filter((c) => c.state === 'Borrador').length],
    ['nolessons', 'Sin lecciones', adminCourses.filter((c) => c.lessons === 0).length],
  ] as const

  return (
    <Screen toolbar={<Toolbar title="Cursos" right={<><SearchField placeholder="Buscar curso o lección" /><Link to="/admin/cursos/nuevo"><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />}>Nuevo curso</Button></Link></>} />}>
      <PageHeader title="Cursos" subtitle={`${adminCourses.length} cursos · ${totalLessons} lecciones · ${duracion} en total`} />
      <FilterBar
        right={
          <>
            <FilterMenuButton align="right" icon={<ArrowUpDown size={13} strokeWidth={1.8} />} value={sort} options={[{ key: 'recent', label: 'Más reciente' }, { key: 'az', label: 'Nombre A-Z' }]} onChange={setSort} />
            <VistaButton vista={vista} onChange={setVista} onReset={resetVista} />
          </>
        }
      >
        <FilterMenuButton icon={<Filter size={13} strokeWidth={1.8} />} value={filter} options={chips.map(([k, l, n]) => ({ key: k, label: l, count: n }))} onChange={setFilter} />
      </FilterBar>
      {vista.mode === 'list' ? (
        <TableCard footer={`${list.length} de ${adminCourses.length} cursos`}>
          <THead><Th className="flex-1">Curso</Th><Th className="w-[90px]" align="right">Itinerario</Th><Th className="w-[70px]" align="right">Lecciones</Th><Th className="w-[70px]" align="right">Duración</Th><Th className="w-[90px]" align="right">Estado</Th><Th className="w-[104px] whitespace-nowrap" align="right">Completados</Th></THead>
          {list.map((c, i) => (
            <Tr key={c.id} onClick={() => navigate(`/admin/cursos/${c.id}`)} last={i === list.length - 1}>
              <TdMain title={c.title} meta={c.meta} avatar={<Thumb code={c.code} tone={i < 2 ? 'accent' : 'neutral'} />} />
              <Td className="w-[90px]" align="right">{c.itinerary}</Td>
              <Td className={cn('w-[70px]', c.lessons === 0 && 'text-accent font-medium')} align="right">{c.lessons}</Td>
              <Td className="w-[70px]" align="right">{c.minutes ? `${c.minutes} min` : '—'}</Td>
              <div className="w-[90px] flex justify-end"><Badge tone={c.state === 'Publicado' ? 'ok' : 'warn'}>{c.state}</Badge></div>
              <Td className="w-[104px] text-faint" align="right">—</Td>
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={gridStyle}>
          {list.map((c) => <button key={c.id} onClick={() => navigate(`/admin/cursos/${c.id}`)} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-2 text-left hover:border-faint"><div className="flex items-center justify-between"><Thumb code={c.code} tone="accent" /><Badge tone={c.state === 'Publicado' ? 'ok' : 'warn'}>{c.state}</Badge></div><span className="text-base font-semibold text-ink mt-1">{c.title}</span><span className="text-xs text-faint">{c.lessons} lecciones · {c.minutes ? `${c.minutes} min` : 'sin duración'}</span></button>)}
        </div>
      )}
    </Screen>
  )
}
