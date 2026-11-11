import { useEffect, useId, useMemo, useState } from 'react'
import { useDatos, type Usuario } from '@/app/datos'
import { useStore } from '@/app/store'
import { repsDe, TODOS_LOS_COMERCIALES } from '@/data/pharmacies'
import { Drawer } from '@/ui/Drawer'
import { Button } from '@/ui/Button'
import { Notice } from '@/ui/Page'
import { cn } from '@/lib/cn'
import { nombresDeComerciales, plural, zonaPorComercial, zonasConocidas } from './accesos'

type Modo = 'uno' | 'varios' | 'todas'

const SIN_ZONA = 'Sin zona'

/**
 * Ficha de una cuenta de comercial, en una ventana: su nombre, su zona y qué farmacias ve. «Varios»
 * es para quien lleva un equipo (p. ej. Pau, de Carbó): ve las farmacias de los comerciales que se
 * marquen, sin ser administrador. Con varias cuentas (mismo comercial), una pestaña por cuenta.
 */
export function EditarComercial({ cuentas, open, onClose }: { cuentas: Usuario[]; open: boolean; onClose: () => void }) {
  const { farmacias, usuarios, editarUsuario } = useDatos()
  const { notify } = useStore()
  const uid = useId()
  const [activa, setActiva] = useState(cuentas[0]?.id ?? 0)
  const cuenta = cuentas.find((u) => u.id === activa) ?? cuentas[0]

  const [name, setName] = useState('')
  const [zona, setZona] = useState('')
  const [modo, setModo] = useState<Modo>('uno')
  const [uno, setUno] = useState('')
  const [varios, setVarios] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [fallo, setFallo] = useState('')

  // Al abrir (o cambiar de pestaña), el formulario parte de lo que tiene la cuenta.
  useEffect(() => {
    if (!open || !cuenta) return
    const reps = repsDe(cuenta.rep_name)
    setName(cuenta.name)
    setZona(cuenta.zona)
    setModo(cuenta.rep_name === TODOS_LOS_COMERCIALES ? 'todas' : reps.length > 1 ? 'varios' : 'uno')
    setUno(reps.length === 1 && reps[0] !== TODOS_LOS_COMERCIALES ? reps[0]! : '')
    setVarios(new Set(reps.filter((r) => r !== TODOS_LOS_COMERCIALES)))
    setFallo('')
    setBusy(false)
  }, [open, cuenta?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) setActiva(cuentas[0]?.id ?? 0) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const nombres = useMemo(() => nombresDeComerciales(farmacias, usuarios), [farmacias, usuarios])
  const zonaDe = useMemo(() => zonaPorComercial(farmacias, usuarios), [farmacias, usuarios])
  const zonas = useMemo(() => zonasConocidas(farmacias, usuarios), [farmacias, usuarios])
  const cuantas = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of farmacias) if (p.rep) m.set(p.rep, (m.get(p.rep) ?? 0) + 1)
    return m
  }, [farmacias])
  // Los comerciales agrupados por su zona, para marcar de golpe los de una zona.
  const grupos = useMemo(() => {
    const g = new Map<string, string[]>()
    const lista = [...new Set([...nombres, ...varios])]
    for (const r of lista) {
      const z = zonaDe.get(r) || SIN_ZONA
      g.set(z, [...(g.get(z) ?? []), r])
    }
    return [...g.entries()].sort((a, b) => (a[0] === SIN_ZONA ? 1 : b[0] === SIN_ZONA ? -1 : a[0].localeCompare(b[0], 'es')))
  }, [nombres, varios, zonaDe])

  if (!cuenta) return null

  const repName = modo === 'todas' ? TODOS_LOS_COMERCIALES : modo === 'uno' ? uno : [...varios].sort((a, b) => a.localeCompare(b, 'es')).join(',')
  const ve = modo === 'todas' ? farmacias.length : (modo === 'uno' ? [uno] : [...varios]).reduce((a, r) => a + (cuantas.get(r) ?? 0), 0)
  const error = name.trim().length < 2 ? 'Escribe el nombre de la cuenta.' : !repName ? (modo === 'varios' ? 'Marca al menos un comercial.' : 'Elige el comercial.') : ''
  const cambiado = name.trim() !== cuenta.name || zona.trim() !== cuenta.zona || repName !== cuenta.rep_name

  const alternar = (r: string) => setVarios((s) => { const n = new Set(s); if (n.has(r)) n.delete(r); else n.add(r); return n })
  const alternarZona = (reps: string[]) => setVarios((s) => {
    const n = new Set(s)
    const todos = reps.every((r) => n.has(r))
    for (const r of reps) if (todos) n.delete(r); else n.add(r)
    return n
  })

  const guardar = async () => {
    if (error) return setFallo(error)
    setBusy(true); setFallo('')
    try {
      await editarUsuario(cuenta.id, { name: name.trim(), rep_name: repName, zona: zona.trim() })
      notify('Cuenta guardada')
      onClose()
    } catch (e) {
      setFallo(e instanceof Error && e.message ? e.message : 'No hemos podido guardar la cuenta.')
      setBusy(false)
    }
  }

  const MODOS: { key: Modo; label: string }[] = [
    { key: 'uno', label: 'Un comercial' },
    { key: 'varios', label: 'Varios comerciales' },
    { key: 'todas', label: 'Todas' },
  ]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={cuentas.length > 1 ? `Cuentas de ${cuenta.rep_name}` : cuenta.name || cuenta.email}
      subtitle={cuentas.length > 1 ? `${cuentas.length} cuentas con el mismo comercial: se edita cada una por separado` : cuenta.email}
      tabs={cuentas.length > 1 ? cuentas.map((u) => ({ key: String(u.id), label: u.email })) : undefined}
      activeTab={String(cuenta.id)}
      onTab={(k) => setActiva(Number(k))}
      bodyClass="gap-5"
      footer={
        <>
          <span className="text-sm text-muted">{repName ? `Verá ${plural(ve, 'farmacia', 'farmacias')}` : 'Elige qué farmacias ve'}</span>
          <div className="flex items-center gap-2">
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" disabled={busy || !cambiado} onClick={() => void guardar()}>{busy ? 'Guardando…' : 'Guardar'}</Button>
          </div>
        </>
      }
    >
      {fallo && <div role="alert"><Notice tone="danger" title="No se ha guardado">{fallo}</Notice></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-[5px] min-w-0">
          <label htmlFor={`${uid}-nombre`} className="label">Nombre <span className="text-accent">*</span></label>
          <div className="field"><input id={`${uid}-nombre`} className="flex-1 min-w-0 bg-transparent text-base text-ink" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" /></div>
        </div>
        <div className="flex flex-col gap-[5px] min-w-0">
          <label htmlFor={`${uid}-zona`} className="label">Zona</label>
          <div className="field"><input id={`${uid}-zona`} list={`${uid}-zonas`} className="flex-1 min-w-0 bg-transparent text-base text-ink" value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Cataluña, País Vasco…" autoComplete="off" /></div>
          <datalist id={`${uid}-zonas`}>{zonas.map((z) => <option key={z} value={z} />)}</datalist>
          <span className="text-xs text-faint">Elige una o escribe una nueva.</span>
        </div>
      </div>

      <div className="flex flex-col gap-[5px]">
        <span id={`${uid}-ve`} className="label">Qué farmacias ve <span className="text-accent">*</span></span>
        <div role="radiogroup" aria-labelledby={`${uid}-ve`} className="h-[34px] rounded-md bg-surface border border-line p-[3px] flex">
          {MODOS.map((m) => (
            <button key={m.key} type="button" role="radio" aria-checked={modo === m.key} onClick={() => { setModo(m.key); setFallo('') }}
              className={cn('flex-1 rounded-[6px] text-base font-medium px-2', modo === m.key ? 'bg-accent text-on-accent' : 'text-ink-soft hover:bg-chrome')}>
              {m.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-faint">
          {modo === 'uno' ? 'Ve las farmacias de ese comercial, como cualquier comercial.' : modo === 'varios' ? 'Para quien lleva un equipo: ve las farmacias de los comerciales que marques y todo lo que ven ellos. No es administrador.' : `Ve las ${plural(farmacias.length, 'farmacia', 'farmacias')}, de todos los comerciales. No es administrador.`}
        </span>
      </div>

      {modo === 'uno' && (
        <div className="field">
          <select aria-label="Comercial" className="flex-1 min-w-0 bg-transparent text-base text-ink" value={uno} onChange={(e) => setUno(e.target.value)}>
            <option value="">Elige el comercial</option>
            {[...new Set([...nombres, ...(uno ? [uno] : [])])].map((r) => <option key={r} value={r}>{r}{zonaDe.get(r) ? ` · ${zonaDe.get(r)}` : ''} · {plural(cuantas.get(r) ?? 0, 'farmacia', 'farmacias')}</option>)}
          </select>
        </div>
      )}

      {modo === 'varios' && (
        <div className="rounded-xl bg-surface border border-line overflow-hidden">
          {grupos.map(([z, reps], gi) => {
            const todos = reps.every((r) => varios.has(r))
            const alguno = reps.some((r) => varios.has(r))
            return (
              <div key={z} className={cn(gi > 0 && 'border-t border-line')}>
                <label className="min-h-[40px] px-4 py-2 bg-chrome flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={todos} ref={(el) => { if (el) el.indeterminate = alguno && !todos }} onChange={() => alternarZona(reps)} className="h-4 w-4 accent-[var(--color-accent)]" />
                  <span className="flex-1 text-base font-semibold text-ink">{z}</span>
                  <span className="text-sm text-muted">{z === SIN_ZONA ? '' : 'Toda la zona'}</span>
                </label>
                {reps.map((r) => (
                  <label key={r} className="min-h-[40px] px-4 py-2 border-t border-line-soft flex items-center gap-3 cursor-pointer hover:bg-canvas">
                    <input type="checkbox" checked={varios.has(r)} onChange={() => alternar(r)} className="h-4 w-4 accent-[var(--color-accent)]" />
                    <span className="flex-1 min-w-0 text-base text-ink truncate">{r}</span>
                    <span className="text-sm text-muted">{cuantas.get(r) ? plural(cuantas.get(r)!, 'farmacia', 'farmacias') : 'Sin farmacias todavía'}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </Drawer>
  )
}
