import type { ReactNode } from 'react'
import { Mail, CalendarDays } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { formacionLabel, hoyISO, iniciales, nombreDe, pharmacyById, type Pharmacy } from '@/data/pharmacies'
import { Toolbar, PageHeader, KeyValue } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Avatar } from '@/ui/Avatar'
import { Badge } from '@/ui/Badge'

/** Mientras los comerciales no tengan contacto propio en Xano, todo pasa por la central. */
const CONTACTO = 'info@suprafeel.es'
const correo = (asunto: string) => `mailto:${CONTACTO}?subject=${encodeURIComponent(asunto)}`
const escribir = (asunto: string) => { window.location.href = correo(asunto) }

/** '2026-11-07' → «Viernes, 7 de noviembre» (sin pasar por UTC). */
function fechaLarga(iso?: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  if (!m) return ''
  const s = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Lo que se sabe de la formación de la farmacia, en una frase para ella. */
function estadoFormacion(p: Pharmacy): { titulo: string; texto: string } | null {
  const fecha = fechaLarga(p.formacionFecha)
  switch (p.formacion) {
    case 'prevista':
      return fecha && p.formacionFecha! < hoyISO()
        ? { titulo: `Estaba prevista el ${fecha.charAt(0).toLowerCase() + fecha.slice(1)}`, texto: 'Si no se llegó a hacer, escríbenos y buscamos otra fecha.' }
        : { titulo: fecha ? `Prevista: ${fecha.charAt(0).toLowerCase() + fecha.slice(1)}` : 'Prevista, sin fecha cerrada', texto: 'Si os viene mal, escríbenos y la cambiamos.' }
    case 'hecha':
      return { titulo: fecha ? `Hecha el ${fecha.charAt(0).toLowerCase() + fecha.slice(1)}` : 'Hecha', texto: 'Si se incorpora alguien nuevo al equipo y queréis repetirla, escríbenos.' }
    case 'pendiente':
      return { titulo: 'Pendiente de fecha', texto: 'Todavía no hay fecha. Si quieres proponer una, escríbenos.' }
    case 'rechazada':
      return { titulo: 'Sin formación por ahora', texto: 'Si cambiáis de idea, escríbenos y la organizamos.' }
    default:
      return null
  }
}

export function MiComercial() {
  const { user } = useAuth()
  const { farmacias } = useDatos()
  const p = pharmacyById(user?.pharmacy_slug ?? undefined, farmacias) ?? farmacias[0]
  const rep = p?.rep ?? ''
  const proxima = p?.formacion === 'prevista' && !!p.formacionFecha && p.formacionFecha >= hoyISO() ? p : null
  const estado = p && !proxima ? estadoFormacion(p) : null

  return (
    <Screen toolbar={<Toolbar title="Mi comercial" right={<Button variant="primary" icon={<CalendarDays size={13} />} onClick={() => escribir(`Pedir una visita${p ? ` · ${nombreDe(p)}` : ''}`)}>Pedir una visita</Button>} />}>
      <PageHeader title={rep || 'Tu comercial'} subtitle={rep ? ['Tu comercial de Suprafeel', p?.zona].filter(Boolean).join(' · ') : 'Todavía no tienes un comercial asignado. Mientras tanto, te atendemos desde la central.'} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0 flex items-center gap-4">
              <Avatar initials={iniciales(rep) || 'SF'} size={56} tone="soft" rounded="full" className="shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-lg font-semibold text-ink">{rep || 'Suprafeel'}</span>
                {p && rep && <span className="text-sm text-faint mt-0.5">Lleva la cuenta de {nombreDe(p)}</span>}
                <span className="text-base text-muted mt-1 break-words">Para cualquier cosa, escribe a <a href={correo(p ? `Consulta · ${nombreDe(p)}` : 'Consulta')} className="text-accent hover:underline">{CONTACTO}</a></span>
              </div>
            </div>
            <Button icon={<Mail size={13} />} className="self-start sm:self-auto" onClick={() => escribir(p ? `Consulta · ${nombreDe(p)}` : 'Consulta')}>Escribir</Button>
          </div>

          {proxima && (
            <div className="rounded-xl bg-[#7B3A24] text-on-accent px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="label text-on-accent-soft">Próxima formación en tu farmacia</span>
                <span className="mt-1.5 text-title font-semibold tracking-tight">{fechaLarga(proxima.formacionFecha)}{proxima.formacionHora ? ` · ${proxima.formacionHora}` : ''}</span>
                {proxima.formacionNote && <span className="mt-1.5 text-base text-on-accent-soft">{proxima.formacionNote}</span>}
              </div>
              <Button className="h-9 px-4 self-start sm:self-auto bg-surface text-ink border-0 hover:bg-chrome" onClick={() => escribir(`Cambiar la fecha de la formación · ${proxima.name}`)}>Cambiar la fecha</Button>
            </div>
          )}

          {estado && p && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-ink">Formación en el mostrador</h2>
              <div className="rounded-xl bg-surface border border-line shadow-card px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-base font-medium text-ink">{estado.titulo}{p.formacionHora && p.formacion === 'prevista' ? ` · ${p.formacionHora}` : ''}</span>
                  <span className="text-sm text-muted mt-1">{estado.texto}</span>
                  {p.formacionNote && <span className="text-sm text-faint mt-1">{p.formacionNote}</span>}
                </div>
                <Badge tone={p.formacion === 'hecha' ? 'ok' : p.formacion === 'rechazada' ? 'neutral' : 'warn'}>{formacionLabel(p.formacion)}</Badge>
              </div>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-4">
          <KeyValue
            labelWidth={90}
            rows={([
              rep ? { k: 'Comercial', v: rep } : null,
              p?.zona ? { k: 'Zona', v: p.zona } : null,
              p ? { k: 'Farmacia', v: nombreDe(p) } : null,
              p?.formacion ? { k: 'Formación', v: [formacionLabel(p.formacion), p.formacionDate].filter(Boolean).join(' · ') } : null,
              { k: 'Contacto', v: <a href={correo('Consulta')} className="text-accent hover:underline break-all">{CONTACTO}</a> },
            ] as ({ k: string; v: ReactNode } | null)[]).filter((r): r is { k: string; v: ReactNode } => !!r)}
          />
        </aside>
      </div>
    </Screen>
  )
}
