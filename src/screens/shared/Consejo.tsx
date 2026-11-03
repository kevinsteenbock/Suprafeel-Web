import { Sparkles } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { Toolbar, PageHeader, Vacio } from '@/ui/Page'
import { MiListaButton } from './Catalogo'

/**
 * Consejo por síntomas: todavía no hay motor que analice casos, así que la pantalla no enseña ningún
 * caso ni recomendación inventada. Cuando el consejo con Claude se active, la búsqueda irá aquí.
 */
export function Consejo() {
  const isComercial = useBase() === '/comercial'
  return (
    <Screen toolbar={<Toolbar title="Consejo por síntomas" right={<MiListaButton />} />}>
      <PageHeader title="¿Qué le pasa a tu cliente?" subtitle="Descríbelo con tus palabras y Suprafeel te dirá qué producto encaja y qué tener en cuenta." />
      <Vacio icon={<Sparkles size={18} />} title="El consejo por síntomas aún no está disponible">
        Todavía no analiza casos, así que no te enseñamos recomendaciones que no salen de lo que escribes. {isComercial ? 'De momento, consúltalo con la central en info@suprafeel.es.' : 'De momento, pregunta a tu comercial o escríbenos a info@suprafeel.es.'}
      </Vacio>
    </Screen>
  )
}
