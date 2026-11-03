import { Presentation } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { Toolbar, PageHeader, Vacio } from '@/ui/Page'

/** Campañas de PLV: esta parte de la consola aún no está conectada y no hay ninguna campaña. */
export function AdminPLV() {
  return (
    <Screen toolbar={<Toolbar title="Materiales PLV" />}>
      <PageHeader title="Materiales PLV" subtitle="Las campañas de carteles, expositores y folletos que ven farmacias y comerciales." />
      <Vacio icon={<Presentation size={18} />} title="Todavía no hay campañas de PLV">
        Esta parte de la consola aún no está conectada. Cuando lo esté, las campañas que crees aquí las verán las farmacias y los comerciales en «Materiales PLV».
      </Vacio>
    </Screen>
  )
}
