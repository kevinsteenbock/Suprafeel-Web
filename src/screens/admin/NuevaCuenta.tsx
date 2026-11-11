import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Eye, EyeOff, Copy, Check, ChevronDown, X } from 'lucide-react'
import { Screen, FooterBar } from '@/app/Shell'
import { useStore } from '@/app/store'
import { EMAIL_RE, type Role } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { comercialesDe, iniciales, TODOS_LOS_COMERCIALES } from '@/data/pharmacies'
import { Toolbar, PageHeader, Notice } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Avatar } from '@/ui/Avatar'
import { cn } from '@/lib/cn'
import { accesosPorComercial, accesosPorFarmacia, norm, plural, zonaPorComercial, zonasConocidas } from './accesos'

export function Steps({ title, steps }: { title: string; steps: { t: string; d: string }[] }) {
  return (
    <div className="rounded-xl bg-surface border border-line shadow-card p-5 flex flex-col gap-4">
      <span className="text-base font-semibold text-ink">{title}</span>
      {steps.map((s, i) => (
        <div key={s.t} className="flex gap-3">
          <span className="h-5 w-5 rounded-full bg-accent-wash text-accent-deep text-xs font-bold inline-flex items-center justify-center shrink-0">{i + 1}</span>
          <div className="flex flex-col"><span className="text-base font-medium text-ink">{s.t}</span><span className="text-sm text-muted leading-4 mt-[2px]">{s.d}</span></div>
        </div>
      ))}
    </div>
  )
}

const ROLES: { key: Role; label: string; d: string }[] = [
  { key: 'farmacia', label: 'Farmacia', d: 'Ve su farmacia, el catálogo, el recomendador y la formación.' },
  { key: 'comercial', label: 'Comercial', d: 'Ve las farmacias que lleva, su ruta y todo lo de la farmacia.' },
  { key: 'admin', label: 'Administrador', d: 'Entra en toda la consola, cuentas y accesos incluidos.' },
]

const MIN = 10

/** Contraseña aleatoria de 16 caracteres sin los que se confunden (0/O, 1/l/I). */
function generarContrasena(largo = 16): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const r = crypto.getRandomValues(new Uint32Array(largo))
  return Array.from(r, (x) => abc[x % abc.length]).join('')
}

/** Etiqueta unida a su campo, con la ayuda o el error debajo (también unidos por aria-describedby). */
function Campo({ id, label, required, hint, error, right, children }: { id: string; label: ReactNode; required?: boolean; hint?: ReactNode; error?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[5px] min-w-0">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="label">{label}{required && <span className="text-accent"> *</span>}</label>
        {right}
      </div>
      {children}
      {error ? <span id={`${id}-nota`} className="text-xs text-danger">{error}</span> : hint ? <span id={`${id}-nota`} className="text-xs text-faint">{hint}</span> : null}
    </div>
  )
}

const borde = (error?: string) => (error ? { borderColor: 'var(--color-danger)' } : undefined)

interface Opcion { key: string; title: string; meta: string; buscar: string; badge?: string }
const NUEVA = '\u0000nueva'

/** Selector con buscador (combobox): escribe para filtrar, flechas y Enter para elegir. */
function Buscador({ id, opciones, value, onChange, placeholder, error, describedBy, vacio, crear }: {
  id: string; opciones: Opcion[]; value: string; onChange: (key: string) => void; placeholder: string; error?: string; describedBy?: string; vacio: string
  /** Si se pasa, lo escrito que no coincide con ninguna opción se puede elegir como nuevo. */
  crear?: { etiqueta: (texto: string) => string; meta: string; onCrear: (texto: string) => void }
}) {
  const elegida = opciones.find((o) => o.key === value)
  const [q, setQ] = useState(elegida?.title ?? '')
  const [open, setOpen] = useState(false)
  const [activa, setActiva] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const listaId = `${id}-lista`

  // Si la elección cambia desde fuera (?farmacia=…), el texto la sigue.
  useEffect(() => { setQ(elegida?.title ?? '') }, [elegida?.key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) { setOpen(false); setQ(elegida?.title ?? '') } }
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [open, elegida])

  const nq = norm(q.trim())
  const todas = !nq || (elegida && q === elegida.title) ? opciones : opciones.filter((o) => o.buscar.includes(nq))
  const exacta = opciones.some((o) => norm(o.title) === nq)
  const nueva: Opcion | null = crear && nq && !(elegida && q === elegida.title) && !exacta ? { key: NUEVA, title: crear.etiqueta(q.trim()), meta: crear.meta, buscar: '' } : null
  const vistas = [...todas.slice(0, 60), ...(nueva ? [nueva] : [])]
  const elegir = (o: Opcion) => {
    if (o.key === NUEVA) { crear?.onCrear(q.trim()); setOpen(false); return }
    onChange(o.key); setQ(o.title); setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <div className={cn('field gap-2', open && 'is-focus')} style={borde(error)}>
        {elegida && q === elegida.title && <Avatar initials={iniciales(elegida.title.replace(/^farmacia\s+/i, '')) || '··'} size={20} tone="soft" />}
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-activedescendant={open && vistas[activa] ? `${id}-op-${activa}` : undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent text-base text-ink"
          placeholder={placeholder}
          value={q}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActiva(0); if (value) onChange('') }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActiva((a) => Math.min(a + 1, vistas.length - 1)) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActiva((a) => Math.max(a - 1, 0)) }
            else if (e.key === 'Enter' && open && vistas[activa]) { e.preventDefault(); elegir(vistas[activa]!) }
            else if (e.key === 'Escape') { setOpen(false); setQ(elegida?.title ?? '') }
          }}
        />
        {q && <button type="button" aria-label="Borrar" onClick={() => { setQ(''); onChange(''); setOpen(true); document.getElementById(id)?.focus() }} className="h-4 w-4 rounded-full bg-chrome-deep inline-flex items-center justify-center text-ink-soft shrink-0"><X size={9} strokeWidth={2.6} /></button>}
        <ChevronDown size={13} className={cn('text-muted shrink-0 transition-transform', open && 'rotate-180')} />
      </div>
      {open && (
        <ul id={listaId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 rounded-lg bg-surface border border-line shadow-pop py-1.5 max-h-[300px] overflow-y-auto">
          {vistas.length === 0 && <li className="px-3 py-2 text-base text-muted">{vacio}</li>}
          {vistas.map((o, i) => (
            <li
              key={o.key}
              id={`${id}-op-${i}`}
              role="option"
              aria-selected={o.key === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => elegir(o)}
              onMouseEnter={() => setActiva(i)}
              className={cn('min-h-[44px] px-3 py-1.5 flex items-center gap-2.5 cursor-pointer', i === activa && 'bg-chrome')}
            >
              <span className="w-4 shrink-0 flex justify-center">{o.key === value && <Check size={13} strokeWidth={2.5} className="text-accent" />}</span>
              <span className="flex-1 min-w-0 flex flex-col"><span className="text-base text-ink truncate">{o.title}</span><span className="text-xs text-faint truncate">{o.meta}</span></span>
              {o.badge && <Badge tone="ok">{o.badge}</Badge>}
            </li>
          ))}
          {todas.length > 60 && <li className="px-3 pt-1.5 text-xs text-faint">Hay {todas.length - 60} más: escribe para afinar.</li>}
        </ul>
      )}
    </div>
  )
}

export function NuevaCuenta() {
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const { notify } = useStore()
  const { farmacias, usuarios, crearUsuario } = useDatos()
  const uid = useId()
  const ids = { rol: `${uid}-rol`, zona: `${uid}-zona`, name: `${uid}-nombre`, email: `${uid}-correo`, password: `${uid}-clave`, farmacia: `${uid}-farmacia`, rep: `${uid}-comercial` }

  const reps = useMemo(() => comercialesDe(farmacias), [farmacias])
  const porFarmacia = useMemo(() => accesosPorFarmacia(usuarios), [usuarios])
  const porComercial = useMemo(() => accesosPorComercial(usuarios), [usuarios])

  // ?farmacia=slug (desde «Dar acceso») · ?rol=comercial&comercial=Nombre (desde Comerciales)
  const slugInicial = farmacias.some((p) => p.id === sp.get('farmacia')) ? sp.get('farmacia')! : ''
  // Un comercial puede no llevar farmacias todavía (los nuevos del Excel): se acepta el nombre tal cual.
  const repInicial = (sp.get('comercial') ?? '').trim().slice(0, 60)
  const [extra, setExtra] = useState<string[]>(() => (repInicial && !reps.some((r) => r.rep === repInicial) ? [repInicial] : []))
  const rolInicial: Role = slugInicial ? 'farmacia' : repInicial || sp.get('rol') === 'comercial' ? 'comercial' : sp.get('rol') === 'admin' ? 'admin' : 'farmacia'

  const [rol, setRol] = useState<Role>(rolInicial)
  const [name, setName] = useState(() => farmacias.find((p) => p.id === slugInicial)?.owner ?? '')
  const [email, setEmail] = useState(() => { const e = (sp.get('email') ?? '').trim().toLowerCase().slice(0, 120); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : '' })
  const [password, setPassword] = useState('')
  const [ver, setVer] = useState(false)
  const [copiada, setCopiada] = useState(false)
  const [slug, setSlug] = useState(slugInicial)
  const [rep, setRep] = useState(repInicial)
  // Zona del comercial: la del enlace (?zona=, desde Subir Excel) o la que ya tiene; se puede cambiar.
  const zonaDe = useMemo(() => zonaPorComercial(farmacias, usuarios), [farmacias, usuarios])
  const zonas = useMemo(() => zonasConocidas(farmacias, usuarios), [farmacias, usuarios])
  const [zona, setZona] = useState(() => (sp.get('zona') ?? '').trim().slice(0, 60) || zonaDe.get(repInicial) || '')
  const elegirRep = (k: string) => { setRep(k); if (k) { setTocado((t) => ({ ...t, rep: true })); if (!zona && zonaDe.get(k)) setZona(zonaDe.get(k)!) } }
  const [intentado, setIntentado] = useState(false)
  const [tocado, setTocado] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [fallo, setFallo] = useState('')

  const farmacia = farmacias.find((p) => p.id === slug)
  const correo = email.trim().toLowerCase()
  const errores: Record<'name' | 'email' | 'password' | 'farmacia' | 'rep', string> = {
    name: !name.trim() ? 'Escribe el nombre de la persona que va a entrar.' : '',
    email: !correo
      ? 'Escribe su correo: es con lo que entrará.'
      : !EMAIL_RE.test(correo)
        ? 'Escribe un correo válido, por ejemplo nombre@farmacia.es.'
        : usuarios.some((u) => u.email.toLowerCase() === correo)
          ? 'Ya hay una cuenta con este correo.'
          : '',
    password: !password
      ? 'Escribe una contraseña o genera una.'
      : password.length < MIN
        ? `Tiene que tener al menos ${MIN} caracteres (le faltan ${MIN - password.length}).`
        : '',
    farmacia: rol === 'farmacia' && !farmacia ? 'Elige la farmacia de la cuenta.' : '',
    rep: rol === 'comercial' && !rep ? 'Elige qué comercial es.' : '',
  }
  const err = (k: keyof typeof errores) => (intentado || tocado[k] ? errores[k] || undefined : undefined)
  const tocar = (k: string) => () => setTocado((t) => ({ ...t, [k]: true }))
  const pendientes = (Object.keys(errores) as (keyof typeof errores)[]).filter((k) => errores[k])
  const dirty = !!(email || password || (name && name !== farmacia?.owner))

  const opcionesFarmacia: Opcion[] = useMemo(
    () => farmacias
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
      .map((p) => ({
        key: p.id,
        title: p.name,
        meta: [p.nombreComercial, p.city, p.rep || 'sin comercial'].filter(Boolean).join(' · '),
        buscar: norm([p.name, p.nombreComercial, p.city, p.owner, p.rep, p.codigoCliente, p.postal].filter(Boolean).join(' ')),
        badge: porFarmacia.has(p.id) ? 'Con acceso' : undefined,
      })),
    [farmacias, porFarmacia],
  )
  const opcionesRep: Opcion[] = useMemo(
    () => reps
      .slice()
      .sort((a, b) => a.rep.localeCompare(b.rep, 'es'))
      .map((r) => ({
        key: r.rep,
        title: r.rep,
        meta: [r.zona, plural(r.farmacias, 'farmacia', 'farmacias')].filter(Boolean).join(' · '),
        buscar: norm([r.rep, r.zona].join(' ')),
        badge: porComercial.has(r.rep) ? 'Ya tiene cuenta' : undefined,
      }))
      // Los que aún no llevan farmacias: con cuenta ya creada o recién escritos aquí.
      .concat([...new Set([...porComercial.keys(), ...extra])].filter((x) => x !== TODOS_LOS_COMERCIALES && !reps.some((r) => r.rep === x)).sort((a, b) => a.localeCompare(b, 'es')).map((x) => ({
        key: x, title: x, meta: 'Sin farmacias todavía', buscar: norm(x), badge: porComercial.has(x) ? 'Ya tiene cuenta' : undefined,
      })))
      .concat({ key: TODOS_LOS_COMERCIALES, title: 'Todos los comerciales', meta: `Ve las ${plural(farmacias.length, 'farmacia', 'farmacias')}, por ejemplo el distribuidor`, buscar: norm('todos los comerciales distribuidor todas'), badge: undefined }),
    [reps, porComercial, extra, farmacias.length],
  )

  const elegirFarmacia = (k: string) => {
    setSlug(k)
    if (!k) return
    setTocado((t) => ({ ...t, farmacia: true }))
    // Si aún no hay nombre, propone el del titular (se puede cambiar).
    const p = farmacias.find((x) => x.id === k)
    if (p?.owner && !name.trim()) setName(p.owner)
  }

  const generar = () => {
    setPassword(generarContrasena())
    setVer(true)
    setCopiada(false)
    setTocado((t) => ({ ...t, password: true }))
  }
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopiada(true)
      window.setTimeout(() => setCopiada(false), 1800)
    } catch {
      notify('No se ha podido copiar: selecciónala y cópiala a mano')
    }
  }

  const crear = async () => {
    setIntentado(true)
    setFallo('')
    const primero = pendientes[0]
    if (primero) {
      document.getElementById(ids[primero])?.focus()
      return
    }
    setBusy(true)
    try {
      const u = await crearUsuario({
        name: name.trim(),
        email: correo,
        password,
        role: rol,
        pharmacy_slug: rol === 'farmacia' ? slug : undefined,
        rep_name: rol === 'comercial' ? rep : undefined,
        zona: rol === 'comercial' ? zona.trim() : undefined,
      })
      notify(`Cuenta creada · ${u.email} ya puede entrar`)
      navigate(rol === 'farmacia' ? `/admin/cuentas/${slug}` : rol === 'comercial' ? '/admin/comerciales' : '/admin/cuentas?ver=cuentas')
    } catch (e) {
      setFallo(e instanceof Error && e.message ? e.message : 'No hemos podido crear la cuenta. Inténtalo de nuevo en un momento.')
      setBusy(false)
    }
  }

  const rolActual = ROLES.find((r) => r.key === rol)!
  const accesosFarmacia = farmacia ? porFarmacia.get(farmacia.id) ?? [] : []
  const accesosRep = rep ? porComercial.get(rep) ?? [] : []

  return (
    <Screen
      toolbar={
        <Toolbar
          back="/admin/cuentas"
          crumbs={[{ label: 'Cuentas y accesos', to: '/admin/cuentas' }, { label: 'Dar de alta una cuenta' }]}
          right={dirty ? <span className="text-sm text-muted flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Sin guardar</span> : undefined}
        />
      }
      footer={
        <FooterBar
          title={intentado && pendientes.length ? (pendientes.length === 1 ? 'Falta un dato por completar' : `Faltan ${pendientes.length} datos por completar`) : 'La cuenta queda activa al crearla'}
          subtitle={intentado && pendientes.length ? 'Lo tienes marcado en rojo en el formulario' : 'Podrá entrar con este correo y esta contraseña'}
        >
          <Button size="lg" onClick={() => navigate('/admin/cuentas')}>Cancelar</Button>
          <Button type="submit" form="nueva-cuenta" variant="primary" size="lg" disabled={busy}>{busy ? 'Creando…' : 'Crear la cuenta'}</Button>
        </FooterBar>
      }
    >
      <PageHeader title="Dar de alta una cuenta" subtitle="Crea el acceso de una farmacia, de un comercial o de otra persona de la consola." />
      <div className="flex flex-col lg:flex-row gap-6">
        <form
          id="nueva-cuenta"
          noValidate
          onSubmit={(e) => { e.preventDefault(); void crear() }}
          className="flex-1 min-w-0 rounded-xl bg-surface border border-line shadow-card p-4 sm:p-6 flex flex-col gap-5"
        >
          {fallo && <div role="alert"><Notice tone="danger" title="No se ha creado la cuenta">{fallo}</Notice></div>}

          <div className="flex flex-col gap-[5px]">
            <span id={ids.rol} className="label">Tipo de cuenta <span className="text-accent">*</span></span>
            <div role="radiogroup" aria-labelledby={ids.rol} className="h-[34px] rounded-md bg-surface border border-line p-[3px] flex max-w-[460px]">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  role="radio"
                  aria-checked={rol === r.key}
                  onClick={() => { setRol(r.key); setFallo('') }}
                  className={cn('flex-1 rounded-[6px] text-base font-medium px-2 sm:px-3', rol === r.key ? 'bg-accent text-on-accent' : 'text-ink-soft hover:bg-chrome')}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-faint">{rolActual.d}</span>
          </div>

          {rol === 'farmacia' && (
            <Campo id={ids.farmacia} label="Farmacia" required error={err('farmacia')} hint={farmacia ? (accesosFarmacia.length ? `Ya ${accesosFarmacia.length === 1 ? 'entra 1 persona' : `entran ${accesosFarmacia.length} personas`} de esta farmacia: esta será una más.` : 'Todavía no entra nadie de esta farmacia.') : `Busca entre las ${farmacias.length} farmacias por nombre, población o titular.`}>
              <Buscador id={ids.farmacia} opciones={opcionesFarmacia} value={slug} onChange={elegirFarmacia} placeholder="Busca la farmacia" error={err('farmacia')} describedBy={`${ids.farmacia}-nota`} vacio="Ninguna farmacia con ese nombre." />
            </Campo>
          )}
          {rol === 'comercial' && (
            <Campo id={ids.rep} label="Comercial" required error={err('rep')} hint={rep ? (accesosRep.length ? `${rep} ya tiene ${plural(accesosRep.length, 'cuenta', 'cuentas')}: esta será otra más.` : `Verá las farmacias que lleva ${rep}.`) : 'Elige uno de la lista o escribe el nombre de uno nuevo.'}>
              <Buscador id={ids.rep} opciones={opcionesRep} value={rep} onChange={elegirRep} placeholder="Elige o escribe el comercial" error={err('rep')} describedBy={`${ids.rep}-nota`} vacio="Ningún comercial con ese nombre."
                crear={{ etiqueta: (t) => `Comercial nuevo: «${t}»`, meta: 'Aún no lleva farmacias: se las asignas desde su ficha', onCrear: (t) => { setExtra((l) => (l.includes(t) ? l : [...l, t])); setRep(t); setTocado((x) => ({ ...x, rep: true })) } }} />
            </Campo>
          )}
          {rol === 'comercial' && (
            <Campo id={ids.zona} label="Zona" hint="De dónde es: Cataluña, País Vasco… Elige una o escribe una nueva.">
              <div className="field max-w-[460px]">
                <input id={ids.zona} list={`${ids.zona}-lista`} className="flex-1 min-w-0 bg-transparent text-base text-ink" value={zona} onChange={(e) => setZona(e.target.value)} autoComplete="off" placeholder="Zona del comercial" aria-describedby={`${ids.zona}-nota`} />
              </div>
              <datalist id={`${ids.zona}-lista`}>{zonas.map((z) => <option key={z} value={z} />)}</datalist>
            </Campo>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo id={ids.name} label="Nombre y apellidos" required error={err('name')}>
              <div className="field" style={borde(err('name'))}>
                <input id={ids.name} className="flex-1 min-w-0 bg-transparent text-base text-ink" value={name} onChange={(e) => setName(e.target.value)} onBlur={tocar('name')} autoComplete="off" aria-invalid={!!err('name') || undefined} aria-describedby={err('name') ? `${ids.name}-nota` : undefined} placeholder={rol === 'farmacia' ? 'Quien va a entrar desde la farmacia' : 'Nombre de la persona'} />
              </div>
            </Campo>
            <Campo id={ids.email} label="Correo" required error={err('email')} hint="Es con lo que entrará en la app.">
              <div className="field" style={borde(err('email'))}>
                <input id={ids.email} type="email" inputMode="email" className="flex-1 min-w-0 bg-transparent text-base text-ink" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={tocar('email')} autoComplete="off" aria-invalid={!!err('email') || undefined} aria-describedby={`${ids.email}-nota`} placeholder="nombre@farmacia.es" />
              </div>
            </Campo>
          </div>

          <Campo
            id={ids.password}
            label="Contraseña"
            required
            error={err('password')}
            hint={`Mínimo ${MIN} caracteres. No se envía por correo: pásasela tú por un canal seguro.`}
            right={<button type="button" onClick={generar} className="text-sm font-medium text-accent hover:text-accent-deep">Generar una aleatoria</button>}
          >
            <div className="field gap-2 max-w-[460px]" style={borde(err('password'))}>
              <input
                id={ids.password}
                type={ver ? 'text' : 'password'}
                className={cn('flex-1 min-w-0 bg-transparent text-base text-ink', ver ? 'font-mono' : 'tracking-[0.15em]')}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setCopiada(false) }}
                onBlur={tocar('password')}
                autoComplete="new-password"
                aria-invalid={!!err('password') || undefined}
                aria-describedby={`${ids.password}-nota`}
              />
              {password && (
                <button type="button" onClick={() => void copiar()} aria-label={copiada ? 'Contraseña copiada' : 'Copiar la contraseña'} className="max-lg:h-8 max-lg:w-8 max-lg:-mr-2 shrink-0 inline-flex items-center justify-center text-faint hover:text-ink">
                  {copiada ? <Check size={15} className="text-ok" /> : <Copy size={15} />}
                </button>
              )}
              <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar la contraseña' : 'Mostrar la contraseña'} aria-pressed={ver} className="max-lg:h-8 max-lg:w-8 max-lg:-mr-2 shrink-0 inline-flex items-center justify-center text-faint hover:text-ink">
                {ver ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Campo>
        </form>

        <aside className="w-full lg:w-[316px] lg:shrink-0 flex flex-col gap-4">
          <Steps
            title="Al crear la cuenta"
            steps={[
              { t: 'Queda activa al momento', d: 'Con el correo y la contraseña de aquí ya puede iniciar sesión.' },
              rol === 'farmacia'
                ? { t: 'Ve solo su farmacia', d: `${farmacia ? farmacia.name : 'La que elijas'}, con el catálogo, el recomendador y la formación.` }
                : rol === 'comercial'
                  ? rep === TODOS_LOS_COMERCIALES
                    ? { t: 'Ve todas las farmacias', d: `Las ${plural(farmacias.length, 'farmacia', 'farmacias')}, igual que un comercial: ruta, catálogo, formación y argumentarios.` }
                    : { t: 'Ve solo sus farmacias', d: rep ? (reps.find((r) => r.rep === rep)?.farmacias ? `Las ${plural(reps.find((r) => r.rep === rep)!.farmacias, 'farmacia', 'farmacias')} que lleva ${rep}, con su ruta y el catálogo.` : `${rep} aún no lleva farmacias: verá las que le asignes desde la ficha de cada una.`) : 'Las que lleva el comercial que elijas, con su ruta y el catálogo.' }
                  : { t: 'Ve toda la consola', d: 'Cuentas y accesos, comerciales, catálogo, cursos, materiales y chat.' },
              { t: 'Pásale el acceso tú', d: 'No enviamos ningún correo: dale el correo y la contraseña por un canal seguro.' },
            ]}
          />
          {farmacia && rol === 'farmacia' && (
            <div className="rounded-xl bg-chrome border border-line p-5 flex flex-col">
              <span className="label">Farmacia elegida</span>
              <span className="mt-2 text-base font-semibold text-ink">{farmacia.name}</span>
              <span className="text-sm text-muted">{[farmacia.nombreComercial, farmacia.city].filter(Boolean).join(' · ')}</span>
              <div className="mt-4 pt-4 border-t border-line flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-3"><span className="text-muted">Comercial</span><span className="font-medium text-ink text-right">{farmacia.rep || '—'}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted">Referencias</span><span className="font-medium text-ink">{farmacia.refs}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted">Ya entran</span><span className="font-medium text-ink">{accesosFarmacia.length ? plural(accesosFarmacia.length, 'persona', 'personas') : 'nadie'}</span></div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </Screen>
  )
}
