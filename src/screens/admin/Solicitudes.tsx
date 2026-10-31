import { useNavigate } from 'react-router'
import { Inbox, Plus } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { Toolbar, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'

/**
 * Solicitudes de alta: todavía no hay ningún formulario público que las cree, así que no hay nada
 * que enseñar. Cuando exista, saldrán de Xano; hasta entonces, el alta la hace el admin a mano.
 */
export function Solicitudes() {
  const navigate = useNavigate()
  return (
    <Screen toolbar={<Toolbar back="/admin/cuentas" crumbs={[{ label: 'Cuentas y accesos', to: '/admin/cuentas' }, { label: 'Solicitudes de alta' }]} />}>
      <PageHeader title="Solicitudes de alta" subtitle="Las farmacias que pidan el alta por su cuenta aparecerán aquí para aceptarlas o rechazarlas." />
      <div className="rounded-xl bg-surface border border-line shadow-card px-6 py-14 flex flex-col items-center text-center">
        <span className="h-10 w-10 rounded-full bg-chrome text-muted inline-flex items-center justify-center"><Inbox size={18} /></span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Todavía no hay solicitudes</h2>
        <p className="mt-1.5 text-base text-muted max-w-[440px]">De momento ninguna farmacia puede pedir el alta sola. Si una quiere entrar, dale acceso tú desde Cuentas y accesos.</p>
        <Button variant="primary" size="lg" className="mt-5" icon={<Plus size={13} strokeWidth={2.4} />} onClick={() => navigate('/admin/cuentas/nueva')}>Dar de alta una cuenta</Button>
      </div>
    </Screen>
  )
}
