#!/usr/bin/env node
/**
 * Eval del «Consejo por síntomas» de Suprafeel Soft.
 *
 * Manda cada caso de casos.json UNA vez, en serie y con pausa, a la API de Claude con exactamente el
 * cuerpo que enviará Xano (prompt.md como system + schema.json como formato de salida), guarda las
 * respuestas en eval-out/ (ignorado por git), las puntúa con reglas sencillas y suma el coste en USD.
 *
 *   ANTHROPIC_API_KEY=… node xano/consejo/eval.mjs                 todos los casos
 *   ANTHROPIC_API_KEY=… node xano/consejo/eval.mjs --solo=resaca,nino-7-anos
 *   Opciones: --pausa=3000 (ms entre llamadas) · --fecha=2026-10-31 · --reintentos=2
 *
 * Cuesta dinero: unas 20 llamadas a claude-opus-5-5. La clave solo se lee del entorno y nunca se imprime.
 *
 * Contrato de conversación (el mismo que tiene que seguir el endpoint de Xano):
 * - El system es el texto exacto de prompt.md con el que EMPEZÓ la consulta (cada consulta guarda su
 *   versión: los 12 primeros caracteres del sha256 del texto). No cambia a mitad de conversación.
 * - El primer mensaje del usuario lleva dos bloques de texto: la línea «[Contexto del sistema] rol: … ·
 *   fecha: AAAA-MM-DD» y, después, lo que ha escrito la persona. Los siguientes, un bloque con su texto.
 * - El historial solo crece. Cada turno de assistant se reenvía con el array `content` COMPLETO tal como
 *   lo devolvió la API (bloques thinking con su signature, text y fallback incluidos). Única excepción,
 *   documentada por la API: si una respuesta trae un bloque `fallback`, los bloques thinking,
 *   redacted_thinking y tool_use que vayan ANTES del último `fallback` no se reenvían (en respuestas sin
 *   streaming no los hay, así que en la práctica no se quita nada).
 * - Se lee `stop_reason` antes que `content`: «refusal» y «max_tokens» no traen un JSON válido.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))

export const URL_API = 'https://api.anthropic.com/v1/messages'
export const MODELO = 'claude-opus-5-5' // fijado por Kevin: no cambiar a otro
export const CABECERAS = {
  'content-type': 'application/json',
  'anthropic-version': '2026-10-21',
  'anthropic-beta': 'server-side-fallback-2026-07-01',
}

/** Textos de referencia cuando no hay JSON (los que ve la persona salen de Xano: xano/xs/api/consejo_post.xs). */
export const MENSAJES = {
  sinClave: 'El consejo con IA aún no está activado: falta la clave de Claude en Xano.',
  rechazo: 'Claude no ha podido responder a esta consulta. Prueba a escribir el caso de otra forma, solo con los datos que hacen falta; si vuelve a pasar, consúltalo con la central en info@suprafeel.es.',
  cortada: 'La respuesta se ha cortado antes de terminar. Vuelve a intentarlo; si se repite, escribe el caso más corto.',
  error: 'No se ha podido consultar a Claude ahora mismo. Inténtalo de nuevo en unos minutos.',
}

/** Precio en USD por millón de tokens. El fallback puede servir la respuesta con otro modelo. */
const PRECIOS = {
  'claude-opus-5-5': { entrada: 4, salida: 20, cacheEscritura: 5, cacheLectura: 0.2 },
  'claude-opus-5': { entrada: 5, salida: 25, cacheEscritura: 6.25, cacheLectura: 0.5 },
  'claude-opus-4-8': { entrada: 5, salida: 25, cacheEscritura: 6.25, cacheLectura: 0.5 },
}

/** Zinc (mg) y vitamina D (µg) por dosis diaria, de src/data/products.ts, para vigilar las sumas. */
const NUTRIENTES = {
  'colageno-1': { zinc: 6.2, vitD: 50 },
  multivitaminico: { zinc: 5 },
  'immune-defense': { zinc: 20, vitD: 5 },
  zinc: { zinc: 15 },
  'maca-negra': { zinc: 15 },
  biotina: { zinc: 4.65, vitD: 50 },
  'hair-forte': { zinc: 6.5, vitD: 5 },
  'brain-support': { zinc: 10, vitD: 10 },
  'vitamina-d3-k2': { vitD: 50 },
}
const MAX_ZINC = 25 // mg/día, nivel máximo tolerable EFSA (adultos)
const MAX_VIT_D = 100 // µg/día, nivel máximo tolerable EFSA (adultos)

// ---------------------------------------------------------------------------------------------------
// Construcción de la petición

export function cargar(dir = DIR) {
  const prompt = readFileSync(join(dir, 'prompt.md'), 'utf8')
  const schema = JSON.parse(readFileSync(join(dir, 'schema.json'), 'utf8'))
  const casos = JSON.parse(readFileSync(join(dir, 'casos.json'), 'utf8'))
  return { prompt, schema, casos }
}

export const versionPrompt = (prompt) => createHash('sha256').update(prompt, 'utf8').digest('hex').slice(0, 12)

export const lineaContexto = ({ rol, fecha }) => `[Contexto del sistema] rol: ${rol} · fecha: ${fecha}`

export function mensajeUsuario(texto, contexto) {
  const content = []
  if (contexto) content.push({ type: 'text', text: lineaContexto(contexto) })
  content.push({ type: 'text', text: texto })
  return { role: 'user', content }
}

/** El cuerpo exacto que se manda (y que mandará Xano). Sin thinking ni temperature: dan 400 en este modelo. */
export function construirCuerpo(prompt, schema, messages) {
  return {
    model: MODELO,
    max_tokens: 16000,
    fallbacks: 'default',
    system: [{ type: 'text', text: prompt, cache_control: { type: 'ephemeral' } }],
    messages,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema } },
  }
}

/** El turno de assistant que se reenvía: el content tal cual, salvo la excepción documentada del fallback. */
export function turnoAssistant(content) {
  const ultimoFallback = content.map((b) => b.type).lastIndexOf('fallback')
  const sobra = new Set(['thinking', 'redacted_thinking', 'tool_use'])
  return { role: 'assistant', content: content.filter((b, i) => !(i < ultimoFallback && sobra.has(b.type))) }
}

// ---------------------------------------------------------------------------------------------------
// Lectura de la respuesta

/** Lee stop_reason antes que content. Devuelve { estado, json?, mensaje? }. */
export function leerRespuesta(resp) {
  if (resp.stop_reason === 'refusal') {
    return { estado: 'rechazo', categoria: resp.stop_details?.category ?? null, mensaje: MENSAJES.rechazo }
  }
  if (resp.stop_reason === 'max_tokens') return { estado: 'cortada', mensaje: MENSAJES.cortada }
  if (resp.stop_reason !== 'end_turn') return { estado: 'otro', detalle: `stop_reason ${resp.stop_reason}`, mensaje: MENSAJES.error }
  const texto = (resp.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('')
  try {
    return { estado: 'ok', json: JSON.parse(texto) }
  } catch {
    return { estado: 'json_invalido', detalle: texto.slice(0, 300), mensaje: MENSAJES.error }
  }
}

/** Qué modelo sirvió la respuesta y si hubo fallback. */
export function servidoPor(resp) {
  const its = resp.usage?.iterations ?? []
  return { modelo: resp.model, fallback: its.some((it) => it.type === 'fallback_message') || (resp.content ?? []).some((b) => b.type === 'fallback') }
}

/** Coste en USD. Con fallback, usage.iterations trae cada intento; si no, vale el usage de arriba. */
export function coste(resp) {
  const u = resp.usage ?? {}
  const partes = Array.isArray(u.iterations) && u.iterations.length ? u.iterations : [{ ...u, model: resp.model }]
  const tokens = { entrada: 0, salida: 0, cacheEscritura: 0, cacheLectura: 0 }
  let usd = 0
  let estimado = false
  for (const it of partes) {
    const modelo = it.model ?? (it.type === 'fallback_message' ? resp.model : MODELO)
    const p = PRECIOS[modelo] ?? (estimado = true, PRECIOS[MODELO])
    const t = {
      entrada: it.input_tokens ?? 0,
      salida: it.output_tokens ?? 0,
      cacheEscritura: it.cache_creation_input_tokens ?? 0,
      cacheLectura: it.cache_read_input_tokens ?? 0,
    }
    for (const k of Object.keys(tokens)) tokens[k] += t[k]
    usd += (t.entrada * p.entrada + t.salida * p.salida + t.cacheEscritura * p.cacheEscritura + t.cacheLectura * p.cacheLectura) / 1e6
  }
  return { usd, tokens, estimado }
}

// ---------------------------------------------------------------------------------------------------
// Puntuación

/** Minúsculas y sin tildes, para que las regex de casos.json no dependan de la ortografía. */
export const normaliza = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Solo el texto que ve la persona (sin nombres de campo ni valores de enum). */
export function textoVisible(r) {
  const partes = [r.respuesta, r.derivar?.a_quien, r.derivar?.motivo]
  for (const e of r.entendido ?? []) partes.push(e.etiqueta)
  for (const p of r.productos ?? []) partes.push(p.por_que, p.pauta, ...(p.chapas ?? []).map((c) => c.texto))
  for (const a of r.antes_de_recomendar ?? []) partes.push(a.titulo, a.detalle)
  for (const q of r.preguntas ?? []) partes.push(q.pregunta, ...(q.opciones ?? []))
  return normaliza(partes.filter(Boolean).join('\n'))
}

/** Comprobaciones que valen para cualquier respuesta. */
export function comprobacionesGenerales(r) {
  const res = []
  const ok = (nombre, cond, detalle = '') => res.push({ nombre, ok: Boolean(cond), detalle })
  const prods = r.productos ?? []
  const ids = prods.map((p) => p.id)
  ok('como mucho 3 productos', prods.length <= 3, `${prods.length}`)
  ok('sin productos repetidos', new Set(ids).size === ids.length, ids.join(', '))
  ok('ordenados por encaje', prods.every((p, i) => i === 0 || prods[i - 1].encaje >= p.encaje), prods.map((p) => p.encaje).join(' ≥ '))
  ok('encaje entero entre 50 y 100', prods.every((p) => Number.isInteger(p.encaje) && p.encaje >= 50 && p.encaje <= 100), prods.map((p) => `${p.id} ${p.encaje}`).join(', '))
  ok('como mucho una primera opción', prods.filter((p) => p.papel === 'primera_opcion').length <= 1)
  ok('hasta 3 chapas por producto', prods.every((p) => (p.chapas ?? []).length <= 3))
  ok('hasta 4 avisos', (r.antes_de_recomendar ?? []).length <= 4)
  ok('hasta 3 preguntas', (r.preguntas ?? []).length <= 3)
  ok('fuera de tema ⇒ sin productos', !r.fuera_de_tema || prods.length === 0)
  const d = r.derivar ?? {}
  ok('derivar coherente', d.necesario ? d.urgencia !== 'no' && Boolean(d.motivo?.trim()) : d.urgencia === 'no', `${d.necesario} · ${d.urgencia}`)
  const suma = (k) => ids.reduce((s, id) => s + (NUTRIENTES[id]?.[k] ?? 0), 0)
  ok(`zinc sumado ≤ ${MAX_ZINC} mg`, suma('zinc') <= MAX_ZINC, `${suma('zinc')} mg`)
  ok(`vitamina D sumada ≤ ${MAX_VIT_D} µg`, suma('vitD') <= MAX_VIT_D, `${suma('vitD')} µg`)
  return res
}

/** Comprobaciones de un turno según casos.json. */
export function puntuar(r, debe = {}, noDebe = {}) {
  const res = []
  const ok = (nombre, cond, detalle = '') => res.push({ nombre, ok: Boolean(cond), detalle })
  const ids = (r.productos ?? []).map((p) => p.id)
  const texto = textoVisible(r)
  const lista = ids.join(', ') || 'ninguno'
  for (const id of debe.productos ?? []) ok(`recomienda ${id}`, ids.includes(id), lista)
  if (debe.alguno_de) ok(`recomienda alguno de ${debe.alguno_de.join('/')}`, debe.alguno_de.some((id) => ids.includes(id)), lista)
  if (debe.min_productos !== undefined) ok(`al menos ${debe.min_productos} productos`, ids.length >= debe.min_productos, `${ids.length}`)
  if (debe.max_productos !== undefined) ok(`como mucho ${debe.max_productos} productos`, ids.length <= debe.max_productos, lista)
  if (debe.derivar !== undefined) ok(`derivar = ${debe.derivar}`, r.derivar?.necesario === debe.derivar, `${r.derivar?.necesario} · ${r.derivar?.urgencia}`)
  if (debe.urgencia) ok(`urgencia ${debe.urgencia.join(' o ')}`, debe.urgencia.includes(r.derivar?.urgencia), r.derivar?.urgencia)
  if (debe.preguntas !== undefined) ok(debe.preguntas ? 'hace preguntas' : 'no hace preguntas', (r.preguntas ?? []).length > 0 === debe.preguntas, `${(r.preguntas ?? []).length}`)
  if (debe.fuera_de_tema !== undefined) ok(`fuera_de_tema = ${debe.fuera_de_tema}`, r.fuera_de_tema === debe.fuera_de_tema, `${r.fuera_de_tema}`)
  if (debe.datos_personales !== undefined) ok(`datos_personales = ${debe.datos_personales}`, r.datos_personales === debe.datos_personales, `${r.datos_personales}`)
  for (const re of debe.menciona ?? []) ok(`menciona /${re}/`, new RegExp(re).test(texto))
  for (const id of noDebe.productos ?? []) ok(`no recomienda ${id}`, !ids.includes(id), lista)
  for (const [a, b] of noDebe.juntos ?? []) ok(`no junta ${a} y ${b}`, !(ids.includes(a) && ids.includes(b)), lista)
  for (const re of noDebe.menciona ?? []) ok(`no menciona /${re}/`, !new RegExp(re).test(texto))
  for (const [id, max] of Object.entries(noDebe.encaje_mayor_que ?? {})) {
    const p = (r.productos ?? []).find((x) => x.id === id)
    ok(`${id} con encaje ≤ ${max}`, !p || p.encaje <= max, p ? `${p.encaje}` : 'no aparece')
  }
  return res
}

/** Palabras que no deberían salir (promesas de salud). No restan puntos: se listan para revisarlas a mano. */
const LENGUAJE = [
  /\bcura(r|n|ra|ran)?\b/, /\bprevien(e|en)\b/, /antiinflamatori/, /anticaida/,
  /\b(baja|bajar|reduce|reducir)\w* (el |los |su )?(colesterol|trigliceridos|tension)/,
  /\btrata(r)? (la |el )?(anemia|ansiedad|insomnio|depresion|artrosis|acne)/,
]
export const avisosLenguaje = (r) => LENGUAJE.filter((re) => re.test(textoVisible(r))).map((re) => re.source)

// ---------------------------------------------------------------------------------------------------
// Llamada a la API

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms))

async function llamar(cuerpo, clave, reintentos) {
  for (let intento = 0; ; intento++) {
    let http
    try {
      http = await fetch(URL_API, {
        method: 'POST',
        headers: { ...CABECERAS, 'x-api-key': clave },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(10 * 60 * 1000),
      })
    } catch (e) {
      if (intento < reintentos) { await espera(5000 * (intento + 1)); continue }
      return { ok: false, status: 0, error: `sin conexión: ${e.message}` }
    }
    const datos = await http.json().catch(() => null)
    if (http.ok) return { ok: true, status: http.status, datos }
    // 429, 5xx y 529 (sobrecarga): no se ha generado nada, así que reintentar no cuenta como mandar el caso dos veces.
    if ((http.status === 429 || http.status >= 500) && intento < reintentos) {
      const s = Number(http.headers.get('retry-after'))
      await espera(Number.isFinite(s) && s > 0 ? s * 1000 : 10000 * (intento + 1))
      continue
    }
    return { ok: false, status: http.status, error: datos?.error?.message ?? `HTTP ${http.status}` }
  }
}

// ---------------------------------------------------------------------------------------------------
// Ejecución

function opciones(argv) {
  const o = {}
  for (const a of argv) {
    const m = /^--([a-z]+)=(.*)$/.exec(a)
    if (m) o[m[1]] = m[2]
  }
  return {
    solo: o.solo ? o.solo.split(',').map((s) => s.trim()).filter(Boolean) : null,
    pausa: Number(o.pausa ?? 3000),
    reintentos: Number(o.reintentos ?? 2),
    fecha: o.fecha ?? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date()),
  }
}

async function main() {
  const op = opciones(process.argv.slice(2))
  const clave = process.env.ANTHROPIC_API_KEY
  if (!clave) {
    console.error('Falta ANTHROPIC_API_KEY en el entorno. No se ha enviado nada.')
    process.exit(1)
  }
  const { prompt, schema, casos } = cargar()
  const version = versionPrompt(prompt)
  const chars = [...prompt].length
  const lista = casos.casos.filter((c) => !op.solo || op.solo.includes(c.id))
  if (!lista.length) {
    console.error('Ningún caso coincide con --solo.')
    process.exit(1)
  }
  const sello = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const salida = join(DIR, 'eval-out', `${sello}-${version}`)
  mkdirSync(salida, { recursive: true })
  console.log(`Prompt ${version}: ${chars} caracteres (~${Math.round(chars / 3.5)} tokens) · ${lista.length} casos · fecha ${op.fecha}`)
  console.log(`Respuestas en ${salida}\n`)

  const resumen = { version, modelo: MODELO, fecha: op.fecha, casos: [], usd: 0, tokens: { entrada: 0, salida: 0, cacheEscritura: 0, cacheLectura: 0 } }
  let primeraLlamada = true
  for (const caso of lista) {
    const messages = []
    const filaCaso = { id: caso.id, titulo: caso.titulo, turnos: [], aprobado: true }
    for (const [n, turno] of caso.turnos.entries()) {
      if (!primeraLlamada) await espera(op.pausa)
      primeraLlamada = false
      messages.push(mensajeUsuario(turno.usuario, n === 0 ? { rol: caso.rol ?? 'farmacia', fecha: op.fecha } : null))
      const cuerpo = construirCuerpo(prompt, schema, messages)
      const t0 = Date.now()
      const r = await llamar(cuerpo, clave, op.reintentos)
      const segundos = Math.round((Date.now() - t0) / 100) / 10
      const fila = { turno: n + 1, segundos, http: r.status }
      const guardado = { caso: caso.id, turno: n + 1, version, peticion: { ...cuerpo, system: [{ ...cuerpo.system[0], text: `<prompt.md ${version}>` }] } }

      if (!r.ok) {
        Object.assign(fila, { estado: 'error_http', detalle: r.error, comprobaciones: [] })
        console.log(`✗ ${caso.id} · turno ${n + 1}: error ${r.status} ${r.error}`)
      } else {
        const resp = r.datos
        const c = coste(resp)
        resumen.usd += c.usd
        for (const k of Object.keys(c.tokens)) resumen.tokens[k] += c.tokens[k]
        const leido = leerRespuesta(resp)
        Object.assign(fila, { estado: leido.estado, usd: c.usd, tokens: c.tokens, servido: servidoPor(resp) })
        guardado.respuesta = resp
        if (leido.estado === 'ok') {
          const comps = [...comprobacionesGenerales(leido.json), ...puntuar(leido.json, turno.debe, turno.no_debe)]
          fila.comprobaciones = comps
          fila.lenguaje = avisosLenguaje(leido.json)
          messages.push(turnoAssistant(resp.content))
          const fallos = comps.filter((x) => !x.ok)
          const marca = fallos.length ? '✗' : '✓'
          console.log(`${marca} ${caso.id} · turno ${n + 1}: ${comps.length - fallos.length}/${comps.length} · ${(leido.json.productos ?? []).map((p) => `${p.id} ${p.encaje}`).join(', ') || 'sin productos'} · derivar ${leido.json.derivar?.urgencia} · $${c.usd.toFixed(4)} · ${segundos} s${fila.servido.fallback ? ` · servido por ${resp.model}` : ''}`)
          for (const f of fallos) console.log(`    falla: ${f.nombre}${f.detalle ? ` (${f.detalle})` : ''}`)
          if (fila.lenguaje.length) console.log(`    revisar lenguaje: ${fila.lenguaje.join(' · ')}`)
        } else {
          fila.comprobaciones = []
          fila.detalle = leido.detalle ?? leido.categoria ?? ''
          console.log(`✗ ${caso.id} · turno ${n + 1}: ${leido.estado}${fila.detalle ? ` (${fila.detalle})` : ''} · $${c.usd.toFixed(4)}`)
        }
      }
      fila.aprobado = fila.estado === 'ok' && fila.comprobaciones.every((x) => x.ok)
      filaCaso.aprobado &&= fila.aprobado
      filaCaso.turnos.push(fila)
      writeFileSync(join(salida, `${caso.id}.t${n + 1}.json`), JSON.stringify({ ...guardado, puntuacion: fila }, null, 2))
      if (fila.estado !== 'ok') break // sin turno de assistant válido la conversación no puede seguir
    }
    resumen.casos.push(filaCaso)
  }

  const comps = resumen.casos.flatMap((c) => c.turnos.flatMap((t) => t.comprobaciones))
  resumen.aprobados = resumen.casos.filter((c) => c.aprobado).length
  resumen.comprobaciones = { bien: comps.filter((x) => x.ok).length, total: comps.length }
  writeFileSync(join(salida, 'resumen.json'), JSON.stringify(resumen, null, 2))
  const t = resumen.tokens
  console.log(`\nCasos aprobados: ${resumen.aprobados}/${resumen.casos.length} · comprobaciones ${resumen.comprobaciones.bien}/${resumen.comprobaciones.total}`)
  console.log(`Tokens: entrada ${t.entrada} · salida ${t.salida} · caché escrita ${t.cacheEscritura} · caché leída ${t.cacheLectura}`)
  console.log(`Coste total: $${resumen.usd.toFixed(4)} USD`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`Error: ${e.message}`)
    process.exit(1)
  })
}
