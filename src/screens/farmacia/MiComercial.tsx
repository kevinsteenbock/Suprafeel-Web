import { Mail, Phone, CalendarDays } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { Toolbar, PageHeader, KeyValue } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Avatar } from '@/ui/Avatar'
import { cn } from '@/lib/cn'

const visits = [
  { date: '22 jul', title: 'Revisión de lineal y novedades de otoño', meta: 'Con Laura · 40 min · dejó la tabla comparativa de colágeno' },
  { date: '3 jun', title: 'Formación de Marta sobre la gama de descanso', meta: 'Con Marta y Jorge · 55 min' },
  { date: '13 may', title: 'Entrega del expositor de primavera', meta: 'Con Laura · 20 min' },
  { date: '2 abr', title: 'Presentación del consejo por síntomas', meta: 'Con todo el equipo · 1 h' },
]

export function MiComercial() {
  const { notify } = useStore()
  return (
    <Screen toolbar={<Toolbar title="Mi comercial" right={<Button variant="primary" icon={<CalendarDays size={13} />} onClick={() => notify('Le hemos propuesto a Álvaro adelantar la visita')}>Pedir una visita</Button>} />}>
      <PageHeader title="Álvaro Ferrer" subtitle="Tu comercial de Suprafeel · Zona Levante · te visita cada 3 semanas, los martes por la mañana" />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex items-center gap-4">
            <Avatar initials="ÁF" size={56} tone="soft" rounded="full" />
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-lg font-semibold text-ink">Álvaro Ferrer</span>
              <span className="text-base text-muted mt-0.5">alvaro.ferrer@suprafeel.com · +34 600 118 204</span>
              <span className="text-sm text-faint mt-1">Lleva tu cuenta desde marzo de 2023 · 9 visitas este año</span>
            </div>
            <Button icon={<Phone size={13} />} onClick={() => notify('Llamando a Álvaro…')}>Llamar</Button>
            <Button icon={<Mail size={13} />} onClick={() => notify('Abriendo el correo…')}>Escribir</Button>
          </div>

          <div className="rounded-xl bg-[#7B3A24] text-on-accent px-6 py-5 flex items-center gap-6">
            <div className="flex-1 flex flex-col">
              <span className="label text-on-accent-soft">Próxima visita</span>
              <span className="mt-1.5 text-title font-semibold tracking-tight">Martes 16 de septiembre · 11:00</span>
              <span className="mt-1.5 text-base text-on-accent-soft">Traerá el material de otoño que has marcado y muestras de colágeno.</span>
            </div>
            <Button className="h-9 px-4 bg-surface text-ink border-0 hover:bg-chrome" onClick={() => notify('Le hemos pedido a Álvaro otra fecha')}>Cambiar la fecha</Button>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-ink">Últimas visitas</h2>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {visits.map((v, i) => (
                <div key={v.date} className={cn('h-[60px] px-4 flex items-center gap-4', i < visits.length - 1 && 'border-b border-line-soft')}>
                  <span className="w-[52px] text-sm font-medium text-muted">{v.date}</span>
                  <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{v.title}</span><span className="text-xs text-faint mt-[2px]">{v.meta}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-[316px] shrink-0 flex flex-col gap-4">
          <KeyValue labelWidth={90} rows={[{ k: 'Zona', v: 'Levante · 34 farmacias' }, { k: 'Horario', v: 'L–V 9:00–18:00' }, { k: 'Responde', v: 'Normalmente en menos de 2 h' }]} />
        </aside>
      </div>
    </Screen>
  )
}
