/**
 * Cruza el Excel semanal de farmacias con las que ya hay en la plataforma y prepara los cambios para
 * que administración los revise antes de guardar. Acepta el Excel de Aura tal como lo lleva
 * («Farmacias ordenadas», «Carbó», «Canarias»…) y también la hoja «FORMACIÓN FARMACIAS»: las columnas
 * se reconocen por su título, no por su posición.
 *
 * Una farmacia que ya existe se reconoce por su nombre, o por código postal y número de la calle, y
 * nunca se duplica. De las que existen se tocan formación, referencias, teléfono (si no tenía),
 * distribuidor, información relevante y comercial (si todas sus filas del Excel dicen el mismo; si
 * no, solo avisa): nombre y dirección se cambian en su ficha.
 */
import type { Celda, Hoja } from './xlsx'
import { fechaCorta, iniciales, type Formacion, type Pharmacy } from '@/data/pharmacies'
import { products } from '@/data/products'

export interface DatosFormacion {
  formacion: '' | Formacion
  formacion_fecha: string
  formacion_hora: string
  formacion_nota: string
  refs: number
  lineal: string[]
  telefono: string
  distribuidor: string
}
export interface Cambio extends DatosFormacion { slug: string; /** Comercial nuevo, solo si cambia. */ rep?: string }
export interface Nueva extends DatosFormacion { slug: string; code: string; name: string; owner: string; address: string; postal: string; city: string; rep: string; zona: string }

export interface FilaCambio { slug: string; nombre: string; campos: { campo: string; antes: string; despues: string }[]; envio: Cambio }
export interface FilaNueva { nombre: string; detalle: string; envio: Nueva }
export interface FilaError { hoja: string; fila: number; nombre: string; motivo: string }
export interface Aviso { nombre: string; texto: string }

export interface Analisis {
  hojas: string[]
  filasLeidas: number
  cambios: FilaCambio[]
  nuevas: FilaNueva[]
  errores: FilaError[]
  avisos: Aviso[]
  iguales: number
  /** Comerciales que el Excel apunta en una fila suelta, sin farmacia (con su zona si la trae), y que aún no llevan farmacias. */
  comerciales: ComercialSuelto[]
  /** Hojas que no se han podido leer porque su fila de títulos no tiene «Farmacia» ni «Comercial». */
  hojasSinTitulos: string[]
}

export interface ComercialSuelto { nombre: string; zona: string }

/** Lo que la plataforma ya sabe de los comerciales que tienen cuenta: su nombre y la zona de su ficha. */
export interface ComercialConocido { rep: string; zona: string }

/** Sin tildes, en minúsculas y solo letras y números; arregla la «Ð» que deja el Excel en lugar de la «Ñ». */
export const plano = (s: unknown) =>
  String(s ?? '').replace(/Ð/g, 'Ñ').replace(/ð/g, 'ñ').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const capitaliza = (s: string) => s.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase()).replace(/\b(De|Del|La|Las|Los|Y|I|D')\b/g, (m) => m.toLowerCase())

/** «TORRELL SORIO, MONTSERRAT» → «torrell-sorio»; «FARMACIA CORET C.B.» → «coret-c-b». Igual que las que ya hay. */
export function slugDe(nombre: string): string {
  let n = String(nombre).replace(/Ð/g, 'Ñ')
  if (n.includes(',') && !/\bc\.?\s?b\.?\s*$/i.test(n.trim())) n = n.split(',')[0]!
  return plano(n).replace(/^(farmacia|fcia|farm)\s+/, '').replace(/\s+/g, '-').slice(0, 80)
}

/** Nombre a mostrar de una farmacia nueva y su titular, si el Excel lo trae como «APELLIDOS, NOMBRE». */
function nombreYTitular(nombre: string): { name: string; owner: string } {
  const n = String(nombre).replace(/Ð/g, 'Ñ').trim()
  const conComa = n.includes(',') && !/\bc\.?\s?b\.?\s*$/i.test(n)
  const [apellidos, propio] = conComa ? [n.split(',')[0]!.trim(), n.split(',').slice(1).join(',').trim()] : [n, '']
  const base = capitaliza(apellidos.replace(/^(farmacia|fcia\.?|farm\.?)\s+/i, ''))
  return { name: `Farmacia ${base}`, owner: propio ? `${capitaliza(propio)} ${base}` : '' }
}

const ESTADOS: [RegExp, Formacion][] = [
  [/^reprogramada/, 'reprogramada'],
  [/^programada|^prevista|^agendada/, 'prevista'],
  [/^hecha|^realizada|^completada/, 'hecha'],
  [/^no hecha|^pendiente|^por hacer/, 'pendiente'],
  [/^cancelada/, 'cancelada'],
  [/^no quiere|^rechazada|^no le interesa/, 'rechazada'],
]
/** Cuál pesa más cuando una farmacia sale varias veces: la formación hecha, después la programada… */
const RANGO: Record<string, number> = { hecha: 0, reprogramada: 1, prevista: 1, pendiente: 2, cancelada: 3, rechazada: 4, '': 5 }
function estadoDe(v: Celda): Formacion | '' | null {
  const p = plano(v)
  if (!p) return ''
  return ESTADOS.find(([re]) => re.test(p))?.[1] ?? null
}

const dos = (n: number) => String(n).padStart(2, '0')
/** Número de serie de Excel o texto «24/11», «24/11/2026», «2026-11-24» → 'YYYY-MM-DD'. null si no se entiende. */
export function fechaDe(v: Celda, año: number): string | null {
  if (v === null || v === '') return ''
  if (typeof v === 'number') {
    if (v < 30000 || v > 80000) return null
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000)
    return `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}`
  }
  const s = v.trim()
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s)
  if (m) return `${m[1]}-${dos(+m[2]!)}-${dos(+m[3]!)}`
  m = /^(\d{1,2})\s*[/.-]\s*(\d{1,2})(?:\s*[/.-]\s*(\d{2,4}))?$/.exec(s)
  if (m) {
    const dia = +m[1]!, mes = +m[2]!
    const a = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : año
    if (mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) return `${a}-${dos(mes)}-${dos(dia)}`
  }
  return null
}

/** Fracción de día de Excel o texto «16;00», «9.30», «11:00:00» → 'HH:MM'. null si no se entiende. */
export function horaDe(v: Celda): string | null {
  if (v === null || v === '') return ''
  if (typeof v === 'number') {
    const f = v % 1
    if (v >= 1 && f === 0) return null
    const min = Math.round(f * 24 * 60)
    return `${dos(Math.floor(min / 60) % 24)}:${dos(min % 60)}`
  }
  const m = /^(\d{1,2})\s*[^\d\s]{1,3}\s*(\d{2})\b/.exec(v.trim())
  if (m && +m[1]! < 24 && +m[2]! < 60) return `${dos(+m[1]!)}:${m[2]}`
  return null
}

/** «SUPRAFEEL OMEGA 3 EN TRIGLICERIDOS» → 'omega'. Lo que no es un producto (p. ej. «Tenerife») da null. */
const ALIAS: Record<string, string> = { 'omega 3 en trigliceridos': 'omega', 'omega 3': 'omega', colageno: 'colageno-1', 'ashwagandha ksm 66': 'ashwagandha', 'vitamina c': 'vitamin-c', 'vitamina d3 k2': 'vitamina-d3-k2', 'vitamina d3 k2 mk 7': 'vitamina-d3-k2' }
const PORNOMBRE = new Map<string, string>()
for (const p of products) {
  PORNOMBRE.set(plano(p.name.replace(/\(.*\)/, '')), p.id)
  PORNOMBRE.set(plano(p.id), p.id)
}
export function productoDe(v: Celda): string | null {
  const p = plano(v).replace(/^suprafeel\s+/, '')
  if (!p || p === plano(v)) return null
  return ALIAS[p] ?? PORNOMBRE.get(p) ?? null
}

type Campo = 'nombre' | 'titular' | 'comercial' | 'zona' | 'ciudad' | 'cp' | 'direccion' | 'telefono' | 'refs' | 'estado' | 'fecha' | 'hora' | 'distribuidor' | 'nota'
const TITULOS: [RegExp, Campo][] = [
  [/^(farmacia|farmacias|nombre|nombre (de la )?farmacia|razon social|cliente)$/, 'nombre'],
  [/^titular/, 'titular'],
  [/^comercial/, 'comercial'],
  [/^(zona|region|comunidad|comunidad autonoma|area)$/, 'zona'],
  [/^(poblacion|ciudad|localidad)$/, 'ciudad'],
  [/^(cp|c p|codigo postal)$/, 'cp'],
  [/^direccion/, 'direccion'],
  [/^(telefono|tel|tlf)/, 'telefono'],
  [/^(n|no|num|numero|n o)? ?(de )?referencias$/, 'refs'],
  [/^estado/, 'estado'],
  [/^(dia|fecha)/, 'fecha'],
  [/^hora/, 'hora'],
  [/^distribuidor/, 'distribuidor'],
  [/^(informacion relevante|info relevante|notas?|observaciones)/, 'nota'],
]

interface Leida { hoja: string; fila: number; v: Partial<Record<Campo, Celda>>; refsLista: Celda[] }

const esTitulo = (c: Celda, campo: Campo) => TITULOS.find(([re]) => re.test(plano(c)))?.[1] === campo

/** Lee las filas de farmacias. Las que solo traen un comercial (así apunta Aura a los que aún no llevan
 *  farmacias) van a `sueltos`; una hoja con «Comercial» y sin columna de farmacia es una lista de
 *  comerciales, y todas sus filas van a `sueltos`. Devuelve null si la hoja no tiene fila de títulos. */
function leerHoja(h: Hoja, sueltos: ComercialSuelto[]): Leida[] | null {
  // Los títulos pueden no estar en la primera fila (un título de hoja encima, filas en blanco…).
  let cab = h.filas.findIndex((f, i) => i < 15 && f.some((c) => esTitulo(c, 'nombre')))
  const soloComerciales = cab < 0
  if (soloComerciales) cab = h.filas.findIndex((f, i) => i < 15 && f.some((c) => esTitulo(c, 'comercial')))
  if (cab < 0) return null
  const cols = new Map<number, Campo>()
  const refsCols: number[] = []
  h.filas[cab]!.forEach((c, i) => {
    const p = plano(c)
    if (/^referencia \d+$/.test(p)) return refsCols.push(i)
    const campo = TITULOS.find(([re]) => re.test(p))?.[1]
    if (campo && ![...cols.values()].includes(campo)) cols.set(i, campo)
  })
  const salida: Leida[] = []
  const suelto = (v: Partial<Record<Campo, Celda>>) => sueltos.push({ nombre: String(v.comercial).trim(), zona: textoDe(v.zona ?? null) })
  h.filas.slice(cab + 1).forEach((f, i) => {
    const v: Partial<Record<Campo, Celda>> = {}
    cols.forEach((campo, col) => { v[campo] = f[col] ?? null })
    if (soloComerciales) {
      if (plano(v.comercial)) suelto(v)
      return
    }
    if (!plano(v.nombre)) {
      const resto = f.filter((c, col) => cols.get(col) !== 'comercial' && cols.get(col) !== 'zona' && plano(c) !== '')
      if (plano(v.comercial) && resto.length === 0) suelto(v)
      return
    }
    salida.push({ hoja: h.nombre, fila: cab + i + 2, v, refsLista: refsCols.map((c) => f[c] ?? null) })
  })
  return salida
}

const numeroCalle = (s: unknown) => /\d+/.exec(plano(s))?.[0] ?? ''
const cpDe = (v: Celda) => {
  const s = String(v ?? '').trim().replace(/\.0+$/, '')
  return /^\d{4,5}$/.test(s) ? s.padStart(5, '0') : s
}
const textoDe = (v: Celda) => (v === null ? '' : String(v).replace(/\.0+$/, '').trim())

/** Lo que dice el Excel de una farmacia, ya juntando las hojas en que sale. */
interface Junta { filas: Leida[]; existente?: Pharmacy; clave: string }

export function analizarExcel(hojas: Hoja[], farmacias: Pharmacy[], hoy: Date = new Date(), conocidos: ComercialConocido[] = []): Analisis {
  const año = hoy.getFullYear()
  const porSlug = new Map(farmacias.map((p) => [p.id, p]))
  const porCalle = new Map<string, Pharmacy[]>()
  for (const p of farmacias) {
    const k = `${p.postal}|${numeroCalle(p.address)}`
    porCalle.set(k, [...(porCalle.get(k) ?? []), p])
  }
  // Comercial del Excel («JORDI P», «GIJON») → el nombre que ya usa la plataforma («Jordi P.», «Dani Gijón»).
  // Los que tienen cuenta y aún ninguna farmacia (los nuevos) también cuentan: así «AMAIA» es «Amaia».
  const reps = [...new Set([...farmacias.map((p) => p.rep), ...conocidos.map((c) => c.rep)].filter((r) => r && r !== '*'))]
  const conFarmacias = new Set(farmacias.map((p) => p.rep).filter(Boolean))
  const repDe = (v: Celda): string | undefined => {
    const p = plano(v)
    if (!p) return undefined
    return reps.find((r) => plano(r) === p) ?? reps.find((r) => plano(r).split(' ').includes(p)) ?? reps.find((r) => plano(r).startsWith(p + ' '))
  }
  const zonaDe = (rep: string) => {
    const ficha = conocidos.find((c) => c.rep === rep && c.zona)?.zona
    if (ficha) return ficha
    const cuenta = new Map<string, number>()
    for (const p of farmacias) if (p.rep === rep && p.zona) cuenta.set(p.zona, (cuenta.get(p.zona) ?? 0) + 1)
    return [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  }
  const zonaPorCp = (cp: string) => /^(08|17|25|43|AD)/i.test(cp) ? 'Cataluña' : /^07/.test(cp) ? 'Baleares' : /^(35|38)/.test(cp) ? 'Canarias' : ''
  const buscar = (l: Leida): Pharmacy | undefined => {
    const s = porSlug.get(slugDe(String(l.v.nombre)))
    if (s) return s
    const calle = porCalle.get(`${cpDe(l.v.cp ?? null)}|${numeroCalle(l.v.direccion)}`)
    if (calle?.length === 1 && numeroCalle(l.v.direccion)) return calle[0]
    const palabras = plano(l.v.nombre).replace(/\b(farmacia|fcia|cb|c b)\b/g, ' ').split(' ').filter((w) => w.length > 2)
    if (palabras.length === 0) return undefined
    const cand = farmacias.filter((p) => { const t = plano(`${p.name} ${p.owner} ${p.nombreComercial ?? ''}`); return palabras.every((w) => t.includes(w)) })
    return cand.length === 1 ? cand[0] : undefined
  }

  const sueltos: ComercialSuelto[] = []
  const hojasSinTitulos: string[] = []
  const leidas = hojas.flatMap((h) => {
    const l = leerHoja(h, sueltos)
    // Las hojas vacías no cuentan como «sin títulos».
    if (l === null && h.filas.some((f) => f.some((c) => plano(c) !== ''))) hojasSinTitulos.push(h.nombre)
    return l ?? []
  })
  const juntas = new Map<string, Junta>()
  for (const l of leidas) {
    const existente = buscar(l)
    const clave = existente?.id ?? slugDe(String(l.v.nombre))
    const j = juntas.get(clave) ?? { filas: [], existente, clave }
    j.filas.push(l)
    juntas.set(clave, j)
  }

  const an: Analisis = { hojas: hojas.map((h) => h.nombre), filasLeidas: leidas.length, cambios: [], nuevas: [], errores: [], avisos: [], iguales: 0, comerciales: [], hojasSinTitulos }
  // Los que aparecen solos y no llevan ninguna farmacia en la plataforma ni en este Excel: se enseñan para
  // crearles la cuenta (o, si ya la tienen, para ver que están). Con el nombre que ya usa la plataforma.
  const enExcel = new Set(leidas.map((l) => plano(l.v.comercial)))
  const vistos = new Map<string, ComercialSuelto>()
  for (const s of sueltos) {
    const conocido = repDe(s.nombre)
    if ((conocido && conFarmacias.has(conocido)) || enExcel.has(plano(s.nombre))) continue
    const nombre = conocido ?? capitaliza(s.nombre)
    const previo = vistos.get(nombre)
    vistos.set(nombre, { nombre, zona: previo?.zona || s.zona })
  }
  an.comerciales = [...vistos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  for (const j of juntas.values()) {
    const nombreExcel = String(j.filas[0]!.v.nombre).replace(/Ð/g, 'Ñ').trim()
    const nombre = j.existente?.name ?? nombreYTitular(nombreExcel).name
    // De cada campo vale el último valor no vacío; el estado, el de la última hoja que lo trae.
    const ultimo = (c: Campo) => [...j.filas].reverse().map((f) => f.v[c]).find((x) => textoDe(x ?? null) !== '') ?? null
    // Una farmacia puede salir varias veces (dos sesiones, o una hecha y otra pendiente): vale la más
    // avanzada y, si empatan, la sesión más temprana.
    const conEstados = j.filas.filter((f) => 'estado' in f.v && textoDe(f.v.estado ?? null) !== '')
    // Hecha: la más reciente. Programada y demás: la primera que viene. Mismo día: la hora más temprana.
    const clave = (f: Leida) => {
      const e = estadoDe(f.v.estado ?? null)
      return { rango: e === null ? 9 : RANGO[e] ?? 8, hecha: e === 'hecha', fecha: fechaDe(f.v.fecha ?? null, año) || '', hora: horaDe(f.v.hora ?? null) || '99' }
    }
    const comparar = (x: Leida, y: Leida) => {
      const a = clave(x), b = clave(y)
      if (a.rango !== b.rango) return a.rango - b.rango
      if (a.fecha !== b.fecha) return !a.fecha ? 1 : !b.fecha ? -1 : a.hecha ? b.fecha.localeCompare(a.fecha) : a.fecha.localeCompare(b.fecha)
      return a.hora.localeCompare(b.hora)
    }
    const conEstado = [...conEstados].sort(comparar)[0]
    const error = (motivo: string) => an.errores.push({ hoja: (conEstado ?? j.filas[0]!).hoja, fila: (conEstado ?? j.filas[0]!).fila, nombre, motivo })

    const previo: DatosFormacion = {
      formacion: j.existente?.formacion ?? '',
      formacion_fecha: j.existente?.formacionFecha ?? '',
      formacion_hora: j.existente?.formacionHora ?? '',
      formacion_nota: j.existente?.formacionNote ?? '',
      refs: j.existente?.refs ?? 0,
      lineal: [...(j.existente?.lineal ?? [])].sort(),
      telefono: j.existente?.telefono ?? '',
      distribuidor: j.existente?.distribuidor ?? '',
    }
    const nuevo: DatosFormacion = { ...previo, lineal: [...previo.lineal] }

    let mal = false
    if (conEstados.length > 1 && new Set(conEstados.map((f) => `${textoDe(f.v.estado ?? null)}|${fechaDe(f.v.fecha ?? null, año)}|${horaDe(f.v.hora ?? null)}`)).size > 1) {
      an.avisos.push({ nombre, texto: `Sale ${conEstados.length} veces con datos distintos (${conEstados.map((f) => [textoDe(f.v.estado ?? null), fechaCorta(fechaDe(f.v.fecha ?? null, año) || ''), horaDe(f.v.hora ?? null) || textoDe(f.v.hora ?? null)].filter(Boolean).join(' ')).join(' · ')}): se toma la de «${textoDe(conEstado!.v.estado ?? null)}»${conEstado!.v.hora ? ` a las ${horaDe(conEstado!.v.hora) || textoDe(conEstado!.v.hora)}` : ''}.` })
    }
    if (conEstado) {
      const e = estadoDe(conEstado.v.estado ?? null)
      if (e === null) { error(`Estado «${textoDe(conEstado.v.estado ?? null)}» desconocido`); mal = true }
      else {
        nuevo.formacion = e
        const f = fechaDe(conEstado.v.fecha ?? null, año)
        const h = horaDe(conEstado.v.hora ?? null)
        if (f === null) an.avisos.push({ nombre, texto: `Fecha «${textoDe(conEstado.v.fecha ?? null)}» no entendida: se deja la que tenía.` })
        else if (f) nuevo.formacion_fecha = f
        else if (e === 'pendiente' || e === 'rechazada' || e === '') nuevo.formacion_fecha = ''
        if (h === null) an.avisos.push({ nombre, texto: `Hora «${textoDe(conEstado.v.hora ?? null)}» no entendida: se deja la que tenía.` })
        else if (h) nuevo.formacion_hora = h
        else if (!nuevo.formacion_fecha || e === 'pendiente' || e === 'rechazada') nuevo.formacion_hora = ''
      }
    }
    if (mal) continue

    const refs = Number(textoDe(ultimo('refs')))
    if (Number.isInteger(refs) && refs > 0) nuevo.refs = refs
    const lineal = [...new Set(j.filas.flatMap((f) => f.refsLista.map(productoDe)).filter((x): x is string => !!x))].sort()
    if (lineal.length > 0) nuevo.lineal = lineal
    const nota = textoDe(ultimo('nota'))
    if (nota) nuevo.formacion_nota = nota
    const dist = textoDe(ultimo('distribuidor'))
    if (dist) nuevo.distribuidor = dist
    const tel = textoDe(ultimo('telefono')).split('\n')[0]!.replace(/^[•\s]+/, '').trim()
    if (tel && !nuevo.telefono && /\d{6}/.test(tel.replace(/\s/g, ''))) nuevo.telefono = tel

    if (j.existente) {
      const campos: FilaCambio['campos'] = []
      // Comercial: si el Excel la apunta a otro (o a uno que la plataforma aún no conoce), se cambia.
      // Si sale en varias hojas con comerciales distintos, no se adivina: solo se avisa.
      const repsExcel = [...new Set(j.filas.map((f) => textoDe(f.v.comercial ?? null)).filter(Boolean).map((r) => repDe(r) ?? capitaliza(r)))]
      let repNuevo: string | undefined
      if (repsExcel.length > 1) {
        an.avisos.push({ nombre, texto: `En el Excel sale con comerciales distintos (${repsExcel.join(', ')}). No se cambia: déjalo con uno solo o cámbialo en su ficha.` })
      } else if (repsExcel.length === 1 && repsExcel[0] !== j.existente.rep) {
        repNuevo = repsExcel[0]!
        campos.push({ campo: 'Comercial', antes: j.existente.rep || '—', despues: repNuevo })
        if (!repDe(repNuevo)) an.avisos.push({ nombre, texto: `Comercial «${repNuevo}» nuevo en la plataforma.` })
      }
      const etiqueta: Record<keyof DatosFormacion, string> = { formacion: 'Formación', formacion_fecha: 'Fecha', formacion_hora: 'Hora', formacion_nota: 'Información relevante', refs: 'Nº de referencias', lineal: 'Referencias', telefono: 'Teléfono', distribuidor: 'Distribuidor' }
      for (const k of Object.keys(etiqueta) as (keyof DatosFormacion)[]) {
        const a = Array.isArray(previo[k]) ? (previo[k] as string[]).join(', ') : String(previo[k])
        const d = Array.isArray(nuevo[k]) ? (nuevo[k] as string[]).join(', ') : String(nuevo[k])
        if (a !== d) campos.push({ campo: etiqueta[k], antes: a, despues: d })
      }
      if (campos.length === 0) an.iguales++
      else an.cambios.push({ slug: j.existente.id, nombre, campos, envio: { slug: j.existente.id, ...nuevo, ...(repNuevo ? { rep: repNuevo } : {}) } })
    } else {
      const rep = repDe(ultimo('comercial')) ?? capitaliza(textoDe(ultimo('comercial')))
      if (!rep) { error('Falta el comercial'); continue }
      if (!repDe(ultimo('comercial'))) an.avisos.push({ nombre, texto: `Comercial «${rep}» nuevo en la plataforma.` })
      const { name, owner } = nombreYTitular(nombreExcel)
      const titular = textoDe(ultimo('titular'))
      const envio: Nueva = {
        ...nuevo, slug: j.clave, code: iniciales(name.replace(/^Farmacia\s+/, '')), name, owner: titular ? capitaliza(titular) : owner,
        address: textoDe(ultimo('direccion')), postal: cpDe(ultimo('cp')), city: capitaliza(textoDe(ultimo('ciudad'))), rep, zona: zonaDe(rep) || zonaPorCp(cpDe(ultimo('cp'))),
      }
      if (!/^[a-z0-9-]{2,80}$/.test(envio.slug)) { error('No se puede sacar un identificador del nombre'); continue }
      an.nuevas.push({ nombre: name, detalle: [envio.address, envio.city, rep].filter(Boolean).join(' · '), envio })
    }
  }
  an.cambios.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  an.nuevas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  return an
}
