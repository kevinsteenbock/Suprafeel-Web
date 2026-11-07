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

export interface Combinable { cuando: string; productos: string[] }
export interface ResultadoProducto { tipo: 'producto'; producto: string; combinable?: Combinable; avisos?: string[] }
export interface ResultadoBase { tipo: 'base'; producto: string; texto: string }
/** La flecha discontinua del diagrama: sigue en otra rama. */
export interface Salto { tipo: 'salto'; rama: string; nota: string }
export interface Pregunta { tipo: 'pregunta'; texto: string; aviso?: string; si: Salida; no: Salida }
export type Resultado = ResultadoProducto | ResultadoBase
export type Salida = Pregunta | Resultado | Salto
export interface Rama { id: string; titulo: string; gama: string; inicio: Pregunta }

export interface DatosRecomendador {
  tomas: Record<string, { toma: string; advertencia?: string }>
  basicos: { id: string; nombre: string; si: string; no: string }[]
  ramas: Rama[]
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
    recomendador: r.recomendador && Array.isArray(r.recomendador.ramas) ? r.recomendador : null,
    campanas: Array.isArray(r.campanas) ? r.campanas : [],
    documentos: Array.isArray(r.documentos) ? r.documentos : [],
  }
}
