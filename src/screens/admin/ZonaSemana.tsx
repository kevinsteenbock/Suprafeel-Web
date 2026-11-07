import { useEffect, useMemo, useState } from 'react'
import { Screen } from '@/app/Shell'
import { call, useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { useStore } from '@/app/store'
import { nombreProvincia, provinciaDe } from '@/data/pharmacies'
import { Notice, PageHeader, Section, Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Field, Input } from '@/ui/Field'
import { cn } from '@/lib/cn'

/** Zona de la semana y datos de contacto de la administradora. */
export function ZonaSemana() {
  const { token } = useAuth()
  const { farmacias } = useDatos()
  const { notify } = useStore()
  const [provincias, setProvincias] = useState<string[]>([])
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [enlace, setEnlace] = useState('')
  const [cargado, setCargado] = useState(false)
  const [fallo, setFallo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    call('/admin/ajustes', {}, token)
      .then(({ res, body }) => {
        if (!vigente) return
        if (!res.ok) return setFallo(true)
        setProvincias(Array.isArray(body?.provincias) ? body.provincias : [])
        setTelefono(body?.telefono ?? '')
        setCorreo(body?.correo_avisos ?? '')
        setEnlace(body?.enlace_calendario ?? '')
        setCargado(true)
      })
      .catch(() => vigente && setFallo(true))
    return () => { vigente = false }
  }, [token])

  /** Las provincias que existen en las farmacias, con cuántas tiene cada una. */
  const opciones = useMemo(() => {
    const cuenta = new Map<string, number>()
    for (const f of farmacias) {
      const k = provinciaDe(f)
      if (k) cuenta.set(k, (cuenta.get(k) ?? 0) + 1)
    }
    return [...cuenta.entries()].map(([k, n]) => ({ k, n, nombre: nombreProvincia(k) })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [farmacias])

  const cambiar = (k: string) => setProvincias((l) => (l.includes(k) ? l.filter((x) => x !== k) : [...l, k]))
  const abiertas = farmacias.filter((f) => provincias.includes(provinciaDe(f))).length

  const guardar = async () => {
    setGuardando(true)
    setError('')
    try {
      const zona_etiqueta = provincias.map(nombreProvincia).join(', ')
      const { res, body } = await call('/admin/ajustes', { method: 'PATCH', body: JSON.stringify({ telefono: telefono.trim(), correo_avisos: correo.trim(), enlace_calendario: enlace.trim(), zona_etiqueta, provincias }) }, token)
      if (!res.ok) throw new Error(body?.message || 'No se ha podido guardar.')
      notify('Guardado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido guardar.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Screen toolbar={<Toolbar title="Zona de la semana" />}>
      <PageHeader title="Zona de la semana" subtitle="Solo las farmacias de estas provincias pueden pedir fecha. Las demás ven un aviso y pueden escribir o llamar." />
      {fallo && <Notice tone="danger">No hemos podido cargar los ajustes. Revisa tu conexión y vuelve a entrar.</Notice>}
      {cargado && (
        <div className="w-full max-w-[640px] flex flex-col gap-6">
          <Section title="¿Dónde estás esta semana?" right={<span className="text-sm text-muted">{abiertas} {abiertas === 1 ? 'farmacia podrá' : 'farmacias podrán'} agendar</span>}>
            <div className="flex flex-wrap gap-2">
              {opciones.map((o) => (
                <button key={o.k} type="button" aria-pressed={provincias.includes(o.k)} onClick={() => cambiar(o.k)} className={cn('h-9 rounded-full px-3.5 text-sm font-medium', provincias.includes(o.k) ? 'bg-accent text-on-accent' : 'bg-chrome text-ink-soft hover:bg-chrome-deep')}>{o.nombre} · {o.n}</button>
              ))}
            </div>
          </Section>
          <Section title="Contacto">
            <Field label="Tu teléfono" hint="Lo ven las farmacias en «Mi comercial» y «Pedir formación»."><Input value={telefono} onChange={setTelefono} /></Field>
            <Field label="Correo para los avisos" hint="Adónde llegan los mensajes, cuando el correo esté activado."><Input value={correo} onChange={setCorreo} /></Field>
            <Field label="Enlace de reservas de Google Calendar" hint="Opcional. Solo se enseña a las farmacias de la zona."><Input value={enlace} placeholder="https://calendar.app.google/…" onChange={setEnlace} /></Field>
          </Section>
          {error && <Notice tone="danger">{error}</Notice>}
          <div><Button variant="primary" size="lg" disabled={guardando} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Guardar'}</Button></div>
        </div>
      )}
    </Screen>
  )
}
