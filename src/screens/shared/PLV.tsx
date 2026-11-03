import { Presentation } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { Toolbar, PageHeader, Vacio } from '@/ui/Page'

/**
 * Materiales PLV: todavía no hay ninguno publicado. Cuando Suprafeel suba carteles, expositores o
 * folletos, saldrán aquí para pedirlos.
 */
export function PLV() {
  const isComercial = useBase() === '/comercial'
  return (
    <Screen toolbar={<Toolbar title="Materiales PLV" />}>
      <PageHeader title="Materiales PLV" subtitle="Carteles, expositores y folletos de Suprafeel para el punto de venta." />
      <Vacio icon={<Presentation size={18} />} title="Todavía no hay materiales PLV">
        Cuando Suprafeel publique materiales, saldrán aquí para {isComercial ? 'pedirlos para tus farmacias' : 'pedirlos'}. Mientras tanto, pídelos a {isComercial ? 'info@suprafeel.es' : 'tu comercial o a info@suprafeel.es'}.
      </Vacio>
    </Screen>
  )
}
