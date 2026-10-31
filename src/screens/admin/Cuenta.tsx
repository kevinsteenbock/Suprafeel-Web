import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Plus, Phone, Store } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useDatos } from '@/app/datos'
import { products, productById } from '@/data/products'
import { formacionChapa, formacionLabel, iniciales, pharmacyById } from '@/data/pharmacies'
import { Toolbar, PageHeader, Stat, StatRow, Section } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'
import { accesosPorFarmacia, fechaAlta, plural } from './accesos'
import { Principal } from './AccesoCelda'

const crumbsBase = { label: 'Cuentas y accesos', to: '/admin/cuentas' }

export function Cuenta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { farmacias, usuarios } = useDatos()
  const p = pharmacyById(id, farmacias)

  if (!p) {
    return (
      <Screen toolbar={<Toolbar back="/admin/cuentas" crumbs={[crumbsBase, { label: 'Farmacia no encontrada' }]} />}>
        <div className="rounded-xl bg-surface border border-line shadow-card px-6 py-12 flex flex-col items-center text-center">
          <span className="h-10 w-10 rounded-full bg-chrome text-muted inline-flex items-center justify-center"><Store size={18} /></span>
          <h1 className="mt-4 text-lg font-semibold text-ink">No encontramos esta farmacia</h1>
          <p className="mt-1.5 text-base text-muted max-w-[420px]">Puede que el enlace esté mal o que ya no esté en la lista de farmacias de Suprafeel.</p>
          <Button className="mt-5" size="lg" onClick={() => navigate('/admin/cuentas')}>Volver a Cuentas y accesos</Button>
        </div>
      </Screen>
    )
  }

  const cuentas = (accesosPorFarmacia(usuarios).get(p.id) ?? []).slice().sort((a, b) => a.created_at - b.created_at)
  const darAcceso = () => navigate(`/admin/cuentas/nueva?farmacia=${encodeURIComponent(p.id)}`)
  const lineal = p.lineal.map((pid) => productById(pid)).filter((x) => !!x)
  const fecha = [p.formacionDate, p.formacionHora].filter(Boolean).join(' · ')

  // Solo lo que consta: lo que no tiene dato no se enseña.
  const datos: [string, ReactNode][] = (
    [
      ['Razón social', p.name],
      ['Nombre comercial', p.nombreComercial],
      ['Titular', p.owner],
      ['Dirección', p.address],
      ['Código postal', p.postal],
      ['Población', p.city],
      ['Teléfono', p.telefono ? <a href={`tel:${p.telefono.replace(/\s+/g, '')}`} className="text-accent hover:text-accent-deep">{p.telefono}</a> : undefined],
      ['Código de cliente', p.codigoCliente],
      ['Comercial', p.rep ? <Link to={`/admin/cuentas?comercial=${encodeURIComponent(p.rep)}`} className="text-accent hover:text-accent-deep">{p.rep}</Link> : undefined],
      ['Zona', p.zona],
    ] as [string, ReactNode][]
  ).filter(([, v]) => v !== undefined && v !== '')

  return (
    <Screen
      toolbar={
        <Toolbar
          back="/admin/cuentas"
          crumbs={[crumbsBase, { label: p.name }]}
          right={<Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />} onClick={darAcceso}>{cuentas.length ? 'Dar acceso a otra persona' : 'Dar acceso'}</Button>}
        />
      }
    >
      <PageHeader
        title={<span className="flex flex-wrap items-center gap-3">{p.name}<Badge tone={cuentas.length ? 'ok' : 'neutral'} className="mt-1">{cuentas.length ? 'Con acceso' : 'Sin acceso'}</Badge></span>}
        subtitle={[p.nombreComercial, p.city, p.rep ? `la lleva ${p.rep}` : 'sin comercial asignado'].filter(Boolean).join(' · ')}
        right={p.telefono ? <a href={`tel:${p.telefono.replace(/\s+/g, '')}`} className="h-[28px] px-[13px] inline-flex items-center gap-1.5 rounded-[7px] bg-surface text-ink text-base border border-line hover:bg-chrome"><Phone size={13} />Llamar</a> : undefined}
      />
      <StatRow>
        <Stat label="Referencias en el lineal" value={p.refs} sub={`de ${products.length} del catálogo`} bar={Math.round((p.refs / Math.max(products.length, 1)) * 100)} />
        <Stat label="Formación" value={formacionLabel(p.formacion)} sub={fecha || (p.formacion ? undefined : 'No consta en el seguimiento')} tone={p.formacion === 'hecha' ? 'ok' : p.formacion === 'rechazada' ? 'danger' : undefined} />
        <Stat label="Comercial" value={p.rep || '—'} sub={p.zona} />
        <Stat label="Personas con acceso" value={cuentas.length} sub={cuentas.length ? 'pueden entrar en la app' : 'nadie puede entrar todavía'} />
      </StatRow>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <Section title="Personas con acceso">
            <TableCard footer={cuentas.length ? plural(cuentas.length, 'cuenta de esta farmacia', 'cuentas de esta farmacia') : undefined} footerRight={cuentas.length ? <button onClick={darAcceso}>Dar acceso a otra persona</button> : undefined}>
              {cuentas.length > 0 && <THead><Principal min={160}><Th>Persona</Th></Principal><Th className="w-[110px] shrink-0" align="right">Alta</Th></THead>}
              {cuentas.length === 0 && (
                <div className="px-6 py-10 flex flex-col items-center text-center">
                  <span className="text-base font-medium text-ink">Nadie de esta farmacia puede entrar todavía</span>
                  <span className="mt-1 text-sm text-muted max-w-[380px]">Crea una cuenta con su correo y una contraseña, y pásaselas por un canal seguro.</span>
                  <Button variant="primary" size="lg" className="mt-4" icon={<Plus size={13} strokeWidth={2.4} />} onClick={darAcceso}>Dar acceso</Button>
                </div>
              )}
              {cuentas.map((u, i) => (
                <Tr key={u.id} last={i === cuentas.length - 1}>
                  <Principal min={160}><TdMain title={u.name || u.email} meta={u.email} avatar={<Avatar initials={iniciales(u.name || u.email) || '··'} size={30} tone="neutral" rounded="full" />} /></Principal>
                  <Td className="w-[110px] shrink-0" align="right">{fechaAlta(u.created_at)}</Td>
                </Tr>
              ))}
            </TableCard>
          </Section>

          <Section title="Datos de la farmacia">
            <div className="rounded-xl bg-surface border border-line shadow-card p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6">
              {datos.map(([k, v]) => (
                <div key={k} className="flex flex-col min-w-0"><span className="label">{k}</span><span className="mt-1.5 text-base text-ink break-words">{v}</span></div>
              ))}
            </div>
          </Section>
        </div>

        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-6">
          <Section title="Formación en el mostrador">
            <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <Badge tone={formacionChapa(p).tone}>{formacionChapa(p).label}</Badge>
                {fecha && <span className="text-base font-medium text-ink">{fecha}</span>}
              </div>
              <p className="text-sm text-muted leading-4">{p.formacionNote || (p.formacion ? 'Sin notas en el seguimiento.' : 'Esta farmacia no consta en el seguimiento de formación.')}</p>
            </div>
          </Section>
          <Section title="Lineal Suprafeel" right={<span className="text-sm text-muted">{plural(p.refs, 'referencia', 'referencias')}</span>}>
            <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
              {lineal.length === 0 && <div className="p-5 text-sm text-muted">{p.refs ? 'El seguimiento no detalla qué referencias tiene.' : 'Todavía no tiene ninguna referencia de Suprafeel.'}</div>}
              {lineal.map((x, i) => (
                <Link key={x.id} to={`/admin/catalogo/${x.id}`} className={cn('h-10 px-4 flex items-center text-base text-ink hover:bg-canvas', i < lineal.length - 1 && 'border-b border-line-soft')}>{x.name}</Link>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    </Screen>
  )
}
