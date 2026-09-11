import { Link, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { routeToday, pharmacies } from '@/data/pharmacies'
import { Toolbar, SearchField, PageHeader, Stat, StatRow, Section } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { TableCard, Tr } from '@/ui/Table'
import { cn } from '@/lib/cn'

export function Hoy() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const stateTone = (s: string): 'ok' | 'solid' | 'danger' | 'neutral' => (s === 'Visitada' ? 'ok' : s === 'Ahora' ? 'solid' : s === 'En riesgo' ? 'danger' : 'neutral')

  return (
    <Screen toolbar={<Toolbar title="Hoy" right={<><SearchField placeholder="Buscar farmacia o producto" /><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => navigate('/comercial/farmacias/central?visita=1')}>Registrar visita</Button></>} />}>
      <PageHeader title="Buenos días, Álvaro" subtitle="5 visitas hoy en Valencia capital · 2 farmacias llevan más de 60 días sin visita." right={<span className="text-base text-muted">Viernes, 11 de septiembre</span>} />

      <StatRow>
        <Stat label="Cobertura de la zona" value="68 %" sub="23 de 34 farmacias visitadas en Q3" bar={68} />
        <Stat label="Visitas este mes" value="27" sub={<span className="text-ok font-medium">6 más que en agosto</span>} />
        <Stat label="Visitas de la semana" value="18 / 22" sub="4 pendientes hasta el domingo" />
        <Stat label="Farmacias sin visita" value="2" tone="accent" sub="Más de 60 días sin pasar" />
      </StatRow>

      <div className="flex gap-6">
        <Section className="flex-1 min-w-0" title="Ruta de hoy" right={<button className="text-base font-medium text-accent" onClick={() => notify('Abriendo la ruta en Mapas…')}>Abrir en Mapas</button>}>
          <TableCard footer="5 visitas · 1 registrada · 38 km de ruta" footerRight={<Button size="md" onClick={() => notify('Ruta de mañana planificada: 4 visitas')}>Planificar mañana</Button>}>
            {routeToday.map((r, i) => (
              <Tr key={r.time} height={66} active={r.state === 'Ahora'} onClick={() => navigate(`/comercial/farmacias/${r.id}`)} last={i === routeToday.length - 1}>
                <span className={cn('w-[42px] text-base font-semibold', r.state === 'Ahora' ? 'text-accent' : 'text-muted')}>{r.time}</span>
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{r.name}</span><span className="text-xs text-faint mt-[2px]">{r.meta}</span></span>
                <Badge tone={stateTone(r.state)}>{r.state}</Badge>
                <span className={cn('w-[70px] text-right text-sm font-medium', r.state === 'Ahora' ? 'text-accent' : 'text-ink-soft')}>{r.state === 'Ahora' ? 'Registrar' : 'Ver ficha'}</span>
              </Tr>
            ))}
          </TableCard>
        </Section>

        <aside className="w-[316px] shrink-0 flex flex-col gap-5">
          <Section title="Requieren atención">
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {[{ id: 'carmen', n: 'Farmacia El Carmen', m: '64 días sin visita · formación sin empezar', a: 'Llamar', tone: 'bg-danger' }, { id: 'port-sapla', n: 'Farmacia Port Saplà', m: '71 días sin visita · sin material PLV este año', a: 'Planificar', tone: 'bg-warn' }].map((x, i) => (
                <div key={x.id} className={cn('px-4 py-3 flex items-center gap-3', i === 0 && 'border-b border-line-soft')}>
                  <span className={cn('w-[3px] h-9 rounded-full shrink-0', x.tone)} />
                  <Link to={`/comercial/farmacias/${x.id}`} className="flex-1 min-w-0 flex flex-col hover:text-accent-deep"><span className="text-base font-medium text-ink">{x.n}</span><span className="text-xs text-faint mt-[2px] leading-4">{x.m}</span></Link>
                  <button className="text-sm font-medium text-accent" onClick={() => notify(x.a === 'Llamar' ? 'Llamando a Farmacia El Carmen…' : 'Visita planificada para el martes 16')}>{x.a}</button>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Formación en tu zona" right={<Link to="/comercial/farmacias" className="text-base font-medium text-accent">Ver todo</Link>}>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {pharmacies.filter((p) => ['central', 'blasco', 'alboraya', 'ruzafa'].includes(p.id)).map((p) => (
                <Link key={p.id} to={`/comercial/farmacias/${p.id}`} className="h-[58px] px-4 flex items-center gap-3 border-b border-line-soft hover:bg-canvas">
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{p.name}</span><span className="text-xs text-faint mt-[2px]">{p.city} · {p.team.length} personas{p.training >= 70 ? ` · ${p.team.filter((t) => t.pct === 100).length} certificado${p.team.filter((t) => t.pct === 100).length === 1 ? '' : 's'}` : ''}</span></span>
                  <span className={cn('text-base font-semibold', p.training < 40 ? 'text-warn' : 'text-ink')}>{p.training} %</span>
                </Link>
              ))}
              <div className="h-[46px] px-4 bg-chrome flex items-center justify-between"><span className="text-sm text-muted">Zona Levante · equipo formado</span><span className="text-base font-semibold text-ink">58 %</span></div>
            </div>
          </Section>
        </aside>
      </div>
    </Screen>
  )
}
