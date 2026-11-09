/**
 * Contenido para farmacias que llega de Xano solo con sesión (GET /contenido). Aquí están los tipos y
 * nada más: el repositorio es público y las presentaciones y el diagrama de Suprafeel son de uso interno.
 */

export interface Ficha {
  funcion: string
  subtitulo: string
  que_es: string
  para_quien: string[]
  presentacion: string
  duracion: string
  posologia: string
  funciones: string[]
  sellos: string[]
  como_actua: { t: string; d: string }[]
  /** Cabecera de cada toma de la tabla nutricional, p. ej. ['2 cápsulas', '3 cápsulas'] */
  tomas: string[]
  /** [ingrediente, cantidad, %VRN] y otro par por cada toma de más */
  filas: string[][]
  perfil: string[]
  argumentos: string[]
  advertencias: string[]
  extra?: { t: string; d: string } | null
  aviso?: string | null
}

/** Un documento del que solo se sabe que existe: sus enlaces se piden al abrirlo (GET /documentos/{slug}). */
export interface Documento {
  slug: string
  titulo: string
  tipo: string
  paginas: number
  /** Enlace firmado a la primera página, solo en los que se enseñan al entrar. */
  portada: string
}

export interface Campana {
  id: string
  titulo: string
  /** slug del documento con su cartel */
  imagen: string
  /** 'YYYY-MM-DD'; sin fechas si el cartel no las da */
  desde?: string
  hasta?: string
  oferta: string
  condiciones: string[]
}

/** Paso 1 del recomendador: una pantalla por grupo de preguntas; cada opción es una condición. */
export interface GrupoSeguridad { id: string; texto: string; ayuda?: string; unica?: boolean; opciones: { id: string; texto: string }[] }
/** Si se cumple alguna condición de `cuando`: «no» = no se recomienda; «consultar» = aviso en ámbar. */
export interface Regla { cuando: string[]; productos: string[]; nivel: 'no' | 'consultar'; texto: string }
export interface ResultadoProducto { tipo: 'producto'; producto: string; avisos?: string[] }
export interface ResultadoBase { tipo: 'base'; producto: string; texto: string }
/** Sigue en otro motivo de consulta. */
export interface Salto { tipo: 'salto'; motivo: string; nota: string }
export type Resultado = ResultadoProducto | ResultadoBase
export interface Motivo { id: string; titulo: string; gama: string; pregunta: string; opciones: { texto: string; resultado: Resultado | Salto }[] }

export interface DatosRecomendador {
  version: 2
  seguridad: GrupoSeguridad[]
  reglas: Regla[]
  basicos: { id: string; nombre: string; si: string; no: string }[]
  motivos: Motivo[]
  combinables: { productos: string[]; texto: string }[]
  incompatibles: { productos: string[]; texto: string }[]
  /** Quién no puede tomarlo, o debe consultar antes: también sale en la ficha. */
  quien_no: Record<string, string>
  tomas: Record<string, { toma: string; advertencia?: string }>
  /** Básicos que también llevan zinc: si sale el Zinc junto a ellos, hay que avisar. */
  basicos_con_zinc: string[]
  generales: string[]
}

export interface Contenido {
  fichas: Record<string, Ficha>
  recomendador: DatosRecomendador | null
  campanas: Campana[]
  documentos: Documento[]
}

export const CONTENIDO_VACIO: Contenido = { fichas: {}, recomendador: null, campanas: [], documentos: [] }

export const SLUG_CATALOGO = 'catalogo-suprafeel-2026'
export const SLUG_TRIPTICO = 'triptico-suprafeel-2026'
export const SLUG_BIOTINA_HAIR = 'biotina-vs-hair-forte'
export const SLUG_TARIFA = 'tarifa-suprafeel-2027'
export const SLUG_DIAGRAMA = 'diagrama-recomendacion'
/** La presentación de formación con todas las referencias juntas (sale arriba en Formación). */
export const SLUG_FORMACION_COMPLETA = 'formacion-completa'

/** Documentos para ver y descargar en «Documentos y material», en este orden. Sale solo el que esté subido. */
export const DOCUMENTOS: { slug: string; titulo: string; texto: string }[] = [
  { slug: SLUG_CATALOGO, titulo: 'Catálogo Suprafeel 2026', texto: 'El catálogo en PDF. También se puede pedir impreso.' },
  { slug: SLUG_TARIFA, titulo: 'Tarifa 2027 con códigos nacionales', texto: 'PVF, PVPR, EAN y C.N. de cada referencia.' },
  { slug: SLUG_DIAGRAMA, titulo: 'Diagrama de recomendación', texto: 'El diagrama en PDF. La versión interactiva está en Recomendador.' },
  { slug: SLUG_BIOTINA_HAIR, titulo: 'Dosier Biotina vs. Hair Forte', texto: 'Cuándo recomendar cada uno.' },
  { slug: SLUG_TRIPTICO, titulo: 'Tríptico-infografía Suprafeel 2026', texto: 'Toda la gama en una infografía.' },
]

export const documentoDe = (c: Contenido, slug: string) => c.documentos.find((d) => d.slug === slug)

/** Documentos de la ficha de un producto: su presentación y, en Biotina y Hair Forte, la comparativa. */
export function documentosDeFicha(c: Contenido, producto: string): Documento[] {
  const slugs = [producto, ...(producto === 'biotina' || producto === 'hair-forte' ? [SLUG_BIOTINA_HAIR] : [])]
  return slugs.map((s) => documentoDe(c, s)).filter((d): d is Documento => !!d)
}

export function normalizaContenido(raw: unknown): Contenido {
  const r = (raw ?? {}) as Partial<Contenido>
  return {
    fichas: r.fichas && typeof r.fichas === 'object' ? r.fichas : {},
    recomendador: r.recomendador && r.recomendador.version === 2 && Array.isArray(r.recomendador.motivos) ? r.recomendador : null,
    campanas: Array.isArray(r.campanas) ? r.campanas : [],
    documentos: Array.isArray(r.documentos) ? r.documentos : [],
  }
}
