/**
 * Farmacias de Suprafeel: el tipo y las cuentas que se hacen con ellas.
 *
 * Aquí NO hay filas: el repositorio es público. Las farmacias las sirve Xano (GET /farmacias) solo a
 * quien ha iniciado sesión y ya filtradas por rol (admin, todas; comercial, las suyas; farmacia, la
 * suya). Las carga src/app/datos.tsx al entrar y las reparte con useDatos().farmacias.
 *
 * El array `pharmacies` sigue exportado para el código antiguo que lo importa: datos.tsx lo vacía y lo
 * rellena con lo que llega de Xano. Lo nuevo debería leer useDatos().farmacias y pasar la lista a los
 * helpers de este archivo, que son puros.
 */

export type Formacion = 'hecha' | 'prevista' | 'reprogramada' | 'pendiente' | 'cancelada' | 'rechazada'

export interface Pharmacy {
  /** Slug de Xano (único) */
  id: string
  /** Iniciales para el avatar */
  code: string
  name: string
  /** Nombre con el que la conoce la gente, si no es la razón social */
  nombreComercial?: string
  city: string
  /** Titular. Vacío cuando la razón social es una sociedad (C.B., S.L.) */
  owner: string
  address: string
  postal: string
  /** Comercial que la lleva (el mismo texto que rep_name en los usuarios de Xano) */
  rep: string
  zona?: string
  /** Cuántas referencias Suprafeel tiene en el lineal */
  refs: number
  /** Qué referencias, por id de producto */
  lineal: string[]
  /** Formación en el mostrador, solo si consta en el seguimiento */
  formacion?: Formacion
  /** 'YYYY-MM-DD' */
  formacionFecha?: string
  /** 'HH:MM' */
  formacionHora?: string
  /** La fecha para leer: «20 oct». Calculada a partir de formacionFecha. */
  formacionDate?: string
  formacionNote?: string
  telefono?: string
  codigoCliente?: string
  /** Quién le sirve. No llega a las cuentas de farmacia. */
  distribuidor?: string
  // --- Todavía sin origen real: llegarán de Xano. Si faltan, la pantalla no los enseña. ---
  lastVisit?: string
  nextVisit?: string
  consultations?: number
  visitsYear?: number
  since?: string
  team?: { initials: string; name: string; role: string; pct: number }[]
  activity?: { title: string; meta: string; date: string; tone?: 'accent' | 'ok' | 'neutral' }[]
  notes?: string
  notesMeta?: string
}

/** Fila tal como la devuelve Xano en GET /farmacias */
export interface FilaFarmacia {
  id: number
  slug: string
  code?: string | null
  name: string
  nombre_comercial?: string | null
  city?: string | null
  owner?: string | null
  address?: string | null
  postal?: string | null
  rep?: string | null
  zona?: string | null
  refs?: number | null
  lineal?: string[] | null
  formacion?: '' | Formacion | null
  formacion_fecha?: string | null
  formacion_hora?: string | null
  formacion_nota?: string | null
  telefono?: string | null
  codigo_cliente?: string | null
  distribuidor?: string | null
}

/**
 * Las farmacias que ha servido Xano a la sesión actual. Lo mantiene src/app/datos.tsx;
 * vacío hasta que entra alguien y otra vez vacío al cerrar sesión.
 */
export const pharmacies: Pharmacy[] = []

const FORMACIONES: Formacion[] = ['hecha', 'prevista', 'reprogramada', 'pendiente', 'cancelada', 'rechazada']

/** Los estados que puede fijar administración, con su nombre en el seguimiento. */
export const ESTADOS_FORMACION: { key: Formacion; label: string }[] = [
  { key: 'prevista', label: 'Programada' },
  { key: 'reprogramada', label: 'Reprogramada' },
  { key: 'hecha', label: 'Hecha' },
  { key: 'pendiente', label: 'No hecha (pendiente)' },
  { key: 'cancelada', label: 'Cancelada' },
  { key: 'rechazada', label: 'No quieren formación' },
]

/** Tiene fecha por delante o la tuvo: programada o reprogramada. */
export const esProgramada = (f?: Formacion) => f === 'prevista' || f === 'reprogramada'
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const opcional = (v: unknown) => texto(v) || undefined

/** La fecha de hoy (o de `d`) en hora local, como 'YYYY-MM-DD'. */
export function hoyISO(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** '2026-10-20' → '20 oct'. Sin pasar por Date, para que la zona horaria no mueva el día. */
export function fechaCorta(iso?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  if (!m) return ''
  const mes = MESES[Number(m[2]) - 1]
  return mes ? `${Number(m[3])} ${mes}` : ''
}

/** Provincia de una farmacia para la zona de la semana: dos primeras cifras del código postal o, sin él, su zona. */
export function provinciaDe(p: Pick<Pharmacy, 'postal' | 'zona'>): string {
  return p.postal.trim() ? p.postal.trim().slice(0, 2) : (p.zona ?? '').trim()
}

const NOMBRES_PROVINCIA: Record<string, string> = { '07': 'Baleares', '08': 'Barcelona', '17': 'Girona', '25': 'Lleida', '43': 'Tarragona', AD: 'Andorra' }
export const nombreProvincia = (k: string) => NOMBRES_PROVINCIA[k] ?? (k || 'Sin zona')

/** Iniciales para un avatar: «Jordi P.» → «JP», «Alex» → «A». */
export function iniciales(nombre: string): string {
  return nombre
    .split(/[\s·\-]+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

/** Convierte una fila de Xano al tipo que usan las pantallas. */
export function farmaciaDeFila(f: FilaFarmacia): Pharmacy {
  const name = texto(f.name)
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(texto(f.formacion_fecha)) ? texto(f.formacion_fecha) : undefined
  const hora = /^\d{1,2}:\d{2}$/.test(texto(f.formacion_hora)) ? texto(f.formacion_hora).padStart(5, '0') : undefined
  const formacion = FORMACIONES.includes(f.formacion as Formacion) ? (f.formacion as Formacion) : undefined
  return {
    id: texto(f.slug) || String(f.id),
    code: texto(f.code) || iniciales(name.replace(/^farmacia\s+/i, '')),
    name,
    nombreComercial: opcional(f.nombre_comercial),
    city: texto(f.city),
    owner: texto(f.owner),
    address: texto(f.address),
    postal: texto(f.postal),
    rep: texto(f.rep),
    zona: opcional(f.zona),
    refs: Number(f.refs) || 0,
    lineal: Array.isArray(f.lineal) ? f.lineal.filter((x): x is string => typeof x === 'string') : [],
    formacion,
    formacionFecha: fecha,
    formacionHora: hora,
    formacionDate: fecha ? fechaCorta(fecha) : undefined,
    formacionNote: opcional(f.formacion_nota),
    telefono: opcional(f.telefono),
    codigoCliente: opcional(f.codigo_cliente),
    distribuidor: opcional(f.distribuidor),
  }
}

/** Busca por slug. Sin lista, mira en las farmacias cargadas de la sesión. */
export const pharmacyById = (id?: string, list: Pharmacy[] = pharmacies) => list.find((p) => p.id === id)

/** Texto corto del estado de formación, para chapas y celdas. */
export function formacionLabel(f?: Formacion): string {
  switch (f) {
    case 'hecha': return 'Hecha'
    case 'prevista': return 'Programada'
    case 'reprogramada': return 'Reprogramada'
    case 'pendiente': return 'Pendiente'
    case 'cancelada': return 'Cancelada'
    case 'rechazada': return 'No quieren'
    default: return 'Sin agendar'
  }
}

/**
 * Formación prevista cuya fecha ya ha pasado sin que nadie la cierre (ni hecha ni cambiada).
 * `hoy` en 'YYYY-MM-DD' (por defecto, hoy en hora local).
 */
export function formacionVencida(p: Pick<Pharmacy, 'formacion' | 'formacionFecha'>, hoy: string = hoyISO()): boolean {
  return esProgramada(p.formacion) && !!p.formacionFecha && p.formacionFecha < hoy
}

/** Las que tienen la formación prevista con la fecha ya pasada, de la más antigua a la más reciente. */
export function formacionesVencidas(farmacias: Pharmacy[], hoy: string = hoyISO()): Pharmacy[] {
  return farmacias
    .filter((p) => formacionVencida(p, hoy))
    .sort((a, b) => (a.formacionFecha ?? '').localeCompare(b.formacionFecha ?? '') || a.name.localeCompare(b.name, 'es'))
}

/** La chapa de formación de una farmacia: como formacionLabel, pero una prevista ya pasada dice «Sin cerrar». */
export function formacionChapa(p: Pick<Pharmacy, 'formacion' | 'formacionFecha'>, hoy: string = hoyISO()): { label: string; tone: 'ok' | 'warn' | 'neutral' | 'danger' } {
  if (formacionVencida(p, hoy)) return { label: 'Sin cerrar', tone: 'warn' }
  return { label: formacionLabel(p.formacion), tone: formacionTone(p.formacion) }
}

/** El nombre con el que se enseña la farmacia: el comercial si lo tiene; si no, la razón social. */
export function nombreDe(p: Pick<Pharmacy, 'name' | 'nombreComercial'>): string {
  return p.nombreComercial?.trim() || p.name
}

/** Tono de la chapa (Badge) para cada estado de formación. */
export function formacionTone(f?: Formacion): 'ok' | 'warn' | 'neutral' | 'danger' {
  switch (f) {
    case 'hecha': return 'ok'
    case 'prevista':
    case 'reprogramada': return 'warn'
    case 'rechazada': return 'danger'
    default: return 'neutral'
  }
}

export function filterPharmacies(key: string, list: Pharmacy[] = pharmacies) {
  switch (key) {
    case 'top': return list.filter((p) => p.refs >= 10)
    case 'low': return list.filter((p) => p.refs > 0 && p.refs <= 2)
    case 'trained': return list.filter((p) => p.formacion === 'hecha')
    case 'pending': return list.filter((p) => p.formacion === 'prevista')
    case 'to-train': return list.filter((p) => p.formacion === 'pendiente')
    case 'declined': return list.filter((p) => p.formacion === 'rechazada')
    default: return list
  }
}

const filters = [
  { key: 'all', label: 'Todas' },
  { key: 'top', label: 'Más de 10 referencias' },
  { key: 'low', label: 'Una o dos referencias' },
  { key: 'trained', label: 'Formación hecha' },
  { key: 'pending', label: 'Formación prevista' },
  { key: 'to-train', label: 'Formación pendiente' },
  { key: 'declined', label: 'No quieren formación' },
]

/** Filtros con su cuenta; los que no tienen ninguna farmacia detrás no se enseñan. */
export function pharmacyFiltersWithCounts(list: Pharmacy[] = pharmacies) {
  return filters
    .map((f) => ({ ...f, count: filterPharmacies(f.key, list).length }))
    .filter((f) => f.key === 'all' || f.count > 0)
}

/**
 * Formaciones previstas de hoy en adelante, de la más cercana a la más lejana (y por hora dentro
 * del mismo día). Las previstas sin fecha no entran: no se pueden poner en la agenda.
 */
export function proximasFormaciones(farmacias: Pharmacy[], hoy: Date | string = new Date()): Pharmacy[] {
  const desde = typeof hoy === 'string' ? hoy : hoyISO(hoy)
  const clave = (p: Pharmacy) => `${p.formacionFecha} ${p.formacionHora ?? '99:99'}`
  return farmacias
    .filter((p) => esProgramada(p.formacion) && !!p.formacionFecha && p.formacionFecha >= desde)
    .sort((a, b) => clave(a).localeCompare(clave(b)) || a.name.localeCompare(b.name, 'es'))
}

export interface ResumenComercial {
  rep: string
  /** La zona más repetida entre sus farmacias ('' si ninguna la trae) */
  zona: string
  /** Cuántas farmacias lleva */
  farmacias: number
  /** Referencias Suprafeel sumadas en todos sus lineales */
  refs: number
  hechas: number
  previstas: number
  pendientes: number
  rechazadas: number
}

/** Un resumen por comercial, contado sobre la lista que se le pase. De más farmacias a menos. */
export function comercialesDe(farmacias: Pharmacy[]): ResumenComercial[] {
  const porRep = new Map<string, Pharmacy[]>()
  for (const p of farmacias) {
    if (!p.rep) continue
    porRep.set(p.rep, [...(porRep.get(p.rep) ?? []), p])
  }
  return [...porRep.entries()]
    .map(([rep, lista]) => {
      const zonas = new Map<string, number>()
      for (const p of lista) if (p.zona) zonas.set(p.zona, (zonas.get(p.zona) ?? 0) + 1)
      const zona = [...zonas.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
      const cuenta = (f: Formacion) => lista.filter((p) => p.formacion === f).length
      return {
        rep,
        zona,
        farmacias: lista.length,
        refs: lista.reduce((a, p) => a + p.refs, 0),
        hechas: cuenta('hecha'),
        previstas: cuenta('prevista'),
        pendientes: cuenta('pendiente'),
        rechazadas: cuenta('rechazada'),
      }
    })
    .sort((a, b) => b.farmacias - a.farmacias || a.rep.localeCompare(b.rep, 'es'))
}

/** Resultados al buscar una farmacia para darla de alta: la propia lista. */
export function registroDe(farmacias: Pharmacy[]) {
  return farmacias.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    meta: [p.address, [p.postal, p.city].filter(Boolean).join(' ')].filter(Boolean).join(' · '),
    client: p.refs > 0,
  }))
}
