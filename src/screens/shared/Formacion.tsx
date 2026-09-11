import { Link, useNavigate } from 'react-router'
import { ChevronRight, Play, Link2 } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { itineraries, courseById } from '@/data/courses'
import { Toolbar, SearchField, PageHeader, Section } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { VistaButton, useVista } from '@/ui/Vista'
import { TableCard, Tr, Bar } from '@/ui/Table'
import { cn } from '@/lib/cn'
import { MiListaButton } from './Catalogo'

export function Formacion() {
  const base = useBase()
  const navigate = useNavigate()
  const { notify } = useStore()
  const { vista, setVista } = useVista({ mode: 'list' })
  const cont = courseById('magnesio')!
  const isComercial = base === '/comercial'

  return (
    <Screen toolbar={<Toolbar title="Formación" right={<><SearchField placeholder="Buscar módulo" /><MiListaButton /></>} />}>
      <PageHeader
        title="Formación"
        subtitle={isComercial ? '5 itinerarios · 17 módulos · has completado el 64 %' : '5 itinerarios · 17 módulos · tu equipo ha completado el 72 %'}
        right={<><VistaButton vista={vista} onChange={setVista} /><button className="text-base font-medium text-accent" onClick={() => notify('2 certificados a tu nombre · te los enviamos por correo')}>Ver certificados</button></>}
      />

      <div className="rounded-xl bg-[#7B3A24] text-on-accent px-[26px] py-6 flex items-center gap-6">
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="label text-on-accent-soft">Continúa donde lo dejaste</span>
          <span className="mt-2 text-title font-semibold tracking-tight">{cont.title}</span>
          <span className="mt-1.5 text-base text-on-accent-soft">Itinerario {cont.itinerary} · lección 3 de {cont.lessons.length} · 12 min restantes</span>
        </div>
        <Link to={`${base}/formacion/cursos/${cont.id}/leccion/3`}>
          <Button className="h-9 px-5 bg-surface text-ink border-0 hover:bg-chrome" icon={<Play size={12} fill="currentColor" className="text-accent" />}>Continuar</Button>
        </Link>
      </div>

      <Section title="Itinerarios" right={<Link to={`${base}/formacion/cursos`} className="text-base font-medium text-accent">Ver los cursos sueltos</Link>}>
        {vista.mode === 'list' ? (
          <TableCard footer="Los certificados se emiten al completar el itinerario entero" footerRight="Ver histórico">
            {itineraries.map((it, i) => (
              <Tr key={it.id} height={70} onClick={() => navigate(`${base}/formacion/cursos`)} last={i === itineraries.length - 1}>
                <span className={cn('h-10 w-10 rounded-lg inline-flex items-center justify-center shrink-0', it.tone === 'accent' ? 'bg-accent-wash text-accent' : it.tone === 'ok' ? 'bg-ok-wash text-ok' : 'bg-chrome-deep text-muted')}><Link2 size={16} /></span>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-base font-medium text-ink">{it.name}</span>
                  <span className="text-xs text-faint mt-[2px]">{it.modules} módulos · {it.minutes} min · {it.meta}</span>
                </div>
                <div className="w-[120px] flex flex-col items-end gap-1.5">
                  <span className={cn('text-sm font-semibold', it.tone === 'accent' ? 'text-accent' : it.tone === 'ok' ? 'text-ok' : 'text-faint')}>{it.state}</span>
                  <Bar value={it.progress} width={120} tone={it.tone === 'ok' ? 'ok' : 'accent'} />
                </div>
                <ChevronRight size={14} className="text-faint ml-2" />
              </Tr>
            ))}
          </TableCard>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${vista.perRow}, minmax(0, 1fr))` }}>
            {itineraries.map((it) => (
              <Link key={it.id} to={`${base}/formacion/cursos`} className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col gap-3 hover:border-faint">
                <span className={cn('h-10 w-10 rounded-lg inline-flex items-center justify-center', it.tone === 'accent' ? 'bg-accent-wash text-accent' : it.tone === 'ok' ? 'bg-ok-wash text-ok' : 'bg-chrome-deep text-muted')}><Link2 size={16} /></span>
                <span className="text-base font-semibold text-ink">{it.name}</span>
                <span className="text-xs text-faint -mt-2">{it.modules} módulos · {it.minutes} min</span>
                <Bar value={it.progress} width={999} className="w-full" tone={it.tone === 'ok' ? 'ok' : 'accent'} />
                <span className={cn('text-sm font-semibold', it.tone === 'accent' ? 'text-accent' : it.tone === 'ok' ? 'text-ok' : 'text-faint')}>{it.state}</span>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </Screen>
  )
}
