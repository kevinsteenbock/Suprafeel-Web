import { ScrollText } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { Toolbar, PageHeader } from '@/ui/Page'

/**
 * Registro de consultas al chat: el chat todavía no guarda nada en Xano, así que no hay consultas
 * que enseñar. Cuando las guarde, saldrán de ahí (sin nombre de paciente ni de quien escribe).
 */
export function Registro() {
  return (
    <Screen toolbar={<Toolbar title="Registro de consultas" />}>
      <PageHeader title="Registro de consultas" subtitle="Lo que las farmacias preguntan al chat de consejo, sin nombre de paciente ni de quien lo escribe." />
      <div className="rounded-xl bg-surface border border-line shadow-card px-6 py-14 flex flex-col items-center text-center">
        <span className="h-10 w-10 rounded-full bg-chrome text-muted inline-flex items-center justify-center"><ScrollText size={18} /></span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Todavía no hay consultas registradas</h2>
        <p className="mt-1.5 text-base text-muted max-w-[440px]">Cuando las farmacias usen el consejo por síntomas, cada consulta quedará aquí con la recomendación que salió y cómo la valoraron.</p>
      </div>
    </Screen>
  )
}
