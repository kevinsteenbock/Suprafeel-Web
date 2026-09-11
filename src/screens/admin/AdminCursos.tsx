import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { adminCourses } from '@/data/courses'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { Thumb } from '@/ui/ProductArt'
import { VistaButton, useVista, gridCols } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'

export function AdminCursos() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [filter, setFilter] = useState('all')
  const { vista, setVista, resetVista } = useVista({ mode: 'list', perRow: 3 })
  const list = adminCourses.filter((c) => filter === 'all' || (filter === 'pub' ? c.state === 'Publicado' : filter === 'draft' ? c.state === 'Borrador' : filter === 'nolessons' ? c.lessons === 0 : c.completions > 200))
  const totalLessons = adminCourses.reduce((a, c) => a + c.lessons, 0)
  const chips = [
    ['all', 'Todos', adminCourses.length],
    ['pub', 'Publicados', adminCourses.filter((c) => c.state === 'Publicado').length],
    ['draft', 'Borradores', adminCourses.filter((c) => c.state === 'Borrador').length],
    ['nolessons', 'Sin lecciones', adminCourses.filter((c) => c.lessons === 0).length],
    ['top', 'Más vistos', adminCourses.filter((c) => c.completions > 200).length],
  ] as const

  return (
    <Screen toolbar={<Toolbar title="Cursos" right={<><SearchField placeholder="Buscar curso o lección" /><Link to="/admin/cursos/nuevo"><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />}>Nuevo curso</Button></Link></>} />}>
      <PageHeader title="Cursos" subtitle={`${adminCourses.length} cursos · ${totalLessons} lecciones · 3 h 05 min · 1.430 certificados emitidos`} right={<span className="text-base text-muted">Finalización media 54 %</span>} />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} />}>
        {chips.map(([k, l, n]) => <Chip key={k} active={filter === k} count={n} onClick={() => setFilter(k)}>{l}</Chip>)}
      </ChipRow>
      {vista.mode === 'list' ? (
        <TableCard footer={`${list.length} de ${adminCourses.length} cursos · 72 % de finalización media`} footerRight={<button onClick={() => notify('Estadísticas de formación')}>Ver estadísticas</button>}>
          <THead><Th className="flex-1">Curso</Th><Th className="w-[90px]" align="right">Itinerario</Th><Th className="w-[70px]" align="right">Lecciones</Th><Th className="w-[70px]" align="right">Duración</Th><Th className="w-[90px]" align="right">Estado</Th><Th className="w-[80px]" align="right">Completado</Th></THead>
          {list.map((c, i) => (
            <Tr key={c.id} onClick={() => navigate(`/admin/cursos/${c.id}`)} last={i === list.length - 1}>
              <TdMain title={c.title} meta={c.meta} avatar={<Thumb code={c.code} tone={i < 2 ? 'accent' : 'neutral'} />} />
              <Td className="w-[90px]" align="right">{c.itinerary}</Td>
              <Td className={cn('w-[70px]', c.lessons === 0 && 'text-accent font-medium')} align="right">{c.lessons}</Td>
              <Td className="w-[70px]" align="right">{c.minutes ? `${c.minutes} min` : '—'}</Td>
              <div className="w-[90px] flex justify-end"><Badge tone={c.state === 'Publicado' ? 'ok' : 'warn'}>{c.state}</Badge></div>
              <Td className="w-[80px] font-semibold text-ink" align="right">{c.completions || '—'}</Td>
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={gridCols(vista)}>
          {list.map((c) => <button key={c.id} onClick={() => navigate(`/admin/cursos/${c.id}`)} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-2 text-left hover:border-faint"><div className="flex items-center justify-between"><Thumb code={c.code} tone="accent" /><Badge tone={c.state === 'Publicado' ? 'ok' : 'warn'}>{c.state}</Badge></div><span className="text-base font-semibold text-ink mt-1">{c.title}</span><span className="text-xs text-faint">{c.lessons} lecciones · {c.minutes} min · {c.completions} completados</span></button>)}
        </div>
      )}
    </Screen>
  )
}
