import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Screen } from '@/app/Shell'
import { call, useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { comercialesDe, ESTADOS_FORMACION, pharmacyById, TODOS_LOS_COMERCIALES } from '@/data/pharmacies'
import { accesosPorComercial } from './accesos'
import { Notice, Section, Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Input, Textarea } from '@/ui/Field'

const HORAS = Array.from({ length: 26 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
const slugDe = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)

/** Alta o edición de una farmacia: datos, comercial, distribuidor, zona y su formación. Solo administración. */
export function EditarFarmacia() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { farmacias, usuarios, recargar } = useDatos()
  const p = id ? pharmacyById(id, farmacias) : undefined
  // También los comerciales con cuenta que aún no llevan ninguna farmacia (los nuevos del Excel).
  const reps = useMemo(() => [...new Set([...comercialesDe(farmacias).map((c) => c.rep), ...accesosPorComercial(usuarios).keys()])].filter((r) => r !== TODOS_LOS_COMERCIALES).sort((a, b) => a.localeCompare(b, 'es')), [farmacias, usuarios])
  const zonas = useMemo(() => [...new Set(farmacias.map((f) => f.zona).filter((z): z is string => !!z))].sort(), [farmacias])

  const [d, setD] = useState({
    name: p?.name ?? '', nombre_comercial: p?.nombreComercial ?? '', owner: p?.owner ?? '', address: p?.address ?? '', postal: p?.postal ?? '', city: p?.city ?? '',
    telefono: p?.telefono ?? '', refs: String(p?.refs ?? 0), distribuidor: p?.distribuidor ?? '', rep: p?.rep ?? '', zona: p?.zona ?? '',
    formacion: (p?.formacion ?? '') as string, formacion_fecha: p?.formacionFecha ?? '', formacion_hora: p?.formacionHora ?? '', formacion_nota: p?.formacionNote ?? '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const pon = (k: keyof typeof d) => (v: string) => setD((x) => ({ ...x, [k]: v }))

  if (id && !p) return <Navigate to="/admin/cuentas" replace />
  const volver = p ? `/admin/cuentas/${p.id}` : '/admin/cuentas'

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    if (guardando) return
    if (d.name.trim().length < 2) return setError('Escribe el nombre de la farmacia.')
    if (d.rep.trim().length < 2) return setError('Elige el comercial.')
    setGuardando(true)
    setError('')
    const slug = p?.id ?? slugDe(d.name)
    try {
      const cuerpo = { ...d, refs: Number(d.refs) || 0, ...(p ? {} : { slug }) }
      const { res, body } = await call(p ? `/admin/farmacias/${encodeURIComponent(p.id)}` : '/admin/farmacias', { method: p ? 'PATCH' : 'POST', body: JSON.stringify(cuerpo) }, token)
      if (!res.ok) throw new Error(body?.message || 'No se ha podido guardar.')
      await recargar()
      navigate(`/admin/cuentas/${slug}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se ha podido guardar.')
      setGuardando(false)
    }
  }

  return (
    <Screen toolbar={<Toolbar back={volver} crumbs={[{ label: 'Cuentas y accesos', to: '/admin/cuentas' }, { label: p ? `Editar ${p.name}` : 'Nueva farmacia' }]} />}>
      <form onSubmit={guardar} noValidate className="w-full max-w-[720px] flex flex-col gap-6">
        <h1 className="text-h1 font-semibold tracking-tight text-ink">{p ? 'Editar farmacia' : 'Nueva farmacia'}</h1>

        <Section title="Farmacia">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre" required><Input value={d.name} onChange={pon('name')} /></Field>
            <Field label="Nombre comercial"><Input value={d.nombre_comercial} onChange={pon('nombre_comercial')} /></Field>
            <Field label="Titular"><Input value={d.owner} onChange={pon('owner')} /></Field>
            <Field label="Teléfono"><Input value={d.telefono} onChange={pon('telefono')} /></Field>
            <Field label="Dirección" className="sm:col-span-2"><Input value={d.address} onChange={pon('address')} /></Field>
            <Field label="Código postal" hint="Decide si entra en la zona de la semana."><Input value={d.postal} onChange={pon('postal')} /></Field>
            <Field label="Ciudad"><Input value={d.city} onChange={pon('city')} /></Field>
            <Field label="Nº de referencias"><Input value={d.refs} onChange={(v) => pon('refs')(v.replace(/[^\d]/g, '').slice(0, 3))} /></Field>
          </div>
        </Section>

        <Section title="Quién la atiende">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Comercial" required>
              <div className="field"><input aria-label="Comercial" list="sf-reps" value={d.rep} onChange={(e) => pon('rep')(e.target.value)} className="flex-1 min-w-0 self-stretch bg-transparent text-base text-ink" /></div>
              <datalist id="sf-reps">{reps.map((r) => <option key={r} value={r} />)}</datalist>
            </Field>
            <Field label="Distribuidor"><Input value={d.distribuidor} onChange={pon('distribuidor')} /></Field>
            <Field label="Zona">
              <div className="field"><input aria-label="Zona" list="sf-zonas" value={d.zona} onChange={(e) => pon('zona')(e.target.value)} className="flex-1 min-w-0 self-stretch bg-transparent text-base text-ink" /></div>
              <datalist id="sf-zonas">{zonas.map((z) => <option key={z} value={z} />)}</datalist>
            </Field>
          </div>
        </Section>

        <Section title="Formación">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Estado">
              <select aria-label="Estado de la formación" value={d.formacion} onChange={(e) => pon('formacion')(e.target.value)} className="field text-base text-ink">
                <option value="">Sin agendar</option>
                {ESTADOS_FORMACION.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
              </select>
            </Field>
            <Field label="Fecha"><input type="date" aria-label="Fecha de la formación" value={d.formacion_fecha} onChange={(e) => pon('formacion_fecha')(e.target.value)} className="field text-base text-ink appearance-none block min-w-full" /></Field>
            <Field label="Hora">
              <select aria-label="Hora de la formación" value={d.formacion_hora} onChange={(e) => pon('formacion_hora')(e.target.value)} className="field text-base text-ink">
                <option value="">Sin hora</option>
                {[...new Set([...HORAS, ...(d.formacion_hora ? [d.formacion_hora] : [])])].sort().map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Información relevante" hint="Notas internas. La farmacia no las ve."><Textarea rows={3} value={d.formacion_nota} onChange={pon('formacion_nota')} /></Field>
        </Section>

        {error && <Notice tone="danger">{error}</Notice>}
        <div><Button type="submit" variant="primary" size="lg" disabled={guardando} className="h-11 px-6">{guardando ? 'Guardando…' : 'Guardar'}</Button></div>
      </form>
    </Screen>
  )
}
