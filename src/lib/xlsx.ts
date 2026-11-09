/**
 * Lector mínimo de .xlsx en el navegador, sin dependencias: un .xlsx es un zip con XML dentro.
 * Devuelve cada hoja como filas de celdas (texto o número), con los textos compartidos resueltos.
 * Las fechas y horas llegan como número de serie de Excel: convertirlas es cosa de quien lee la columna.
 */

export type Celda = string | number | null
export interface Hoja { nombre: string; filas: Celda[][] }

const u16 = (b: Uint8Array, i: number) => b[i]! | (b[i + 1]! << 8)
const u32 = (b: Uint8Array, i: number) => (u16(b, i) | (u16(b, i + 2) << 16)) >>> 0

/** Las entradas del zip: nombre → contenido ya descomprimido. */
async function unzip(datos: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const b = new Uint8Array(datos)
  let fin = -1
  for (let i = b.length - 22; i >= Math.max(0, b.length - 66000); i--) {
    if (u32(b, i) === 0x06054b50) { fin = i; break }
  }
  if (fin < 0) throw new Error('No es un archivo .xlsx')
  const total = u16(b, fin + 10)
  let p = u32(b, fin + 16)
  const salida = new Map<string, Uint8Array>()
  const dec = new TextDecoder()
  for (let n = 0; n < total; n++) {
    if (u32(b, p) !== 0x02014b50) throw new Error('El .xlsx está dañado')
    const metodo = u16(b, p + 10)
    const tam = u32(b, p + 20)
    const largoNombre = u16(b, p + 28)
    const largoExtra = u16(b, p + 30)
    const largoComent = u16(b, p + 32)
    const local = u32(b, p + 42)
    const nombre = dec.decode(b.subarray(p + 46, p + 46 + largoNombre))
    p += 46 + largoNombre + largoExtra + largoComent
    if (!/^(xl\/workbook\.xml|xl\/_rels\/workbook\.xml\.rels|xl\/sharedStrings\.xml|xl\/worksheets\/[^/]+\.xml)$/.test(nombre)) continue
    const inicio = local + 30 + u16(b, local + 26) + u16(b, local + 28)
    const crudo = b.slice(inicio, inicio + tam)
    if (metodo === 0) salida.set(nombre, crudo)
    else if (metodo === 8) {
      const flujo = new Blob([crudo]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      salida.set(nombre, new Uint8Array(await new Response(flujo).arrayBuffer()))
    }
  }
  return salida
}

const xml = (bytes?: Uint8Array) => new DOMParser().parseFromString(new TextDecoder().decode(bytes ?? new Uint8Array()), 'application/xml')
/** Por nombre local, para no depender de los prefijos de espacio de nombres. */
const hijos = (el: Element | Document, nombre: string) => Array.from(el.getElementsByTagNameNS('*', nombre))

/** «AB12» → columna 27 (empezando en 0). */
function columna(ref: string): number {
  let n = 0
  for (const c of ref.replace(/\d+$/, '')) n = n * 26 + (c.charCodeAt(0) - 64)
  return n - 1
}

export async function leerXlsx(datos: ArrayBuffer): Promise<Hoja[]> {
  const zip = await unzip(datos)
  const compartidos = hijos(xml(zip.get('xl/sharedStrings.xml')), 'si').map((si) => hijos(si, 't').map((t) => t.textContent ?? '').join(''))
  const rels = new Map(hijos(xml(zip.get('xl/_rels/workbook.xml.rels')), 'Relationship').map((r) => [r.getAttribute('Id'), r.getAttribute('Target') ?? '']))
  const hojas: Hoja[] = []
  for (const s of hijos(xml(zip.get('xl/workbook.xml')), 'sheet')) {
    const rid = s.getAttribute('r:id') ?? s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id')
    const destino = (rels.get(rid) ?? '').replace(/^\/?(xl\/)?/, '')
    const doc = zip.get(`xl/${destino}`)
    if (!doc) continue
    const filas: Celda[][] = []
    for (const row of hijos(xml(doc), 'row')) {
      const fila: Celda[] = []
      for (const c of hijos(row, 'c')) {
        const tipo = c.getAttribute('t')
        const v = hijos(c, 'v')[0]?.textContent ?? null
        let valor: Celda = null
        if (tipo === 's') valor = v === null ? null : compartidos[Number(v)] ?? null
        else if (tipo === 'inlineStr') valor = hijos(c, 't').map((t) => t.textContent ?? '').join('')
        else if (tipo === 'str' || tipo === 'e') valor = v
        else if (tipo === 'b') valor = v === '1' ? 'TRUE' : 'FALSE'
        else valor = v === null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : v
        fila[columna(c.getAttribute('r') ?? 'A')] = valor
      }
      filas[Number(row.getAttribute('r') ?? filas.length + 1) - 1] = Array.from(fila, (x) => x ?? null)
    }
    hojas.push({ nombre: s.getAttribute('name') ?? '', filas: Array.from(filas, (f) => f ?? []) })
  }
  return hojas
}
